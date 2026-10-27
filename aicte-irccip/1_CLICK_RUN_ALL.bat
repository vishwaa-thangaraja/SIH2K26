@echo off
title AICTE IRCCIP 1-Click Launch
echo =====================================================================
echo  AICTE Integrated Complaint Monitoring & Cross-Bureau Tracking System
echo  Smart India Hackathon (SIH 2026) - Problem Statement 26264
echo =====================================================================
echo.
echo [1/3] Starting Backend API Server (Port 8000)...
start "AICTE Backend (Port 8000)" cmd /k "cd /d %~dp0backend && python run.py"

echo [2/3] Starting Frontend React Client (Port 3000)...
start "AICTE Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Launching browser to http://localhost:3000 ...
start http://localhost:3000

echo =====================================================================
echo  System is running live at http://localhost:3000
echo  Keep the opened command prompt windows open during demonstration.
echo =====================================================================
pause
