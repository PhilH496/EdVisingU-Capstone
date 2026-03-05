import { useState, useEffect } from 'react';
import { Application, ApplicationStatus } from '@/types/bswd';
import { ReviewStepsProgress } from '@/components/student/ReviewStepsProgress';
import { ApplicationDetails } from '@/components/student/ApplicationDetails';
import { FeedbackSection } from '@/components/student/FeedbackSection';
import { StudentFooter } from '@/components/bswd/StudentFooter';
import { CheckCircle, Clock, FileText, XCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ApplicationStatusPage() {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserApplication = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // First, get the student record by email to find their student_id
        const { data: studentData, error: studentError } = await supabase
          .from('student')
          .select('student_id')
          .eq('email', user.email)
          .single();

        if (studentError || !studentData) {
          console.error('Error fetching student:', studentError);
          setIsLoading(false);
          return;
        }

        // Then fetch the application using the student_id
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select('*')
          .eq('student_id', studentData.student_id.toString())
          .order('submitted_date', { ascending: false })
          .limit(1)
          .single();

        if (appError) {
          console.error('Error fetching application:', appError);
        } else if (appData) {
          // Convert snake_case to camelCase for the Application interface
          const formattedApp: Application = {
            id: appData.id,
            studentName: appData.student_name,
            studentId: appData.student_id,
            submittedDate: appData.submitted_date,
            status: appData.status,
            program: appData.program || 'Not specified',
            institution: appData.institution || 'Not specified',
            studyPeriod: appData.study_period || 'Not specified',
            statusUpdatedDate: appData.status_updated_date
          };
          setApplication(formattedApp);
        }
      } catch (error) {
        console.error('Error loading application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserApplication();
  }, [user]);

  const getStatusConfig = (status: ApplicationStatus) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case 'submitted':
        return {
          icon: FileText,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Submitted',
          description: 'Your application has been successfully submitted and is in queue for review.'
        };
      case 'in review':
      case 'in-review':
      case 'reviewing':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'In Review',
          description: 'Our team is reviewing your application and supporting documents.'
        };
      case 'in-progress':
      case 'in progress':
      case 'pending':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'In Progress',
          description: 'Additional information or documents are required to process your application.'
        };
      case 'accepted':
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Approved',
          description: 'Congratulations! Your application has been approved.'
        };
      case 'denied':
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Not Approved',
          description: 'Unfortunately, your application was not approved at this time.'
        };
      default:
        // Default fallback for unknown statuses
        console.warn('Unknown application status:', status);
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: status || 'Unknown',
          description: 'Your application is being processed.'
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
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Application Found</h2>
              <p className="text-gray-600 mb-6">You have not submitted any applications yet.</p>
              <Link
                href="/application"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Start New Application
              </Link>
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
                  Last Updated: {new Date(application.statusUpdatedDate).toLocaleDateString('en-US', { 
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
