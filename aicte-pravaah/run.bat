@echo off
title AICTE PRAVAAH-SMART Portal Launcher
cd /d "%~dp0"

echo ======================================================================
echo   AICTE PRAVAAH-SMART Portal (Problem Statement ID: 26262)
echo   Theme: Smart Automation ^| All India Council for Technical Education
echo ======================================================================
echo.

if not exist "node_modules" (
    echo [INFO] Installing required node modules...
    call npm install
    echo.
)

echo [INFO] Launching browser at http://localhost:5173/ ...
start "" "http://localhost:5173/"

echo [INFO] Starting Vite Development Server...
echo [INFO] Press Ctrl+C in this window anytime to stop the server.
echo.
call npm run dev

pause
