@echo off
title PKASHOP - Production Build ^& Start
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

:: 4. Clean .next cache
echo [PKASHOP] Cleaning old build cache...
rmdir /s /q .next 2>nul

:: 5. Build production
echo [PKASHOP] Building production bundle...
call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed! Fix errors above and try again.
    pause
    exit /b 1
)

:: 6. Start production server
echo.
echo ========================================
echo   PKASHOP Production Server
echo   http://localhost:3000
echo   Press Ctrl+C to stop
echo ========================================
echo.
start http://localhost:3000
call npm start

pause

