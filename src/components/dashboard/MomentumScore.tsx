import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PipelineStageData {
  status: string;
  count: number;
  label: string;
}

interface MomentumScoreProps {
  pipelineStats: PipelineStageData[] | null;
  previousPipelineStats?: PipelineStageData[] | null; // Last week's data for trend
  isLoading?: boolean;
}

// Category weights for momentum calculation
// Discovery = 1x, Intent = 2x, Commitment = 3x, Outcome = 4x
const CATEGORY_WEIGHTS: Record<string, number> = {
  // Discovery (1x)
  new: 1,
  contacted: 1,
  appointment: 1,
  // Intent (2x)
  offer_made: 2,
  negotiating: 2,
  follow_up: 2,
  // Commitment (3x)
  under_contract: 3,
  marketing: 3,
  // Outcome (4x)
  closed: 4,
  sold: 4,
};

function calculateMomentumScore(stats: PipelineStageData[] | null): number {
  if (!stats || stats.length === 0) return 0;
  
  let weightedSum = 0;
  let totalDeals = 0;
  
  stats.forEach((stage) => {
    const weight = CATEGORY_WEIGHTS[stage.status] || 1;
    weightedSum += stage.count * weight;
    totalDeals += stage.count;
  });
  
  // Max possible is if all deals were at highest weight (4x)
  const maxPossibleWeight = totalDeals * 4;
  
  if (maxPossibleWeight === 0) return 0;
  
  // Score is percentage of weighted progress (0-100)
  const rawScore = Math.round((weightedSum / maxPossibleWeight) * 100);
  return Math.min(100, Math.max(0, rawScore));
}

export function MomentumScore({ pipelineStats, previousPipelineStats, isLoading }: MomentumScoreProps) {
  const score = calculateMomentumScore(pipelineStats);
  const previousScore = calculateMomentumScore(previousPipelineStats || null);
  
  // Calculate trend from score comparison
  const trend = React.useMemo(() => {
    if (!previousPipelineStats) return "flat";
    const diff = score - previousScore;
    if (diff >= 5) return "gaining";
    if (diff <= -5) return "slipping";
    return "flat";
  }, [score, previousScore, previousPipelineStats]);

  const TrendIcon = trend === "gaining" ? TrendingUp : trend === "slipping" ? TrendingDown : Minus;
  const trendColor = trend === "gaining" ? "text-success" : trend === "slipping" ? "text-destructive" : "text-muted-foreground";
  const trendLabel = trend === "gaining" ? "Gaining" : trend === "slipping" ? "Slipping" : "Flat";

  // Score color based on value
  const scoreColor = score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive";
  const scoreBg = score >= 70 ? "bg-success/10" : score >= 40 ? "bg-warning/10" : "bg-destructive/10";

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-8 w-16 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-help",
            scoreBg
          )}>
            <Zap className={cn("h-4 w-4", scoreColor)} />
            <span className={cn("text-lg font-bold tabular-nums", scoreColor)}>
              {score}
            </span>
            <span className="text-tiny text-muted-foreground font-medium">/ 100</span>
            <div className={cn("flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded-full", 
              trend === "gaining" ? "bg-success/10" : 
              trend === "slipping" ? "bg-destructive/10" : 
              "bg-muted"
            )}>
              <TrendIcon className={cn("h-3.5 w-3.5", trendColor)} />
              <span className={cn("text-tiny font-medium hidden sm:inline", trendColor)}>
                {trendLabel}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1.5">
            <p className="font-semibold">Momentum Score</p>
            <p className="text-tiny text-muted-foreground">
              Weighted pipeline progress: Discovery (1x), Intent (2x), Commitment (3x), Outcome (4x)
            </p>
            <div className={cn("flex items-center gap-1.5 text-small font-medium", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>{trendLabel} this week</span>
              {previousPipelineStats && (
                <span className="text-muted-foreground">
                  (was {previousScore})
                </span>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
