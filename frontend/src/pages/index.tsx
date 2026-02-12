/**
 * BSWDApplicationPage Component
 *
 * Main page component for the BSWD (Bursary for Students with Disabilities) application form.
 * Manages the multi-step form flow and overall form state.
 *
 * Features:
 * - Multi-step form navigation (6 total steps)
 * - Form data state management
 * - Step validation before allowing progression
 * - Saves data to Supabase ONLY on final submission
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FormData } from "@/types/bswd";
import { FormLayout } from "@/components/bswd/FormLayout";
import { StudentInfoStep } from "@/components/bswd/steps/StudentInfoStep";
import { FormNavigation } from "@/components/bswd/navigation/FormNavigation";
import { ProgramInfoStep } from "@/components/bswd/steps/ProgramInfoStep";
import { OsapInfoStep } from "@/components/bswd/steps/OsapInfoStep";
import { DisabilityInfoStep } from "@/components/bswd/steps/DisabilityInfoStep";
import { ServiceAndEquip } from "@/components/bswd/steps/ServiceAndEquip";
import { ReviewAndSubmit } from "@/components/bswd/steps/SubmitStep";
import { saveSubmission } from "@/lib/database";
import { saveSnapshotMerge, saveApplicationsList } from "@/lib/adminStore";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import Head from "next/head";

// Store all form data in a single state object
// Initial values are set to empty strings, zeros, or false depending on field type
function BSWDApplicationPage() {
  const { t, isLoaded } = useTranslation();
  const { signOut, profile, user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
    hasOsapApplication: undefined,
    institution: "",
    institutionType: "",
    program: "",
    code: "",
    studyPeriodStart: "",
    studyPeriodEnd: "",
    studyType: "",
    submittedDisabilityElsewhere: false,
    previousInstitution: "",
    osapApplicationStartDate: "Not provided",
    osapApplication: "full-time",
    restrictionType: "DEFAULT",
    queuedForManualReview: false,
    federalNeed: 0,
    provincialNeed: 0,
    hasOSAPRestrictions: false,
    restrictionDetails: "",
    osapOnFileStatus: "",

    hasVerifiedDisability: false,
    disabilityType: "not-verified",
    disabilityVerificationDate: "",
    functionalLimitations: [
      { name: "mobility", label: "Mobility", checked: false },
      { name: "vision", label: "Vision", checked: false },
      { name: "hearing", label: "Hearing", checked: false },
      { name: "learning", label: "Learning", checked: false },
      { name: "cognitive", label: "Cognitive", checked: false },
      { name: "mentalHealth", label: "Mental Health", checked: false },
      { name: "communication", label: "Communication", checked: false },
      { name: "dexterity", label: "Dexterity", checked: false },
      { name: "chronicPain", label: "Chronic Pain", checked: false },
      {
        name: "attention",
        label: "Attention/Concentration",
        checked: false,
      },
    ],
    needsPsychoEdAssessment: false,
    requestedItems: [],
  });

  const stepsInfo = [
    {
      stepName: t("steps.studentInfo"),
      stepIconFaClass: "fa-solid fa-user",
    },
    {
      stepName: t("steps.programInfo"),
      stepIconFaClass: "fa-solid fa-user-graduate",
    },
    {
      stepName: t("steps.osapInfo"),
      stepIconFaClass: "fa-solid fa-money-check-dollar",
    },
    {
      stepName: t("steps.disabilityInfo"),
      stepIconFaClass: "fa-solid fa-wheelchair",
    },
    {
      stepName: t("steps.serviceEquipment"),
      stepIconFaClass: "fa-solid fa-wrench",
    },
    {
      stepName: t("steps.review"),
      stepIconFaClass: "fa-solid fa-receipt",
    },
  ];

  const TOTAL_STEPS = stepsInfo.length;

  const isStepComplete = (stepCheck: number): boolean => {
    switch (stepCheck) {
      case 1:
        return Boolean(
          formData.studentId &&
            formData.studentId.length >= 7 &&
            formData.studentId.length <= 8 &&
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
            formData.postalCode.replace(/\s/g, "").length === 6 &&
            formData.country &&
            formData.hasOsapApplication !== undefined
        );

      case 2: {
        if (formData.submittedDisabilityElsewhere === true) {
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
        formData.osapOnFileStatus = "APPROVED"; // TEMP WILL EVENTUALLY COME BACK AND REMOVE THIS
        const hasChosenOnFile =
          formData.osapOnFileStatus === "APPROVED" ||
          formData.osapOnFileStatus === "NONE";

        const appTypeOk =
          formData.osapOnFileStatus === "APPROVED"
            ? formData.osapApplication !== "none"
            : true;

        const needsOk =
          formData.osapOnFileStatus === "APPROVED"
            ? !Number.isNaN(Number(formData.federalNeed)) &&
              !Number.isNaN(Number(formData.provincialNeed)) &&
              Number(formData.federalNeed) >= 0 &&
              Number(formData.provincialNeed) >= 0
            : true;

        const restrictionsOk = true;

        return hasChosenOnFile && appTypeOk && needsOk && restrictionsOk;
      }

      case 4: {
        if (formData.needsPsychoEdAssessment && !formData.email?.trim()) {
          return false;
        }
        return true;
      }

      case 5: {
        return true;
      }

      case 6: {
        return isConfirmed;
      }

      default:
        return false;
    }
  };

  const canProceed = useMemo(() => {
    return isStepComplete(currentStep) && !saving;
  }, [currentStep, formData, isConfirmed, saving]);

  const handleNext = async () => {
    if (!isStepComplete(currentStep)) return;

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      if (currentStep === maxStep) {
        setMaxStep((m) => m + 1);
      }
    } else {
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const result = await saveSubmission(formData);
      // Redirect to status page
      window.location.href = `/ThankYouPage?appId=${result.application_id}`;
    } catch (err) {
      // Handle submission errors
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to submit application. Please try again.";
      setError(errorMessage);
      setSaving(false);
      console.error("Submission error:", err);
    }
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

  function StepBar() {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const prevStepRef = useRef(currentStep);

    useEffect(() => {
      if (prevStepRef.current !== currentStep) {
        const el = scrollRef.current;
        const target = stepRefs.current[currentStep - 1];
        if (el && target) {
          target.scrollIntoView({
            behavior: "smooth",
            inline: "end",
            block: "nearest",
          });
        }
        prevStepRef.current = currentStep;
      }
    }, [currentStep]);

    return (
      <nav
        className="overflow-x-scroll pb-4 dark"
        id="scrollable_step_bar"
        ref={scrollRef}
      >
        <ul className="flex gap-10 w-max">
          {stepsInfo.map((stepInfo, index) => (
            <li key={stepInfo.stepName}>
              <button
                onClick={() => handleStepClick(index + 1)}
                disabled={index + 1 > maxStep}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                aria-describedby="locked-msg-program"
                className="flex flex-col items-center"
              >
                <span
                  className={`flex rounded-full  justify-center items-center h-14 w-14 transition-colors font-medium relative ${
                    currentStep === index + 1
                      ? "bg-cyan-800 text-white"
                      : "bg-gray-100 text-black"
                  } ${
                    index + 1 > maxStep
                      ? "cursor-not-allowed"
                      : "hover:bg-cyan-700 hover:text-white"
                  }`}
                >
                  <i className={`${stepInfo.stepIconFaClass} text-[150%]`}></i>
                  {/* display lock icon */}
                  {index + 1 > maxStep && (
                    <i className="fa-solid fa-lock absolute bottom-0 right-0 text-[#757575]"></i>
                  )}
                </span>
                <span className="dark:text-black">{stepInfo.stepName}</span>
              </button>
              <span id="locked-msg-program" className="sr-only">
                Locked. Complete previous step(s) to access.
              </span>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  useEffect(() => {
    if (!isStepComplete(currentStep)) {
      setMaxStep(currentStep);
    } else {
      setMaxStep(currentStep + 1);
      let stepCheck = currentStep + 1;
      while (stepCheck <= TOTAL_STEPS && isStepComplete(stepCheck)) {
        setMaxStep(stepCheck + 1);
        stepCheck++;
      }
    }
  }, [currentStep, formData, isConfirmed]);

  // Show loading while checking authentication
  if (loading || !user) {
    return <div>Loading...</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <FormLayout
        title={t('title')}
        description=""
        headerAction={
          <div className="flex items-center gap-3">
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-100"
              >
                {t('adminButton')}
              </Link>
            )}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-100 flex items-center gap-2"
              >
                <span>{profile?.full_name || profile?.email || user?.email || 'User'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    {profile?.full_name && (
                      <div className="font-medium text-gray-900 mb-1">{profile.full_name}</div>
                    )}
                    <div className="text-sm text-gray-600">{profile?.email || user?.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {profile?.role === 'admin' ? 'Administrator' : 'Student'}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await signOut();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    {t('logout') || 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      >
      <LanguageSwitcher />

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
    </div>
  );
}

export default function BSWDApplicationPageWithAuth() {
  return (
    <ProtectedRoute>
      <BSWDApplicationPage />
    </ProtectedRoute>
  );
}
