#!/bin/bash

# SciFly FastAPI Deployment Script for Google Cloud Run
# Usage: ./deploy.sh [PROJECT_ID] [SERVICE_NAME] [REGION]

set -e

# Configuration
PROJECT_ID=${1:-"bookingagent-466314"}  # Replace with your actual project ID
SERVICE_NAME=${2:-"scifly-api-demo"}
REGION=${3:-"us-central1"}
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting SciFly FastAPI deployment to Google Cloud Run${NC}"
echo "Project ID: ${PROJECT_ID}"
echo "Service Name: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "Image: ${IMAGE_NAME}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}📋 Setting Google Cloud project...${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configure Docker to use gcloud as a credential helper
echo -e "${YELLOW}🔐 Configuring Docker authentication...${NC}"
gcloud auth configure-docker

# Build the Docker image
echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
cd ..
docker build --platform linux/amd64 -t ${IMAGE_NAME} .

# Push the image to Google Container Registry
echo -e "${YELLOW}📤 Pushing image to Google Container Registry...${NC}"
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars="PYTHONPATH=/app"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
echo ""
echo -e "${YELLOW}📋 Available endpoints:${NC}"
echo "  Health Check: ${SERVICE_URL}/health"
echo "  API Root: ${SERVICE_URL}/"
echo "  CopilotKit: ${SERVICE_URL}/copilotkit"
echo "  Generate Storybook: ${SERVICE_URL}/generate-storybook"
echo "  Test Agent: ${SERVICE_URL}/test-agent"
echo ""
echo -e "${YELLOW}🔧 To update your frontend, change the API base URL to:${NC}"
echo "  ${SERVICE_URL}"
echo ""
echo -e "${GREEN}🎉 Your FastAPI server is now running on Google Cloud Run!${NC}"

