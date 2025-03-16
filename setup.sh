#!/bin/bash

echo "Setting up TasteTier development environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Java 17 is installed
check_java() {
    if ! command_exists java; then
        echo "❌ Java not found. Installing Java 17..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if command_exists brew; then
                brew install openjdk@17
            else
                echo "Homebrew is not installed. Please install Homebrew first:"
                echo "Visit: https://brew.sh/"
                exit 1
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y openjdk-17-jdk
        else
            echo "Unsupported operating system. Please install Java 17 manually."
            echo "Visit: https://adoptium.net/"
            exit 1
        fi
    else
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
        if [[ ! $JAVA_VERSION =~ ^17 ]]; then
            echo "❌ Java 17 is required. Current version: $JAVA_VERSION"
            echo "Please install Java 17 from: https://adoptium.net/"
            exit 1
        fi
    fi
    echo "✅ Java 17 found"
}

# Function to install Node.js and npm
install_nodejs() {
    echo "Installing Node.js and npm..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command_exists brew; then
            brew install node
        else
            echo "Homebrew is not installed. Please install Homebrew first:"
            echo "Visit: https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command_exists yum; then
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
        else
            echo "Unsupported package manager. Please install Node.js manually."
            echo "Visit: https://nodejs.org/"
            exit 1
        fi
    else
        echo "Unsupported operating system. Please install Node.js manually."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
}

# Function to install Docker
install_docker() {
    echo "Installing Docker..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install --cask docker
        else
            echo "Homebrew is not installed. Please install Homebrew first:"
            echo "Visit: https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        rm get-docker.sh
    else
        echo "Unsupported operating system. Please install Docker manually."
        echo "Visit: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
}

# Check system requirements
echo "Checking system requirements..."

# Check Java
check_java

# Check and install npm if needed
if ! command_exists npm; then
    echo "npm not found. Installing Node.js and npm..."
    install_nodejs
else
    echo "✅ npm found"
fi

# Check npm version
NPM_VERSION=$(npm -v)
if [[ ${NPM_VERSION%%.*} -lt 8 ]]; then
    echo "❌ npm version 8 or higher is required. Current version: $NPM_VERSION"
    echo "Please update npm: npm install -g npm@latest"
    exit 1
fi

# Check and install Docker if needed
if ! command_exists docker; then
    echo "Docker not found. Installing Docker..."
    install_docker
else
    echo "✅ Docker found"
fi

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo "⚠️ Docker daemon is not running. Please start Docker Desktop."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "You can start Docker Desktop from your Applications folder."
    fi
    exit 1
else
    echo "✅ Docker daemon is running"
fi

echo "Setting up frontend..."
cd frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ../backend

# Setup Gradle wrapper
echo "Setting up Gradle wrapper..."
if [ ! -f "gradlew" ]; then
    gradle wrapper
    if [ $? -ne 0 ]; then
        echo "❌ Failed to initialize Gradle wrapper"
        exit 1
    fi
fi

# Make gradlew executable
chmod +x gradlew

# Build backend
echo "Building backend..."
./gradlew build -x test
if [ $? -ne 0 ]; then
    echo "❌ Failed to build backend"
    exit 1
fi

cd ..

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p backend/logs
mkdir -p frontend/build

# Set up environment variables
echo "Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || echo "No .env.example found, creating new .env"
    echo "Created .env file. Please update it with your configuration."
fi

echo "✅ Setup completed successfully!"
echo "You can now run ./start.sh to start the application" 