/**
 * Admin Types
 * TypeScript interfaces for admin dashboard and detail pages
 */

import { FormData } from "@/types/bswd";
import { Dispatch, SetStateAction } from "react";
import { ApplicationStatus } from "@/components/admin/constants";

export type RequestedItem = {
  category?: string;
  item?: string;
  cost?: number | string;
  justification?: string;
  fundingSource?: string;
};

export interface DeterministicCheckResult {
  has_disability: boolean;
  is_full_time: boolean;
  has_osap_restrictions: boolean;
  all_checks_passed: boolean;
  failed_checks: string[];
}

export interface FinancialAnalysis {
  total_need: number;
  total_requested: number;
  within_cap: boolean;
}

export interface AIAnalysisResult {
  recommended_status: ApplicationStatus;
  confidence_score: number; // 0–1 from backend
  funding_recommendation: number | null;
  risk_factors: string[];
  requires_human_review: boolean;
  reasoning: string;
}

export interface ApplicationAnalysis {
  application_id: string;
  deterministic_checks: DeterministicCheckResult;
  ai_analysis: AIAnalysisResult;
  financial_analysis: FinancialAnalysis;
  overall_status: ApplicationStatus;
  analysis_timestamp: string;
}

export interface ApplicationData {
  application_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  disability_type: string;
  study_type: string;
  osap_application: string;
  has_osap_restrictions: boolean;
  federal_need: number;
  provincial_need: number;
  disability_verification_date?: string;
  functional_limitations: string[];
  needs_psycho_ed_assessment: boolean;
  requested_items: Array<{
    category: string;
    item: string;
    cost: number;
    funding_source: string;
  }>;
  institution: string;
  program?: string;
  analysis: {
    decision: string;
    confidence: number;
    reasoning: string;
    risk_factors: string[];
    recommended_funding: number;
  };
}

export type FormDataSetter = Dispatch<SetStateAction<FormData>>;