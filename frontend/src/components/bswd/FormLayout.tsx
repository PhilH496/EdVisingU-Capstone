/**
 * FormLayout Component
 * 
 * Provides a consistent visual container/wrapper for form pages.
 * 
 * Features:
 * - Ontario header bar (black background, left-aligned logo)
 * - Left-aligned white content card with shadow
 * - Responsive max-width container
 * - Header section with title and description aligned left
 * 
 * @param children - The form content to display (typically form steps)
 * @param title - Main title shown at the top of the form
 * @param description - Descriptive text explaining the form's purpose
 */

import Image from "next/image";

interface FormLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function FormLayout({ children, title, description }: FormLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6 text-left">
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>

            {/* Form Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
