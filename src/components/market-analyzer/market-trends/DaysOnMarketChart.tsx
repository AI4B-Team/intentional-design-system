import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DOMDistribution } from "./types";

interface DaysOnMarketChartProps {
  currentDOM: number;
  yearAgoDOM: number;
  distribution: DOMDistribution[];
}

export function DaysOnMarketChart({ currentDOM, yearAgoDOM, distribution }: DaysOnMarketChartProps) {
  const percentFaster = yearAgoDOM > 0 ? Math.round(((yearAgoDOM - currentDOM) / yearAgoDOM) * 100) : 0;

  const colors = [
    "hsl(var(--success))",
    "hsl(var(--success) / 0.7)",
    "hsl(var(--warning))",
    "hsl(var(--warning) / 0.7)",
    "hsl(var(--destructive) / 0.7)",
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Days on Market</h4>
        </div>
        <Badge variant="success" className="gap-1">
          <TrendingDown className="h-3 w-3" />
          {percentFaster}% faster
        </Badge>
      </div>

      {/* Current DOM */}
      <div className="text-center mb-4 p-4 bg-surface-secondary rounded-lg">
        <div className="text-3xl font-bold text-foreground">{currentDOM} days</div>
        <div className="text-small text-muted-foreground mt-1">
          Median days to sell
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis 
              type="number"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              type="category"
              dataKey="range"
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              width={70}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Properties"]}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
              {distribution.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Table */}
      <div className="mt-4 pt-4 border-t">
        <table className="w-full text-small">
          <tbody>
            {distribution.map((item, i) => (
              <tr key={item.range} className="border-b last:border-0 border-border-subtle">
                <td className="py-1.5">{item.range}</td>
                <td className="py-1.5 text-right font-medium tabular-nums">
                  {item.percentage}%
                </td>
                <td className="py-1.5 pl-2 w-24">
                  <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.percentage}%`, backgroundColor: colors[i] }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
