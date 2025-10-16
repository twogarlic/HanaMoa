"""
Portfolio Analysis using PySpark
포트폴리오 분석
"""
from pyspark.sql import DataFrame
from pyspark.sql.functions import col, sum as spark_sum, avg, stddev, count
from ..core.spark_session import spark_manager
from ..core.config import settings
import logging
import math

logger = logging.getLogger(__name__)


class PortfolioAnalyzer:    
    def __init__(self):
        self.spark = spark_manager.get_spark()
    
    def analyze_portfolio(self, user_id: str) -> dict:

        holdings_df = self._load_holdings(user_id)
        
        if holdings_df.count() == 0:
            return {"error": "No holdings found"}
        
        price_df = self._load_prices()
        
        portfolio_df = holdings_df.join(
            price_df,
            holdings_df.asset == price_df.asset,
            "left"
        ).select(
            holdings_df["*"],
            price_df["close"].alias("current_price")
        ).withColumn(
            "current_value",
            col("quantity") * col("current_price")
        ).withColumn(
            "profit_loss",
            col("current_value") - col("totalAmount")
        ).withColumn(
            "profit_loss_ratio",
            (col("profit_loss") / col("totalAmount")) * 100
        )
        
        # 집계
        total_stats = portfolio_df.select(
            spark_sum("current_value").alias("total_value"),
            spark_sum("totalAmount").alias("total_investment"),
            spark_sum("profit_loss").alias("total_profit_loss"),
            count("*").alias("asset_count")
        ).first()
        
        total_value = float(total_stats["total_value"]) if total_stats["total_value"] else 0
        total_investment = float(total_stats["total_investment"]) if total_stats["total_investment"] else 0
        total_profit_loss = float(total_stats["total_profit_loss"]) if total_stats["total_profit_loss"] else 0
        
        # 포트폴리오 수익률
        portfolio_return = (total_profit_loss / total_investment * 100) if total_investment > 0 else 0
        
        # VaR (Value at Risk) 계산
        var_95 = self._calculate_var(portfolio_df, 0.95)
        
        # Sharpe Ratio 계산
        sharpe_ratio = self._calculate_sharpe_ratio(portfolio_df)
        
        # Beta 계산
        beta = self._calculate_beta(portfolio_df)
        
        # 최대 낙폭 (Maximum Drawdown) 계산
        max_drawdown = self._calculate_max_drawdown(portfolio_df)
        
        # 자산별 비중
        asset_weights = portfolio_df.select(
            col("asset"),
            col("current_value")
        ).withColumn(
            "weight",
            (col("current_value") / total_value * 100) if total_value > 0 else 0
        ).collect()
        
        # 분산투자 점수 
        diversification_score = self._calculate_diversification_score(asset_weights, total_value)
        
        # 리스크 레벨 판단
        risk_level = self._determine_risk_level(var_95, sharpe_ratio, max_drawdown)
        
        result = {
            "user_id": user_id,
            "portfolio_summary": {
                "total_value": total_value,
                "total_investment": total_investment,
                "total_profit_loss": total_profit_loss,
                "portfolio_return": round(portfolio_return, 2),
                "asset_count": int(total_stats["asset_count"])
            },
            "risk_metrics": {
                "var_95": round(var_95, 2),
                "sharpe_ratio": round(sharpe_ratio, 2),
                "beta": round(beta, 2),
                "max_drawdown": round(max_drawdown, 2),
                "risk_level": risk_level
            },
            "diversification": {
                "score": round(diversification_score, 2),
                "level": self._get_diversification_level(diversification_score)
            },
            "asset_allocation": [
                {
                    "asset": row["asset"],
                    "value": float(row["current_value"]),
                    "weight": round(float(row["weight"]), 2)
                }
                for row in asset_weights
            ]
        }

        return result
    
    def _load_holdings(self, user_id: str) -> DataFrame:
        jdbc_url = settings.main_database_url.replace("mysql+pymysql://", "jdbc:mysql://")
        
        # URL 파싱
        parts = jdbc_url.replace("jdbc:mysql://", "").split("@")
        auth = parts[0].split(":")
        host_parts = parts[1].split("/")
        
        jdbc_url_clean = f"jdbc:mysql://{host_parts[0]}/{host_parts[1]}"
        jdbc_user = auth[0]
        jdbc_password = auth[1] if len(auth) > 1 else ""
        
        df = self.spark.read \
            .format("jdbc") \
            .option("url", jdbc_url_clean) \
            .option("dbtable", f"(SELECT * FROM holdings WHERE userId = '{user_id}') as holdings") \
            .option("user", jdbc_user) \
            .option("password", jdbc_password) \
            .option("driver", "com.mysql.cj.jdbc.Driver") \
            .load()
        
        return df
    
    def _load_prices(self) -> DataFrame:
        """최신 가격 데이터 로드"""
        jdbc_url = settings.price_database_url.replace("mysql+pymysql://", "jdbc:mysql://")
        
        parts = jdbc_url.replace("jdbc:mysql://", "").split("@")
        auth = parts[0].split(":")
        host_parts = parts[1].split("/")
        
        jdbc_url_clean = f"jdbc:mysql://{host_parts[0]}/{host_parts[1]}"
        jdbc_user = auth[0]
        jdbc_password = auth[1] if len(auth) > 1 else ""
        
        # 각 자산의 최신 가격 조회
        df = self.spark.read \
            .format("jdbc") \
            .option("url", jdbc_url_clean) \
            .option("dbtable", """(
                SELECT d1.asset, d1.close 
                FROM daily_prices d1
                INNER JOIN (
                    SELECT asset, MAX(date) as max_date 
                    FROM daily_prices 
                    GROUP BY asset
                ) d2 ON d1.asset = d2.asset AND d1.date = d2.max_date
            ) as latest_prices""") \
            .option("user", jdbc_user) \
            .option("password", jdbc_password) \
            .option("driver", "com.mysql.cj.jdbc.Driver") \
            .load()
        
        return df
    
    def _calculate_var(self, portfolio_df: DataFrame, confidence: float = 0.95) -> float:
        # 수익률 분포의 하위 5% 지점 계산
        profit_loss_ratios = portfolio_df.select("profit_loss_ratio").collect()
        
        if not profit_loss_ratios:
            return 0.0
        
        ratios = sorted([float(row["profit_loss_ratio"]) for row in profit_loss_ratios])
        
        if len(ratios) == 0:
            return 0.0
        
        # 5% 분위수 계산
        index = int(len(ratios) * (1 - confidence))
        var = abs(ratios[index]) if index < len(ratios) else 0.0
        
        return var
    
    def _calculate_sharpe_ratio(self, portfolio_df: DataFrame) -> float:
        stats = portfolio_df.select(
            avg("profit_loss_ratio").alias("avg_return"),
            stddev("profit_loss_ratio").alias("std_return")
        ).first()
        
        if not stats or not stats["std_return"] or stats["std_return"] == 0:
            return 0.0
        
        avg_return = float(stats["avg_return"]) if stats["avg_return"] else 0.0
        std_return = float(stats["std_return"])
        
        sharpe_ratio = avg_return / std_return if std_return > 0 else 0.0
        
        return sharpe_ratio
    
    def _calculate_beta(self, portfolio_df: DataFrame) -> float:
        stats = portfolio_df.select(
            stddev("profit_loss_ratio").alias("portfolio_volatility")
        ).first()
        
        if not stats or not stats["portfolio_volatility"]:
            return 1.0
        
        portfolio_vol = float(stats["portfolio_volatility"])
        
        market_vol = 10.0
        
        beta = portfolio_vol / market_vol if market_vol > 0 else 1.0
        
        return beta
    
    def _calculate_max_drawdown(self, portfolio_df: DataFrame) -> float:
        profit_loss_ratios = portfolio_df.select("profit_loss_ratio").collect()
        
        if not profit_loss_ratios:
            return 0.0
        
        ratios = [float(row["profit_loss_ratio"]) for row in profit_loss_ratios]
        
        if not ratios:
            return 0.0
        
        max_return = max(ratios)
        min_return = min(ratios)
        
        max_drawdown = abs(max_return - min_return)
        
        return max_drawdown
    
    def _calculate_diversification_score(self, asset_weights, total_value: float) -> float:
        if total_value == 0:
            return 0.0
        
        herfindahl = sum(
            (float(row["current_value"]) / total_value) ** 2 
            for row in asset_weights
        )
        
        # 0-100 점수로 변환 
        score = (1 - herfindahl) * 100
        
        return max(0, min(100, score))
    
    def _get_diversification_level(self, score: float) -> str:
        if score >= 70:
            return "우수"
        elif score >= 50:
            return "양호"
        elif score >= 30:
            return "보통"
        else:
            return "부족"
    
    def _determine_risk_level(self, var: float, sharpe: float, max_dd: float) -> str:
        risk_score = 0
        
        # VaR 기준
        if var > 10:
            risk_score += 3
        elif var > 5:
            risk_score += 2
        else:
            risk_score += 1
        
        # Sharpe Ratio 기준
        if sharpe < 0.5:
            risk_score += 3
        elif sharpe < 1.0:
            risk_score += 2
        else:
            risk_score += 1
        
        # Max Drawdown 기준
        if max_dd > 20:
            risk_score += 3
        elif max_dd > 10:
            risk_score += 2
        else:
            risk_score += 1
        
        # 종합 판단
        if risk_score >= 8:
            return "매우 높음"
        elif risk_score >= 6:
            return "높음"
        elif risk_score >= 4:
            return "보통"
        else:
            return "낮음"

