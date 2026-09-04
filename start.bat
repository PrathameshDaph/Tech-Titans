@echo off
echo ===================================================
echo     Launching EventFlow AI Mega-Event Engine
echo ===================================================

echo Starting Backend Server on http://localhost:8000 ...
start cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo Starting Frontend on http://localhost:3000 ...
start cmd /k "cd frontend && npm run dev"

echo Both services launched! Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000
