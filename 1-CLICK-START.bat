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

:: 2. Dong server cu dang chay tren port 3000 de tranh bi khoa file
echo [1/6] Giai phong port 3000 neu co tien trinh cu dang chay...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>nul
)

:: 3. Kiem tra va keo code moi nhat tu Git
where git >nul 2>nul
if %errorlevel% equ 0 (
    if exist ".git" (
        echo [2/6] Dang cap nhat code moi nhat tu GitHub...
        git fetch --all
        git reset --hard origin/main
        git pull origin main
    ) else (
        echo [2/6] Thu muc nay chua duoc lien ket Git.
        echo Dang ket noi voi GitHub PKASHOP...
        git init
        git remote add origin https://github.com/darkline7/PKASHOP.git
        git fetch origin main
        git reset --hard origin/main
    )
) else (
    echo [2/6] Canh bao: May chua cai Git, bo qua cap nhat code tu GitHub.
)

:: 4. File cau hinh .env
if not exist ".env" (
    echo [3/6] Tao file cau hinh .env tu .env.example...
    copy .env.example .env >nul
) else (
    echo [3/6] File .env da san sang.
)

:: 5. Kiem tra va cai dat dependencies
if not exist "node_modules" (
    echo [4/6] Dang cai dat thu vien node_modules (npm install)...
    call npm install
) else (
    echo [4/6] Thu vien node_modules da co san.
)

:: 6. Dong bo database Prisma
echo [5/6] Dong bo schema database Prisma...
call npx prisma generate
call npx prisma db push --accept-data-loss

:: 7. Build lai code Next.js (BAT BUOC DE CHAY CODE MOI)
echo [6/6] Dang bien dich ban build moi nhat (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo [CANH BAO] npm run build gap loi, dang thu chay bang dev mode...
    start http://localhost:3000
    call npm run dev
    exit /b 0
)

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

