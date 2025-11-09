"""
FastAPI Backend for BSWD Chatbot
Integrates with LangChain RAG system and Pinecone
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager
import sys
import os

# Add the app directory to the path so we can import chain
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Commented out temporarily due to Pinecone version issue
# from chain import get_or_create_chain, chat_with_memory

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the conversation chain on startup"""
    # Try to initialize chatbot, but don't fail if it doesn't work
    try:
        print("Initializing chatbot chain...")
        # Temporarily disabled due to Pinecone version issue
        # chain, memory = get_or_create_chain()
        print("⚠️  Chatbot chain initialization skipped (Pinecone version issue)")
    except Exception as e:
        print(f"⚠️  Warning: Could not initialize chatbot chain: {str(e)}")
        print("    Chatbot features will be unavailable.")
    
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
    allow_origins=[
        "http://localhost:3000",  # Next.js default
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
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
    return {
        "status": "healthy",
        "chatbot": "disabled (Pinecone version issue)"
    }


# Temporarily disabled due to Pinecone version issue
# @app.post("/api/chat", response_model=ChatResponse)
# async def chat(request: ChatRequest):
#     """Main chat endpoint - Processes user messages and returns AI responses using RAG"""
#     try:
#         chain, memory = get_or_create_chain()
#         response = chat_with_memory(chain, memory, request.message)
#         source_docs = []
#         if response.get("source_documents"):
#             source_docs = [
#                 {
#                     "content": doc.page_content if hasattr(doc, "page_content") else str(doc),
#                     "metadata": doc.metadata if hasattr(doc, "metadata") else {}
#                 }
#                 for doc in response["source_documents"]
#             ]
#         return ChatResponse(
#             answer=response["answer"],
#             source_documents=source_docs
#         )
#     except Exception as e:
#         print(f"Error processing chat: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Error processing your message: {str(e)}"
#         )


# @app.post("/api/chat/reset")
# async def reset_conversation():
#     """Reset the conversation memory"""
#     try:
#         chain, memory = get_or_create_chain()
#         memory.clear()
#         return {"status": "success", "message": "Conversation history cleared"}
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Error resetting conversation: {str(e)}"
#         )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)