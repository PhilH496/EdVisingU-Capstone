/**
 * Admin Constants
 * Shared constants across admin dashboard and detail pages
 */

export const STATUS_OPTIONS = [
  "Submitted",
  "In Review",
  "Approved",
  "Rejected",
  "Pending",
];

export const ITEMS_PER_PAGE = 50;

// Sort Options Definition
export type SortKey = "Recent" | "Score" | "Status" | "Name";
export type SortDirection = "asc" | "desc";

export const SORT_MENU: { label: string; value: SortKey }[] = [
  { label: "Most Recent", value: "Recent" },
  { label: "Confidence Score", value: "Score" },
  { label: "Application Status", value: "Status" },
  { label: "Alphabetical (Name)", value: "Name" },
];