@echo off
title PKASHOP - Production Build ^& Start
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

:: Clean .next cache
echo [PKASHOP] Cleaning old build cache...
rmdir /s /q .next 2>nul

:: Build production
echo [PKASHOP] Building production bundle...
call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed! Fix errors above and try again.
    pause
    exit /b 1
)

:: Start production server
echo.
echo ========================================
echo   PKASHOP Production Server
echo   http://localhost:3000
echo   Press Ctrl+C to stop
echo ========================================
echo.
call npm start

pause
