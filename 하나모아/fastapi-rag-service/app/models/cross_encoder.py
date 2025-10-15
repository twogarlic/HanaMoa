"""
Cross-Encoder 모델을 사용한 문서 리랭킹
Dongjin-kr/ko-reranker 모델 사용
"""
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import List, Dict
import logging

class CrossEncoderModel:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.model_name = "Dongjin-kr/ko-reranker"
        self.is_loaded = False
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
    
    def load_model(self) -> bool:
        """Cross-Encoder 모델 로드"""
        try:
            
            # 토크나이저 로드
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            
            # 모델 로드
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            self.model.to(self.device)
            self.model.eval()  # 평가 모드
            
            self.is_loaded = True
            return True
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return False
    
    def calculate_score(self, query: str, document: str) -> float:
        """단일 문서에 대한 관련성 점수 계산"""
        try:
            if not self.is_loaded:
                return 0.0
            
            # 텍스트 길이 제한 
            max_length = 400
            if len(document) > max_length:
                document = document[:max_length] + "..."
            
            # 토크나이징
            inputs = self.tokenizer(
                f"{query} [SEP] {document}",
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            
            # 디바이스로 이동
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # 추론
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                
                # 모델 출력 형식 확인 및 점수 추출
                if logits.shape[-1] == 1:
                    # Regression 모델 (단일 점수 출력)
                    score = torch.sigmoid(logits[0][0]).item()
                else:
                    # Classification 모델 (LABEL_0, LABEL_1)
                    probs = torch.softmax(logits, dim=-1)
                    score = probs[0][1].item() if logits.shape[-1] > 1 else probs[0][0].item()
                
            return score
            
        except Exception as e:
            return 0.0
    
    def rerank_documents(
        self, 
        query: str, 
        documents: List[str], 
        top_k: int = 3
    ) -> List[Dict[str, any]]:
        """여러 문서를 리랭킹"""
        try:
            if not self.is_loaded:
                return []
            
            # 각 문서에 대해 점수 계산
            scored_docs = []
            for idx, doc in enumerate(documents):
                score = self.calculate_score(query, doc)
                scored_docs.append({
                    "index": idx,
                    "document": doc,
                    "score": score
                })
            
            # 점수 기준으로 정렬
            scored_docs.sort(key=lambda x: x["score"], reverse=True)
            
            # 상위 K개 선택
            top_docs = scored_docs[:top_k]
            
            return top_docs
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return []
    
    def get_model_status(self) -> Dict[str, any]:
        """모델 상태 확인"""
        return {
            "is_loaded": self.is_loaded,
            "model_name": self.model_name,
            "device": self.device,
            "cuda_available": torch.cuda.is_available()
        }

# 싱글톤 인스턴스
cross_encoder_model = CrossEncoderModel()

