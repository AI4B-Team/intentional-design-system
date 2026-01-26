import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { DealRating } from "./deal-rating";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KeyMetricProps {
  label: string;
  value: string | number;
  format?: "currency" | "percentage" | "number";
  trend?: "positive" | "negative" | "neutral";
  large?: boolean;
  className?: string;
}

function formatValue(value: string | number, format?: string): string {
  if (typeof value === "string") return value;
  
  switch (format) {
    case "currency":
      return `$${value.toLocaleString()}`;
    case "percentage":
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString();
  }
}

export function KeyMetric({ label, value, format, trend, large, className }: KeyMetricProps) {
  const formattedValue = formatValue(value, format);
  
  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-tiny uppercase tracking-wide text-content-secondary">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "font-semibold tabular-nums",
            large ? "text-display" : "text-h2",
            trend === "positive" && "text-success",
            trend === "negative" && "text-destructive",
            !trend && "text-content"
          )}
        >
          {formattedValue}
        </span>
        {trend && (
          <>
            {trend === "positive" && <TrendingUp className="h-4 w-4 text-success" />}
            {trend === "negative" && <TrendingDown className="h-4 w-4 text-destructive" />}
            {trend === "neutral" && <Minus className="h-4 w-4 text-content-tertiary" />}
          </>
        )}
      </div>
    </div>
  );
}

interface MetricGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricGrid({ children, columns = 2, className }: MetricGridProps) {
  const colClasses = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", colClasses[columns], className)}>
      {children}
    </div>
  );
}

interface ResultsCardProps {
  title?: string;
  keyResult?: {
    label: string;
    value: number;
    format?: "currency" | "percentage" | "number";
    trend?: "positive" | "negative" | "neutral";
  };
  dealScore?: number;
  children?: React.ReactNode;
  className?: string;
}

export function ResultsCard({
  title = "Results",
  keyResult,
  dealScore,
  children,
  className,
}: ResultsCardProps) {
  return (
    <Card
      variant="default"
      padding="none"
      className={cn("sticky top-24 overflow-hidden", className)}
    >
      {/* Header */}
      <div className="px-md py-4 border-b border-border-subtle bg-surface-secondary/50">
        <h3 className="text-h3 font-medium text-content">{title}</h3>
      </div>

      {/* Key Result + Deal Rating */}
      {(keyResult || dealScore !== undefined) && (
        <div className="p-md border-b border-border-subtle">
          <div className="flex items-center justify-between">
            {keyResult && (
              <KeyMetric
                label={keyResult.label}
                value={keyResult.value}
                format={keyResult.format}
                trend={keyResult.trend}
                large
              />
            )}
            {dealScore !== undefined && (
              <DealRating score={dealScore} size="md" />
            )}
          </div>
        </div>
      )}

      {/* Additional Content */}
      {children && <div className="p-md">{children}</div>}
    </Card>
  );
}

interface ComparisonBarProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
  showValue?: boolean;
  format?: "currency" | "percentage" | "number";
  className?: string;
}

export function ComparisonBar({
  label,
  value,
  maxValue,
  color = "bg-brand-accent",
  showValue = true,
  format = "currency",
  className,
}: ComparisonBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-small">
        <span className="text-content-secondary">{label}</span>
        {showValue && (
          <span className="font-medium text-content tabular-nums">
            {formatValue(value, format)}
          </span>
        )}
      </div>
      <div className="h-3 bg-surface-tertiary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
