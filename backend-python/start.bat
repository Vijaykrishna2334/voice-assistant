@echo off
echo Starting Voice Assistant Python Backend...
echo.

call venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
