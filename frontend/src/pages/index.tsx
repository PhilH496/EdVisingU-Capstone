/**
 * BSWDApplicationPage Component
 * 
 * Main page component for the BSWD (Bursary for Students with Disabilities) application form.
 * Manages the multi-step form flow and overall form state.
 * 
 * Features:
 * - Multi-step form navigation (7 total steps)
 * - Form data state management
 * - Step validation before allowing progression
 * - Conditional rendering of form steps - CHANGE to form PAGES?
 */
import { useState } from "react";
import { FormData } from "@/types/bswd";
import { FormLayout } from "@/components/bswd/FormLayout";
import { StudentInfoStep } from "@/components/bswd/steps/StudentInfoStep";
import { FormNavigation } from "@/components/bswd/navigation/FormNavigation";

// Store all form data in a single state object
// Initial values are set to empty strings, zeros, or false depending on field type
export default function BSWDApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    studentId: '',
    oen: '',
    fullName: '',
    dateOfBirth: '',
    sin: '',
    email: '',
    phone: '',
    address: '',
    institution: '',
    institutionType: 'public-ontario',
    program: '',
    studyPeriodStart: '',
    studyPeriodEnd: '',
    studyType: 'full-time',
    osapApplication: 'full-time',
    federalNeed: 0,
    provincialNeed: 0,
    hasOSAPRestrictions: false,
    restrictionDetails: '',
    hasVerifiedDisability: false,
    disabilityType: 'not-verified',
    disabilityVerificationDate: '',
    functionalLimitations: [],
    needsPsychoEdAssessment: false,
    requestedItems: []
  });

  const TOTAL_STEPS = 7;

  const isStepComplete = (): boolean => {
    switch (currentStep) {
      case 1:
        return Boolean(formData.studentId && formData.fullName && formData.email);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Handle form submission
      alert('Form submitted!');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StudentInfoStep formData={formData} setFormData={setFormData} />;
      default:
        return <div>Step {currentStep} - Coming soon</div>;
    }
  };

  return (
    <FormLayout
      title="BSWD/CSG-DSE Application Form"
      description="Complete application for Bursary for Students with Disabilities (BSWD) and Canada Student Grant for Services and Equipment"
    >
      <div className="mb-6">
        <p className="text-sm text-gray-600">Step {currentStep} of {TOTAL_STEPS}</p>
      </div>

      {renderStep()}

      <FormNavigation
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canProceed={isStepComplete()}
      />
    </FormLayout>
  );
}
