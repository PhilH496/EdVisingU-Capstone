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
import { Upload, X } from "lucide-react";

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

export function DocumentsStep({ formData, setFormData }: DocumentsStepProps) {
  const [documents, setDocuments] = useState<Record<DocumentType, DocumentInfo>>({
    osapApplication: {
      title: "OSAP Application Form",
      type: "OSAP Application",
      required: true,
      files: []
    },
    disabilityVerification: {
      title: "OSAP Disability Verification Form",
      type: "Disability Verification",
      required: false,
      files: []
    },
    serviceRecommendations: {
      title: "DSO/ASO Service Recommendations",
      type: "Service Recommendations",
      required: true,
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

      // Update formData
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

    // Update formData
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
      <h2 className="text-xl font-semibold mb-4">Required Documentation</h2>

      {/* Scanning Guidelines */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Scanning Guidelines:</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Scan each document separately (not all in one file)</li>
          <li>Use black & white, text style scanning</li>
          <li>Recommended: 150-200 DPI resolution</li>
          <li>Save as PDF format only</li>
          <li>PDF only • Max 2MB per file • No password protection</li>
        </ul>
      </div>

      {Object.entries(documents).map(([key, doc]) => {
        const docType = key as DocumentType;
        return (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                <p className="text-sm text-gray-600">Type: {doc.type}</p>
                {doc.required ? (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded">
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

            {/* Uploaded Files List */}
            {doc.files.length > 0 ? (
              <div className="space-y-2 mt-3">
                {doc.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      onClick={() => handleRemoveFile(docType, index)}
                      className="text-red-600 hover:text-red-800 ml-2"
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
  );
}