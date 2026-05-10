import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";
import { useLeadsProperties } from "@/hooks/useLeadsData";
import { getTier, TIER_CHIP_CLASSES, LEAD_TIERS, LEAD_STATUSES } from "@/lib/lead-constants";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  LEAD_STATUSES.map((s) => [s.value, s.label])
);

/**
 * Live table backed by `leads_properties` + `leads_scores`.
 * Stays hidden when no live rows exist so the existing mock UI is preserved.
 */
export function LiveProspectsTable() {
  const { data, isLoading } = useLeadsProperties();
  if (isLoading) return null;
  if (!data || data.source !== "live" || data.rows.length === 0) return null;

  const rows = data.rows as any[];
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground tracking-wide text-sm uppercase flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          Live Prospects
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {rows.length} Rows
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 text-left">Address</th>
              <th className="px-3 py-2.5 text-left">City</th>
              <th className="px-3 py-2.5 text-left">Owner</th>
              <th className="px-3 py-2.5 text-left">Status</th>
              <th className="px-3 py-2.5 text-left">Tier</th>
              <th className="px-3 py-2.5 text-right">Score</th>
              <th className="px-3 py-2.5 text-right">Signals</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 50).map((r) => {
              const score = r.leads_scores?.[0]?.opportunity_score ?? 0;
              const tier = getTier(score);
              const signalCount = Array.isArray(r.leads_signals) ? r.leads_signals.length : 0;
              return (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-medium text-foreground">{r.address ?? "—"}</td>
                  <td className="px-3 py-2.5 text-foreground/80">{r.city ?? "—"}</td>
                  <td className="px-3 py-2.5 text-foreground/80">{r.owner_name ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[11px] text-muted-foreground">
                      {STATUS_LABELS[r.status] || r.status || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] uppercase tracking-wider", TIER_CHIP_CLASSES[tier])}
                    >
                      {LEAD_TIERS[tier].label}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-foreground">
                    {score}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {signalCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
