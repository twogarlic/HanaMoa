from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager

from .core.config import settings
from .routers import predict
from .models.prediction import gold_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        try:
            if gold_model.load_model_and_scaler():
        except Exception as model_error:
            import traceback
            traceback.print_exc()
        
        yield
        
    except Exception as startup_error:
        import traceback
        traceback.print_exc()
        raise
    finally:

# FastAPI 앱 생성
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=settings.api_description,
    lifespan=lifespan
)

# GZip 압축 미들웨어 
app.add_middleware(GZipMiddleware, minimum_size=100)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(predict.router)

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "message": "HanaMoa ML Prediction Service",
        "version": settings.api_version,
        "docs": "/docs",
        "health": "/health"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return {
        "status": "healthy",
        "service": settings.api_title,
        "version": settings.api_version
    }

if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.getenv("PORT", settings.port))
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=port,
        reload=settings.debug
    )
