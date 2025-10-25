/**
 * Step 3: OsapInfoStep Component
 *
 * Collects OSAP application details and assessed financial needs for the BSWD application.
 * Includes a confirmation for active OSAP status and automated notifications when none is on file.
 * Restriction details box removed; restriction types linked to OSAP manual.
 *
 * @param formData - Current state of all form data
 * @param setFormData - Function to update form data state
 */

// HELPFUL INFO:
// - formData: Object containing all form data (see @/types/bswd.ts for available fields)
// - setFormData: Updates form data using: setFormData(prev => ({ ...prev, fieldName: value }))
// - Reference StudentInfoStep.tsx for examples
// - Add validation in index.tsx > isStepComplete() function
// - Use brand colors located in tailwind.config.js; reference StudentInfoStep.tsx

import { FormData } from "@/types/bswd";
import * as React from "react";
import { notifyNoOsap } from "@/lib/notify";

const OSAP_MANUAL_URL = process.env.NEXT_PUBLIC_OSAP_MANUAL_URL || "#";

interface OsapInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function OsapInfoStep({ formData, setFormData }: OsapInfoStepProps) {
  // helper to update a single field while preserving the rest of the formData
  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // new local fields for OSAP on-file status and pending-queue tracking
  const onFileStatus: "APPROVED" | "NONE" | "" =
    (formData as any).osapOnFileStatus ?? "";
  const queuedForManualReview: boolean = Boolean(
    (formData as any).queuedForManualReview ?? false
  );

  // existing OSAP fields
  const applicationType = formData.osapApplication ?? "none";
  const federalNeed = Number(formData.federalNeed ?? 0);
  const provincialNeed = Number(formData.provincialNeed ?? 0);
  const hasRestrictions = Boolean(formData.hasOSAPRestrictions ?? false);
  const restrictionType = (formData as any).restrictionType ?? "";

  // eligibility caps and derived amounts
  // Show $20,000 immediately when application type is FULL-TIME and the OSAP status is APPROVED
  const FED_CAP = applicationType === "full-time" ? 20000 : 0;
  const PROV_CAP = 2000;

  // existing "eligible" logic (still used for other lines)
  const eligible =
    onFileStatus === "APPROVED" &&
    applicationType !== "none" &&
    !hasRestrictions &&
    (federalNeed > 0 || provincialNeed > 0);

  // NEW: show federal eligibility without requiring needs input when FT+APPROVED
  const showFederalEligibility =
    onFileStatus === "APPROVED" && applicationType === "full-time";

  // Combined maximum displayed to the user (federal shows on FT+APPROVED even if needs are empty)
  const combinedDisplay = showFederalEligibility ? FED_CAP + PROV_CAP : 0;

