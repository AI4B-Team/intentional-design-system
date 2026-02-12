import * as React from "react";
import { cn } from "@/lib/utils";
import { Phone, Users, Calendar, FileText, DollarSign, TrendingUp } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";

interface CampaignStats {
  totalCalls: number;
  appointments: number;
  underContract: number;
}

interface RevenueStripProps {
  campaignStats?: CampaignStats;
  monthlyTarget?: number;
  monthlyCompleted?: number;
  className?: string;
}

export function RevenueStrip({
  campaignStats = { totalCalls: 86, appointments: 12, underContract: 2 },
  monthlyTarget = 240000,
  monthlyCompleted = 76800,
  className,
}: RevenueStripProps) {
  const { dailyGoals } = useCallState();
  const monthlyPct = Math.round((monthlyCompleted / monthlyTarget) * 100);

  return (
    <div className={cn("p-3.5 bg-muted/30 rounded-lg border border-border", className)}>
      <div className="flex items-center justify-between gap-6">
        {/* Today */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-blue-500" />
              <span className="font-bold text-foreground tabular-nums">{dailyGoals.callsMade}</span>
              <span className="text-muted-foreground">Calls</span>
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-violet-500" />
              <span className="font-bold text-foreground tabular-nums">{dailyGoals.connectionsMade}</span>
              <span className="text-muted-foreground">Contacts</span>
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-emerald-500" />
              <span className="font-bold text-foreground tabular-nums">{dailyGoals.appointmentsSet}</span>
              <span className="text-muted-foreground">Appt</span>
            </span>
          </div>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Campaign */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Campaign</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-blue-500" />
              <span className="font-bold text-foreground tabular-nums">{campaignStats.totalCalls}</span>
              <span className="text-muted-foreground">Calls</span>
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-emerald-500" />
              <span className="font-bold text-foreground tabular-nums">{campaignStats.appointments}</span>
              <span className="text-muted-foreground">Appts</span>
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-amber-500" />
              <span className="font-bold text-foreground tabular-nums">{campaignStats.underContract}</span>
              <span className="text-muted-foreground">Under Contract</span>
            </span>
          </div>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Monthly Revenue */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Monthly</span>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3 text-emerald-500" />
            <span className="text-xs font-bold text-foreground tabular-nums">
              ${(monthlyTarget / 1000).toFixed(0)}k
            </span>
            <div className="w-20 h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(monthlyPct, 100)}%` }}
              />
            </div>
            <span className={cn(
              "text-[11px] font-bold tabular-nums",
              monthlyPct >= 75 ? "text-emerald-600" : monthlyPct >= 50 ? "text-amber-500" : "text-muted-foreground"
            )}>
              {monthlyPct}%
            </span>
            {monthlyPct >= 50 && <TrendingUp className="h-3 w-3 text-emerald-500" />}
          </div>
        </div>
      </div>
    </div>
  );
}
