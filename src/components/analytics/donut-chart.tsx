import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
}

const defaultColors = [
  "hsl(var(--brand-accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(var(--score-hot))",
  "hsl(var(--content-tertiary))",
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="transition-all duration-200"
      />
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="hsl(var(--content))"
        className="text-small font-medium"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="hsl(var(--content-secondary))"
        className="text-h3 font-semibold"
      >
        {value.toLocaleString()}
      </text>
      <text
        x={cx}
        y={cy + 34}
        textAnchor="middle"
        fill="hsl(var(--content-tertiary))"
        className="text-tiny"
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

export function DonutChart({
  data,
  title,
  centerLabel,
  centerValue,
  className,
}: DonutChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  // Limit to 6 items, group rest as "Other"
  const processedData = React.useMemo(() => {
    if (data.length <= 6) return data;
    
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const top5 = sorted.slice(0, 5);
    const otherValue = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);
    
    return [...top5, { name: "Other", value: otherValue }];
  }, [data]);

  const total = processedData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card variant="default" padding="md" className={className}>
      {title && (
        <h3 className="text-h3 font-medium text-content mb-md">{title}</h3>
      )}

      <div className="flex flex-col lg:flex-row items-center gap-md">
        {/* Chart */}
        <div className="relative h-64 w-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                activeIndex={activeIndex ?? undefined}
                activeShape={activeIndex !== null ? renderActiveShape : undefined}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || defaultColors[index % defaultColors.length]}
                    className="transition-all duration-200 cursor-pointer"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label (when not hovering) */}
          {activeIndex === null && centerValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {centerLabel && (
                <span className="text-tiny text-content-tertiary uppercase tracking-wide">
                  {centerLabel}
                </span>
              )}
              <span className="text-h2 font-semibold text-content tabular-nums">
                {typeof centerValue === "number" ? centerValue.toLocaleString() : centerValue}
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {processedData.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const isActive = activeIndex === index;

            return (
              <button
                key={item.name}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 rounded-small transition-all text-left",
                  isActive ? "bg-surface-secondary" : "hover:bg-surface-secondary/50"
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: item.color || defaultColors[index % defaultColors.length],
                    }}
                  />
                  <span className="text-small text-content">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-small font-medium text-content tabular-nums">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-tiny text-content-tertiary w-12 text-right tabular-nums">
                    {percentage}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
