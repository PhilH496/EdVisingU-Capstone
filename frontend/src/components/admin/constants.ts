// Application Status Constants
export const APPLICATION_STATUS = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  NEEDS_MANUAL_REVIEW: "NEEDS MANUAL REVIEW",
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

// Combined status configuration for colors
export const STATUS_CONFIG: Record<string, { color: string; badgeClasses: string }> = {
  [APPLICATION_STATUS.APPROVED]: {
    color: "#10b981",
    badgeClasses: "bg-green-100 text-green-800 border-green-200",
  },
  [APPLICATION_STATUS.REJECTED]: {
    color: "#ef4444",
    badgeClasses: "bg-red-100 text-red-800 border-red-200",
  },
  [APPLICATION_STATUS.NEEDS_MANUAL_REVIEW]: {
    color: "#3b82f6",
    badgeClasses: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

// Helper functions
export function getStatusColor(status: string): string {
  return STATUS_CONFIG[status].color;
}

export function getBadgeClasses(status: string): string {
  return STATUS_CONFIG[status].badgeClasses;
}