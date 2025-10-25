// Step 4: Disability verification and documentation
// DisabilityInfoStep Component Goes Here
// 
// HELPFUL INFO:
// - formData: Object containing all form data (see @/types/bswd.ts for available fields)
// - setFormData: Updates form data using: setFormData(prev => ({ ...prev, fieldName: value }))
// - Reference StudentInfoStep.tsx for examples
// - Add validation in index.tsx > isStepComplete() function
// - Use brand colors located in tailwind.config.js; reference StudentInfoStep.tsx

import { FormData } from "@/types/bswd";
import React, { useState } from "react";

interface DisabilityInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function DisabilityInfoStep({ formData, setFormData }: DisabilityInfoStepProps) {
  // Local state for the psycho-educational assessment checkbox
  const [requiresPsychoEducational, setRequiresPsychoEducational] = useState(false);

  // Handler for the multi-select functional limitations checkboxes
  const handleLimitationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      functionalLimitations: {
        ...prev.functionalLimitations,
        [name as keyof typeof prev.functionalLimitations]: checked,
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">Section D: Disability Info</h2>

      {/* Verified Status Checkbox */}
      <div className="mb-8">
        <div className="flex items-center">
          <input
            id="isDisabilityVerified"
            name="isDisabilityVerified"
            type="checkbox"
            checked={!!formData.disabilityType && formData.disabilityType !== 'not-verified'}
            onChange={e => {
              if (e.target.checked) {
                setFormData(prev => ({ ...prev, disabilityType: 'permanent' }));
              } else {
                setFormData(prev => ({ ...prev, disabilityType: 'not-verified' }));
              }
            }}
            className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
          />
          <label htmlFor="isDisabilityVerified" className="ml-3 text-gray-700 font-medium">
            Student has verified disability status with OSAP
          </label>
        </div>
      </div>

      {/* Disability Verification Date */}
      <div className="mb-8">
        <label htmlFor="disabilityVerificationDate" className="block text-gray-700 font-medium mb-3">
          Disability Verification Date
        </label>
        <div className="relative">
          <input
            type="date"
            id="disabilityVerificationDate"
            name="disabilityVerificationDate"
value={formData.disabilityVerificationDate || '2023-06-15'}
            onChange={e => setFormData(prev => ({ ...prev, disabilityVerificationDate: e.target.value }))}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:ring-1"
          />
        </div>
      </div>

      {/* Disability Type Radio Group */}
      <div className="mb-8">
        <fieldset>
          <legend className="text-gray-700 font-medium mb-4">Disability Type</legend>
          <div className="space-y-3">
            {[
              { value: 'permanent' as const, label: 'Permanent Disability' },
              { value: 'persistent-prolonged' as const, label: 'Persistent or Prolonged Disability' },
              { value: 'not-verified' as const, label: 'Not Yet Verified' }
            ].map(type => (
              <div key={type.value} className="flex items-center">
                <input
                  id={type.value}
                  name="disabilityType"
                  type="radio"
                  value={type.value}
checked={formData.disabilityType === type.value || (type.value === 'permanent' && !formData.disabilityType)}
                  onChange={e => setFormData(prev => ({ ...prev, disabilityType: e.target.value as typeof prev.disabilityType }))}
                  className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500 focus:ring-2"
                />
                <label htmlFor={type.value} className="ml-3 text-gray-700">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Functional Limitations Checkbox Group */}
      <div className="mb-8">
        <fieldset>
          <legend className="text-gray-700 font-medium mb-4">
            Functional Limitations (optional - check all that apply)
          </legend>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {[
              { name: 'mobility' as const, label: 'Mobility' },
              { name: 'vision' as const, label: 'Vision' },
              { name: 'hearing' as const, label: 'Hearing' },
              { name: 'learning' as const, label: 'Learning' },
              { name: 'cognitive' as const, label: 'Cognitive' },
              { name: 'mentalHealth' as const, label: 'Mental Health' },
              { name: 'communication' as const, label: 'Communication' },
              { name: 'dexterity' as const, label: 'Dexterity' },
              { name: 'chronicPain' as const, label: 'Chronic Pain' },
              { name: 'attention' as const, label: 'Attention/Concentration' },
            ].map(limitation => (
              <div key={limitation.name} className="flex items-center">
                <input
                  id={limitation.name}
                  name={limitation.name}
                  type="checkbox"
checked={(formData.functionalLimitations as any)?.[limitation.name] || false}
                  onChange={handleLimitationsChange}
                  className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                />
                <label htmlFor={limitation.name} className="ml-3 text-gray-700">
                  {limitation.label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Psycho-educational Assessment Checkbox */}
      <div className="mb-8">
        <div className="flex items-start">
          <input
            id="requiresPsychoEducational"
            name="requiresPsychoEducational"
            type="checkbox"
            checked={requiresPsychoEducational}
            onChange={e => setRequiresPsychoEducational(e.target.checked)}
            className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 mt-0.5"
          />
          <label htmlFor="requiresPsychoEducational" className="ml-3 text-gray-700 leading-tight">
            Requires psycho-educational assessment for learning disability verification
          </label>
        </div>
      </div>
    </div>
  );
}
