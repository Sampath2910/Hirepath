# =============================================================
# Stage 1: Build the Maven application
# =============================================================
FROM maven:3.8.5-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
# Download dependencies first for caching
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# =============================================================
# Stage 2: Run the application with Playwright support
# =============================================================
FROM mcr.microsoft.com/playwright/java:v1.43.0-jammy
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/hirepath-ai-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port (Render will automatically detect this, but we'll support dynamic $PORT too)
EXPOSE 8080

# Run the Spring Boot application with serial GC, custom RAM usage, and unbuffered output for immediate logs
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-Xss512k", "-XX:MaxRAMPercentage=75.0", "-Dsun.stdout.buffered=false", "-Dsun.stderr.buffered=false", "-jar", "app.jar"]
