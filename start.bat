@echo off
title PKASHOP - Dev Server
cd /d "%~dp0"

echo [1/4] Giai phong port 3000 neu dang bi chiem dung...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>nul
)

where git >nul 2>nul
if %errorlevel% equ 0 (
    if exist ".git" (
        echo [2/4] Dang cap nhat code moi nhat tu Git...
        git fetch --all
        git reset --hard origin/main
        git pull origin main
    ) else (
        echo [2/4] Khoi tao ket noi Git...
        git init
        git remote add origin https://github.com/darkline7/PKASHOP.git
        git fetch origin main
        git reset --hard origin/main
    )
)

if not exist "node_modules" (
    echo [3/4] Cai dat thu vien npm...
    call npm install
)

echo [4/4] Dong bo database Prisma...
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


