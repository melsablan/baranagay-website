# Barangay NIT Website - One-Click Startup Script
# Runs both Backend and Frontend simultaneously

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  🚀 Barangay NIT Website Startup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$errorCount = 0

# Start Backend
Write-Host "Starting Backend (Flask)..." -ForegroundColor Yellow
try {
    $backendProcess = Start-Process powershell -ArgumentList `
        "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python application.py" `
        -PassThru
    Write-Host "✅ Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green
    Write-Host "   API running at: http://localhost:5000" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to start backend: $_" -ForegroundColor Red
    $errorCount++
}

Write-Host ""

# Start Frontend
Write-Host "Starting Frontend (React)..." -ForegroundColor Yellow
try {
    $frontendProcess = Start-Process powershell -ArgumentList `
        "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start" `
        -PassThru
    Write-Host "✅ Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor Green
    Write-Host "   App will open at: http://localhost:3000" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to start frontend: $_" -ForegroundColor Red
    $errorCount++
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

if ($errorCount -eq 0) {
    Write-Host "✅ Both services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 IMPORTANT:" -ForegroundColor Yellow
    Write-Host "  1. Backend will take ~5-10 seconds to start" -ForegroundColor Gray
    Write-Host "  2. Frontend will automatically open in your browser" -ForegroundColor Gray
    Write-Host "  3. Close any window to stop that service" -ForegroundColor Gray
    Write-Host "  4. Press Ctrl+C in either window to stop" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Some services failed to start" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
