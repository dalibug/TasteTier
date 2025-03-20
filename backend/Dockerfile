# Use OpenJDK 17 as the base image with platform compatibility
FROM --platform=linux/amd64 eclipse-temurin:17-jdk-focal

# Set the working directory inside the container
WORKDIR /app

# Copy the application jar
COPY build/libs/*.jar /app/app.jar

# Expose port 8083 to match current configuration
EXPOSE 8083

# Environment variables for OAuth and other configurations
ENV SERVER_PORT=8083
ENV SPRING_PROFILES_ACTIVE=dev
ENV ALLOWED_ORIGINS=http://localhost:3000

# Run the application
CMD ["java", "-jar", "/app/app.jar"]




