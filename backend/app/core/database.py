import motor.motor_asyncio
from beanie import init_beanie
from qdrant_client import AsyncQdrantClient
from app.core.config import settings
import certifi

class DatabaseInfo:
    client: motor.motor_asyncio.AsyncIOMotorClient = None
    db = None
    qdrant: AsyncQdrantClient = None

db_info = DatabaseInfo()

async def connect_to_mongo():
    from app.models.paper import Paper  # local import to avoid circular deps
    db_info.client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGODB_URI,
        tlsCAFile=certifi.where()
    )
    db_info.db = db_info.client[settings.MONGODB_DB_NAME]
    await init_beanie(database=db_info.db, document_models=[Paper])
    print(f"Connected to MongoDB database: {settings.MONGODB_DB_NAME}")

async def close_mongo_connection():
    if db_info.client:
        db_info.client.close()
        print("Closed MongoDB connection.")

def connect_to_qdrant():
    db_info.qdrant = AsyncQdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )
    print("Connected to Qdrant vector database.")

def close_qdrant_connection():
    if db_info.qdrant:
        db_info.qdrant.close()
        print("Closed Qdrant connection.")
