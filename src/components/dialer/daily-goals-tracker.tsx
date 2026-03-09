import * as React from "react";
import { cn } from "@/lib/utils";
import { Phone, Users, Calendar, FileText, Target, TrendingUp } from "lucide-react";
import { useCallState, type DailyGoals } from "@/contexts/CallContext";

function GoalBar({ label, current, target, icon: Icon, color }: {
  label: string;
  current: number;
  target: number;
  icon: React.ElementType;
  color: string;
}) {
  const pct = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;
  
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className={cn("h-3.5 w-3.5", color)} />
          <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        </div>
        <span className={cn(
          "text-xs font-bold tabular-nums",
          isComplete ? "text-success" : "text-foreground"
        )}>
          {current}/{target}
        </span>
      </div>
      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isComplete ? "bg-emerald-500" : color.replace("text-", "bg-")
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function DailyGoalsTracker() {
  const { dailyGoals } = useCallState();

  const totalProgress = Math.round(
    ((dailyGoals.callsMade / dailyGoals.callsTarget) +
     (dailyGoals.connectionsMade / dailyGoals.connectionsTarget) +
     (dailyGoals.appointmentsSet / dailyGoals.appointmentsTarget) +
     (dailyGoals.offersSent / dailyGoals.offersTarget)) / 4 * 100
  );

  return (
    <div className="p-4 bg-muted/30 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-semibold text-foreground">Daily Goals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center">
            <span className="text-[9px] font-bold text-primary">{totalProgress}%</span>
          </div>
          <TrendingUp className={cn("h-3.5 w-3.5", totalProgress >= 75 ? "text-emerald-500" : "text-muted-foreground")} />
        </div>
      </div>
      <div className="flex gap-4">
        <GoalBar label="Calls" current={dailyGoals.callsMade} target={dailyGoals.callsTarget} icon={Phone} color="text-blue-500" />
        <GoalBar label="Connects" current={dailyGoals.connectionsMade} target={dailyGoals.connectionsTarget} icon={Users} color="text-violet-500" />
        <GoalBar label="Appts" current={dailyGoals.appointmentsSet} target={dailyGoals.appointmentsTarget} icon={Calendar} color="text-emerald-500" />
        <GoalBar label="Offers" current={dailyGoals.offersSent} target={dailyGoals.offersTarget} icon={FileText} color="text-amber-500" />
      </div>
    </div>
  );
}
