#!/bin/bash

echo "Starting TasteTier Application..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check and install dependencies
echo "Checking dependencies..."

# Check for npm
if ! command_exists npm; then
    echo "npm not found. Please install Node.js and npm first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check for Docker
if ! command_exists docker; then
    echo "Docker not found. Please install Docker first."
    echo "Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check for Python3
if ! command_exists python3; then
    echo "Python3 not found. Please install Python3 first."
    echo "Visit: https://www.python.org/downloads/"
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

# Build the backend if needed
echo "Building backend..."
./gradlew build -x test

# Kill any existing processes on ports 3000 and 8082
echo "Cleaning up existing processes..."
lsof -i :3000,8082 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true

# Start backend services
echo "Starting backend services..."
docker-compose down

# Remove old containers and volumes to ensure clean start
echo "Cleaning up Docker resources..."
docker-compose rm -f
docker volume prune -f

# Start services
echo "Starting Docker services..."
docker-compose up -d

# Wait for MySQL to be healthy
echo "Waiting for MySQL to be ready..."
while ! docker ps | grep -q "mysql.*healthy"; do
    echo "Waiting for MySQL to become healthy..."
    sleep 2
done

echo "MySQL is ready!"
echo "Waiting for Spring Boot to start..."

# Wait for Spring Boot to be ready
while ! curl -s http://localhost:8082/login.html > /dev/null; do
    echo "Waiting for Spring Boot..."
    sleep 2
done

echo "Spring Boot is ready!"

cd ..

# Start React development server
echo "Starting React application..."
cd frontend
BROWSER=none npm start &

# Start static file server
echo "Starting welcome page server..."
python3 -m http.server 8000 &

# Wait for servers to be ready
echo "Waiting for servers to start..."
sleep 3

# Open welcome page in default browser
echo "Opening welcome page..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:8000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:8000
elif [[ "$OSTYPE" == "msys" ]]; then
    start http://localhost:8000
fi

echo "TasteTier is running!"
echo "Access the application at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8082"
echo "- Login page: http://localhost:8082/login.html"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
wait 