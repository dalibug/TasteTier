#!/bin/bash

# Display welcome message
echo "==================================================="
echo "  TasteTier Docker Startup Script"
echo "==================================================="
echo "This script will:"
echo "1. Stop any running Docker containers"
echo "2. Build the backend"
echo "3. Rebuild Docker containers"
echo "4. Start everything up"
echo ""

# Stop any running containers
echo "Stopping any running Docker containers..."
docker-compose down

# Build the backend
echo "Building the backend..."
cd backend && ./gradlew build -x test

# Return to root directory
cd ..

# Rebuild containers
echo "Rebuilding Docker containers..."
docker-compose build

# Start everything
echo "Starting the Docker containers..."
docker-compose up -d

# Display status
echo ""
echo "==================================================="
echo "Containers are starting in the background."
echo "Frontend should be available at: http://localhost:3000"
echo "Backend API should be available at: http://localhost:8083"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop containers:"
echo "  docker-compose down"
echo "===================================================" 