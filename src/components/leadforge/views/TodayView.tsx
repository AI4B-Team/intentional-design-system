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
  Hammer,
  Flame as FireIcon,
  Handcuffs,
  HeartCrack,
  PiggyBank,
  Wrench,
  PackageOpen,
  ShieldAlert,
  Activity,
  BarChart3,
  LineChart as LineIcon,
  AreaChart as AreaIcon,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MoveToPipelineModal, PipelineCandidate } from "@/components/leadforge/MoveToPipelineModal";
import { InPipelineBadge } from "@/components/leadforge/InPipelineBadge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const UTILITY_TILES = [
  { label: "New Today", count: 38, sub: "Since Yesterday" },
  { label: "Phone-Ready", count: 2871, sub: "Skip-Traced" },
  { label: "With Equity", count: 5104, sub: "Owner-Held" },
  { label: "Absentee", count: 3219, sub: "Off-Market Likely" },
];

const DISTRESS_TYPES = [
  { key: "preForeclosure", label: "Pre-Foreclosure", count: 412, icon: Gavel, color: "hsl(0 72% 51%)" },
  { key: "taxDelinquency", label: "Tax Delinquency", count: 1203, icon: AlertTriangle, color: "hsl(38 92% 50%)" },
  { key: "probate", label: "Probate", count: 287, icon: FileText, color: "hsl(258 70% 58%)" },
  { key: "codeViolation", label: "Code Violation", count: 564, icon: Building2, color: "hsl(24 90% 52%)" },
  { key: "divorce", label: "Divorce", count: 142, icon: Scale, color: "hsl(330 75% 55%)" },
  { key: "vacant", label: "Vacant", count: 891, icon: Home, color: "hsl(199 88% 48%)" },
  { key: "liens", label: "Liens & Judgments", count: 647, icon: Skull, color: "hsl(0 0% 35%)" },
  { key: "expired", label: "Expired Listing", count: 358, icon: TrendingUp, color: "hsl(158 78% 36%)" },
] as const;

type LeadKey = typeof DISTRESS_TYPES[number]["key"];

const TICKER = [
  "Phone-Ready Lead Pushed To Call Queue · 1m ago",
  "Mail Candidate Passed Confidence Gate (Owner 91%) · 1m ago",
  "New Foreclosure Signal Linked To Existing Property · 2m ago",
  "Probate Lead Captured In Dallas County · 18s ago",
  "NOST Sale Date Moved To 11 Days — Flagged Urgent · 42s ago",
];

const TOP_LEADS = [
  { addr: "7216 Redwood Blvd", city: "Tyler, TX 75214", owner: "Andrew Sanchez", score: 82 },
  { addr: "119 Walnut Blvd", city: "Garland, TX 75210", owner: "Justin Reed", score: 82 },
  { addr: "9309 Peachtree Rd", city: "Flower Mound, TX 75212", owner: "Larry Owens", score: 80 },
  { addr: "3155 Maple Ave", city: "Fort Worth, TX 75243", owner: "Eric Thomas", score: 80 },
  { addr: "8605 Maple Ave", city: "Fort Worth, TX 75216", owner: "Gregory Hall", score: 79 },
];

const ACTIVITY = [
  { text: "12 Leads Exported To CRM Pipeline", time: "3m ago" },
  { text: "Mail Batch Of 48 Candidates Queued", time: "11m ago" },
  { text: "Skip Trace Cycle Complete · 132 Enriched", time: "27m ago" },
  { text: "Nightly Scrape Complete · 1,402 New Prospects", time: "2h ago" },
];

// 30-day trend data — per lead type
const TREND_DATA = Array.from({ length: 30 }).map((_, i) => {
  const row: Record<string, number | string> = { day: `D${i + 1}` };
  DISTRESS_TYPES.forEach((t, idx) => {
    const base = Math.max(4, t.count / 60);
    const wave = Math.abs(Math.sin(i * 0.5 + idx)) * base;
    row[t.key] = Math.round(base * 0.6 + wave + (i > 22 ? base * 0.2 : 0));
  });
  return row;
});

type ChartType = "bar" | "line" | "area";

