@echo off
title PKASHOP - Force Update tu GitHub
cd /d "%~dp0"

echo ===================================================
echo       DANG DONG BO CODE MOI NHAT TU GITHUB
echo ===================================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] VPS cua ban chua cai Git!
    echo Vui long tai va cai Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Neu chua co thu muc .git (do tai zip ve) thi khoi tao
if not exist ".git" (
    echo Thu muc chua co Git, dang lien ket GitHub...
    git init
    git remote add origin https://github.com/darkline7/PKASHOP.git
)

:: Giai phong port 3000
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>nul
)

echo Dang lay code moi nhat (force reset ve commit moi nhat)...
git fetch --all
git reset --hard origin/main
git pull origin main

echo.
echo Cai dat thu vien va dong bo database...
call npm install
call npx prisma generate
call npx prisma db push --accept-data-loss

echo.
echo Dang build lai ban moi nhat...
call npm run build

echo.
echo ===================================================
echo   HOAN TAT DONG BO! KHOI DONG SERVER...
echo ===================================================
echo.

start http://localhost:3000
call npm start
pause
