/**
 * Mini Pie Chart for individual application analysis
 */

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ApplicationAnalysis {
  overall_status: "APPROVED" | "REJECTED" | "NEEDS MANUAL REVIEW" | "PENDING";
  ai_analysis: {
    confidence_score: number;
  };
}

interface Props {
  analysis: ApplicationAnalysis;
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#10b981",
  REJECTED: "#ef4444",
  "NEEDS MANUAL REVIEW": "#3b82f6",
  PENDING: "#6b7280",
};

export function MiniAnalysisPieChart({ analysis }: Props) {
  const data = [
    { name: "Confidence", value: analysis.ai_analysis.confidence_score * 100 },
    { name: "Uncertainty", value: (1 - analysis.ai_analysis.confidence_score) * 100 },
  ];

  const color = STATUS_COLORS[analysis.overall_status] || STATUS_COLORS.PENDING;
  const percentage = (analysis.ai_analysis.confidence_score * 100).toFixed(0);

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-16 h-16 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={30}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill={color} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Centered percentage text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
      <div className="text-xs">
        <div className="font-semibold text-gray-900">{percentage}%</div>
        <div className="text-gray-500">confidence</div>
      </div>
    </div>
  );
}