import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface FunnelStage {
  name: string;
  count: number;
  value?: number;
  conversionRate?: number;
}

interface FunnelChartProps {
  data: FunnelStage[];
  title?: string;
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export function FunnelChart({ data, title, className }: FunnelChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const maxCount = Math.max(...data.map((d) => d.count));

  // Calculate widths (taper from 100% to minimum 30%)
  const minWidth = 30;
  const widthStep = (100 - minWidth) / (data.length - 1 || 1);

  return (
    <Card variant="default" padding="md" className={className}>
      {title && (
        <h3 className="text-h3 font-medium text-content mb-md">{title}</h3>
      )}

      <div className="space-y-3">
        {data.map((stage, index) => {
          const width = 100 - index * widthStep;
          const isHovered = hoveredIndex === index;
          const prevStage = data[index - 1];
          const conversionRate = prevStage
            ? ((stage.count / prevStage.count) * 100).toFixed(1)
            : null;

          return (
            <div key={stage.name} className="relative">
              {/* Conversion Arrow (between stages) */}
              {index > 0 && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                  <div className="h-4 w-px bg-border" />
                  <span className="text-tiny text-content-tertiary bg-white px-1">
                    {conversionRate}%
                  </span>
                </div>
              )}

              {/* Funnel Bar */}
              <div
                className={cn(
                  "relative mx-auto transition-all duration-200 cursor-pointer",
                  isHovered && "scale-[1.02]"
                )}
                style={{ width: `${width}%` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={cn(
                    "h-14 rounded-medium flex items-center justify-between px-4 transition-all",
                    "bg-gradient-to-r from-brand-accent to-brand-accent/80",
                    isHovered && "shadow-md"
                  )}
                  style={{
                    opacity: 1 - index * 0.12,
                  }}
                >
                  <span className="text-white font-medium">{stage.name}</span>
                  <div className="text-right">
                    <span className="text-white text-h3 font-semibold tabular-nums">
                      {stage.count.toLocaleString()}
                    </span>
                    {stage.value && (
                      <span className="text-white/80 text-small ml-2">
                        {formatCurrency(stage.value)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-md pt-md border-t border-border-subtle">
        <div className="flex items-center gap-2 text-small">
          <div className="h-3 w-3 rounded-sm bg-brand-accent" />
          <span className="text-content-secondary">Deals in Pipeline</span>
        </div>
        <div className="text-small text-content-secondary">
          Overall Conversion:{" "}
          <span className="font-semibold text-content">
            {((data[data.length - 1]?.count / data[0]?.count) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
