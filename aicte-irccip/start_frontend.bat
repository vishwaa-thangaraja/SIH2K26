@echo off
title AICTE IRCCIP Frontend Client (Port 3000)
cd /d "%~dp0frontend"

echo ========================================================
echo Checking Frontend Environment...
echo ========================================================

if not exist "node_modules" (
    echo [FIRST RUN DETECTED] Installing node_modules dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Node.js or npm is not installed or failed! Please install Node.js (v18+).
        pause
        exit /b 1
    )
)

echo ========================================================
echo Starting React Vite Frontend Dashboard...
echo URL: http://localhost:3000
echo ========================================================
npm run dev
pause
