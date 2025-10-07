// Step 3: OSAP application details and assessed needs
// OsapInfoStep Component Goes Here
// 
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
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">OSAP Information</h2>
      
      {/* Add your form fields here */}

      <p className="text-gray-500 italic">
        Step 3 - Add your form fields here
      </p>
    </div>
  );
}