"""
Deterministic Checks Module
Eligibility validation and confidence scoring logic
"""

from pydantic import BaseModel
from typing import List

class DeterministicCheckResult(BaseModel):
    has_disability: bool
    is_full_time: bool
    has_osap_restrictions: bool
    all_checks_passed: bool
    failed_checks: List[str]

def run_deterministic_checks(disability_type: str, study_type: str, has_osap_restrictions: bool) -> DeterministicCheckResult:
    """Check eligibility requirements"""
    has_disability = disability_type in ["permanent", "persistent-prolonged"]
    is_full_time = study_type == "full-time"
    
    failed_checks = []
    if not has_disability:
        failed_checks.append("No verified permanent or persistent-prolonged disability")
    if not is_full_time:
        failed_checks.append("Not enrolled as full-time student")
    if has_osap_restrictions:
        failed_checks.append("Has OSAP restrictions")
    
    return DeterministicCheckResult(
        has_disability=has_disability,
        is_full_time=is_full_time,
        has_osap_restrictions=has_osap_restrictions,
        all_checks_passed=has_disability and is_full_time and not has_osap_restrictions,
        failed_checks=failed_checks
    )

def calculate_confidence_score(
    has_disability: bool,
    is_full_time: bool,
    has_osap_restrictions: bool,
    osap_application: str,
    provincial_need: float,
    federal_need: float,
    total_funding: float,
    equipment_cost: float
) -> float:
    """Calculate confidence score (0-100)"""
    score = 100.0
    
    # Step 1: Eligibility (-33 each)
    if not has_disability:
        score -= 33
    if not is_full_time:
        score -= 33
    if has_osap_restrictions:
        score -= 33
    
    # Step 2: Funding limits (-30 each)
    osap_type = osap_application.lower()
    eligible_for_csg = osap_type == "full-time"
    
    if provincial_need > 2000:
        score -= 30
    
    if federal_need > 0:
        if not eligible_for_csg:
            score -= 30
        elif federal_need > 20000:
            score -= 30
    
    # Step 3: Funding/Equipment ratio
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
    
    return max(0, score)