# YOLO Theft Detection Service Starter
# Run this script to start the theft detection service

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "YOLO THEFT DETECTION SERVICE" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Navigate to the correct directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if service is already running
$existingProcess = Get-Process python -ErrorAction SilentlyContinue | Where-Object {
    (Get-NetTCPConnection -OwningProcess $_.Id -LocalPort 5002 -ErrorAction SilentlyContinue) -ne $null
}

if ($existingProcess) {
    Write-Host "⚠️  Service is already running (PID: $($existingProcess.Id))" -ForegroundColor Yellow
    Write-Host "   To stop: Stop-Process -Id $($existingProcess.Id)" -ForegroundColor Yellow
    Write-Host ""
    exit
}

Write-Host "Starting theft detection service..." -ForegroundColor Green
Write-Host "Server will run on: http://127.0.0.1:5002" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available endpoints:" -ForegroundColor Yellow
Write-Host "  • GET  /health  - Health check" -ForegroundColor White
Write-Host "  • POST /start   - Start camera" -ForegroundColor White
Write-Host "  • POST /stop    - Stop camera" -ForegroundColor White
Write-Host "  • POST /register - Register customer" -ForegroundColor White
Write-Host "  • GET  /feed    - Video feed stream" -ForegroundColor White
Write-Host ""

# Start the service in a new window
Start-Process python -ArgumentList "app.py" -WindowStyle Normal

# Wait a moment for service to start
Start-Sleep -Seconds 5

# Check if service started successfully
$serviceRunning = Get-Process python -ErrorAction SilentlyContinue | Where-Object {
    (Get-NetTCPConnection -OwningProcess $_.Id -LocalPort 5002 -ErrorAction SilentlyContinue) -ne $null
}

if ($serviceRunning) {
    Write-Host "✅ Service started successfully!" -ForegroundColor Green
    Write-Host "   PID: $($serviceRunning.Id)" -ForegroundColor Cyan
    Write-Host "   URL: http://127.0.0.1:5002" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Test health: curl http://127.0.0.1:5002/health" -ForegroundColor Gray
    Write-Host "To stop: Stop-Process -Id $($serviceRunning.Id)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to start service" -ForegroundColor Red
    Write-Host "   Check the Python window for error messages" -ForegroundColor Yellow
}

Write-Host ""
