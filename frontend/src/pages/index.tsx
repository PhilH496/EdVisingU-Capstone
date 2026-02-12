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
          {/* Title Section with Logo */}
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
                <div className="text-3xl font-bold lowercase">bswd</div>
                <div className="absolute -top-3 -right-3 bg-green-600 rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-t-2 border-gray-300 mb-8" />

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Updates Box */}
            <div className="md:col-span-2">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 rounded-full p-1 mt-1 flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">BSWD updates</h2>
                    <ul className="space-y-3 text-sm">
                      <li>
                        <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                          2025-2026 BSWD application
                        </Link>
                        {' '}open for full-time and part-time students
                      </li>
                      <li>
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                          Log in to your BSWD account
                        </Link>
                        {' '}for a list of approved services and equipment or{' '}
                        <Link href="/signup" className="text-blue-600 hover:underline">
                          open list in a new browser window
                        </Link>
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

              {/* AI-Powered Grant Section */}
              <div className="bg-gray-100 border border-gray-300 p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  <Link href="#" className="text-blue-600 hover:underline">
                    AI-Powered Application Assistance
                  </Link>
                </h2>
                <p className="text-sm text-gray-700">
                  Get intelligent guidance through your BSWD application with automated document analysis, 
                  eligibility assessment, and 24/7 chatbot support.
                </p>
              </div>
            </div>

            {/* Right Column - Navigation Links */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-blue-600 hover:underline mb-2">
                  <Link href="#learn">Learn about BSWD</Link>
                </h2>
                <p className="text-sm text-gray-700">How to qualify</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-blue-600 hover:underline mb-2">
                  <Link href="#apply">How to apply for BSWD</Link>
                </h2>
                <p className="text-sm text-gray-700">How and when to apply</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-blue-600 hover:underline mb-2">
                  <Link href="#after">After you apply</Link>
                </h2>
                <p className="text-sm text-gray-700">How to get the funding and more</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-blue-600 hover:underline mb-2">
                  <Link href="#calculator">BSWD eligibility calculator</Link>
                </h2>
                <p className="text-sm text-gray-700">Find out how much you could get to help pay for your education</p>
              </div>
            </div>
          </div>

          <hr className="border-t-2 border-gray-300 mb-8" />

          {/* Video Demo Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              See how the BSWD application works
            </h2>
            
            <div className="bg-gray-800 rounded aspect-video flex items-center justify-center mb-4">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">▶</div>
                <p className="text-lg font-medium">VIDEO PLACEHOLDER</p>
                <p className="text-sm text-gray-300 mt-2">Watch our application walkthrough</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              This video explains how to complete your BSWD application with AI assistance, 
              upload required documents, and track your funding status.
            </p>
          </section>

          {/* Two Column Bottom Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Left Column */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Under-represented learners</h2>
              <ul className="space-y-2">
                <li><Link href="#" className="text-blue-600 hover:underline text-sm">Indigenous students</Link></li>
                <li><Link href="#" className="text-blue-600 hover:underline text-sm">First-generation students</Link></li>
                <li><Link href="#" className="text-blue-600 hover:underline text-sm">Students with disabilities</Link></li>
                <li><Link href="#" className="text-blue-600 hover:underline text-sm">Students from low-income families</Link></li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-blue-600 hover:underline text-sm">Approved schools</Link></li>
                <li><Link href="#" className="text-blue-600 hover:underline text-sm">Forms</Link></li>
                <li><Link href="#" className="text-blue-600 hover:underline text-sm">BSWD definitions</Link></li>
                <li><Link href="#" className="text-blue-600 hover:underline text-sm">Maintaining BSWD eligibility</Link></li>
              </ul>
            </div>

            {/* Right Column */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions about BSWD</h2>
              <p className="text-sm text-gray-700 mb-4">
                <Link href="#" className="text-blue-600 hover:underline">
                  Students at schools in Ontario: contact your school's Financial Aid Office.
                </Link>
              </p>
              <p className="text-sm text-gray-700 mb-4">
                <Link href="#" className="text-blue-600 hover:underline">
                  Students on social assistance
                </Link>
              </p>

              <p className="text-sm text-gray-700 mb-2 font-bold">Find contacts for:</p>
              <ul className="space-y-2 text-sm list-disc list-inside text-gray-700 ml-2">
                <li>
                  <Link href="#" className="text-blue-600 hover:underline">
                    Accessibility Services
                  </Link>
                  {' '}about your application or to update your information
                </li>
                <li>
                  <Link href="#" className="text-blue-600 hover:underline">
                    BSWD info if you're studying at a school outside of Ontario
                  </Link>
                </li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Beyond BSWD</h3>
              <p className="text-sm text-gray-700 mb-2">
                <Link href="#" className="text-blue-600 hover:underline">
                  Other loans, grants, scholarships and bursaries
                </Link>
              </p>
              <p className="text-sm text-gray-700">
                <Link href="#" className="text-blue-600 hover:underline">
                  Go to college or university in Ontario
                </Link>
                : Admission requirements and application process.
              </p>
            </div>
          </div>

          <hr className="border-t-2 border-gray-300 mb-8" />

          {/* Information Module Section */}
          <section id="info-module" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">BSWD information module</h2>

            <p className="text-gray-700 mb-4">
              You'll need to complete an interactive information module before you start your application if you're a:
            </p>

            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2 ml-4">
              <li>
                full-time or part-time student making your first{' '}
                <Link href="#" className="text-blue-600 hover:underline">
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
              <li>basic financial information to support you through your postsecondary education (for example, creating a budget, understanding credit and debt)</li>
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
