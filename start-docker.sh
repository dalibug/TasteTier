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

# Clean any existing Docker cache to prevent platform issues
echo "Cleaning Docker cache..."
docker system prune -f

# Build the backend
echo "Building the backend..."
cd backend && ./gradlew clean build -x test

# Return to root directory
cd ..

# Rebuild containers with platform specification
echo "Rebuilding Docker containers..."
docker-compose build --no-cache

# Start everything
echo "Starting the Docker containers..."
docker-compose up -d

# Wait for services to be up
echo "Waiting for services to start..."
echo "This may take a minute..."
sleep 15

# Check if services are running
echo ""
echo "Checking service status:"
docker-compose ps

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