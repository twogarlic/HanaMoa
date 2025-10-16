"""
Technical Indicators Calculation using PySpark
금융 기술적 지표 계산
"""
from pyspark.sql import DataFrame, Window
from pyspark.sql.functions import (
    col, avg, stddev, lag, when, lit, sum as spark_sum,
    min as spark_min, max as spark_max, abs as spark_abs
)
import logging

logger = logging.getLogger(__name__)


class TechnicalIndicators:
    @staticmethod
    def calculate_sma(df: DataFrame, column: str = "close", period: int = 20) -> DataFrame:
        window_spec = Window.partitionBy("asset").orderBy("date").rowsBetween(-period + 1, 0)
        
        df_with_sma = df.withColumn(
            f"sma_{period}",
            avg(col(column)).over(window_spec)
        )
        
        return df_with_sma
    
    @staticmethod
    def calculate_ema(df: DataFrame, column: str = "close", period: int = 20) -> DataFrame:
        # EMA 계산을 위한 알파 값
        alpha = 2.0 / (period + 1)
        
        window_spec = Window.partitionBy("asset").orderBy("date")
        
        # SMA로 초기화
        df_with_sma = TechnicalIndicators.calculate_sma(df, column, period)
        
        # E계산 
        df_with_ema = df_with_sma.withColumn(
            f"ema_{period}",
            col(f"sma_{period}") 
        )
        
        return df_with_ema
    
    @staticmethod
    def calculate_rsi(df: DataFrame, column: str = "close", period: int = 14) -> DataFrame:
        window_spec = Window.partitionBy("asset").orderBy("date")
        
        # 가격 변화 계산
        df_with_change = df.withColumn(
            "price_change",
            col(column) - lag(col(column), 1).over(window_spec)
        )
        
        # 상승분과 하락분 분리
        df_with_gains = df_with_change.withColumn(
            "gain",
            when(col("price_change") > 0, col("price_change")).otherwise(0)
        ).withColumn(
            "loss",
            when(col("price_change") < 0, spark_abs(col("price_change"))).otherwise(0)
        )
        
        # 평균 상승분과 평균 하락분 계산
        window_period = Window.partitionBy("asset").orderBy("date").rowsBetween(-period + 1, 0)
        
        df_with_avg = df_with_gains.withColumn(
            "avg_gain",
            avg("gain").over(window_period)
        ).withColumn(
            "avg_loss",
            avg("loss").over(window_period)
        )
        
        # RS와 RSI 계산
        df_with_rsi = df_with_avg.withColumn(
            "rs",
            when(col("avg_loss") == 0, 100).otherwise(col("avg_gain") / col("avg_loss"))
        ).withColumn(
            f"rsi_{period}",
            100 - (100 / (1 + col("rs")))
        )
        
        # 중간 계산 컬럼 제거
        df_final = df_with_rsi.drop("price_change", "gain", "loss", "avg_gain", "avg_loss", "rs")
        
        return df_final
    
    @staticmethod
    def calculate_bollinger_bands(df: DataFrame, column: str = "close", period: int = 20, std_dev: int = 2) -> DataFrame:
        window_spec = Window.partitionBy("asset").orderBy("date").rowsBetween(-period + 1, 0)
        
        df_with_bb = df.withColumn(
            "bb_middle",
            avg(col(column)).over(window_spec)
        ).withColumn(
            "bb_std",
            stddev(col(column)).over(window_spec)
        ).withColumn(
            "bb_upper",
            col("bb_middle") + (col("bb_std") * std_dev)
        ).withColumn(
            "bb_lower",
            col("bb_middle") - (col("bb_std") * std_dev)
        )
        
        # 표준편차 컬럼 제거
        df_final = df_with_bb.drop("bb_std")
        
        return df_final
    
    @staticmethod
    def calculate_macd(df: DataFrame, column: str = "close", fast: int = 12, slow: int = 26, signal: int = 9) -> DataFrame:
        # EMA 계산
        df_with_fast_ema = TechnicalIndicators.calculate_sma(df, column, fast)
        df_with_slow_ema = TechnicalIndicators.calculate_sma(df_with_fast_ema, column, slow)
        
        # MACD 라인 
        df_with_macd = df_with_slow_ema.withColumn(
            "macd_line",
            col(f"sma_{fast}") - col(f"sma_{slow}")
        )
        
        # Signal 라인 
        window_spec = Window.partitionBy("asset").orderBy("date").rowsBetween(-signal + 1, 0)
        
        df_with_signal = df_with_macd.withColumn(
            "macd_signal",
            avg("macd_line").over(window_spec)
        ).withColumn(
            "macd_histogram",
            col("macd_line") - col("macd_signal")
        )
        
        # 중간 계산 컬럼 제거
        df_final = df_with_signal.drop(f"sma_{fast}", f"sma_{slow}")
        
        return df_final
    
    @staticmethod
    def calculate_volatility(df: DataFrame, column: str = "close", period: int = 20) -> DataFrame:
        window_spec = Window.partitionBy("asset").orderBy("date").rowsBetween(-period + 1, 0)
        
        df_with_volatility = df.withColumn(
            f"volatility_{period}",
            stddev(col(column)).over(window_spec)
        ).withColumn(
            f"volatility_pct_{period}",
            (stddev(col(column)).over(window_spec) / avg(col(column)).over(window_spec)) * 100
        )
        
        return df_with_volatility
    
    @staticmethod
    def calculate_all_indicators(df: DataFrame, column: str = "close") -> DataFrame:
        # SMA 계산
        df = TechnicalIndicators.calculate_sma(df, column, 20)
        df = TechnicalIndicators.calculate_sma(df, column, 50)
        df = TechnicalIndicators.calculate_sma(df, column, 200)
        
        # RSI 계산
        df = TechnicalIndicators.calculate_rsi(df, column, 14)
        
        # Bollinger Bands 계산
        df = TechnicalIndicators.calculate_bollinger_bands(df, column, 20, 2)
        
        # MACD 계산
        df = TechnicalIndicators.calculate_macd(df, column, 12, 26, 9)
        
        # Volatility 계산
        df = TechnicalIndicators.calculate_volatility(df, column, 20)
        
        return df

