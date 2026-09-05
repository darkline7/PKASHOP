@echo off
title PKASHOP Launcher
cd /d "%~dp0"

echo ===================================================
echo             PKASHOP - 1-CLICK LAUNCHER
echo ===================================================
echo.

:: 1. Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js chua duoc cai dat!
    echo Vui long cai dat Node.js tu: https://nodejs.org
    pause
    exit /b 1
)

:: 2. Dong tien trinh cu tren port 3000 neu co
echo [1/5] Kiem tra port 3000...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>nul
)

:: 3. File cau hinh .env
if not exist ".env" (
    echo [2/5] Tao file cau hinh .env tu .env.example...
    copy .env.example .env >nul
) else (
    echo [2/5] File .env da san sang.
)

:: 4. Kiem tra va cai dat dependencies
if not exist "node_modules" (
    echo [3/5] Dang cai dat thu vien node_modules (npm install)...
    call npm install
) else (
    echo [3/5] Thu vien node_modules da san sang.
)

:: 5. Dong bo database Prisma
echo [4/5] Dong bo schema database Prisma...
call npx prisma generate
call npx prisma db push --accept-data-loss

:: 6. Kiem tra va build Next.js neu can
echo [5/5] Kiem tra ban build...
if not exist ".next" (
    echo Dang bien dich ban build dau tien (npm run build)...
    call npm run build
)

echo.
echo ===================================================
echo   PKASHOP DA SAN SANG!
echo   Website:      http://localhost:3000
echo   Admin Panel:  http://localhost:3000/admin
echo ===================================================
echo.

start http://localhost:3000
call npm start
pause


