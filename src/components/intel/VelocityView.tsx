import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ComposedChart, Line, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

const COLORS = {
  primary: "hsl(var(--primary))",
  cyan: "#06B6D4",
  warning: "#F59E0B",
  accent: "#3B82F6",
  danger: "#EF4444",
};

const ZIPS = [
  { zip: "34668", absRate: 18.0, listToSale: 0.92 },
  { zip: "34691", absRate: 9.1, listToSale: 0.95 },
  { zip: "34653", absRate: 7.0, listToSale: 0.93 },
  { zip: "34652", absRate: 9.1, listToSale: 0.88 },
  { zip: "34690", absRate: 5.1, listToSale: 0.92 },
  { zip: "34655", absRate: 9.3, listToSale: 0.95 },
  { zip: "34667", absRate: 8.3, listToSale: 0.95 },
  { zip: "34654", absRate: 3.4, listToSale: 0.94 },
];

const VELOCITY = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((m, i) => ({
  month: m,
  cashTx: Math.round(30 + Math.sin(i / 2) * 12 + i * 0.8),
  retailTx: Math.round(8 + Math.sin(i / 1.5) * 4 + i * 0.5),
  avgOffer: Math.round(48000 + i * 600 + Math.sin(i / 2) * 3000),
}));

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

export function VelocityView() {
  return (
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
                <linearGradient id="offerGradVel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="avgOffer" name="Avg Offer $" stroke={COLORS.primary} fill="url(#offerGradVel)" strokeWidth={2} />
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
  );
}
