/**
 * FormLayout Component
 * 
 * Provides a consistent visual container/wrapper for form pages with live risk analysis sidebar.
 * Creates a two-column layout: main form content on the left, risk analysis on the right.
 * 
 * Features:
 * - Two-column responsive grid layout (form + risk analysis sidebar)
 * - Centered white content cards with shadow
 * - Sticky risk analysis sidebar (stays visible while scrolling)
 * - Responsive design (stacks vertically on mobile/tablet)
 * - Header section with title and description
 * - Flexible children content area for form steps
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

//Box layout for page(s) + risk anaylsis
export function FormLayout({ children, title, description }: FormLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Two-column layout: Form on left, Risk Analysis on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left side: Main form (takes 2 columns on large screens) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">{title}</h1>
                <p className="text-gray-600">{description}</p>
              </div>
              {children}
            </div>
          </div>

          {/* Right side: Live Risk Analysis (takes 1 column on large screens) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Live Risk Analysis</h2>
              
              {/* Add your risk analysis content here */}
              
              <p className="text-gray-500 italic text-sm">
                Risk analysis component - Add your content here
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}