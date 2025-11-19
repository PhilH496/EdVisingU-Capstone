"""
Analysis Routes for BSWD Application Review
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum
import json

# Import existing chain setup
from .chain import get_or_create_chain, chat_with_memory
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import os

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


# ============================================================================
# TYPES
# ============================================================================

class ApplicationStatus(str, Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    NEEDS_MANUAL_REVIEW = "NEEDS MANUAL REVIEW"


class DeterministicCheckResult(BaseModel):
    has_disability: bool
    is_full_time: bool
    has_osap_restrictions: bool
    all_checks_passed: bool
    failed_checks: List[str]


class AIAnalysisResult(BaseModel):
    recommended_status: ApplicationStatus
    confidence_score: float
    funding_recommendation: Optional[float]
    risk_factors: List[str]
    strengths: List[str]
    requires_human_review: bool
    reasoning: str


class ApplicationAnalysis(BaseModel):
    application_id: str
    deterministic_checks: DeterministicCheckResult
    ai_analysis: AIAnalysisResult
    overall_status: ApplicationStatus
    analysis_timestamp: str


class ApplicationData(BaseModel):
    application_id: str
    student_id: str
    first_name: str
    last_name: str
    disability_type: str
    study_type: str
    has_osap_restrictions: bool
    federal_need: float
    provincial_need: float
    disability_verification_date: Optional[str] = None
    functional_limitations: List[str]
    needs_psycho_ed_assessment: bool
    requested_items: List[Dict[str, Any]]
    institution: str
    program: Optional[str] = None


# ============================================================================
# DETERMINISTIC CHECKS
# ============================================================================

def run_deterministic_checks(app_data: ApplicationData) -> DeterministicCheckResult:
    """
    Runs deterministic checks based on existing deterministicChecks.ts logic
    """
    # Check 1: Has verified disability (permanent or persistent-prolonged)
    has_disability = app_data.disability_type in ["permanent", "persistent-prolonged"]
    
    # Check 2: Is full-time student
    is_full_time = app_data.study_type == "full-time"
    
    # Check 3: No OSAP restrictions
    has_restrictions = app_data.has_osap_restrictions
    
    # Build failed checks list
    failed_checks = []
    if not has_disability:
        failed_checks.append("No verified permanent or persistent-prolonged disability")
    if not is_full_time:
        failed_checks.append("Not enrolled as full-time student")
    if has_restrictions:
        failed_checks.append("Has OSAP restrictions")
    
    # All checks must pass
    all_passed = has_disability and is_full_time and not has_restrictions
    
    return DeterministicCheckResult(
        has_disability=has_disability,
        is_full_time=is_full_time,
        has_osap_restrictions=has_restrictions,
        all_checks_passed=all_passed,
        failed_checks=failed_checks
    )


# ============================================================================
# AI ANALYSIS (GPT-4 call)
# ============================================================================

async def run_ai_analysis(
    app_data: ApplicationData,
    deterministic_result: DeterministicCheckResult
) -> AIAnalysisResult:
    """
    Runs AI analysis using GPT-4 to evaluate funding and risks
    """
    
    # Calculate total requested funding
    total_requested = sum(item.get("cost", 0) for item in app_data.requested_items)
    
    # Initialize GPT-4
    llm = ChatOpenAI(
        model="gpt-4-turbo-preview",
        temperature=0.3,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    
    # Create simple analysis prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a BSWD application analyst. Evaluate this application and respond ONLY with valid JSON.

        BSWD Guidelines:
        - Maximum funding: $8,000 per academic year
        - Equipment cap: $2,000 per item (except computers: $4,000)
        - Must have verified permanent/persistent disability
        - Must be full-time student
        - No OSAP restrictions

        JSON Response Format:
        {{
        "recommended_status": "APPROVED" | "REJECTED" | "NEEDS MANUAL REVIEW",
        "confidence_score": 0.0-1.0,
        "funding_recommendation": number or null,
        "risk_factors": ["risk1", "risk2"],
        "strengths": ["strength1", "strength2"],
        "requires_human_review": boolean,
        "reasoning": "brief explanation"
        }}"""),
                ("human", """Analyze this application:

        Student: {first_name} {last_name}
        Institution: {institution}
        Disability: {disability_type}
        Study Type: {study_type}

        Deterministic Checks:
        - Has disability: {has_disability}
        - Full-time: {is_full_time}
        - OSAP restrictions: {has_restrictions}
        - Failed checks: {failed_checks}

        Financial Need: ${federal_need} federal + ${provincial_need} provincial
        Requested Items: {num_items} items totaling ${total_requested}

        Provide analysis as JSON.""")
            ])
    
    # Format items for prompt
    items_detail = ", ".join([
        f"{item.get('item', 'Unknown')} (${item.get('cost', 0)})"
        for item in app_data.requested_items
    ]) if app_data.requested_items else "None"
    
    # Run analysis
    chain = prompt | llm
    response = await chain.ainvoke({
        "first_name": app_data.first_name,
        "last_name": app_data.last_name,
        "institution": app_data.institution,
        "disability_type": app_data.disability_type,
        "study_type": app_data.study_type,
        "has_disability": deterministic_result.has_disability,
        "is_full_time": deterministic_result.is_full_time,
        "has_restrictions": deterministic_result.has_osap_restrictions,
        "failed_checks": ", ".join(deterministic_result.failed_checks) or "None",
        "federal_need": app_data.federal_need,
        "provincial_need": app_data.provincial_need,
        "num_items": len(app_data.requested_items),
        "total_requested": total_requested
    })
    
    # Parse JSON response
    try:
        # Remove markdown code blocks if present
        response_text = response.content.replace("```json\n", "").replace("```\n", "").replace("```", "").strip()
        result = json.loads(response_text)
        return AIAnalysisResult(**result)
    except Exception as e:
        print(f"AI analysis parsing error: {e}")
        # Fallback
        return AIAnalysisResult(
            recommended_status=ApplicationStatus.NEEDS_MANUAL_REVIEW,
            confidence_score=0.5,
            funding_recommendation=None,
            risk_factors=["AI analysis failed - requires manual review"],
            strengths=[],
            requires_human_review=True,
            reasoning="Automated analysis encountered an error. Manual review required."
        )


