import * as React from "react";
import { cn } from "@/lib/utils";

type Grade = "A" | "B" | "C" | "D" | "F";
type RatingLabel = "Excellent" | "Good" | "Fair" | "Poor" | "Bad";

interface DealRatingProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function getGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function getLabel(grade: Grade): RatingLabel {
  switch (grade) {
    case "A": return "Excellent";
    case "B": return "Good";
    case "C": return "Fair";
    case "D": return "Poor";
    case "F": return "Bad";
  }
}

function getColors(grade: Grade): { bg: string; text: string; ring: string } {
  switch (grade) {
    case "A":
      return { bg: "bg-success/10", text: "text-success", ring: "ring-success" };
    case "B":
      return { bg: "bg-score-warm/10", text: "text-score-warm", ring: "ring-score-warm" };
    case "C":
      return { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning" };
    case "D":
      return { bg: "bg-score-hot/10", text: "text-score-hot", ring: "ring-score-hot" };
    case "F":
      return { bg: "bg-destructive/10", text: "text-destructive", ring: "ring-destructive" };
  }
}

const sizes = {
  sm: { container: "h-12 w-12", grade: "text-h2", label: "text-tiny" },
  md: { container: "h-16 w-16", grade: "text-display", label: "text-small" },
  lg: { container: "h-24 w-24", grade: "text-display", label: "text-body" },
};

export function DealRating({ score, size = "md", showLabel = true, className }: DealRatingProps) {
  const grade = getGrade(score);
  const label = getLabel(grade);
  const colors = getColors(grade);
  const sizeStyles = sizes[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center ring-4",
          colors.bg,
          colors.ring,
          sizeStyles.container
        )}
      >
        <span className={cn("font-bold", colors.text, sizeStyles.grade)}>
          {grade}
        </span>
      </div>
      {showLabel && (
        <span className={cn("font-medium", colors.text, sizeStyles.label)}>
          {label}
        </span>
      )}
    </div>
  );
}

interface DealMeterProps {
  value: number; // 0-100
  label?: string;
  className?: string;
}

export function DealMeter({ value, label, className }: DealMeterProps) {
  const grade = getGrade(value);
  const colors = getColors(grade);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between text-small">
          <span className="text-content-secondary">{label}</span>
          <span className={cn("font-semibold", colors.text)}>{value}%</span>
        </div>
      )}
      <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors.text.replace("text-", "bg-"))}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

interface ProfitBreakdownProps {
  items: { label: string; value: number; color: string }[];
  total: number;
  className?: string;
}

export function ProfitBreakdown({ items, total, className }: ProfitBreakdownProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Stacked bar */}
      <div className="h-6 bg-surface-tertiary rounded-medium overflow-hidden flex">
        {items.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <div
              key={index}
              className={cn("h-full transition-all duration-500", item.color)}
              style={{ width: `${percentage}%` }}
            />
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={cn("h-3 w-3 rounded-sm", item.color)} />
            <span className="text-small text-content-secondary">{item.label}</span>
            <span className="text-small font-medium text-content tabular-nums">
              ${item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
