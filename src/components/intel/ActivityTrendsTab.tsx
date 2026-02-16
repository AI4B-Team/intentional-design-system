import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, Line, Cell,
} from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = {
  primary: "#10B981",
  cyan: "#06B6D4",
  warning: "#F59E0B",
  danger: "#EF4444",
  accent: "#3B82F6",
  purple: "#8B5CF6",
};

const ZIPS = [
  { zip: "34668", name: "Port Richey", cs: 139, rs: 5, dom: 77, score: 98, psf: 62 },
  { zip: "34655", name: "New Port Richey", cs: 30, rs: 44, dom: 78, score: 82, psf: 118 },
  { zip: "34652", name: "Port Richey", cs: 55, rs: 18, dom: 104, score: 91, psf: 68 },
  { zip: "34691", name: "Holiday", cs: 67, rs: 6, dom: 66, score: 95, psf: 55 },
  { zip: "34667", name: "Hudson", cs: 32, rs: 34, dom: 99, score: 78, psf: 89 },
  { zip: "34653", name: "New Port Richey", cs: 49, rs: 7, dom: 57, score: 93, psf: 72 },
  { zip: "34690", name: "Holiday", cs: 38, rs: 3, dom: 91, score: 90, psf: 58 },
  { zip: "34654", name: "New Port Richey", cs: 12, rs: 15, dom: 129, score: 72, psf: 95 },
];

const TRENDS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((m, i) => ({
  month: m,
  medianPrice: Math.round(52000 + Math.sin(i / 3) * 8000 + i * 800),
  totalSales: Math.round(40 + Math.sin(i / 2) * 15 + i * 1.2),
  cashSales: Math.round(30 + Math.sin(i / 2) * 12 + i * 0.8),
  avgDOM: Math.round(85 - i * 1.5 + Math.sin(i) * 10),
  inventory: Math.round(180 + Math.cos(i / 2) * 40 - i * 3),
}));

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-muted-foreground text-[10px] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground text-[10px]">{p.name}: </span>
          <span className="text-foreground text-[10px] font-semibold">
            {typeof p.value === "number" && p.value > 999 ? `$${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ActivityTrendsTab() {
  const [subtab, setSubtab] = useState<"activity" | "trends">("activity");
  const ranked = useMemo(() => [...ZIPS].sort((a, b) => b.score - a.score), []);

  return (
    <div className="space-y-4">
      {/* Subtab Switcher */}
      <div className="flex gap-1.5 border-b border-border pb-2.5">
        {([
          { key: "activity" as const, label: "Activity Analysis", icon: Activity },
          { key: "trends" as const, label: "Trends", icon: TrendingUp },
        ]).map((t) => (
          <button key={t.key} onClick={() => setSubtab(t.key)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              subtab === t.key ? "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-600" : "text-muted-foreground hover:text-foreground")}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {subtab === "activity" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Cash vs Retail */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Cash vs Retail Activity by Zip Code</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ZIPS} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Legend iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="cs" name="Cash Sales" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                <Bar dataKey="rs" name="Retail Sales" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* DOM by Zip */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Days on Market by Zip</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ZIPS} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis dataKey="zip" type="category" width={50} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Bar dataKey="dom" name="Avg DOM" radius={[0, 4, 4, 0]}>
                  {ZIPS.map((z, i) => <Cell key={i} fill={z.dom < 80 ? COLORS.primary : z.dom < 100 ? COLORS.warning : COLORS.danger} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Price/SqFt */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Price per SqFt by Zip</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ZIPS}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Bar dataKey="psf" name="$/SqFt" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Ranking */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Investor Score Ranking</h3>
            {ranked.map((z, i) => (
              <div key={z.zip} className={cn("flex items-center gap-3.5 py-2", i < ranked.length - 1 && "border-b border-border")}>
                <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border",
                  i < 3 ? "bg-emerald-500/15 text-emerald-500 border-emerald-600" : "bg-muted text-muted-foreground border-border")}>{i + 1}</span>
                <span className="font-semibold text-[13px] w-14">{z.zip}</span>
                <span className="text-muted-foreground text-[11px] w-28">{z.name}</span>
                <div className="flex-1 h-[7px] rounded bg-muted overflow-hidden">
                  <div className="h-full rounded bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000" style={{ width: `${z.score}%` }} />
                </div>
                <span className="font-bold text-emerald-500 text-[13px] w-9 text-right">{z.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {subtab === "trends" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Median Price Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={TRENDS}>
                <defs><linearGradient id="pf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} /><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="medianPrice" name="Median Price" stroke={COLORS.primary} fill="url(#pf)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Sales Volume</h3>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={TRENDS}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Legend iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="totalSales" name="Total" fill={COLORS.accent} radius={[4, 4, 0, 0]} opacity={0.6} />
                <Line type="monotone" dataKey="cashSales" name="Cash" stroke={COLORS.cyan} strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">DOM Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={TRENDS}>
                <defs><linearGradient id="df" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.3} /><stop offset="95%" stopColor={COLORS.warning} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="avgDOM" name="Avg DOM" stroke={COLORS.warning} fill="url(#df)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Inventory Levels</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={TRENDS}>
                <defs><linearGradient id="ivf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3} /><stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="inventory" name="Listings" stroke={COLORS.purple} fill="url(#ivf)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
