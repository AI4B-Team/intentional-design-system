import * as React from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, XCircle, TrendingUp, DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RentalResults, RentalInputs } from "./types";

interface DealVerdictProps {
  results: RentalResults;
  inputs: RentalInputs;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DealVerdict({ results, inputs }: DealVerdictProps) {
  const isNegativeCashFlow = results.monthlyCashFlow < 0;
  const isLowCoC = results.cashOnCash < 5;
  const isLowDSCR = results.dscr < 1;

  // Calculate break-even rent
  const breakEvenRent = Math.ceil(
    (results.totalMonthlyExpenses + results.totalMonthlyDebtService) / 
    (1 - (inputs.vacancyRate + inputs.creditLossRate) / 100)
  );

  // Calculate break-even purchase price (at current rent)
  const targetCapRate = 0.06; // 6% target
  const breakEvenPrice = Math.floor(results.annualNOI / targetCapRate);

  // Calculate needed down payment for positive cash flow
  const neededDownPaymentForPositive = (() => {
    // Solve for down payment where cash flow = 0
    // This is a simplification
    for (let dp = 20; dp <= 100; dp += 5) {
      const downPayment = inputs.purchasePrice * (dp / 100);
      const loanAmount = inputs.purchasePrice - downPayment;
      const monthlyRate = inputs.interestRate / 100 / 12;
      const numPayments = inputs.loanTermYears * 12;
      const monthlyPI = loanAmount > 0 
        ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
        : 0;
      const cashFlow = results.monthlyNOI - monthlyPI;
      if (cashFlow >= 0) return dp;
    }
    return null;
  })();

  const getVerdictInfo = () => {
    if (isNegativeCashFlow) {
      return {
        icon: XCircle,
        title: "Negative Cash Flow",
        color: "text-destructive",
        bg: "bg-destructive/10 border-destructive/20",
      };
    }
    if (isLowCoC || isLowDSCR) {
      return {
        icon: AlertTriangle,
        title: "Below Target Returns",
        color: "text-warning",
        bg: "bg-warning/10 border-warning/20",
      };
    }
    return {
      icon: CheckCircle2,
      title: "Good Investment",
      color: "text-success",
      bg: "bg-success/10 border-success/20",
    };
  };

  const verdict = getVerdictInfo();
  const Icon = verdict.icon;

  const suggestions: string[] = [];
  
  if (isNegativeCashFlow) {
    suggestions.push(`Increase rent to ${formatCurrency(breakEvenRent)}/mo to break even`);
    suggestions.push(`Lower purchase price to ${formatCurrency(breakEvenPrice)}`);
    if (neededDownPaymentForPositive && neededDownPaymentForPositive > inputs.downPaymentPercent) {
      suggestions.push(`Increase down payment to ${neededDownPaymentForPositive}%`);
    }
  } else if (isLowCoC) {
    suggestions.push("Consider negotiating a lower purchase price");
    suggestions.push("Look for value-add opportunities to increase rent");
  }

  return (
    <Card className={cn("p-4 border-2", verdict.bg)}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={cn("h-6 w-6", verdict.color)} />
        <h4 className={cn("font-bold text-lg", verdict.color)}>{verdict.title}</h4>
      </div>

      {isNegativeCashFlow && (
        <p className="text-small text-muted-foreground mb-4">
          This property loses {formatCurrency(Math.abs(results.monthlyCashFlow))}/month. Consider:
        </p>
      )}

      {suggestions.length > 0 && (
        <ul className="space-y-2">
          {suggestions.map((suggestion, i) => (
            <li key={i} className="flex items-start gap-2 text-small">
              <span className="text-muted-foreground">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      )}

      {!isNegativeCashFlow && !isLowCoC && (
        <p className="text-small text-muted-foreground">
          This property generates positive cash flow with solid returns. Consider proceeding with further due diligence.
        </p>
      )}
    </Card>
  );
}
