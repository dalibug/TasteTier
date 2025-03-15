#!/bin/bash

echo "Starting TasteTier Application..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for npm
if ! command_exists npm; then
    echo "npm not found. Please install Node.js and npm first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Initialize frontend dependencies if needed
echo "Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
cd ..

# Initialize backend if needed
echo "Checking backend dependencies..."
cd backend
if [ ! -f "gradlew" ]; then
    echo "Gradle wrapper not found. Initializing Gradle..."
    gradle wrapper
fi

# Make gradlew executable
chmod +x gradlew

# Kill any existing processes on ports 3000 and 8083
echo "Cleaning up existing processes..."
lsof -i :3000,8083 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true

# Start Spring Boot in the background
echo "Starting Spring Boot application..."
./gradlew bootRun --console=plain &
SPRING_PID=$!

# Wait for Spring Boot to start
echo "Waiting for Spring Boot to initialize..."
attempts=0
max_attempts=30
while ! curl -s http://localhost:8083 > /dev/null; do
    if [ $attempts -eq $max_attempts ]; then
        echo "Error: Spring Boot failed to start after $max_attempts attempts"
        kill $SPRING_PID
        exit 1
    fi
    echo "Waiting for Spring Boot... (attempt $((attempts+1))/$max_attempts)"
    sleep 2
    attempts=$((attempts+1))
done

cd ..

# Start React development server
echo "Starting React application..."
cd frontend
BROWSER=none npm start &
REACT_PID=$!

# Wait for React to start
echo "Waiting for React to start..."
attempts=0
max_attempts=30
while ! curl -s http://localhost:3000 > /dev/null; do
    if [ $attempts -eq $max_attempts ]; then
        echo "Error: React failed to start after $max_attempts attempts"
        kill $SPRING_PID
        kill $REACT_PID
        exit 1
    fi
    echo "Waiting for React... (attempt $((attempts+1))/$max_attempts)"
    sleep 2
    attempts=$((attempts+1))
done

# Open React app in default browser
echo "Opening application in browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000
elif [[ "$OSTYPE" == "msys" ]]; then
    start http://localhost:3000
fi

echo "TasteTier is running!"
echo "Access the application at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8083"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup processes on exit
cleanup() {
    echo "Stopping services..."
    kill $SPRING_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    exit 0
}

# Set up trap for cleanup
trap cleanup INT TERM

# Wait for Ctrl+C
wait 