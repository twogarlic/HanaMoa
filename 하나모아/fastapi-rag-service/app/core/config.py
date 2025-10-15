import os
from typing import Optional
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings

class Settings(BaseSettings):
    # API 설정
    api_title: str = "HanaMoa RAG Service"
    api_version: str = "1.0.0"
    api_description: str = "Cross-Encoder 리랭킹을 위한 FastAPI 서비스"
    
    # 모델 설정
    cross_encoder_model: str = "Dongjin-kr/ko-reranker"
    
    # 서버 설정
    host: str = "0.0.0.0"
    port: int = 8001
    debug: bool = False
    
    huggingface_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        protected_namespaces = ()

settings = Settings()

