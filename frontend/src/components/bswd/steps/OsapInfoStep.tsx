/**
 * Step 3: OsapInfoStep component
 *
 * Collects OSAP application details and assessed financial needs for the BSWD application.
 * Includes a confirmation for active OSAP status and automated notifications when none is on file.
 *
 * @param formData - Current state of all form data
 * @param setFormData - Function to update form data state
 */

import { FormData } from "@/types/bswd";
import { useTranslation } from "@/lib/i18n"; // translation import

const OSAP_MANUAL_URL = "https://osap.gov.on.ca/dc/TCONT003225";

interface OsapInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function OsapInfoStep({ formData, setFormData }: OsapInfoStepProps) {
  const { t, isLoaded } = useTranslation(); // translation helper
  if (!isLoaded) return null; // make sure it loads properly

  // helper to update a single field while preserving the rest of the formData
  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const yesUpTo = (amount: number) => // helps with translation logic
    t("osapInfo.values.yesUpTo").replace(
      "{{amount}}",
      amount.toLocaleString()
    );

  // local state shortcuts
  const onFileStatus: "APPROVED" | "NONE" | "" =
    formData.osapOnFileStatus ?? "";
  const applicationType = formData.osapApplication ?? "none";
  const federalNeed = Number(formData.federalNeed ?? 0);
  const provincialNeed = Number(formData.provincialNeed ?? 0);
  const hasRestrictions = Boolean(formData.hasOSAPRestrictions ?? false);
  const restrictionType = formData.restrictionType ?? "";

  // caps
  // Federal: Full-Time -> 20000; Part-Time -> 0
  // Provincial: up to 2000 unless restrictions (then 0)
  const FED_CAP = applicationType === "full-time" ? 20000 : 0;
  const PROV_CAP = hasRestrictions ? 0 : 2000;

  // eligibility flags for display
  const federalEligible =
    onFileStatus === "APPROVED" && applicationType === "full-time";
  const provincialEligible =
    onFileStatus === "APPROVED" &&
    applicationType !== "none" &&
    !hasRestrictions;

