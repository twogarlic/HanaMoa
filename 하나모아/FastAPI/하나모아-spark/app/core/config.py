from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database Configuration
    price_database_url: str = os.getenv("PRICE_DATABASE_URL", "")
    main_database_url: str = os.getenv("MAIN_DATABASE_URL", "")
    
    # Spark Configuration
    spark_master: str = "local[*]"
    spark_app_name: str = "HanaAnalytics"
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_title: str = "Hana Spark Analytics API"
    api_version: str = "1.0.0"
    
    # Kafka Configuration
    kafka_bootstrap_servers: Optional[str] = None
    kafka_price_topic: str = "price-updates"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

