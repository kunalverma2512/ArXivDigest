import asyncio
import sys
import os
import argparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from app.core.config import settings
from app.models.paper import Paper
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
import motor.motor_asyncio
from beanie import init_beanie
import certifi

q_client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
COLLECTION_NAME = "arxiv_papers"

async def init_db():
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGODB_URI,
        tlsCAFile=certifi.where()
    )
    db = client[settings.MONGODB_DB_NAME]
    await init_beanie(database=db, document_models=[Paper])

async def backfill(test_mode=True):
    await init_db()
    
    print(f"Starting backfill. Test Mode: {test_mode}")
    
    # Scroll through Qdrant to get all point IDs and their arxiv_ids
    offset = None
    processed = 0
    
    while True:
        limit = 10 if test_mode else 100
        
        # We need point ID and arxiv_id from payload
        records, next_offset = q_client.scroll(
            collection_name=COLLECTION_NAME,
            limit=limit,
            offset=offset,
            with_payload=["arxiv_id", "ai_summary", "published_date"],
            with_vectors=False
        )
        
        if not records:
            break
            
        arxiv_ids = [r.payload["arxiv_id"] for r in records if r.payload and "arxiv_id" in r.payload]
        
        # Fetch corresponding papers from Mongo
        papers = await Paper.find({"arxiv_id": {"$in": arxiv_ids}}).to_list()
        paper_map = {p.arxiv_id: p for p in papers}
        
        for record in records:
            arxiv_id = record.payload.get("arxiv_id")
            if not arxiv_id or arxiv_id not in paper_map:
                continue
                
            paper = paper_map[arxiv_id]
            
            if not paper.ai_summary:
                print(f"WARNING: Paper {arxiv_id} has no ai_summary despite being embedded! Skipping backfill for this paper.")
                continue

            # Idempotency check: if already backfilled, skip to save API calls
            if "ai_summary" in record.payload and "published_date" in record.payload:
                continue

            # The only fields we need to ensure are set in Qdrant for the new SearchResultPaper model:
            # title, category, published_date, ai_summary. (arxiv_id is already there)
            new_payload = {
                "title": paper.title,
                "category": paper.primary_category,
                "published_date": paper.published_date.isoformat(),
                "ai_summary": paper.ai_summary
            }
            
            # Update payload in Qdrant (this merges with existing payload)
            q_client.set_payload(
                collection_name=COLLECTION_NAME,
                payload=new_payload,
                points=[record.id]
            )
            
            processed += 1
            if test_mode:
                print(f"Updated payload for ArXiv ID: {arxiv_id} (Qdrant Point ID: {record.id})")
            elif processed % 100 == 0:
                print(f"Progress: Updated {processed} papers so far...")
            
            # Rate limit protection for Qdrant Cloud Free Tier
            await asyncio.sleep(0.05)
            
            if test_mode and processed >= 5:
                print("Test mode limit reached (5 points). Exiting.")
                return

        offset = next_offset
        if offset is None:
            break
            
    print(f"Backfill complete! Processed {processed} points.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill Qdrant payloads with published_date and ai_summary")
    parser.add_argument("--full", action="store_true", help="Run in full mode (default is test mode: 5 points max)")
    args = parser.parse_args()
    
    asyncio.run(backfill(test_mode=not args.full))
