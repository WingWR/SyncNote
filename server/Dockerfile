# Backend multi-stage Dockerfile for SyncNote
# Build stage
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /workspace
# copy whole server context (parent pom + modules)
COPY . .
# Build only the boot module and its dependencies
RUN mvn -B -pl syncnote-boot -am -DskipTests package

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine AS runtime
WORKDIR /app
# copy built jar (first matching SNAPSHOT jar)
COPY --from=build /workspace/syncnote-boot/target/*SNAPSHOT.jar /app/app.jar
EXPOSE 8080
# Reasonable defaults: use a non-root user if desired (left as root for simplicity)
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
