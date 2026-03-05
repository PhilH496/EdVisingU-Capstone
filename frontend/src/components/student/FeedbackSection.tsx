/**
 * FeedbackSection Component
 * Displays feedback from the review team and actions required by the student
 */

import { AlertCircle, CheckCircle, Info, Upload, FileText } from 'lucide-react';
import { ApplicationStatus } from '@/types/bswd';
import { useTranslation } from "@/lib/i18n"; // translation import

interface FeedbackItem {
  id: string;
  type: 'info' | 'warning' | 'success' | 'action-required';
  title: string;
  message: string;
  timestamp?: string;
  actionable?: boolean;
}

interface FeedbackSectionProps {
  status: ApplicationStatus;
  feedbackItems?: FeedbackItem[];
}

export function FeedbackSection({ status, feedbackItems }: FeedbackSectionProps) {
  const { t, isLoaded } = useTranslation(); // translation helper
  
  // Generate default feedback based on status
  const getDefaultFeedback = (): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    switch (status) {
      case 'submitted':
        feedback.push({
          id: 'submitted-0',
          type: 'success',
          title: t("feedbackSection.defaults.submitted.0.title"),
          message: t("feedbackSection.defaults.submitted.0.message"),
          actionable: false
        });
        feedback.push({
          id: 'submitted-1',
          type: 'info',
          title: t("feedbackSection.defaults.submitted.1.title"),
          message: t("feedbackSection.defaults.submitted.1.message"),
          actionable: false
        });
        break;

      case 'in-review':
        feedback.push({
          id: 'inReview-0',
          type: 'info',
          title: t("feedbackSection.defaults.inReview.0.title"),
          message: t("feedbackSection.defaults.inReview.0.message"),
          actionable: false
        });
        break;

      case 'in-progress':
        feedback.push({
          id: 'inProgress-0',
          type: 'warning',
          title: t("feedbackSection.defaults.inProgress.0.title"),
          message: t("feedbackSection.defaults.inProgress.0.message"),
          actionable: true
        });
        feedback.push({
          id: 'inProgress-1',
          type: 'action-required',
          title: t("feedbackSection.defaults.inProgress.1.title"),
          message: t("feedbackSection.defaults.inProgress.1.message"),
          actionable: true
        });
        break;

      case 'accepted':
        feedback.push({
          id: 'accepted-0',
          type: 'success',
          title: t("feedbackSection.defaults.accepted.0.title"),
          message: t("feedbackSection.defaults.accepted.0.message"),
          actionable: false
        });
        feedback.push({
          id: 'accepted-1',
          type: 'info',
          title: t("feedbackSection.defaults.accepted.1.title"),
          message: t("feedbackSection.defaults.accepted.1.message"),
          actionable: false
        });
        break;

      case 'denied':
        feedback.push({
          id: 'denied-0',
          type: 'warning',
          title: t("feedbackSection.defaults.denied.0.title"),
          message: t("feedbackSection.defaults.denied.0.message"),
          actionable: false
        });
        feedback.push({
          id: 'denied-1',
          type: 'info',
          title: t("feedbackSection.defaults.denied.1.title"),
          message: t("feedbackSection.defaults.denied.1.message"),
          actionable: true
        });
        break;
    }

    return feedback;
  };

  const allFeedback = feedbackItems || getDefaultFeedback();

  if (allFeedback.length === 0) {
    return null;
  }

  const getIcon = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-orange-600" />;
      case 'action-required':
        return <Upload className="h-6 w-6 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getBgColor = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'action-required':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{t("feedbackSection.title")}</h3>
      
      <div className="space-y-4">
        {allFeedback.map((item) => (
          <div 
            key={item.id} 
            className={`p-4 rounded-lg border ${getBgColor(item.type)} transition-all`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getIcon(item.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-gray-900">
                    {item.title}
                  </h4>
                  {item.actionable && (
                    <span className="ml-2 text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                      {t("feedbackSection.actionRequiredBadge")}
                    </span>
                  )}
                </div>
                
                <p className="mt-2 text-sm text-gray-700">
                  {item.message}
                </p>
                
                {item.timestamp && (
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString('en-US')} {new Date(item.timestamp).toLocaleTimeString('en-US')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact information */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          {t("feedbackSection.needHelp.title")}
        </h4>
        <p className="text-sm text-gray-600">
          {t("feedbackSection.needHelp.messagePrefix")}
          <a href="mailto:support@edvisingu.ca" className="text-blue-600 hover:underline ml-1">
            {t("feedbackSection.needHelp.supportEmail")}
          </a>
        </p>
      </div>
    </div>
  );
}
