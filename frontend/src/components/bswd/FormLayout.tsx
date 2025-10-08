// Layout wrapper - Provides consistent centered card design for all form pages

/**
 * FormLayout Component
 * 
 * Provides a consistent visual container/wrapper for form pages.
 * 
 * Features:
 * - Centered white content card with shadow
 * - Responsive max-width container
 * - Header section with title and description
 * - Flexible children content area
 * 
 * @param children - The form content to display (typically form steps)
 * @param title - Main title shown at the top of the form
 * @param description - Descriptive text explaining the form's purpose
 */

interface FormLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function FormLayout({ children, title, description }: FormLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}