  // handler for OSAP on-file status change
  const handleOnFileChange = async (status: "APPROVED" | "NONE" | "") => {
    setFormData((prev) => ({
      ...prev,
      osapOnFileStatus: status,
    }) as any);

    // when “No Application” selected → send templated email + queue for manual review
    if (status === "NONE" && !queuedForManualReview) {
      try {
        await notifyNoOsap(formData.email);
      } catch {
        // silent fail
      }
      setFormData((prev) => ({
        ...prev,
        queuedForManualReview: true,
      }) as any);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">OSAP Information</h2>
      <p className="text-sm text-brand-text-gray">
        Confirm your OSAP status, enter assessed needs, and note any restrictions.
      </p>

      {/* OSAP Application On-File Confirmation */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-brand-text-gray">
          Do you have an active & approved OSAP application on file?{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 text-brand-text-gray">
            <input
              type="radio"
              name="osapOnFileStatus"
              checked={onFileStatus === "APPROVED"}
              onChange={() => handleOnFileChange("APPROVED")}
            />
            Yes — Active & Approved
          </label>
          <label className="inline-flex items-center gap-2 text-brand-text-gray">
            <input
              type="radio"
              name="osapOnFileStatus"
              checked={onFileStatus === "NONE"}
              onChange={() => handleOnFileChange("NONE")}
            />
            No application on file
          </label>
        </div>

        {onFileStatus === "NONE" && (
          <div className="mt-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
            A email has been sent requesting you to apply for OSAP. 
            Your BSWD/CSG-DSE application has been marked{" "}
            <span className="font-semibold">Pending Manual Review</span>.
            {queuedForManualReview && (
              <div className="mt-1 text-xs text-yellow-800">
                Status: queued for manual review.
              </div>
            )}
          </div>
        )}
      </div>

      {/* OSAP Application Type */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-brand-text-gray">
          OSAP Application Type <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
          value={applicationType}
          onChange={(e) => setField("osapApplication", e.currentTarget.value as any)}
          disabled={onFileStatus !== "APPROVED"}
        >
          <option value="none">Select type</option>
          <option value="full-time">Full-Time OSAP</option>
          <option value="part-time">Part-Time OSAP</option>
        </select>
        {onFileStatus !== "APPROVED" && (
          <p className="text-xs text-gray-500 mt-1">
            Selectable after OSAP application is active & approved.
          </p>
        )}
      </div>

      {/* Assessed Needs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-brand-text-gray">
            Federal Financial Need ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            value={Number.isNaN(federalNeed) ? "" : federalNeed}
            onChange={(e) => setField("federalNeed", Number(e.currentTarget.value) as any)}
            disabled={onFileStatus !== "APPROVED"}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-brand-text-gray">
            Provincial Financial Need ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            value={Number.isNaN(provincialNeed) ? "" : provincialNeed}
            onChange={(e) => setField("provincialNeed", Number(e.currentTarget.value) as any)}
            disabled={onFileStatus !== "APPROVED"}
          />
        </div>
      </div>

      {/* Restrictions Section */}
      <div className="space-y-2">
        <label className="inline-flex items-center gap-2 text-brand-text-gray">
          <input
            type="checkbox"
            checked={hasRestrictions}
            onChange={(e) => setField("hasOSAPRestrictions", e.currentTarget.checked)}
          />
          Student has OSAP restrictions
        </label>

        {hasRestrictions && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-brand-text-gray">
              Type of Restriction{" "}
              <a
                href="https://osap.gov.on.ca/dc/TCONT003225"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline text-xs"
              >
                (View OSAP Restriction Reasons)
              </a>
            </label>
            <select
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
              value={restrictionType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, restrictionType: e.currentTarget.value }) as any)
              }
            >
              <option value="">Select type</option>
              <option value="DEFAULT">Default</option>
              <option value="OVERPAYMENT">Overpayment</option>
              <option value="BANKRUPTCY">Bankruptcy</option>
              <option value="FALSE_INFO">False Information</option>
              <option value="LOAN_FORGIVENESS_REVIEW">Loan Forgiveness Review</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        )}
      </div>

      {/* Eligibility Summary */}
      <div className="rounded-xl border border-gray-200 bg-[#e6fad2] p-4">
        <p className="font-semibold text-[#4e4e4e] mb-1">Estimated Eligibility</p>
        <div className="text-sm text-[#4e4e4e]">
          <p>
            Federal CSG-DSE Eligible:{" "}
            <span className="font-medium">
              {showFederalEligibility ? `Yes (up to $${FED_CAP.toLocaleString()})` : "No"}
            </span>
          </p>
          <p>
            Provincial BSWD Eligible:{" "}
            <span className="font-medium">
              {eligible ? `Yes (up to $${PROV_CAP.toLocaleString()})` : "No"}
            </span>
          </p>
          <p>
            Combined Maximum:{" "}
            <span className="font-medium">${combinedDisplay.toLocaleString()}</span>
          </p>
          {onFileStatus === "NONE" && (
            <p className="mt-1 italic text-[#4e4e4e]">
              Pending manual review until OSAP application submitted.
            </p>
          )}
          {hasRestrictions && (
            <p className="mt-1 italic text-[#4e4e4e]">
              Funding may be subject to restriction clearance.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
