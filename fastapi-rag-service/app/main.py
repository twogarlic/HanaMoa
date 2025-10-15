"""
FastAPI RAG Service - Cross-Encoder 리랭킹 서비스
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

from .core.config import settings
from .routers import rerank
from .models.cross_encoder import cross_encoder_model

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작/종료 시 실행되는 라이프사이클"""
    try:
        try:
            if cross_encoder_model.load_model():
            else:
        except Exception as model_error:
            import traceback
            traceback.print_exc()
        
        yield
        
    except Exception as startup_error:
        import traceback
        traceback.print_exc()
        raise
    finally:

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=settings.api_description,
    lifespan=lifespan
)

app.add_middleware(GZipMiddleware, minimum_size=100)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rerank.router)

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    """루트 엔드포인트"""
    return {
        "message": "HanaFinal RAG Service",
        "version": settings.api_version,
        "docs": "/docs",
        "health": "/health"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    """전체 서비스 헬스체크"""
    return {
        "status": "healthy",
        "service": "HanaFinal RAG Service",
        "model_loaded": cross_encoder_model.is_loaded
    }

