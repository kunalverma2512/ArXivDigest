from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
from app.core.database import connect_to_mongo, close_mongo_connection, connect_to_qdrant, close_qdrant_connection
from app.routes import papers, search

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    await connect_to_mongo()
    connect_to_qdrant()
    yield
    # Shutdown logic
    await close_mongo_connection()
    close_qdrant_connection()

app = FastAPI(
    title="ArXiv Daily Research Digest API",
    description="Backend API for crawling, summarizing, and semantically searching AI research papers.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(papers.router, prefix="/api/v1/papers", tags=["Papers"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])

@app.get("/")
async def root():
    return {"message": "Welcome to the ArXiv Daily Research Digest API"}
