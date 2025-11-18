/**
 * Deterministic Rules Evaluation
 * 
 * Preprocessing logic for evaluating form data.
 * This is a minimal implementation that will be extended later
 */
import { FormData } from "@/types/bswd";

export interface DeterministicChecksResult {
  has_disability: boolean;
  is_full_time: boolean;
  has_osap_restrictions: boolean;
}

export class DeterministicChecks {
  /**
   * Runs deterministic checks on form data. If all these checks pass, then the student is eligible for funding.
   * @param formData - The form data to evaluate
   * @returns true if all checks pass, false otherwise
   */
  static runDeterministicChecks(formData: FormData): boolean {
    const has_disability = DeterministicChecks.hasDisability(formData.disabilityType);
    const is_full_time = DeterministicChecks.isFullTime(formData.studyType);
    const has_osap_restrictions = formData.hasOSAPRestrictions;

    return has_disability && is_full_time && !has_osap_restrictions;
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
}