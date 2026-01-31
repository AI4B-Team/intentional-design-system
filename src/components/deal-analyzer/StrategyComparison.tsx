import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Hammer,
  Handshake,
  Building,
  RefreshCw,
  Plane,
  Crown,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalculatorType, DealInput } from "./types";

interface StrategyResult {
  type: CalculatorType;
  name: string;
  icon: React.ElementType;
  color: string;
  score: number;
  profit: number;
  roi: number;
  timeframe: string;
  riskLevel: "Low" | "Medium" | "High";
  isRecommended: boolean;
}

interface StrategyComparisonProps {
  dealInput: DealInput;
  onSelectStrategy: (type: CalculatorType) => void;
}

const iconMap = {
  flip: Hammer,
  wholesale: Handshake,
  rental: Building,
  brrrr: RefreshCw,
  str: Plane,
};

const colorMap = {
  flip: "from-orange-500 to-amber-500",
  wholesale: "from-blue-500 to-cyan-500",
  rental: "from-green-500 to-emerald-500",
  brrrr: "from-purple-500 to-violet-500",
  str: "from-pink-500 to-rose-500",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function StrategyComparison({ dealInput, onSelectStrategy }: StrategyComparisonProps) {
  // Calculate estimated results for each strategy
  const calculateStrategies = (): StrategyResult[] => {
    const askingPrice = dealInput.askingPrice || 200000;
    const arv = dealInput.arv || askingPrice * 1.3;
    const repairs = dealInput.repairEstimate || 30000;
    const rent = dealInput.monthlyRent || Math.round(askingPrice * 0.008);

    const strategies: StrategyResult[] = [
      {
        type: "wholesale",
        name: "Wholesale",
        icon: Handshake,
        color: colorMap.wholesale,
        score: 75,
        profit: Math.max(5000, Math.round((arv * 0.7 - repairs - askingPrice) * 0.3)),
        roi: 0,
        timeframe: "2-4 weeks",
        riskLevel: "Low",
        isRecommended: false,
      },
      {
        type: "flip",
        name: "Fix & Flip",
        icon: Hammer,
        color: colorMap.flip,
        score: 82,
        profit: Math.round(arv - askingPrice - repairs - (arv * 0.08) - 15000),
        roi: 0,
        timeframe: "4-6 months",
        riskLevel: "Medium",
        isRecommended: false,
      },
      {
        type: "rental",
        name: "Long-Term Rental",
        icon: Building,
        color: colorMap.rental,
        score: 68,
        profit: Math.round((rent * 0.55 - (askingPrice * 0.005)) * 12),
        roi: 0,
        timeframe: "Ongoing",
        riskLevel: "Low",
        isRecommended: false,
      },
      {
        type: "brrrr",
        name: "BRRRR",
        icon: RefreshCw,
        color: colorMap.brrrr,
        score: 78,
        profit: Math.round(arv * 0.75 - askingPrice - repairs),
        roi: 0,
        timeframe: "6-12 months",
        riskLevel: "Medium",
        isRecommended: false,
      },
      {
        type: "str",
        name: "Short-Term Rental",
        icon: Plane,
        color: colorMap.str,
        score: 72,
        profit: Math.round((rent * 1.8 * 0.65 - (askingPrice * 0.006)) * 12),
        roi: 0,
        timeframe: "Ongoing",
        riskLevel: "High",
        isRecommended: false,
      },
    ];

    // Calculate ROI for each
    const cashInvested = askingPrice * 0.25 + repairs;
    strategies.forEach((s) => {
      s.roi = Number(((s.profit / cashInvested) * 100).toFixed(1));
    });

    // Find and mark recommended
    const sorted = [...strategies].sort((a, b) => b.score - a.score);
    sorted[0].isRecommended = true;

    return strategies;
  };

  const strategies = calculateStrategies();
  const recommended = strategies.find((s) => s.isRecommended);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Strategy Comparison
        </h3>
        {recommended && (
          <Badge variant="success" size="sm" className="gap-1">
            <Crown className="h-3 w-3" />
            {recommended.name} Recommended
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {strategies.map((strategy) => {
          const Icon = strategy.icon;
          return (
            <div
              key={strategy.type}
              onClick={() => onSelectStrategy(strategy.type)}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all",
                strategy.isRecommended
                  ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                  : "border-border-subtle hover:bg-surface-secondary/50"
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                  strategy.color
                )}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{strategy.name}</span>
                  {strategy.isRecommended && (
                    <Crown className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-small text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {strategy.timeframe}
                  </span>
                  <span className={cn(
                    "font-medium",
                    strategy.riskLevel === "Low" && "text-emerald-600",
                    strategy.riskLevel === "Medium" && "text-amber-600",
                    strategy.riskLevel === "High" && "text-red-600"
                  )}>
                    {strategy.riskLevel} Risk
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className={cn(
                  "font-bold",
                  strategy.profit > 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  {formatCurrency(strategy.profit)}
                </div>
                <div className="text-tiny text-muted-foreground">
                  {strategy.roi > 0 ? `${strategy.roi}% ROI` : "Annual"}
                </div>
              </div>

              <div className="w-16 flex-shrink-0">
                <div className="text-tiny text-muted-foreground text-right mb-1">
                  {strategy.score}/100
                </div>
                <Progress value={strategy.score} className="h-1.5" />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-tiny text-muted-foreground mt-3 text-center">
        Click any strategy to see detailed analysis
      </p>
    </Card>
  );
}
