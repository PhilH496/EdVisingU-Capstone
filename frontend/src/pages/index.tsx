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
 * - Saves data to Supabase ONLY on final submission (Step 7)
 * - Dev mode: Skip to any step (development only)
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { FormData } from "@/types/bswd";
import { FormLayout } from "@/components/bswd/FormLayout";
import { StudentInfoStep } from "@/components/bswd/steps/StudentInfoStep";
import { FormNavigation } from "@/components/bswd/navigation/FormNavigation";
import { ProgramInfoStep } from "@/components/bswd/steps/ProgramInfoStep";
import { OsapInfoStep } from "@/components/bswd/steps/OsapInfoStep";
import { DisabilityInfoStep } from "@/components/bswd/steps/DisabilityInfoStep";
import { ServiceAndEquip } from "@/components/bswd/steps/ServiceAndEquip";
import { ReviewAndSubmit } from "@/components/bswd/steps/Submit";
import { StudentInfoSchema } from "@/schemas/StudentInfoSchema";
import { saveStudentInfo } from "@/lib/database";
//import { saveStudentInfo, saveProgramInfo } from "@/lib/database"; // Database use later - create functions in database.ts, take a look and edit if needed SQL in supabase.

const DEV_MODE = process.env.NODE_ENV === "development";

// Store all form data in a single state object
// Initial values are set to empty strings, zeros, or false depending on field type
export default function BSWDApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    studentId: "",
    oen: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sin: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Canada",
    hasOsapApplication: null,
    institution: "",
    institutionType: "",
    program: "",
    code: "",
    studyPeriodStart: "",
    studyPeriodEnd: "",
    studyType: "",
    submittedDisabilityElsewhere: "no",
    previousInstitution: "",
    osapApplication: "full-time",

    federalNeed: 0,
    provincialNeed: 0,
    hasOSAPRestrictions: false,
    restrictionDetails: "",
    hasVerifiedDisability: false,
    disabilityType: "not-verified",
    disabilityVerificationDate: "",
    functionalLimitations: [],
    needsPsychoEdAssessment: false,
    requestedItems: [],
  });

  const stepsInfo = [
    {
      stepName: "Student Info",
      stepIconFaClass: "fa-solid fa-user",
    },
    {
      stepName: "Program Info",
      stepIconFaClass: "fa-solid fa-user-graduate",
    },
    {
      stepName: "OSAP Info",
      stepIconFaClass: "fa-solid fa-money-check-dollar",
    },
    {
      stepName: "Disability Info",
      stepIconFaClass: "fa-solid fa-wheelchair",
    },
    {
      stepName: "Service & Equipment",
      stepIconFaClass: "fa-solid fa-wrench",
    },

    {
      stepName: "Review & Submit",
      stepIconFaClass: "fa-solid fa-receipt",
    },
  ];
  const TOTAL_STEPS = stepsInfo.length;

  const isStepComplete = (): boolean => {
    switch (currentStep) {
      case 1:
        return Boolean(
          formData.studentId &&
            formData.firstName &&
            formData.lastName &&
            formData.email &&
            formData.dateOfBirth &&
            formData.oen.length === 9 &&
            formData.sin.replace(/\D/g, "").length === 9 &&
            formData.address &&
            formData.city &&
            formData.province &&
            formData.postalCode &&
            formData.country &&
            formData.hasOsapApplication !== null
        );

      case 2: {
        if (formData.submittedDisabilityElsewhere === "yes") {
          formData.previousInstitution;
          return Boolean(
            formData.institution &&
              formData.institutionType &&
              formData.studyType &&
              formData.studyPeriodStart &&
              formData.studyPeriodEnd &&
              formData.previousInstitution
          );
        }
        return Boolean(
          formData.institution &&
            formData.institutionType &&
            formData.studyType &&
            formData.studyPeriodStart &&
            formData.studyPeriodEnd
        );
      }

      case 3: {
        // Step 3 (OSAP): require application type; if not 'none', needs must be >= 0
        // If restrictions are checked, details must be provided
        const hasChosenOnFile = formData.osapOnFileStatus === "APPROVED" || formData.osapOnFileStatus === "NONE";
        const appTypeOk = formData.osapOnFileStatus === "APPROVED" ? formData.osapApplication !== "none" : true;
        const needsOk = formData.osapOnFileStatus === "APPROVED" ? (!Number.isNaN(Number(formData.federalNeed)) && !Number.isNaN(Number(formData.provincialNeed)) && Number(formData.federalNeed) >= 0 && Number(formData.provincialNeed) >= 0) : true;
        const restrictionsOk = true; // Restrictions never block navigation
        return hasChosenOnFile && appTypeOk && needsOk && restrictionsOk;
      }
      case 7: {
        // Step 7 (Review and Submit): Check if confirmation checkbox is checked
        return isConfirmed;
      }
      default:
        return true;
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

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      // Increase max step when user processes to the next step
      // ** Only unlock new step when you click next on the last unlocked step **
      if (currentStep === maxStep) {
        setMaxStep((m) => m + 1);
      }
    } else {
      // On the last step, handle submission
      setSaving(true);

      // Simulate API call to submit application
      setTimeout(() => {
        // Capture the exact submission time
        const currentDateTime = new Date();

        // Save form data to localStorage for the status page
        const applicationData = {
          id: `APP-${currentDateTime.getFullYear()}-${Math.floor(
            Math.random() * 1000000
          )
            .toString()
            .padStart(6, "0")}`,
          studentName: `${formData.firstName} ${formData.lastName}`,
          studentId: formData.studentId,
          submittedDate: currentDateTime.toISOString(),
          status: "submitted" as const,
          program: formData.program,
          institution: formData.institution,
          studyPeriod:
            formData.studyPeriodStart && formData.studyPeriodEnd
              ? `${formData.studyPeriodStart} - ${formData.studyPeriodEnd}`
              : "Not specified",
          statusUpdatedDate: currentDateTime.toISOString(),
        };

        localStorage.setItem(
          "currentApplication",
          JSON.stringify(applicationData)
        );

        setSaving(false);

        // Redirect to status page
        window.location.href = "/application-status";
      }, 2000);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStudentSubmit = async () => {
    console.log(formData.sin);
    const [day, month, year] = formData.dateOfBirth.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const sin = formData.sin.replace(/-/g, "");
    const phone = formData.phone.replace(/\D/g, "");
    console.log(phone);
    const studentInfoData = {
      studentId: +formData.studentId,
      oen: formData.oen,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: birthDate,
      sin,
      phone,
    };
    const parsedStudentInfo = StudentInfoSchema.safeParse(studentInfoData);
    if (!parsedStudentInfo.success) {
      console.error("Validation Error:", parsedStudentInfo.error);
      return;
    }
    saveStudentInfo(formData);
    console.log("Submitted");
  };

  const handleSubmit = async () => {
    setSaving(true);
    // Mimic delaying when user submits [REMOVE LATER]
    await new Promise((r) => setTimeout(r, 2000));
    const results = await Promise.all([handleStudentSubmit()]);
    console.log(results);
    setSaving(false);
  };

  const handleStepClick = (step: number) => {
    if (step > maxStep) return;
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StudentInfoStep formData={formData} setFormData={setFormData} />
        );
      case 2:
        return (
          <ProgramInfoStep formData={formData} setFormData={setFormData} />
        );
      case 3:
        return <OsapInfoStep formData={formData} setFormData={setFormData} />;
      case 4:
        return (
          <DisabilityInfoStep formData={formData} setFormData={setFormData} />
        );
      case 5:
        return (
          <ServiceAndEquip formData={formData} setFormData={setFormData} />
        );
      case 6:
        return (
          <ReviewAndSubmit
            formData={formData}
            setFormData={setFormData}
            isConfirmed={isConfirmed}
            setIsConfirmed={setIsConfirmed}
          />
        );
      default:
        return <div>Step {currentStep} - Coming soon</div>;
    }
  };

  // Client component for step bar
  function StepBar() {
    "use client";
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
    useEffect(() => {
      const el = scrollRef.current;
      const target = stepRefs.current[currentStep - 1];
      if (el && target) {
        target.scrollIntoView({
          behavior: "smooth",
          inline: "end",
          block: "nearest",
        });
      }
    }, [currentStep]);
    return (
      <div
        className="overflow-x-scroll pb-4"
        id="scrollable_step_bar"
        ref={scrollRef}
      >
        <div className="flex gap-10 w-max">
          {stepsInfo.map((stepInfo, index) => (
            <button
              key={stepInfo.stepName}
              onClick={() => handleStepClick(index + 1)}
              disabled={index >= maxStep}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className="flex flex-col items-center"
            >
              <span
                className={`flex rounded-full  justify-center items-center h-14 w-14 transition-colors font-medium ${
                  currentStep === index + 1
                    ? "bg-cyan-800 text-white"
                    : "bg-gray-100 text-black"
                } ${
                  index + 1 > maxStep
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-cyan-700 hover:text-white"
                }`}
              >
                <i className={`${stepInfo.stepIconFaClass} text-[150%]`}></i>
              </span>
              <span className={index >= maxStep ? "opacity-40" : ""}>
                {stepInfo.stepName}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <FormLayout
      title="BSWD/CSG-DSE Application Form"
      description="Complete application for Bursary for Students with Disabilities (BSWD) and Canada Student Grant for Services and Equipment"
    >
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Step {currentStep} of {TOTAL_STEPS}
        </p>
      </div>
      <div className="mb-4 p-4 pb-2 py-6 border rounded-md">
        <StepBar />
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {saving && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-600">
            Submitting your application to the database...
          </p>
        </div>
      )}

      {renderStep()}

      <FormNavigation
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSubmit={handleSubmit}
        canProceed={canProceed}
      />
    </FormLayout>
  );
}
