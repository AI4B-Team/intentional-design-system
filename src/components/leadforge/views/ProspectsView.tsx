import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Building2, ArrowUpRight, Flame, Zap, UserCheck, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoveToPipelineModal, PipelineCandidate } from "@/components/leadforge/MoveToPipelineModal";
import { InPipelineBadge } from "@/components/leadforge/InPipelineBadge";

type SubTab = "all" | "hot" | "urgency" | "investors";

const GraduationCtx = React.createContext<{
  graduated: Set<string>;
  request: (c: PipelineCandidate) => void;
}>({ graduated: new Set(), request: () => {} });

const SUBTABS: { v: SubTab; label: string; icon?: React.ElementType }[] = [
  { v: "all", label: "All Prospects" },
  { v: "hot", label: "Hot Sheet", icon: Flame },
  { v: "urgency", label: "Urgency", icon: Zap },
  { v: "investors", label: "Investors", icon: UserCheck },
];

const FILTERS = [
  { label: "Asset Class", value: "All Properties (838)" },
  { label: "Tier", value: "All Tiers" },
  { label: "State", value: "Texas (77,013)" },
  { label: "County", value: "All Counties" },
  { label: "Owner Type", value: "All Types" },
  { label: "Trust Level", value: "All" },
  { label: "Has Phone", value: "All" },
  { label: "Quick Filter", value: "— Preset —" },
];

const ROWS = [
  { addr: "5927 Oak St", city: "Dallas", owner: "James Young", tier: "B", asset: "Unknown", distress: 50, signals: 1, beds: "—", baths: "—", sqft: "—", year: "—", value: "$57,825,000" },
  { addr: "2612 Cottonwood Ave", city: "Amarillo", owner: "Samuel undefined", tier: "B", asset: "Commercial", distress: 50, signals: 6, beds: "—", baths: "—", sqft: "108,813", year: "2001", value: "$33,504,735" },
  { addr: "8161 Walnut Blvd", city: "Garland", owner: "Paul undefined", tier: "C", asset: "Commercial", distress: 50, signals: 7, beds: "—", baths: "—", sqft: "101,415", year: "2005", value: "$20,000,000" },
  { addr: "8263 Magnolia Ln", city: "Richardson", owner: "Mark undefined", tier: "B", asset: "Unknown", distress: 50, signals: 1, beds: "—", baths: "—", sqft: "—", year: "—", value: "$3,733,310" },
  { addr: "5607 Magnolia Ln", city: "Richardson", owner: "Timothy Flores", tier: "B", asset: "Unknown", distress: 50, signals: 1, beds: "—", baths: "—", sqft: "—", year: "—", value: "$4,798,940" },
  { addr: "6908 Cherry St", city: "Carrollton", owner: "Nicholas Thompson", tier: "B", asset: "Unknown", distress: 50, signals: 1, beds: "—", baths: "—", sqft: "—", year: "—", value: "$2,982,760" },
  { addr: "3028 Ash Dr", city: "Mesquite", owner: "Daniel undefined", tier: "B", asset: "Commercial", distress: 51, signals: 7, beds: "—", baths: "—", sqft: "38,676", year: "1986", value: "$8,022,120" },
  { addr: "3129 Peachtree Rd", city: "Flower Mound", owner: "Edward undefined", tier: "B", asset: "Unknown", distress: 55, signals: 1, beds: "—", baths: "—", sqft: "—", year: "—", value: "$51,750,000" },
  { addr: "6162 Spruce St", city: "Lubbock", owner: "Jacob Torres", tier: "B", asset: "Commercial", distress: 55, signals: 3, beds: "—", baths: "—", sqft: "24,475", year: "2020", value: "$3,955,000" },
  { addr: "9554 Pecan Ave", city: "Denton", owner: "George Rodriguez", tier: "B", asset: "Commercial", distress: 55, signals: 7, beds: "—", baths: "—", sqft: "558,665", year: "2015", value: "$290,042,692" },
];

