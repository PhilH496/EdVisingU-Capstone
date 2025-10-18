/**
 * Step 3: OsapInfoStep Component
 *
 * Collects OSAP application details and assessed financial needs for the BSWD application.
 * Includes dynamic eligibility summary and conditional restriction fields.
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

interface OsapInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function OsapInfoStep({ formData, setFormData }: OsapInfoStepProps) {
  // helper to update a single field while preserving the rest of the formData
  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  // defaults (align with existing camelCase keys from index.tsx)
  const applicationType = (formData as any).osapApplication ?? "";
  const federalNeed = Number((formData as any).federalNeed ?? 0);
  const provincialNeed = Number((formData as any).provincialNeed ?? 0);
  const hasRestrictions = Boolean((formData as any).hasOSAPRestrictions ?? false);
  const restrictionType = (formData as any).restrictionType ?? "";
  const restrictionDetails = (formData as any).restrictionDetails ?? "";

  // simple eligibility caps for summary card (adjust if moved to config)
  const FED_CAP = 20000;
  const PROV_CAP = 2000;
  const eligible = applicationType !== "" && !hasRestrictions;
  const combinedMax = eligible ? FED_CAP + PROV_CAP : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Section C: OSAP Information</h2>
      
      {/* OSAP Application Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#4e4e4e]">
          OSAP Application Type <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full rounded-lg border border-gray-300 p-2"
          value={applicationType}
          onChange={(e) => {
            const v = e.currentTarget.value as "full-time" | "part-time" | "";
            setField("osapApplication" as any, v as any);
          }}
        >
          <option value="">Select type</option>
          <option value="full-time">Full-Time OSAP</option>
          <option value="part-time">Part-Time OSAP</option>
        </select>
      </div>

      {/* Assessed Needs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#4e4e4e]">
            Federal Financial Need ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-gray-300 p-2"
            value={Number.isNaN(federalNeed) ? "" : federalNeed}
            onChange={(e) => setField("federalNeed" as any, Number(e.currentTarget.value) as any)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#4e4e4e]">
            Provincial Financial Need ($) <span className="text-red-500">*</span>
          </label> 
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-gray-300 p-2"
            value={Number.isNaN(provincialNeed) ? "" : provincialNeed}
            onChange={(e) => setField("provincialNeed" as any, Number(e.currentTarget.value) as any)}
          />
        </div>
      </div>

      {/* Restrictions */}
      <div className="space-y-3">
        <label className="inline-flex items-center gap-2 text-[#4e4e4e]">
          <input
            type="checkbox"
            checked={hasRestrictions}
            onChange={(e) => setField("hasOSAPRestrictions" as any, e.currentTarget.checked as any)}
          />
          Student has OSAP restrictions
        </label>

        {hasRestrictions && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4e4e4e]">
                Type of Restriction <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2"
                value={restrictionType}
                onChange={(e) => setField("restrictionType" as any, e.currentTarget.value as any)}
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

            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-medium text-[#4e4e4e]">
                Restriction Details <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="Describe the restriction and current clearance status"
                value={restrictionDetails}
                onChange={(e) => setField("restrictionDetails" as any, e.currentTarget.value as any)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Eligibility Summary */}
      <div className="rounded-xl border border-gray-200 bg-[#e6fad2] p-4">
        <p className="font-semibold text-[#4e4e4e] mb-1">Eligibility Summary</p>
        <div className="text-sm text-[#4e4e4e]">
          <p>
            Federal CSG-DSE Eligible:{" "}
            <span className="font-medium">
              {eligible ? `Yes (up to $${FED_CAP.toLocaleString()})` : "No"}
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
            <span className="font-medium">${combinedMax.toLocaleString()}</span>
          </p>
          {hasRestrictions && (
            <p className="mt-1 italic text-[#4e4e4e]">
              Funding is subject to restriction clearance.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
