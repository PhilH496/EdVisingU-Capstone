import { useState, useEffect } from 'react';
import { Application, ApplicationStatus } from '@/types/bswd';
import { ReviewStepsProgress } from '@/components/student/ReviewStepsProgress';
import { ApplicationDetails } from '@/components/student/ApplicationDetails';
import { FeedbackSection } from '@/components/student/FeedbackSection';
import { StudentFooter } from '@/components/bswd/StudentFooter';
import { CheckCircle, Clock, FileText, XCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function ApplicationStatusPage() {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem('currentApplication');
    if (storedData) {
      try {
        setApplication(JSON.parse(storedData));
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
          description: 'Our team is reviewing your application and supporting documents.'
        };
      case 'in-progress':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'In Progress',
          description: 'Additional information or documents are required to process your application.'
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Approved',
          description: 'Congratulations! Your application has been approved.'
        };
      case 'denied':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Not Approved',
          description: 'Unfortunately, your application was not approved at this time.'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-black border-b border-black">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center">
            <Image
              src="/ontario-logo.png"
              alt="Government of Ontario"
              width={130}
              height={30}
              priority
              className="filter invert" 
            />
          </div>
        </header>

        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
              <p className="mt-2 text-gray-600">
                Track the progress of your BSWD/CSG-DSE funding application
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
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-black border-b border-black">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center">
            <Image
              src="/ontario-logo.png"
              alt="Government of Ontario"
              width={130}
              height={30}
              priority
              className="filter invert" 
            />
          </div>
        </header>

        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
              <p className="mt-2 text-gray-600">
                Track the progress of your BSWD/CSG-DSE funding application
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-gray-600">No application found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black border-b border-black">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center">
          <Image
            src="/ontario-logo.png"
            alt="Government of Ontario"
            width={130}
            height={30}
            priority
            className="filter invert" 
          />
        </div>
      </header>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
            <p className="mt-2 text-gray-600">
              Track the progress of your BSWD/CSG-DSE funding application
            </p>
          </div>

        {/* Status Card */}
        <div className={`bg-white rounded-xl shadow-lg border-l-4 ${statusConfig.borderColor} p-6 mb-8`}>
          <div className="flex items-start space-x-4">
            <div className={`${statusConfig.bgColor} p-3 rounded-full`}>
              <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className={`text-2xl font-bold ${statusConfig.color}`}>
                  {statusConfig.label}
                </h2>
                <span className="text-sm text-gray-500">
                  最后更新: {new Date(application.statusUpdatedDate).toLocaleDateString('zh-CN', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </span>
              </div>
              <p className="mt-2 text-gray-700 text-lg">{statusConfig.description}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <ReviewStepsProgress
              applicationStatus={application.status}
              submittedDate={application.submittedDate}
              statusUpdatedDate={application.statusUpdatedDate}
            />
            <FeedbackSection status={application.status} />
          </div>
          
          <div className="lg:col-span-1">
            <ApplicationDetails application={application} />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button 
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
            onClick={() => window.print()}
          >
            Print Application Status
          </button>
        </div>
        </div>
      </div>

      <StudentFooter />
    </div>
  );
}
