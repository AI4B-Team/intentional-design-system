import * as React from "react";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

interface GoalContextProps {
  currentCount: number;
  goalCount: number;
  label: string;
}

export function GoalContext({
  currentCount,
  goalCount,
  label,
}: GoalContextProps) {
  const remaining = Math.max(0, goalCount - currentCount);
  const progress = Math.min(100, (currentCount / goalCount) * 100);

  return (
    <div className="flex items-center gap-2 text-tiny">
      <Target className="h-3 w-3 text-brand" />
      <span className="text-muted-foreground">
        {label}: <span className="font-semibold text-foreground">{currentCount}</span>
        <span className="text-muted-foreground/70"> / {goalCount}</span>
      </span>
      {remaining > 0 && (
        <span className="text-muted-foreground">
          ({remaining} to goal)
        </span>
      )}
      {progress >= 100 && (
        <span className="text-success font-medium">✓ Goal met!</span>
      )}
    </div>
  );
}

interface PipelineGoalHeaderProps {
  underContractCount: number;
  underContractGoal: number;
  closedCount: number;
  closedGoal: number;
}

export function PipelineGoalHeader({
  underContractCount,
  underContractGoal,
  closedCount,
  closedGoal,
}: PipelineGoalHeaderProps) {
  return (
    <div className="flex items-center gap-6 text-tiny text-muted-foreground">
      <GoalContext
        currentCount={underContractCount}
        goalCount={underContractGoal}
        label="Under Contract"
      />
      <GoalContext
        currentCount={closedCount}
        goalCount={closedGoal}
        label="Closed"
      />
    </div>
  );
}
