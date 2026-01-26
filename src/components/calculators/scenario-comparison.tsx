import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalculatorInput } from "./calculator-input";
import { Check, Star } from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  inputs: Record<string, number>;
  results: {
    profit: number;
    roi: number;
    cashOnCash: number;
  };
}

interface ScenarioComparisonProps {
  scenarios: Scenario[];
  inputFields: { key: string; label: string; type?: "currency" | "percentage" | "number" }[];
  onScenarioChange: (scenarioId: string, key: string, value: number) => void;
  onApplyScenario: (scenarioId: string) => void;
  bestScenarioId?: string;
  className?: string;
}

export function ScenarioComparison({
  scenarios,
  inputFields,
  onScenarioChange,
  onApplyScenario,
  bestScenarioId,
  className,
}: ScenarioComparisonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-h3 font-medium text-content">Compare Scenarios</h4>
        <span className="text-small text-content-secondary">
          Adjust inputs to compare different deal structures
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {scenarios.map((scenario) => {
          const isBest = scenario.id === bestScenarioId;

          return (
            <Card
              key={scenario.id}
              variant="default"
              padding="none"
              className={cn(
                "overflow-hidden transition-all",
                isBest && "ring-2 ring-brand-accent"
              )}
            >
              {/* Header */}
              <div
                className={cn(
                  "px-4 py-3 border-b border-border-subtle flex items-center justify-between",
                  isBest ? "bg-brand-accent/5" : "bg-surface-secondary/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-body font-medium text-content">{scenario.name}</span>
                  {isBest && (
                    <Badge variant="success" size="sm" className="gap-1">
                      <Star className="h-3 w-3" />
                      Best
                    </Badge>
                  )}
                </div>
              </div>

              {/* Inputs */}
              <div className="p-4 space-y-3 border-b border-border-subtle">
                {inputFields.map((field) => (
                  <CalculatorInput
                    key={field.key}
                    label={field.label}
                    value={scenario.inputs[field.key] || 0}
                    onChange={(value) => onScenarioChange(scenario.id, field.key, value)}
                    type={field.type}
                  />
                ))}
              </div>

              {/* Results */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-small text-content-secondary">Profit</span>
                  <span
                    className={cn(
                      "text-h3 font-semibold tabular-nums",
                      scenario.results.profit > 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    ${scenario.results.profit.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-small text-content-secondary">ROI</span>
                  <span className="text-body font-medium text-content tabular-nums">
                    {scenario.results.roi.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-small text-content-secondary">Cash on Cash</span>
                  <span className="text-body font-medium text-content tabular-nums">
                    {scenario.results.cashOnCash.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 pt-0">
                <Button
                  variant={isBest ? "primary" : "secondary"}
                  size="sm"
                  fullWidth
                  icon={<Check />}
                  onClick={() => onApplyScenario(scenario.id)}
                >
                  Apply This Scenario
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
