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

echo "Setting up TasteTier development environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check version number
version_greater_equal() {
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

# Function to check if Homebrew is installed and install if needed
check_homebrew() {
    if ! command_exists brew; then
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        if [ $? -ne 0 ]; then
            echo "Failed to install Homebrew. Please install manually from https://brew.sh/"
            exit 1
        fi
    fi
    print_status 0 "Homebrew is installed"
}

# Function to check Java installation
check_java() {
    if ! command_exists java; then
        echo "Java not found. Installing Java 17..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            check_homebrew
            brew install openjdk@17
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y openjdk-17-jdk
        else
            echo "Unsupported operating system. Please install Java 17 manually from https://adoptium.net/"
            exit 1
        fi
    fi
    
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
    if [[ ! $JAVA_VERSION =~ ^17 ]]; then
        print_status 1 "Java 17 is required. Current version: $JAVA_VERSION"
        exit 1
    fi
    print_status 0 "Java 17 is installed (Version: $JAVA_VERSION)"
}

# Function to check Node.js and npm
check_nodejs() {
    if ! command_exists node; then
        echo "Node.js not found. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            check_homebrew
            brew install node
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        else
            echo "Please install Node.js manually from https://nodejs.org/"
            exit 1
        fi
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    if ! version_greater_equal "$NODE_VERSION" "16.0.0"; then
        print_status 1 "Node.js version 16+ is required. Current version: $NODE_VERSION"
        exit 1
    fi
    print_status 0 "Node.js is installed (Version: $NODE_VERSION)"

    # Check npm
    if ! command_exists npm; then
        print_status 1 "npm is not installed"
        exit 1
    fi
    NPM_VERSION=$(npm -v)
    if ! version_greater_equal "$NPM_VERSION" "8.0.0"; then
        print_status 1 "npm version 8+ is required. Current version: $NPM_VERSION"
        echo "Updating npm..."
        npm install -g npm@latest
    fi
    print_status 0 "npm is installed (Version: $NPM_VERSION)"
}

# Function to check/install Docker
check_docker() {
    if ! command_exists docker; then
        echo "Docker not found. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            check_homebrew
            brew install --cask docker
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            rm get-docker.sh
        else
            echo "Please install Docker manually from https://www.docker.com/products/docker-desktop"
            exit 1
        fi
    fi
    
    # Check Docker version
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    if ! version_greater_equal "$DOCKER_VERSION" "20.0.0"; then
        print_status 1 "Docker version 20+ is required. Current version: $DOCKER_VERSION"
        exit 1
    fi
    print_status 0 "Docker is installed (Version: $DOCKER_VERSION)"

    # Check if Docker daemon is running
    if ! docker info > /dev/null 2>&1; then
        print_warning "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
    print_status 0 "Docker daemon is running"
}

# Function to check/install Gradle
check_gradle() {
    if ! command_exists gradle; then
        echo "Gradle not found. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            check_homebrew
            brew install gradle
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y gradle
        else
            echo "Please install Gradle manually from https://gradle.org/install/"
            exit 1
        fi
    fi
    
    GRADLE_VERSION=$(gradle --version | grep Gradle | cut -d' ' -f2)
    if ! version_greater_equal "$GRADLE_VERSION" "7.0"; then
        print_status 1 "Gradle version 7+ is required. Current version: $GRADLE_VERSION"
        exit 1
    fi
    print_status 0 "Gradle is installed (Version: $GRADLE_VERSION)"
}

# Function to check Git
check_git() {
    if ! command_exists git; then
        echo "Git not found. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            check_homebrew
            brew install git
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y git
        else
            echo "Please install Git manually from https://git-scm.com/"
            exit 1
        fi
    fi
    
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    if ! version_greater_equal "$GIT_VERSION" "2.0.0"; then
        print_status 1 "Git version 2+ is required. Current version: $GIT_VERSION"
        exit 1
    fi
    print_status 0 "Git is installed (Version: $GIT_VERSION)"
}

echo "Checking system requirements..."

# Check all required tools
check_git
check_java
check_nodejs
check_docker
check_gradle

echo "Setting up project components..."

# Setup frontend
echo "Setting up frontend..."
cd frontend || exit 1
npm install
if [ $? -ne 0 ]; then
    print_status 1 "Failed to install frontend dependencies"
    exit 1
fi
print_status 0 "Frontend dependencies installed"

# Setup backend
cd ../backend || exit 1
echo "Setting up backend..."

# Setup Gradle wrapper
if [ ! -f "gradlew" ]; then
    gradle wrapper
    if [ $? -ne 0 ]; then
        print_status 1 "Failed to initialize Gradle wrapper"
        exit 1
    fi
fi
chmod +x gradlew

# Build backend
./gradlew build -x test
if [ $? -ne 0 ]; then
    print_status 1 "Failed to build backend"
    exit 1
fi
print_status 0 "Backend built successfully"

cd ..

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p backend/logs
mkdir -p frontend/build

# Setup environment variables
echo "Setting up environment variables..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_status 0 "Created .env file from example"
        print_warning "Please update .env with your configuration"
    else
        print_warning "No .env.example found. Please create .env file manually"
    fi
fi

print_status 0 "Setup completed successfully!"
echo -e "${GREEN}You can now run ./start.sh to start the application${NC}" 