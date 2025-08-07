"""
This serves the "sample_agent" agent. This is an example of self-hosting an agent
through our FastAPI integration. However, you can also host in LangGraph platform.
"""

import os
from dotenv import load_dotenv
load_dotenv() # pylint: disable=wrong-import-position

from IPython.display import Image, Markdown, display
from google import genai
from google.genai.types import GenerateContentConfig, Part
import base64        

LOCATION = "global"

client = genai.Client(vertexai=True, project="bookingagent-466314", location=LOCATION)
MODEL_ID = "gemini-2.0-flash-preview-image-generation"

# Debug: Check if environment variables are loaded
print(f"DEBUG: GROQ_API_KEY loaded: {'Yes' if os.getenv('GROQ_API_KEY') else 'No'}")
print(f"DEBUG: Environment variables loaded")

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitSDK, LangGraphAgent
from sample_agent.agent import graph

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React app origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add middleware to log all requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"DEBUG: Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"DEBUG: Response status: {response.status_code}")
    return response
print("DEBUG: Creating CopilotKit SDK with LangGraph agent")

# Add debug wrapper to see if CopilotKit calls the graph
class DebugGraph:
    def __init__(self, original_graph):
        self.original_graph = original_graph
    
    def __getattr__(self, name):
        return getattr(self.original_graph, name)
    
    async def ainvoke(self, *args, **kwargs):
        print(f"DEBUG: CopilotKit is calling graph.ainvoke with args: {args}, kwargs: {kwargs}")
        try:
            result = await self.original_graph.ainvoke(*args, **kwargs)
            print(f"DEBUG: Graph returned: {result}")
            return result
        except Exception as e:
            print(f"DEBUG: Graph error: {e}")
            raise

debug_graph = DebugGraph(graph)

sdk = CopilotKitSDK(
    agents=[
        LangGraphAgent(
            name="sample_agent",
            description="An example agent to use as a starting point for your own agent.",
            graph=debug_graph,
        )
    ],
)

print("DEBUG: CopilotKit SDK created successfully")

add_fastapi_endpoint(app, sdk, "/copilotkit")


class StorybookRequest(BaseModel):
    prompt: str


@app.post("/generate-storybook")
def generate_storybook_endpoint(request: StorybookRequest):
    """Endpoint to generate a storybook."""
    print("DEBUG: Generate storybook endpoint called")
    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=request.prompt,
            config=GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
                candidate_count=1,
                safety_settings=[
                    {"method": "PROBABILITY"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT"},
                    {"threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                ],
            ),
        )
        print("DEBUG: Response received from model")
        content_parts = []                                                                                                                                                    
        for part in response.candidates[0].content.parts:                                                                                                                     
            if part.text:                                                                                                                                                     
                content_parts.append({"type": "text", "data": part.text})                                                                                                     
            if part.inline_data:                                                                                                                                                 
                encoded_image = base64.b64encode(part.inline_data.data).decode("utf-8")                                                                                       
                content_parts.append({"type": "image", "data": encoded_image, "mime_type": part.inline_data.mime_type})                                                                                                                                                                                                                      
        return {"success": True, "storybook": content_parts} 
    except Exception as e:
        print(f"DEBUG: Generate storybook error: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


@app.get("/health")
def health():
    """Health check."""
    return {"status": "ok"}

@app.post("/test-agent")
async def test_agent_endpoint():
    """Test the agent directly via HTTP"""
    print("DEBUG: Test agent endpoint called")
    try:
        from langchain_core.messages import HumanMessage
        state = {"messages": [HumanMessage(content="Hello from test endpoint")]}
        result = await graph.ainvoke(state)
        return {"success": True, "response": result["messages"][-1].content}
    except Exception as e:
        print(f"DEBUG: Test agent error: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}

def main():
    """Run the uvicorn server."""
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "sample_agent.demo:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )