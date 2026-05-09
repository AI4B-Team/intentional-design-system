import * as React from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { HarvestSubNav } from "./HarvestSubNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { ScoreBadge } from "@/components/harvest/ScoreBadge";
import { SignalPill } from "@/components/harvest/SignalPill";
import { LiveFeedTicker } from "@/components/harvest/LiveFeedTicker";
import { IntegrationStatusGrid } from "@/components/harvest/IntegrationStatusGrid";
import { useHarvestStats } from "@/hooks/useHarvestStats";
import { useLeadsProperties, useLeadsToday, useLeadsFocus } from "@/hooks/useLeadsData";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { LineChart as LineIcon, BarChart3, AreaChart as AreaIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ChartKind = "line" | "area" | "bar";
const SERIES = [
  { key: "tax_default", label: "Tax Default", color: "hsl(var(--primary))" },
  { key: "property_citation", label: "Citation", color: "hsl(var(--muted-foreground))" },
  { key: "notice_of_default", label: "NOD", color: "#ef4444" },
  { key: "estate_filing", label: "Estate", color: "#f59e0b" },
] as const;

export default function HarvestOverview() {
  const { stats: mockStats, signals, trend, integrations, feed } = useHarvestStats();
  const [showTrend, setShowTrend] = React.useState(true);
  const [chartKind, setChartKind] = React.useState<ChartKind>("line");

  // Phase 3: live data from new leads_* tables (falls back to mock when empty)
  const leadsProperties = useLeadsProperties();
  const leadsToday = useLeadsToday();
  const leadsFocus = useLeadsFocus();

  const isLive =
    leadsProperties.data?.source === "live" ||
    leadsToday.data?.source === "live" ||
    leadsFocus.data?.source === "live";

  const liveProps = leadsProperties.data?.rows ?? [];
  const liveToday = leadsToday.data?.rows ?? [];
  const liveFocus = leadsFocus.data?.rows ?? [];

  const stats = React.useMemo(() => {
    if (!isLive) return mockStats;
    const hot = liveProps.filter((p: any) => (p.leads_scores?.[0]?.score ?? p.opportunityScore ?? 0) >= 80).length;
    const warm = liveProps.filter((p: any) => {
      const s = p.leads_scores?.[0]?.score ?? p.opportunityScore ?? 0;
      return s >= 60 && s < 80;
    }).length;
    const watch = Math.max(0, liveProps.length - hot - warm);
    return {
      ...mockStats,
      totalInSystem: liveProps.length || mockStats.totalInSystem,
      hot: hot || mockStats.hot,
      warm: warm || mockStats.warm,
      watch: watch || mockStats.watch,
      focusListCount: liveFocus.length || mockStats.focusListCount,
      newToday: liveToday.length || mockStats.newToday,
      newSinceLastSession: liveToday.length || mockStats.newSinceLastSession,
    };
  }, [isLive, liveProps, liveToday, liveFocus, mockStats]);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <PageLayout>
      <HarvestSubNav />

      {/* A — Greeting bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm text-muted-foreground">
          Good morning · {dateLabel} —{" "}
          <span className="text-foreground font-medium">
            {stats.newSinceLastSession} new motivated sellers since yesterday
          </span>
        </p>
        <Badge variant={isLive ? "default" : "outline"} className="text-[10px] uppercase tracking-wider">
          {isLive ? "Live" : "Sample Data"}
        </Badge>
      </div>

      {/* B — Primary stat */}
      <Card className="p-5 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            New Leads Since Last Session
          </div>
          <div className="text-5xl font-bold tabular-nums leading-none mt-1">
            {stats.newSinceLastSession}
          </div>
        </div>
        <Button asChild className="gap-2">
          <Link to="/harvest/leads/focus">
            Review Focus List <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Card>

      {/* C — Pipeline counters */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        <Counter label="Total" value={stats.totalInSystem} />
        <Counter label="Hot" value={stats.hot} accent="hot" />
        <Counter label="Warm" value={stats.warm} accent="warm" />
        <Counter label="Watch" value={stats.watch} accent="watch" />
        <Counter label="Skip Traced" value={stats.skipTraced} />
        <Counter label="Mailed / wk" value={stats.mailedThisWeek} />
      </div>

      {/* D — Signal breakdown */}
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          Signal Breakdown
        </div>
        <div className="flex flex-wrap gap-1.5">
          {signals.map((s) => (
            <SignalPill key={s.type} type={s.type} count={s.count} />
          ))}
        </div>
      </div>

      {/* E — Trend chart (collapsible) */}
      <Card className="p-4 mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <button
            type="button"
            onClick={() => setShowTrend((v) => !v)}
            className="flex-1 text-left"
          >
            <div className="text-sm font-medium">Signal Trend — 30 Days</div>
            <div className="text-xs text-muted-foreground">
              Daily signal events across primary sources
            </div>
          </button>
          <div className="flex items-center gap-1">
            {showTrend && (
              <div className="flex rounded-md border border-border bg-card p-0.5">
                {([
                  { k: "line", icon: LineIcon, label: "Line" },
                  { k: "area", icon: AreaIcon, label: "Area" },
                  { k: "bar", icon: BarChart3, label: "Bar" },
                ] as const).map(({ k, icon: Icon, label }) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setChartKind(k)}
                    aria-label={label}
                    title={label}
                    className={cn(
                      "px-2 py-1 rounded-sm transition-colors",
                      chartKind === k
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowTrend((v) => !v)}
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label={showTrend ? "Collapse" : "Expand"}
            >
              {showTrend ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {showTrend && (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              {chartKind === "line" ? (
                <LineChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {SERIES.map((s) => (
                    <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} dot={false} strokeWidth={s.key === "tax_default" ? 2 : 1.5} />
                  ))}
                </LineChart>
              ) : chartKind === "area" ? (
                <AreaChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    {SERIES.map((s) => (
                      <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {SERIES.map((s) => (
                    <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} fill={`url(#grad-${s.key})`} strokeWidth={1.5} />
                  ))}
                </AreaChart>
              ) : (
                <BarChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {SERIES.map((s) => (
                    <Bar key={s.key} dataKey={s.key} name={s.label} stackId="a" fill={s.color} />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* F — Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <QuickStat label="Focus List" value={stats.focusListCount} />
        <QuickStat label="Ready to Call" value={stats.readyToCall} />
        <QuickStat label="Estate Active" value={stats.estateActive} />
        <QuickStat label="New Today" value={stats.newToday} accent />
      </div>

      {/* G — Integrations */}
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          Connected Tools
        </div>
        <IntegrationStatusGrid integrations={integrations} />
      </div>

      {/* H — Live feed */}
      <LiveFeedTicker items={feed} />
    </PageLayout>
  );
}

function Counter({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "hot" | "warm" | "watch";
}) {
  const accentColor =
    accent === "hot"
      ? "text-red-600 dark:text-red-400"
      : accent === "warm"
        ? "text-orange-600 dark:text-orange-400"
        : accent === "watch"
          ? "text-yellow-600 dark:text-yellow-400"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${accentColor}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function QuickStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
}
