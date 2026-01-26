import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  sparklineData?: number[];
  icon?: React.ReactNode;
  format?: "number" | "currency" | "percentage";
  className?: string;
  style?: React.CSSProperties;
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

export function AnalyticsStatCard({
  title,
  value,
  change,
  changeLabel = "vs. last period",
  sparklineData,
  icon,
  format = "number",
  className,
  style,
}: AnalyticsStatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === 0;

  // Generate sparkline chart data
  const chartData = sparklineData?.map((val, i) => ({ value: val, index: i })) || [];

  return (
    <Card
      variant="interactive"
      padding="md"
      className={cn("group", className)}
      style={style}
    >
      <div className="flex items-start justify-between mb-3">
        {/* Icon */}
        {icon && (
          <div className="h-10 w-10 rounded-full bg-surface-secondary flex items-center justify-center">
            {icon}
          </div>
        )}

        {/* Change Badge */}
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-tiny font-medium",
              isPositive && "bg-success/10 text-success",
              isNegative && "bg-destructive/10 text-destructive",
              isNeutral && "bg-surface-tertiary text-content-tertiary"
            )}
          >
            {isPositive && <TrendingUp className="h-3 w-3" />}
            {isNegative && <TrendingDown className="h-3 w-3" />}
            {isNeutral && <Minus className="h-3 w-3" />}
            {isPositive && "+"}
            {change.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-display font-semibold text-content tabular-nums mb-1">
        {formatValue(value, format)}
      </div>

      {/* Title */}
      <div className="text-small text-content-secondary uppercase tracking-wide mb-3">
        {title}
      </div>

      {/* Sparkline */}
      {chartData.length > 0 && (
        <div className="h-12 -mx-2 -mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`sparkline-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isNegative ? "hsl(var(--destructive))" : "hsl(var(--brand-accent))"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={isNegative ? "hsl(var(--destructive))" : "hsl(var(--brand-accent))"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={isNegative ? "hsl(var(--destructive))" : "hsl(var(--brand-accent))"}
                strokeWidth={1.5}
                fill={`url(#sparkline-${title})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Comparison Label */}
      {change !== undefined && changeLabel && (
        <div className="text-tiny text-content-tertiary mt-2">
          {changeLabel}
        </div>
      )}
    </Card>
  );
}
