#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Lead Gen Automation - Quick Start${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${GREEN}✓ Starting Backend...${NC}"

# Start backend in background
if [ -d "backend" ]; then
    (cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 2>&1) &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠ Backend directory not found${NC}"
fi

sleep 2

echo -e "${GREEN}✓ Starting Frontend...${NC}"

# Start frontend in background
if [ -d "frontend" ]; then
    (cd frontend && npm run dev 2>&1) &
    FRONTEND_PID=$!
    echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠ Frontend directory not found${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}System is running!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Frontend:   http://localhost:3000"
echo "Backend:    http://localhost:8000"
echo "API Docs:   http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for both processes
wait
