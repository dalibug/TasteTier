# Use OpenJDK 17 as the base image
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only if the file exists
COPY build/libs/*.jar /app/app.jar

# Expose port 8080
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "/app/app.jar"]




