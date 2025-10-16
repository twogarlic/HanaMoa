import os
import json
import pickle
import numpy as np
import pandas as pd
from typing import Optional, Dict, Any
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler

from ..core.config import settings
from ..core.database import db_manager

class GoldPredictionModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_info = None
        self.sequence_length = 15
        self.is_loaded = False
    
    def load_model_and_scaler(self) -> bool:
        try:
            model_path = settings.model_path
            scaler_path = settings.scaler_path
            info_path = settings.model_info_path
            
            # 모델 파일 존재 확인
            if not os.path.exists(model_path):
                return False
            
            if not os.path.exists(scaler_path):
                return False
            
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            # 스케일러 로드
            with open(scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            
            self.is_loaded = True
            return True
            
        except Exception as e:
            self.is_loaded = False
            return False
    
    def add_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        
        # 이동평균선 
        df['sma_5'] = df['close'].rolling(window=5).mean()
        df['sma_20'] = df['close'].rolling(window=20).mean()
        
        # RSI 
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # 변동성
        df['volatility'] = df['close'].rolling(window=20).std()
        
        # 결측값 처리
        df = df.fillna(0)
        
        return df
    
    def predict_next_day(self, df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
        if not self.is_loaded:
            if not self.load_model_and_scaler():
                return {
                    'success': False,
                    'error': '모델을 로드할 수 없습니다.'
                }

        try:
            # 데이터 가져오기
            if df is None:
                df = db_manager.fetch_gold_data()             
                if df is None or df.empty:
                    return {
                        'success': False,
                        'error': '금 가격 데이터를 가져올 수 없습니다.'
                    }
            
            # 기술적 지표 추가
            df = self.add_technical_indicators(df)
            
            # 특성 선택
            features = ['close', 'diff', 'ratio', 'sma_5', 'sma_20', 'rsi', 'volatility']
            
            if len(df) < self.sequence_length:
                return {
                    'success': False,
                    'error': f'데이터가 부족합니다. 최소 {self.sequence_length}일의 데이터가 필요합니다.'
                }
            
            recent_data = df.tail(self.sequence_length)[features].values
            
            X_pred = recent_data.flatten().reshape(1, -1)
            X_pred_scaled = self.scaler.transform(X_pred)
            
            prediction_binary = int(self.model.predict(X_pred_scaled)[0]) 
            prediction_prob = float(self.model.predict_proba(X_pred_scaled)[0][1])  
            confidence = float(max(prediction_prob, 1 - prediction_prob))
            
            result = {
                'success': True,
                'prediction': prediction_binary,
                'confidence': confidence,
                'probability': prediction_prob,
                'direction': '상승' if prediction_binary == 1 else '하락',
                'timestamp': datetime.now().isoformat(),
                'data_period': {
                    'start': df['date'].min().isoformat(),
                    'end': df['date'].max().isoformat(),
                    'total_records': len(df)
                }
            }
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': f'예측 중 오류가 발생했습니다: {str(e)}'
            }
    
    def get_model_status(self) -> Dict[str, Any]:
        return {
            'is_loaded': self.is_loaded,
            'model_info': self.model_info,
            'sequence_length': self.sequence_length,
            'model_path': settings.model_path,
            'scaler_path': settings.scaler_path
        }
    
    def train_model(self) -> Dict[str, Any]:
        try:
            df = db_manager.fetch_gold_data()
            if df is None or df.empty:
                return {
                    'success': False,
                    'error': '학습용 데이터를 가져올 수 없습니다.'
                }
            
            return {
                'success': True,
                'message': '모델 학습이 시작되었습니다. 완료까지 시간이 소요될 수 있습니다.',
                'data_records': len(df)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'모델 학습 중 오류가 발생했습니다: {str(e)}'
            }

# 전역 모델 인스턴스
gold_model = GoldPredictionModel()
