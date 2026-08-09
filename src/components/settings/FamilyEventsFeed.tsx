import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hubEventLabel } from "@/lib/hubEvents";
import { DeliveryHealthStrip } from "@/components/settings/DeliveryHealthStrip";

import { toast } from "@/hooks/use-toast";
import {
  useFamilyEvents,
  useRetryFamilyEvent,
  useCleanupFamilyEvents,
  useSweepFamilyEvents,

  type FamilyEvent,
} from "@/hooks/useAppFamily";
import { Activity, AlertTriangle, ArrowDownLeft, ArrowUpRight, ChevronDown, Copy, Download, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const INGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hub-events-ingest`;

type Filter = "all" | "inbound" | "outbound" | "dead-letter";

function DeliveryBadges({ delivery }: { delivery: FamilyEvent["delivery"] }) {
  if (!delivery?.length) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {delivery.map((d, i) => {
        const ok = d.status >= 200 && d.status < 300;
        return (
          <Badge
            key={`${d.target}-${i}`}
            variant="outline"
            className={cn(
              "text-[10px] tabular-nums",
              ok ? "border-primary/40 text-primary" : "border-destructive/40 text-destructive",
            )}
          >
            {d.target.replace(/^https?:\/\//, "").slice(0, 28)} · {d.status || "failed"}
          </Badge>
        );
      })}
    </div>
  );
}

export function FamilyEventsFeed() {
  const { data: events = [] } = useFamilyEvents(100);
  const retry = useRetryFamilyEvent();
  const cleanup = useCleanupFamilyEvents();
  const sweep = useSweepFamilyEvents();

  const [retrying, setRetrying] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [type, setType] = React.useState("all");
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const handleRetry = async (id: string) => {
    setRetrying(id);
    try {
      const delivered = await retry.mutateAsync(id);
      const ok = delivered.filter((d) => d.status >= 200 && d.status < 300).length;
      toast({
        title: ok > 0 ? "Redelivered" : "Retry Failed",
        description: `${ok}/${delivered.length} targets accepted the event.`,
        variant: ok > 0 ? undefined : "destructive",
      });
    } catch (e: unknown) {
      toast({
        title: "Retry Failed",
        description: e instanceof Error ? e.message : "Could not redeliver event.",
        variant: "destructive",
      });
    } finally {
      setRetrying(null);
    }
  };

  const types = React.useMemo(
    () => Array.from(new Set(events.map((e) => e.event_type))).sort(),
    [events],
  );

  const deadCount = events.filter((e) => !!e.dead_lettered_at).length;

  const filtered = events.filter((e) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "dead-letter"
          ? !!e.dead_lettered_at
          : e.direction === filter;
    return matchesFilter && (type === "all" || e.event_type === type);
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Family Activity
          </CardTitle>
          <CardDescription>
            Live feed of every event exchanged with satellite apps — inbound events they send here
            and outbound events the hub fans out, with delivery status.
          </CardDescription>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!filtered.length) {
                toast({ title: "Nothing To Export", description: "No events match the current filters." });
                return;
              }
              const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
              const rows = [
                ["created_at", "direction", "app_slug", "event_type", "dead_lettered_at", "retry_attempts", "delivery", "payload"],
                ...filtered.map((e) => [
                  e.created_at,
                  e.direction,
                  e.app_slug,
                  e.event_type,
                  e.dead_lettered_at ?? "",
                  e.retry_attempts ?? 0,
                  (e.delivery ?? []).map((d) => `${d.target}:${d.status}`).join(" | "),
                  JSON.stringify(e.payload),
                ]),
              ]
                .map((r) => r.map(esc).join(","))
                .join("\n");
              const url = URL.createObjectURL(new Blob([rows], { type: "text/csv;charset=utf-8" }));
              const a = document.createElement("a");
              a.href = url;
              a.download = `family-activity-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast({ title: "Activity Exported", description: `${filtered.length} event(s) written to CSV.` });
            }}
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={sweep.isPending}
            onClick={() => {
              sweep.mutate(undefined, {
                onSuccess: (r) =>
                  toast({
                    title: r.retried > 0 ? "Redelivery Sweep Complete" : "Nothing To Retry",
                    description:
                      r.retried > 0
                        ? `${r.retried} event(s) retried, ${r.still_failing} still failing${r.dead_lettered ? `, ${r.dead_lettered} moved to dead-letter` : ""}.`
                        : "No failed outbound events in the last 24 hours.",
                    variant: r.still_failing > 0 ? "destructive" : undefined,
                  }),
                onError: (e) =>
                  toast({
                    title: "Sweep Failed",
                    description: e instanceof Error ? e.message : "Unexpected error",
                    variant: "destructive",
                  }),
              });
            }}
          >
            <RefreshCw
              className={cn("mr-2 h-3.5 w-3.5", sweep.isPending && "animate-spin")}
            />
            Retry All Failed
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={cleanup.isPending}
            onClick={() => {
              cleanup.mutate(30, {
                onSuccess: (r) =>
                  toast({
                    title: "Activity Cleaned Up",
                    description: `${r.deleted} event(s) older than ${r.days} days removed.`,
                  }),
                onError: (e) =>
                  toast({
                    title: "Cleanup Failed",
                    description: e instanceof Error ? e.message : "Unexpected error",
                    variant: "destructive",
                  }),
              });
            }}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Clear Events Older Than 30 Days
          </Button>
        </div>

      </CardHeader>

      <CardContent className="space-y-3">
        <DeliveryHealthStrip events={events} />
        <div className="flex flex-wrap items-center gap-2">

          {(["all", "inbound", "outbound", "dead-letter"] as Filter[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === "dead-letter" ? `Dead-Letter${deadCount ? ` (${deadCount})` : ""}` : f}
            </Button>
          ))}
          <select
            className="ml-auto h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">All Event Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {hubEventLabel(t)} ({t})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">{INGEST_URL}</code>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(INGEST_URL);
              toast({ title: "Endpoint Copied" });
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>

        {filtered.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No events yet. Satellite apps POST signed events to the endpoint above.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((e) => {
              const inbound = e.direction === "inbound";
              const open = expanded === e.id;
              return (
                <div key={e.id} className="py-2">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 text-left"
                    onClick={() => setExpanded(open ? null : e.id)}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {inbound ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <Badge variant="outline">{e.app_slug}</Badge>
                        <span className="font-mono text-sm text-foreground">{e.event_type}</span>
                        {e.dead_lettered_at && (
                          <Badge variant="outline" className="border-destructive/40 text-destructive">
                            <AlertTriangle className="mr-1 h-3 w-3" /> Gave Up
                          </Badge>
                        )}
                      </div>
                      {!open && (
                        <p className="truncate text-xs text-muted-foreground">
                          {JSON.stringify(e.payload)}
                        </p>
                      )}
                      {!inbound && <DeliveryBadges delivery={e.delivery} />}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {new Date(e.created_at).toLocaleString()}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-muted-foreground transition-transform",
                          open && "rotate-180",
                        )}
                      />
                    </div>
                  </button>
                  {!inbound && (e.delivery ?? []).some((d) => !(d.status >= 200 && d.status < 300)) && (
                    <div className="mt-1 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={retrying === e.id}
                        onClick={() => handleRetry(e.id)}
                      >
                        <RefreshCw
                          className={cn("mr-2 h-3.5 w-3.5", retrying === e.id && "animate-spin")}
                        />
                        Retry Delivery
                      </Button>
                    </div>
                  )}
                  {open && (
                    <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-muted p-3 text-xs">
                      {JSON.stringify(e.payload, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FamilyEventsFeed;
