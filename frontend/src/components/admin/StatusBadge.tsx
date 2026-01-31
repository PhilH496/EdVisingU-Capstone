import React from "react";

type Props = {
  status:
    | "Submitted"
    | "In Review"
    | "Pending"
    | "Approved"
    | "Rejected"
    | (string & {});
  className?: string;
};

const colorMap: Record<string, string> = {
  Submitted: "bg-gray-100 text-gray-800 border-gray-200",
  "In Review": "bg-blue-100 text-blue-800 border-blue-200",
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Approved: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({ status, className = "" }: Props) {
  const cls = colorMap[status] ?? "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${cls} ${className}`}
      style={{ fontFamily: `"Raleway","Helvetica Neue",Helvetica,Arial,sans-serif` }}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
