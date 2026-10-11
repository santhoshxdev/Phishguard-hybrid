"""
Convenience entry point to run the FastAPI backend server on port 8000.
"""

import uvicorn
import os
import sys

# Ensure backend/app is in Python path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(BACKEND_DIR, "app")
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

if __name__ == "__main__":
    print("Starting PhishGuard Hybrid API on http://127.0.0.1:8000 ...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False, app_dir=APP_DIR)
