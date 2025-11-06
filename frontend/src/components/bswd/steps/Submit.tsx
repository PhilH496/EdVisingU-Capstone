import { FormData } from "@/types/bswd";
import { FileText, User, GraduationCap, DollarSign, Heart } from "lucide-react";

interface ReviewAndSubmitProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  isConfirmed: boolean;
  setIsConfirmed: (confirmed: boolean) => void;
}

export function ReviewAndSubmit({ formData, setFormData, isConfirmed, setIsConfirmed }: ReviewAndSubmitProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review and Submit</h2>
        <p className="text-gray-600">
          Please review your application information below before submitting.
        </p>
      </div>

      {/* Student Information Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-brand-dark-blue" />
          <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Full Name</p>
            <p className="font-medium text-gray-900">{(formData.firstName + " " + formData.lastName).trim() || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">Student ID</p>
            <p className="font-medium text-gray-900">{formData.studentId || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">OEN</p>
            <p className="font-medium text-gray-900">{formData.oen || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">Date of Birth</p>
            <p className="font-medium text-gray-900">{formData.dateOfBirth || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{formData.email || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-900">{formData.phone || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Program Information Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <GraduationCap className="h-5 w-5 text-brand-dark-blue" />
          <h3 className="text-lg font-semibold text-gray-900">Program Information</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Institution</p>
            <p className="font-medium text-gray-900">{formData.institution || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">Program</p>
            <p className="font-medium text-gray-900">{formData.program || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">Study Type</p>
            <p className="font-medium text-gray-900 capitalize">{formData.studyType || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">Study Period</p>
            <p className="font-medium text-gray-900">
              {formData.studyPeriodStart && formData.studyPeriodEnd 
                ? `${formData.studyPeriodStart} to ${formData.studyPeriodEnd}`
                : 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* OSAP Information Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="h-5 w-5 text-brand-dark-blue" />
          <h3 className="text-lg font-semibold text-gray-900">OSAP Information</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">OSAP Application Type</p>
            <p className="font-medium text-gray-900 capitalize">{formData.osapApplication || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">Has OSAP Restrictions</p>
            <p className="font-medium text-gray-900">{formData.hasOSAPRestrictions ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-gray-500">Federal Need</p>
            <p className="font-medium text-gray-900">${formData.federalNeed || 0}</p>
          </div>
          <div>
            <p className="text-gray-500">Provincial Need</p>
            <p className="font-medium text-gray-900">${formData.provincialNeed || 0}</p>
          </div>
        </div>
      </div>

      {/* Disability Information Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-brand-dark-blue" />
          <h3 className="text-lg font-semibold text-gray-900">Disability Information</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Has Verified Disability</p>
            <p className="font-medium text-gray-900">{formData.hasVerifiedDisability ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-gray-500">Disability Type</p>
            <p className="font-medium text-gray-900 capitalize">
              {formData.disabilityType?.replace(/-/g, ' ') || 'Not provided'}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500">Functional Limitations</p>
            <p className="font-medium text-gray-900">
              {formData.functionalLimitations?.length > 0 
                ? formData.functionalLimitations.join(', ')
                : 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Requested Services & Equipment Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-brand-dark-blue" />
          <h3 className="text-lg font-semibold text-gray-900">Requested Services & Equipment</h3>
        </div>
        {formData.requestedItems && formData.requestedItems.length > 0 ? (
          <div className="space-y-3">
            {formData.requestedItems.map((item, index) => (
              <div key={index} className="border-l-4 border-brand-dark-blue pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{item.item}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.justification}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${item.cost}</p>
                    <p className="text-xs text-gray-500 uppercase">{item.fundingSource}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No items requested</p>
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
          <label htmlFor="confirmation" className="text-sm text-gray-700 cursor-pointer">
            I confirm that all the information provided in this application is accurate and complete to the best 
            of my knowledge. I understand that providing false or misleading information may result in the denial 
            of my application or cancellation of funding.
          </label>
        </div>
      </div>

      {!isConfirmed && (
        <p className="text-center text-sm text-red-600 font-medium">
          Please confirm the above statement before submitting your application.
        </p>
      )}

      <p className="text-center text-sm text-gray-500 mt-4">
        After submitting, you can track your application status on the status page.
      </p>
    </div>
  );
}