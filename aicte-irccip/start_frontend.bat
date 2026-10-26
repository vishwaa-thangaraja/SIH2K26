@echo off
title AICTE IRCCIP Frontend Client (Port 3000)
cd /d "%~dp0frontend"
echo ========================================================
echo Starting React Vite Frontend Dashboard...
echo URL: http://localhost:3000
echo ========================================================
npm run dev
pause
