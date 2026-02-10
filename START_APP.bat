@echo off
REM Barangay NIT Website - One-Click Startup Batch File
REM This file allows you to double-click to start both Backend and Frontend

color 0B
cls

echo ==========================================
echo   Starting Barangay NIT Website...
echo ==========================================
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

echo Starting Backend (Flask)...
start cmd /k "cd backend && python application.py"

timeout /t 2 /nobreak

echo Starting Frontend (React)...
start cmd /k "cd frontend && npm start"

echo.
echo ==========================================
echo   Both services are starting...
echo ==========================================
echo.
echo - Backend will run on http://localhost:5000
echo - Frontend will run on http://localhost:3000
echo.
echo Close any window to stop that service
echo.
pause
