# SciFly FastAPI Deployment Guide

## Prerequisites

1. **Google Cloud SDK** installed and authenticated
2. **Docker** installed and running
3. **Google Cloud Project** created
4. **API Keys** for OpenAI, Groq, and Google AI

## Step-by-Step Deployment

### 1. Set up Environment Variables

Create an `env.local.yaml` file in the `agent/` directory with your API keys:

```bash
# Copy the template file
cp agent/env.yaml agent/env.local.yaml

# Edit the file with your actual API keys
```

Then edit `agent/env.local.yaml` with your actual values:

```yaml
# API Keys (Required)
OPENAI_API_KEY: "your_actual_openai_api_key"
GROQ_API_KEY: "your_actual_groq_api_key"
GOOGLE_API_KEY: "your_actual_google_api_key"

# LangSmith (Optional - for debugging)
LANGCHAIN_TRACING_V2: "false"
LANGCHAIN_API_KEY: "your_actual_langsmith_api_key"
LANGCHAIN_PROJECT: "scifly-agent"

# Server Configuration
PORT: "8080"
HOST: "0.0.0.0"
PYTHONPATH: "/app"

# CORS Origins (comma-separated)
ALLOWED_ORIGINS: "http://localhost:3000,http://localhost:3001,https://your-frontend-domain.com,https://scifly.web.app,https://scifly.firebaseapp.com"
```

**Important**: 
- The deployment script will automatically load these environment variables from the `env.local.yaml` file
- Never commit `env.local.yaml` to version control (it should be in `.gitignore`)
- The `env.yaml` file serves as a template

### 2. Update CORS Origins

Edit `agent/main.py` and update the `ALLOWED_ORIGINS` list with your actual frontend domain:

```python
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://your-actual-frontend-domain.com",  # Update this
    "https://scifly.web.app",
    "https://scifly.firebaseapp.com",
]
```

### 3. Deploy using the provided script

```bash
# Navigate to the agent/cloud-run directory
cd agent/cloud-run

# Make the script executable
chmod +x deploy.sh

# Deploy with your project details
./deploy.sh YOUR_PROJECT_ID scifly-api us-central1
```

### 4. Alternative: Manual Deployment

If you prefer to deploy manually:

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configure Docker
gcloud auth configure-docker

# Build and push image
cd agent
docker build -t gcr.io/YOUR_PROJECT_ID/scifly-api .
docker push gcr.io/YOUR_PROJECT_ID/scifly-api

# Deploy to Cloud Run
gcloud run deploy scifly-api \
    --image gcr.io/YOUR_PROJECT_ID/scifly-api \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars="PYTHONPATH=/app" \
    --set-env-vars="PORT=8080" \
    --set-env-vars="OPENAI_API_KEY=your_key" \
    --set-env-vars="GROQ_API_KEY=your_key" \
    --set-env-vars="GOOGLE_API_KEY=your_key"
```

## Environment Variables in Cloud Run

You can set environment variables in Cloud Run using:

```bash
gcloud run services update scifly-api \
    --region us-central1 \
    --set-env-vars="OPENAI_API_KEY=your_key,GROQ_API_KEY=your_key,GOOGLE_API_KEY=your_key"
```

## Testing Your Deployment

After deployment, test your endpoints:

```bash
# Get your service URL
SERVICE_URL=$(gcloud run services describe scifly-api --region=us-central1 --format='value(status.url)')

# Test health check
curl $SERVICE_URL/health

# Test CopilotKit endpoint
curl -X POST $SERVICE_URL/copilotkit \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

## Updating Your Frontend

Update your frontend API configuration to use the new Cloud Run URL:

```typescript
// In your frontend code
const API_BASE_URL = 'https://your-service-url.run.app';
```

## Monitoring and Logs

```bash
# View logs
gcloud logs tail --service=scifly-api --region=us-central1

# View service details
gcloud run services describe scifly-api --region=us-central1
```

## Troubleshooting

1. **Build fails**: Check Dockerfile and requirements.txt
2. **Runtime errors**: Check logs with `gcloud logs tail`
3. **CORS issues**: Verify ALLOWED_ORIGINS in main.py
4. **API key errors**: Ensure environment variables are set correctly

## Cost Optimization

- Set `--min-instances=0` to scale to zero when not in use
- Adjust `--max-instances` based on expected traffic
- Monitor usage in Google Cloud Console
