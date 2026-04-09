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

# Check if we're in the right directory
if [ ! -d "lead_gen_automation" ]; then
    echo -e "${YELLOW}Running from: $SCRIPT_DIR${NC}"
    cd lead_gen_automation || { echo "Failed to cd to lead_gen_automation"; exit 1; }
fi

# Check if this is a production deployment (Railway/Render)
if [ "$RAILWAY_STATIC_URL" != "" ] || [ "$RENDER" != "" ]; then
    echo -e "${GREEN}✓ Production mode detected${NC}"
    echo -e "${GREEN}✓ Starting Backend only...${NC}"
    
    # Start only backend for production (Vercel handles frontend)
    if [ -d "backend" ]; then
        cd backend
        python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
    else
        echo -e "${YELLOW}⚠ Backend directory not found${NC}"
        exit 1
    fi
else
    # Local development mode - start both services
    echo -e "${GREEN}✓ Starting Backend...${NC}"

    # Start backend in background
    if [ -d "backend" ]; then
        (cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000 2>&1) &
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
fi
