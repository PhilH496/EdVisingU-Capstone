// Step 6: Document uploads and verification
// DocumentsStep Component Goes Here
// 
// HELPFUL INFO:
// - formData: Object containing all form data (see @/types/bswd.ts for available fields)
// - setFormData: Updates form data using: setFormData(prev => ({ ...prev, fieldName: value }))
// - Reference StudentInfoStep.tsx for examples
// - Add validation in index.tsx > isStepComplete() function
// - Use brand colors located in tailwind.config.js; reference StudentInfoStep.tsx

import { FormData } from "@/types/bswd";
import { useState } from "react";
import { Upload, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as React from "react";

interface DocumentsStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

type DocumentType = 'osapApplication' | 'disabilityVerification' | 'serviceRecommendations';

interface DocumentInfo {
  title: string;
  type: string;
  required: boolean;
  files: File[];
}

// Reusable Date Picker Component
const DatePickerField = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (date: string) => void 
}) => {
  const [date, setDate] = React.useState<Date | null>(value ? new Date(value) : null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSelect = (selected: Date | undefined) => {
    if (!selected) return;
    setDate(selected);
    const formatted = format(selected, "yyyy-MM-dd");
    if (inputRef.current) inputRef.current.value = formatted;
    onChange(formatted);
  };

  return (
    <Popover>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="date"
          defaultValue={date ? format(date, "yyyy-MM-dd") : ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm"
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              const parsed = new Date(value);
              if (!isNaN(parsed.getTime())) {
                setDate(parsed);
                onChange(value);
              }
            } else {
              setDate(null);
              onChange('');
            }
          }}
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="w-auto p-0 z-50">
          <Calendar 
            mode="single" 
            selected={date ?? undefined} 
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </div>
    </Popover>
  );
};

// Reusable Status Tracking Component
const StatusTrackingSection = ({
  title,
  yesNoValue,
  dateValue,
  onYesNoChange,
  onDateChange
}: {
  title: string;
  yesNoValue: boolean | null;
  dateValue: string;
  onYesNoChange: (value: boolean | null) => void;
  onDateChange: (date: string) => void;
}) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#4e4e4e]">Status</label>
        <select 
          className="w-full rounded-lg border border-gray-300 p-2"
          value={yesNoValue === null ? '' : yesNoValue ? 'yes' : 'no'}
          onChange={(e) => onYesNoChange(e.target.value === '' ? null : e.target.value === 'yes')}
        >
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#4e4e4e]">Date</label>
        <DatePickerField value={dateValue} onChange={onDateChange} />
      </div>
    </div>
  </div>
);

export function DocumentsStep({ formData, setFormData }: DocumentsStepProps) {
  const [documents, setDocuments] = useState<Record<DocumentType, DocumentInfo>>({
    osapApplication: {
      title: "OSAP Application Form",
      type: "OSAP Application",
      required: true,
      files: []
    },
    serviceRecommendations: {
      title: "DSO/ASO Service Recommendations",
      type: "Service Recommendations",
      required: true,
      files: []
    },
    disabilityVerification: {
      title: "OSAP Disability Verification Form",
      type: "Disability Verification",
      required: false,
      files: []
    }
  });

  const handleFileUpload = (docType: DocumentType, newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: File[] = [];
    
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      
      if (file.type !== 'application/pdf') {
        alert(`${file.name} is not a PDF file. Please upload PDF files only.`);
        continue;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} is larger than 2MB. Please upload smaller files.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          files: [...prev[docType].files, ...validFiles]
        }
      }));

      setFormData(prev => ({
        ...prev,
        [`${docType}Files`]: [...(documents[docType].files || []), ...validFiles]
      }));
    }
  };

  const handleRemoveFile = (docType: DocumentType, fileIndex: number) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        files: prev[docType].files.filter((_, index) => index !== fileIndex)
      }
    }));

    const updatedFiles = documents[docType].files.filter((_, index) => index !== fileIndex);
    setFormData(prev => ({
      ...prev,
      [`${docType}Files`]: updatedFiles
    }));
  };

  const handleBrowse = (docType: DocumentType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      handleFileUpload(docType, files);
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Section E: Documents</h2>

      {/* Document Status Tracking Sections */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold">Document Status Tracking</h3>

        <StatusTrackingSection
          title="Psycho-Educational Assessment Request"
          yesNoValue={formData.psychoEdAssessmentSent ?? null}
          dateValue={formData.psychoEdAssessmentDate || ''}
          onYesNoChange={(val) => setFormData(prev => ({ ...prev, psychoEdAssessmentSent: val }))}
          onDateChange={(date) => setFormData(prev => ({ ...prev, psychoEdAssessmentDate: date }))}
        />

        <StatusTrackingSection
          title="OSAP Restriction Clearance"
          yesNoValue={formData.restrictionSatisfied ?? null}
          dateValue={formData.restrictionSatisfiedDate || ''}
          onYesNoChange={(val) => setFormData(prev => ({ ...prev, restrictionSatisfied: val }))}
          onDateChange={(date) => setFormData(prev => ({ ...prev, restrictionSatisfiedDate: date }))}
        />

        <StatusTrackingSection
          title="OSAP Verification Form"
          yesNoValue={formData.osapVerificationReceived ?? null}
          dateValue={formData.osapVerificationReceivedDate || ''}
          onYesNoChange={(val) => setFormData(prev => ({ ...prev, osapVerificationReceived: val }))}
          onDateChange={(date) => setFormData(prev => ({ ...prev, osapVerificationReceivedDate: date }))}
        />

        <StatusTrackingSection
          title="OSAP Application Status"
          yesNoValue={formData.osapApplicationActive ?? null}
          dateValue={formData.osapApplicationActiveDate || ''}
          onYesNoChange={(val) => setFormData(prev => ({ ...prev, osapApplicationActive: val }))}
          onDateChange={(date) => setFormData(prev => ({ ...prev, osapApplicationActiveDate: date }))}
        />
      </div>

      {/* Required Documentation */}
      <div className="pt-6 border-t border-gray-300">
        <h3 className="text-lg font-semibold mb-4">Required Documentation</h3>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Scanning Guidelines:</h4>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>PDF only • Max 2MB per file • No password protection</li>
          </ul>
        </div>

        {Object.entries(documents).map(([key, doc]) => {
          const docType = key as DocumentType;
          return (
            <div key={key} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                  <p className="text-sm text-gray-600">Type: {doc.type}</p>
                  {doc.required ? (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-white bg-brand-light-red rounded">
                      Required
                    </span>
                  ) : (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-200 rounded">
                      Optional
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleBrowse(docType)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>

              {doc.files.length > 0 ? (
                <div className="space-y-2 mt-3">
                  {doc.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        onClick={() => handleRemoveFile(docType, index)}
                        className="text-brand-light-red hover:text-brand-light-red ml-2"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-3">No files uploaded</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}