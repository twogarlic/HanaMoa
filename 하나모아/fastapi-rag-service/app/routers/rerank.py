"""
문서 리랭킹 API 라우터
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

from ..models.cross_encoder import cross_encoder_model

router = APIRouter(prefix="/rerank", tags=["rerank"])

class RerankRequest(BaseModel):
    query: str
    documents: List[str]
    top_k: int = 3

class RerankResponse(BaseModel):
    success: bool
    results: List[Dict[str, Any]]
    timestamp: str
    message: str = None
    error: str = None

class ModelStatusResponse(BaseModel):
    is_loaded: bool
    model_name: str
    device: str
    cuda_available: bool

@router.post("/", response_model=RerankResponse)
async def rerank_documents(request: RerankRequest):
    """
    Cross-Encoder를 사용한 문서 리랭킹
    
    Args:
        query: 검색 질문
        documents: 리랭킹할 문서 리스트
        top_k: 반환할 상위 문서 개수
    
    Returns:
        리랭킹된 문서와 점수
    """
    try:
        # 모델 로드 확인
        if not cross_encoder_model.is_loaded:
            if not cross_encoder_model.load_model():
                raise HTTPException(
                    status_code=503,
                    detail="모델 로드 실패"
                )
        
        # 리랭킹 수행
        results = cross_encoder_model.rerank_documents(
            query=request.query,
            documents=request.documents,
            top_k=request.top_k
        )
        
        if not results:
            return RerankResponse(
                success=False,
                results=[],
                timestamp=datetime.now().isoformat(),
                error="리랭킹 실패"
            )
        
        return RerankResponse(
            success=True,
            results=results,
            timestamp=datetime.now().isoformat(),
            message=f"{len(results)}개 문서 리랭킹 완료"
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status", response_model=ModelStatusResponse)
async def get_model_status():
    """모델 상태 확인"""
    status = cross_encoder_model.get_model_status()
    return ModelStatusResponse(**status)

@router.get("/health")
async def health_check():
    """서비스 헬스체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "HanaFinal RAG Service",
        "model_loaded": cross_encoder_model.is_loaded
    }

