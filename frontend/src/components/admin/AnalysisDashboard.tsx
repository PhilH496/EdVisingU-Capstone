/**
 * AnalysisDashboard Component
 * Shows pie chart and statistics for application analysis results
 */

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ApplicationAnalysis {
  application_id: string;
  overall_status: "APPROVED" | "REJECTED" | "NEEDS MANUAL REVIEW" | "PENDING";
  ai_analysis: {
    confidence_score: number;
    funding_recommendation: number | null;
  };
}

interface Props {
  analyses: ApplicationAnalysis[];
  loading?: boolean;
}

//Change colors later to brand
const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#10b981", 
  REJECTED: "#ef4444", 
  "NEEDS MANUAL REVIEW": "#f59e0b", 
  PENDING: "#6b7280", 
};

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
  "NEEDS MANUAL REVIEW": "Manual Review",
  PENDING: "Pending",
};

export function AnalysisDashboard({ analyses, loading }: Props) {
  const stats = useMemo(() => {
    const total = analyses.length;
    const approved = analyses.filter((a) => a.overall_status === "APPROVED").length;
    const rejected = analyses.filter((a) => a.overall_status === "REJECTED").length;
    const manualReview = analyses.filter((a) => a.overall_status === "NEEDS MANUAL REVIEW").length;
    const pending = analyses.filter((a) => a.overall_status === "PENDING").length;

    const avgConfidence =
      analyses.length > 0
        ? analyses.reduce((sum, a) => sum + a.ai_analysis.confidence_score, 0) / analyses.length
        : 0;

    const totalFunding = analyses.reduce(
      (sum, a) => sum + (a.ai_analysis.funding_recommendation || 0),
      0
    );

    const approvalRate = total > 0 ? (approved / total) * 100 : 0;
    const manualReviewRate = total > 0 ? (manualReview / total) * 100 : 0;

    return {
      total,
      approved,
      rejected,
      manualReview,
      pending,
      avgConfidence,
      totalFunding,
      approvalRate,
      manualReviewRate,
    };
  }, [analyses]);

  const chartData = useMemo(() => {
    return [
      { name: STATUS_LABELS.APPROVED, value: stats.approved, status: "APPROVED" },
      { name: STATUS_LABELS.REJECTED, value: stats.rejected, status: "REJECTED" },
      {
        name: STATUS_LABELS["NEEDS MANUAL REVIEW"],
        value: stats.manualReview,
        status: "NEEDS MANUAL REVIEW",
      },
      { name: STATUS_LABELS.PENDING, value: stats.pending, status: "PENDING" },
    ].filter((item) => item.value > 0);
  }, [stats]);

  if (loading) {
    return (
      <div className="border rounded-xl bg-white shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="border rounded-xl bg-white shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Dashboard</h3>
        <p className="text-gray-500 text-center py-12">
          No applications analyzed yet. Analyze applications to see statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl bg-white shadow-sm p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Analysis Dashboard</h3>
        <p className="text-sm text-gray-500 mt-1">{stats.total} applications analyzed</p>
      </div>

      {/* Pie Chart */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.status] || STATUS_COLORS.PENDING} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics Cards */}
        <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
          <StatCard
            label="Approval Rate"
            value={`${stats.approvalRate.toFixed(1)}%`}
            color="green"
          />
          <StatCard
            label="Manual Review"
            value={`${stats.manualReviewRate.toFixed(1)}%`}
            color="yellow"
          />
          <StatCard
            label="Avg Confidence"
            value={`${(stats.avgConfidence * 100).toFixed(0)}%`}
            color="blue"
          />
          <StatCard
            label="Total Funding"
            value={`$${stats.totalFunding.toLocaleString()}`}
            color="cyan"
          />
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Detailed Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BreakdownItem label="Approved" count={stats.approved} total={stats.total} color="green" />
          <BreakdownItem label="Rejected" count={stats.rejected} total={stats.total} color="red" />
          <BreakdownItem
            label="Manual Review"
            count={stats.manualReview}
            total={stats.total}
            color="yellow"
          />
          <BreakdownItem label="Pending" count={stats.pending} total={stats.total} color="gray" />
        </div>
      </div>

      {/* Key Insights */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Insights</h4>
        <div className="space-y-2 text-sm text-gray-700">
          {stats.approvalRate >= 70 && (
            <InsightItem
              icon="✅"
              text={`High approval rate (${stats.approvalRate.toFixed(0)}%) indicates strong application quality`}
              type="positive"
            />
          )}
          {stats.manualReviewRate >= 30 && (
            <InsightItem
              icon="⚠️"
              text={`${stats.manualReviewRate.toFixed(0)}% of applications need manual review`}
              type="warning"
            />
          )}
          {stats.avgConfidence >= 0.8 && (
            <InsightItem
              icon="🎯"
              text={`AI confidence is high (${(stats.avgConfidence * 100).toFixed(0)}%) - analysis is reliable`}
              type="positive"
            />
          )}
          {stats.avgConfidence < 0.6 && (
            <InsightItem
              icon="🤔"
              text={`Low AI confidence (${(stats.avgConfidence * 100).toFixed(0)}%) - consider manual review`}
              type="warning"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "green" | "yellow" | "blue" | "cyan";
}) {
  const colorClasses = {
    green: "bg-green-50 border-green-200 text-green-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    cyan: "bg-cyan-50 border-cyan-200 text-cyan-800",
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function BreakdownItem({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: "green" | "red" | "yellow" | "gray";
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  const colorClasses = {
    green: "text-green-700 bg-green-100",
    red: "text-red-700 bg-red-100",
    yellow: "text-yellow-700 bg-yellow-100",
    gray: "text-gray-700 bg-gray-100",
  };

  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses[color]} mb-2`}>
        <span className="text-xl font-bold">{count}</span>
      </div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{percentage.toFixed(0)}%</p>
    </div>
  );
}

function InsightItem({
  icon,
  text,
  type,
}: {
  icon: string;
  text: string;
  type: "positive" | "warning";
}) {
  const bgColor = type === "positive" ? "bg-green-50" : "bg-yellow-50";
  const borderColor = type === "positive" ? "border-green-200" : "border-yellow-200";

  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border ${bgColor} ${borderColor}`}>
      <span className="text-base">{icon}</span>
      <span className="text-sm">{text}</span>
    </div>
  );
}

export default AnalysisDashboard;