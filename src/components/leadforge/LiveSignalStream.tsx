import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";
import { useLeadsToday } from "@/hooks/useLeadsData";
import { SIGNAL_TYPES, getTier, TIER_CHIP_CLASSES, LEAD_TIERS } from "@/lib/lead-constants";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const SIGNAL_LABELS: Record<string, string> = Object.fromEntries(
  SIGNAL_TYPES.map((s) => [s.value, s.label])
);

const SEV_DOT: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-muted-foreground/50",
};

/**
 * Renders live signal events from `leads_signals` joined to `leads_properties`.
 * Returns null when no live data is available so the existing visual layout
 * remains unaffected until the harvesting agents have populated rows.
 */
export function LiveSignalStream() {
  const { data, isLoading } = useLeadsToday();
  if (isLoading) return null;
  if (!data || data.source !== "live" || data.rows.length === 0) return null;

  const rows = data.rows as any[];
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary animate-pulse" />
          Live Signal Stream
        </h3>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {rows.length} New Today
        </span>
      </div>
      <div
        className="space-y-2 max-h-[320px] overflow-y-auto pr-1"
        style={{ scrollbarGutter: "stable" }}
      >
        {rows.slice(0, 30).map((row) => {
          const prop = row.leads_properties || {};
          const score = row.score ?? 0;
          const tier = getTier(score);
          return (
            <div
              key={row.id}
              className="flex items-center gap-3 py-2 px-2 rounded hover:bg-muted/40 transition-colors"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  SEV_DOT[row.severity] || SEV_DOT.medium
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {SIGNAL_LABELS[row.signal_type] || row.signal_type}
                  {prop.address ? ` · ${prop.address}` : ""}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {row.detected_at
                    ? formatDistanceToNow(new Date(row.detected_at), { addSuffix: true })
                    : "Just Now"}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn("text-[10px] uppercase tracking-wider", TIER_CHIP_CLASSES[tier])}
              >
                {LEAD_TIERS[tier].label}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
