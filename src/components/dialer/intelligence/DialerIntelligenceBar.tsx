import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Phone, MessageSquare, Clock, TrendingUp, ChevronDown, BarChart3 } from "lucide-react";
import { DialerStatsDrawer } from "./DialerStatsDrawer";

interface DialerIntelligenceBarProps {
  callsToday?: number;
  connectRate?: number;
  avgTalkTime?: number; // seconds
  dealsAdvanced?: number;
}

export function DialerIntelligenceBar({
  callsToday = 12,
  connectRate = 25,
  avgTalkTime = 192,
  dealsAdvanced = 2,
}: DialerIntelligenceBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const stats = [
    { icon: Phone, label: "Calls", value: callsToday.toString(), color: "text-primary" },
    { icon: MessageSquare, label: "Connect", value: `${connectRate}%`, color: "text-emerald-600" },
    { icon: Clock, label: "Avg Talk", value: formatTime(avgTalkTime), color: "text-violet-500" },
    { icon: TrendingUp, label: "Deals", value: dealsAdvanced.toString(), color: "text-amber-500" },
  ];

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 rounded-lg border transition-all group",
          "bg-muted/30 border-border hover:border-primary/30 hover:bg-muted/50"
        )}
      >
        <div className="flex items-center gap-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5">
              <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span className="text-sm font-bold text-foreground tabular-nums">{stat.value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium">Stats</span>
        </div>
      </button>

      <DialerStatsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
