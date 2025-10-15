#!/bin/bash

echo "🚀 Hana Spark Analytics Service 시작 중..."

# Java 버전 확인
echo "📌 Java 버전 확인..."
if ! command -v java &> /dev/null; then
    echo "❌ Java가 설치되어 있지 않습니다."
    echo "   Java 17 이상을 설치해주세요: https://adoptium.net/"
    exit 1
fi

java -version

# Python 버전 확인
echo "📌 Python 버전 확인..."
python --version

# 의존성 설치 확인
echo "📌 의존성 확인 중..."
if [ ! -d "venv" ]; then
    echo "📦 가상환경 생성 중..."
    python -m venv venv
fi

echo "📦 가상환경 활성화 중..."
source venv/bin/activate || . venv/Scripts/activate

echo "📦 의존성 설치 중..."
pip install -r requirements.txt

# 환경 변수 확인
if [ ! -f ".env" ]; then
    echo "⚠️ .env 파일이 없습니다. .env.example을 복사합니다..."
    cp .env.example .env
    echo "⚠️ .env 파일을 수정해주세요."
fi

# 서비스 시작
echo "✅ Spark Analytics Service 시작!"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

