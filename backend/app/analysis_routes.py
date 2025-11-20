"""
Enhanced Analysis Routes with Financial Assessment
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime
import json
import os
# Import existing chain setup
from .chain import get_or_create_chain, chat_with_memory
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

# ============================================================================
# CONSTANTS
# ============================================================================

FUNDING_LIMITS = {
    "technology": {"bswd": 2000, "csg": 8000, "items": ["laptop", "computer", "tablet", "ipad"]},
    "software": {"bswd": 500, "csg": 2000, "items": ["software", "app", "subscription"]},
    "furniture": {"bswd": 1500, "csg": 0, "items": ["desk", "chair", "ergonomic"]},
    "assistive_tech": {"bswd": 3000, "csg": 8000, "items": ["screen reader", "dragon", "kurzweil"]},
    "tutoring": {"bswd": 2000, "csg": 8000, "items": ["tutor", "tutoring"]},
    "note_taking": {"bswd": 2000, "csg": 8000, "items": ["note-taker", "scribe"]},
}

ANNUAL_CAP = 22000

# ============================================================================
# MODELS
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

class FinancialAnalysis(BaseModel):
    total_need: float
    total_requested: float
    within_cap: bool
    utilization_rate: float
    exceeds_cap_by: float

class EquipmentIssue(BaseModel):
    item: str
    cost: float
    issue: str
    severity: str
    max_allowed: Optional[float] = None
    suggested_cost: Optional[float] = None

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
    financial_analysis: FinancialAnalysis
    equipment_review: List[EquipmentIssue]
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
    osap_application: str
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
# ANALYSIS FUNCTIONS
# ============================================================================

def run_deterministic_checks(app_data: ApplicationData) -> DeterministicCheckResult:
    """Check eligibility requirements"""
    has_disability = app_data.disability_type in ["permanent", "persistent-prolonged"]
    is_full_time = app_data.study_type == "full-time"
    has_restrictions = app_data.has_osap_restrictions
    
    failed_checks = []
    if not has_disability:
        failed_checks.append("No verified permanent or persistent-prolonged disability")
    if has_restrictions:
        failed_checks.append("Has OSAP restrictions")
    
    return DeterministicCheckResult(
        has_disability=has_disability,
        is_full_time=is_full_time,
        has_osap_restrictions=has_restrictions,
        all_checks_passed=has_disability and not has_restrictions,
        failed_checks=failed_checks
    )

def analyze_financial_need(app_data: ApplicationData) -> FinancialAnalysis:
    """Analyze financial metrics"""
    total_need = app_data.federal_need + app_data.provincial_need
    total_requested = sum(item.get("cost", 0) for item in app_data.requested_items)
    
    return FinancialAnalysis(
        total_need=total_need,
        total_requested=total_requested,
        within_cap=total_requested <= ANNUAL_CAP,
        utilization_rate=round((total_requested / total_need * 100), 2) if total_need > 0 else 0,
        exceeds_cap_by=max(0, total_requested - ANNUAL_CAP)
    )

def analyze_equipment_costs(app_data: ApplicationData) -> List[EquipmentIssue]:
    """Validate equipment against policy limits"""
    issues = []
    
    for item in app_data.requested_items:
        item_name = item.get("item", "").lower()
        item_cost = item.get("cost", 0)
        funding_source = item.get("funding_source", "bswd").lower()
        
        # Find matching category
        matched_category = next(
            (cat for cat, rules in FUNDING_LIMITS.items() 
             if any(keyword in item_name for keyword in rules["items"])),
            None
        )
        
        if not matched_category:
            continue
        
        limits = FUNDING_LIMITS[matched_category]
        max_allowed = limits.get(funding_source if funding_source in ["bswd", "csg"] else "bswd")
        
        if max_allowed == 0:
            issues.append(EquipmentIssue(
                item=item.get("item", "Unknown"),
                cost=item_cost,
                issue=f"{matched_category.replace('_', ' ').title()} not eligible for CSG-DSE",
                severity="violation"
            ))
        elif item_cost > max_allowed:
            issues.append(EquipmentIssue(
                item=item.get("item", "Unknown"),
                cost=item_cost,
                issue=f"Exceeds {funding_source.upper()} {matched_category.replace('_', ' ')} limit of ${max_allowed:,.0f}",
                severity="violation",
                max_allowed=max_allowed,
                suggested_cost=max_allowed
            ))
    
    return issues

def calculate_confidence_score(
    deterministic_result: DeterministicCheckResult,
    app_data: ApplicationData,
    financial_analysis: FinancialAnalysis,
    equipment_issues: List[EquipmentIssue]
) -> float:
    """Calculate confidence score (0-100)"""
    score = 100.0
    
    # Step 1: Eligibility (-33 each)
    if not deterministic_result.has_disability:
        score -= 33
    if deterministic_result.has_osap_restrictions:
        score -= 33
    
    score = max(0, score)
    
    # Step 2: Funding limits (-30 each)
    osap_type = getattr(app_data, 'osap_application', app_data.study_type).lower()
    eligible_for_csg = osap_type == "full-time"
    
    if app_data.provincial_need > 2000:
        score -= 30
    
    if app_data.federal_need > 0:
        if not eligible_for_csg:
            score -= 30
        elif app_data.federal_need > 20000:
            score -= 30
    
    score = max(0, score)
    
    # Step 3: Funding/Equipment ratio
    total_funding = financial_analysis.total_need
    equipment_cost = financial_analysis.total_requested
    
    if equipment_cost > 0:
        ratio = total_funding / equipment_cost
        
        if ratio >= 4.0:
            score -= 60
        elif ratio >= 2.0:
            score -= 30
        elif ratio > 1.2:
            score -= 15
        elif ratio >= 1.0:
            score -= int((ratio - 1.0) * 100 / 10) * 2
        elif ratio <= 0.5:
            score -= 15
        elif ratio < 1.0:
            score -= 5
    else:
        score -= 60
    
    return round(max(0, score), 1)

def generate_fallback_reasoning(
    confidence_score: float,
    recommended_status: ApplicationStatus,
    app_data: ApplicationData,
    total_funding: float,
    equipment_cost: float,
    ratio: float
) -> tuple[str, List[str]]:
    """Generate fallback reasoning and risk factors"""
    
    # Determine primary issue
    if app_data.provincial_need > 2000:
        reasoning = f"Score of {confidence_score}/100 results in {recommended_status}. Provincial funding request of ${app_data.provincial_need:,.2f} exceeds $2,000 BSWD limit (-30 penalty)."
        risk_factors = [f"Provincial funding ${app_data.provincial_need:,.2f} exceeds $2,000 limit"]
        
    elif app_data.federal_need > 0 and getattr(app_data, 'osap_application', '').lower() in ['part-time', 'none']:
        reasoning = f"Score of {confidence_score}/100 results in {recommended_status}. Federal funding request of ${app_data.federal_need:,.2f} present but student not eligible for CSG."
        risk_factors = [f"Federal funding ${app_data.federal_need:,.2f} when not eligible for CSG"]
        
    elif ratio > 1.2:
        excess = total_funding - equipment_cost
        reasoning = f"Score of {confidence_score}/100 results in {recommended_status}. Requesting ${total_funding:,.2f} in funding for ${equipment_cost:,.2f} in equipment, ${excess:,.2f} excess."
        risk_factors = [f"Funding exceeds equipment by ${excess:,.2f}"]
        
    elif ratio > 1.0:
        excess = total_funding - equipment_cost
        reasoning = f"Score of {confidence_score}/100 results in {recommended_status}. Funding request of ${total_funding:,.2f} slightly exceeds equipment costs of ${equipment_cost:,.2f}."
        risk_factors = [f"Funding exceeds equipment by ${excess:,.2f}"]
        
    elif ratio <= 0.5:
        gap = equipment_cost - total_funding
        reasoning = f"Score of {confidence_score}/100 results in {recommended_status}. Requesting ${total_funding:,.2f} in funding for ${equipment_cost:,.2f} in equipment, leaving ${gap:,.2f} gap."
        risk_factors = [f"Equipment costs ${gap:,.2f} more than funding (major gap)"]
        
    elif ratio < 1.0:
        gap = equipment_cost - total_funding
        reasoning = f"Score of {confidence_score}/100 results in {recommended_status}. Requesting ${total_funding:,.2f} in funding for ${equipment_cost:,.2f} in equipment, leaving ${gap:,.2f} gap."
        risk_factors = [f"Equipment costs ${gap:,.2f} more than funding requested"]
        
    else:
        reasoning = f"Score of {confidence_score}/100 results in {recommended_status}. Funding request of ${total_funding:,.2f} matches equipment costs."
        risk_factors = []
    
    return reasoning, risk_factors

async def run_ai_analysis(
    app_data: ApplicationData,
    deterministic_result: DeterministicCheckResult,
    financial_analysis: FinancialAnalysis,
    equipment_issues: List[EquipmentIssue]
) -> AIAnalysisResult:
    """Run AI analysis with confidence scoring"""
    
    confidence_score = calculate_confidence_score(
        deterministic_result, app_data, financial_analysis, equipment_issues
    )
    
    # Determine status
    if confidence_score >= 90:
        recommended_status = ApplicationStatus.APPROVED
        requires_human_review = False
    elif confidence_score >= 75:
        recommended_status = ApplicationStatus.NEEDS_MANUAL_REVIEW
        requires_human_review = True
    else:
        recommended_status = ApplicationStatus.REJECTED
        requires_human_review = confidence_score >= 60
    
    # Calculate metrics
    total_funding = app_data.provincial_need + app_data.federal_need
    equipment_cost = financial_analysis.total_requested
    ratio = (total_funding / equipment_cost) if equipment_cost > 0 else 0
    gap_amount = abs(total_funding - equipment_cost)
    
    # Try LLM reasoning
    llm = ChatOpenAI(
        model="gpt-4-turbo-preview",
        temperature=0.3,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a BSWD application analyst. Provide concise, factual analysis.

INSTRUCTIONS:
1. Write EXACTLY 2-3 sentences
2. Use precise dollar amounts
3. Be direct and factual

TERMINOLOGY:
- Ratio = Funding / Equipment
- Ratio < 1.0: funding gap (equipment costs more)
- Ratio > 1.0: funding excess (over-funded)

Format as JSON: {{"risk_factors": ["..."], "reasoning": "..."}}"""),
        
        ("human", """Score: {confidence_score}/100 → {status}

Student: {first_name} {last_name}
Equipment: ${equipment_cost:.2f}
Funding: ${total_funding:.2f} (Provincial: ${provincial_need:.2f}, Federal: ${federal_need:.2f})
Ratio: {ratio:.3f}
Gap/Excess: ${gap_amount:.2f}
Failed Checks: {failed_checks}

Provide JSON with "risk_factors" and "reasoning".""")
    ])
    
    try:
        response = await (prompt | llm).ainvoke({
            "confidence_score": confidence_score,
            "status": recommended_status.value,
            "first_name": app_data.first_name,
            "last_name": app_data.last_name,
            "osap_application": getattr(app_data, 'osap_application', 'unknown'),
            "provincial_need": app_data.provincial_need,
            "federal_need": app_data.federal_need,
            "total_funding": total_funding,
            "equipment_cost": equipment_cost,
            "ratio": ratio,
            "gap_amount": gap_amount,
            "failed_checks": ', '.join(deterministic_result.failed_checks) or 'None'
        })
        
        ai_data = json.loads(response.content.replace("```json", "").replace("```", "").strip())
        risk_factors = ai_data.get("risk_factors", [])
        reasoning = ai_data.get("reasoning", "")
        
    except Exception as e:
        print(f"AI reasoning failed: {e}")
        reasoning, risk_factors = generate_fallback_reasoning(
            confidence_score, recommended_status, app_data, 
            total_funding, equipment_cost, ratio
        )
    
    # Determine funding recommendation
    if recommended_status == ApplicationStatus.APPROVED:
        funding_recommendation = financial_analysis.total_requested
    elif recommended_status == ApplicationStatus.NEEDS_MANUAL_REVIEW:
        funding_recommendation = min(financial_analysis.total_requested, ANNUAL_CAP)
    else:
        funding_recommendation = None
    
    return AIAnalysisResult(
        recommended_status=recommended_status,
        confidence_score=confidence_score / 100.0,
        funding_recommendation=funding_recommendation,
        risk_factors=risk_factors,
        strengths=[],
        requires_human_review=requires_human_review,
        reasoning=reasoning
    )

