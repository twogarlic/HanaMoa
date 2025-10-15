FROM python:3.11-slim
LABEL "language"="python"
LABEL "framework"="fastapi"

WORKDIR /src

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY . .

WORKDIR /src/fastapi-rag-service
RUN pip install --no-cache-dir -r requirements.txt

# gunicorn과 uvicorn 설치
RUN pip install gunicorn uvicorn[standard]

ENV PORT=8080
EXPOSE 8080

CMD ["gunicorn", "app.main:app", "-w", "1", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080", "--timeout", "120", "--keep-alive", "5"]