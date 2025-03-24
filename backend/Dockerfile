FROM --platform=linux/amd64 eclipse-temurin:17-jdk-focal

WORKDIR /app

COPY build/libs/*.jar /app/app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
