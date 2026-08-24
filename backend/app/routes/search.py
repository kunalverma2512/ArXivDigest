from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
import cohere
import re
import asyncio
import functools
import time

from app.core.config import settings
from app.core.database import db_info
from app.models.paper import Paper

router = APIRouter()
co = cohere.Client(api_key=settings.COHERE_API_KEY)
COLLECTION_NAME = "arxiv_papers"

from datetime import datetime

class SearchResultPaper(BaseModel):
    arxiv_id: str
    title: str
    primary_category: str
    published_date: datetime
    ai_summary: str

class SearchResult(BaseModel):
    paper: SearchResultPaper
    score: float
    match_type: str  # "semantic" | "keyword" | "hybrid"

def _looks_like_keyword_query(q: str) -> bool:
    """
    Heuristic: if query is very short (≤3 words) OR contains digits (arxiv ID)
    OR contains special chars, treat it as a keyword/author search primarily.
    Semantic search handles long concept queries better.
    """
    words = q.strip().split()
    has_digits = any(c.isdigit() for c in q)
    is_short = len(words) <= 3
    return is_short or has_digits

async def _keyword_search(q: str, limit: int) -> List[dict]:
    """
    Search MongoDB using regex across title, authors, and abstract.
    Returns list of {paper, score} dicts.
    Author name searches, arxiv IDs and short queries land here.
    """
    # Build case-insensitive regex
    escaped = re.escape(q.strip())
    pattern = {"$regex": escaped, "$options": "i"}

    # Search across all text fields
    mongo_filter = {
        "embedded": True,
        "$or": [
            {"title": pattern},
            {"authors": pattern},          # authors is a List[str], $regex works on array elements
            {"abstract": pattern},
            {"primary_category": pattern},
            {"arxiv_id": pattern},
        ]
    }

    t0 = time.perf_counter()
    papers = (
        await Paper.find(mongo_filter)
        .sort("-published_date")
        .limit(limit)
        .to_list()
    )
    t1 = time.perf_counter()
    print(f"[TIMING] MongoDB keyword query: {t1 - t0:.3f}s")

    # Score: 1.0 for author/title match, 0.75 for abstract match
    results = []
    q_lower = q.lower()
    for paper in papers:
        score = 0.5
        if any(q_lower in a.lower() for a in paper.authors):
            score = 1.0
        elif q_lower in paper.title.lower():
            score = 0.9
        elif q_lower in paper.abstract.lower():
            score = 0.75
        if not paper.ai_summary:
            print(f"WARNING: Paper {paper.arxiv_id} has no ai_summary despite being embedded! Skipping in keyword search.")
            continue
            
        lean_paper = SearchResultPaper(
            arxiv_id=paper.arxiv_id,
            title=paper.title,
            primary_category=paper.primary_category,
            published_date=paper.published_date,
            ai_summary=paper.ai_summary
        )
        results.append({"paper": lean_paper, "score": score, "match_type": "keyword"})

    return results

@functools.lru_cache(maxsize=1000)
def _get_query_embedding_sync(q: str):
    """Synchronous cached Cohere call to avoid repeated network hops."""
    t0 = time.perf_counter()
    embed_res = co.embed(
        texts=[q],
        model='embed-english-v3.0',
        input_type='search_query'
    )
    t1 = time.perf_counter()
    print(f"[TIMING] Cohere embed (sync): {t1 - t0:.3f}s")
    return embed_res.embeddings[0]

