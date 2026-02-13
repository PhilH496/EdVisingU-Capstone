/**
 * Landing Page - EdvisingU BSWD Portal
 */

import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { StudentFooter } from '@/components/bswd/StudentFooter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>BSWD: Bursary for Students with Disabilities</title>
        <meta name="description" content="Get help paying for disability-related services and equipment when you qualify for BSWD." />
      </Head>

      <div className="min-h-screen bg-white">
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
            <LanguageSwitcher />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title Section */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                BSWD: Bursary for Students with Disabilities
              </h1>
              <p className="text-base text-gray-700 mb-4">
                Get help paying for disability-related services and equipment when you qualify for BSWD.
              </p>
              <div className="flex gap-3">
                <Link 
                  href="/login" 
                  className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 font-medium text-sm"
                >
                  Log in
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-2 hover:bg-blue-50 font-medium text-sm"
                >
                  Register
                </Link>
              </div>
            </div>
            
            {/* BSWD Logo */}
            <div className="mt-6 md:mt-0 flex-shrink-0">
              <div className="border-4 border-black px-6 py-4 inline-block relative">
                <div className="text-3xl font-bold">BSWD</div>
              </div>
            </div>
          </div>

          <hr className="border-t-2 border-gray-300 mb-8" />

          {/* Two Column Layout for general section*/}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Updates Box */}
            <div className="md:col-span-2">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">BSWD updates</h2>
                    <ul className="space-y-3 text-sm">
                      <li>
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                          2025-2026 BSWD application 
                        </Link>
                        {' '}open for full-time and part-time students
                      </li>
                      <li>
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                          Log in to your BSWD account
                        </Link>
                        {' '}for a list of approved services and equipment
                      </li>
                      <li>
                        <Link href="#info-module" className="text-blue-600 hover:underline font-medium">
                          BSWD information module
                        </Link>
                        {' '}for students making their first application
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI-Powered Infographic Section */}
              <div className="bg-gray-100 border border-gray-300 p-6 mb-8">
                <h2 className="text-lg font-bold mb-3">
                    AI-Powered Application Assistance
                </h2>
                <p className="text-sm text-gray-700">
                  Receive smart support throughout your BSWD application with automated document review, eligibility evaluation, 
                  quick response times, and 24/7 chatbot assistance.
                </p>
              </div>
            </div>

            {/* Right Column - Navigation Links for questions that go straight to original page*/}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-blue-600 hover:underline mb-2">
                  <Link href="https://osap.gov.on.ca/OSAPPortal/en/A-ZListofAid/POCONT1_098083">Learn about BSWD</Link> 
                </h2>
                <p className="text-sm text-gray-700">How to qualify</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-blue-600 hover:underline mb-2">
                  <Link href="https://osap.gov.on.ca/OSAPPortal/en/A-ZListofAid/POCONT1_098083">How to apply for BSWD</Link>
                </h2>
                <p className="text-sm text-gray-700">How and when to apply</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-blue-600 hover:underline mb-2">
                  <Link href="https://osap.gov.on.ca/OSAPPortal/en/A-ZListofAid/POCONT1_098083">After you apply</Link>
                </h2>
                <p className="text-sm text-gray-700">How to get the funding and more</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-blue-600 hover:underline mb-2">
                  <Link href="https://osap.gov.on.ca/OSAPPortal/en/A-ZListofAid/POCONT1_098083">After getting your funding</Link>
                </h2>
                <p className="text-sm text-gray-700">Find out what happens next</p>
              </div>
            </div>
          </div>

          <hr className="border-t-2 border-gray-300 mb-8" />

          {/* Video Demo Section for future use */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              See how the BSWD application works
            </h2>
            
            <div className="bg-gray-800 rounded aspect-video flex items-center justify-center mb-4">
              <div className="text-center text-white">
                <p className="text-lg font-medium">VIDEO PLACEHOLDER</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              This video explains how to complete your BSWD application with AI assistance and track your application status.
            </p>
          </section>

          {/* Column Bottom Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Left Column includes infographic about under-represented learners and resources*/}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Under-represented learners</h2>
              <ul className="space-y-2">
                <li><Link href="https://www.ontario.ca/page/osap-for-under-represented-learners#section-0" className="text-blue-600 hover:underline text-sm">Indigenous students</Link></li>
                <li><Link href="https://www.ontario.ca/page/osap-for-under-represented-learners#section-1" className="text-blue-600 hover:underline text-sm">Extended Society Care (current and former Crown wards)</Link></li>
                <li><Link href="https://www.ontario.ca/page/osap-for-under-represented-learners#section-2" className="text-blue-600 hover:underline text-sm">First-generation students</Link></li>
                <li><Link href="https://www.ontario.ca/page/osap-for-under-represented-learners#section-3" className="text-blue-600 hover:underline text-sm">Students with disabilities</Link></li>
                <li><Link href="https://www.ontario.ca/page/osap-for-under-represented-learners#section-4" className="text-blue-600 hover:underline text-sm">Students who are Deaf or have trouble hearing</Link></li>
              </ul>

            </div>

            {/* Right Column includes questions about BSWD*/}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions about BSWD</h2>
              <p className="text-sm text-gray-700 mb-4">
                <Link href="https://osap.gov.on.ca/OSAPPortal/en/Contacts/ProvinciallyfundedSchoolsinOntario/index.htm" className="text-blue-600 hover:underline">
                  Contact your school's Financial Aid Office.
                </Link>
              </p>
              <p className="text-sm text-gray-700 mb-4">
                <Link href="https://www.ontario.ca/page/learn-about-osap#section-2" className="text-blue-600 hover:underline">
                  Students on social assistance
                </Link>
              </p>

              <p className="text-sm text-gray-700 mb-4">
                <Link href="https://www.ontario.ca/page/student-loans-grants-scholarships-and-bursaries" className="text-blue-600 hover:underline">
                  Other loans, grants, scholarships and bursaries
                </Link>
              </p>

              <p className="text-sm text-gray-700 mb-4">
                <Link href="https://www.ontario.ca/page/learn-about-colleges-universities-and-indigenous-institutes-ontario" className="text-blue-600 hover:underline">
                  Go to college or university in Ontario
                </Link>
                : Admission requirements and application process.
              </p>
            </div>
          </div>

          <hr className="border-t-2 border-gray-300 mb-8" />

          {/* Information Module Section (PLACE HOLDER, MAYBE/MAYBE NOT IMPLEMENT)*/}
          <section id="info-module" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">BSWD information module</h2>


            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2 ml-4">
              <li>
                full-time or part-time student making your first{' '}
                <Link href="" className="text-blue-600 hover:underline">
                  BSWD application for the 2024-2025 or 2025-2026 school year
                </Link>
              </li>
            </ul>

            <p className="text-gray-700 mb-4">
              If you reapply to BSWD for the 2024-2025 or 2025-2026 school year, you will not need to complete this module again.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">The module will help you understand:</h3>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2 ml-4">
              <li>how BSWD works</li>
              <li>your roles and responsibilities if you become a BSWD recipient</li>
              <li>how AI tools can help streamline your application process</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-3">How the module works</h3>
            <p className="text-gray-700 mb-4">
              The interactive module contains short, self-study sections with information you must read before you start your 
              BSWD Application. At the end of each section, you will be asked to answer a question about what you've just read.
            </p>

            <p className="text-gray-700 mb-4">
              Correct answers let you move to the next section of the module. When you've finished the information module, 
              your BSWD Application will open.
            </p>

            <p className="text-gray-700">
              You can log in and out of the module at any time, and your progress will be saved.
            </p>

            <p className="text-gray-700 mt-4">
              If you choose to complete the module in one sitting, it will take you approximately 15 minutes.
            </p>
          </section>
        </main>

        {/* Footer */}
        <StudentFooter />
      </div>
    </>
  );
}
