/**
 * FeedbackSection Component
 * Displays feedback from the review team and actions required by the student
 */

import { AlertCircle, CheckCircle, Info, Upload, FileText } from 'lucide-react';
import { ApplicationStatus } from '@/types/bswd';

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
  
  // Generate default feedback based on status
  const getDefaultFeedback = (): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    switch (status) {
      case 'submitted':
        feedback.push({
          id: 'submitted-1',
          type: 'success',
          title: 'Application Received',
          message: 'Your application has been successfully submitted and we will begin the review process soon.',
          actionable: false
        });
        feedback.push({
          id: 'submitted-2',
          type: 'info',
          title: 'Next Steps',
          message: 'Please keep your email accessible as we will contact you by email. Expected review time is 2-3 weeks.',
          actionable: false
        });
        break;

      case 'in-review':
        feedback.push({
          id: 'review-1',
          type: 'info',
          title: 'Review In Progress',
          message: 'Our team is carefully reviewing your application materials and supporting documents. We will contact you promptly if additional information is needed.',
          actionable: false
        });
        break;

      case 'in-progress':
        feedback.push({
          id: 'progress-1',
          type: 'warning',
          title: 'Additional Information Required',
          message: 'To continue processing your application, we need some additional information or documents. Please review the specific requirements below.',
          actionable: true
        });
        feedback.push({
          id: 'progress-2',
          type: 'action-required',
          title: 'Action Required',
          message: 'Please provide the required materials within 10 business days to avoid processing delays. You can submit documents through your school\'s disability services office.',
          actionable: true
        });
        break;

      case 'accepted':
        feedback.push({
          id: 'accepted-1',
          type: 'success',
          title: 'Application Approved!',
          message: 'Congratulations! Your application has been approved. You will receive a formal approval letter within 3-5 business days.',
          actionable: false
        });
        feedback.push({
          id: 'accepted-2',
          type: 'info',
          title: 'Funding Disbursement',
          message: 'Funds will be disbursed according to the schedule outlined in the approval letter. Please carefully review the terms and conditions in the approval letter.',
          actionable: false
        });
        break;

      case 'denied':
        feedback.push({
          id: 'denied-1',
          type: 'warning',
          title: 'Application Not Approved',
          message: 'Unfortunately, your application was not approved at this time. You will receive an email with detailed reasoning.',
          actionable: false
        });
        feedback.push({
          id: 'denied-2',
          type: 'info',
          title: 'Appeal Rights',
          message: 'If you believe the decision was in error or have additional information to provide, you have the right to appeal within 30 days of receiving the decision.',
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
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Notifications & Feedback</h3>
      
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
                      Action Required
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
          Need Help?
        </h4>
        <p className="text-sm text-gray-600">
          If you have any questions, please contact your school's disability services office, or email us at
          <a href="mailto:support@edvisingu.ca" className="text-blue-600 hover:underline ml-1">
            support@edvisingu.ca
          </a>
        </p>
      </div>
    </div>
  );
}
