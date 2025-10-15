#!/bin/bash
# 환경변수 로드
if [ -f ".env" ]; then
    export $(cat .env | xargs)
fi

# 모델 파일 확인
if [ ! -f "models/gold_prediction_model.h5" ]; then
fi

# 서버 시작
uvicorn app.main:app --host ${HOST:-0.0.0.0} --port ${PORT:-8000} --reload
