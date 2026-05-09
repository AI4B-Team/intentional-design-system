import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Flame,
  TrendingUp,
  AlertTriangle,
  FileText,
  Home,
  Building2,
  Skull,
  Scale,
  Gavel,
  ArrowUpRight,
  Activity,
  Plug,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_TILES = [
  { tier: "A", label: "Tier A", count: 364, sub: "Hot · Multi-Signal", accent: "border-t-red-500", text: "text-red-600" },
  { tier: "B", label: "Tier B", count: 1284, sub: "Warm · Strong Signal", accent: "border-t-amber-500", text: "text-amber-600" },
  { tier: "C", label: "Tier C", count: 4912, sub: "Watching", accent: "border-t-sky-500", text: "text-sky-600" },
  { tier: "D", label: "Tier D", count: 8801, sub: "Background", accent: "border-t-slate-400", text: "text-slate-500" },
];

const UTILITY_TILES = [
  { label: "With Equity", count: 5104, sub: "Owner-Held", accent: "border-t-emerald-500", text: "text-emerald-600" },
  { label: "Absentee", count: 3219, sub: "Off-Market Likely", accent: "border-t-violet-500", text: "text-violet-600" },
  { label: "Phone-Ready", count: 2871, sub: "Skip-Traced", accent: "border-t-cyan-500", text: "text-cyan-600" },
];

const DISTRESS_TYPES = [
  { label: "Pre-Foreclosure", count: 412, icon: Gavel },
  { label: "Tax Delinquency", count: 1203, icon: AlertTriangle },
  { label: "Probate", count: 287, icon: FileText },
  { label: "Code Violation", count: 564, icon: Building2 },
  { label: "Divorce", count: 142, icon: Scale },
  { label: "Vacant", count: 891, icon: Home },
  { label: "Liens & Judgments", count: 647, icon: Skull },
  { label: "Expired Listing", count: 358, icon: TrendingUp },
];

const TICKER = [
  "Phone-ready lead pushed to call queue. · 1m ago",
  "Mail candidate passed confidence gate (owner 91%). · 1m ago",
  "New foreclosure signal linked to existing property. · 2m ago",
  "Probate lead captured in Dallas County (Tier B). · 18s ago",
  "NOST sale date moved to 11 days — flagged urgent. · 42s ago",
];

const TOP_LEADS = [
  { addr: "7216 Redwood Blvd", city: "Tyler, TX 75214", owner: "Andrew Sanchez", tier: "A", score: 82 },
  { addr: "119 Walnut Blvd", city: "Garland, TX 75210", owner: "Justin undefined", tier: "A", score: 82 },
  { addr: "9309 Peachtree Rd", city: "Flower Mound, TX 75212", owner: "Larry undefined", tier: "A", score: 80 },
  { addr: "3155 Maple Ave", city: "Fort Worth, TX 75243", owner: "Eric Thomas", tier: "A", score: 80 },
  { addr: "8605 Maple Ave", city: "Fort Worth, TX 75216", owner: "Gregory undefined", tier: "A", score: 79 },
];

const INTEGRATIONS = [
  { name: "GoHighLevel CRM", status: "Connected" },
  { name: "Twilio · Voice", status: "Connected" },
  { name: "Lob · Direct Mail", status: "Connected" },
  { name: "Tracerfy Skip Trace", status: "Connected" },
];

const ACTIVITY = [
  { text: "12 leads exported to GHL pipeline", time: "3m ago" },
  { text: "Mail batch of 48 candidates queued", time: "11m ago" },
  { text: "Skip trace cycle complete · 132 enriched", time: "27m ago" },
  { text: "Nightly scrape complete · 1,402 new prospects", time: "2h ago" },
];

export function TodayView() {
  return (
    <div className="space-y-6 pt-6">
      {/* Hero */}
      <Card className="bg-gradient-to-br from-emerald-50 via-background to-background border-emerald-200/60 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Good Morning, Operator
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              <span className="text-primary tabular-nums">38</span> new Tier A prospects since yesterday
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Distress engine ran 2h ago · 1,402 properties scanned across 13 county feeds.
            </p>
          </div>
          <Button className="gap-2">
            <Flame className="h-4 w-4" /> Open Hot Sheet
          </Button>
        </div>
      </Card>

      {/* Tier + utility tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {TIER_TILES.map((t) => (
          <Card key={t.tier} className={cn("p-4 border-t-4", t.accent)}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t.label}</p>
            <p className={cn("text-2xl font-bold tabular-nums mt-1", t.text)}>{t.count.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t.sub}</p>
          </Card>
        ))}
        {UTILITY_TILES.map((t) => (
          <Card key={t.label} className={cn("p-4 border-t-4", t.accent)}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t.label}</p>
            <p className={cn("text-2xl font-bold tabular-nums mt-1", t.text)}>{t.count.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t.sub}</p>
          </Card>
        ))}
      </div>

      {/* Distress types */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Distress Event Types</h3>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {DISTRESS_TYPES.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.label} className="rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/60 transition-colors cursor-pointer">
                <Icon className="h-4 w-4 text-muted-foreground mb-2" />
                <p className="text-lg font-bold text-foreground tabular-nums">{d.count.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{d.label}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Trend chart placeholder */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">30-Day Distress Signal Trend</h3>
          <Badge variant="outline" className="text-[11px]">+18% vs prior period</Badge>
        </div>
        <div className="h-32 flex items-end gap-1.5">
          {Array.from({ length: 30 }).map((_, i) => {
            const h = 30 + Math.abs(Math.sin(i * 0.7)) * 70 + (i > 20 ? 15 : 0);
            return (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-primary/70 to-primary/30"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      </Card>

      {/* JUST IN ticker */}
      <Card className="p-3 bg-amber-50/60 border-amber-200">
        <div className="flex items-center gap-3 overflow-hidden">
          <Badge className="bg-amber-500 text-white hover:bg-amber-500 shrink-0">JUST IN</Badge>
          <div className="flex gap-8 text-xs text-foreground/80 whitespace-nowrap animate-[scroll_45s_linear_infinite]">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* 3-col footer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-1">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-500" /> Top Tier A Leads
          </h3>
          <div className="space-y-2">
            {TOP_LEADS.map((l) => (
              <div key={l.addr} className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{l.addr}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{l.city} · {l.owner}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/10 border-0 tabular-nums">{l.score}</Badge>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Plug className="h-4 w-4 text-primary" /> Connected Integrations
          </h3>
          <div className="space-y-2.5">
            {INTEGRATIONS.map((i) => (
              <div key={i.name} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{i.name}</span>
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {i.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-foreground leading-snug">{a.text}</p>
                  <p className="text-[11px] text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