  // combined maximum (updates automatically from flags above)
  const combinedDisplay =
    (federalEligible ? FED_CAP : 0) + (provincialEligible ? PROV_CAP : 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">
        {t("osapInfo.sectionHeader")}
      </h2>
      <p className="text-sm text-brand-text-gray">
        {t("osapInfo.description")}
      </p>

      {/* OSAP Application Type */}
      <div className="space-y-1">
        <label 
          htmlFor="osap-application-type"
          className="block text-sm font-medium text-brand-text-gray">
          {t("osapInfo.labels.applicationType")}{" "} 
          <span className="text-brand-light-red">*</span>
        </label>
        <select
          id="osap-application-type"
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
          value={applicationType}
          onChange={(e) =>
            setField(
              "osapApplication",
              getOsapApplication(e.currentTarget.value)
            )
          }
          disabled={false}
        >
          <option value="none">{t("osapInfo.options.applicationType.none")}</option>
          <option value="full-time">{t("osapInfo.options.applicationType.fullTime")}</option>
          <option value="part-time">{t("osapInfo.options.applicationType.partTime")}</option>
        </select>
        {onFileStatus !== "APPROVED" && (
          <p className="text-xs text-gray-500 mt-1">
            {t("osapInfo.helperText.applicationTypeLocked")}
          </p>
        )}
      </div>

      {/* Assessed Needs (kept, but not gating display caps) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label 
            htmlFor="federal-need"
            className="block text-sm font-medium text-brand-text-gray">
            {t("osapInfo.labels.federalNeed")}{" "} 
            <span className="text-brand-light-red">*</span>
          </label>
          <input
            id="federal-need"
            type="number"
            min={0}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            value={Number.isNaN(federalNeed) ? "" : federalNeed}
            onChange={(e) =>
              setField("federalNeed", Number(e.currentTarget.value))
            }
          />
        </div>
        <div className="space-y-1">
          <label 
            htmlFor="provincial-need"
            className="block text-sm font-medium text-brand-text-gray">
            {t("osapInfo.labels.provincialNeed")}{" "}
            <span className="text-brand-light-red">*</span>
          </label>
          <input
            id="provincial-need"
            type="number"
            min={0}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            value={Number.isNaN(provincialNeed) ? "" : provincialNeed}
            onChange={(e) =>
              setField("provincialNeed", Number(e.currentTarget.value))
            }
          />
        </div>
      </div>

      {/* Restrictions Section */}
      <div className="space-y-2">
        <label className="inline-flex items-center gap-2 text-brand-text-gray">
          <input
            type="checkbox"
            checked={hasRestrictions}
            onChange={(e) =>
              setField("hasOSAPRestrictions", e.currentTarget.checked)
            }
          />
          {t("osapInfo.labels.restrictionsCheckbox")}
        </label>
        {hasRestrictions && (
          <div className="space-y-2">
            <label 
              htmlFor="restriction-type" 
              className="block text-sm font-medium text-brand-text-gray">
              {t("osapInfo.labels.restrictionType")}{" "}
              <a
                href={OSAP_MANUAL_URL}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline text-xs"
              >
                ({t("osapInfo.links.viewRestrictionReasons")})
              </a>
            </label>
            <select
              id="restriction-type"
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
              value={restrictionType ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  restrictionType: getRestrictionType(e.target.value),
                  hasOSAPRestrictions: true,
                }))
              }
            >
              <option value="">{t("osapInfo.placeholders.selectType")}</option>
              <option value="DEFAULT">{t("osapInfo.options.restrictionType.default")}</option>
              <option value="OVERPAYMENT">{t("osapInfo.options.restrictionType.overpayment")}</option>
              <option value="BANKRUPTCY">{t("osapInfo.options.restrictionType.bankruptcy")}</option>
              <option value="FALSE_INFO">{t("osapInfo.options.restrictionType.falseInfo")}</option>
              <option value="LOAN_FORGIVENESS_REVIEW">
                {t("osapInfo.options.restrictionType.loanForgivenessReview")}
              </option>
              <option value="OTHER">{t("osapInfo.options.restrictionType.other")}</option>
            </select>
          </div>
        )}
      </div>

      {/* Eligibility Summary */}
      <div className="rounded-xl border border-gray-200 bg-[#e6fad2] p-4">
        <p className="font-semibold text-[#4e4e4e] mb-1">
          {t("osapInfo.labels.eligibilityTitle")}
        </p>
        <div className="text-sm text-[#4e4e4e]">
          <p>
            {t("osapInfo.labels.federalEligible")}:{" "}
            <span className="font-medium">
              {federalEligible ? yesUpTo(FED_CAP) : t("osapInfo.values.no")}
            </span>
          </p>
          <p>
            {t("osapInfo.labels.provincialEligible")}:{" "}
            <span className="font-medium">
              {provincialEligible ? yesUpTo(PROV_CAP) : t("osapInfo.values.no")}
            </span>
          </p>
          <p>
            {t("osapInfo.labels.combinedMaximum")}:{" "}
            <span className="font-medium">
              ${combinedDisplay.toLocaleString()}
            </span>
          </p>
          {onFileStatus === "NONE" && (
            <p className="mt-1 italic text-[#4e4e4e]">
              {t("osapInfo.helperText.pendingManualReview")}
            </p>
          )}
          {hasRestrictions && (
            <p className="mt-1 italic text-[#4e4e4e]">
              {t("osapInfo.helperText.restrictionClearance")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
function getOsapApplication(value: string) {
  return value !== "full-time" && value !== "part-time" ? "none" : value;
}

function getRestrictionType(value: string) {
  return value !== "OVERPAYMENT" &&
    value !== "BANKRUPTCY" &&
    value !== "FALSE_INFO" &&
    value !== "LOAN_FORGIVENESS_REVIEW" &&
    value !== "OTHER"
    ? "DEFAULT"
    : value;
}
