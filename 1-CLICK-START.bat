@echo off
title PKASHOP Launcher
cd /d "%~dp0"

echo ===================================================
echo             PKASHOP - 1-CLICK LAUNCHER
echo ===================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js chua duoc cai dat!
    echo Vui long cai dat Node.js tu: https://nodejs.org
    pause
    exit /b 1
)

where git >nul 2>nul
if %errorlevel% equ 0 (
    echo [1/5] Dang kiem tra va cap nhat code moi nhat tu Git...
    git pull origin main
) else (
    echo [1/5] Bo qua git pull - may khong co san Git
)

if not exist ".env" (
    echo [2/5] Tao file cau hinh .env tu .env.example...
    copy .env.example .env >nul
) else (
    echo [2/5] File .env da san sang.
)

if not exist "node_modules" (
    echo [3/5] Dang cai dat thu vien npm install...
    call npm install
) else (
    echo [3/5] Thu vien node_modules da san sang.
)

echo [4/5] Dong bo schema database Prisma...
call npx prisma generate
call npx prisma db push --accept-data-loss

echo [5/5] Kiem tra ban build...
if not exist ".next" (
    echo Dang bien dich ban build dau tien...
    call npm run build
)

echo.
echo ===================================================
echo   PKASHOP DA SAN SANG VA DANG CHAY!
echo   Website:      http://localhost:3000
echo   Admin Panel:  http://localhost:3000/admin
echo ===================================================
echo.

start http://localhost:3000
call npm start
pause
