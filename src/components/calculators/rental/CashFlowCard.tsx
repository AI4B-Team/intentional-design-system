import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { RentalResults } from "./types";

interface CashFlowCardProps {
  results: RentalResults;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function CashFlowCard({ results }: CashFlowCardProps) {
  const isPositive = results.monthlyCashFlow >= 0;

  return (
    <Card className={cn(
      "p-4 border-2",
      isPositive ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
    )}>
      <div className="text-center mb-4">
        <div className="text-small text-muted-foreground uppercase tracking-wide mb-1">
          Monthly Cash Flow
        </div>
        <div className={cn(
          "text-3xl font-bold flex items-center justify-center gap-2",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
          {formatCurrency(results.monthlyCashFlow)}
          {isPositive ? "✅" : "❌"}
        </div>
      </div>

      <div className="space-y-2 text-small">
        <div className="flex items-center justify-between py-1.5">
          <span className="text-muted-foreground">Effective Income:</span>
          <span className="font-medium tabular-nums">{formatCurrency(results.effectiveGrossIncome)}</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-muted-foreground">- Expenses:</span>
          <span className="font-medium tabular-nums text-destructive">-{formatCurrency(results.totalMonthlyExpenses)}</span>
        </div>
        <div className="border-t pt-1.5 flex items-center justify-between">
          <span className="text-muted-foreground">NOI:</span>
          <span className="font-medium tabular-nums">{formatCurrency(results.monthlyNOI)}</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-muted-foreground">- Debt Service:</span>
          <span className="font-medium tabular-nums text-destructive">-{formatCurrency(results.totalMonthlyDebtService)}</span>
        </div>
        <div className="border-t pt-2 flex items-center justify-between font-semibold">
          <span>CASH FLOW:</span>
          <span className={cn("tabular-nums", isPositive ? "text-success" : "text-destructive")}>
            {formatCurrency(results.monthlyCashFlow)} {isPositive ? "✅" : "❌"}
          </span>
        </div>
        <div className="pt-2 text-center text-muted-foreground">
          Yearly: <span className={cn("font-semibold", isPositive ? "text-success" : "text-destructive")}>
            {formatCurrency(results.annualCashFlow)}
          </span>
        </div>
      </div>
    </Card>
  );
}
