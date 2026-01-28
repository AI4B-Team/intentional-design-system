import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalculatorInput, CalculatorSlider } from "../calculator-input";
import { ArrowRight, Banknote, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RentalInputs, RentalResults } from "./types";

interface BRRRRSectionProps {
  inputs: RentalInputs;
  results: RentalResults;
  onUpdate: <K extends keyof RentalInputs>(key: K, value: RentalInputs[K]) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function BRRRRSection({ inputs, results, onUpdate }: BRRRRSectionProps) {
  const isInfiniteROI = results.cashLeftInDeal <= 0;

  return (
    <Card variant="default" padding="none" className="border-primary/30 bg-primary/5">
      <div className="px-md py-4 border-b border-primary/20 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-h3 font-medium text-content">BRRRR Refinance</h3>
        <Badge variant="info" size="sm">Strategy</Badge>
      </div>
      <div className="p-md space-y-4">
        <CalculatorInput
          label="After Repair Value (ARV)"
          value={inputs.arv}
          onChange={(v) => onUpdate("arv", v)}
          type="currency"
          tooltip="Estimated value after all repairs are complete"
        />

        <div className="grid grid-cols-2 gap-4">
          <CalculatorSlider
            label="Refinance LTV"
            value={inputs.refiLTV}
            onChange={(v) => onUpdate("refiLTV", v)}
            min={60}
            max={80}
            step={5}
          />
          <CalculatorSlider
            label="New Rate"
            value={inputs.refiRate}
            onChange={(v) => onUpdate("refiRate", v)}
            min={5}
            max={12}
            step={0.125}
          />
        </div>

        {/* Refinance Results */}
        <div className="space-y-3 pt-3 border-t border-primary/20">
          <div className="flex items-center justify-between text-small">
            <span className="text-muted-foreground">New Loan Amount</span>
            <span className="font-medium tabular-nums">{formatCurrency(results.newLoanAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-small">
            <span className="text-muted-foreground">New Monthly P&I</span>
            <span className="font-medium tabular-nums">{formatCurrency(results.newMonthlyPI)}</span>
          </div>
          
          <div className="flex items-center gap-2 py-2">
            <div className="flex-1 h-px bg-primary/20" />
            <ArrowRight className="h-4 w-4 text-primary" />
            <div className="flex-1 h-px bg-primary/20" />
          </div>

          <div className={cn(
            "flex items-center justify-between p-3 rounded-md",
            results.cashOut >= 0 ? "bg-success/10" : "bg-destructive/10"
          )}>
            <div className="flex items-center gap-2">
              <Banknote className={cn("h-4 w-4", results.cashOut >= 0 ? "text-success" : "text-destructive")} />
              <span className="text-small font-medium">Cash Out at Refi</span>
            </div>
            <span className={cn(
              "font-semibold tabular-nums",
              results.cashOut >= 0 ? "text-success" : "text-destructive"
            )}>
              {formatCurrency(results.cashOut)}
            </span>
          </div>

          <div className={cn(
            "flex items-center justify-between p-3 rounded-md",
            isInfiniteROI ? "bg-success/20 border border-success/30" : "bg-surface-secondary"
          )}>
            <span className="text-small font-medium">Cash Left in Deal</span>
            <div className="text-right">
              <span className={cn(
                "font-bold tabular-nums",
                isInfiniteROI ? "text-success" : ""
              )}>
                {formatCurrency(Math.max(0, results.cashLeftInDeal))}
              </span>
              {isInfiniteROI && (
                <div className="text-tiny text-success">♾️ Infinite ROI!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
