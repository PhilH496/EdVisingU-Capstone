/**
 * Application Status Page
 * 
 * Displays the current status of a submitted BSWD application.
 * Shows different states: submitted, in-review, in-progress, accepted, or denied
 * 
 * Features:
 * - Color-coded status badges
 * - Application details summary
 * - Timeline of status updates
 * - Next steps information
 */

import { useState, useEffect } from 'react';
import { Application, ApplicationStatus } from '@/types/bswd';
import { CheckCircle, Clock, FileText, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ApplicationStatusPage() {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load application data from localStorage
    const storedData = localStorage.getItem('currentApplication');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setApplication(parsedData);
      } catch (error) {
        console.error('Error parsing application data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const getStatusConfig = (status: ApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return {
          icon: FileText,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Submitted',
          description: 'Your application has been successfully submitted and is in queue for review.'
        };
      case 'in-review':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'In Review',
          description: 'Our team is currently reviewing your application and supporting documents.'
        };
      case 'in-progress':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'In Progress',
          description: 'Additional information or documentation is required to process your application.'
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Accepted',
          description: 'Congratulations! Your application has been approved.'
        };
      case 'denied':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Denied',
          description: 'Unfortunately, your application was not approved at this time.'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-brand-dark-blue hover:underline mb-4 inline-block">
              ← Back to Application
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
            <p className="mt-2 text-gray-600">
              Track the progress of your BSWD/CSG-DSE application
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark-blue mx-auto mb-4"></div>
              <p className="text-gray-600">Loading application status...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-brand-dark-blue hover:underline mb-4 inline-block">
              ← Back to Application
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
            <p className="mt-2 text-gray-600">
              Track the progress of your BSWD/CSG-DSE application
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No application found.</p>
            <Link href="/" className="text-brand-dark-blue hover:underline">
              Return to application form
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-brand-dark-blue hover:underline mb-4 inline-block">
            ← Back to Application
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
          <p className="mt-2 text-gray-600">
            Track the progress of your BSWD/CSG-DSE application
          </p>
        </div>

        {/* Status Card */}
        <div className={`bg-white rounded-lg shadow-md border-l-4 ${statusConfig.borderColor} p-6 mb-6`}>
          <div className="flex items-start space-x-4">
            <div className={`${statusConfig.bgColor} p-3 rounded-full`}>
              <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${statusConfig.color}`}>
                  {statusConfig.label}
                </h2>
                <span className="text-sm text-gray-500">
                  Updated: {new Date(application.statusUpdatedDate).toLocaleDateString()} at {new Date(application.statusUpdatedDate).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-2 text-gray-700">{statusConfig.description}</p>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Application Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Application ID</p>
              <p className="mt-1 text-gray-900">{application.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Submitted Date</p>
              <p className="mt-1 text-gray-900">
                {new Date(application.submittedDate).toLocaleDateString()} at {new Date(application.submittedDate).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Student Name</p>
              <p className="mt-1 text-gray-900">{application.studentName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Student ID</p>
              <p className="mt-1 text-gray-900">{application.studentId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Program</p>
              <p className="mt-1 text-gray-900">{application.program}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Institution</p>
              <p className="mt-1 text-gray-900">{application.institution}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Study Period</p>
              <p className="mt-1 text-gray-900">{application.studyPeriod}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Application Timeline</h3>
          <div className="space-y-4">
            {/* Timeline items */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                <p className="text-sm text-gray-500">
                  {new Date(application.submittedDate).toLocaleDateString()} at {new Date(application.submittedDate).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {(application.status === 'in-review' || 
              application.status === 'in-progress' || 
              application.status === 'accepted' || 
              application.status === 'denied') && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`h-8 w-8 rounded-full ${application.status === 'in-review' ? 'bg-yellow-100' : 'bg-green-100'} flex items-center justify-center`}>
                    <Clock className={`h-5 w-5 ${application.status === 'in-review' ? 'text-yellow-600' : 'text-green-600'}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Review Started</p>
                  <p className="text-sm text-gray-500">
                    {new Date(application.statusUpdatedDate).toLocaleDateString()} at {new Date(application.statusUpdatedDate).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}

            {(application.status === 'accepted' || application.status === 'denied') && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`h-8 w-8 rounded-full ${application.status === 'accepted' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                    {application.status === 'accepted' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Decision Made: {application.status === 'accepted' ? 'Approved' : 'Denied'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(application.statusUpdatedDate).toLocaleDateString()} at {new Date(application.statusUpdatedDate).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h3>
          <div className="prose text-gray-700">
            {application.status === 'submitted' && (
              <p>
                Your application is in queue and will be reviewed soon. You will receive an email notification 
                when the review process begins. Please ensure your contact information is up to date.
              </p>
            )}
            {application.status === 'in-review' && (
              <p>
                Our team is carefully reviewing your application. This process typically takes 2-3 weeks. 
                We will contact you if any additional information is needed.
              </p>
            )}
            {application.status === 'in-progress' && (
              <p>
                Please check your email for details about what additional information or documentation is required. 
                Submit the requested items as soon as possible to avoid delays in processing your application.
              </p>
            )}
            {application.status === 'accepted' && (
              <p>
                Congratulations! You will receive a formal approval letter via email within 3-5 business days. 
                Please review the terms and conditions outlined in the letter. Funding disbursement information 
                will be provided separately.
              </p>
            )}
            {application.status === 'denied' && (
              <p>
                We understand this may be disappointing. You will receive a detailed explanation via email. 
                If you believe there was an error or have additional information to provide, you may submit 
                an appeal within 30 days of this decision.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6">
          <button 
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            onClick={() => window.print()}
          >
            Print Application Status
          </button>
        </div>
      </div>
    </div>
  );
}
