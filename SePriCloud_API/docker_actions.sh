#!/bin/bash

# Exit script on error
set -e

# Variables (replace with your actual values)
IMAGE_TAG="latest"                  # Replace with your desired tag (e.g., latest, v1.0.0)
DOCKER_USERNAME="adamf00"    # Replace with your Docker Hub username
DOCKER_REPO="sepricloud_api"      # Replace with your Docker Hub repository name

# Function to prompt for Docker Hub password
function docker_login() {
  echo "Logging in to Docker Hub..."
  read -sp "Enter Docker Hub password: " DOCKER_PASSWORD
  echo

  echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin
}

# Build the Docker image
echo "Building Docker image..."
docker build -t "$DOCKER_USERNAME/$DOCKER_REPO:$IMAGE_TAG" .

# Log in to Docker Hub
docker_login

# Push the Docker image to Docker Hub
echo "Pushing Docker image to Docker Hub..."
docker push "$DOCKER_USERNAME/$DOCKER_REPO:$IMAGE_TAG"

echo "Docker image successfully published to Docker Hub!"
