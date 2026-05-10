import * as React from "react";
import { useScanJobs, useScraperHealth } from "@/hooks/useLeadsData";
import {
  Activity, Radar, Bot, Zap, Clock,
  Search, MessageSquare, Home, Phone, Scale,
  DollarSign, AlertTriangle, MapPin, Flame, Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIM_EVENTS = [
  { icon: Search, text: "AI detected new probate filing — Dallas County", color: "text-cyan-500" },
  { icon: MessageSquare, text: "Seller replied to SMS — auto-routed to acquisitions", color: "text-primary" },
  { icon: Home, text: "Vacant property signal verified via utility shutoff", color: "text-amber-500" },
  { icon: Phone, text: "AI voice agent qualified lead in 47s", color: "text-violet-500" },
  { icon: Scale, text: "Ownership transfer detected — heir flagged motivated", color: "text-blue-500" },
  { icon: DollarSign, text: "High-equity match pushed to Hot Sheet", color: "text-emerald-500" },
  { icon: AlertTriangle, text: "Code violation lead escalated to human rep", color: "text-destructive" },
  { icon: MapPin, text: "13 new tax-delinquent records added to queue", color: "text-rose-500" },
  { icon: Flame, text: "Motivation score crossed 90 — campaign accelerated", color: "text-orange-500" },
  { icon: Mail, text: "Direct mail batch of 124 candidates dispatched", color: "text-sky-500" },
];

function useTickingEvents() {
  const [events, setEvents] = React.useState(() => SIM_EVENTS.slice(0, 4));
  React.useEffect(() => {
    const id = setInterval(() => {
      setEvents((prev) => {
        const next = SIM_EVENTS[Math.floor(Math.random() * SIM_EVENTS.length)];
        return [next, ...prev].slice(0, 6);
      });
    }, 4500);
    return () => clearInterval(id);
  }, []);
  return events;
}

function useNextScanCountdown() {
  const [seconds, setSeconds] = React.useState(18 * 60);
  React.useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s <= 1 ? 120 * 60 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AIStatusBar() {
  const { data: scanJobs } = useScanJobs();
  const { data: health } = useScraperHealth();
  const events = useTickingEvents();
  const nextScan = useNextScanCountdown();

  const activeFeeds = (health?.rows?.length as number | undefined) ?? 13;
  const propertiesScanned = (scanJobs?.length ?? 0) > 0
    ? (scanJobs?.reduce((acc: number, j: any) => acc + (j.properties_scanned ?? 0), 0) ?? 42182)
    : 42182;
  const activeCampaigns = 7;
  const aiAgents = 3;

  const stats = [
    { icon: Radar, label: "Counties Scanning", value: activeFeeds.toLocaleString(), color: "text-cyan-500" },
    { icon: Activity, label: "Properties Scanned", value: propertiesScanned.toLocaleString(), color: "text-primary" },
    { icon: Zap, label: "Active Campaigns", value: activeCampaigns.toString(), color: "text-amber-500" },
    { icon: Bot, label: "AI Agents Running", value: aiAgents.toString(), color: "text-violet-500" },
    { icon: Clock, label: "Next Scan", value: nextScan, color: "text-emerald-500", mono: true },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              type="button"
              className="rounded-lg border border-border bg-card hover:bg-muted/40 hover:border-primary/40 transition-all px-3 py-2.5 flex items-center gap-2.5 min-w-0 text-left"
            >
              <div className={cn("h-7 w-7 rounded-md bg-muted/60 flex items-center justify-center shrink-0", s.color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">
                  {s.label}
                </div>
                <div className={cn("text-sm font-bold text-foreground tabular-nums leading-tight mt-0.5", s.mono && "font-mono")}>
                  {s.value}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="rounded-lg border border-border bg-card px-3 py-2 flex items-start gap-3">
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
            Live
          </span>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-col gap-0.5">
            {events.slice(0, 2).map((e, i) => (
              <div
                key={`${e.text}-${i}`}
                className={cn(
                  "text-xs text-foreground/80 truncate flex items-center gap-2",
                  i === 0 && "animate-fade-in"
                )}
              >
                <span className="shrink-0">{e.icon}</span>
                <span className="truncate">{e.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
