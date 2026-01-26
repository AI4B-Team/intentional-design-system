import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DealFlowChartProps {
  data: Array<{
    date: string;
    leads: number;
    contacts: number;
    offers: number;
    closed: number;
  }>;
  title?: string;
  className?: string;
}

const series = [
  { key: "leads", label: "New Leads", color: "hsl(var(--brand-accent))" },
  { key: "contacts", label: "Contacts Made", color: "hsl(var(--info))" },
  { key: "offers", label: "Offers Sent", color: "hsl(var(--warning))" },
  { key: "closed", label: "Deals Closed", color: "hsl(var(--success))" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-border-subtle rounded-medium shadow-lg p-3">
      <div className="text-small font-medium text-content mb-2">{label}</div>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-small">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-content-secondary">{entry.name}</span>
            </div>
            <span className="font-medium text-content tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomLegend = ({ payload, onClick, hiddenSeries }: any) => {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      {payload?.map((entry: any, index: number) => {
        const isHidden = hiddenSeries.includes(entry.dataKey);
        return (
          <button
            key={index}
            onClick={() => onClick(entry.dataKey)}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-small transition-all",
              isHidden ? "opacity-40" : "hover:bg-surface-secondary"
            )}
          >
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-small text-content-secondary">{entry.value}</span>
          </button>
        );
      })}
    </div>
  );
};

export function DealFlowChart({ data, title, className }: DealFlowChartProps) {
  const [hiddenSeries, setHiddenSeries] = React.useState<string[]>([]);

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <Card variant="default" padding="md" className={className}>
      {title && (
        <h3 className="text-h3 font-medium text-content mb-md">{title}</h3>
      )}

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border-subtle))"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--content-secondary))", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--content-secondary))", fontSize: 12 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={<CustomLegend onClick={toggleSeries} hiddenSeries={hiddenSeries} />}
            />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#gradient-${s.key})`}
                hide={hiddenSeries.includes(s.key)}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
