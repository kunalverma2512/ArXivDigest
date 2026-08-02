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
summarizer = pipeline("summarization", model="lrakotoson/scitldr", device=device)

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
    
    if not papers_to_process:
        return

    # 1. Summarize all papers locally (Free)
    successfully_summarized = []
    
    for paper in papers_to_process:
        print(f"Summarizing {paper.arxiv_id}...")
        try:
            if not paper.ai_summary:
                result = summarizer(paper.abstract, max_length=70, min_length=30, do_sample=False)
                paper.ai_summary = result[0]['summary_text'].strip()
                await paper.save()
            successfully_summarized.append(paper)
        except Exception as e:
            print(f"HuggingFace Summarization failed for {paper.arxiv_id}: {e}")
            continue

    if not successfully_summarized:
        print("No papers were successfully summarized.")
        return

    # 2. Batch Embedding and Upserting
    BATCH_SIZE = 96
    
    for i in range(0, len(successfully_summarized), BATCH_SIZE):
        batch = successfully_summarized[i:i + BATCH_SIZE]
        texts_to_embed = [f"{paper.title}. {paper.ai_summary}" for paper in batch]
        
        print(f"Embedding batch of {len(batch)} papers via Cohere...")
        try:
            embed_res = co.embed(
                texts=texts_to_embed,
                model='embed-english-v3.0',
                input_type='search_document'
            )
            embeddings = embed_res.embeddings
            
            # 3. Upsert to Qdrant
            points = []
            for paper, vector in zip(batch, embeddings):
                points.append(
                    qmodels.PointStruct(
                        id=abs(hash(paper.arxiv_id)) % (10 ** 18),
                        vector=vector,
                        payload={
                            "arxiv_id": paper.arxiv_id,
                            "title": paper.title,
                            "category": paper.primary_category
                        }
                    )
                )
            
            q_client.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
            
            # 4. Mark as embedded in Mongo
            for paper in batch:
                paper.embedded = True
                await paper.save()
                
            print(f"Successfully processed and embedded batch of {len(batch)} papers.")
            time.sleep(2)
            
        except Exception as e:
            print(f"Cohere Embedding/Qdrant failed for batch starting at index {i}: {e}")

async def main():
    await init_db()
    await process_papers()

if __name__ == "__main__":
    asyncio.run(main())
