# PhishGuard Hybrid - One-Click Launcher for Windows PowerShell
$ErrorActionPreference = "Stop"

$ProjectRoot = $PSScriptRoot
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  PhishGuard Hybrid: ML-Based Phishing URL Detection     " -ForegroundColor Green
Write-Host "  Phase-1 Academic Prototype                             " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Update Path for Node and Python
$env:Path = "C:\Program Files\nodejs;" + $env:Path

Write-Host "`n[1/3] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
$BackendProcess = Start-Process python -ArgumentList "run_backend.py" -WorkingDirectory $BackendDir -PassThru

Start-Sleep -Seconds 3

Write-Host "[2/3] Checking API health..." -ForegroundColor Cyan
try {
    $Health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -Method Get
    Write-Host "  API Status: $($Health.status) | Features: $($Health.feature_count)" -ForegroundColor Green
} catch {
    Write-Host "  Warning: API is still initializing..." -ForegroundColor Yellow
}

Write-Host "`n[3/3] Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Cyan
$FrontendProcess = Start-Process cmd.exe -ArgumentList "/c npm run dev" -WorkingDirectory $FrontendDir -PassThru

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  Application is LIVE!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Press Ctrl+C to terminate services.`n"

try {
    Wait-Process -Id $BackendProcess.Id, $FrontendProcess.Id
} finally {
    Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $FrontendProcess.Id -Force -ErrorAction SilentlyContinue
}
