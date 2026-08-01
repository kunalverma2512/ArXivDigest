from typing import List, Optional
from datetime import datetime
from beanie import Document
from pydantic import Field

class Paper(Document):
    arxiv_id: str = Field(..., description="Unique ArXiv ID of the paper")
    title: str
    authors: List[str]
    published_date: datetime
    updated_date: datetime
    abstract: str
    categories: List[str]
    primary_category: str
    pdf_url: str
    
    # These fields will be populated by the AI Summarizer script later
    ai_summary: Optional[str] = None
    embedded: bool = False

    class Settings:
        name = "papers"
        indexes = [
            "arxiv_id",
            "published_date",
            "primary_category",
            "embedded"
        ]