const HOT_LEADS = [
  { rank: 1, action: 82, distress: 155, addr: "7216 Redwood Blvd", line2: "Tyler, TX 75214", owner: "Andrew Sanchez", county: "Dallas", signals: ["code violation", "federal bankruptcy", "lien"], tier: "A", equity: "$591K", arv: "$638K" },
  { rank: 2, action: 82, distress: 155, addr: "119 Walnut Blvd", line2: "Garland, TX 75210", owner: "Justin undefined", county: "Dallas", signals: ["code violation", "federal bankruptcy", "lien"], tier: "A", equity: "$147K", arv: "$158K" },
  { rank: 3, action: 80, distress: 160, addr: "9309 Peachtree Rd", line2: "Flower Mound, TX 75212", owner: "Larry undefined", county: "Dallas", signals: ["code violation", "federal bankruptcy", "lien"], tier: "A", equity: "$194K", arv: "$210K" },
  { rank: 4, action: 80, distress: 143, addr: "3155 Maple Ave", line2: "Fort Worth, TX 75243", owner: "Eric Thomas", county: "Dallas", signals: ["code violation", "federal bankruptcy", "lien"], tier: "A", equity: "$189K", arv: "$204K" },
  { rank: 5, action: 79, distress: 155, addr: "8605 Maple Ave", line2: "Fort Worth, TX 75216", owner: "Gregory undefined", county: "Dallas", signals: ["code violation", "lien", "probate"], tier: "A", equity: "$308K", arv: "$333K" },
  { rank: 6, action: 79, distress: 138, addr: "6655 Pecan Ave", line2: "Denton, TX 75074", owner: "Michael undefined", county: "Collin", signals: ["federal bankruptcy", "lien", "tax delinquent"], tier: "A", equity: "$211K", arv: "$241K" },
];

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    A: "bg-red-500/10 text-red-600 border-red-200",
    B: "bg-amber-500/10 text-amber-600 border-amber-200",
    C: "bg-sky-500/10 text-sky-600 border-sky-200",
    D: "bg-slate-500/10 text-slate-600 border-slate-200",
  };
  return (
    <span className={cn("inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold border", map[tier])}>
      {tier}
    </span>
  );
}

function DistressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-cyan-500" style={{ width: `${Math.min(100, (value / 200) * 100)}%` }} />
      </div>
      <span className="text-xs tabular-nums text-foreground/80">{value}</span>
    </div>
  );
}

