/**
 * ThankYouPage component
 * 
 * Displays confirmation page after successful submission of the BSWD/CSG-DSE application.
 * Shows the generated Application ID and a brief success message.
 */

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ThankYouPage() {
  const [app, setApp] = useState<{ id: string; studentName: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawData = localStorage.getItem("currentApplication");
      if (rawData) {
        try {
          const data = JSON.parse(rawData);
          setApp({ id: data.id, studentName: data.studentName });
        } catch (err){
          console.error("Error parsing application data: ", err);
        }
      }
    }
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white"
      style={{ fontFamily: `"Raleway", "Helvetica Neue", Helvetica, Arial, sans-serif` }}
    >
      <div className="max-w-lg mx-auto text-center px-6 py-10 border rounded-xl shadow-sm bg-white">
        <h1 className="text-2xl font-semibold text-[#0071a9] mb-3">
          Thank You for Your Submission!
        </h1>
        <p className="text-gray-700 mb-6">
          Your BSWD/CSG-DSE application has been successfully submitted.
        </p>

        {app && (
          <div className="mb-8">
            <p className="text-gray-600 text-sm">Application ID</p>
            <p className="text-xl font-mono font-semibold text-[#0071a9]">
              {app.id}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Submitted by: {app.studentName}
            </p>
          </div>
        )}

        <Link
          href="/"
          className="px-6 py-2.5 text-sm rounded-xl bg-cyan-800 text-white hover:bg-cyan-700"
        >
          Back to Application
        </Link>
      </div>
    </div>
  );
}
