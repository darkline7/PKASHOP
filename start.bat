@echo off
title PKASHOP - Dev Server
cd /d "%~dp0"

:: 1. Git pull neu co git
where git >nul 2>nul
if %errorlevel% equ 0 (
    echo [PKASHOP] Checking for latest code updates...
    git pull origin main
)

:: 2. Check node_modules
if not exist "node_modules" (
    echo [PKASHOP] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
)

:: 3. Generate Prisma client & sync DB
echo [PKASHOP] Generating Prisma client...
call npx prisma generate
call npx prisma db push --accept-data-loss

:: 4. Clean .next cache if locked
if exist ".next\trace" (
    echo [PKASHOP] Cleaning stale .next cache...
    rmdir /s /q .next 2>nul
)

:: 5. Start dev server on port 3000
echo [PKASHOP] Starting dev server on http://localhost:3000 ...
echo.
start http://localhost:3000
call npm run dev

pause

