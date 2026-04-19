@echo off
setlocal
echo =======================================
echo   CRWI Symposium - Git Push Utility
echo =======================================
echo.

:: Check for git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Git is not installed or not in PATH.
    pause
    exit /b 1
)

echo Step 1: Adding changes...
git add .
if %errorlevel% neq 0 (
    echo Error while adding files.
    pause
    exit /b 1
)

echo.
echo Please enter a short description of what you changed.
set /p msg="Commit message (or press Enter for 'Auto-update'): "
if "%msg%"=="" set msg=Update website content and styles - %date% %time%

echo.
echo Step 3: Committing changes...
git commit -m "%msg%"
if %errorlevel% neq 0 (
    echo.
    echo No changes to commit or commit failed. Proceeding to push anyway...
)

echo Step 4: Pushing to GitHub...
git push -f https://github.com/Jomitm/crwisymposium.git main
if %errorlevel% neq 0 (
    echo.
    echo Push failed. Check your internet connection and GitHub permissions.
    pause
    exit /b 1
)

echo.
echo =======================================
echo   SUCCESS: Changes pushed to GitHub!
echo =======================================
echo.
pause
