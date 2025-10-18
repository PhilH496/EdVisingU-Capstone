// types/bswd.ts
// Type definitions for BSWD/CSG-DSE application form

export type ApplicationStatus = 'submitted' | 'in-review' | 'in-progress' | 'accepted' | 'denied';

export interface FormData {
  // Student Information
  studentId: string;
  oen: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sin: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  hasOsapApplication: boolean | null;
  
  // Program Information
  institution: string;
  institutionType: '' | 'public-ontario' | 'private-ontario';
  program: string;
  code: string;
  studyPeriodStart: string;
  studyPeriodEnd: string;
  studyType: '' | 'full-time' | 'part-time' | 'institution-funded-SB';
  submittedDisabilityElsewhere: 'yes' | 'no';
  previousInstitution: string;
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

  // Documents Information
  osapApplicationFiles?: File[];
  disabilityVerificationFiles?: File[];
  serviceRecommendationsFiles?: File[];
  psychoEdAssessmentSent: boolean | null;
  psychoEdAssessmentDate: string;
  restrictionSatisfied: boolean | null;
  restrictionSatisfiedDate: string;
  osapVerificationReceived: boolean | null;
  osapVerificationReceivedDate: string;
  osapApplicationActive: boolean | null;
  osapApplicationActiveDate: string;
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

export interface Application {
  id: string;
  studentName: string;
  studentId: string;
  submittedDate: string;
  status: ApplicationStatus;
  program: string;
  institution: string;
  studyPeriod: string;
  statusUpdatedDate: string;
}