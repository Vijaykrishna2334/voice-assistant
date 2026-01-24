@echo off
echo ==========================================
echo  Voice Assistant Python Backend Setup
echo ==========================================
echo.

REM Check Python version
python --version
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found. Please install Python 3.12+
    pause
    exit /b 1
)

echo.
echo Step 1: Creating virtual environment...
python -m venv venv
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo.
echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Step 3: Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Step 4: Installing dependencies...
pip install -r requirements.txt

echo.
echo Step 5: Installing PyTorch with CUDA support (for faster TTS)...
pip uninstall torch torchaudio -y
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121

echo.
echo ==========================================
echo  Setup Complete!
echo ==========================================
echo.
echo To start the server:
echo   1. Activate the virtual environment: venv\Scripts\activate
echo   2. Run: python -m uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
echo.
echo Or simply run: start.bat
echo.
pause
