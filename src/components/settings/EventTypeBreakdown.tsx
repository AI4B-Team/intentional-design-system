import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hubEventLabel } from "@/lib/hubEvents";
import { cn } from "@/lib/utils";
import type { FamilyEvent } from "@/hooks/useAppFamily";

interface Row {
  type: string;
  total: number;
  inbound: number;
  outbound: number;
  failing: number;
  lastAt: string;
}

/** 7-day per-event-type volume and failure breakdown for the App Family feed. */
export function EventTypeBreakdown({ events }: { events: FamilyEvent[] }) {
  const [open, setOpen] = React.useState(false);

  const rows = React.useMemo<Row[]>(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const map = new Map<string, Row>();
    for (const e of events) {
      if (new Date(e.created_at).getTime() < cutoff) continue;
      const row =
        map.get(e.event_type) ??
        { type: e.event_type, total: 0, inbound: 0, outbound: 0, failing: 0, lastAt: e.created_at };
      row.total += 1;
      if (e.direction === "inbound") row.inbound += 1;
      else {
        row.outbound += 1;
        if ((e.delivery ?? []).some((d) => !(d.status >= 200 && d.status < 300))) row.failing += 1;
      }
      if (new Date(e.created_at) > new Date(row.lastAt)) row.lastAt = e.created_at;
      map.set(e.event_type, row);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [events]);

  if (!rows.length) return null;

  const max = rows[0].total;

  return (
    <div className="rounded-lg border border-border">
      <Button
        variant="ghost"
        className="h-auto w-full justify-between px-3 py-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-medium">
          Event Types — Last 7 Days{" "}
          <span className="text-muted-foreground tabular-nums">({rows.length})</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </Button>

      {open && (
        <div className="divide-y divide-border border-t border-border">
          {rows.map((r) => (
            <div key={r.type} className="flex items-center gap-3 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{hubEventLabel(r.type)}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">{r.type}</p>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(4, (r.total / max) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="shrink-0 text-right text-xs tabular-nums">
                <p className="font-medium text-foreground">{r.total} total</p>
                <p className="text-muted-foreground">
                  {r.inbound} in · {r.outbound} out
                </p>
                {r.failing > 0 && (
                  <p className="text-destructive">{r.failing} failing</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventTypeBreakdown;
