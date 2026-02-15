/**
 * ApplicationDetails Component
 * 显示申请的详细信息，以学生友好的方式展示
 */

import { FileText, User, GraduationCap, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { Application } from '@/types/bswd';

interface ApplicationDetailsProps {
  application: Application;
}

interface DetailSection {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: Array<{ label: string; value: string | number }>;
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
  
  const sections: DetailSection[] = [
    {
      icon: FileText,
      title: 'Application Information',
      items: [
        { label: 'Application ID', value: application.id },
        { label: 'Submitted Date', value: new Date(application.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
        { label: 'Last Updated', value: new Date(application.statusUpdatedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }
      ]
    },
    {
      icon: User,
      title: 'Student Information',
      items: [
        { label: 'Name', value: application.studentName },
        { label: 'Student ID', value: application.studentId }
      ]
    },
    {
      icon: GraduationCap,
      title: 'Academic Information',
      items: [
        { label: 'Institution', value: application.institution },
        { label: 'Program', value: application.program },
        { label: 'Study Period', value: application.studyPeriod }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Application Details</h3>
      
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => {
          const IconComponent = section.icon;
          return (
            <div key={sectionIndex} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-center space-x-2 mb-4">
                <IconComponent className="h-5 w-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-800">{section.title}</h4>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 ml-7">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <p className="text-sm font-medium text-gray-500">{item.label}</p>
                    <p className="mt-1 text-base text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Application summary card */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Application Summary</h4>
        <p className="text-sm text-gray-600">
          You submitted your BSWD/CSG-DSE funding application on <strong>{new Date(application.submittedDate).toLocaleDateString('en-US')}</strong>.
          Your application ID is <strong className="font-mono">{application.id}</strong>.
          We will notify you by email at key points during the review process.
        </p>
      </div>
    </div>
  );
}
