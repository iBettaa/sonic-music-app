@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is missing. Install Node.js 20 or later at https://nodejs.org
  pause
  exit /b 1
)
echo.
echo ==========================================
echo     SONIC - Your Music Universe
 echo ==========================================
echo.
echo Sonic will open at: http://localhost:3000
echo Keep this window open while using Sonic.
echo Press Ctrl+C to stop Sonic.
echo.
start "" "http://localhost:3000"
node server.js
pause
