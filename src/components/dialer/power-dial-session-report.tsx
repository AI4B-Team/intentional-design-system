import * as React from "react";
import { cn } from "@/lib/utils";
import { Phone, Users, Calendar, FileText, Clock, TrendingUp, Zap } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";

export function PowerDialSessionReport({ className }: { className?: string }) {
  const { isDialerSessionActive, dialerQueue, dialerQueueIndex, dailyGoals } = useCallState();

  if (!isDialerSessionActive && dialerQueueIndex === 0) return null;

  const completed = dialerQueueIndex;
  const total = dialerQueue.length;
  const connectRate = completed > 0 ? Math.round((dailyGoals.connectionsMade / Math.max(completed, 1)) * 100) : 0;
  const sessionProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={cn("p-4 bg-primary/5 rounded-lg border border-primary/20", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-primary" />
          {isDialerSessionActive ? "Power Dial Session" : "Session Report"}
        </span>
        <span className="text-[11px] font-bold text-primary tabular-nums">
          {completed} of {total}
        </span>
      </div>

      {/* Progress */}
      <div className="h-2 rounded-full bg-border overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${sessionProgress}%` }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 bg-background rounded-md border border-border">
          <Phone className="h-3.5 w-3.5 text-blue-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-foreground tabular-nums">{completed}</div>
          <div className="text-[9px] text-muted-foreground">Dialed</div>
        </div>
        <div className="p-2 bg-background rounded-md border border-border">
          <Users className="h-3.5 w-3.5 text-violet-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-foreground tabular-nums">{dailyGoals.connectionsMade}</div>
          <div className="text-[9px] text-muted-foreground">Connected</div>
        </div>
        <div className="p-2 bg-background rounded-md border border-border">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-foreground tabular-nums">{connectRate}%</div>
          <div className="text-[9px] text-muted-foreground">Connect Rate</div>
        </div>
        <div className="p-2 bg-background rounded-md border border-border">
          <Calendar className="h-3.5 w-3.5 text-amber-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-foreground tabular-nums">{dailyGoals.appointmentsSet}</div>
          <div className="text-[9px] text-muted-foreground">Appts</div>
        </div>
      </div>
    </div>
  );
}
