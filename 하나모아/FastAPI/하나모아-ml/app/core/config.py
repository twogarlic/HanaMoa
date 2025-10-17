import os
from typing import Optional
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings

class Settings(BaseSettings):
    # 데이터베이스 설정
    price_database_url: Optional[str] = None
    database_url: Optional[str] = None
    
    # 모델 설정
    model_path: str = "models/gold_price_rf_model.pkl"
    scaler_path: str = "models/gold_price_scaler.pkl"
    model_info_path: str = "models/model_info.json"
    
    # API 설정
    api_title: str = "HanaMoa ML Prediction Service"
    api_version: str = "1.0.0"
    api_description: str = "금 가격 예측을 위한 머신러닝 서비스"
    
    # 서버 설정
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        protected_namespaces = ()

    def get_database_url(self) -> str:
        return (
            self.price_database_url or 
            self.database_url
        )

settings = Settings()
