@echo off
echo =======================================================================
echo     CONTINUUM (SIH 2026 - Problem Statement 26135)
echo     Longitudinal Trainee Tracking System - UI V2 Development Launcher
echo =======================================================================
echo.

REM Start Backend (FastAPI on Port 8000)
echo [1/2] Starting FastAPI Backend (Port 8000)...
start "CONTINUUM Backend (FastAPI)" powershell -NoExit -Command "cd '%~dp0backend'; python -m pip install -r requirements.txt; python seed_data.py; python -m uvicorn main:app --reload --port 8000"

REM Start Frontend (Next.js on Port 3000)
echo [2/2] Starting Next.js Frontend (Port 3000)...
start "CONTINUUM Frontend (Next.js)" powershell -NoExit -Command "cd '%~dp0frontend'; npm run dev"

REM Wait 3 seconds then open browser automatically
timeout /t 3 /nobreak >nul
echo.
echo Opening Web Application in your browser...
start http://localhost:3000

echo.
echo =======================================================================
echo Application Running:
echo   - Web UI (Open in Browser):  http://localhost:3000
echo   - Backend API:               http://localhost:8000
echo   - Swagger API Docs:          http://localhost:8000/docs
echo =======================================================================
