#!/bin/bash

if ! command -v java &> /dev/null; then
    exit 1
fi

java -version

# Python 버전 확인
python --version

# 의존성 설치 확인
if [ ! -d "venv" ]; then
    python -m venv venv
fi

source venv/bin/activate || . venv/Scripts/activate

pip install -r requirements.txt

# 환경 변수 확인
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# 서비스 시작
python -m uvicorn app.main:app --reload --host ${HOST:-0.0.0.0} --port ${PORT:-8000}

