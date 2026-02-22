import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Phone,
  MessageSquare,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
  Users,
  Zap,
} from "lucide-react";

interface DialerStatsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DialerStatsDrawer({ open, onOpenChange }: DialerStatsDrawerProps) {
  const stats = {
    today: [
      { label: "Calls Made", value: "12", icon: Phone, color: "text-primary", bgColor: "bg-primary/10" },
      { label: "Contacts Reached", value: "3", icon: Users, color: "text-emerald-600", bgColor: "bg-emerald-500/10" },
      { label: "Connect Rate", value: "25%", icon: MessageSquare, color: "text-blue-600", bgColor: "bg-blue-500/10" },
      { label: "Total Talk Time", value: "38:24", icon: Clock, color: "text-violet-600", bgColor: "bg-violet-500/10" },
      { label: "Avg Talk Time", value: "3:12", icon: Clock, color: "text-amber-600", bgColor: "bg-amber-500/10" },
      { label: "Appointments Set", value: "1", icon: Calendar, color: "text-emerald-600", bgColor: "bg-emerald-500/10" },
      { label: "Deals Advanced", value: "2", icon: TrendingUp, color: "text-primary", bgColor: "bg-primary/10" },
      { label: "Calls/Hour", value: "8.5", icon: Zap, color: "text-amber-600", bgColor: "bg-amber-500/10" },
    ],
    goals: [
      { label: "Calls", current: 12, target: 50 },
      { label: "Connections", current: 3, target: 15 },
      { label: "Appointments", current: 1, target: 5 },
      { label: "Offers", current: 0, target: 3 },
    ],
  };

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
              {stats.today.map((stat) => (
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
              {stats.goals.map((goal) => {
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
                          pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-primary" : "bg-amber-500"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best Performing */}
          <div>
            <h3 className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mb-3">Insights</h3>
            <div className="space-y-2">
              {[
                { emoji: "🕐", text: "Peak connection window: 10 AM–12 PM (42% connect rate)" },
                { emoji: "📞", text: "Follow-up calls convert 3.2x better than cold calls" },
                { emoji: "⏱️", text: "Calls over 3 min have 68% higher appointment rate" },
              ].map((insight, i) => (
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
