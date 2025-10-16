#!/bin/bash

# 환경변수 파일 로드 및 FastAPI 서버 실행

if [ -f "config.env" ]; then
    export $(cat config.env | grep -v '^#' | xargs)
else
fi

# 환경변수 확인
python3 -m uvicorn app.main:app --host ${HOST:-127.0.0.1} --port ${PORT:-8002} --reload
