@echo off
title PKASHOP - Dev Server
cd /d "%~dp0"

echo [1/3] Kiem tra port 3000
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>nul
)

if not exist "node_modules" (
    echo [2/3] Cai dat thu vien npm
    call npm install
)

echo [3/3] Dong bo database Prisma
call npx prisma generate
call npx prisma db push --accept-data-loss

if exist ".next\trace" (
    rmdir /s /q .next 2>nul
)

echo.
echo PKASHOP Dev dang khoi chay: http://localhost:3000
start http://localhost:3000
call npm run dev
pause




