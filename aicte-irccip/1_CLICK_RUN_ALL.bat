@echo off
title AICTE IRCCIP Master 1-Click Launcher
cd /d "%~dp0"

echo ===================================================================
echo   AICTE Case Coordination Platform (IRCCIP) - Master Launcher
echo ===================================================================
echo.
echo [1/3] Starting Backend Server (Port 8000)...
start "AICTE Backend (Port 8000)" cmd /k "call "%~dp0start_backend.bat""

echo Waiting 5 seconds for backend initialization...
timeout /t 5 /nobreak > nul

echo [2/3] Starting Frontend Server (Port 3000)...
start "AICTE Frontend (Port 3000)" cmd /k "call "%~dp0start_frontend.bat""

echo Waiting 3 seconds for Vite server...
timeout /t 3 /nobreak > nul

echo [3/3] Opening Dashboard in Default Browser...
start http://localhost:3000

echo.
echo ===================================================================
echo [SUCCESS] Platform is booting up!
echo Keep both black terminal windows open in the background.
echo When ready, press F11 in your browser and start recording.
echo ===================================================================
pause
