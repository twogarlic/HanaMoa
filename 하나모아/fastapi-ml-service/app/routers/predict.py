from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import pandas as pd
import gzip
import json

from ..models.prediction import gold_model

router = APIRouter(prefix="/predict", tags=["prediction"])

class PredictionRequest(BaseModel):
    action: str = "predict" 
    data: Optional[List[Dict[str, Any]]] = None  

class PredictionResponse(BaseModel):
    success: bool
    prediction: Optional[int] = None
    confidence: Optional[float] = None
    probability: Optional[float] = None
    direction: Optional[str] = None
    timestamp: Optional[str] = None
    data_period: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    error: Optional[str] = None

class ModelStatusResponse(BaseModel):
    is_loaded: bool
    model_info: Optional[Dict[str, Any]] = None
    sequence_length: int
    model_path: str
    scaler_path: str

from fastapi import Request as FastAPIRequest

@router.post("/prediction")
async def predict_gold_price(request: FastAPIRequest):
    """
    금 가격 예측 API (POST)
    
    Args:
        request: FastAPIRequest (raw request, Pydantic 검증 우회)
    
    Returns:
        예측 결과
    """
    
    # Raw Body 읽기 및 gzip 압축 해제
    try:
        raw_body = await request.body()
        
        # gzip 압축 확인 
        content_encoding = request.headers.get('content-encoding', '').lower()
        
        if content_encoding == 'gzip' or (len(raw_body) > 2 and raw_body[0] == 0x1f and raw_body[1] == 0x8b):
            decompressed = gzip.decompress(raw_body)
            body = json.loads(decompressed.decode('utf-8'))
        else:
            body = json.loads(raw_body.decode('utf-8'))
        
        action = body.get('action', 'predict')
        data = body.get('data', None)

    except Exception as parse_error:
        import traceback
        traceback.print_exc()
        return {"success": False, "error": f"Data parsing failed: {str(parse_error)}"}
    
    try:
        if action == "predict":
                try:
                    # 압축된 데이터 복원 
                    decompressed_data = []
                    for row in data:
                        decompressed_data.append({
                            'date': row.get('d', row.get('date')), 
                            'close': row.get('c', row.get('close')),
                            'diff': row.get('f', row.get('diff')),
                            'ratio': row.get('r', row.get('ratio'))
                        })
                    
                    df = pd.DataFrame(decompressed_data)
                    df['date'] = pd.to_datetime(df['date'], errors='coerce')
                    result = gold_model.predict_next_day(df=df)
                    
                except Exception as df_error:
                    import traceback
                    traceback.print_exc()
                    return {
                        "success": False,
                        "error": f"DataFrame 처리 실패: {str(df_error)}"
                    }
            else:
                result = gold_model.predict_next_day()
            
            return result
        
        elif action == "train":
            result = gold_model.train_model()
            return PredictionResponse(**result)
        
        elif action == "status":
            status = gold_model.get_model_status()
            return PredictionResponse(
                success=True,
                message=f"모델 로드 상태: {'로드됨' if status['is_loaded'] else '로드되지 않음'}",
                **status
            )
        
        else:
            raise HTTPException(
                status_code=400, 
                detail="유효하지 않은 action입니다."
            )
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status", response_model=ModelStatusResponse)
async def get_model_status():
    """모델 상태 확인"""
    status = gold_model.get_model_status()
    return ModelStatusResponse(**status)

@router.post("/train")
async def train_model_background(background_tasks: BackgroundTasks):
    """모델 재학습"""
    def train_task():
        result = gold_model.train_model()
    
    background_tasks.add_task(train_task)
    return {
        "success": True,
        "message": "모델 학습이 백그라운드에서 시작되었습니다."
    }

@router.get("/health")
async def health_check():
    """서비스 헬스체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "HanaFinal ML Prediction Service",
        "model_loaded": gold_model.is_loaded
    }
