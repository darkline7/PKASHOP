@echo off
title PKASHOP - Production Build ^& Start
cd /d "%~dp0"

echo [1/4] Kiem tra port 3000...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>nul
)

if not exist "node_modules" (
    echo [2/4] Cai dat thu vien npm...
    call npm install
)

echo [3/4] Dong bo database Prisma...
call npx prisma generate
call npx prisma db push --accept-data-loss

echo [4/4] Don dep va bien dich ban build moi...
rmdir /s /q .next 2>nul
call npm run build

echo.
echo ========================================
echo   PKASHOP Production Server
echo   http://localhost:3000
echo ========================================
echo.
start http://localhost:3000
call npm start

pause



