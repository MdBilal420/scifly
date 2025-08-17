"""
Production FastAPI server for SciFly AI Agent
Deployed on Google Cloud Run
"""

import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitSDK, LangGraphAgent
from sample_agent.agent import graph

# Create FastAPI app
app = FastAPI(
    title="SciFly AI Agent API",
    description="AI-powered science tutor API for Grade 5 students",
    version="1.0.0"
)

# Configure CORS for production
# Update these origins with your actual frontend domains
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://your-frontend-domain.com",  # Update with your actual domain
    "https://scifly.web.app",  # If using Firebase Hosting
    "https://scifly.firebaseapp.com",  # If using Firebase Hosting
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"Response: {response.status_code}")
    return response

# Initialize CopilotKit SDK with LangGraph agent
class DebugGraph:
    def __init__(self, graph):
        self.graph = graph
    
    async def ainvoke(self, *args, **kwargs):
        try:
            return await self.graph.ainvoke(*args, **kwargs)
        except Exception as e:
            print(f"Error in graph execution: {e}")
            raise

debug_graph = DebugGraph(graph)

sdk = CopilotKitSDK(
    agents=[
        LangGraphAgent(
            name="scifly_agent",
            description="AI-powered science tutor for Grade 5 students",
            graph=debug_graph,
        )
    ],
)

# Add CopilotKit endpoint
add_fastapi_endpoint(app, sdk, "/copilotkit")

# Storybook generation endpoint
class StorybookRequest(BaseModel):
    prompt: str

@app.post("/generate-storybook")
def generate_storybook_endpoint(request: StorybookRequest):
    """Endpoint to generate a storybook."""
    try:
        # Your storybook generation logic here
        # This is a placeholder - implement your actual logic
        return {
            "success": True,
            "storybook": f"Generated storybook for: {request.prompt}"
        }
    except Exception as e:
        print(f"Error generating storybook: {e}")
        return {"success": False, "error": str(e)}

# Health check endpoint
@app.get("/health")
def health():
    """Health check endpoint for Cloud Run."""
    return {
        "status": "healthy",
        "service": "scifly-ai-agent",
        "version": "1.0.0"
    }

# Test agent endpoint
@app.post("/test-agent")
async def test_agent_endpoint():
    """Test the agent directly via HTTP"""
    try:
        result = await debug_graph.ainvoke({"messages": [{"role": "user", "content": "Hello!"}]})
        return {"success": True, "result": result}
    except Exception as e:
        print(f"Error testing agent: {e}")
        return {"success": False, "error": str(e)}

# Root endpoint
@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "message": "SciFly AI Agent API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "copilotkit": "/copilotkit",
            "generate-storybook": "/generate-storybook",
            "test-agent": "/test-agent"
        }
    }

if __name__ == "__main__":
    # Get port from environment variable (Cloud Run sets PORT)
    port = int(os.getenv("PORT", "8080"))
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload in production
        log_level="info"
    )

