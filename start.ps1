# PowerShell Launcher for EventFlow AI
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    Launching EventFlow AI Mega-Event Engine" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
