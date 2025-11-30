"""
LangChain setup module for embeddings, vectorstore, and conversation chain.
"""
from dotenv import load_dotenv
import os
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain.memory import ConversationBufferMemory
from pinecone import Pinecone
from langchain.chains import (
    create_history_aware_retriever,
    create_retrieval_chain,
)
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
load_dotenv()

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))


def get_embeddings():
    """
    Initialize and return OpenAI embeddings model.
    
    Returns:
        OpenAIEmbeddings: The embeddings model instance
    """
    return OpenAIEmbeddings(
        model="text-embedding-ada-002",
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )

def get_vectorstore(index_name: str):
    """
    Get the Pinecone vectorstore for the specified index.
    
    Args:
        index_name: Name of the Pinecone index
        
    Returns:
        PineconeVectorStore: The vectorstore instance
    """
    embeddings = get_embeddings()
    
    # Check if index exists
    if index_name not in pc.list_indexes().names():
        raise ValueError(f"Index '{index_name}' does not exist. Please run ingestion first.")
    
    vectorstore = PineconeVectorStore(
        embedding=embeddings,
        index_name=index_name
    )
    
    return vectorstore


def get_conversation_chain(vectorstore, index_name: str):
    """
    Create and return a conversational retrieval chain with memory.
    
    This chain handles conversational retrieval from the vectorstore,
    maintaining conversation history and retrieving relevant documents.
    
    Args:
        vectorstore: The Pinecone vectorstore instance
        index_name: Name of the Pinecone index
        
    Returns:
        tuple: (conversation_chain, memory) - The chain and memory instance
    """
    # Initialize the LLM
    llm = ChatOpenAI(
        model="gpt-4-turbo-preview",  # Fixed model name
        temperature=0.7,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    
    # Set up memory for conversation history
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="answer"
    )

    # Prompt for contextualizing questions based on chat history
    contextualize_q_system_prompt = """Given a chat history and the latest user question \
which might reference context in the chat history, formulate a standalone question \
which can be understood without the chat history. Do NOT answer the question, \
just reformulate it if needed and otherwise return it as is."""

    contextualize_q_prompt = ChatPromptTemplate.from_messages([
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    
    # Create history-aware retriever
    history_aware_retriever = create_history_aware_retriever(
        llm=llm,
        retriever=vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4}
        ),
        prompt=contextualize_q_prompt,
    )
    
    # Prompt for answering questions
    qa_system_prompt = """You are a helpful assistant for question-answering tasks about the BSWD manual. \
Use the following pieces of retrieved context to answer the question. \
If you don't know the answer based on the context, say that you don't know. \

CRITICAL RULES:
1. Maximum 2 sentences OR 1 sentence + bullet list
2. Each bullet should be concise but complete (15-20 words max)
3. Use official terminology - accuracy over brevity
4. Remove redundant phrases, but keep essential details
5. Use bullet symbol (•) NOT dashes (-)

Example format:

Brief intro (1 sentence).

- Short point one
- Short point two
- Short point three

{context}"""

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    
    # Create the question-answer chain
    question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
    
    # Create the full retrieval chain
    rag_chain = create_retrieval_chain(
        history_aware_retriever,
        question_answer_chain
    )
    
    return rag_chain, memory


def chat_with_memory(chain, memory, question: str):
    """
    Execute a chat query with memory management.
    
    Args:
        chain: The conversation chain
        memory: The conversation memory instance
        question: The user's question
        
    Returns:
        dict: Response containing 'answer' and 'context' (source documents)
    """
    # Get chat history from memory
    chat_history = memory.load_memory_variables({}).get("chat_history", [])
    
    # Invoke the chain
    response = chain.invoke({
        "input": question,
        "chat_history": chat_history
    })
    
    # Save to memory
    memory.save_context(
        {"input": question},
        {"answer": response["answer"]}
    )
    
    return {
        "answer": response["answer"],
        "source_documents": response.get("context", [])
    }


# Global conversation chain and memory instances
_conversation_chain = None
_memory = None


def get_or_create_chain():
    """
    Get or create the global conversation chain and memory instances.
    This ensures we reuse the same chain across requests.
    
    Returns:
        tuple: (chain, memory) - The conversation chain and memory instances
    """
    global _conversation_chain, _memory
    
    if _conversation_chain is None or _memory is None:
        index_name = os.getenv("PINECONE_INDEX_NAME", "bswd-manual")
        vectorstore = get_vectorstore(index_name)
        _conversation_chain, _memory = get_conversation_chain(vectorstore, index_name)
    
    return _conversation_chain, _memory