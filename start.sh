#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "==================================================="
echo "            PKASHOP - VPS LAUNCHER"
echo "==================================================="

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "[1/4] Creating .env from .env.example..."
    cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
    echo "[2/4] Installing dependencies..."
    npm install
fi

echo "[3/4] Syncing Prisma database..."
npx prisma generate
if [ ! -f "prisma/dev.db" ]; then
    npx prisma db push --accept-data-loss
    node prisma/seed.js
fi

if [ ! -d ".next" ]; then
    echo "[4/4] Building production..."
    npm run build
fi

echo ""
echo "==================================================="
echo "  PKASHOP is RUNNING on http://localhost:3000"
echo "==================================================="
echo ""

npm start