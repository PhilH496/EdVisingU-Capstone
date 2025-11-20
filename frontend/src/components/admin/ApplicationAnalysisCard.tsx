/**
 * ApplicationAnalysisCard Component - Uses Backend Confidence Score
 * - Displays backend-calculated score (0-100)
 * - Color-coded donut chart based on overall_status
 * - Score thresholds: 90-100 Approved, 75-89 Manual Review, 0-74 Rejected
 */

import React from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DeterministicCheckResult {
  has_disability: boolean;
  is_full_time: boolean;
  has_osap_restrictions: boolean;
  all_checks_passed: boolean;
  failed_checks: string[];
}

interface FinancialAnalysis {
  total_need: number;
  total_requested: number;
  within_cap: boolean;
}

interface AIAnalysisResult {
  recommended_status: "APPROVED" | "REJECTED" | "NEEDS MANUAL REVIEW";
  confidence_score: number; // 0–1 from backend
  funding_recommendation: number | null;
  risk_factors: string[];
  strengths: string[];
  requires_human_review: boolean;
  reasoning: string;
}

interface ApplicationAnalysis {
  application_id: string;
  deterministic_checks: DeterministicCheckResult;
  ai_analysis: AIAnalysisResult;
  financial_analysis?: FinancialAnalysis;
  overall_status: "APPROVED" | "REJECTED" | "NEEDS MANUAL REVIEW" | "PENDING";
  analysis_timestamp: string;
}

interface Props {
  analysis: ApplicationAnalysis | null;
  loading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#10b981",
  REJECTED: "#ef4444",
  "NEEDS MANUAL REVIEW": "#f59e0b",
  PENDING: "#6b7280",
};

export function ApplicationAnalysisCard({ analysis, loading }: Props) {
  if (loading) {
    return (
      <div className="border rounded-xl bg-white shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="border rounded-xl bg-white shadow-sm p-6">
        <p className="text-gray-500 text-center">No analysis available.</p>
      </div>
    );
  }

  const { has_disability, is_full_time, has_osap_restrictions } =
    analysis.deterministic_checks;

  // ========================================================================
  // BACKEND CONFIDENCE SCORE (0-1 scale, convert to 0-100)
  // ========================================================================
  const finalScore = Math.round(analysis.ai_analysis.confidence_score * 100);

  // ========================================================================
  // Donut Chart Data (color based on overall_status)
  // ========================================================================
  const scoreColor = STATUS_COLORS[analysis.overall_status] || "#0ea5e9";

  const pieData = [
    { name: "score", value: finalScore },
    { name: "rest", value: 100 - finalScore },
  ];

  return (
    <div className="border rounded-xl bg-white shadow-sm p-6 space-y-6">
      {/* Header and Score */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Analysis Results</h3>
          <p className="text-sm text-gray-500 mt-1">
            Generated {new Date(analysis.analysis_timestamp).toLocaleString()}
          </p>
        </div>

        {/* Donut Chart */}
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={50}
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill={scoreColor} />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-bold">{finalScore}</div>
              <div className="text-[10px] text-gray-600">score</div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${getBadgeClasses(
              analysis.overall_status
            )}`}
          >
            {analysis.overall_status}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
        <p className="font-semibold">Score Meaning:</p>
        <p><span className="text-green-600 font-bold">90–100</span>: Approved</p>
        <p><span className="text-yellow-600 font-bold">75–89</span>: Needs Manual Review</p>
        <p><span className="text-red-600 font-bold">0–74</span>: Rejected</p>
      </div>

      {/* Eligibility Requirements */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Eligibility Requirements</h4>
        <div className="space-y-2 bg-gray-50 rounded-lg p-4">
          <CheckItem label="Verified Disability" passed={has_disability} />
          <CheckItem label="Full-Time Student Status" passed={is_full_time} />
          <CheckItem label="No OSAP Restrictions" passed={!has_osap_restrictions} />
        </div>
      </div>

      {/* AI Evaluation */}
      <div>
        <h4 className="font-semibold mb-3">AI Evaluation</h4>

        {analysis.ai_analysis.funding_recommendation ? (
          <div className="mb-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
            <p className="text-sm">Recommended Funding</p>
            <p className="text-2xl font-bold text-cyan-800">
              ${analysis.ai_analysis.funding_recommendation.toLocaleString()}
            </p>
          </div>
        ) : null}


        {/* Risk Factors */}
        {analysis.ai_analysis.risk_factors.length > 0 && (
          <div className="mb-4">
            <div className="font-semibold mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-yellow-600" /> Risk Factors
            </div>
            <ul className="text-sm space-y-1">
              {analysis.ai_analysis.risk_factors.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-yellow-600">⚠</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold mb-2">AI Reasoning</p>
          <p className="text-sm">{analysis.ai_analysis.reasoning}</p>
        </div>
      </div>
    </div>
  );
}

// Helpers
function getBadgeClasses(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-800 border-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    case "NEEDS MANUAL REVIEW":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function CheckItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {passed ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600" />
      )}
      <span className={`text-sm ${passed ? "text-gray-700" : "text-red-700"}`}>
        {label}
      </span>
    </div>
  );
}

export default ApplicationAnalysisCard;