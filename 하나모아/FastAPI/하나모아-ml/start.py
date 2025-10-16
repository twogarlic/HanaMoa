#!/usr/bin/env python3
import os
import sys
import traceback

try:
    import uvicorn
except Exception as e:
    traceback.print_exc()
    sys.exit(1)

if __name__ == "__main__":
    try:
        port_env = os.getenv("PORT")
        port = int(port_env) if port_env else 8000
        
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=port,
            log_level="debug",
            access_log=True
        )
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)

