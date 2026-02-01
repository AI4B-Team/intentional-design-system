import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import type { PipelineDeal, PipelineStageConfig } from "./types";

interface StageConfig {
  id: string;
  label: string;
  targetDays: number;
  color: string;
}

interface StallingStatProps {
  deals: PipelineDeal[];
  stages: StageConfig[];
  onFilterStalled: (enabled: boolean) => void;
  isFiltered: boolean;
}

export function StallingStat({
  deals,
  stages,
  onFilterStalled,
  isFiltered,
}: StallingStatProps) {
  // Calculate stalled deals
  const stalledDeals = React.useMemo(() => {
    return deals.filter((d) => {
      const daysSinceActivity = differenceInDays(
        new Date(),
        new Date(d.last_activity)
      );
      const stageConfig = stages.find((s) => s.id === d.stage);
      const isOverdue =
        stageConfig &&
        stageConfig.targetDays > 0 &&
        d.days_in_stage > stageConfig.targetDays;
      return daysSinceActivity >= 5 || isOverdue;
    });
  }, [deals, stages]);

  // Group by stage
  const stalledByStage = React.useMemo(() => {
    const grouped: Record<string, PipelineDeal[]> = {};
    stalledDeals.forEach((deal) => {
      if (!grouped[deal.stage]) {
        grouped[deal.stage] = [];
      }
      grouped[deal.stage].push(deal);
    });
    return grouped;
  }, [stalledDeals]);

  const stuckCount = stalledDeals.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Card
          className={cn(
            "p-4 cursor-pointer transition-all hover:shadow-md",
            stuckCount > 0 && "border-warning/50 bg-warning/5",
            isFiltered && "ring-2 ring-brand ring-offset-1"
          )}
          onClick={() => onFilterStalled(!isFiltered)}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                stuckCount > 0 ? "bg-warning/20" : "bg-muted"
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-5 w-5",
                  stuckCount > 0 ? "text-warning" : "text-muted-foreground"
                )}
              />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary">Stalling</p>
              <p
                className={cn(
                  "text-xl font-bold",
                  stuckCount > 0 && "text-warning"
                )}
              >
                {stuckCount} {stuckCount === 1 ? "deal" : "deals"}
              </p>
            </div>
          </div>
        </Card>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        {stuckCount === 0 ? (
          <p className="text-small text-muted-foreground text-center py-2">
            No stalled deals 🎉
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-small font-semibold mb-2">Stalled by Stage</p>
            {Object.entries(stalledByStage).map(([stageId, stageDeals]) => {
              const stage = stages.find((s) => s.id === stageId);
              return (
                <div
                  key={stageId}
                  className="flex items-center justify-between text-small"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("h-2 w-2 rounded-full", stage?.color)}
                    />
                    <span>{stage?.label || stageId}</span>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {stageDeals.length}
                  </Badge>
                </div>
              );
            })}
            <div className="pt-2 border-t mt-2">
              <button
                onClick={() => onFilterStalled(!isFiltered)}
                className="text-tiny text-brand font-medium hover:underline"
              >
                {isFiltered ? "Clear filter" : "Filter to stalled deals →"}
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function getStalledDeals(
  deals: PipelineDeal[],
  stages: StageConfig[]
): PipelineDeal[] {
  return deals.filter((d) => {
    const daysSinceActivity = differenceInDays(
      new Date(),
      new Date(d.last_activity)
    );
    const stageConfig = stages.find((s) => s.id === d.stage);
    const isOverdue =
      stageConfig &&
      stageConfig.targetDays > 0 &&
      d.days_in_stage > stageConfig.targetDays;
    return daysSinceActivity >= 5 || isOverdue;
  });
}
