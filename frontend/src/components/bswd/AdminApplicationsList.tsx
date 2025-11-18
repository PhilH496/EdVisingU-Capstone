// Admin: Applications List
// AdminApplicationsList Component Goes Here
//
// HELPFUL INFO:
// - applications: Array of { id: string (UUID), status: "ACCEPTED" | "REJECTED" | "NEEDS MANUAL REVIEW" | "<APP STATUS>" }
// - onViewAnalysis: Callback fired when the user clicks the "View Analysis" button
// - Keep only: UUID, "View Analysis" button, and status pill (colors preserved)
// - Use brand colors located in tailwind.config.js; reference StudentInfoStep.tsx
// - Add to Admin Dashboard page (pages/admin/index.tsx)

import * as React from "react";

type AppStatus = "ACCEPTED" | "REJECTED" | "NEEDS MANUAL REVIEW" | "<APP STATUS>";
interface ApplicationRow { id: string; status: AppStatus; }

interface AdminApplicationsListProps {
  applications: ApplicationRow[];
  onViewAnalysis: (id: string) => void;
  isLoading?: boolean;
}

function StatusPill({ status }: { status: AppStatus }) {
  const style =
    status === "ACCEPTED"
      ? "bg-green-100 text-green-800"
      : status === "REJECTED"
      ? "bg-red-100 text-red-800"
      : status === "NEEDS MANUAL REVIEW"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-700";
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${style}`}>
      {status}
    </span>
  );
}

export default function AdminApplicationsList({
  applications,
  onViewAnalysis,
  isLoading = false,
}: AdminApplicationsListProps) {
  return (
    <div
      className="border border-gray-200 rounded-2xl shadow-sm"
      style={{ fontFamily: `"Raleway", "Helvetica Neue", Helvetica, Arial, sans-serif` }}
    >
      <div className="px-6 py-5">
        <h2 className="text-xl font-semibold">Applications</h2>
      </div>

      <div className="border-t border-gray-100">
        <ul className="divide-y divide-gray-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <li key={`sk-${i}`} className="px-6 py-4 animate-pulse">
                <div className="h-4 w-2/3 bg-gray-100 rounded mb-3" />
                <div className="h-8 w-40 bg-gray-100 rounded" />
              </li>
            ))
          ) : applications.length === 0 ? (
            <li className="px-6 py-8 text-sm text-gray-600">No applications to display.</li>
          ) : (
            applications.map((row, idx) => (
              <li
                key={row.id}
                className={`px-6 py-4 flex items-center justify-between transition-colors ${
                  idx % 2 ? "bg-white" : "bg-gray-50/50"
                } hover:bg-gray-50`}
              >
                {/* UUID (left) */}
                <div className="text-sm font-mono text-[#4e4e4e] truncate max-w-[60ch]">
                  {row.id}
                </div>

                {/* Actions (right): Status pill + View Analysis */}
                <div className="flex items-center gap-3">
                  <StatusPill status={row.status} />
                  <button
                    type="button"
                    onClick={() => onViewAnalysis(row.id)}
                    className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-100"
                  >
                    View Analysis
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
