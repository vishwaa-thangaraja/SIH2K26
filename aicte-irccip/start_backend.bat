@echo off
title AICTE IRCCIP Backend Server (Port 8000)
cd /d "%~dp0backend"

echo ========================================================
echo Checking Python Environment...
echo ========================================================

if not exist "venv" (
    echo [FIRST RUN DETECTED] Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Python is not installed or not in PATH! Please install Python 3.10+.
        pause
        exit /b 1
    )
    echo Installing backend dependencies...
    call venv\Scripts\activate.bat
    python -m pip install --upgrade pip
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

echo ========================================================
echo Starting AICTE Backend Server on http://127.0.0.1:8000
echo Swagger API Docs: http://127.0.0.1:8000/docs
echo ========================================================
python run.py
pause
