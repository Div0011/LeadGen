#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Lead Gen Automation - One-Time Setup ==="

cd "$PROJECT_DIR"

echo "[1/4] Setting up environment files..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "  Created backend/.env from .env.example"
else
    echo "  backend/.env already exists, skipping."
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local
    echo "  Created frontend/.env.local"
else
    echo "  frontend/.env.local already exists, skipping."
fi

echo "[2/4] Setting up backend dependencies..."
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
    echo "  Virtual environment created."
fi
source backend/venv/bin/activate
pip install -q -r backend/requirements.txt
echo "  Backend dependencies installed."

echo "[3/4] Setting up frontend dependencies..."
cd frontend
npm install
echo "  Frontend dependencies installed."
cd "$PROJECT_DIR"

echo "[4/4] Running database migrations..."
source backend/venv/bin/activate
cd backend
alembic upgrade head
echo "  Database migrations applied."
cd "$PROJECT_DIR"

echo ""
echo "=== Setup Complete ==="
echo "  Run 'bash scripts/run-local.sh' to start locally"
echo "  Or 'docker compose up -d' to start with Docker"
