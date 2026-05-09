import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Filter, Search, Eye } from "lucide-react";
import { ScoreBadge } from "@/components/harvest/ScoreBadge";
import { LeadDetailModal } from "@/components/harvest/LeadDetailModal";
import { useHarvestLeads, useFocusList } from "@/hooks/useHarvestStats";
import type { HarvestLead } from "@/types/harvest";
import { cn } from "@/lib/utils";

interface LeadsTableProps {
  variant?: "all" | "focus";
}

export function LeadsTable({ variant = "all" }: LeadsTableProps) {
  const all = useHarvestLeads();
  const focus = useFocusList();
  const leads = variant === "focus" ? focus.leads : all.leads;

  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [tier, setTier] = React.useState<"all" | "hot" | "warm" | "watch">("all");
  const [selected, setSelected] = React.useState<HarvestLead | null>(null);

  const filtered = React.useMemo(() => {
    let r = leads;
    if (tier !== "all") {
      r = r.filter((l) => {
        if (tier === "hot") return l.opportunityScore >= 80;
        if (tier === "warm") return l.opportunityScore >= 60 && l.opportunityScore < 80;
        return l.opportunityScore >= 40 && l.opportunityScore < 60;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (l) =>
          l.address.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          (l.ownerName ?? "").toLowerCase().includes(q),
      );
    }
    return r;
  }, [leads, tier, search]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search address, city, or owner…"
            className="pl-8 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <Filter className="h-3.5 w-3.5" /> Filters
          {filtersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
        <div className="flex gap-1 ml-auto">
          {(["all", "hot", "warm", "watch"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md capitalize transition-colors",
                tier === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtersOpen && (
        <Card className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <FilterPlaceholder label="Asset Class" />
          <FilterPlaceholder label="State / County" />
          <FilterPlaceholder label="Owner Type" />
          <FilterPlaceholder label="Confidence" />
          <FilterPlaceholder label="Has Phone" />
          <FilterPlaceholder label="Quick Preset" />
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">Address</th>
                <th className="px-3 py-2 font-medium">Owner</th>
                <th className="px-3 py-2 font-medium">Score</th>
                <th className="px-3 py-2 font-medium">Signals</th>
                <th className="px-3 py-2 font-medium hidden md:table-cell">Asset</th>
                <th className="px-3 py-2 font-medium hidden lg:table-cell">Distress</th>
                <th className="px-3 py-2 font-medium hidden xl:table-cell">Beds/Baths</th>
                <th className="px-3 py-2 font-medium hidden lg:table-cell text-right">Est. Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => setSelected(l)}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-foreground">{l.address}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {l.city}, {l.state}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-foreground/90">{l.ownerName ?? "—"}</td>
                  <td className="px-3 py-2">
                    <ScoreBadge score={l.opportunityScore} />
                  </td>
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">
                    {l.signals.length}
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    <Badge variant="outline" className="text-[10px]">
                      {prettyAsset(l.assetClass)}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell">
                    <DistressBar value={l.distressScore} />
                  </td>
                  <td className="px-3 py-2 hidden xl:table-cell text-muted-foreground tabular-nums">
                    {l.beds ?? "—"} / {l.baths ?? "—"}
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell text-right tabular-nums">
                    {l.arvEstimate ? `$${l.arvEstimate.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-sm text-muted-foreground">
                    No leads match your filters. Try widening the score range or removing filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
            Showing 100 of {filtered.length} leads
          </div>
        )}
      </Card>

      <LeadDetailModal lead={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}

function DistressBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "bg-red-500" : value >= 60 ? "bg-orange-500" : value >= 40 ? "bg-yellow-500" : "bg-muted-foreground/40";
  return (
    <div className="flex items-center gap-2 w-24">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground w-6 text-right">{value}</span>
    </div>
  );
}

function FilterPlaceholder({ label }: { label: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div className="h-8 rounded-md border border-border bg-card flex items-center px-2 text-muted-foreground text-xs">
        All
      </div>
    </div>
  );
}

function prettyAsset(a: HarvestLead["assetClass"]) {
  return {
    single_family: "Single Family",
    multi_family: "Multi",
    commercial: "Commercial",
    land: "Land",
    industrial: "Industrial",
    unknown: "Unknown",
  }[a];
}
