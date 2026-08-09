import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hubEventLabel } from "@/lib/hubEvents";
import { toast } from "@/hooks/use-toast";
import { useFamilyEvents, useRetryFamilyEvent, type FamilyEvent } from "@/hooks/useAppFamily";
import { Activity, ArrowDownLeft, ArrowUpRight, ChevronDown, Copy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const INGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hub-events-ingest`;

type Filter = "all" | "inbound" | "outbound";

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

  const filtered = events.filter(
    (e) =>
      (filter === "all" || e.direction === filter) && (type === "all" || e.event_type === type),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Family Activity
        </CardTitle>
        <CardDescription>
          Live feed of every event exchanged with satellite apps — inbound events they send here and
          outbound events the hub fans out, with delivery status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "inbound", "outbound"] as Filter[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
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
