@echo off
title PKASHOP Launcher
color 0A
cd /d "%~dp0"

echo ===================================================
echo             PKASHOP - 1-CLICK LAUNCHER
echo ===================================================
echo.

:: 1. Kiem tra Node.js & Git
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js chua duoc cai dat!
    echo Vui long cai dat Node.js tu: https://nodejs.org
    pause
    exit /b 1
)

:: 2. Tu dong pull code moi nhat tu Git ve (neu co git)
where git >nul 2>nul
if %errorlevel% equ 0 (
    echo [1/5] Dang kiem tra va cap nhat code moi nhat tu Git...
    git pull origin main
) else (
    echo [1/5] Bo qua git pull (chua cai Git).
)

:: 3. Check .env file
if not exist ".env" (
    echo [2/5] Tao file cau hinh .env tu .env.example...
    copy .env.example .env >nul
) else (
    echo [2/5] File .env da san sang.
)

:: 4. Check dependencies (npm install)
if not exist "node_modules" (
    echo [3/5] Dang cai dat thu vien npm install...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] npm install that bai!
        pause
        exit /b 1
    )
) else (
    echo [3/5] Thu vien node_modules da san sang.
)

:: 5. Dong bo Prisma Database
echo [4/5] Dong bo schema database Prisma...
call npx prisma generate
call npx prisma db push --accept-data-loss

:: 6. Build lai ban production moi nhat
echo [5/5] Dang dong goi ban build moi nhat (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] npm run build that bai!
    pause
    exit /b 1
)

:: 7. Launch Server
echo.
echo ===================================================
echo   PKASHOP DA SAN SANG VA DANG CHAY CODE MOI NHAT!
echo   Website:      http://localhost:3000
echo   Admin Panel:  http://localhost:3000/admin
echo ===================================================
echo.

start http://localhost:3000

call npm start
pause
