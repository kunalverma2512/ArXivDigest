import asyncio
import time
import requests
import certifi
from bs4 import BeautifulSoup
from datetime import datetime
import motor.motor_asyncio
from beanie import init_beanie

import os
import sys
# Add the backend directory to Python path so we can import app modules
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)

from app.core.config import settings
from app.models.paper import Paper

ARXIV_API_URL = "http://export.arxiv.org/api/query"
CATEGORIES = ["cs.AI", "cs.LG", "cs.CL", "cs.CV"]

async def init_db():
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGODB_URI,
        tlsCAFile=certifi.where()
    )
    db = client[settings.MONGODB_DB_NAME]
    await init_beanie(database=db, document_models=[Paper])
    print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")

def fetch_arxiv_papers(max_results: int = 50):
    # Build query manually — using requests params= would encode + as %2B, breaking ArXiv's OR syntax
    query = "+OR+".join([f"cat:{cat}" for cat in CATEGORIES])
    url = (
        f"{ARXIV_API_URL}"
        f"?search_query={query}"
        f"&sortBy=submittedDate"
        f"&sortOrder=descending"
        f"&max_results={max_results}"
    )

    print(f"Fetching {max_results} papers from ArXiv...")
    # Be nice to ArXiv API (rate limits)
    time.sleep(3)

    response = requests.get(url)
    response.raise_for_status()
    return response.text

async def process_and_save_papers(xml_data: str):
    soup = BeautifulSoup(xml_data, "xml")
    entries = soup.find_all("entry")
    
    new_papers_count = 0
    updated_papers_count = 0
    
    for entry in entries:
        # Extract ID (e.g. http://arxiv.org/abs/2407.12341v1 -> 2407.12341v1)
        id_url = entry.id.text
        arxiv_id = id_url.split('/abs/')[-1]
        
        # We only want the base ID, drop version if we want (e.g., v1, v2)
        # But keeping version is fine. Let's keep exactly what ArXiv gives as the abs ID.
        
        title = entry.title.text.strip().replace('\n', ' ')
        abstract = entry.summary.text.strip().replace('\n', ' ')
        
        # Parse Dates
        published_str = entry.published.text
        updated_str = entry.updated.text
        published_date = datetime.strptime(published_str, "%Y-%m-%dT%H:%M:%SZ")
        updated_date = datetime.strptime(updated_str, "%Y-%m-%dT%H:%M:%SZ")
        
        # Extract Authors
        authors = [author.find('name').text for author in entry.find_all('author')]
        
        # Extract Categories
        categories = [category['term'] for category in entry.find_all('category')]
        primary_category = entry.find('primary_category')['term'] if entry.find('primary_category') else categories[0]
        
        # Extract PDF Link
        pdf_url = ""
        for link in entry.find_all('link'):
            if link.get('title') == 'pdf':
                pdf_url = link.get('href')
                break
        
        # Check if exists
        existing_paper = await Paper.find_one(Paper.arxiv_id == arxiv_id)
        
        if existing_paper:
            # Update if newer
            if updated_date > existing_paper.updated_date:
                existing_paper.title = title
                existing_paper.abstract = abstract
                existing_paper.updated_date = updated_date
                # If abstract changed, we might need a new summary (reset ai_summary and embedded)
                existing_paper.ai_summary = None
                existing_paper.embedded = False
                await existing_paper.save()
                updated_papers_count += 1
        else:
            # Insert new
            new_paper = Paper(
                arxiv_id=arxiv_id,
                title=title,
                authors=authors,
                published_date=published_date,
                updated_date=updated_date,
                abstract=abstract,
                categories=categories,
                primary_category=primary_category,
                pdf_url=pdf_url
            )
            await new_paper.insert()
            new_papers_count += 1
            
    print(f"Crawler finished. Inserted: {new_papers_count}, Updated: {updated_papers_count}")

async def main():
    await init_db()
    xml_data = fetch_arxiv_papers(max_results=288)
    await process_and_save_papers(xml_data)

if __name__ == "__main__":
    asyncio.run(main())
