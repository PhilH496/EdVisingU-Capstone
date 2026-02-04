/**
 * Form Step Shims
 * Wrapper components for BSWD form steps used in admin detail page
 */

import { FormData } from "@/types/bswd";
import { StudentInfoStep } from "@/components/bswd/steps/StudentInfoStep";
import { ProgramInfoStep } from "@/components/bswd/steps/ProgramInfoStep";
import { OsapInfoStep } from "@/components/bswd/steps/OsapInfoStep";
import { DisabilityInfoStep } from "@/components/bswd/steps/DisabilityInfoStep";
import { ServiceAndEquip } from "@/components/bswd/steps/ServiceAndEquip";
import { ReviewAndSubmit } from "@/components/bswd/steps/SubmitStep";
import { FormDataSetter } from "@/lib/admin/types";
import { Dispatch, SetStateAction } from "react";

export const StudentInfoStepShim = ({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: FormDataSetter;
}) => <StudentInfoStep formData={formData} setFormData={setFormData} />;

export const ProgramInfoStepShim = ({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: FormDataSetter;
}) => <ProgramInfoStep formData={formData} setFormData={setFormData} />;

export const OsapInfoStepShim = ({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: FormDataSetter;
}) => <OsapInfoStep formData={formData} setFormData={setFormData} />;

export const DisabilityInfoStepShim = ({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: FormDataSetter;
}) => <DisabilityInfoStep formData={formData} setFormData={setFormData} />;

export const ServiceAndEquipShim = ({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: FormDataSetter;
}) => <ServiceAndEquip formData={formData} setFormData={setFormData} />;

export const ReviewAndSubmitShim = ({
  formData,
  setFormData,
  isConfirmed,
  setIsConfirmed,
}: {
  formData: FormData;
  setFormData: FormDataSetter;
  isConfirmed: boolean;
  setIsConfirmed: Dispatch<SetStateAction<boolean>>;
}) => (
  <ReviewAndSubmit
    formData={formData}
    setFormData={setFormData}
    isConfirmed={isConfirmed}
    setIsConfirmed={setIsConfirmed}
  />
);