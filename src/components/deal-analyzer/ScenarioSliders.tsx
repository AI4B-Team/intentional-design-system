import * as React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealInput, CalculatorType } from "./types";

interface ScenarioSlidersProps {
  dealInput: DealInput;
  calculatorType: CalculatorType;
  onChange: (adjustments: ScenarioAdjustments) => void;
}

export interface ScenarioAdjustments {
  arvAdjustment: number;
  repairAdjustment: number;
  rentAdjustment: number;
  vacancyRate: number;
  holdingMonths: number;
}

const DEFAULT_ADJUSTMENTS: ScenarioAdjustments = {
  arvAdjustment: 0,
  repairAdjustment: 0,
  rentAdjustment: 0,
  vacancyRate: 8,
  holdingMonths: 6,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ScenarioSliders({ dealInput, calculatorType, onChange }: ScenarioSlidersProps) {
  const [adjustments, setAdjustments] = React.useState<ScenarioAdjustments>(DEFAULT_ADJUSTMENTS);

  const handleChange = (key: keyof ScenarioAdjustments, value: number) => {
    const updated = { ...adjustments, [key]: value };
    setAdjustments(updated);
    onChange(updated);
  };

  // Calculate adjusted values
  const baseArv = dealInput.arv || 0;
  const baseRepairs = dealInput.repairEstimate || 0;
  const baseRent = dealInput.monthlyRent || 0;

  const adjustedArv = baseArv * (1 + adjustments.arvAdjustment / 100);
  const adjustedRepairs = baseRepairs * (1 + adjustments.repairAdjustment / 100);
  const adjustedRent = baseRent * (1 + adjustments.rentAdjustment / 100);

  // Calculate scenario profit
  const calculateProfit = () => {
    const askingPrice = dealInput.askingPrice || 0;
    switch (calculatorType) {
      case "flip":
        const holdingCosts = adjustments.holdingMonths * 2500;
        return adjustedArv - askingPrice - adjustedRepairs - (adjustedArv * 0.08) - holdingCosts;
      case "wholesale":
        return adjustedArv * 0.7 - adjustedRepairs - askingPrice;
      case "rental":
      case "brrrr":
        const monthlyNOI = adjustedRent * (1 - adjustments.vacancyRate / 100) * 0.55;
        const mortgage = askingPrice * 0.005;
        return (monthlyNOI - mortgage) * 12;
      default:
        return 0;
    }
  };

  const profit = calculateProfit();
  const baseProfit = (() => {
    const askingPrice = dealInput.askingPrice || 0;
    switch (calculatorType) {
      case "flip":
        return baseArv - askingPrice - baseRepairs - (baseArv * 0.08) - 15000;
      case "wholesale":
        return baseArv * 0.7 - baseRepairs - askingPrice;
      case "rental":
      case "brrrr":
        return (baseRent * 0.92 * 0.55 - (askingPrice * 0.005)) * 12;
      default:
        return 0;
    }
  })();

  const profitChange = profit - baseProfit;
  const profitChangePercent = baseProfit !== 0 ? (profitChange / Math.abs(baseProfit)) * 100 : 0;

  const showRentalSliders = ["rental", "brrrr", "str"].includes(calculatorType);
  const showFlipSliders = ["flip", "wholesale"].includes(calculatorType);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Scenario Analysis
        </h3>
        <Badge
          variant={profitChange > 0 ? "success" : profitChange < 0 ? "error" : "secondary"}
          size="sm"
          className="gap-1"
        >
          {profitChange > 0 ? <TrendingUp className="h-3 w-3" /> : profitChange < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {profitChange >= 0 ? "+" : ""}{formatCurrency(profitChange)}
        </Badge>
      </div>

      <div className="space-y-5">
        {/* ARV Adjustment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-small">ARV Adjustment</Label>
            <span className={cn(
              "text-small font-medium",
              adjustments.arvAdjustment > 0 && "text-emerald-600",
              adjustments.arvAdjustment < 0 && "text-red-600"
            )}>
              {adjustments.arvAdjustment > 0 ? "+" : ""}{adjustments.arvAdjustment}%
              {baseArv > 0 && (
                <span className="text-muted-foreground ml-1">
                  ({formatCurrency(adjustedArv)})
                </span>
              )}
            </span>
          </div>
          <Slider
            value={[adjustments.arvAdjustment]}
            onValueChange={([v]) => handleChange("arvAdjustment", v)}
            min={-20}
            max={20}
            step={1}
          />
          <div className="flex justify-between text-tiny text-muted-foreground">
            <span>Conservative (-20%)</span>
            <span>Optimistic (+20%)</span>
          </div>
        </div>

        {/* Repair Adjustment */}
        {showFlipSliders && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-small">Repair Cost Adjustment</Label>
              <span className={cn(
                "text-small font-medium",
                adjustments.repairAdjustment < 0 && "text-emerald-600",
                adjustments.repairAdjustment > 0 && "text-red-600"
              )}>
                {adjustments.repairAdjustment > 0 ? "+" : ""}{adjustments.repairAdjustment}%
                {baseRepairs > 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({formatCurrency(adjustedRepairs)})
                  </span>
                )}
              </span>
            </div>
            <Slider
              value={[adjustments.repairAdjustment]}
              onValueChange={([v]) => handleChange("repairAdjustment", v)}
              min={-20}
              max={50}
              step={5}
            />
            <div className="flex justify-between text-tiny text-muted-foreground">
              <span>Under Budget</span>
              <span>Cost Overrun (+50%)</span>
            </div>
          </div>
        )}

        {/* Holding Period */}
        {calculatorType === "flip" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-small">Holding Period</Label>
              <span className="text-small font-medium">
                {adjustments.holdingMonths} months
              </span>
            </div>
            <Slider
              value={[adjustments.holdingMonths]}
              onValueChange={([v]) => handleChange("holdingMonths", v)}
              min={3}
              max={12}
              step={1}
            />
            <div className="flex justify-between text-tiny text-muted-foreground">
              <span>Quick Flip (3 mo)</span>
              <span>Extended (12 mo)</span>
            </div>
          </div>
        )}

        {/* Rent Adjustment */}
        {showRentalSliders && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-small">Rent Adjustment</Label>
              <span className={cn(
                "text-small font-medium",
                adjustments.rentAdjustment > 0 && "text-emerald-600",
                adjustments.rentAdjustment < 0 && "text-red-600"
              )}>
                {adjustments.rentAdjustment > 0 ? "+" : ""}{adjustments.rentAdjustment}%
                {baseRent > 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({formatCurrency(adjustedRent)}/mo)
                  </span>
                )}
              </span>
            </div>
            <Slider
              value={[adjustments.rentAdjustment]}
              onValueChange={([v]) => handleChange("rentAdjustment", v)}
              min={-15}
              max={15}
              step={1}
            />
          </div>
        )}

        {/* Vacancy Rate */}
        {showRentalSliders && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-small">Vacancy Rate</Label>
              <span className="text-small font-medium">
                {adjustments.vacancyRate}%
              </span>
            </div>
            <Slider
              value={[adjustments.vacancyRate]}
              onValueChange={([v]) => handleChange("vacancyRate", v)}
              min={0}
              max={20}
              step={1}
            />
            <div className="flex justify-between text-tiny text-muted-foreground">
              <span>0% (Fully Occupied)</span>
              <span>20% (High Turnover)</span>
            </div>
          </div>
        )}
      </div>

      {/* Scenario Summary */}
      <div className="mt-5 pt-4 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <span className="text-small text-muted-foreground">Scenario Profit</span>
          <span className={cn(
            "text-lg font-bold",
            profit > 0 ? "text-emerald-600" : "text-red-600"
          )}>
            {formatCurrency(profit)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-tiny text-muted-foreground">vs Base Case</span>
          <span className={cn(
            "text-small",
            profitChange > 0 ? "text-emerald-600" : profitChange < 0 ? "text-red-600" : "text-muted-foreground"
          )}>
            {profitChange >= 0 ? "+" : ""}{profitChangePercent.toFixed(0)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
