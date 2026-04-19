@echo off
setlocal
echo ==============================================
echo CRWI Symposium 2026 - Local Development Server
echo ==============================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js is not found on your system!
    echo To fix this, please download and install Node.js from: https://nodejs.org/
    echo Once installed, restart your computer and try double-clicking this file again.
    echo.
    pause
    exit /b 1
)

echo Starting the local Node.js server...
echo.
echo Refreshing data from Excel...
npm start
pause
