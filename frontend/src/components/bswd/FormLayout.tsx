/**
 * FormLayout Component
 *
 * Provides a consistent visual container/wrapper for form pages.
 *
 * Features:
 * - Ontario header bar (black background, left-aligned logo)
 * - Left-aligned white content card with shadow
 * - Responsive max-width container
 * - Header section with title aligned left
 * - Footer sits under the application page (below the card)
 *
 * @param children - The form content to display (typically form steps)
 * @param title - Main title shown at the top of the form
 * @param description - (unused) Descriptive text explaining the form's purpose
 * @param headerAction - Optional right-side header action (ex: language toggle)
 */

import Image from "next/image";
import { ReactNode } from "react";
import { StudentFooter } from "@/components/bswd/StudentFooter"; 

interface FormLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  headerAction: ReactNode;
}

export function FormLayout({
  children,
  title,
  description,
  headerAction,
}: FormLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Ontario header bar (black background, left-aligned logo) */}
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

      {/* Main content/card */}
      <main className="py-8 flex-1">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6 text-left flex justify-between">
              <div id="studentFormHeader">
                <h1 className="text-2xl font-bold mb-2">{title}</h1>
              </div>
              {headerAction && <div className="ml-4">{headerAction}</div>}
            </div>

            {/* Form Content */}
            {children}
          </div>
        </div>
      </main>

      {/* Footer under the application page */}
      <StudentFooter />
    </div>
  );
}
