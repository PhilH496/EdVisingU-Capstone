/**
 * ThankYouPage component
 * 
 * Displays confirmation page after successful submission of the BSWD/CSG-DSE application.
 * Shows the generated Application ID and a brief success message.
 * Provides option to view application status or automatically redirects after 10 seconds.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";

export default function ThankYouPage() {
  const router = useRouter();
  const [app, setApp] = useState<{ id: string; studentName: string } | null>(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseReady() || !supabase) return;

      const params = new URLSearchParams(window.location.search);
      const appId = params.get("appId");

      const { data, error } = await supabase
        .from("applications")
        .select("id, student_name")
        .eq("id", appId)
        .single();

      if (!error && data) {
        setApp({ id: data.id, studentName: data.student_name });
      }
    };

    load();
  }, []);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/student-dashboard');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router]);

  const handleViewStatus = () => {
    router.push('/student-dashboard');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50"
      style={{ fontFamily: `"Raleway", "Helvetica Neue", Helvetica, Arial, sans-serif` }}
    >
      <div className="max-w-lg mx-auto text-center px-8 py-12 border rounded-xl shadow-lg bg-white">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Thank You for Your Submission!
        </h1>
        <p className="text-gray-600 mb-8">
          Your BSWD/CSG-DSE application has been successfully submitted and is now being reviewed.
        </p>

        {app && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-gray-700 text-sm font-medium mb-2">Application ID</p>
            <p className="text-2xl font-mono font-bold text-blue-600 mb-4">
              <div id="applicationId">
                {app.id}
              </div>
            </p>
            <p className="text-sm text-gray-600">
              <div id="submittedByName">
                Submitted by: <span className="font-semibold">{app.studentName}</span>
              </div>
            </p>
          </div>
        )}

        {/* Auto-redirect message */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            You will be automatically redirected to your application status page in{' '}
            <span className="font-bold text-blue-600">{countdown}</span> seconds
          </p>
        </div>

        {/* Primary action button */}
        <div className="space-y-3">
          <button
            onClick={handleViewStatus}
            className="w-full px-6 py-3 text-base font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            View Application Status Now
          </button>
          
          <Link
            href="/"
            className="block w-full px-6 py-3 text-base font-medium rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
