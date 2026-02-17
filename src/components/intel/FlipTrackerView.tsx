import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  DollarSign, Repeat, Clock, Percent, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

const COLORS = {
  primary: "hsl(var(--primary))",
  cyan: "#06B6D4",
  warning: "#F59E0B",
  accent: "#3B82F6",
  purple: "#8B5CF6",
};

const ZIPS = [
  { zip: "34668", name: "Port Richey", ts: 144, cs: 139, rs: 5, mp: 44900, flips: 8 },
  { zip: "34691", name: "Holiday", ts: 73, cs: 67, rs: 6, mp: 41000, flips: 3 },
  { zip: "34653", name: "New Port Richey", ts: 56, cs: 49, rs: 7, mp: 57500, flips: 4 },
  { zip: "34652", name: "Port Richey", ts: 73, cs: 55, rs: 18, mp: 45750, flips: 6 },
  { zip: "34690", name: "Holiday", ts: 41, cs: 38, rs: 3, mp: 49000, flips: 2 },
  { zip: "34655", name: "New Port Richey", ts: 74, cs: 30, rs: 44, mp: 135000, flips: 12 },
  { zip: "34667", name: "Hudson", ts: 66, cs: 32, rs: 34, mp: 100000, flips: 9 },
  { zip: "34654", name: "New Port Richey", ts: 27, cs: 12, rs: 15, mp: 105000, flips: 5 },
];

const FLIP_DATA = ZIPS.map((z) => ({
  zip: z.zip, flips: z.flips,
  avgProfit: Math.round(z.mp * 0.4 + Math.random() * 8000),
  avgHold: Math.round(60 + Math.random() * 60),
  ts: z.ts,
}));

const totalFlips = ZIPS.reduce((s, z) => s + z.flips, 0);
const totalCash = ZIPS.reduce((s, z) => s + z.cs, 0);
const totalRetail = ZIPS.reduce((s, z) => s + z.rs, 0);

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

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</span>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-muted-foreground text-[10px] mt-1">{sub}</div>
    </div>
  );
}

export function FlipTrackerView() {
  return (
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
  );
}
