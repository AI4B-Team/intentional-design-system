import * as React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketMetric } from "./types";

interface MetricCardProps {
  metric: MarketMetric;
}

function MiniSparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  const padding = 2;
  
  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");
  
  const isUpward = data[data.length - 1] > data[0];
  
  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={isUpward ? "hsl(var(--success))" : "hsl(var(--destructive))"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MetricCard({ metric }: MetricCardProps) {
  const isPositiveChange = metric.change !== undefined && metric.change > 0;
  const isNegativeChange = metric.change !== undefined && metric.change < 0;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-tiny text-muted-foreground uppercase tracking-wide mb-1">
            {metric.label}
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">
            {metric.value}
          </div>
          {metric.subValue && (
            <div className="text-tiny text-muted-foreground mt-0.5">
              {metric.subValue}
            </div>
          )}
          {metric.change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-tiny mt-1",
              isPositiveChange && "text-success",
              isNegativeChange && "text-destructive",
              !isPositiveChange && !isNegativeChange && "text-muted-foreground"
            )}>
              {isPositiveChange && <TrendingUp className="h-3 w-3" />}
              {isNegativeChange && <TrendingDown className="h-3 w-3" />}
              <span>
                {isPositiveChange ? "+" : ""}{metric.change}% {metric.changeLabel}
              </span>
            </div>
          )}
        </div>
        {metric.sparklineData && (
          <MiniSparkline data={metric.sparklineData} />
        )}
      </div>
    </Card>
  );
}