export function TodayView() {
  const [chartType, setChartType] = React.useState<ChartType>("line");
  const [selected, setSelected] = React.useState<Set<LeadKey>>(
    new Set(DISTRESS_TYPES.map((d) => d.key))
  );
  const [graduated, setGraduated] = React.useState<Set<string>>(new Set());
  const [pipelineTarget, setPipelineTarget] = React.useState<PipelineCandidate | null>(null);

  const activeTypes = DISTRESS_TYPES.filter((d) => selected.has(d.key));

  const toggleType = (key: LeadKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };


  return (
    <div className="space-y-6 pt-6">
      {/* Hero */}
      <Card className="border-border overflow-hidden">
        <div className="p-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              <span className="text-primary tabular-nums">38</span> New Prospects Since Yesterday
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Automated Lead Machine Runs Every 2 Hours · Last Run 14 Min Ago · 1,402 Properties Scanned Across 13 County Feeds.
            </p>
          </div>
          <Button className="gap-2">
            <Flame className="h-4 w-4" /> Open Hot Sheet
          </Button>
        </div>
        <div className="border-t border-border bg-muted/20 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Badge className="bg-amber-500 text-white hover:bg-amber-500 shrink-0 rounded-md">JUST IN</Badge>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex gap-8 text-xs text-foreground/80 whitespace-nowrap animate-[scroll_45s_linear_infinite] w-max">
                {[...TICKER, ...TICKER].map((t, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Utility tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {UTILITY_TILES.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {t.label}
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1 text-foreground">
              {t.count.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t.sub}</p>
          </Card>
        ))}
      </div>

      {/* Trend chart + distress list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-foreground">30-Day Distress Signal Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">+18% vs prior period</p>
            </div>
            <div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5">
              {([
                { v: "line", icon: LineIcon, label: "Line" },
                { v: "bar", icon: BarChart3, label: "Bar" },
                { v: "area", icon: AreaIcon, label: "Area" },
              ] as { v: ChartType; icon: React.ElementType; label: string }[]).map((opt) => {
                const Icon = opt.icon;
                const active = chartType === opt.v;
                return (
                  <button
                    key={opt.v}
                    onClick={() => setChartType(opt.v)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded transition-colors",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  {activeTypes.map((t) => (
                    <Bar key={t.key} dataKey={t.key} name={t.label} stackId="a" fill={t.color} />
                  ))}
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  {activeTypes.map((t) => (
                    <Line
                      key={t.key}
                      type="monotone"
                      dataKey={t.key}
                      name={t.label}
                      stroke={t.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              ) : (
                <AreaChart data={TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  {activeTypes.map((t) => (
                    <Area
                      key={t.key}
                      type="monotone"
                      dataKey={t.key}
                      name={t.label}
                      stackId="a"
                      stroke={t.color}
                      fill={t.color}
                      fillOpacity={0.18}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Lead types list */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground">Lead Types</h3>
            <span className="text-[11px] text-muted-foreground">Updated 2 Min Ago</span>
          </div>
          <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-border">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total Leads</span>
            <span className="text-lg font-bold tabular-nums text-foreground">
              {DISTRESS_TYPES.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
            </span>
          </div>
          <div className="space-y-1">
            {DISTRESS_TYPES.map((d) => {
              const Icon = d.icon;
              const active = selected.has(d.key);
              return (
                <button
                  key={d.label}
                  onClick={() => toggleType(d.key)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 py-2 px-2 rounded hover:bg-muted/50 transition-colors text-left",
                    !active && "opacity-40"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "h-4 w-4 rounded-[4px] border shrink-0 flex items-center justify-center transition-colors"
                      )}
                      style={{
                        backgroundColor: active ? d.color : "transparent",
                        borderColor: d.color,
                      }}
                      aria-checked={active}
                      role="checkbox"
                    >
                      {active && (
                        <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.5 6.5L5 9l4.5-5.5" />
                        </svg>
                      )}
                    </span>
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground truncate">{d.label}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground shrink-0">
                    {d.count.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>



      {/* 2-col footer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-500" /> Top Hot Leads
          </h3>
          <div className="space-y-2">
            {TOP_LEADS.map((l) => {
              const isGraduated = graduated.has(l.addr);
              return (
                <div
                  key={l.addr}
                  className={cn(
                    "flex items-center justify-between gap-2 py-2 border-b border-border last:border-0 transition-opacity",
                    isGraduated && "opacity-70"
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{l.addr}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {l.city} · {l.owner}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isGraduated ? (
                      <InPipelineBadge />
                    ) : (
                      <>
                        <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/10 border-0 tabular-nums">
                          {l.score}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 gap-1 text-primary hover:text-primary"
                          onClick={() =>
                            setPipelineTarget({
                              id: l.addr,
                              address: l.addr,
                              city: l.city,
                              score: l.score,
                              signals: ["distress", "absentee"],
                            })
                          }
                        >
                          <Workflow className="h-3.5 w-3.5" />
                          Pipeline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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

      <MoveToPipelineModal
        open={!!pipelineTarget}
        onOpenChange={(o) => !o && setPipelineTarget(null)}
        candidate={pipelineTarget}
        onConfirm={() => {
          if (pipelineTarget)
            setGraduated((g) => new Set(g).add(pipelineTarget.id));
        }}
      />
    </div>
  );
}
