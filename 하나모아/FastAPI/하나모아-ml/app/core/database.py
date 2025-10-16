import mysql.connector
from typing import Optional
import pandas as pd
from .config import settings

class DatabaseManager:
    def __init__(self):
        self.connection = None
    
    def get_connection(self):
        if self.connection is None or not self.connection.is_connected():
            database_url = settings.get_database_url()
            
            if database_url.startswith('mysql://'):
                # URL 파싱
                url_parts = database_url.replace('mysql://', '').split('/')
                auth_host = url_parts[0]
                database = url_parts[1] if len(url_parts) > 1
                
                if '@' in auth_host:
                    auth, host_port = auth_host.split('@')
                    user, password = auth.split(':')
                    if ':' in host_port:
                        host, port = host_port.split(':')
                        port = int(port)
                    else:
                        host = host_port
                        port = 3306
            
            self.connection = mysql.connector.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                database=database,
                charset='utf8mb4'
            )
        
        return self.connection
    
    def fetch_gold_data(self) -> Optional[pd.DataFrame]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT DATABASE()")
            current_db = cursor.fetchone()
            
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            
            query = """
            SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, close, diff, ratio 
            FROM daily_prices 
            WHERE asset = 'gold' 
            ORDER BY date DESC
            LIMIT 100
            """
            
            cursor.execute(query)
            results = cursor.fetchall()
            
            if not results:
                cursor.close()
                return None
            
            df = pd.DataFrame(results, columns=['date', 'close', 'diff', 'ratio'])
            
            df['date'] = pd.to_datetime(df['date'], errors='coerce', utc=False)

            df = df.sort_values('date').reset_index(drop=True)

            cursor.close()
            return df
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return None
    
    def save_prediction(self, prediction_data: dict) -> bool:
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            query = """
            INSERT INTO predictions (asset, prediction, confidence, probability, created_at)
            VALUES (%s, %s, %s, %s, NOW())
            """
            
            cursor.execute(query, (
                'gold',
                prediction_data['prediction'],
                prediction_data['confidence'],
                prediction_data['probability']
            ))
            
            conn.commit()
            cursor.close()
            return True
            
        except Exception as e:
            return False
    
    def close(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()

# 전역 데이터베이스 매니저 인스턴스
db_manager = DatabaseManager()
