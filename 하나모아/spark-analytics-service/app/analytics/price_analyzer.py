"""
Real-time Price Analysis using PySpark
실시간 가격 데이터 분석
"""
from pyspark.sql import DataFrame
from pyspark.sql.functions import col, desc, asc, lit, count, avg, sum as spark_sum
from ..core.spark_session import spark_manager
from ..core.config import settings
from .technical_indicators import TechnicalIndicators
import logging

logger = logging.getLogger(__name__)


class PriceAnalyzer:
    """가격 데이터 분석 클래스"""
    
    def __init__(self):
        self.spark = spark_manager.get_spark()
    
    def load_price_data(self, asset: str = None, limit: int = None) -> DataFrame:
        """
        데이터베이스에서 가격 데이터 로드
        
        Args:
            asset: 특정 자산 필터 (None이면 전체)
            limit: 조회할 최대 레코드 수
        """
        
        # MySQL JDBC URL 구성
        jdbc_url = settings.price_database_url.replace("mysql+pymysql://", "jdbc:mysql://")
        
        # 데이터베이스 연결 정보 파싱
        parts = jdbc_url.replace("jdbc:mysql://", "").split("@")
        auth = parts[0].split(":")
        host_parts = parts[1].split("/")
        
        jdbc_url_clean = f"jdbc:mysql://{host_parts[0]}/{host_parts[1]}"
        jdbc_user = auth[0]
        jdbc_password = auth[1] if len(auth) > 1 else ""
        
        # DailyPrice 테이블 로드
        df = self.spark.read \
            .format("jdbc") \
            .option("url", jdbc_url_clean) \
            .option("dbtable", "daily_prices") \
            .option("user", jdbc_user) \
            .option("password", jdbc_password) \
            .option("driver", "com.mysql.cj.jdbc.Driver") \
            .load()
        
        # 필터링
        if asset:
            df = df.filter(col("asset") == asset)
        
        # 정렬
        df = df.orderBy(col("asset"), col("date").desc())
        
        # 제한
        if limit:
            df = df.limit(limit)
        
        record_count = df.count()
        
        return df
    
    def analyze_price_trends(self, asset: str, days: int = 30) -> dict:
        """
        가격 추세 분석
        
        Args:
            asset: 분석할 자산
            days: 분석 기간 (일수)
        """
        
        # 데이터 로드
        df = self.load_price_data(asset=asset, limit=days)
        
        if df.count() == 0:
            logger.warning(f"{asset} 데이터가 없습니다")
            return {"error": "No data available"}
        
        # 기술적 지표 계산
        df_with_indicators = TechnicalIndicators.calculate_all_indicators(df, column="close")
        
        # 최신 데이터 추출
        latest = df_with_indicators.orderBy(desc("date")).first()
        
        # 기본 통계
        stats = df.select(
            avg("close").alias("avg_price"),
            spark_sum("close").alias("total_volume")
        ).first()
        
        # 결과 구성
        result = {
            "asset": asset,
            "analysis_period": days,
            "current_price": float(latest["close"]) if latest else 0,
            "avg_price": float(stats["avg_price"]) if stats else 0,
            "technical_indicators": {
                "sma_20": float(latest["sma_20"]) if latest and latest["sma_20"] else None,
                "sma_50": float(latest["sma_50"]) if latest and latest["sma_50"] else None,
                "sma_200": float(latest["sma_200"]) if latest and latest["sma_200"] else None,
                "rsi_14": float(latest["rsi_14"]) if latest and latest["rsi_14"] else None,
                "macd_line": float(latest["macd_line"]) if latest and latest["macd_line"] else None,
                "macd_signal": float(latest["macd_signal"]) if latest and latest["macd_signal"] else None,
                "macd_histogram": float(latest["macd_histogram"]) if latest and latest["macd_histogram"] else None,
                "bb_upper": float(latest["bb_upper"]) if latest and latest["bb_upper"] else None,
                "bb_middle": float(latest["bb_middle"]) if latest and latest["bb_middle"] else None,
                "bb_lower": float(latest["bb_lower"]) if latest and latest["bb_lower"] else None,
                "volatility_20": float(latest["volatility_20"]) if latest and latest["volatility_20"] else None,
                "volatility_pct_20": float(latest["volatility_pct_20"]) if latest and latest["volatility_pct_20"] else None,
            },
            "trend_analysis": self._analyze_trend(latest) if latest else {}
        }
        
        return result
    
    def _analyze_trend(self, latest_data) -> dict:
        """
        추세 분석 (기술적 지표 기반)
        """
        trend = {}
        
        # RSI 기반 과매수/과매도 판단
        if latest_data["rsi_14"]:
            rsi = float(latest_data["rsi_14"])
            if rsi > 70:
                trend["rsi_signal"] = "OVERBOUGHT"  # 과매수
            elif rsi < 30:
                trend["rsi_signal"] = "OVERSOLD"  # 과매도
            else:
                trend["rsi_signal"] = "NEUTRAL"
        
        # MACD 기반 추세 판단
        if latest_data["macd_histogram"]:
            macd_hist = float(latest_data["macd_histogram"])
            if macd_hist > 0:
                trend["macd_signal"] = "BULLISH"  # 상승 추세
            elif macd_hist < 0:
                trend["macd_signal"] = "BEARISH"  # 하락 추세
            else:
                trend["macd_signal"] = "NEUTRAL"
        
        # Bollinger Bands 기반 변동성 판단
        if latest_data["bb_upper"] and latest_data["bb_lower"] and latest_data["close"]:
            price = float(latest_data["close"])
            bb_upper = float(latest_data["bb_upper"])
            bb_lower = float(latest_data["bb_lower"])
            
            if price >= bb_upper:
                trend["bb_signal"] = "HIGH_VOLATILITY_UP"
            elif price <= bb_lower:
                trend["bb_signal"] = "HIGH_VOLATILITY_DOWN"
            else:
                trend["bb_signal"] = "NORMAL"
        
        # 변동성 기반 리스크 판단
        if latest_data["volatility_pct_20"]:
            volatility_pct = float(latest_data["volatility_pct_20"])
            if volatility_pct > 5.0:
                trend["risk_level"] = "HIGH"
            elif volatility_pct > 2.0:
                trend["risk_level"] = "MEDIUM"
            else:
                trend["risk_level"] = "LOW"
        
        return trend
    
    def get_multi_asset_analysis(self, assets: list = None) -> dict:
        """
        다중 자산 비교 분석
        
        Args:
            assets: 분석할 자산 리스트 (None이면 전체)
        """
        if not assets:
            assets = ["gold", "silver", "usd", "jpy", "eur", "cny"]
        
        results = {}
        for asset in assets:
            try:
                results[asset] = self.analyze_price_trends(asset, days=30)
            except Exception as e:
                results[asset] = {"error": str(e)}
        
        return {
            "assets": results,
            "comparison": self._compare_assets(results)
        }
    
    def _compare_assets(self, results: dict) -> dict:
        """자산 간 비교 분석"""
        comparison = {
            "highest_rsi": None,
            "lowest_rsi": None,
            "highest_volatility": None,
            "lowest_volatility": None,
            "bullish_assets": [],
            "bearish_assets": []
        }
        
        valid_results = {k: v for k, v in results.items() if "error" not in v}
        
        if not valid_results:
            return comparison
        
        # RSI 비교
        rsi_data = {
            k: v["technical_indicators"]["rsi_14"] 
            for k, v in valid_results.items() 
            if v["technical_indicators"]["rsi_14"] is not None
        }
        
        if rsi_data:
            comparison["highest_rsi"] = max(rsi_data, key=rsi_data.get)
            comparison["lowest_rsi"] = min(rsi_data, key=rsi_data.get)
        
        # 변동성 비교
        vol_data = {
            k: v["technical_indicators"]["volatility_pct_20"] 
            for k, v in valid_results.items() 
            if v["technical_indicators"]["volatility_pct_20"] is not None
        }
        
        if vol_data:
            comparison["highest_volatility"] = max(vol_data, key=vol_data.get)
            comparison["lowest_volatility"] = min(vol_data, key=vol_data.get)
        
        # 추세 분류
        for asset, data in valid_results.items():
            trend = data.get("trend_analysis", {})
            if trend.get("macd_signal") == "BULLISH":
                comparison["bullish_assets"].append(asset)
            elif trend.get("macd_signal") == "BEARISH":
                comparison["bearish_assets"].append(asset)
        
        return comparison

