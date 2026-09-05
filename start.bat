@echo off
title PKASHOP - Dev Server
cd /d "%~dp0"

where git >nul 2>nul
if %errorlevel% equ 0 (
    echo [PKASHOP] Kiem tra va cap nhat code tu Git...
    git pull origin main
)

if not exist "node_modules" (
    echo [PKASHOP] Cai dat thu vien npm...
    call npm install
)

echo [PKASHOP] Dong bo database Prisma...
call npx prisma generate

if exist ".next\trace" (
    echo [PKASHOP] Don dep cache Next.js...
    rmdir /s /q .next 2>nul
)

echo [PKASHOP] Khoi dong may chu Dev tai http://localhost:3000 ...
echo.
start http://localhost:3000
call npm run dev

pause

