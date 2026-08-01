import asyncio
import time
import os
import sys
import certifi

# Add the backend directory to Python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)

from app.core.config import settings
from app.models.paper import Paper
import motor.motor_asyncio
from beanie import init_beanie
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
import cohere
import torch
from transformers import pipeline

# Initialize Cohere Client (for embeddings only)
co = cohere.Client(api_key=settings.COHERE_API_KEY)

# Initialize HuggingFace Local Summarizer
device = "mps" if torch.backends.mps.is_available() else "cpu"
print(f"Initializing DistilBART on {device}...")
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", device=device)

# Initialize Qdrant Client
q_client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
COLLECTION_NAME = "arxiv_papers"
COHERE_EMBED_DIMENSION = 1024 # embed-english-v3.0 is 1024 dims

def ensure_qdrant_collection():
    try:
        q_client.get_collection(collection_name=COLLECTION_NAME)
        print(f"Qdrant collection '{COLLECTION_NAME}' exists.")
    except Exception:
        print(f"Creating Qdrant collection '{COLLECTION_NAME}'...")
        q_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qmodels.VectorParams(
                size=COHERE_EMBED_DIMENSION,
                distance=qmodels.Distance.COSINE
            )
        )

async def init_db():
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGODB_URI,
        tlsCAFile=certifi.where()
    )
    db = client[settings.MONGODB_DB_NAME]
    await init_beanie(database=db, document_models=[Paper])
    print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")

async def process_papers():
    ensure_qdrant_collection()
    
    # Find papers that haven't been summarized or embedded yet
    papers_to_process = await Paper.find(Paper.embedded == False).to_list()
    print(f"Found {len(papers_to_process)} papers to process.")
    
    for paper in papers_to_process:
        print(f"Processing {paper.arxiv_id}...")
        
        # 1. Summarize with local DistilBART
        try:
            result = summarizer(paper.abstract, max_length=70, min_length=30, do_sample=False)
            summary = result[0]['summary_text'].strip()
            paper.ai_summary = summary
        except Exception as e:
            print(f"HuggingFace Summarization failed for {paper.arxiv_id}: {e}")
            continue
            
        # 2. Embed with Cohere Embed
        text_to_embed = f"{paper.title}. {paper.ai_summary}"
        try:
            embed_res = co.embed(
                texts=[text_to_embed],
                model='embed-english-v3.0',
                input_type='search_document'
            )
            vector = embed_res.embeddings[0]
            
            # 3. Upsert to Qdrant
            q_client.upsert(
                collection_name=COLLECTION_NAME,
                points=[
                    qmodels.PointStruct(
                        id=abs(hash(paper.arxiv_id)) % (10 ** 18),
                        vector=vector,
                        payload={
                            "arxiv_id": paper.arxiv_id,
                            "title": paper.title,
                            "category": paper.primary_category
                        }
                    )
                ]
            )
            
            # 4. Mark as embedded in Mongo
            paper.embedded = True
            await paper.save()
            print(f"Successfully processed {paper.arxiv_id}")
            
        except Exception as e:
            print(f"Cohere Embedding/Qdrant failed for {paper.arxiv_id}: {e}")
            
        # Be nice to APIs (especially Trial Keys)
        time.sleep(2)

async def main():
    await init_db()
    await process_papers()

if __name__ == "__main__":
    asyncio.run(main())
