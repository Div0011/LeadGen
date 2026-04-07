#!/bin/bash
# Backend startup script - runs all required services

echo "🚀 Starting LeadGenius Backend Services..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

# Start containers
echo "📦 Starting Docker Compose services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 5

# Check if services are running
echo "✅ Checking service status..."
docker-compose ps

echo "🎉 All services started!"
echo ""
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
