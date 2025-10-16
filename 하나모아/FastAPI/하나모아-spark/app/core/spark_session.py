from pyspark.sql import SparkSession
from .config import settings
import logging

logger = logging.getLogger(__name__)


class SparkSessionManager:
    _instance = None
    _spark = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SparkSessionManager, cls).__new__(cls)
        return cls._instance
    
    def get_spark(self) -> SparkSession:
        if self._spark is None:
            
            self._spark = SparkSession.builder \
                .appName(settings.spark_app_name) \
                .master(settings.spark_master) \
                .config("spark.sql.adaptive.enabled", "true") \
                .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
                .config("spark.driver.memory", "2g") \
                .config("spark.executor.memory", "2g") \
                .config("spark.jars.packages", "mysql:mysql-connector-java:8.0.33") \
                .getOrCreate()
            
            # Set log level to WARN to reduce noise
            self._spark.sparkContext.setLogLevel("WARN")
        
        return self._spark
    
    def stop(self):
        """Stop Spark session"""
        if self._spark is not None:
            self._spark.stop()
            self._spark = None


# Global instance
spark_manager = SparkSessionManager()

