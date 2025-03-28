#!/bin/bash

# Exit script on error
set -e

# Variables (replace with your actual values)
IMAGE_TAG="latest"                  # Replace with your desired tag (e.g., latest, v1.0.0)
DOCKER_USERNAME="adamf00"    # Replace with your Docker Hub username
DOCKER_REPO="sepricloud_db"      # Replace with your Docker Hub repository name

# Function to prompt for Docker Hub password
function docker_login() {
  echo "Logging in to Docker Hub..."
  read -sp "Enter Docker Hub password: " DOCKER_PASSWORD
  echo

  echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin
}

# Enable Buildx for multi-architecture builds
echo "Setting up Docker Buildx..."
docker buildx create --use --name multiarch_builder || echo "Buildx builder already exists."
docker buildx inspect multiarch_builder --bootstrap

# Build and push the multi-platform Docker image
echo "Building and pushing Docker image for amd64 and arm64..."
docker buildx build --platform linux/amd64,linux/arm64 \
  -t "$DOCKER_USERNAME/$DOCKER_REPO:$IMAGE_TAG" \
  --push .

echo "Docker image successfully built and pushed for amd64 and Raspberry Pi 5 (arm64)!"
