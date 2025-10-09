/**
 * Step 1: StudentInfoStep Component
 * 
 * First step of the BSWD application form that collects basic student information.
 * Includes validation for OEN (Ontario Education Number) format.
 * 
 * @param formData - Current state of all form data
 * @param setFormData - Function to update form data state
 */
import { FormData } from "@/types/bswd";

interface StudentInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function StudentInfoStep({ formData, setFormData }: StudentInfoStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Student Information</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Student ID *
          </label>
          <input
            id="studentId"
            type="text"
            value={formData.studentId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, studentId: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="Enter student ID"
          />
        </div>

        <div>
          <label htmlFor="oen" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Ontario Education Number (OEN) *
          </label>
          <input
            id="oen"
            type="text"
            value={formData.oen}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 9) {
                setFormData(prev => ({ ...prev, oen: value }));
              }
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="9-digit OEN"
            maxLength={9}
          />
          {formData.oen && formData.oen.length !== 9 && (
            <p className="text-sm text-red-600 mt-1">OEN must be exactly 9 digits</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Full Legal Name *
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, fullName: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="Enter full legal name"
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Date of Birth *
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sin" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Social Insurance Number
          </label>
          <input
            id="sin"
            type="text"
            value={formData.sin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, sin: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="XXX-XXX-XXX"
            maxLength={11}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, email: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="student@institution.edu"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, phone: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="(xxx) xxx-xxxx"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1 text-brand-text-gray">
          Mailing Address
        </label>
        <textarea
          id="address"
          value={formData.address}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
            setFormData(prev => ({ ...prev, address: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
          rows={3}
          placeholder="Enter complete mailing address"
        />
      </div>
    </div>
  );
}