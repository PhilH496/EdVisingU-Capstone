/**
 * Deterministic Rules Evaluation
 * 
 * Preprocessing logic for evaluating form data.
 * Includes eligibility checks and confidence scoring.
 */
import { FormData } from "@/types/bswd";

export interface DeterministicChecksResult {
  has_disability: boolean;
  is_full_time: boolean;
  has_osap_restrictions: boolean;
  all_checks_passed: boolean;
  failed_checks: string[];
  confidence_score: number; // 0-100 score
}

export class DeterministicChecks {
  /**
   * Runs deterministic checks on form data. If all these checks pass, then the student is eligible for funding.
   * @param formData - The form data to evaluate
   * @returns Detailed results including eligibility and confidence score
   */
  static runDeterministicChecks(formData: FormData): DeterministicChecksResult {
    const has_disability = DeterministicChecks.hasDisability(formData.disabilityType);
    const is_full_time = DeterministicChecks.isFullTime(formData.studyType);
    const has_osap_restrictions = formData.hasOSAPRestrictions;

    const failed_checks: string[] = [];
    if (!has_disability) {
      failed_checks.push("No verified permanent or persistent-prolonged disability");
    }
    if (!is_full_time) {
      failed_checks.push("Not enrolled as full-time student");
    }
    if (has_osap_restrictions) {
      failed_checks.push("Has OSAP restrictions");
    }

    const all_checks_passed = has_disability && is_full_time && !has_osap_restrictions;
    const confidence_score = DeterministicChecks.calculateConfidenceScore(formData);

    return {
      has_disability,
      is_full_time,
      has_osap_restrictions,
      all_checks_passed,
      failed_checks,
      confidence_score,
    };
  }

  // Calculates confidence score based on deterministic rules
  static calculateConfidenceScore(formData: FormData): number {
    let score = 100;

    const disabilityType = String(formData.disabilityType || "").toLowerCase().trim();
    const hasDisability = disabilityType === "permanent" || disabilityType === "persistent-prolonged";
    const isFullTime = DeterministicChecks.isFullTime(formData.studyType);
    const hasOSAPRestrictions = Boolean(formData.hasOSAPRestrictions);

    const provincialNeed = DeterministicChecks.parseNumber(formData.provincialNeed);
    const federalNeed = DeterministicChecks.parseNumber(formData.federalNeed);
    const totalFunding = provincialNeed + federalNeed;

    let osapType = String(formData.osapApplication || "").toLowerCase().trim();
    if (!osapType) {
      const studyType = String(formData.studyType || "").toLowerCase().trim();
      osapType = studyType || "unknown";
    }
    const eligibleForCSG = osapType === "full-time";

    // Step 1: Eligibility (-33 each) if fail
    if (!hasDisability) {
      score -= 33;
    }
    if (!isFullTime) {
      score -= 33;
    }
    if (hasOSAPRestrictions) {
      score -= 33;
    }

    if (score < 0) score = 0;

    // Step 2: Funding limits (-30 each) if fail on either and if need is true or not
    if (provincialNeed > 2000) {
      score -= 30;
    }

    if (federalNeed > 0) {
      if (!eligibleForCSG) {
        score -= 30;
      } else if (federalNeed > 20000) {
        score -= 30;
      }
    }
    if (score < 0) score = 0;

    // Step 3: Funding/Equipment ratio (uses total_need / total_requested)
    const requestedItems = Array.isArray(formData.requestedItems) ? formData.requestedItems : [];
    const equipmentCost = requestedItems.reduce(
      (sum, item) => sum + DeterministicChecks.parseNumber(item.cost),
      0
    );

    if (equipmentCost > 0) {
      const ratio = totalFunding / equipmentCost;

      if (ratio >= 4.0) {
        score -= 60;
      } else if (ratio >= 2.0) {
        score -= 30;
      } else if (ratio > 1.2) {
        score -= 15;
      } else if (ratio >= 1.0) {
        const overPercent = (ratio - 1.0) * 100;
        const tens = Math.floor(overPercent / 10); // 10% increments decrease
        score -= tens * 2; // -2 score per 10%
      } else if (ratio <= 0.5) {
        score -= 15;
      } else if (ratio < 1.0) {
        score -= 5;
      }
    } else {
      score -= 60;
    }

    if (score < 0) score = 0;

    return Math.round(score);
  }

  /**
   * Checks if the student has a verified permanent or persistent-prolonged disability
   */
  private static hasDisability(disabilityType: string): boolean {
    if (disabilityType == "permanent" || disabilityType == "persistent-prolonged") {
      return true;
    }
    return false;
  }

  /**
   * Checks if student is full time
   */
  private static isFullTime(studyType: string): boolean {
      if (studyType == "full-time") {
        return true;
      }
      return false;
  }

   //Safely parse number from any value
  private static parseNumber(value: any): number {
    if (value === null || value === undefined || value === "") return 0;
    const n = typeof value === "number" ? value : parseFloat(String(value));
    return Number.isNaN(n) ? 0 : n;
  }
}