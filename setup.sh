#!/bin/bash

echo "Setting up TasteTier development environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js and npm
install_nodejs() {
    echo "Installing Node.js and npm..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install node
        else
            echo "Homebrew is not installed. Please install Homebrew first:"
            echo "Visit: https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
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

# Function to install Python3
install_python3() {
    echo "Installing Python3..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install python3
        else
            echo "Homebrew is not installed. Please install Homebrew first:"
            echo "Visit: https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists apt; then
            sudo apt-get update
            sudo apt-get install -y python3 python3-pip
        elif command_exists yum; then
            sudo yum install -y python3 python3-pip
        else
            echo "Unsupported package manager. Please install Python3 manually."
            echo "Visit: https://www.python.org/downloads/"
            exit 1
        fi
    else
        echo "Unsupported operating system. Please install Python3 manually."
        echo "Visit: https://www.python.org/downloads/"
        exit 1
    fi
}

# Check for required tools
echo "Checking system requirements..."

# Check and install npm if needed
if ! command_exists npm; then
    echo "npm not found. Installing Node.js and npm..."
    install_nodejs
else
    echo "✅ npm found"
fi

# Check and install Docker if needed
if ! command_exists docker; then
    echo "Docker not found. Installing Docker..."
    install_docker
else
    echo "✅ Docker found"
fi

# Check and install Python3 if needed
if ! command_exists python3; then
    echo "Python3 not found. Installing Python3..."
    install_python3
else
    echo "✅ Python3 found"
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