from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .core.config import settings
from .core.spark_session import spark_manager
from .analytics.price_analyzer import PriceAnalyzer
from .analytics.portfolio_analyzer import PortfolioAnalyzer

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Spark 세션 초기화
        spark = spark_manager.get_spark()
        
        yield
        
    except Exception as startup_error:
        raise
    finally:
        spark_manager.stop()


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="Apache Spark 기반 실시간 금융 데이터 분석 서비스",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "service": "HanaMoa Spark Analytics",
        "version": settings.api_version,
        "status": "running",
        "spark_version": spark_manager.get_spark().version
    }


@app.get("/api/analytics/price/{asset}")
async def analyze_price(asset: str, days: int = 30):
    try:
        analyzer = PriceAnalyzer()
        result = analyzer.analyze_price_trends(asset=asset, days=days)
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/price/multi")
async def analyze_multi_assets():
    try:
        analyzer = PriceAnalyzer()
        result = analyzer.get_multi_asset_analysis()
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/portfolio/{user_id}")
async def analyze_portfolio(user_id: str):
    try:
        analyzer = PortfolioAnalyzer()
        result = analyzer.analyze_portfolio(user_id=user_id)
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/technical-indicators/{asset}")
async def get_technical_indicators(asset: str, days: int = 30):
    try:     
        analyzer = PriceAnalyzer()
        result = analyzer.analyze_price_trends(asset=asset, days=days)
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        # 기술적 지표 반환
        return {
            "success": True,
            "data": {
                "asset": asset,
                "technical_indicators": result.get("technical_indicators", {}),
                "trend_analysis": result.get("trend_analysis", {})
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    try:
        spark = spark_manager.get_spark()
        return {
            "status": "healthy",
            "spark_active": True,
            "spark_version": spark.version
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "spark_active": False,
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )

