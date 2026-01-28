import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import type { RentalResults, RentalInputs } from "./types";

interface RulesOfThumbProps {
  results: RentalResults;
  inputs: RentalInputs;
}

export function RulesOfThumb({ results, inputs }: RulesOfThumbProps) {
  const onePercentValue = (inputs.monthlyRent / inputs.purchasePrice) * 100;
  const fiftyPercentValue = (results.totalMonthlyExpenses / results.grossMonthlyIncome) * 100;

  const rules = [
    {
      name: "1% Rule",
      description: `$${inputs.monthlyRent.toLocaleString()} ÷ $${inputs.purchasePrice.toLocaleString()} = ${onePercentValue.toFixed(1)}%`,
      passes: results.onePercentRule,
    },
    {
      name: "2% Rule",
      description: `${onePercentValue.toFixed(1)}%`,
      passes: results.twoPercentRule,
    },
    {
      name: "50% Rule",
      description: `Expenses = ${fiftyPercentValue.toFixed(0)}% of rent`,
      passes: results.fiftyPercentRule,
      approximate: true,
    },
  ];

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3">Rules of Thumb</h4>
      <div className="space-y-2">
        {rules.map((rule) => (
          <div
            key={rule.name}
            className="flex items-center justify-between p-2 bg-surface-secondary rounded-md"
          >
            <div>
              <span className="font-medium text-small">{rule.name}</span>
              <span className="text-tiny text-muted-foreground ml-2">{rule.description}</span>
            </div>
            {rule.passes ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <Badge variant="success" size="sm">
                  {rule.approximate ? "≈ Pass" : "Pass"}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-destructive" />
                <Badge variant="error" size="sm">Fail</Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
