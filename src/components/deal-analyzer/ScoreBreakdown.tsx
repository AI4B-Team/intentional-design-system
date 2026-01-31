import * as React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  DollarSign,
  MapPin,
  Home,
  BarChart3,
  Shield,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScoreCategory {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  icon: React.ElementType;
  description: string;
}

interface ScoreBreakdownProps {
  totalScore: number;
  categories?: ScoreCategory[];
}

const defaultCategories: ScoreCategory[] = [
  {
    id: "profit",
    name: "Profit Potential",
    score: 22,
    maxScore: 25,
    icon: DollarSign,
    description: "Based on spread between purchase price and ARV minus costs",
  },
  {
    id: "roi",
    name: "Return on Investment",
    score: 18,
    maxScore: 25,
    icon: TrendingUp,
    description: "Cash-on-cash return compared to market benchmarks",
  },
  {
    id: "market",
    name: "Market Conditions",
    score: 15,
    maxScore: 20,
    icon: MapPin,
    description: "Local market trends, days on market, and appreciation",
  },
  {
    id: "property",
    name: "Property Factors",
    score: 12,
    maxScore: 15,
    icon: Home,
    description: "Property type, condition, age, and features",
  },
  {
    id: "risk",
    name: "Risk Assessment",
    score: 10,
    maxScore: 15,
    icon: Shield,
    description: "Downside protection and market volatility factors",
  },
];

export function ScoreBreakdown({ totalScore, categories = defaultCategories }: ScoreBreakdownProps) {
  const getScoreColor = (score: number, maxScore: number) => {
    const pct = (score / maxScore) * 100;
    if (pct >= 80) return "text-emerald-600";
    if (pct >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number, maxScore: number) => {
    const pct = (score / maxScore) * 100;
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Score Breakdown
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{totalScore}</span>
          <span className="text-muted-foreground">/100</span>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const pct = (category.score / category.maxScore) * 100;
          
          return (
            <div key={category.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-small font-medium text-foreground">
                    {category.name}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground/50" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-small">{category.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className={cn("text-small font-medium", getScoreColor(category.score, category.maxScore))}>
                  {category.score}/{category.maxScore}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", getProgressColor(category.score, category.maxScore))}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border-subtle">
        <div className="flex items-center justify-between text-small">
          <span className="text-muted-foreground">Data Confidence</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-4 rounded-sm",
                    i <= 4 ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <span className="font-medium text-foreground">High</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
