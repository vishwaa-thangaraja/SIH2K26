@echo off
title AICTE IRCCIP Backend Server (Port 8000)
cd /d "%~dp0backend"
echo ========================================================
echo Starting AICTE Case Coordination Platform Backend...
echo API Docs: http://127.0.0.1:8000/docs
echo ========================================================
python run.py
pause
