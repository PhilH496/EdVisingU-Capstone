/**
 * Pagination Controls Component
 * Shared pagination controls for admin dashboard
 */

// Pagination Component, capping 50 applications per page
export function PaginationControls({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
    
    // Scroll to top when going to next page
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      // Fallback for browsers that don't support smooth scrolling
      console.error("Error scrolling to top:", error);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1}–{endIndex} of {totalItems} applications
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          type="button"
          aria-label="Previous page"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true"/>
        </button>

        <span className="text-sm font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          type="button"
          aria-label="Next page"
        >
          <i className="fa-solid fa-chevron-right" aria-hidden="true"/>
        </button>
      </div>
    </div>
  );
}