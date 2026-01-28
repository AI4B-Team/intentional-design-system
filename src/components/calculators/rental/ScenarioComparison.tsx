import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RentalInputs, RentalMode } from "./types";
import { calculateScenarios } from "./useRentalCalculations";

interface ScenarioComparisonProps {
  inputs: RentalInputs;
  mode: RentalMode;
  currentDownPayment: number;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function ScenarioComparison({ inputs, mode, currentDownPayment }: ScenarioComparisonProps) {
  const scenarios = React.useMemo(
    () => calculateScenarios(inputs, mode),
    [inputs, mode]
  );

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-4">Scenario Comparison</h4>
      
      <div className="overflow-x-auto">
        <table className="w-full text-small">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium text-muted-foreground"></th>
              {scenarios.map((s) => (
                <th
                  key={s.label}
                  className={cn(
                    "text-center py-2 font-medium",
                    s.downPaymentPercent === currentDownPayment && "bg-primary/10 text-primary"
                  )}
                >
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 text-muted-foreground">Cash In</td>
              {scenarios.map((s) => (
                <td
                  key={s.label}
                  className={cn(
                    "py-2 text-center tabular-nums font-medium",
                    s.downPaymentPercent === currentDownPayment && "bg-primary/10"
                  )}
                >
                  {formatCurrency(s.cashInvested)}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="py-2 text-muted-foreground">Cash Flow</td>
              {scenarios.map((s) => (
                <td
                  key={s.label}
                  className={cn(
                    "py-2 text-center tabular-nums font-medium",
                    s.downPaymentPercent === currentDownPayment && "bg-primary/10",
                    s.monthlyCashFlow >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {formatCurrency(s.monthlyCashFlow)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 text-muted-foreground">CoC</td>
              {scenarios.map((s) => (
                <td
                  key={s.label}
                  className={cn(
                    "py-2 text-center tabular-nums font-medium",
                    s.downPaymentPercent === currentDownPayment && "bg-primary/10",
                    s.cashOnCash >= 8 ? "text-success" : s.cashOnCash >= 5 ? "text-warning" : "text-destructive"
                  )}
                >
                  {s.cashOnCash.toFixed(1)}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
