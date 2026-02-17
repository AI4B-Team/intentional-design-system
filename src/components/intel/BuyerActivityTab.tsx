import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users, DollarSign, ArrowUpRight, ArrowDownRight,
  Repeat, Home,
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

export function BuyerActivityTab({ children }: { children?: React.ReactNode }) {
  const totalCash = ZIPS.reduce((s, z) => s + z.cs, 0);
  const totalRetail = ZIPS.reduce((s, z) => s + z.rs, 0);
  const totalFlips = ZIPS.reduce((s, z) => s + z.flips, 0);
  const totalLandlords = totalCash - totalFlips;
  const totalAll = totalCash + totalRetail;

  return (
    <div className="space-y-4">

      <div className="space-y-3.5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Transactions" value={totalAll} sub={`${totalCash} investor + ${totalRetail} retail`} icon={DollarSign} color={COLORS.cyan} change={4.2} />
            <StatCard label="Flippers" value={`${totalFlips} deals`} sub="Sold 2x in 12 months" icon={Repeat} color={COLORS.purple} change={12.5} />
            <StatCard label="Landlords" value={totalLandlords} sub={`${((totalLandlords / totalAll) * 100).toFixed(1)}% of market`} icon={Home} color={COLORS.primary} change={3.1} />
            <StatCard label="Retail" value={totalRetail} sub={`${((totalRetail / totalAll) * 100).toFixed(1)}% of market`} icon={Users} color={COLORS.warning} change={1.8} />
          </div>

          {children}
        </div>
    </div>
  );
}
