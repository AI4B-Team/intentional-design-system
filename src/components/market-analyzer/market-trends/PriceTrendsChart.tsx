import * as React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PriceHistoryPoint } from "./types";

interface PriceTrendsChartProps {
  data: PriceHistoryPoint[];
}

function formatPrice(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function PriceTrendsChart({ data }: PriceTrendsChartProps) {
  const currentPrice = data[data.length - 1]?.price ?? 0;
  const prices3mo = data[data.length - 4]?.price ?? 0;
  const prices6mo = data[data.length - 7]?.price ?? 0;
  const prices12mo = data[0]?.price ?? 0;

  const change3mo = prices3mo > 0 ? ((currentPrice - prices3mo) / prices3mo) * 100 : 0;
  const change6mo = prices6mo > 0 ? ((currentPrice - prices6mo) / prices6mo) * 100 : 0;
  const change12mo = prices12mo > 0 ? ((currentPrice - prices12mo) / prices12mo) * 100 : 0;

  const periodData = [
    { period: "Now", price: currentPrice, change: null },
    { period: "3mo", price: prices3mo, change: change3mo },
    { period: "6mo", price: prices6mo, change: change6mo },
    { period: "12mo", price: prices12mo, change: change12mo },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Median Sale Price</h4>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              tickFormatter={formatPrice}
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              domain={['dataMin - 10000', 'dataMax + 10000']}
            />
            <Tooltip
              formatter={(value: number) => [formatPrice(value), "Price"]}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Period Comparison Table */}
      <div className="mt-4 pt-4 border-t">
        <table className="w-full text-small">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left font-medium py-1">Period</th>
              <th className="text-right font-medium py-1">Price</th>
              <th className="text-right font-medium py-1">Change</th>
            </tr>
          </thead>
          <tbody>
            {periodData.map((row) => (
              <tr key={row.period} className="border-t border-border-subtle">
                <td className="py-1.5">{row.period}</td>
                <td className="py-1.5 text-right font-medium tabular-nums">
                  {formatPrice(row.price)}
                </td>
                <td className="py-1.5 text-right tabular-nums">
                  {row.change !== null ? (
                    <span className={row.change >= 0 ? "text-success" : "text-destructive"}>
                      {row.change >= 0 ? "+" : ""}{row.change.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
