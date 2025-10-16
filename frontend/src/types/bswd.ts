// types/bswd.ts
// Type definitions for BSWD/CSG-DSE application form

export interface FormData {
  // Student Information
  studentId: string;
  oen: string;
  fullName: string;
  dateOfBirth: string;
  sin: string;
  email: string;
  phone: string;
  address: string;

  // Program Information
  institution: string;
  institutionType: '' | 'public-ontario' | 'private-ontario';
  program: string;
  code: string;
  studyPeriodStart: string;
  studyPeriodEnd: string;
  studyType: '' | 'full-time' | 'part-time';

  // OSAP Information
  osapApplication: 'full-time' | 'part-time' | 'none';
  federalNeed: number;
  provincialNeed: number;
  hasOSAPRestrictions: boolean;
  restrictionDetails: string;

  // Disability Information
  hasVerifiedDisability: boolean;
  disabilityType: 'permanent' | 'persistent-prolonged' | 'not-verified';
  disabilityVerificationDate: string;
  functionalLimitations: string[];
  needsPsychoEdAssessment: boolean;

  // Requested Services & Equipment
  requestedItems: RequestedItem[];
}

export interface RequestedItem {
  category: string;
  item: string;
  cost: number;
  justification: string;
  fundingSource: 'bswd' | 'csg-dse' | 'both';
}

export interface RiskAssessment {
  score: number;
  level: 'Low' | 'Medium' | 'High';
  factors: string[];
}