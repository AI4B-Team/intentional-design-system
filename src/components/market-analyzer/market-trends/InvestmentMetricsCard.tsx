import * as React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InvestmentMetric } from "./types";

interface InvestmentMetricsCardProps {
  metrics: InvestmentMetric[];
}

function getRatingIcon(rating: "good" | "average" | "poor") {
  switch (rating) {
    case "good":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "average":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case "poor":
      return <XCircle className="h-4 w-4 text-destructive" />;
  }
}

function getRatingLabel(rating: "good" | "average" | "poor") {
  switch (rating) {
    case "good":
      return "Strong";
    case "average":
      return "Average";
    case "poor":
      return "Low";
  }
}

export function InvestmentMetricsCard({ metrics }: InvestmentMetricsCardProps) {
  // Determine overall market type
  const appreciationMetric = metrics.find(m => m.label.includes("Appreciation"));
  const cashFlowMetrics = metrics.filter(m => m.label.includes("Yield") || m.label.includes("Cap"));
  const isAppreciationMarket = appreciationMetric?.rating === "good" && 
    cashFlowMetrics.some(m => m.rating !== "good");

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Investment Metrics</h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-small">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium text-muted-foreground">Metric</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Value</th>
              <th className="text-center py-2 font-medium text-muted-foreground">Rating</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.label} className="border-b last:border-0 border-border-subtle">
                <td className="py-2">
                  <div>{metric.label}</div>
                  {metric.description && (
                    <div className="text-tiny text-muted-foreground">{metric.description}</div>
                  )}
                </td>
                <td className="py-2 text-right font-medium tabular-nums">{metric.value}</td>
                <td className="py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    {getRatingIcon(metric.rating)}
                    <span className={cn(
                      "text-tiny",
                      metric.rating === "good" && "text-success",
                      metric.rating === "average" && "text-warning",
                      metric.rating === "poor" && "text-destructive",
                    )}>
                      {getRatingLabel(metric.rating)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Market Summary */}
      <div className={cn(
        "mt-4 p-3 rounded-md text-small",
        isAppreciationMarket ? "bg-info/10 text-info" : "bg-success/10 text-success"
      )}>
        {isAppreciationMarket ? (
          <>📈 Market favors appreciation over cash flow</>
        ) : (
          <>💰 Market supports cash flow investments</>
        )}
      </div>
    </Card>
  );
}
