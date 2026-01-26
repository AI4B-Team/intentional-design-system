import * as React from "react";
import { cn } from "@/lib/utils";

interface MotivationGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(score: number): { stroke: string; text: string; bg: string } {
  if (score >= 800) return { stroke: "#EF4444", text: "text-score-hot", bg: "bg-score-hot" };
  if (score >= 600) return { stroke: "#F97316", text: "text-score-warm", bg: "bg-score-warm" };
  if (score >= 400) return { stroke: "#EAB308", text: "text-score-moderate", bg: "bg-score-moderate" };
  if (score >= 200) return { stroke: "#3B82F6", text: "text-score-cool", bg: "bg-score-cool" };
  return { stroke: "#6B7280", text: "text-score-cold", bg: "bg-score-cold" };
}

function getScoreLabel(score: number): string {
  if (score >= 800) return "Hot";
  if (score >= 600) return "Warm";
  if (score >= 400) return "Moderate";
  if (score >= 200) return "Cool";
  return "Cold";
}

const sizes = {
  sm: { container: "h-20 w-20", text: "text-h3", label: "text-tiny" },
  md: { container: "h-32 w-32", text: "text-display", label: "text-small" },
  lg: { container: "h-40 w-40", text: "text-display", label: "text-body" },
};

export function MotivationGauge({ score, size = "md", showLabel = true, className }: MotivationGaugeProps) {
  const colors = getScoreColor(score);
  const label = getScoreLabel(score);
  const sizeStyles = sizes[size];
  
  // Calculate percentage for the arc (0-1000 scale)
  const percentage = Math.min(score / 1000, 1);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - percentage * 0.75); // 270 degrees = 0.75 of circle

  return (
    <div className={cn("relative flex items-center justify-center", sizeStyles.container, className)}>
      <svg className="absolute inset-0 -rotate-[135deg]" viewBox="0 0 100 100">
        {/* Background Arc */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-surface-tertiary"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={circumference * 0.25}
        />
        {/* Score Arc */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Center Content */}
      <div className="relative flex flex-col items-center">
        <span className={cn(sizeStyles.text, "font-semibold tabular-nums", colors.text)}>
          {score}
        </span>
        {showLabel && (
          <span className={cn(sizeStyles.label, "text-content-secondary mt-0.5")}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
