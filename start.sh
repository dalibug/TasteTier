#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "Starting TasteTier Application..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        print_warning "Port $port is already in use. Attempting to free it..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
        if lsof -i :$port > /dev/null 2>&1; then
            print_status 1 "Failed to free port $port. Please free it manually and try again."
            exit 1
        fi
        print_status 0 "Successfully freed port $port"
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
            print_status 1 "$name failed to start after $max_attempts attempts"
            return 1
        fi
        echo "Waiting for $name... (attempt $((attempts+1))/$max_attempts)"
        sleep 2
        attempts=$((attempts+1))
    done
    print_status 0 "$name is ready!"
    return 0
}

# Create logs directory if it doesn't exist
mkdir -p backend/logs frontend/logs

# Check prerequisites
echo "Checking prerequisites..."

# Check if Docker and docker-compose are installed
for tool in docker docker-compose; do
    if ! command_exists $tool; then
        print_status 1 "$tool not found. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
        exit 1
    fi
done

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    print_warning "Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

# Check and free ports if needed
check_port 3000  # Frontend port
check_port 8083  # Backend port

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down > /dev/null 2>&1

# Build and start the containers
echo "Building and starting Docker containers..."
docker-compose up -d
if [ $? -ne 0 ]; then
    print_status 1 "Failed to start Docker containers"
    exit 1
fi

# Wait for services to be ready
if ! wait_for_service "http://localhost:8083/api/health" "Backend" 30; then
    print_status 1 "Backend failed to start. Check logs with: docker-compose logs backend"
    docker-compose down
    exit 1
fi

if ! wait_for_service "http://localhost:3000" "Frontend" 30; then
    print_status 1 "Frontend failed to start. Check logs with: docker-compose logs frontend"
    docker-compose down
    exit 1
fi

# Open application in browser
echo "Opening application in browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000
elif [[ "$OSTYPE" == "msys" ]]; then
    start http://localhost:3000
fi

print_status 0 "TasteTier is running in Docker containers!"
echo "Access the application at:"
echo -e "${GREEN}- Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}- Backend API: http://localhost:8083${NC}"
echo ""
echo "To view logs, use:"
echo -e "${YELLOW}- Backend: docker-compose logs backend${NC}"
echo -e "${YELLOW}- Frontend: docker-compose logs frontend${NC}"
echo ""
echo -e "${YELLOW}To stop the application, press Ctrl+C or run 'docker-compose down'${NC}"

# Function to cleanup containers on exit
cleanup() {
    echo ""
    echo "Stopping Docker containers..."
    docker-compose down
    print_status 0 "All containers stopped"
    exit 0
}

# Set up trap for cleanup
trap cleanup INT TERM

# Keep script running
while true; do
    sleep 1
done 