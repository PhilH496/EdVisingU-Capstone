/**
 * Step 6: Review and Submit Component
 *
 * Last step of the BSWD application form that reviews and submits the students information
 */

import { FormData } from "@/types/bswd";
import { FileText, User, GraduationCap, DollarSign, Heart } from "lucide-react";
import { useTranslation } from "@/lib/i18n"; // translation
import { use, useTransition } from "react";

interface ReviewAndSubmitProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  isConfirmed: boolean;
  setIsConfirmed: (confirmed: boolean) => void;
}

export function ReviewAndSubmit({formData, isConfirmed, setIsConfirmed}: ReviewAndSubmitProps) {
  const { t, isLoaded } = useTranslation();
  if (!isLoaded) return null;
  // Normalize functionalLimitations so filter/map are always safe
const rawLimits = formData.functionalLimitations;
  

let functionalLimitationLabels: string[] = [];

// 1) If it's an array
if (Array.isArray(rawLimits)) {
  functionalLimitationLabels = rawLimits
    .map((lim) => {
      if (typeof lim === "string") return lim;

      if (lim && typeof lim === "object") {
        // normal case
        if (lim.checked && lim.label) return lim.label;

        // fallback: if admin UI saved only the name
        if (lim.checked && lim.name) return lim.name;
      }

      return null;
    })
    .filter(Boolean) as string[];
}

// 2) If it's an object (backend or admin wrote it like {mobility:true})
else if (rawLimits && typeof rawLimits === "object") {
  functionalLimitationLabels = Object.entries(rawLimits)
    .filter(([_, v]) => Boolean(v))
    .map(([key]) => key);
}

const formatYesNoNotProvided = (value: boolean | undefined | null) => { // translation helper
  if (value === true) return t("common.yes");
  if (value === false) return t("common.no");
  return t("review.notProvided");
};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("review.title")}
        </h2>
        <p className="text-gray-600">
          {t("review.description")}
        </p>
      </div>

      {/* Student Information Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-brand-dark-blue" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t("review.sections.studentInfo")}
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.studentId")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-studentID" className="font-medium text-gray-900">
              {formData.studentId || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.oen")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-oen" className="font-medium text-gray-900">
              {formData.oen || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.firstName")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-first-name" className="font-medium text-gray-900">
              {formData.firstName || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.lastName")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-last-name" className="font-medium text-gray-900">
              {formData.lastName || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.dob")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-dob" className="font-medium text-gray-900">
              {formData.dateOfBirth || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.sin")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-sin" className="font-medium text-gray-900">
              {formData.sin || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.email")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-email" className="font-medium text-gray-900">
              {formData.email || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Phone Number</p>
            <p id="review-phone" className="font-medium text-gray-900">
              {formData.phone || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.streetAddress")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-address" className="font-medium text-gray-900">
              {formData.address || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.city")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-city" className="font-medium text-gray-900">
              {formData.city || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.province")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-province" className="font-medium text-gray-900">
              {formData.province || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.postalCode")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-postal-code" className="font-medium text-gray-900">
              {formData.postalCode || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("studentInfo.labels.country")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-country" className="font-medium text-gray-900">
              {formData.country || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("review.student.hasOsapApplication")}{" "}
              <span className="text-brand-light-red">*</span>
            </p>
            <p id="review-has-osap" className="font-medium text-gray-900">
              {formatYesNoNotProvided(formData.hasOsapApplication)}
            </p>
          </div>
          {formData.hasOsapApplication === true && (
            <div>
              <p className="text-gray-500">
                {t("studentInfo.labels.osapApplicationStartDate")}{" "}
                <span className="text-brand-light-red">*</span>
              </p>
              <p id="review-osap-start" className="font-medium text-gray-900">
                {formData.osapApplicationStartDate || t("review.notProvided")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Program Information Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <GraduationCap className="h-5 w-5 text-brand-dark-blue" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t("review.sections.programInfo")}
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t("review.program.institution")}</p>
            <p id="review-institution" className="font-medium text-gray-900">
              {formData.institution || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("review.program.program")}</p>
            <p id="review-program" className="font-medium text-gray-900">
              {formData.program || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("programInfo.labels.studyType")}</p>
            <p id="review-study-type" className="font-medium text-gray-900 capitalize">
              {formData.studyType || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("review.program.studyPeriod")}</p>
            <p id="review-study-period" className="font-medium text-gray-900">
              {formData.studyPeriodStart && formData.studyPeriodEnd
                ? `${formData.studyPeriodStart} to ${formData.studyPeriodEnd}`
                : "Not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* OSAP Information Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="h-5 w-5 text-brand-dark-blue" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t("review.sections.osapInfo")}
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t("osapInfo.labels.applicationType")}</p>
            <p id="review-osap-type" className="font-medium text-gray-900 capitalize">
              {formData.osapApplication || t("review.notProvided")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("review.osap.hasRestrictions")}</p>
            <p id="review-has-restrictions" className="font-medium text-gray-900">
              {formData.hasOSAPRestrictions ? t("common.yes") : t("common.no")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("osapInfo.labels.federalNeed")}</p>
            <p id="review-federal-need" className="font-medium text-gray-900">
              ${formData.federalNeed || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("osapInfo.labels.provincialNeed")}</p>
            <p id="review-provincial-need" className="font-medium text-gray-900">
              ${formData.provincialNeed || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Disability Information Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-brand-dark-blue" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t("review.sections.disabilityInfo")}
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t("review.disability.hasVerified")}</p>
            <p id="review-has-disability" className="font-medium text-gray-900">
              {formData.hasVerifiedDisability ? t("common.yes") : t("common.no")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("disabilityInfo.labels.disabilityType")}</p>
            <p id="review-disability-type" className="font-medium text-gray-900 capitalize">
              {formData.disabilityType?.replace(/-/g, " ") || t("review.notProvided")}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500">{t("disabilityInfo.labels.functionalLimitations")}</p>
            <p id="review-limitations" className="font-medium text-gray-900">
              {functionalLimitationLabels.length > 0
                ? functionalLimitationLabels.join(", ")
                : t("review.notProvided")}
            </p>
          </div>
        </div>
      </div>

      {/* Requested Services & Equipment Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-brand-dark-blue" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t("review.sections.requestedItems")}
          </h3>
        </div>
        {formData.requestedItems && formData.requestedItems.length > 0 ? (
          <div className="space-y-3">
            {formData.requestedItems.map((item, index) => (
              <div
                key={index}
                id={`review-requested-item-${index}`}
                className="border-l-4 border-brand-dark-blue pl-4 py-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{item.item}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${item.cost}</p>
                    <p className="text-xs text-gray-500 uppercase">
                      {item.fundingSource}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">{t("review.noItemsRequested")}</p>
        )}
      </div>

      {/* Confirmation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="confirmation"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mt-1 h-4 w-4 text-brand-dark-blue focus:ring-brand-dark-blue border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor="confirmation"
            className="text-sm text-gray-700 cursor-pointer"
          >
            {t("review.confirmation.text")}
          </label>
        </div>
      </div>

      {!isConfirmed && (
        <p className="text-center text-sm text-brand-light-red font-medium">
          {t("review.confirmation.required")}
        </p>
      )}

      <p className="text-center text-sm text-gray-500 mt-4">
        {t("review.afterSubmit")}
      </p>
    </div>
  );
}
