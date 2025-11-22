"""
Admin Chat Route - Context-aware RAG chatbot
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from .chain import get_or_create_chain, chat_with_memory

router = APIRouter(prefix="/api/admin", tags=["admin"])

# MODELS

class ChatMessage(BaseModel):
    role: str
    content: str

class AdminChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    application_context: Optional[Dict[str, Any]] = None
    analysis_context: Optional[Dict[str, Any]] = None

class AdminChatResponse(BaseModel):
    answer: str
    source_documents: Optional[List[dict]] = []

# HELPER FUNCTIONS

def format_currency(value: float) -> str:
    """Format dollar amount"""
    return f"${value:,.2f}"

def format_list(items: List[str], prefix: str = "  • ") -> str:
    """Format list items"""
    return '\n'.join(f"{prefix}{item}" for item in items) if items else "  None"

def format_items(items: List[Dict]) -> str:
    """Format requested items"""
    if not items:
        return "  None"
    return '\n'.join(
        f"  • {item.get('item', 'Unknown')}: {format_currency(item.get('cost', 0))} "
        f"({item.get('funding_source', 'N/A')})"
        for item in items
    )

def format_equipment_issues(issues: List[Dict]) -> str:
    """Format equipment issues"""
    if not issues:
        return "  None"
    return '\n'.join(
        f"  {'⚠️ WARNING' if issue.get('severity') == 'warning' else '❌ VIOLATION'}: "
        f"{issue.get('item', 'Unknown')} - {issue.get('issue', 'No details')} "
        f"(Cost: {format_currency(issue.get('cost', 0))})"
        for issue in issues
    )

def build_application_context(app: Dict[str, Any]) -> str:
    """Build application context section"""
    total_need = app.get('federal_need', 0) + app.get('provincial_need', 0)
    total_requested = sum(item.get('cost', 0) for item in app.get('requested_items', []))
    
    return f"""
    APPLICATION UNDER REVIEW:

    Student: {app.get('first_name', '')} {app.get('last_name', '')} (ID: {app.get('student_id', 'N/A')})
    Institution: {app.get('institution', 'N/A')} | Program: {app.get('program', 'N/A')}

    Enrollment & OSAP:
    - Study Type: {app.get('study_type', 'N/A')}
    - OSAP Application: {app.get('osap_application', 'N/A')}
    - OSAP Restrictions: {app.get('has_osap_restrictions', False)}

    Disability:
    - Type: {app.get('disability_type', 'N/A')}
    - Functional Limitations: {', '.join(app.get('functional_limitations', []))}

    Financial:
    - Provincial Need: {format_currency(app.get('provincial_need', 0))}
    - Federal Need: {format_currency(app.get('federal_need', 0))}
    - Total Need: {format_currency(total_need)}

    Requested Items ({len(app.get('requested_items', []))} total):
    {format_items(app.get('requested_items', []))}

    Total Requested: {format_currency(total_requested)}
    """

    def build_analysis_context(analysis: Dict[str, Any]) -> str:
        """Build analysis context section"""
        ai = analysis.get('ai_analysis', {})
        det = analysis.get('deterministic_checks', {})
        fin = analysis.get('financial_analysis', {})
        
        return f"""

    AI ANALYSIS RESULTS:

    Decision: {ai.get('recommended_status', 'N/A')}
    Confidence: {ai.get('confidence_score', 0) * 100:.0f}%

    Eligibility:
    - Verified Disability: {'✓ PASS' if det.get('has_disability') else '✗ FAIL'}
    - Full-Time Student: {'✓ PASS' if det.get('is_full_time') else '✗ FAIL'}
    - No OSAP Restrictions: {'✓ PASS' if not det.get('has_osap_restrictions') else '✗ FAIL'}

    Failed Checks:
    {format_list(det.get('failed_checks', []))}

    Financial:
    - Total Need: {format_currency(fin.get('total_need', 0))}
    - Total Requested: {format_currency(fin.get('total_requested', 0))}
    - Within $22K Cap: {'✓ YES' if fin.get('within_cap') else '✗ NO'}
    - Exceeds By: {format_currency(fin.get('exceeds_cap_by', 0))}

    Equipment Issues:
    {format_equipment_issues(analysis.get('equipment_review', []))}

    Risk Factors:
    {format_list(ai.get('risk_factors', []))}

    AI Reasoning:
    {ai.get('reasoning', 'N/A')}

    Recommended Funding: {format_currency(ai.get('funding_recommendation', 0) or 0)}
    """

    SYSTEM_INSTRUCTIONS = """
    Instructions: You are assisting a BSWD administrator. Use the BSWD manual knowledge and the application/analysis context to provide clear, policy-backed answers.

    CRITICAL TERMINOLOGY:
    - "Federal/Provincial Need" = FUNDING REQUESTED
    - "Requested Items" = EQUIPMENT/SERVICE COSTS
    - Total Funding = Provincial + Federal
    - Total Equipment = Sum of requested items
    - Ratio = Total Funding / Total Equipment

    CONFIDENCE SCORING SYSTEM:

    The scoring is deterministic and correct. When explaining:
    1. Walk through each step (Eligibility → Funding → Ratio)
    2. Cite specific penalties with dollar amounts
    3. Never suggest the logic might be wrong
    4. Explain manual overrides are available

    Funding Limits (by OSAP type):
    - Full-time OSAP: BSWD $2K (provincial) + CSG $20K (federal) = $22K max
    - Part-time OSAP: BSWD $2K (provincial) only, NO federal CSG
    - No OSAP: BSWD $2K (provincial) only, NO federal CSG

    Step 1 - Eligibility (-33 each):
    - No verified permanent/persistent disability
    - Has OSAP restrictions

    Step 2 - Funding Limits (-30 each, can stack):
    - Provincial funding > $2,000
    - Federal funding > $20,000 (full-time only)
    - Federal funding > $0 (part-time or no OSAP)

    Step 3 - Funding/Equipment Ratio (ratio = funding / equipment):
    - Ratio ≥ 4.0: -60 (severe over-funding)
    - Ratio ≥ 2.0: -30 (major over-funding)
    - Ratio > 1.2: -15 (funding exceeds equipment 21%+)
    - Ratio 1.0-1.2: -2 per 10% (funding 0-20% over equipment)
    - Ratio ≤ 0.5: -15 (major funding gap)
    - Ratio 0.5-1.0: -5 (minor funding gap)

    Thresholds: 90+=APPROVED | 75-89=MANUAL REVIEW | 0-74=REJECTED

    Examples:
    - Equipment $6,900, Funding $4,459 → Ratio 0.646 → Gap $2,441 → -5 → Score 95 → APPROVED
    - Equipment $6,900, Funding $10,000 → Ratio 1.449 → Excess $3,100 → -15 → Score 85 → MANUAL REVIEW
    """

# ROUTE

@router.post("/chat", response_model=AdminChatResponse)
async def admin_chat(request: AdminChatRequest):
    """
    Admin chatbot with BSWD manual access and application context
    """
    try:
        chain, memory = get_or_create_chain()
        
        # Build context
        context_parts = []
        
        if request.application_context:
            context_parts.append(build_application_context(request.application_context))
        
        if request.analysis_context:
            context_parts.append(build_analysis_context(request.analysis_context))
        
        # Combine context with question
        enhanced_message = (
            ''.join(context_parts) +
            f"\n\nADMIN QUESTION: {request.message}\n\n" +
            SYSTEM_INSTRUCTIONS +
            "\n\nNow answer the admin's question with confidence in the scoring system."
        )
        
        # Get response
        response = chat_with_memory(chain, memory, enhanced_message)
        
        # Format source documents
        source_docs = [
            {
                "content": doc.page_content if hasattr(doc, "page_content") else str(doc),
                "metadata": doc.metadata if hasattr(doc, "metadata") else {}
            }
            for doc in response.get("source_documents", [])
        ]
        
        return AdminChatResponse(
            answer=response["answer"],
            source_documents=source_docs
        )
        
    except Exception as e:
        print(f"Admin chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")