# ============================================================================
# ROUTES
# ============================================================================

@router.post("/application", response_model=ApplicationAnalysis)
async def analyze_application(app_data: ApplicationData):
    """Analyze single application"""
    try:
        deterministic_result = run_deterministic_checks(app_data)
        financial_analysis = analyze_financial_need(app_data)
        equipment_issues = analyze_equipment_costs(app_data)
        ai_result = await run_ai_analysis(
            app_data, deterministic_result, financial_analysis, equipment_issues
        )
        
        return ApplicationAnalysis(
            application_id=app_data.application_id,
            deterministic_checks=deterministic_result,
            financial_analysis=financial_analysis,
            equipment_review=equipment_issues,
            ai_analysis=ai_result,
            overall_status=ai_result.recommended_status,
            analysis_timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/batch")
async def analyze_batch(request: Dict[str, List[ApplicationData]]):
    """Analyze multiple applications"""
    try:
        analyses = [await analyze_application(app) for app in request.get("applications", [])]
        
        total = len(analyses)
        status_counts = {
            status: sum(1 for a in analyses if a.overall_status == status)
            for status in ApplicationStatus
        }
        
        return {
            "total_applications": total,
            "approved": status_counts[ApplicationStatus.APPROVED],
            "rejected": status_counts[ApplicationStatus.REJECTED],
            "needs_manual_review": status_counts[ApplicationStatus.NEEDS_MANUAL_REVIEW],
            "approval_rate": status_counts[ApplicationStatus.APPROVED] / total if total > 0 else 0,
            "manual_review_rate": status_counts[ApplicationStatus.NEEDS_MANUAL_REVIEW] / total if total > 0 else 0,
            "analyses": analyses
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@router.post("/chat")
async def chat_about_application(request: Dict[str, Any]):
    """Chat about specific application"""
    try:
        app_data = request.get("application_data")
        context = f"""Application Context:
Student: {app_data.get('first_name')} {app_data.get('last_name')} (ID: {app_data.get('student_id')})
Disability: {app_data.get('disability_type')} | Study: {app_data.get('study_type')}
OSAP Restrictions: {app_data.get('has_osap_restrictions')}
Financial Need: Provincial ${app_data.get('provincial_need')}, Federal ${app_data.get('federal_need')}
Requested Items: {len(app_data.get('requested_items', []))} items
"""
        
        chain, memory = get_or_create_chain()
        response = chat_with_memory(chain, memory, f"{context}\n\nQuestion: {request.get('message')}")
        
        return {
            "answer": response["answer"],
            "application_id": request.get("application_id")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")