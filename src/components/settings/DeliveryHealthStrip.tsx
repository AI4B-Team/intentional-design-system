import * as React from "react";
import { cn } from "@/lib/utils";
import type { FamilyEvent } from "@/hooks/useAppFamily";

type Stat = { label: string; value: string; tone?: "default" | "good" | "warn" | "bad" };

const toneClass: Record<NonNullable<Stat["tone"]>, string> = {
  default: "text-foreground",
  good: "text-primary",
  warn: "text-amber-500",
  bad: "text-destructive",
};

/** 24-hour delivery health computed from the loaded event window. */
export function DeliveryHealthStrip({ events }: { events: FamilyEvent[] }) {
  const stats = React.useMemo<Stat[]>(() => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const recent = events.filter((e) => new Date(e.created_at).getTime() >= since);
    const inbound = recent.filter((e) => e.direction === "inbound").length;
    const outbound = recent.filter((e) => e.direction === "outbound");
    const withTargets = outbound.filter((e) => (e.delivery?.length ?? 0) > 0);
    const failing = withTargets.filter((e) =>
      (e.delivery ?? []).some((d) => !(d.status >= 200 && d.status < 300)),
    ).length;
    const dead = recent.filter((e) => !!e.dead_lettered_at).length;
    const rate = withTargets.length
      ? Math.round(((withTargets.length - failing) / withTargets.length) * 100)
      : null;

    return [
      { label: "Events (24h)", value: String(recent.length) },
      { label: "Inbound", value: String(inbound) },
      { label: "Outbound", value: String(outbound.length) },
      {
        label: "Delivery Rate",
        value: rate === null ? "—" : `${rate}%`,
        tone: rate === null ? "default" : rate >= 95 ? "good" : rate >= 80 ? "warn" : "bad",
      },
      { label: "Failing", value: String(failing), tone: failing > 0 ? "bad" : "default" },
      { label: "Gave Up", value: String(dead), tone: dead > 0 ? "bad" : "default" },
    ];
  }, [events]);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border bg-muted/30 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
          <p className={cn("text-lg font-semibold tabular-nums", toneClass[s.tone ?? "default"])}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
