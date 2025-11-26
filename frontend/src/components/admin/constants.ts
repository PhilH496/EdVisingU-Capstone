// Application Status Constants
export const APPLICATION_STATUS = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  NEEDS_MANUAL_REVIEW: "NEEDS MANUAL REVIEW",
  PENDING: "PENDING",
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

// Status Colors
export const STATUS_COLORS: Record<string, string> = {
  [APPLICATION_STATUS.APPROVED]: "#10b981",
  [APPLICATION_STATUS.REJECTED]: "#ef4444",
  [APPLICATION_STATUS.NEEDS_MANUAL_REVIEW]: "#3b82f6",
  [APPLICATION_STATUS.PENDING]: "#6b7280",
};

// Helper Functions
export function getBadgeClasses(status: string) {
  switch (status) {
    case APPLICATION_STATUS.APPROVED:
      return "bg-green-100 text-green-800 border-green-200";
    case APPLICATION_STATUS.REJECTED:
      return "bg-red-100 text-red-800 border-red-200";
    case APPLICATION_STATUS.NEEDS_MANUAL_REVIEW:
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}