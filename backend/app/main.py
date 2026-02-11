"""
FastAPI Backend for BSWD Chatbot
Integrates with LangChain RAG system and Pinecone
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager
import sys
import os
from mangum import Mangum

# Add the app directory to the path so we can import chain
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from chain import get_or_create_chain, chat_with_memory, chat_with_memory_stream
from analysis_routes import router as analysis_router
from admin_routes import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the conversation chain on startup"""
    try:
        print("Initializing chatbot chain...")
        chain, memory = get_or_create_chain()
        print("Chatbot chain initialized successfully!")
    except Exception as e:
        print(f"Error initializing chain: {str(e)}")
        raise
    
    yield  # Application runs here

app = FastAPI(
    title="BSWD Chatbot API",
    description="Backend API for BSWD Manual Chatbot with RAG",
    version="1.0.0",
    lifespan=lifespan 
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    answer: str
    source_documents: Optional[List[dict]] = []


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "BSWD Chatbot API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        chain, memory = get_or_create_chain()
        return {
            "status": "healthy",
            "chain_loaded": chain is not None,
            "memory_loaded": memory is not None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint
    
    Processes user messages and returns AI responses using RAG
    """
    try:
        # Get the conversation chain and memory
        chain, memory = get_or_create_chain()
        
        # Get response from chatbot
        response = chat_with_memory(chain, memory, request.message)
        
        # Format source documents - implement sources most likely on admin side later
        source_docs = []
        if response.get("source_documents"):
            source_docs = [
                {
                    "content": doc.page_content if hasattr(doc, "page_content") else str(doc),
                    "metadata": doc.metadata if hasattr(doc, "metadata") else {}
                }
                for doc in response["source_documents"]
            ]
        
        return ChatResponse(
            answer=response["answer"],
            source_documents=source_docs
        )
        
    except Exception as e:
        print(f"Error processing chat: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing your message: {str(e)}"
        )

@app.post("/api/chat-stream")
async def chat(request: ChatRequest):
    """
    Main chat endpoint for STUDENT chatbot stream
    """
    try:
        chain, memory = get_or_create_chain()
        return StreamingResponse(chat_with_memory_stream(chain, memory, request.message), media_type="text/plain; charset=utf-8")

        
    except Exception as e:
        print(f"Error processing chat: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing your message: {str(e)}"
        )

@app.post("/api/chat/reset")
async def reset_conversation():
    """Reset the conversation memory"""
    try:
        chain, memory = get_or_create_chain()
        memory.clear()
        return {"status": "success", "message": "Conversation history cleared"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error resetting conversation: {str(e)}"
        )
        
app.include_router(analysis_router)
app.include_router(admin_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

handler = Mangum(app)