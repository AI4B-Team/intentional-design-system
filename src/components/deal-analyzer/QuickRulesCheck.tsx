import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calculator,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DealInput, CalculatorType } from "./types";

interface RuleCheck {
  id: string;
  name: string;
  description: string;
  passed: boolean | null;
  value: string;
  target: string;
}

interface QuickRulesCheckProps {
  dealInput: DealInput;
  calculatorType: CalculatorType;
}

export function QuickRulesCheck({ dealInput, calculatorType }: QuickRulesCheckProps) {
  const calculateRules = (): RuleCheck[] => {
    const askingPrice = dealInput.askingPrice || 0;
    const arv = dealInput.arv || 0;
    const repairs = dealInput.repairEstimate || 0;
    const rent = dealInput.monthlyRent || 0;

    const rules: RuleCheck[] = [];

    // 70% Rule (for flips/wholesale)
    if (["flip", "wholesale", "brrrr"].includes(calculatorType)) {
      const mao70 = arv * 0.7 - repairs;
      const passes70 = askingPrice > 0 && askingPrice <= mao70;
      rules.push({
        id: "70-rule",
        name: "70% Rule",
        description: "Purchase price should be ≤ (ARV × 70%) - Repairs",
        passed: arv > 0 ? passes70 : null,
        value: askingPrice > 0 ? `$${Math.round(askingPrice).toLocaleString()}` : "—",
        target: arv > 0 ? `≤ $${Math.round(mao70).toLocaleString()}` : "Need ARV",
      });
    }

    // 1% Rule (for rentals)
    if (["rental", "brrrr", "str"].includes(calculatorType)) {
      const totalCost = askingPrice + repairs;
      const onePercent = totalCost * 0.01;
      const passes1Pct = rent >= onePercent;
      rules.push({
        id: "1-rule",
        name: "1% Rule",
        description: "Monthly rent should be ≥ 1% of total investment",
        passed: rent > 0 && totalCost > 0 ? passes1Pct : null,
        value: rent > 0 ? `$${rent.toLocaleString()}/mo` : "—",
        target: totalCost > 0 ? `≥ $${Math.round(onePercent).toLocaleString()}/mo` : "Need price",
      });
    }

    // 50% Rule (for rentals)
    if (["rental", "brrrr", "str"].includes(calculatorType)) {
      const expenses50 = rent * 0.5;
      rules.push({
        id: "50-rule",
        name: "50% Rule",
        description: "Expect ~50% of rent to go to expenses (excluding mortgage)",
        passed: rent > 0 ? true : null,
        value: rent > 0 ? `$${Math.round(expenses50).toLocaleString()}/mo` : "—",
        target: "Est. expenses",
      });
    }

    // Cap Rate (for rentals)
    if (["rental", "brrrr"].includes(calculatorType)) {
      const annualNOI = rent * 12 * 0.55;
      const capRate = askingPrice > 0 ? (annualNOI / askingPrice) * 100 : 0;
      const passesCapRate = capRate >= 6;
      rules.push({
        id: "cap-rate",
        name: "Cap Rate",
        description: "Net Operating Income / Purchase Price. Target ≥ 6%",
        passed: rent > 0 && askingPrice > 0 ? passesCapRate : null,
        value: capRate > 0 ? `${capRate.toFixed(1)}%` : "—",
        target: "≥ 6%",
      });
    }

    // Spread Check (for wholesale)
    if (calculatorType === "wholesale") {
      const spread = arv * 0.7 - repairs - askingPrice;
      const passesSpread = spread >= 15000;
      rules.push({
        id: "spread",
        name: "Spread Check",
        description: "Room for assignment fee after MAO calculation",
        passed: arv > 0 && askingPrice > 0 ? passesSpread : null,
        value: spread > 0 ? `$${Math.round(spread).toLocaleString()}` : "—",
        target: "≥ $15,000",
      });
    }

    // ROI Check (for flips)
    if (calculatorType === "flip") {
      const profit = arv - askingPrice - repairs - (arv * 0.08) - 15000;
      const investment = askingPrice * 0.25 + repairs;
      const roi = investment > 0 ? (profit / investment) * 100 : 0;
      const passesROI = roi >= 15;
      rules.push({
        id: "flip-roi",
        name: "Flip ROI",
        description: "Target return on cash invested ≥ 15%",
        passed: arv > 0 && askingPrice > 0 ? passesROI : null,
        value: roi !== 0 ? `${roi.toFixed(0)}%` : "—",
        target: "≥ 15%",
      });
    }

    return rules;
  };

  const rules = calculateRules();
  const passedCount = rules.filter((r) => r.passed === true).length;
  const checkedCount = rules.filter((r) => r.passed !== null).length;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          Quick Rules Check
        </h3>
        {checkedCount > 0 && (
          <Badge
            variant={passedCount === checkedCount ? "success" : passedCount > 0 ? "warning" : "error"}
            size="sm"
          >
            {passedCount}/{checkedCount} Passed
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border",
              rule.passed === true && "bg-emerald-50/50 border-emerald-200",
              rule.passed === false && "bg-red-50/50 border-red-200",
              rule.passed === null && "bg-muted/30 border-border-subtle"
            )}
          >
            <div className="flex-shrink-0">
              {rule.passed === true && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              )}
              {rule.passed === false && (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {rule.passed === null && (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground text-small">
                  {rule.name}
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/50" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-small">{rule.description}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-tiny text-muted-foreground">
                Target: {rule.target}
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span
                className={cn(
                  "font-semibold text-small",
                  rule.passed === true && "text-emerald-600",
                  rule.passed === false && "text-red-600",
                  rule.passed === null && "text-muted-foreground"
                )}
              >
                {rule.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {checkedCount === 0 && (
        <p className="text-small text-muted-foreground text-center py-2">
          Enter deal details to see rule checks
        </p>
      )}
    </Card>
  );
}
