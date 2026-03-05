/**
 * ReviewStepsProgress Component
 * Displays the steps and current progress of the application review process
 */

import { CheckCircle, Clock, Circle, AlertCircle } from 'lucide-react';
import { ApplicationStatus } from '@/types/bswd';

interface ReviewStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'attention-needed';
}

interface ReviewStepsProgressProps {
  applicationStatus: ApplicationStatus;
  submittedDate: string;
  statusUpdatedDate: string;
}

export function ReviewStepsProgress({ 
  applicationStatus, 
  submittedDate,
  statusUpdatedDate 
}: ReviewStepsProgressProps) {
  
  // Determine step status based on application status
  const getSteps = (): ReviewStep[] => {
    const baseSteps: ReviewStep[] = [
      {
        id: 'submission',
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted to the system',
        status: 'completed'
      },
      {
        id: 'initial-review',
        title: 'Initial Review',
        description: 'Verifying application completeness and basic eligibility',
        status: 'pending'
      },
      {
        id: 'document-verification',
        title: 'Document Verification',
        description: 'Verifying disability documentation and supporting files',
        status: 'pending'
      },
      {
        id: 'financial-assessment',
        title: 'Financial Assessment',
        description: 'Assessing funding needs and available assistance',
        status: 'pending'
      },
      {
        id: 'final-decision',
        title: 'Final Decision',
        description: 'Review team making final decision',
        status: 'pending'
      }
    ];

    // Update step status based on current application status
    switch (applicationStatus) {
      case 'submitted':
        baseSteps[1].status = 'in-progress';
        break;
      case 'in-review':
        baseSteps[1].status = 'completed';
        baseSteps[2].status = 'in-progress';
        break;
      case 'in-progress':
        baseSteps[1].status = 'completed';
        baseSteps[2].status = 'attention-needed';
        break;
      case 'accepted':
      case 'denied':
        baseSteps.forEach(step => {
          step.status = 'completed';
        });
        break;
    }

    return baseSteps;
  };

  const steps = getSteps();

  const getStepIcon = (status: ReviewStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'attention-needed':
        return <AlertCircle className="h-6 w-6 text-orange-600" />;
      case 'pending':
        return <Circle className="h-6 w-6 text-gray-300" />;
    }
  };

  const getStepBgColor = (status: ReviewStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50';
      case 'in-progress':
        return 'bg-blue-50';
      case 'attention-needed':
        return 'bg-orange-50';
      case 'pending':
        return 'bg-gray-50';
    }
  };

  const getStepBorderColor = (status: ReviewStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200';
      case 'in-progress':
        return 'border-blue-200';
      case 'attention-needed':
        return 'border-orange-200';
      case 'pending':
        return 'border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Review Progress</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="absolute left-[15px] top-[40px] w-[2px] h-[calc(100%+16px)] bg-gray-200" />
            )}
            
            <div className={`relative flex items-start space-x-4 p-4 rounded-lg border ${getStepBorderColor(step.status)} ${getStepBgColor(step.status)} transition-all`}>
              <div className="flex-shrink-0 relative z-10">
                {getStepIcon(step.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-gray-900">
                    {step.title}
                  </h4>
                  {step.status === 'in-progress' && (
                    <span className="text-xs font-medium text-blue-800 bg-blue-100 px-2 py-1 rounded">
                      In Progress
                    </span>
                  )}
                  {step.status === 'completed' && (
                    <span className="text-xs font-medium text-green-800 bg-green-100 px-2 py-1 rounded">
                      Completed
                    </span>
                  )}
                  {step.status === 'attention-needed' && (
                    <span className="text-xs font-medium text-orange-800 bg-orange-100 px-2 py-1 rounded">
                      Attention Needed
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {step.description}
                </p>
                
                {/* Display timestamps */}
                {step.status === 'completed' && step.id === 'submission' && (
                  <p className="mt-2 text-xs text-gray-500">
                    Completed: {new Date(submittedDate).toLocaleDateString()} {new Date(submittedDate).toLocaleTimeString()}
                  </p>
                )}
                
                {step.status === 'in-progress' && (
                  <p className="mt-2 text-xs text-gray-500">
                    Started: {new Date(statusUpdatedDate).toLocaleDateString()} {new Date(statusUpdatedDate).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estimated completion time */}
      {(applicationStatus === 'submitted' || applicationStatus === 'in-review') && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Estimated Review Time:</strong> The complete review process typically takes 2-3 weeks. We will notify you by email when there are important updates.
          </p>
        </div>
      )}
    </div>
  );
}
