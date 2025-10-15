"""
Configuration settings for Spark Analytics Service
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database Configuration
    price_database_url: str = "mysql+pymysql://user:password@localhost:3306/hana_price"
    main_database_url: str = "mysql+pymysql://user:password@localhost:3306/hana_final"
    
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

