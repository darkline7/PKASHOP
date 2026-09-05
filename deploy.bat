@echo off
title PKASHOP - Production Build ^& Start
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

echo [PKASHOP] Don dep cache Next.js...
rmdir /s /q .next 2>nul

echo [PKASHOP] Bien dich production bundle...
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


