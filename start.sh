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

# Function to check container status
check_container_status() {
    container_name=$1
    if [ "$(docker ps -q -f name=$container_name)" ]; then
        status=$(docker inspect -f '{{.State.Health.Status}}' $container_name)
        echo "$container_name status: $status"
        if [ "$status" = "healthy" ]; then
            return 0
        fi
    fi
    return 1
}

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
attempts=0
max_attempts=30
while ! check_container_status "mysql-container"; do
    if [ $attempts -eq $max_attempts ]; then
        echo "Error: MySQL failed to start after $max_attempts attempts"
        docker-compose logs mysql-container
        exit 1
    fi
    echo "Waiting for MySQL... (attempt $((attempts+1))/$max_attempts)"
    sleep 2
    attempts=$((attempts+1))
done

echo "MySQL is ready! Waiting for Spring Boot..."

# Function to check Spring Boot health
check_spring_boot() {
    response=$(curl -s http://localhost:8082/api/test-entities/test-connection 2>&1)
    if [[ $response == *"connection successful"* ]]; then
        return 0
    fi
    return 1
}

# Wait for Spring Boot with better error handling
attempts=0
max_attempts=30
while ! check_spring_boot; do
    if [ $attempts -eq $max_attempts ]; then
        echo "Error: Spring Boot failed to start after $max_attempts attempts"
        echo "Showing Spring Boot logs:"
        docker-compose logs springboot-app
        echo "Showing MySQL logs:"
        docker-compose logs mysql-container
        exit 1
    fi
    if [ $attempts -eq 0 ]; then
        echo "Waiting for Spring Boot to initialize..."
        docker-compose logs --tail=20 springboot-app
    fi
    echo "Waiting for Spring Boot... (attempt $((attempts+1))/$max_attempts)"
    sleep 3
    attempts=$((attempts+1))
    
    # Show Spring Boot logs every 5 attempts
    if [ $((attempts % 5)) -eq 0 ]; then
        echo "Recent Spring Boot logs:"
        docker-compose logs --tail=5 springboot-app
    fi
done

echo "Backend is ready!"

cd ..

# Start React development server
echo "Starting React application..."
cd frontend
BROWSER=none npm start &

# Wait for React to start
echo "Waiting for React to start..."
sleep 5

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
echo "- Backend API: http://localhost:8082"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
wait 