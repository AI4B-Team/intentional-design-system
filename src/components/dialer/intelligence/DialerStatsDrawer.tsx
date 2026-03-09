import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BarChart3 } from "lucide-react";
import { todayStats, goalStats, insights } from "./dialer-stats-config";

interface DialerStatsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DialerStatsDrawer({ open, onOpenChange }: DialerStatsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[440px] overflow-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Dialer Stats
          </SheetTitle>
        </SheetHeader>

        <div className="py-5 space-y-6">
          {/* Today's Numbers */}
          <div>
            <h3 className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mb-3">Today's Performance</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {todayStats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5 p-3 rounded-lg border border-border/50 bg-muted/20">
                  <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", stat.bgColor)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                    <div className="text-lg font-bold text-foreground tabular-nums">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Progress */}
          <div>
            <h3 className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mb-3">Daily Goals</h3>
            <div className="space-y-3">
              {goalStats.map((goal) => {
                const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                return (
                  <div key={goal.label}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-foreground">{goal.label}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {goal.current} / {goal.target}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          pct >= 100 ? "bg-success" : pct >= 50 ? "bg-primary" : "bg-warning"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div>
            <h3 className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mb-3">Insights</h3>
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-muted/30 rounded-md">
                  <span className="text-sm">{insight.emoji}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{insight.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
