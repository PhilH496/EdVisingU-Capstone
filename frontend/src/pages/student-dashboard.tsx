/**
 * Student Dashboard Page
 * Enhanced student application status viewing page
 * Displays complete application review process, detailed information and feedback
 */

import { useState, useEffect } from 'react';
import { Application } from '@/types/bswd';
import { ReviewStepsProgress } from '@/components/student/ReviewStepsProgress';
import { ApplicationDetails } from '@/components/student/ApplicationDetails';
import { FeedbackSection } from '@/components/student/FeedbackSection';
import { StudentFooter } from '@/components/bswd/StudentFooter';
import { CheckCircle, Clock, FileText, XCircle, AlertCircle, Download, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

export default function StudentDashboard() {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'timeline'>('overview');
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserApplication = async () => {
      if (!user) {
        console.log('No user logged in');
        setIsLoading(false);
        return;
      }

      console.log('Fetching application for user:', user.email);

      try {
        // First, get the student record by email to find their student_id
        const { data: studentData, error: studentError } = await supabase
          .from('student')
          .select('student_id')
          .eq('email', user.email)
          .single();

        if (studentError || !studentData) {
          console.error('Error fetching student:', studentError);
          console.log('No student found with email:', user.email);
          setIsLoading(false);
          return;
        }

        console.log('Found student_id:', studentData.student_id);

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
          console.log('Found application:', appData);
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
        } else {
          console.log('No application found for student_id:', studentData.student_id);
        }
      } catch (error) {
        console.error('Error loading application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserApplication();
  }, [user]);

  const getStatusConfig = (status: Application['status']) => {
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
          description: 'Your application has been successfully submitted and is awaiting review.'
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
          description: 'Additional information or documents are required to complete your application review.'
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
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center">
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
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center">
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
      {/* Header */}
      <header className="bg-black border-b border-black">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <Image
            src="/ontario-logo.png"
            alt="Government of Ontario"
            width={130}
            height={30}
            priority
            className="filter invert"
          />
          <button
            onClick={async () => {
              await signOut();
              router.push('/');
            }}
            className="flex items-center text-white hover:text-gray-300 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Log out
          </button>
        </div>
      </header>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Application Status Dashboard</h1>
            <p className="mt-2 text-gray-600">
              View detailed status and progress of your BSWD/CSG-DSE funding application
            </p>
          </div>

          {/* Status Banner */}
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
                
                {/* Quick Actions */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                  {application.status === 'in-progress' && (
                    <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Required Documents
                    </button>
                  )}
                  {application.status === 'accepted' && (
                    <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                      <Download className="h-4 w-4 mr-2" />
                      Download Approval Letter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'timeline'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Review Progress
              </button>
            </nav>
          </div>

          {/* Content Sections */}
          <div className="grid lg:grid-cols-3 gap-6">
            {activeTab === 'overview' && (
              <>
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
              </>
            )}

            {activeTab === 'details' && (
              <div className="lg:col-span-3">
                <ApplicationDetails application={application} />
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="lg:col-span-3">
                <ReviewStepsProgress
                  applicationStatus={application.status}
                  submittedDate={application.submittedDate}
                  statusUpdatedDate={application.statusUpdatedDate}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <StudentFooter />
    </div>
  );
}
