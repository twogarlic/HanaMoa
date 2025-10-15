#!/bin/bash

PORT=${PORT:-8001}

python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info
