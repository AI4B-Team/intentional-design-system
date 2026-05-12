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
  BellRing,
  HeartCrack,
  PiggyBank,
  Wrench,
  PackageOpen,
  ShieldAlert,
  Activity,
  BarChart3,
  LineChart as LineIcon,
  AreaChart as AreaIcon,
  Bot,
  User as UserIcon,
  Megaphone,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MoveToPipelineModal, PipelineCandidate } from "@/components/leadforge/MoveToPipelineModal";
import { AcquisitionLeadCard, AcquisitionLead } from "@/components/leadforge/AcquisitionLeadCard";
import { AIOpportunityFeed } from "@/components/leadforge/AIOpportunityFeed";
import { AIStatusBar } from "@/components/leadforge/AIStatusBar";
import { LiveSignalStream } from "@/components/leadforge/LiveSignalStream";
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
  { label: "Distress Signals", count: 38, sub: "New Since Yesterday", accent: "text-rose-500" },
  { label: "Contact Ready", count: 2871, sub: "Phone Verified · Skip-Traced", accent: "text-primary" },
  { label: "Opportunity Score", count: 5104, sub: "High-Equity Owners", accent: "text-amber-500" },
  { label: "Likely Sellers", count: 3219, sub: "Absentee · Off-Market", accent: "text-violet-500" },
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
  { key: "demolition", label: "Demolition Order", count: 94, icon: Hammer, color: "hsl(15 85% 45%)" },
  { key: "fire", label: "Fire Damage", count: 76, icon: FireIcon, color: "hsl(8 88% 50%)" },
  { key: "arrests", label: "Arrests / Criminal", count: 118, icon: BellRing, color: "hsl(220 70% 50%)" },
  { key: "bankruptcy", label: "Bankruptcy", count: 203, icon: PiggyBank, color: "hsl(280 65% 50%)" },
  { key: "inheritance", label: "Inheritance / Heir", count: 156, icon: HeartCrack, color: "hsl(340 70% 55%)" },
  { key: "evictions", label: "Evictions", count: 312, icon: PackageOpen, color: "hsl(45 90% 48%)" },
  { key: "permitsRepair", label: "Open Permits / Repairs", count: 245, icon: Wrench, color: "hsl(30 80% 50%)" },
] as const;

type LeadKey = typeof DISTRESS_TYPES[number]["key"];

const TICKER = [
  "Phone-Ready Lead Pushed To Call Queue · 1m ago",
  "Mail Candidate Passed Confidence Gate (Owner 91%) · 1m ago",
  "New Foreclosure Signal Linked To Existing Property · 2m ago",
  "Probate Lead Captured In Dallas County · 18s ago",
  "NOST Sale Date Moved To 11 Days — Flagged Urgent · 42s ago",
];

const TOP_LEADS: AcquisitionLead[] = [
  {
    id: "7216 Redwood Blvd",
    addr: "7216 Redwood Blvd",
    city: "Tyler, TX 75214",
    owner: "Andrew Sanchez",
    score: 88,
    confidence: 92,
    badges: ["Vacant", "Probate", "Tax Delinquent"],
    summary: "Likely inherited property with deferred maintenance and absentee owner — high motivation signal.",
    campaign: "AI SMS Sequence Active",
    nextAction: { icon: "sms", label: "SMS first · then call after 5pm" },
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop",
  },
  {
    id: "119 Walnut Blvd",
    addr: "119 Walnut Blvd",
    city: "Garland, TX 75210",
    owner: "Justin Reed",
    score: 85,
    confidence: 88,
    badges: ["Pre-Foreclosure", "High Equity"],
    summary: "Notice of default filed 18 days ago. Owner has 62% equity — strong save-the-deal candidate.",
    campaign: "Voice Agent + Mail",
    nextAction: { icon: "phone", label: "Call within 24h" },
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
  },
  {
    id: "9309 Peachtree Rd",
    addr: "9309 Peachtree Rd",
    city: "Flower Mound, TX 75212",
    owner: "Larry Owens",
    score: 82,
    confidence: 84,
    badges: ["Code Violation", "Absentee", "Vacant"],
    summary: "Out-of-state owner with active code violations. Property unoccupied for 8+ months.",
    campaign: "Direct Mail Cadence",
    nextAction: { icon: "mail", label: "Mail postcard · follow with SMS" },
    image: "https://images.unsplash.com/photo-1597047084897-51e81819a499?w=400&h=300&fit=crop",
  },
  {
    id: "3155 Maple Ave",
    addr: "3155 Maple Ave",
    city: "Fort Worth, TX 75243",
    owner: "Eric Thomas",
    score: 78,
    confidence: 81,
    badges: ["Tired Landlord", "Eviction Filed"],
    summary: "Recent eviction, third in two years. Pattern matches landlords ready to exit portfolio.",
    campaign: "AI SMS · Hybrid",
    nextAction: { icon: "sms", label: "Empathy script · landlord exit" },
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
  },
];

