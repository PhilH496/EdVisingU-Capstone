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
 * - Saves data to Supabase after each step - REASSESS
 * - Dev mode: Skip to any step without saving (development only)
 */
import { useState, useMemo } from "react";
import { FormData } from "@/types/bswd";
import { FormLayout } from "@/components/bswd/FormLayout";
import { StudentInfoStep } from "@/components/bswd/steps/StudentInfoStep";
import { FormNavigation } from "@/components/bswd/navigation/FormNavigation";
import { ProgramInfoStep } from "@/components/bswd/steps/ProgramInfoStep";
import { OsapInfoStep } from "@/components/bswd/steps/OsapInfoStep";
import { DisabilityInfoStep } from "@/components/bswd/steps/DisabilityInfoStep";
import { DocumentsStep } from "@/components/bswd/steps/DocumentsStep";
import { ServiceAndEquip } from "@/components/bswd/steps/ServiceAndEquip";
import { ReviewAndSubmit } from "@/components/bswd/steps/Submit";
//import { saveStudentInfo, saveProgramInfo } from "@/lib/database"; // Database use later

const DEV_MODE = process.env.NODE_ENV === 'development';

// Store all form data in a single state object
// Initial values are set to empty strings, zeros, or false depending on field type
export default function BSWDApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [dbStudentId, setDbStudentId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
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
      case 1: return Boolean(formData.studentId && formData.fullName && formData.email && formData.oen.length === 9);
      case 2: return Boolean(formData.institution && formData.program);
      case 3: {
        // Step 3 (OSAP): require application type; if not 'none', needs must be >= 0
        // If restrictions are checked, details must be provided
        const hasType = !!formData.osapApplication; // 'full-time' | 'part-time' | 'none'
        const needsOk = formData.osapApplication === "none" || (!Number.isNaN(Number(formData.federalNeed)) && !Number.isNaN(Number(formData.provincialNeed)) && Number(formData.federalNeed) >= 0 && Number(formData.provincialNeed) >= 0);
        const restrictionsOk = !formData.hasOSAPRestrictions || String(formData.restrictionDetails ?? "").trim().length > 0;
        return hasType && needsOk && restrictionsOk;
      }
      case 7: {
        // Step 7 (Review and Submit): Check if confirmation checkbox is checked
        return isConfirmed;
      }
      default: return true;
    }
  };

  // Memoize canProceed to ensure it updates when isConfirmed changes
  const canProceed = useMemo(() => {
    return isStepComplete() && !saving;
  }, [currentStep, formData, isConfirmed, saving]);

  const handleNext = async () => {
    // Check if current step is complete before proceeding
    if (!isStepComplete()) {
      return;
    }

    /*
    try {
      setSaving(true);
      setError(null);

      if (currentStep === 1) {
        // Save student data and get back the student_id to link future data
        const studentId = await saveStudentInfo(formData);
        setDbStudentId(studentId);
      } else if (currentStep === 2) {
        // Use student_id from Step 1 to link this program info to the correct student
        if (!dbStudentId) throw new Error('Student ID not found. Please go back to Step 1.');
        await saveProgramInfo(dbStudentId, formData);
      }
        */

      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(prev => prev + 1);
      } else {
        // On the last step, handle submission
        setSaving(true);
        
        // Simulate API call to submit application
        setTimeout(() => {
          // Capture the exact submission time
          const currentDateTime = new Date();
          
          // Save form data to localStorage for the status page
          const applicationData = {
            id: `APP-${currentDateTime.getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
            studentName: formData.fullName,
            studentId: formData.studentId,
            submittedDate: currentDateTime.toISOString(),
            status: 'submitted' as const,
            program: formData.program,
            institution: formData.institution,
            studyPeriod: formData.studyPeriodStart && formData.studyPeriodEnd 
              ? `${formData.studyPeriodStart} - ${formData.studyPeriodEnd}`
              : 'Not specified',
            statusUpdatedDate: currentDateTime.toISOString()
          };
          
          localStorage.setItem('currentApplication', JSON.stringify(applicationData));
          
          setSaving(false);
          
          // Redirect to status page
          window.location.href = '/application-status';
        }, 2000);
      }
      /*
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
      */
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
      case 2:
        return <ProgramInfoStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <OsapInfoStep formData={formData} setFormData={setFormData} />;
      case 4:
        return <DisabilityInfoStep formData={formData} setFormData={setFormData} />;
      case 5:
        return <DocumentsStep formData={formData} setFormData={setFormData} />;
      case 6:
        return <ServiceAndEquip formData={formData} setFormData={setFormData} />;
      case 7:
        return <ReviewAndSubmit formData={formData} setFormData={setFormData} isConfirmed={isConfirmed} setIsConfirmed={setIsConfirmed} />;
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

      {DEV_MODE && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm font-medium text-yellow-800 mb-1">Dev Mode - Quick Navigation</p>
          <p className="text-xs text-yellow-700 mb-3">Click any step to skip directly</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map(step => (
              <button 
                key={step} 
                onClick={() => { 
                  setCurrentStep(step); 
                  if (step > 1) setDbStudentId(999); //testing for later
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentStep === step 
                    ? 'bg-yellow-400 text-yellow-900' 
                    : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {saving && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-600">Saving...</p>
        </div>
      )}

      {renderStep()}

      <FormNavigation
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canProceed={canProceed}
      />
    </FormLayout>
  );
}
