#!/bin/bash
set -e

echo "Running database migrations..."
cd /app
alembic upgrade head
echo "Migrations completed successfully"

echo "Starting Uvicorn server..."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
