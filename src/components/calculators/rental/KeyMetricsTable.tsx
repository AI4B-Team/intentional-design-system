import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RentalResults, RentalInputs } from "./types";

interface KeyMetricsTableProps {
  results: RentalResults;
  inputs: RentalInputs;
}

interface MetricRow {
  label: string;
  value: string;
  target: string;
  status: "pass" | "warn" | "fail";
}

export function KeyMetricsTable({ results, inputs }: KeyMetricsTableProps) {
  const onePercentValue = (inputs.monthlyRent / inputs.purchasePrice) * 100;

  const metrics: MetricRow[] = [
    {
      label: "Cap Rate",
      value: `${results.capRate.toFixed(1)}%`,
      target: ">6%",
      status: results.capRate >= 6 ? "pass" : results.capRate >= 5 ? "warn" : "fail",
    },
    {
      label: "Cash-on-Cash",
      value: `${results.cashOnCash.toFixed(1)}%`,
      target: ">8%",
      status: results.cashOnCash >= 8 ? "pass" : results.cashOnCash >= 5 ? "warn" : "fail",
    },
    {
      label: "GRM",
      value: results.grm.toFixed(1),
      target: "<10",
      status: results.grm <= 10 ? "pass" : results.grm <= 12 ? "warn" : "fail",
    },
    {
      label: "DSCR",
      value: results.dscr.toFixed(2),
      target: ">1.25",
      status: results.dscr >= 1.25 ? "pass" : results.dscr >= 1 ? "warn" : "fail",
    },
    {
      label: "1% Rule",
      value: `${onePercentValue.toFixed(1)}%`,
      target: "≥1%",
      status: results.onePercentRule ? "pass" : "fail",
    },
  ];

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3">Key Metrics</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-small">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium text-muted-foreground">Metric</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Value</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Target</th>
              <th className="text-center py-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.label} className="border-b last:border-0">
                <td className="py-2">{metric.label}</td>
                <td className="py-2 text-right font-medium tabular-nums">{metric.value}</td>
                <td className="py-2 text-right text-muted-foreground">{metric.target}</td>
                <td className="py-2 text-center">
                  {metric.status === "pass" && <CheckCircle2 className="h-4 w-4 text-success inline" />}
                  {metric.status === "warn" && <AlertTriangle className="h-4 w-4 text-warning inline" />}
                  {metric.status === "fail" && <XCircle className="h-4 w-4 text-destructive inline" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
