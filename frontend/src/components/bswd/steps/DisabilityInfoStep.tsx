// Step 4: Disability verification and documentation
// DisabilityInfoStep Component Goes Here
//
// HELPFUL INFO:
// - formData: Object containing all form data (see @/types/bswd.ts for available fields)
// - setFormData: Updates form data using: setFormData(prev => ({ ...prev, fieldName: value }))
// - Reference StudentInfoStep.tsx for examples
// - Add validation in index.tsx > isStepComplete() function
// - Use brand colors located in tailwind.config.js; reference StudentInfoStep.tsx

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDateRange } from "@/hooks/UseDateRange";
import { Calendar } from "@/components/ui/calendar";
import { FormData } from "@/types/bswd";
import { ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";
import { format } from "date-fns";
interface DisabilityInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function DisabilityInfoStep({ formData, setFormData }: DisabilityInfoStepProps) {
  const verificationDate = useDateRange();
  // Local state for the psycho-educational assessment checkbox
  const [requiresPsychoEducational, setRequiresPsychoEducational] =
    useState(false);

  // Handler for the multi-select functional limitations checkboxes
  const handleLimitationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const idx = formData.functionalLimitations.findIndex(
      (limit) => limit.name === name
    );
    setFormData((prev) => ({
      ...prev,
      functionalLimitations: prev.functionalLimitations.map((limit) =>
        limit.name !== name ? limit : { ...limit, checked }
      ),
    }));
  };
  // Disable verification date if not verified or not selected
  const isVerificationDisabled =
    !formData.disabilityType || formData.disabilityType === "not-verified";

  return (
    <div
      className="space-y-4"
      style={{
        fontFamily: `"Raleway", "Helvetica Neue", Helvetica, Arial, sans-serif`,
      }}
    >
      <h2 className="text-xl font-semibold mb-4">Section D: Disability Info</h2>

      {/* Verified Status Checkbox */}
      <div>
        <div className="flex items-center">
          <input
            id="isDisabilityVerified"
            name="isDisabilityVerified"
            type="checkbox"
            checked={formData.disabilityType !== "not-verified"}
            onChange={(e) => {
              if (e.target.checked) {
                setFormData((prev) => ({
                  ...prev,
                  disabilityType: "permanent",
                }));
              } else {
                setFormData((prev) => ({
                  ...prev,
                  disabilityType: "not-verified",
                }));
              }
            }}
            className="h-4 w-4 border-gray-300 rounded focus:ring-[#0071a9]"
          />
          <label
            htmlFor="isDisabilityVerified"
            className="ml-3 text-sm font-medium text-[#4e4e4e]"
          >
            Student has verified disability status with OSAP
          </label>
        </div>
      </div>

      {/* Disability Verification Date */}
      <div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="endDate" className="block text-base font-medium mb-1 text-brand-text-gray">
            Disability Verification Date <span className="text-sm text-brand-light-red mt-1">*</span>
          </Label>
          <Popover open={verificationDate.open} onOpenChange={verificationDate.setOpen}>
            <PopoverTrigger asChild disabled={isVerificationDisabled}>
              <Button
                variant="outline"
                id="endDate"
                className="w-full max-w-xs justify-between font-normal"
              >
                {verificationDate.date ? verificationDate.date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={verificationDate.date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  verificationDate.setDate(date)
                  verificationDate.setOpen(false)
                  if (date) {
                    setFormData((prev) => ({
                      ...prev,
                      disabilityVerificationDate: format(date, "dd/MM/yyyy")
                    }))
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Disability Type Radio Group */}
      {formData.disabilityType !== "not-verified" && (
        <div>
          <fieldset>
            <legend className="text-base font-medium mb-2 text-[#4e4e4e]">
              Disability Type
            </legend>
            <div className="space-y-2">
              {[
                { value: "permanent" as const, label: "Permanent Disability" },
                {
                  value: "persistent-prolonged" as const,
                  label: "Persistent or Prolonged Disability",
                },
              ].map((type) => (
                <div key={type.value} className="flex items-center">
                  <input
                    id={type.value}
                    name="disabilityType"
                    type="radio"
                    value={type.value}
                    checked={formData.disabilityType === type.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        disabilityType: e.target
                          .value as typeof prev.disabilityType,
                      }))
                    }
                    className="h-4 w-4 border-gray-300 focus:ring-[#0071a9]"
                  />
                  <label
                    htmlFor={type.value}
                    className="ml-3 text-sm text-[#4e4e4e]"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* Functional Limitations Checkbox Group */}
      <div>
        <fieldset>
          <legend className="text-base font-medium mb-2 text-[#4e4e4e]">
            Functional Limitations (optional - check all that apply)
          </legend>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {formData.functionalLimitations.map((limitation) => (
              <div key={limitation.name} className="flex items-center">
                <input
                  id={limitation.name}
                  name={limitation.name}
                  type="checkbox"
                  checked={limitation.checked}
                  onChange={handleLimitationsChange}
                  className="h-4 w-4 border-gray-300 rounded focus:ring-[#0071a9]"
                />
                <label
                  htmlFor={limitation.name}
                  className="ml-3 text-sm text-[#4e4e4e]"
                >
                  {limitation.label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Psycho-educational Assessment Checkbox */}
      <div className="pt-2 border-t border-gray-200 mt-6">
        <div className="flex items-start my-4">
          <input
            id="requiresPsychoEducational"
            name="requiresPsychoEducational"
            type="checkbox"
            checked={requiresPsychoEducational}
            onChange={(e) => setRequiresPsychoEducational(e.target.checked)}
            className="h-5 w-5 border-gray-300 rounded focus:ring-[#0071a9]"
          />
          <label
            htmlFor="requiresPsychoEducational"
            className="ml-3 text-[15px] font-medium text-[#4e4e4e] leading-snug"
          >
            Requires Psycho-Educational Assessment for Learning Disability
            Verification
          </label>
        </div>

        {/* Conditional Email Input - Only shows when checkbox is checked */}
        {requiresPsychoEducational && (
          <div className="mt-6 ml-8 p-6 rounded-md border-l-4 border-[#0071a9] bg-[#e6fad2] my-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-[#0071a9]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-semibold text-[#4e4e4e]">
                  Psycho-Educational Assessment Referral
                </h3>
                <div className="mt-2 text-sm text-[#4e4e4e]">
                  <p>
                    You will be automatically connected with a qualified assessment provider in your geographical area
                    who has a referral contract with us, or with a provider at your institution at a discounted rate.
                  </p>
                  <p className="mt-2">
                    The assessment fee will be reviewed for approval and submitted to your institution&apos;s finance office
                    for direct payment via EFT.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="psychoEdEmail"
                className="block text-sm font-medium text-[#4e4e4e] mb-2"
              >
                Contact Email for Assessment Referral{" "}
                <span className="text-[#d62929]">*</span>
              </label>
              <input
                type="email"
                id="psychoEdEmail"
                name="psychoEdEmail"
                placeholder="Enter your email address"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full max-w-md px-4 py-2 border rounded-md text-sm text-[#4e4e4e] focus:outline-none focus:ring-2 focus:ring-[#0071a9]"
                required={requiresPsychoEducational}
              />
              <p className="mt-2 text-xs text-[#4e4e4e]">
                We will send assessment provider information and next steps to
                this email address.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
