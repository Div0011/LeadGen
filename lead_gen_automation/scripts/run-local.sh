#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Lead Gen Automation - Local Run ==="

cd "$PROJECT_DIR"

echo "[1/5] Creating Python virtual environment..."
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
    echo "  Virtual environment created."
else
    echo "  Virtual environment already exists."
fi

echo "[2/5] Installing backend dependencies..."
source backend/venv/bin/activate
pip install -q -r backend/requirements.txt
echo "  Backend dependencies installed."

echo "[3/5] Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo "  Frontend dependencies installed."
else
    echo "  Frontend dependencies already installed."
fi
cd "$PROJECT_DIR"

echo "[4/5] Starting backend server..."
source backend/venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "  Backend running on http://localhost:8000 (PID: $BACKEND_PID)"

sleep 3

echo "[5/5] Starting frontend dev server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "  Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"

echo ""
echo "=== Services Started ==="
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."
echo ""

open http://localhost:3000 2>/dev/null || true

cleanup() {
    echo ""
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Done."
    exit 0
}

trap cleanup INT TERM

wait