# ============================================================================
# API ROUTES
# ============================================================================

@router.post("/application", response_model=ApplicationAnalysis)
async def analyze_application(app_data: ApplicationData):
    """
    Analyze a single application
    Returns deterministic checks + AI analysis
    """
    try:
        from datetime import datetime
        
        # Run deterministic checks
        deterministic_result = run_deterministic_checks(app_data)
        
        # Run AI analysis
        ai_result = await run_ai_analysis(app_data, deterministic_result)
        
        # Determine overall status
        if not deterministic_result.all_checks_passed:
            overall_status = ApplicationStatus.REJECTED
        elif ai_result.requires_human_review or ai_result.confidence_score < 0.6:
            overall_status = ApplicationStatus.NEEDS_MANUAL_REVIEW
        else:
            overall_status = ai_result.recommended_status
        
        return ApplicationAnalysis(
            application_id=app_data.application_id,
            deterministic_checks=deterministic_result,
            ai_analysis=ai_result,
            overall_status=overall_status,
            analysis_timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/batch")
async def analyze_batch(request: Dict[str, List[ApplicationData]]):
    """
    Analyze multiple applications
    """
    try:
        applications = request.get("applications", [])
        analyses = []
        
        for app_data in applications:
            analysis = await analyze_application(app_data)
            analyses.append(analysis)
        
        # Calculate statistics
        total = len(analyses)
        approved = sum(1 for a in analyses if a.overall_status == ApplicationStatus.APPROVED)
        rejected = sum(1 for a in analyses if a.overall_status == ApplicationStatus.REJECTED)
        manual_review = sum(1 for a in analyses if a.overall_status == ApplicationStatus.NEEDS_MANUAL_REVIEW)
        
        return {
            "total_applications": total,
            "approved": approved,
            "rejected": rejected,
            "needs_manual_review": manual_review,
            "approval_rate": approved / total if total > 0 else 0,
            "manual_review_rate": manual_review / total if total > 0 else 0,
            "analyses": analyses
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")


@router.post("/chat")
async def chat_about_application(request: Dict[str, Any]):
    """
    Chat about a specific application using your existing chain.py
    """
    try:
        app_id = request.get("application_id")
        app_data = request.get("application_data")
        message = request.get("message")
        
        # Create context from application data
        context = f"""Application Context:
Student: {app_data.get('first_name')} {app_data.get('last_name')}
ID: {app_data.get('student_id')}
Disability: {app_data.get('disability_type')}
Study Type: {app_data.get('study_type')}
OSAP Restrictions: {app_data.get('has_osap_restrictions')}
Financial Need: Federal ${app_data.get('federal_need')}, Provincial ${app_data.get('provincial_need')}
Requested Items: {len(app_data.get('requested_items', []))} items
"""
        
        # Get your existing conversation chain
        chain, memory = get_or_create_chain()
        
        # Combine context with user message
        full_message = f"{context}\n\nUser Question: {message}"
        
        # Get response using your existing chat_with_memory function
        response = chat_with_memory(chain, memory, full_message)
        
        return {
            "answer": response["answer"],
            "application_id": app_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")