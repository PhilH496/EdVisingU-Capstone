/**
 * ApplicationAnalysisCard Component with Integrated Pie Chart
 * Displays AI analysis results with visual confidence pie chart
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

interface AIAnalysisResult {
  recommended_status: "APPROVED" | "REJECTED" | "NEEDS MANUAL REVIEW";
  confidence_score: number;
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
  overall_status: "APPROVED" | "REJECTED" | "NEEDS MANUAL REVIEW" | "PENDING";
  analysis_timestamp: string;
}

interface Props {
  analysis: ApplicationAnalysis | null;
  loading?: boolean;
}
//Change to brand colors later
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
        <p className="text-gray-500 text-center">No analysis available. Click "Analyze" to evaluate this application.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
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
  };

  // Prepare pie chart data
  const pieData = [
    { name: "Confidence", value: analysis.ai_analysis.confidence_score * 100 },
    { name: "Uncertainty", value: (1 - analysis.ai_analysis.confidence_score) * 100 },
  ];

  const mainColor = STATUS_COLORS[analysis.overall_status] || STATUS_COLORS.PENDING;

  return (
    <div className="border rounded-xl bg-white shadow-sm p-6 space-y-6">
      {/* Header with Pie Chart and Status */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">AI Analysis Results</h3>
          <p className="text-sm text-gray-500 mt-1">
            Generated {new Date(analysis.analysis_timestamp).toLocaleString()}
          </p>
        </div>

        {/* Pie Chart with Status */}
        <div className="flex items-center gap-4">
          {/* Confidence Pie Chart */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill={mainColor} />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {(analysis.ai_analysis.confidence_score * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-gray-500">confidence</div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
              analysis.overall_status
            )}`}
          >
            {analysis.overall_status}
          </span>
        </div>
      </div>

      {/* Deterministic Checks */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-cyan-800">📋</span>
          Eligibility Requirements
        </h4>
        <div className="space-y-2 bg-gray-50 rounded-lg p-4">
          <CheckItem
            label="Verified Disability (Permanent/Persistent-Prolonged)"
            passed={analysis.deterministic_checks.has_disability}
          />
          <CheckItem
            label="Full-Time Student Status"
            passed={analysis.deterministic_checks.is_full_time}
          />
          <CheckItem
            label="No OSAP Restrictions"
            passed={!analysis.deterministic_checks.has_osap_restrictions}
          />
        </div>
        
        {analysis.deterministic_checks.failed_checks.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-900 mb-2">Failed Checks:</p>
            <ul className="text-sm text-red-800 space-y-1">
              {analysis.deterministic_checks.failed_checks.map((check, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span>•</span>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI Evaluation */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-cyan-800">🤖</span>
          AI Evaluation
        </h4>

        {/* Funding Recommendation */}
        {analysis.ai_analysis.funding_recommendation !== null && analysis.ai_analysis.funding_recommendation > 0 && (
          <div className="mb-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
            <p className="text-sm text-gray-600">Recommended Funding</p>
            <p className="text-2xl font-bold text-cyan-800">
              ${analysis.ai_analysis.funding_recommendation.toLocaleString()}
            </p>
          </div>
        )}

        {/* Strengths */}
        {analysis.ai_analysis.strengths.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Strengths
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              {analysis.ai_analysis.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Factors */}
        {analysis.ai_analysis.risk_factors.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Risk Factors
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              {analysis.ai_analysis.risk_factors.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-600">⚠</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reasoning */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">AI Reasoning</p>
          <p className="text-sm text-gray-700 leading-relaxed">{analysis.ai_analysis.reasoning}</p>
        </div>

        {/* Manual Review Flag */}
        {analysis.ai_analysis.requires_human_review && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">Manual Review Required</p>
              <p className="text-sm text-yellow-800 mt-1">
                This application requires review by a Financial Aid Officer before final decision.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {passed ? (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
      )}
      <span className={`text-sm ${passed ? "text-gray-700" : "text-red-700"}`}>{label}</span>
    </div>
  );
}

export default ApplicationAnalysisCard;