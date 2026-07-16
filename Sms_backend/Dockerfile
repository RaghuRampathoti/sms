# ─── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom first for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Run ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=builder /app/target/*.jar app.jar

# Render injects PORT env var; default to 8080 locally
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
