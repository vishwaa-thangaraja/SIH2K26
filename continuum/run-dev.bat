@echo off
echo =======================================================================
echo     CONTINUUM (SIH 2026 - Problem Statement 26135)
echo     Longitudinal Trainee Tracking System - Turnkey Launcher
echo =======================================================================
echo.

REM 1. Self-healing check for frontend node_modules
if not exist "%~dp0frontend\node_modules" (
    echo [SETUP] First-time run detected: Installing frontend npm packages...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
    echo [SETUP] Frontend installation finished!
    echo.
)

REM 2. Start Backend (FastAPI on Port 8000)
echo [1/2] Starting FastAPI Backend (Port 8000)...
start "CONTINUUM Backend (FastAPI)" powershell -NoExit -Command "cd '%~dp0backend'; Write-Host '[1/2] Verifying database tables...' -ForegroundColor Cyan; python seed_data.py; Write-Host '[2/2] Launching API Server on http://localhost:8000...' -ForegroundColor Green; python -m uvicorn main:app --reload --port 8000"

REM 3. Start Frontend (Next.js on Port 3000)
echo [2/2] Starting Next.js Frontend (Port 3000)...
start "CONTINUUM Frontend (Next.js)" powershell -NoExit -Command "cd '%~dp0frontend'; Write-Host 'Launching Next.js frontend on http://localhost:3000...' -ForegroundColor Green; npm run dev"

REM 4. Wait 5 seconds then open browser automatically
echo.
echo Waiting for services to initialize...
timeout /t 5 /nobreak >nul
echo Opening CONTINUUM in your browser...
start http://localhost:3000

echo.
echo =======================================================================
echo Application Running:
echo   - Web UI (Open in Browser):  http://localhost:3000
echo   - Backend API:               http://localhost:8000
echo   - Swagger API Docs:          http://localhost:8000/docs
echo =======================================================================
