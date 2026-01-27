import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DealSource } from "@/hooks/useDealSourceDetail";

interface PerformanceTabProps {
  source: DealSource;
}

// Mock data for charts
const monthlyDealsData = [
  { month: "Feb", deals: 0 },
  { month: "Mar", deals: 1 },
  { month: "Apr", deals: 0 },
  { month: "May", deals: 2 },
  { month: "Jun", deals: 1 },
  { month: "Jul", deals: 0 },
  { month: "Aug", deals: 1 },
  { month: "Sep", deals: 2 },
  { month: "Oct", deals: 1 },
  { month: "Nov", deals: 3 },
  { month: "Dec", deals: 2 },
  { month: "Jan", deals: 1 },
];

const funnelData = [
  { stage: "Sent", value: 24, color: "hsl(var(--brand))" },
  { stage: "Viewed", value: 18, color: "hsl(var(--info))" },
  { stage: "Offer Made", value: 8, color: "hsl(var(--warning))" },
  { stage: "Closed", value: 5, color: "hsl(var(--success))" },
];

function formatCurrency(value: number | null): string {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function MetricCard({
  label,
  value,
  comparison,
  comparisonLabel,
}: {
  label: string;
  value: string | number;
  comparison?: number;
  comparisonLabel?: string;
}) {
  const isPositive = comparison && comparison > 0;
  const isNegative = comparison && comparison < 0;

  return (
    <div className="p-4 bg-surface-secondary rounded-medium">
      <div className="text-small text-content-secondary mb-1">{label}</div>
      <div className="text-h2 font-semibold text-content tabular-nums">{value}</div>
      {comparison !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {isPositive && <TrendingUp className="h-3.5 w-3.5 text-success" />}
          {isNegative && <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
          {!isPositive && !isNegative && <Minus className="h-3.5 w-3.5 text-content-tertiary" />}
          <span
            className={cn(
              "text-tiny",
              isPositive && "text-success",
              isNegative && "text-destructive",
              !isPositive && !isNegative && "text-content-tertiary"
            )}
          >
            {isPositive && "+"}
            {comparison}% {comparisonLabel}
          </span>
        </div>
      )}
    </div>
  );
}

export function DealSourcePerformanceTab({ source }: PerformanceTabProps) {
  const conversionRate =
    source.deals_sent && source.deals_sent > 0
      ? ((source.deals_closed || 0) / source.deals_sent) * 100
      : 0;

  const avgProfit =
    source.deals_closed && source.deals_closed > 0
      ? Number(source.total_profit || 0) / source.deals_closed
      : 0;

  // Determine recommendation based on performance
  const getRecommendation = () => {
    if (conversionRate >= 20 && (source.deals_closed || 0) >= 5) {
      return {
        type: "increase",
        text: "Top performer! Consider increasing deal volume from this source.",
        color: "text-success",
        bgColor: "bg-success/10",
      };
    } else if (conversionRate >= 10) {
      return {
        type: "maintain",
        text: "Solid relationship. Maintain current engagement level.",
        color: "text-info",
        bgColor: "bg-info/10",
      };
    } else if ((source.deals_sent || 0) < 3) {
      return {
        type: "grow",
        text: "New relationship. Focus on building rapport and requesting more deals.",
        color: "text-warning",
        bgColor: "bg-warning/10",
      };
    } else {
      return {
        type: "evaluate",
        text: "Below average conversion. Consider reducing focus or improving deal quality criteria.",
        color: "text-content-secondary",
        bgColor: "bg-surface-secondary",
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <div className="p-lg space-y-lg">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Avg Days to Close"
          value="23"
          comparison={-12}
          comparisonLabel="vs avg"
        />
        <MetricCard
          label="Avg Deal Size"
          value={formatCurrency(185000)}
          comparison={8}
          comparisonLabel="vs avg"
        />
        <MetricCard
          label="Avg Profit per Deal"
          value={formatCurrency(avgProfit)}
          comparison={15}
          comparisonLabel="vs avg"
        />
        <MetricCard
          label="Response Rate"
          value="85%"
          comparison={22}
          comparisonLabel="vs avg"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Deals Over Time */}
        <Card variant="default" padding="none">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-h3 font-medium">Deals Over Time</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyDealsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-subtle))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "hsl(var(--content-tertiary))" }}
                    axisLine={{ stroke: "hsl(var(--border-subtle))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--content-tertiary))" }}
                    axisLine={{ stroke: "hsl(var(--border-subtle))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="deals"
                    stroke="hsl(var(--brand))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--brand))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card variant="default" padding="none">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-h3 font-medium">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-subtle))" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "hsl(var(--content-tertiary))" }}
                    axisLine={{ stroke: "hsl(var(--border-subtle))" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    tick={{ fontSize: 12, fill: "hsl(var(--content-tertiary))" }}
                    axisLine={{ stroke: "hsl(var(--border-subtle))" }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="hsl(var(--brand))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card variant="default" padding="none">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-h3 font-medium">
            Performance vs. All {source.type === "agent" ? "Agents" : source.type === "wholesaler" ? "Wholesalers" : "Lenders"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-3 px-4 text-small font-medium text-content-secondary">Metric</th>
                  <th className="text-right py-3 px-4 text-small font-medium text-content-secondary">This Source</th>
                  <th className="text-right py-3 px-4 text-small font-medium text-content-secondary">Average</th>
                  <th className="text-right py-3 px-4 text-small font-medium text-content-secondary">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <tr>
                  <td className="py-3 px-4 text-body text-content">Conversion Rate</td>
                  <td className="py-3 px-4 text-body text-content text-right tabular-nums">{conversionRate.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-body text-content-secondary text-right tabular-nums">12.5%</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant={conversionRate > 12.5 ? "success" : "error"} size="sm">
                      {conversionRate > 12.5 ? "+" : ""}
                      {(conversionRate - 12.5).toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-body text-content">Avg Profit/Deal</td>
                  <td className="py-3 px-4 text-body text-content text-right tabular-nums">{formatCurrency(avgProfit)}</td>
                  <td className="py-3 px-4 text-body text-content-secondary text-right tabular-nums">$8,500</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant={avgProfit > 8500 ? "success" : "error"} size="sm">
                      {avgProfit > 8500 ? "+" : ""}
                      {formatCurrency(avgProfit - 8500)}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-body text-content">Response Rate</td>
                  <td className="py-3 px-4 text-body text-content text-right tabular-nums">85%</td>
                  <td className="py-3 px-4 text-body text-content-secondary text-right tabular-nums">65%</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="success" size="sm">+20%</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-body text-content">Days to Close</td>
                  <td className="py-3 px-4 text-body text-content text-right tabular-nums">23</td>
                  <td className="py-3 px-4 text-body text-content-secondary text-right tabular-nums">31</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="success" size="sm">-8 days</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card variant="default" padding="md" className={cn(recommendation.bgColor)}>
        <div className="flex items-start gap-3">
          <Lightbulb className={cn("h-5 w-5 mt-0.5 flex-shrink-0", recommendation.color)} />
          <div>
            <div className="text-small font-medium text-content mb-1">Recommendation</div>
            <p className={cn("text-body", recommendation.color)}>{recommendation.text}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
