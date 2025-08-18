#!/bin/bash

# SciFly FastAPI Deployment Script for Google Cloud Run
# Usage: ./deploy.sh [PROJECT_ID] [SERVICE_NAME] [REGION]

set -e

# Configuration
PROJECT_ID=${1:-"bookingagent-466314"}  # Replace with your actual project ID
SERVICE_NAME=${2:-"scifly-api"}
REGION=${3:-"us-central1"}
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Load environment variables from YAML file if it exists
if [ -f "../env.local.yaml" ]; then
    echo -e "${YELLOW}📋 Loading environment variables from env.local.yaml file...${NC}"
    # Use Python to parse YAML and export environment variables
    eval "$(python3 -c "
import yaml
import os
with open('../env.local.yaml', 'r') as file:
    env_vars = yaml.safe_load(file)
for key, value in env_vars.items():
    if isinstance(value, str):
        print(f'export {key}=\"{value}\"')
")"
elif [ -f "../env.yaml" ]; then
    echo -e "${YELLOW}⚠️  Found env.yaml but not env.local.yaml. Please copy env.yaml to env.local.yaml and fill in your actual values.${NC}"
    exit 1
else
    echo -e "${YELLOW}⚠️  No env.local.yaml file found. Please create one with your environment variables.${NC}"
    exit 1
fi

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

# Check if required environment variables are set
echo -e "${YELLOW}🔍 Checking environment variables...${NC}"
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ OPENAI_API_KEY is not set. Please set it in your env.local.yaml file.${NC}"
    exit 1
fi

if [ -z "$GROQ_API_KEY" ]; then
    echo -e "${RED}❌ GROQ_API_KEY is not set. Please set it in your env.local.yaml file.${NC}"
    exit 1
fi

if [ -z "$GOOGLE_API_KEY" ]; then
    echo -e "${RED}❌ GOOGLE_API_KEY is not set. Please set it in your env.local.yaml file.${NC}"
    exit 1
fi

if [ -z "$SERPER_API_KEY" ]; then
    echo -e "${RED}❌ SERPER_API_KEY is not set. Please set it in your env.local.yaml file.${NC}"
    exit 1
fi

if [ -z "$TAVILY_API_KEY" ]; then
    echo -e "${RED}❌ TAVILY_API_KEY is not set. Please set it in your env.local.yaml file.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required environment variables are set.${NC}"

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
    --set-env-vars="PYTHONPATH=/app" \
    --set-env-vars="HOST=0.0.0.0" \
    --set-env-vars="OPENAI_API_KEY=${OPENAI_API_KEY}" \
    --set-env-vars="GROQ_API_KEY=${GROQ_API_KEY}" \
    --set-env-vars="GOOGLE_API_KEY=${GOOGLE_API_KEY}" \
    --set-env-vars="SERPER_API_KEY=${SERPER_API_KEY}" \
    --set-env-vars="TAVILY_API_KEY=${TAVILY_API_KEY}" \
    --set-env-vars="LANGSMITH_TRACING=${LANGSMITH_TRACING:-false}" \
    --set-env-vars="LANGSMITH_ENDPOINT=${LANGSMITH_ENDPOINT}" \
    --set-env-vars="LANGSMITH_API_KEY=${LANGSMITH_API_KEY}" \
    --set-env-vars="LANGSMITH_PROJECT=${LANGSMITH_PROJECT:-scifly-agent}" \
    --set-env-vars="MODEL=${MODEL:-openai}" \
    --set-env-vars="RELOAD=${RELOAD:-true}"

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
echo "  Demo Agent: ${SERVICE_URL}/copilotkit (sample_agent)"
echo ""
echo -e "${YELLOW}🔧 To update your frontend, change the API base URL to:${NC}"
echo "  ${SERVICE_URL}"
echo ""
echo -e "${GREEN}🎉 Your FastAPI server is now running on Google Cloud Run!${NC}"

