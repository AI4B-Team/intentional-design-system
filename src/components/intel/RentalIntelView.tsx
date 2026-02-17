import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, AreaChart, Area, Cell,
} from "recharts";
import { Home, DollarSign, Percent, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

const COLORS = {
  primary: "#10B981", cyan: "#06B6D4", warning: "#F59E0B",
  danger: "#EF4444", accent: "#3B82F6", purple: "#8B5CF6",
};

const ZIPS = [
  { zip: "34668", mp: 44900, rent: 1150, cap: 8.2, rtp: 2.56, vac: 3.8 },
  { zip: "34691", mp: 41000, rent: 1050, cap: 8.8, rtp: 2.56, vac: 4.1 },
  { zip: "34690", mp: 49000, rent: 1100, cap: 8.1, rtp: 2.24, vac: 4.5 },
  { zip: "34653", mp: 57500, rent: 1200, cap: 7.9, rtp: 2.09, vac: 4.2 },
  { zip: "34652", mp: 45750, rent: 1100, cap: 7.6, rtp: 2.40, vac: 5.1 },
  { zip: "34667", mp: 100000, rent: 1300, cap: 6.4, rtp: 1.30, vac: 5.0 },
  { zip: "34655", mp: 135000, rent: 1450, cap: 5.8, rtp: 1.07, vac: 4.6 },
  { zip: "34654", mp: 105000, rent: 1350, cap: 5.5, rtp: 1.29, vac: 5.8 },
];

const RENT_TREND = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((m, i) => ({
  month: m, rent: Math.round(1140 + i * 8 + Math.sin(i / 2) * 30), cap: +(7.1 + Math.sin(i / 3) * 0.6 + i * 0.03).toFixed(1),
}));

const getGrade = (cf: number) => cf > 400 ? "A" : cf > 200 ? "B" : cf > 0 ? "C" : "D";
const gradeColor = (g: string) => g === "A" ? COLORS.primary : g === "B" ? COLORS.cyan : g === "C" ? COLORS.warning : COLORS.danger;

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-muted-foreground text-[10px] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground text-[10px]">{p.name}: </span>
          <span className="text-foreground text-[10px] font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function RentalIntelView() {
  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Avg Cap Rate", v: "7.4%", c: COLORS.primary, i: Percent },
          { l: "Avg Monthly Rent", v: "$1,210", c: COLORS.cyan, i: DollarSign },
          { l: "Vacancy Rate", v: "4.8%", c: COLORS.warning, i: Home },
          { l: "Rent-to-Price", v: "2.19%", c: COLORS.purple, i: TrendingUp },
        ].map((m, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3.5 text-center">
            <m.i size={18} style={{ color: m.c }} className="mx-auto mb-1.5" />
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.l}</div>
            <div className="text-xl font-bold" style={{ color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5 capitalize">Cap Rate by Zip Code <InfoTooltip text="Capitalization rate per zip. Higher cap rates indicate better rental returns relative to purchase price." /></h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ZIPS}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <RechartsTooltip content={<ChartTooltip />} />
              <Bar dataKey="cap" name="Cap Rate %" radius={[4, 4, 0, 0]}>
                {ZIPS.map((z, i) => <Cell key={i} fill={z.cap > 7.5 ? COLORS.primary : z.cap > 6 ? COLORS.cyan : COLORS.warning} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5 capitalize">Avg Rent Trend (12mo) <InfoTooltip text="How average monthly rents have changed over the past year. Rising rents improve cashflow projections." /></h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={RENT_TREND}>
              <defs><linearGradient id="rfRental" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} /><stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
              <RechartsTooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="rent" name="Avg Rent" stroke={COLORS.cyan} fill="url(#rfRental)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cashflow Table */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-1.5 capitalize">Cashflow Estimates by Zip <InfoTooltip text="Projected monthly cashflow after mortgage and expenses. Grade A = $400+/mo, B = $200+, C = $0+, D = negative cashflow." /></h3>
        <p className="text-[11px] text-muted-foreground mb-3">Based on 80% LTV @ 7.2% rate, 35% expense ratio</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                {["ZIP", "MEDIAN", "AVG RENT", "CAP RATE", "RENT/PRICE", "EST. MORTGAGE", "EST. CASHFLOW", "GRADE"].map((h, i) => (
                  <th key={i} className={cn("px-2.5 py-2 text-muted-foreground text-[10px] font-semibold", i === 0 ? "text-left" : "text-right")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ZIPS.map((z) => {
                const mort = Math.round(z.mp * 0.8 * 0.006);
                const exp = Math.round(z.rent * 0.35);
                const cf = z.rent - mort - exp;
                const g = getGrade(cf);
                return (
                  <tr key={z.zip} className="border-b border-border">
                    <td className="px-2.5 py-2 font-bold text-emerald-500">{z.zip}</td>
                    <td className="px-2.5 py-2 text-right">${z.mp.toLocaleString()}</td>
                    <td className="px-2.5 py-2 text-right text-cyan-500">${z.rent}</td>
                    <td className={cn("px-2.5 py-2 text-right", z.cap > 7 ? "text-emerald-500" : "text-muted-foreground")}>{z.cap}%</td>
                    <td className={cn("px-2.5 py-2 text-right", z.rtp > 2 ? "text-emerald-500" : "text-muted-foreground")}>{z.rtp}%</td>
                    <td className="px-2.5 py-2 text-right text-red-500">${mort}</td>
                    <td className={cn("px-2.5 py-2 text-right font-bold", cf > 0 ? "text-emerald-500" : "text-red-500")}>${cf > 0 ? "+" : ""}{cf}</td>
                    <td className="px-2.5 py-2 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: `${gradeColor(g)}15`, color: gradeColor(g) }}>{g}</span>
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