const ACTIVITY: { text: string; time: string; type: "ai" | "human" | "campaign" | "lead" | "comms" }[] = [
  { text: "AI agent qualified seller in 47s — pushed to Sarah M.", time: "1m ago", type: "ai" },
  { text: "Sarah M. left voicemail on probate lead", time: "8m ago", type: "human" },
  { text: "12 Leads Exported To CRM Pipeline", time: "12m ago", type: "lead" },
  { text: "Mail batch of 48 candidates queued for tomorrow", time: "21m ago", type: "campaign" },
  { text: "Inbound SMS reply from high-equity owner", time: "34m ago", type: "comms" },
  { text: "Skip Trace Cycle Complete · 132 Enriched", time: "1h ago", type: "lead" },
  { text: "AI Voice Agent completed 14 outbound calls", time: "1h ago", type: "ai" },
  { text: "Nightly Scrape Complete · 1,402 New Prospects", time: "2h ago", type: "lead" },
];

const ACTIVITY_FILTERS = [
  { key: "all", label: "All", icon: Activity },
  { key: "ai", label: "AI", icon: Bot },
  { key: "human", label: "Human", icon: UserIcon },
  { key: "campaign", label: "Campaigns", icon: Megaphone },
  { key: "lead", label: "Leads", icon: Sparkles },
  { key: "comms", label: "Comms", icon: Radio },
] as const;
type ActivityFilter = typeof ACTIVITY_FILTERS[number]["key"];

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
  const [activityFilter, setActivityFilter] = React.useState<ActivityFilter>("all");

  const filteredActivity = activityFilter === "all" ? ACTIVITY : ACTIVITY.filter((a) => a.type === activityFilter);

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
    <div className="space-y-6 pt-2">
      {/* Hero */}
      <Card className="border-border overflow-hidden bg-card">
        <div className="px-6 pt-4 pb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2 border border-primary/20">
              <Sparkles className="h-3 w-3" />
              Lead Trace
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              <span className="text-emerald-600 tabular-nums">38</span> New Opportunities Today
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              AI scored 1,402 properties across 13 county feeds in the last 2 hours. Engine running autonomously.
            </p>
          </div>
          <Button className="gap-2 shadow-[0_4px_18px_-6px_hsl(var(--primary)/0.5)]">
            <Flame className="h-4 w-4" /> Review Opportunities
          </Button>
        </div>
        <div className="border-t border-border p-4">
          <AIStatusBar />
        </div>
      </Card>


      {/* Utility tiles */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {UTILITY_TILES.map((t) => (
          <Card key={t.label} className="p-4 hover:border-primary/30 transition-colors">
            <p className={cn("text-[10px] uppercase tracking-wider font-bold", t.accent)}>
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
              <h3 className="font-semibold text-foreground">Lead Trace: 30-Day Distress Signals</h3>
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
          <div className="h-[540px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={TREND_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={40} />
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
                <LineChart data={TREND_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={40} />
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
                <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={40} />
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
        <Card className="p-5 flex flex-col h-full min-h-0">
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
          <div className="space-y-1 overflow-y-auto pr-1 flex-1 min-h-0" style={{ scrollbarGutter: "stable" }}>
            {DISTRESS_TYPES.map((d) => {
              const Icon = d.icon;
              const active = selected.has(d.key);
              return (
                <button
                  key={d.label}
                  onClick={() => toggleType(d.key)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors text-left",
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
          {/* Footer summary fills remaining vertical space */}
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted/40 px-2.5 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">New Today</div>
              <div className="text-base font-bold tabular-nums text-foreground mt-0.5">+38</div>
            </div>
            <div className="rounded-md bg-muted/40 px-2.5 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Hot Signals</div>
              <div className="text-base font-bold tabular-nums text-rose-600 mt-0.5">38</div>
            </div>
            <div className="rounded-md bg-muted/40 px-2.5 py-2 col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Top Mover</span>
                <span className="text-[10px] font-semibold text-emerald-600">+34%</span>
              </div>
              <div className="text-sm font-semibold text-foreground mt-0.5">Tax Delinquency</div>
            </div>
          </div>
        </Card>
      </div>



      {/* Top Acquisition Opportunities — full row */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-500" /> Top Acquisition Opportunities
          </h3>
          <span className="text-[11px] text-muted-foreground">AI-Ranked · Confidence Weighted</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TOP_LEADS.map((l) => (
            <AcquisitionLeadCard
              key={l.id}
              lead={l}
              graduated={graduated.has(l.id)}
              onPipeline={() =>
                setPipelineTarget({
                  id: l.id,
                  address: l.addr,
                  city: l.city,
                  score: l.score,
                  signals: l.badges,
                })
              }
            />
          ))}
        </div>
      </Card>

      {/* AI Opportunity Feed + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIOpportunityFeed />

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Recent Activity
            </h3>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {ACTIVITY_FILTERS.map((f) => {
              const Icon = f.icon;
              const active = activityFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActivityFilter(f.key)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors border",
                    active
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted/40 text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {f.label}
                </button>
              );
            })}
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1" style={{ scrollbarGutter: "stable" }}>
            {filteredActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No activity in this category yet.</p>
            ) : (
              filteredActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                      a.type === "ai" && "bg-violet-500",
                      a.type === "human" && "bg-cyan-500",
                      a.type === "campaign" && "bg-amber-500",
                      a.type === "lead" && "bg-primary",
                      a.type === "comms" && "bg-emerald-500"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground leading-snug">{a.text}</p>
                    <p className="text-[11px] text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))
            )}
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
