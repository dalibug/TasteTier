#!/bin/bash

echo "Setting up TasteTier development environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo "Checking system requirements..."

# Check for npm
if ! command_exists npm; then
    echo "❌ npm not found. Please install Node.js and npm first."
    echo "Visit: https://nodejs.org/"
    exit 1
else
    echo "✅ npm found"
fi

# Check for Docker
if ! command_exists docker; then
    echo "❌ Docker not found. Please install Docker first."
    echo "Visit: https://www.docker.com/products/docker-desktop"
    exit 1
else
    echo "✅ Docker found"
fi

# Check for Python3
if ! command_exists python3; then
    echo "❌ Python3 not found. Please install Python3 first."
    echo "Visit: https://www.python.org/downloads/"
    exit 1
else
    echo "✅ Python3 found"
fi

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    exit 1
else
    echo "✅ Docker daemon is running"
fi

echo "Setting up frontend..."
cd frontend

# Check if node_modules exists and package.json has changed
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
else
    echo "✅ Frontend dependencies are up to date"
fi

cd ../backend

# Check if Gradle wrapper exists
if [ ! -f "gradlew" ]; then
    echo "Initializing Gradle wrapper..."
    gradle wrapper
    if [ $? -ne 0 ]; then
        echo "❌ Failed to initialize Gradle wrapper"
        exit 1
    fi
fi

# Make gradlew executable
chmod +x gradlew

# Check if build is needed
if [ ! -d "build/libs" ] || [ build.gradle -nt build/libs/base-0.0.1-SNAPSHOT.jar ]; then
    echo "Building backend..."
    ./gradlew build -x test
    if [ $? -ne 0 ]; then
        echo "❌ Failed to build backend"
        exit 1
    fi
else
    echo "✅ Backend build is up to date"
fi

cd ..

echo "✅ Setup completed successfully!"
echo "You can now run ./start.sh to start the application" 