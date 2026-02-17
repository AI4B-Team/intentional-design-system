import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, ComposedChart, Line, Cell,
} from "recharts";
import {
  Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  Flame, Target, Zap, Eye, BarChart3, Activity, Award, AlertTriangle,
  Repeat, Clock, Percent, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

// ─── Buyer Activity Data ───
const ZIPS = [
  { zip: "34668", name: "Port Richey", ts: 144, cs: 139, rs: 5, mp: 44900, retailAvg: 89000, dom: 77, cr: 96.5, score: 98, listToSale: 0.92, absRate: 18.0, flips: 8, compIdx: 94, velocity: 12.0, domCash: 54, domRetail: 122 },
  { zip: "34691", name: "Holiday", ts: 73, cs: 67, rs: 6, mp: 41000, retailAvg: 78000, dom: 66, cr: 91.8, score: 95, listToSale: 0.95, absRate: 9.1, flips: 3, compIdx: 78, velocity: 6.1, domCash: 42, domRetail: 105 },
  { zip: "34653", name: "New Port Richey", ts: 56, cs: 49, rs: 7, mp: 57500, retailAvg: 112000, dom: 57, cr: 87.5, score: 93, listToSale: 0.93, absRate: 7.0, flips: 4, compIdx: 72, velocity: 4.7, domCash: 38, domRetail: 89 },
  { zip: "34652", name: "Port Richey", ts: 73, cs: 55, rs: 18, mp: 45750, retailAvg: 95000, dom: 104, cr: 75.3, score: 91, listToSale: 0.88, absRate: 9.1, flips: 6, compIdx: 68, velocity: 6.1, domCash: 72, domRetail: 134 },
  { zip: "34690", name: "Holiday", ts: 41, cs: 38, rs: 3, mp: 49000, retailAvg: 82000, dom: 91, cr: 92.7, score: 90, listToSale: 0.92, absRate: 5.1, flips: 2, compIdx: 65, velocity: 3.4, domCash: 61, domRetail: 148 },
  { zip: "34655", name: "New Port Richey", ts: 74, cs: 30, rs: 44, mp: 135000, retailAvg: 185000, dom: 78, cr: 40.5, score: 82, listToSale: 0.95, absRate: 9.3, flips: 12, compIdx: 58, velocity: 6.2, domCash: 52, domRetail: 96 },
  { zip: "34667", name: "Hudson", ts: 66, cs: 32, rs: 34, mp: 100000, retailAvg: 155000, dom: 99, cr: 48.5, score: 78, listToSale: 0.95, absRate: 8.3, flips: 9, compIdx: 52, velocity: 5.5, domCash: 64, domRetail: 118 },
  { zip: "34654", name: "New Port Richey", ts: 27, cs: 12, rs: 15, mp: 105000, retailAvg: 162000, dom: 129, cr: 44.4, score: 72, listToSale: 0.94, absRate: 3.4, flips: 5, compIdx: 42, velocity: 2.3, domCash: 88, domRetail: 156 },
];

const PRICE_MATRIX = [
  { range: "Under $50K", z68_c: 81, z68_r: 0, z91_c: 44, z91_r: 0, z53_c: 20, z53_r: 0, z52_c: 38, z52_r: 0, total_c: 233, total_r: 0 },
  { range: "$50-100K", z68_c: 58, z68_r: 0, z91_c: 23, z91_r: 0, z53_c: 29, z53_r: 0, z52_c: 17, z52_r: 5, total_c: 147, total_r: 42 },
  { range: "$100-150K", z68_c: 0, z68_r: 2, z91_c: 0, z91_r: 2, z53_c: 0, z53_r: 6, z52_c: 0, z52_r: 6, total_c: 18, total_r: 40 },
  { range: "$150-200K", z68_c: 0, z68_r: 1, z91_c: 0, z91_r: 3, z53_c: 0, z53_r: 1, z52_c: 0, z52_r: 2, total_c: 5, total_r: 28 },
  { range: "$200-300K", z68_c: 1, z68_r: 0, z91_c: 1, z91_r: 0, z53_c: 0, z53_r: 0, z52_c: 1, z52_r: 3, total_c: 3, total_r: 22 },
  { range: "$300K+", z68_c: 0, z68_r: 1, z91_c: 0, z91_r: 0, z53_c: 0, z53_r: 0, z52_c: 0, z52_r: 5, total_c: 0, total_r: 16 },
];

const VELOCITY = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((m, i) => ({
  month: m,
  cashTx: Math.round(30 + Math.sin(i / 2) * 12 + i * 0.8),
  retailTx: Math.round(8 + Math.sin(i / 1.5) * 4 + i * 0.5),
  avgOffer: Math.round(48000 + i * 600 + Math.sin(i / 2) * 3000),
}));

const FLIP_DATA = ZIPS.map((z) => ({
  zip: z.zip, flips: z.flips,
  avgProfit: Math.round(z.mp * 0.4 + Math.random() * 8000),
  avgHold: Math.round(60 + Math.random() * 60),
  ts: z.ts,
}));

// ─── Tooltip ───
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-muted-foreground text-[10px] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground text-[10px]">{p.name}: </span>
          <span className="text-foreground text-[10px] font-semibold">
            {typeof p.value === "number" && p.value > 999 ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ───
function StatCard({ label, value, sub, icon: Icon, color, change }: {
  label: string; value: string | number; sub: string; icon: React.ElementType; color: string; change?: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</span>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-muted-foreground text-[10px]">{sub}</span>
        {change !== undefined && (
          <span className={cn("flex items-center gap-0.5 text-[10px] font-semibold", change > 0 ? "text-emerald-500" : "text-red-500")}>
            {change > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Heat Cell ───
function HeatCell({ val, max }: { val: number; max: number }) {
  const pct = val / max;
  const colorClass = val === 0 ? "" : pct > 0.6 ? "bg-emerald-500/20" : pct > 0.3 ? "bg-cyan-500/20" : pct > 0.1 ? "bg-blue-500/20" : "bg-blue-500/10";
  return (
    <td className={cn("px-2 py-1.5 text-center text-[11px] rounded", colorClass, val > 0 ? "font-semibold text-foreground" : "text-muted-foreground")}>
      {val || "—"}
    </td>
  );
}

const COLORS = {
  primary: "hsl(var(--primary))",
  cyan: "#06B6D4",
  warning: "#F59E0B",
  accent: "#3B82F6",
  purple: "#8B5CF6",
  danger: "#EF4444",
};

const SUB_VIEWS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "hotspots", label: "Hot Spots", icon: Flame },
  { id: "velocity", label: "Velocity", icon: Activity },
  { id: "flips", label: "Flip Tracker", icon: Repeat },
] as const;

export function BuyerActivityTab({ children }: { children?: React.ReactNode }) {
  const [view, setView] = useState<string>("overview");
  const totalCash = ZIPS.reduce((s, z) => s + z.cs, 0);
  const totalRetail = ZIPS.reduce((s, z) => s + z.rs, 0);
  const totalFlips = ZIPS.reduce((s, z) => s + z.flips, 0);
  const avgVelocity = (ZIPS.reduce((s, z) => s + z.velocity, 0) / ZIPS.length).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Sub-nav */}
      <div className="flex gap-1 bg-muted rounded-lg p-0.5 w-fit">
        {SUB_VIEWS.map((t) => (
          <button key={t.id} onClick={() => setView(t.id)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors",
              view === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            <t.icon size={12} />{t.label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {view === "overview" && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <StatCard label="Total Transactions" value={totalCash + totalRetail} sub={`${totalCash} investor + ${totalRetail} retail`} icon={DollarSign} color={COLORS.cyan} change={4.2} />
            <StatCard label="Flippers" value={`${totalFlips} deals`} sub="Sold 2x in 12 months" icon={Repeat} color={COLORS.purple} change={12.5} />
            <StatCard label="Landlords" value={Math.round(totalCash * 0.45)} sub={`${((totalCash * 0.45 / (totalCash + totalRetail)) * 100).toFixed(1)}% of market`} icon={Home} color={COLORS.primary} change={3.1} />
            <StatCard label="Retail" value={totalRetail} sub={`${((totalRetail / (totalCash + totalRetail)) * 100).toFixed(1)}% of market`} icon={Users} color={COLORS.warning} change={1.8} />
            <StatCard label="Wholesalers" value={Math.round(totalCash * 0.25)} sub="Assigned within 30 days" icon={Activity} color={COLORS.accent} change={5.6} />
            <StatCard label="New Entrants" value={Math.round(totalCash * 0.12)} sub="First purchase in market" icon={Target} color="#F472B6" change={8.3} />
          </div>

          {children}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {/* Investor Concentration */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Investor Concentration <InfoTooltip text="Number of investor purchases per zip code. Higher bars indicate zip codes where investors are most actively buying." /></h3>
              <p className="text-[11px] text-muted-foreground mb-3">Higher bars = more investor activity</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[...ZIPS].sort((a, b) => b.cs - a.cs)} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="cs" name="Investor Sales" radius={[4, 4, 0, 0]}>
                    {[...ZIPS].sort((a, b) => b.cs - a.cs).map((z, i) => (
                      <Cell key={i} fill={z.cr > 80 ? COLORS.cyan : z.cr > 50 ? COLORS.accent : "#334155"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Competition Index */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Buyer Competition Index <InfoTooltip text="Measures how competitive each zip code is for deals. Higher score = more buyers competing, potentially harder to get deals under contract." /></h3>
              <p className="text-[11px] text-muted-foreground mb-3">Higher = more competition for deals</p>
              <div className="space-y-0">
                {[...ZIPS].sort((a, b) => b.compIdx - a.compIdx).map((z, i) => (
                  <div key={z.zip} className={cn("flex items-center gap-2.5 py-2", i < ZIPS.length - 1 && "border-b border-border")}>
                    <span className="font-bold w-12 text-xs text-emerald-500">{z.zip}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{
                        width: `${z.compIdx}%`,
                        background: z.compIdx > 80 ? COLORS.danger : z.compIdx > 60 ? COLORS.warning : COLORS.primary,
                      }} />
                    </div>
                    <span className="font-bold w-8 text-right text-xs" style={{
                      color: z.compIdx > 80 ? COLORS.danger : z.compIdx > 60 ? COLORS.warning : COLORS.primary,
                    }}>{z.compIdx}</span>
                    <span className="text-[10px] text-muted-foreground w-14">{z.compIdx > 80 ? "🔥 Hot" : z.compIdx > 60 ? "⚡ Active" : "✅ Open"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DOM Investor vs Retail */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Days on Market: Investor vs Retail <InfoTooltip text="Compares how quickly investors close vs traditional financed buyers. The gap shows the speed advantage of investor offers." /></h3>
            <p className="text-[11px] text-muted-foreground mb-3">Investors close significantly faster</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ZIPS} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip content={<ChartTip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="domCash" name="Investor DOM" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                <Bar dataKey="domRetail" name="Retail Buyer DOM" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* What Investors Are Paying + Investor Vs Retail Price Gap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">What Investors Are Paying <InfoTooltip text="Average acquisition price investors are paying in each zip code. Lower averages may indicate stronger wholesale discount opportunities." /></h3>
              <p className="text-[11px] text-muted-foreground mb-3">Average acquisition price by zip</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[...ZIPS].sort((a, b) => a.mp - b.mp)} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="mp" name="Avg Investor Price" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Investor Vs Retail Price Gap <InfoTooltip text="Compares average investor price vs retail price per zip. The spread represents your potential margin opportunity as a wholesaler or flipper." /></h3>
              <p className="text-[11px] text-muted-foreground mb-3">The spread = your margin opportunity</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ZIPS} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="mp" name="Investor Avg" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="retailAvg" name="Retail Avg" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HOT SPOTS ═══ */}
      {view === "hotspots" && (
        <div className="space-y-3.5">
          {/* Investor Heatmap */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">🔥 Investor Activity Heatmap <InfoTooltip text="Shows where investors are buying by price range and zip code. Darker cells = more transactions. Use this to find your target price range." /></h3>
            <p className="text-[11px] text-muted-foreground mb-3">Investor transactions by price range × zip code</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px]" style={{ borderSpacing: 3 }}>
                <thead>
                  <tr>
                    <th className="px-2.5 py-2 text-left text-muted-foreground text-[10px]">PRICE RANGE</th>
                    {["34668", "34691", "34653", "34652"].map((z) => (
                      <th key={z} className="px-2 py-2 text-center text-cyan-500 text-[10px]">{z}</th>
                    ))}
                    <th className="px-2.5 py-2 text-center text-foreground text-[10px] font-bold">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICE_MATRIX.map((r) => (
                    <tr key={r.range}>
                      <td className="px-2.5 py-1.5 font-semibold text-muted-foreground text-[11px]">{r.range}</td>
                      <HeatCell val={r.z68_c} max={81} />
                      <HeatCell val={r.z91_c} max={81} />
                      <HeatCell val={r.z53_c} max={81} />
                      <HeatCell val={r.z52_c} max={81} />
                      <td className="px-2.5 py-1.5 text-center text-xs font-bold text-cyan-500 bg-cyan-500/10 rounded">{r.total_c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Retail Heatmap */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Retail Buyer Activity Heatmap <InfoTooltip text="Shows where traditional buyers are purchasing. These areas are your best exit markets for fix & flip resales." /></h3>
            <p className="text-[11px] text-muted-foreground mb-3">Where retail buyers are active — best flip exit markets</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px]" style={{ borderSpacing: 3 }}>
                <thead>
                  <tr>
                    <th className="px-2.5 py-2 text-left text-muted-foreground text-[10px]">PRICE RANGE</th>
                    {["34668", "34691", "34653", "34652"].map((z) => (
                      <th key={z} className="px-2 py-2 text-center text-amber-500 text-[10px]">{z}</th>
                    ))}
                    <th className="px-2.5 py-2 text-center text-foreground text-[10px] font-bold">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICE_MATRIX.map((r) => (
                    <tr key={r.range}>
                      <td className="px-2.5 py-1.5 font-semibold text-muted-foreground text-[11px]">{r.range}</td>
                      <HeatCell val={r.z68_r} max={6} />
                      <HeatCell val={r.z91_r} max={6} />
                      <HeatCell val={r.z53_r} max={6} />
                      <HeatCell val={r.z52_r} max={6} />
                      <td className="px-2.5 py-1.5 text-center text-xs font-bold text-amber-500 bg-amber-500/10 rounded">{r.total_r}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sweet Spot */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-cyan-500" />
              <h3 className="text-[15px] font-bold text-foreground">Price Sweet Spot Analysis</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-background/50 rounded-lg p-3.5">
                <div className="text-[10px] text-muted-foreground uppercase mb-1">🎯 Wholesale Sweet Spot</div>
                <div className="text-lg font-bold text-cyan-500">Under $50K</div>
                <div className="text-xs text-muted-foreground mt-1">233 investor sales (42% of all transactions)</div>
                <div className="text-[11px] text-emerald-500 mt-0.5">Highest volume, fastest closings</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3.5">
                <div className="text-[10px] text-muted-foreground uppercase mb-1">🏠 Flip Sweet Spot</div>
                <div className="text-lg font-bold text-amber-500">$100K – $200K</div>
                <div className="text-xs text-muted-foreground mt-1">68 retail sales with strong buyer demand</div>
                <div className="text-[11px] text-emerald-500 mt-0.5">Best exit market for rehabbed properties</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3.5">
                <div className="text-[10px] text-muted-foreground uppercase mb-1">⚠️ Dead Zone</div>
                <div className="text-lg font-bold text-red-500">$300K+</div>
                <div className="text-xs text-muted-foreground mt-1">Only 16 total sales in this range</div>
                <div className="text-[11px] text-red-500 mt-0.5">Low demand, high risk, avoid</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ VELOCITY ═══ */}
      {view === "velocity" && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Monthly Transaction Volume <InfoTooltip text="Monthly count of cash and retail closings. Track seasonality and momentum in buyer activity." /></h3>
              <p className="text-[11px] text-muted-foreground mb-3">Investor vs retail closings per month</p>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={VELOCITY}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip content={<ChartTip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="cashTx" name="Investor Closings" fill={COLORS.cyan} radius={[4, 4, 0, 0]} opacity={0.7} />
                  <Bar dataKey="retailTx" name="Retail Closings" fill={COLORS.warning} radius={[4, 4, 0, 0]} opacity={0.7} />
                  <Line type="monotone" dataKey="cashTx" name="Investor Trend" stroke={COLORS.cyan} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Avg Investor Offer Price Trend <InfoTooltip text="Tracks the average price investors are paying over time. Rising prices may mean increased competition." /></h3>
              <p className="text-[11px] text-muted-foreground mb-3">What investors are actually paying</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={VELOCITY}>
                  <defs>
                    <linearGradient id="offerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="avgOffer" name="Avg Offer $" stroke={COLORS.primary} fill="url(#offerGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Absorption Rate */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Absorption Rate by Zip <InfoTooltip text="Number of sales per month in each zip. Higher absorption = faster-moving market with quicker deal cycles." /></h3>
            <p className="text-[11px] text-muted-foreground mb-3">Sales per month — higher = hotter market</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[...ZIPS].sort((a, b) => b.absRate - a.absRate)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="absRate" name="Sales/Month" radius={[4, 4, 0, 0]}>
                  {[...ZIPS].sort((a, b) => b.absRate - a.absRate).map((z, i) => (
                    <Cell key={i} fill={z.absRate > 10 ? COLORS.primary : z.absRate > 6 ? COLORS.cyan : COLORS.accent} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* List-to-Sale */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">List-to-Sale Price Ratio <InfoTooltip text="Percentage of asking price that sellers actually receive. Lower ratios mean more negotiation room for investors." /></h3>
            <p className="text-[11px] text-muted-foreground mb-3">Lower = more negotiation room for investors</p>
            <div className="space-y-0">
              {[...ZIPS].sort((a, b) => a.listToSale - b.listToSale).map((z, i) => (
                <div key={z.zip} className={cn("flex items-center gap-3 py-2", i < ZIPS.length - 1 && "border-b border-border")}>
                  <span className="font-bold w-12 text-xs text-emerald-500">{z.zip}</span>
                  <div className="flex-1 relative h-6 bg-muted rounded-md overflow-hidden">
                    <div className="absolute left-0 top-0 h-full rounded-md" style={{
                      width: `${z.listToSale * 100}%`,
                      background: z.listToSale < 0.92
                        ? `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.cyan})`
                        : z.listToSale < 0.95
                        ? `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.accent})`
                        : `linear-gradient(90deg, ${COLORS.warning}, ${COLORS.danger})`,
                    }} />
                    <span className="absolute right-2 top-1 text-[11px] font-semibold text-foreground">{(z.listToSale * 100).toFixed(0)}%</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-16 text-right">
                    {z.listToSale < 0.92 ? "🎯 Room" : z.listToSale < 0.95 ? "Fair" : "💰 Tight"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ FLIP TRACKER ═══ */}
      {view === "flips" && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Active Flips Detected" value={totalFlips} sub="Properties sold 2x in 12mo" icon={Repeat} color={COLORS.purple} />
            <StatCard label="Avg Flip Profit" value={`$${Math.round(FLIP_DATA.reduce((s, f) => s + f.avgProfit, 0) / FLIP_DATA.length).toLocaleString()}`} sub="Estimated gross margin" icon={DollarSign} color={COLORS.primary} />
            <StatCard label="Avg Hold Period" value={`${Math.round(FLIP_DATA.reduce((s, f) => s + f.avgHold, 0) / FLIP_DATA.length)} days`} sub="From purchase to resale" icon={Clock} color={COLORS.warning} />
            <StatCard label="Flip-to-Sale Ratio" value={`${((totalFlips / (totalCash + totalRetail)) * 100).toFixed(1)}%`} sub="Of all transactions are flips" icon={Percent} color={COLORS.cyan} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Flip Activity by Zip <InfoTooltip text="Properties that were bought and resold within 12 months — indicates active flipping in that area." /></h3>
              <p className="text-[11px] text-muted-foreground mb-3">Properties sold twice within 12 months</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[...FLIP_DATA].sort((a, b) => b.flips - a.flips)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="flips" name="Flip Deals" radius={[4, 4, 0, 0]}>
                    {[...FLIP_DATA].sort((a, b) => b.flips - a.flips).map((f, i) => (
                      <Cell key={i} fill={f.flips > 8 ? COLORS.purple : f.flips > 4 ? COLORS.accent : "#334155"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-0.5 capitalize">Estimated Flip Margins</h3>
              <p className="text-[11px] text-muted-foreground mb-3">Gross profit per flip by zip</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[...FLIP_DATA].sort((a, b) => b.avgProfit - a.avgProfit)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="avgProfit" name="Avg Profit $" radius={[4, 4, 0, 0]}>
                    {[...FLIP_DATA].sort((a, b) => b.avgProfit - a.avgProfit).map((f, i) => (
                      <Cell key={i} fill={i < 3 ? COLORS.primary : i < 5 ? COLORS.cyan : COLORS.accent} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Flip Intel Table */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3 capitalize">Flip Intelligence Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["ZIP", "AREA", "FLIPS", "AVG PROFIT", "AVG HOLD", "% OF SALES", "OPPORTUNITY"].map((h, i) => (
                      <th key={i} className={cn("px-2.5 py-2 text-muted-foreground text-[10px] font-semibold", i < 2 ? "text-left" : "text-right")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...FLIP_DATA].sort((a, b) => b.flips - a.flips).map((f) => {
                    const z = ZIPS.find((z) => z.zip === f.zip);
                    const pctOfSales = ((f.flips / f.ts) * 100).toFixed(1);
                    const opp = f.flips > 8 ? "High" : f.flips > 4 ? "Medium" : "Low";
                    return (
                      <tr key={f.zip} className="border-b border-border">
                        <td className="px-2.5 py-2 font-bold text-emerald-500">{f.zip}</td>
                        <td className="px-2.5 py-2 text-muted-foreground">{z?.name}</td>
                        <td className="px-2.5 py-2 text-right font-semibold text-purple-500">{f.flips}</td>
                        <td className="px-2.5 py-2 text-right font-semibold text-emerald-500">${f.avgProfit.toLocaleString()}</td>
                        <td className={cn("px-2.5 py-2 text-right", f.avgHold < 90 ? "text-emerald-500" : "text-amber-500")}>{f.avgHold}d</td>
                        <td className="px-2.5 py-2 text-right">{pctOfSales}%</td>
                        <td className="px-2.5 py-2 text-right">
                          <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold",
                            opp === "High" ? "bg-emerald-500/15 text-emerald-500" :
                            opp === "Medium" ? "bg-amber-500/15 text-amber-500" :
                            "bg-blue-500/15 text-blue-500")}>{opp}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
