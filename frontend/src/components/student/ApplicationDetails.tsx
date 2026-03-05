/**
 * ApplicationDetails Component
 * Displays detailed application information in a student-friendly format
 */

import { FileText, User, GraduationCap, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { Application } from '@/types/bswd';
import { useTranslation } from "@/lib/i18n"; // translation import

interface ApplicationDetailsProps {
  application: Application;
}

interface DetailSection {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: Array<{ label: string; value: string | number }>;
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
  const { t, isLoaded } = useTranslation(); // translation helper
  
  const sections: DetailSection[] = [
    {
      icon: FileText,
      title: t("applicationDetails.sections.applicationInfo.title"),
      items: [
        { label: t("applicationDetails.sections.applicationInfo.labels.applicationId"), value: application.id },
        { label: t("applicationDetails.sections.applicationInfo.labels.submittedDate"), value: new Date(application.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
        { label: t("applicationDetails.sections.applicationInfo.labels.lastUpdated"), value: new Date(application.statusUpdatedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }
      ]
    },
    {
      icon: User,
      title: t("applicationDetails.sections.studentInfo.title"),
      items: [
        { label: t("applicationDetails.sections.studentInfo.labels.name"), value: application.studentName },
        { label: t("applicationDetails.sections.studentInfo.labels.studentId"), value: application.studentId }
      ]
    },
    {
      icon: GraduationCap,
      title: t("applicationDetails.sections.academicInfo.title"),
      items: [
        { label: t("applicationDetails.sections.academicInfo.labels.institution"), value: application.institution },
        { label: t("applicationDetails.sections.academicInfo.labels.program"), value: application.program },
        { label: t("applicationDetails.sections.academicInfo.labels.studyPeriod"), value: application.studyPeriod }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{t("applicationDetails.title")}</h3>
      
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
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{t("applicationDetails.summary.title")}</h4>
        <p className="text-sm text-gray-600">
          {t("applicationDetails.summary.p1Prefix")}{" "}
          <strong>{new Date(application.submittedDate).toLocaleDateString('en-US')}</strong>.
          {" "}
          {t("applicationDetails.summary.p1Middle")}{" "}
          <strong className="font-mono">{application.id}</strong>.
          {" "}
          {t("applicationDetails.summary.p1Suffix")}
        </p>
      </div>
    </div>
  );
}