function HotSheetRows() {
  const { graduated, request } = React.useContext(GraduationCtx);
  return (
    <>
      {HOT_LEADS.map((l) => {
        const isGraduated = graduated.has(l.addr);
        return (
          <tr key={l.rank} className={cn("border-t border-border hover:bg-muted/30", isGraduated && "opacity-70")}>
            <td className="px-4 py-3 text-muted-foreground tabular-nums">{l.rank}</td>
            <td className="px-4 py-3"><Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/10 border-0 tabular-nums">{l.action}</Badge></td>
            <td className="px-4 py-3 text-red-600 tabular-nums font-medium">{l.distress}</td>
            <td className="px-4 py-3">
              <p className="font-semibold text-foreground">{l.addr}</p>
              <p className="text-[11px] text-muted-foreground">{l.line2}</p>
              <p className="text-[11px] text-muted-foreground">{l.owner}</p>
            </td>
            <td className="px-4 py-3 text-foreground/80">{l.county}</td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {l.signals.map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">{s}</span>
                ))}
              </div>
            </td>
            <td className="px-4 py-3"><TierBadge tier={l.tier} /></td>
            <td className="px-4 py-3 text-right tabular-nums text-emerald-600 font-medium">{l.equity}</td>
            <td className="px-4 py-3 text-right tabular-nums text-cyan-600 font-medium">{l.arv}</td>
            <td className="px-4 py-3 text-right">
              {isGraduated ? (
                <InPipelineBadge />
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 gap-1 text-primary hover:text-primary"
                  onClick={() =>
                    request({
                      id: l.addr,
                      address: l.addr,
                      city: l.line2,
                      county: l.county,
                      score: l.action,
                      signals: l.signals,
                    })
                  }
                >
                  <Workflow className="h-3.5 w-3.5" /> Pipeline
                </Button>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}

function ProspectRows() {
  const { graduated, request } = React.useContext(GraduationCtx);
  return (
    <>
      {ROWS.map((r) => {
        const isGraduated = graduated.has(r.addr);
        return (
          <tr key={r.addr} className={cn("border-t border-border hover:bg-muted/30", isGraduated && "opacity-70")}>
            <td className="px-3 py-2.5 font-medium text-foreground">{r.addr}</td>
            <td className="px-3 py-2.5 text-foreground/80">{r.city}</td>
            <td className="px-3 py-2.5 text-foreground/80">{r.owner}</td>
            <td className="px-3 py-2.5"><TierBadge tier={r.tier} /></td>
            <td className="px-3 py-2.5">
              {r.asset === "Unknown" ? (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Unknown</span>
              ) : (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">{r.asset}</span>
              )}
            </td>
            <td className="px-3 py-2.5"><DistressBar value={r.distress} /></td>
            <td className="px-3 py-2.5 text-right tabular-nums">{r.signals}</td>
            <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{r.beds}</td>
            <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{r.baths}</td>
            <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{r.sqft}</td>
            <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{r.year}</td>
            <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground">{r.value}</td>
            <td className="px-3 py-2.5 text-right">
              {isGraduated ? (
                <InPipelineBadge />
              ) : (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-primary hover:text-primary gap-1"
                    onClick={() =>
                      request({
                        id: r.addr,
                        address: r.addr,
                        city: r.city,
                        score: r.distress,
                        signals: ["distress"],
                      })
                    }
                  >
                    <Workflow className="h-3.5 w-3.5" /> Pipeline
                  </Button>
                </div>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}

function HotSheetView() {
  return (
    <div className="space-y-4 pt-6">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Flame className="h-5 w-5 text-red-500" /> Hot Sheet — Most Actionable Leads
        </h3>
        <p className="text-sm text-muted-foreground">
          Action Score combines distress signals, absentee ownership, equity, owner distance, and data quality. These are your best calls to make today.
        </p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
          {[
            { l: "Tier", v: "Tier A" },
            { l: "Multi-Signal Only", v: "All leads" },
            { l: "Absentee Only", v: "All" },
            { l: "Min Signals", v: "Any (1+)" },
            { l: "Limit", v: "Top 50" },
          ].map((f) => (
            <div key={f.l}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{f.l}</p>
              <Select>
                <SelectTrigger className="h-9"><SelectValue placeholder={f.v} /></SelectTrigger>
                <SelectContent><SelectItem value="x">{f.v}</SelectItem></SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" className="gap-1.5"><Search className="h-3.5 w-3.5" /> Refresh</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Total Matched", v: 364, sub: "before limit", c: "text-red-600", b: "border-t-red-500" },
          { l: "Multi-Signal", v: 364, sub: "2+ signal types", c: "text-amber-600", b: "border-t-amber-500" },
          { l: "With Equity", v: 151, sub: "known equity data", c: "text-cyan-600", b: "border-t-cyan-500" },
          { l: "Absentee Owners", v: 149, sub: "in this sheet", c: "text-emerald-600", b: "border-t-emerald-500" },
        ].map((s) => (
          <Card key={s.l} className={cn("p-4 border-t-4", s.b)}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{s.l}</p>
            <p className={cn("text-3xl font-bold tabular-nums mt-1", s.c)}>{s.v}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h4 className="font-semibold text-foreground text-sm">Top Actionable Leads</h4>
          <p className="text-[11px] text-muted-foreground">
            Action Score = distress + signal diversity + absentee + equity + completeness
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold">#</th>
                <th className="px-4 py-2.5 text-left font-semibold">Action Score</th>
                <th className="px-4 py-2.5 text-left font-semibold">Distress Score</th>
                <th className="px-4 py-2.5 text-left font-semibold">Address</th>
                <th className="px-4 py-2.5 text-left font-semibold">County</th>
                <th className="px-4 py-2.5 text-left font-semibold">Signal Types</th>
                <th className="px-4 py-2.5 text-left font-semibold">Tier</th>
                <th className="px-4 py-2.5 text-right font-semibold">Equity</th>
                <th className="px-4 py-2.5 text-right font-semibold">ARV</th>
                <th className="px-4 py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <HotSheetRows />
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AllProspectsView() {
  return (
    <div className="space-y-4 pt-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {FILTERS.map((f) => (
            <div key={f.label}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{f.label}</p>
              <Select>
                <SelectTrigger className="h-9"><SelectValue placeholder={f.value} /></SelectTrigger>
                <SelectContent><SelectItem value="x">{f.value}</SelectItem></SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1.5"><Search className="h-3.5 w-3.5" /> Search</Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground">× Clear Filters</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50">
              <Building2 className="h-3.5 w-3.5" /> Commercial Only
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export Loaded CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Commercial banner */}
      <Card className="p-3 bg-amber-50/60 border-amber-200 flex items-start gap-3">
        <Building2 className="h-4 w-4 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Commercial Segment — Entity-Owned Properties Only</p>
          <p className="text-xs text-amber-800/80">LLC/entity-owned properties appraised &gt; $2M. These are excluded from the residential hot sheet.</p>
        </div>
      </Card>

      {/* Pipeline table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground tracking-wide text-sm uppercase">Lead Pipeline</h3>
          <span className="text-xs text-muted-foreground tabular-nums">76,165 prospects</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 text-left">Address</th>
                <th className="px-3 py-2.5 text-left">City</th>
                <th className="px-3 py-2.5 text-left">Owner</th>
                <th className="px-3 py-2.5 text-left">Tier</th>
                <th className="px-3 py-2.5 text-left">Asset Class</th>
                <th className="px-3 py-2.5 text-left">Distress</th>
                <th className="px-3 py-2.5 text-right">Signals</th>
                <th className="px-3 py-2.5 text-right">Beds</th>
                <th className="px-3 py-2.5 text-right">Baths</th>
                <th className="px-3 py-2.5 text-right">SqFt</th>
                <th className="px-3 py-2.5 text-right">Year</th>
                <th className="px-3 py-2.5 text-right">Value</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              <ProspectRows />
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing 1–10 of 76,165 · 100 loaded</span>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-7 w-7 p-0">1</Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">2</Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">›</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ProspectsView() {
  const [sub, setSub] = React.useState<SubTab>("all");
  const [graduated, setGraduated] = React.useState<Set<string>>(new Set());
  const [target, setTarget] = React.useState<PipelineCandidate | null>(null);

  const ctxValue = React.useMemo(
    () => ({ graduated, request: (c: PipelineCandidate) => setTarget(c) }),
    [graduated]
  );

  return (
    <GraduationCtx.Provider value={ctxValue}>
      <div className="pt-4">
        <div className="flex items-center gap-2">
          {SUBTABS.map((t) => {
            const active = sub === t.v;
            const Icon = t.icon;
            return (
              <button
                key={t.v}
                onClick={() => setSub(t.v)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {t.label}
              </button>
            );
          })}
        </div>
        {sub === "all" && <AllProspectsView />}
        {sub === "hot" && <HotSheetView />}
        {sub === "urgency" && (
          <Card className="p-12 text-center mt-6 text-muted-foreground">Urgency view — coming next</Card>
        )}
        {sub === "investors" && (
          <Card className="p-12 text-center mt-6 text-muted-foreground">Investors view — coming next</Card>
        )}

        <MoveToPipelineModal
          open={!!target}
          onOpenChange={(o) => !o && setTarget(null)}
          candidate={target}
          onConfirm={() => {
            if (target) setGraduated((g) => new Set(g).add(target.id));
          }}
        />
      </div>
    </GraduationCtx.Provider>
  );
}
