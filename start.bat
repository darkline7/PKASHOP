@echo off
title PKASHOP - Dev Server
cd /d "%~dp0"

:: Check node_modules
if not exist "node_modules" (
    echo [PKASHOP] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
)

:: Generate Prisma client
echo [PKASHOP] Generating Prisma client...
call npx prisma generate

:: Clean .next cache if locked
if exist ".next\trace" (
    echo [PKASHOP] Cleaning stale .next cache...
    rmdir /s /q .next 2>nul
)

:: Start dev server on port 3000
echo [PKASHOP] Starting dev server on http://localhost:3000 ...
echo.
call npm run dev

pause
