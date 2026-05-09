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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function HarvestOverview() {
  const { stats, signals, trend, integrations, feed } = useHarvestStats();
  const [showTrend, setShowTrend] = React.useState(true);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <PageLayout>
      <HarvestSubNav />

      {/* A — Greeting bar */}
      <p className="text-sm text-muted-foreground mb-2">
        Good morning · {dateLabel} —{" "}
        <span className="text-foreground font-medium">
          {stats.newSinceLastSession} new motivated sellers since yesterday
        </span>
      </p>

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
        <button
          type="button"
          onClick={() => setShowTrend((v) => !v)}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <div>
            <div className="text-sm font-medium">Signal Trend — 30 Days</div>
            <div className="text-xs text-muted-foreground">
              Daily signal events across primary sources
            </div>
          </div>
          {showTrend ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showTrend && (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })
                  }
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="tax_default" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="property_citation" stroke="hsl(var(--muted-foreground))" dot={false} />
                <Line type="monotone" dataKey="notice_of_default" stroke="#ef4444" dot={false} />
                <Line type="monotone" dataKey="estate_filing" stroke="#f59e0b" dot={false} />
              </LineChart>
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
