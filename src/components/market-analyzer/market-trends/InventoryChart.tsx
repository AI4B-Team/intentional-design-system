import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Flame, Scale, Snowflake } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import type { InventoryPoint } from "./types";

interface InventoryChartProps {
  data: InventoryPoint[];
}

function getMarketCondition(monthsOfSupply: number): {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
} {
  if (monthsOfSupply < 3) {
    return {
      label: "Strong Seller's Market",
      icon: <Flame className="h-4 w-4" />,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    };
  }
  if (monthsOfSupply <= 6) {
    return {
      label: "Balanced Market",
      icon: <Scale className="h-4 w-4" />,
      color: "text-warning",
      bgColor: "bg-warning/10",
    };
  }
  return {
    label: "Buyer's Market",
    icon: <Snowflake className="h-4 w-4" />,
    color: "text-info",
    bgColor: "bg-info/10",
  };
}

export function InventoryChart({ data }: InventoryChartProps) {
  const currentSupply = data[data.length - 1]?.monthsOfSupply ?? 0;
  const condition = getMarketCondition(currentSupply);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Market Inventory</h4>
        </div>
        <Badge className={cn("gap-1", condition.bgColor, condition.color)}>
          {condition.icon}
          {currentSupply} mo
        </Badge>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              domain={[0, 6]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar
              yAxisId="left"
              dataKey="activeListings"
              name="Active Listings"
              fill="hsl(var(--primary) / 0.3)"
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="monthsOfSupply"
              name="Months Supply"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-tiny">
        <div className="flex items-center gap-1.5 text-destructive">
          <Flame className="h-3.5 w-3.5" />
          <span>&lt;3 mo = Seller's</span>
        </div>
        <div className="flex items-center gap-1.5 text-warning">
          <Scale className="h-3.5 w-3.5" />
          <span>3-6 mo = Balanced</span>
        </div>
        <div className="flex items-center gap-1.5 text-info">
          <Snowflake className="h-3.5 w-3.5" />
          <span>&gt;6 mo = Buyer's</span>
        </div>
      </div>

      {/* Current Status */}
      <div className={cn("mt-3 p-3 rounded-md flex items-center gap-2", condition.bgColor)}>
        {condition.icon}
        <span className={cn("text-small font-medium", condition.color)}>
          Current: {condition.label}
        </span>
      </div>
    </Card>
  );
}
