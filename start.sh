#!/bin/bash

echo "Starting TasteTier Application..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        echo "Port $port is already in use. Attempting to free it..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
        if lsof -i :$port > /dev/null 2>&1; then
            echo "❌ Failed to free port $port. Please free it manually and try again."
            exit 1
        fi
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=$3
    local attempts=0
    
    echo "Waiting for $name to start..."
    while ! curl -s "$url" > /dev/null; do
        if [ $attempts -eq $max_attempts ]; then
            echo "❌ Error: $name failed to start after $max_attempts attempts"
            return 1
        fi
        echo "Waiting for $name... (attempt $((attempts+1))/$max_attempts)"
        sleep 2
        attempts=$((attempts+1))
    done
    echo "✅ $name is ready!"
    return 0
}

# Check prerequisites
echo "Checking prerequisites..."

# Check if Java is installed
if ! command_exists java; then
    echo "❌ Java not found. Please run ./setup.sh first"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm not found. Please run ./setup.sh first"
    exit 1
fi

# Check if backend is built
if [ ! -f "backend/build/libs/base-0.0.1-SNAPSHOT.jar" ]; then
    echo "❌ Backend not built. Please run ./setup.sh first"
    exit 1
fi

# Check and free ports if needed
check_port 3000
check_port 8083

# Start backend
echo "Starting backend..."
cd backend
./gradlew bootRun --console=plain > ../backend/logs/spring.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
if ! wait_for_service "http://localhost:8083" "Backend" 30; then
    echo "❌ Backend failed to start. Check backend/logs/spring.log for details."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

cd ../frontend

# Start frontend
echo "Starting frontend..."
BROWSER=none npm start > ../frontend/logs/react.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
if ! wait_for_service "http://localhost:3000" "Frontend" 30; then
    echo "❌ Frontend failed to start. Check frontend/logs/react.log for details."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

cd ..

# Open application in browser
echo "Opening application in browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000
elif [[ "$OSTYPE" == "msys" ]]; then
    start http://localhost:3000
fi

echo "✅ TasteTier is running!"
echo "Access the application at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8083"
echo ""
echo "Logs are available in:"
echo "- Backend: backend/logs/spring.log"
echo "- Frontend: frontend/logs/react.log"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup processes on exit
cleanup() {
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap for cleanup
trap cleanup INT TERM

# Wait for Ctrl+C
wait 