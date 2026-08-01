from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.models.paper import Paper
from pydantic import BaseModel

router = APIRouter()

class PaginatedPapersResponse(BaseModel):
    papers: List[Paper]
    total: int
    page: int
    total_pages: int

@router.get("/feed", response_model=List[Paper])
async def get_latest_feed(limit: int = Query(10, ge=1, le=50)):
    """
    Fetch the latest papers that have been successfully processed and summarized.
    """
    papers = await Paper.find({"embedded": True}).sort("-published_date").limit(limit).to_list()
    return papers

@router.get("/all", response_model=PaginatedPapersResponse)
async def get_all_papers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50)
):
    """
    Fetch all processed papers with server-side pagination.
    """
    skip = (page - 1) * limit
    total = await Paper.find({"embedded": True}).count()
    papers = await Paper.find({"embedded": True}).sort("-published_date").skip(skip).limit(limit).to_list()
    total_pages = (total + limit - 1) // limit  # ceiling division
    return PaginatedPapersResponse(
        papers=papers,
        total=total,
        page=page,
        total_pages=total_pages
    )

@router.get("/{arxiv_id:path}", response_model=Paper)
async def get_paper_details(arxiv_id: str):
    """
    Fetch a single paper's details by its ArXiv ID.
    Note: arxiv_id is a path parameter. It might contain slashes if it's an old-style ID,
    so we use {arxiv_id:path} just in case.
    """
    paper = await Paper.find_one(Paper.arxiv_id == arxiv_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper
