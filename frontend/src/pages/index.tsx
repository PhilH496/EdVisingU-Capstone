/**
 * Landing Page - EdvisingU BSWD Portal
 */

import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { StudentFooter } from '@/components/bswd/StudentFooter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const [openCard, setOpenCard] = useState<number | null>(null);

  const toggleCard = (index: number) => {
    setOpenCard(openCard === index ? null : index);
  };

  const infoCards = [
    {
      title: "Learn about BSWD",
      brief: "How to qualify",
      description: "BSWD provides funding for disability-related educational costs. You need OSAP approval, documented disability, and enrollment at an approved institution. Learn about exceptions and special circumstances.",
      url: "https://osap.gov.on.ca/OSAPPortal/en/A-ZListofAid/POCONT1_098083"
    },
    {
      title: "How to apply for BSWD",
      brief: "How and when to apply",
      description: "Apply first for the 2025-2026 school year through your OSAP account. Applications open at the start of the academic year. Then complete the required documentation and assessments with our AI-guided assistance.",
      url: "https://osap.gov.on.ca/OSAPPortal/en/A-ZListofAid/POCONT1_098083"
    },
    {
      title: "After you apply",
      brief: "How to get the funding and more",
      description: "Your application will be reviewed by your school's Financial Aid Office. You'll receive an assessment decision and approved funding amount. Track your application status online and receive notifications about next steps.",
      url: "https://osap.gov.on.ca/OSAPPortal/en/A-ZListofAid/POCONT1_098083"
    },
    {
      title: "After getting your funding",
      brief: "Find out what happens next",
      description: "Purchase approved services and equipment, submit receipts for reimbursement, and maintain enrollment requirements. Keep records of all disability-related expenses and follow reporting guidelines throughout the school year.",
      url: "https://osap.gov.on.ca/OSAPPortal/en/A-ZListofAid/POCONT1_098083"
    }
  ];

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
              <div className="flex flex-wrap gap-3">
                <Link 
                  href="/login" 
                  className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 font-medium text-sm inline-flex items-center justify-center"
                >
                  Log in
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-2 hover:bg-blue-50 font-medium text-sm inline-flex items-center justify-center"
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
            <div className="md:col-span-2 flex flex-col">
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
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI-Powered Infographic Section - Now stretches to fill remaining space */}
              <div className="bg-gray-100 border border-gray-300 p-6 flex-1 flex flex-col justify-center">
                <h2 className="text-lg font-bold mb-5">
                    AI-Powered Application Assistance
                </h2>
                <p className="text-sm text-gray-700">
                  Receive smart support throughout your BSWD application with automated document review, eligibility evaluation, 
                  quick response times, and 24/7 chatbot assistance.
                </p>
              </div>
            </div>

            {/* Right Column - Expandable Flashcards */}
            <div className="space-y-3 relative">
              {infoCards.map((card, index) => (
                <div key={index} className="relative">
                  {/* Flashcard */}
                  <button
                    onClick={() => toggleCard(index)}
                    className={`w-full text-left border-2 bg-white p-4 transition-all duration-200 relative z-10 ${
                      openCard === index
                        ? 'border-blue-600 shadow-md'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-blue-600 mb-1">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-700">{card.brief}</p>
                      </div>
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-200`}
                      />
                    </div>
                  </button>

                  {/* Expanded Content - Slides in from the right */}
                  <div
                    className={`absolute left-full top-0 ml-4 w-80 z-20 transition-all duration-300 ease-in-out ${
                      openCard === index 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 translate-x-4 pointer-events-none'
                    }`}
                  >
                    <div className="border-2 border-blue-600 bg-blue-50 p-5">
                      <h4 className="font-bold text-gray-900 mb-3">{card.title}</h4>
                      <p className="text-sm text-gray-800 mb-4">
                        {card.description}
                      </p>
                      <Link
                        href={card.url}
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
                      >
                        Learn more
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
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
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <StudentFooter />
      </div>
    </>
  );
}
