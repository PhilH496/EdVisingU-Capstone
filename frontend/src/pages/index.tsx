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
import Link from "next/link";
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

const DEV_MODE = process.env.NODE_ENV === "development";

export default function BSWDApplicationPage() {
  const [currentStep, setCurrentStep] = useState(DEV_MODE ? 1 : 1);
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
    osapApplicationStartDate: "",
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
    { stepName: "Student Info", stepIconFaClass: "fa-solid fa-user" },
    { stepName: "Program Info", stepIconFaClass: "fa-solid fa-user-graduate" },
    {
      stepName: "OSAP Info",
      stepIconFaClass: "fa-solid fa-money-check-dollar",
    },
    { stepName: "Disability Info", stepIconFaClass: "fa-solid fa-wheelchair" },
    {
      stepName: "Service & Equipment",
      stepIconFaClass: "fa-solid fa-wrench",
    },
    { stepName: "Review & Submit", stepIconFaClass: "fa-solid fa-receipt" },
  ];

  const TOTAL_STEPS = stepsInfo.length;

  const isStepComplete = (stepCheck: number): boolean => {
    switch (stepCheck) {
      case 1:
        return Boolean(
          formData.studentId &&
            formData.studentId.length >= 7 &&
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
            formData.hasOsapApplication !== null &&
            (!formData.hasOsapApplication ||
              (!!formData.osapApplicationStartDate &&
                formData.osapApplicationStartDate.trim() !== ""))
        );

      case 2: {
        if (formData.submittedDisabilityElsewhere === "yes") {
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

  const canProceed = useMemo(
    () => isStepComplete(currentStep) && !saving,
    [currentStep, formData, isConfirmed, saving]
  );

  const handleNext = async () => {
    if (!isStepComplete(currentStep)) return;

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      if (currentStep === maxStep) {
        setMaxStep((m) => m + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleStudentSubmit = async (): Promise<boolean> => {
    try {
      const [dayStr, monthStr, yearStr] = (formData.dateOfBirth || "").split(
        "/"
      );
      const day = Number(dayStr),
        month = Number(monthStr),
        year = Number(yearStr);

      if (!day || !month || !year) {
        setError("Invalid date of birth format. Use DD/MM/YYYY.");
        return false;
      }

      const birthDate = new Date(year, month - 1, day);
      const sin = formData.sin.replace(/\D/g, "");
      const phone = formData.phone.replace(/\D/g, "");

      const studentInfoData = {
        studentId: formData.studentId.trim(),
        oen: formData.oen,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: birthDate,
        sin,
        phone,
      };

      const parsed = StudentInfoSchema.safeParse(studentInfoData);
      if (!parsed.success) {
        console.error("Validation Error:", parsed.error);
        setError("Please review your Student Info. Some fields are invalid.");
        return false;
      }

      const dbPayload = {
        studentId: parsed.data.studentId,
        oen: parsed.data.oen,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        dateOfBirth: parsed.data.dateOfBirth.toISOString().slice(0, 10),
        sin: parsed.data.sin,
        phone, // ← use local `phone` instead of parsed.data.phone (avoids TS error)
        email: formData.email,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        country: formData.country,
        hasOsapApplication: !!formData.hasOsapApplication,
        osapApplicationStartDate: formData.osapApplicationStartDate || "",
      };

      await saveStudentInfo(dbPayload as any);
      return true;
    } catch (e: any) {
      console.error("Save error:", e);
      setError(
        e?.message
          ? String(e.message)
          : "Unexpected error while saving student info."
      );
      return false;
    }
  };

  const handleSubmit = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      const ok = await handleStudentSubmit();
      if (!ok) return;

      const now = new Date();
      const applicationData = {
        id: `APP-${now.getFullYear()}-${Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0")}`,
        studentName: `${formData.firstName} ${formData.lastName}`,
        studentId: formData.studentId,
        submittedDate: now.toISOString(),
        status: "submitted" as const,
        program: formData.program,
        institution: formData.institution,
        studyPeriod:
          formData.studyPeriodStart && formData.studyPeriodEnd
            ? `${formData.studyPeriodStart} - ${formData.studyPeriodEnd}`
            : "Not specified",
        statusUpdatedDate: now.toISOString(),
      };

      localStorage.setItem(
        `applicationDetail:${applicationData.id}`,
        JSON.stringify({ summary: applicationData, formData })
      );
      localStorage.setItem(
        "currentApplication",
        JSON.stringify(applicationData)
      );

      const existingRaw = localStorage.getItem("applications");
      const parsedExisting =
        existingRaw && Array.isArray(JSON.parse(existingRaw))
          ? (JSON.parse(existingRaw) as any[])
          : [];
      const next = [applicationData, ...parsedExisting];
      localStorage.setItem("applications", JSON.stringify(next));

      window.location.href = "/thank-you";
    } catch (e) {
      console.error(e);
      setError("Submission failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleStepClick = (step: number) => {
    if (!DEV_MODE && step > maxStep) return;
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
              disabled={!DEV_MODE && index + 1 > maxStep}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className="flex flex-col items-center"
            >
              <span
                className={`flex rounded-full justify-center items-center h-14 w-14 transition-colors font-medium ${
                  currentStep === index + 1
                    ? "bg-cyan-800 text-white"
                    : "bg-gray-100 text-black"
                } ${
                  !DEV_MODE && index + 1 > maxStep
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-cyan-700 hover:text-white"
                }`}
              >
                <i className={`${stepInfo.stepIconFaClass} text-[150%]`}></i>
              </span>
              <span
                className={
                  !DEV_MODE && index + 1 > maxStep ? "opacity-40" : ""
                }
              >
                {stepInfo.stepName}
              </span>
            </button>
          ))}
        </div>
      </div>
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

  return (
    <FormLayout
      title="BSWD/CSG-DSE Application Form"
      description="Complete application for Bursary for Students with Disabilities (BSWD) and Canada Student Grant for Services and Equipment"
    >
      <div className="mb-3 flex items-center justify-end">
        <Link
          href="/admin"
          className="px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-100"
        >
          Admin
        </Link>
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
