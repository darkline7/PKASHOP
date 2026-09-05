@echo off
title PKASHOP Launcher
color 0A
cd /d "%~dp0"

echo ===================================================
echo             PKASHOP - 1-CLICK LAUNCHER
echo ===================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js chua duoc cai dat!
    echo Vui long cai dat Node.js tu: https://nodejs.org
    pause
    exit /b 1
)

:: 2. Check .env file
if not exist ".env" (
    echo [1/4] Tao file cau hinh .env...
    copy .env.example .env >nul
) else (
    echo [1/4] File .env da san sang.
)

:: 3. Check node_modules
if not exist "node_modules" (
    echo [2/4] Dang cai dat thu vien npm install...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
) else (
    echo [2/4] Thu vien node_modules da san sang.
)

:: 4. Prisma Setup
echo [3/4] Dong bo database Prisma...
call npx prisma generate
if not exist "prisma\dev.db" (
    echo [3/4] Khoi tao database dev.db...
    call npx prisma db push --accept-data-loss
    call node prisma/seed.js
)

:: 5. Production build check
if not exist ".next" (
    echo [4/4] Dang bien dich production build...
    call npm run build
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] npm run build failed!
        pause
        exit /b 1
    )
) else (
    echo [4/4] Ban build .next da san sang.
)

:: 6. Launch Server
echo.
echo ===================================================
echo   PKASHOP DANG CHAY THANH CONG!
echo   Website:      http://localhost:3000
echo   Admin Panel:  http://localhost:3000/admin
echo ===================================================
echo.

start http://localhost:3000

call npm start
pause