async def _semantic_search(q: str, limit: int) -> List[dict]:
    """
    Embed the query with Cohere and search Qdrant for nearest vectors.
    Best for concept/topic queries like "transformer attention mechanism".
    """
    query_vector = await asyncio.to_thread(_get_query_embedding_sync, q)

    t0 = time.perf_counter()
    search_result = await db_info.qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=limit,
        with_payload=True
    )
    t1 = time.perf_counter()
    print(f"[TIMING] Qdrant query_points: {t1 - t0:.3f}s")
    hits = search_result.points

    if not hits:
        return []

    results = []
    missing_ids = []
    
    # Try to build directly from Qdrant payload
    for point in hits:
        payload = point.payload
        if not payload or "arxiv_id" not in payload:
            continue
            
        arxiv_id = payload["arxiv_id"]
        
        # Check if fully backfilled
        if "ai_summary" in payload and "published_date" in payload:
            # We can skip MongoDB for this paper!
            # Ensure published_date is a datetime object (Qdrant payload stores it as ISO string)
            pub_date_str = payload["published_date"]
            pub_date = datetime.fromisoformat(pub_date_str) if isinstance(pub_date_str, str) else pub_date_str
            
            lean_paper = SearchResultPaper(
                arxiv_id=arxiv_id,
                title=payload["title"],
                primary_category=payload.get("category", ""),
                published_date=pub_date,
                ai_summary=payload["ai_summary"]
            )
            results.append({
                "paper": lean_paper,
                "score": point.score,
                "match_type": "semantic"
            })
        else:
            missing_ids.append(arxiv_id)

    # Fallback: Fetch missing (not-yet-backfilled) papers from MongoDB
    if missing_ids:
        t2 = time.perf_counter()
        fallback_papers = await Paper.find({"arxiv_id": {"$in": missing_ids}}).to_list()
        t3 = time.perf_counter()
        print(f"[TIMING] Fallback MongoDB fetch for {len(missing_ids)} non-backfilled semantic IDs: {t3 - t2:.3f}s")
        
        # We need a quick way to get the original Qdrant score for these
        score_map = {point.payload["arxiv_id"]: point.score for point in hits if "arxiv_id" in point.payload}
        
        for paper in fallback_papers:
            if not paper.ai_summary:
                print(f"WARNING: Paper {paper.arxiv_id} has no ai_summary despite being embedded! Skipping in semantic search fallback.")
                continue
                
            lean_paper = SearchResultPaper(
                arxiv_id=paper.arxiv_id,
                title=paper.title,
                primary_category=paper.primary_category,
                published_date=paper.published_date,
                ai_summary=paper.ai_summary
            )
            results.append({
                "paper": lean_paper,
                "score": score_map.get(paper.arxiv_id, 0.0),
                "match_type": "semantic"
            })

    return results

def _merge_results(keyword: List[dict], semantic: List[dict], limit: int) -> List[SearchResult]:
    """
    Merge keyword and semantic results. Papers appearing in both get a score boost.
    Deduplicate by arxiv_id. Sort by final score descending.
    """
    combined: dict[str, dict] = {}

    for r in keyword:
        aid = r["paper"].arxiv_id
        combined[aid] = {"paper": r["paper"], "score": r["score"], "match_type": r["match_type"]}

    for r in semantic:
        aid = r["paper"].arxiv_id
        if aid in combined:
            # Paper found in both → boost score and mark as hybrid
            boosted = min(1.0, (combined[aid]["score"] + r["score"]) / 2 + 0.1)
            combined[aid]["score"] = boosted
            combined[aid]["match_type"] = "hybrid"
        else:
            combined[aid] = {"paper": r["paper"], "score": r["score"], "match_type": r["match_type"]}

    sorted_results = sorted(combined.values(), key=lambda x: x["score"], reverse=True)

    return [
        SearchResult(paper=r["paper"], score=r["score"], match_type=r["match_type"])
        for r in sorted_results[:limit]
    ]
async def _safe_semantic_search(q: str, limit: int) -> List[dict]:
    """Wraps semantic search to degrade gracefully if Cohere API fails."""
    try:
        return await _semantic_search(q, limit)
    except Exception as e:
        print(f"Cohere semantic search failed: {e}")
        return []

@router.get("", response_model=List[SearchResult])
async def search_papers(
    q: str = Query(..., description="The search query — author name, concept, or keyword"),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Hybrid search: combines MongoDB keyword/author search with Cohere semantic vector search.
    - Runs both keyword and semantic searches concurrently for lower latency.
    - Papers found by both → score boosted and marked 'hybrid'.
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    try:
        t_start = time.perf_counter()
        
        # Launch BOTH network requests at the exact same time
        keyword_task = _keyword_search(q, limit)
        semantic_task = _safe_semantic_search(q, limit)
        
        # Await them concurrently
        keyword_results, semantic_results = await asyncio.gather(keyword_task, semantic_task)

        # Merge and return
        t_merge0 = time.perf_counter()
        merged = _merge_results(keyword_results, semantic_results, limit)
        t_merge1 = time.perf_counter()
        print(f"[TIMING] _merge_results: {t_merge1 - t_merge0:.3f}s")
        
        t_end = time.perf_counter()
        print(f"[TIMING] Total search_papers execution: {t_end - t_start:.3f}s")
        return merged

    except Exception as e:
        print(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail="Search failed. Please try again.")
