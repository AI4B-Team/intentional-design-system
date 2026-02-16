import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, AreaChart, Area, Cell,
} from "recharts";
import {
  Home, DollarSign, Percent, TrendingUp, Brain, Zap,
  AlertTriangle, ChevronDown, ChevronUp, Target, Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface BuyBoxProps {
  title: string; icon: React.ElementType; color: string; strategy: string;
  details: { label: string; value: string; color?: string }[];
  insight: string; risk: string;
}

function BuyBoxCard({ title, icon: Icon, color, strategy, details, insight, risk }: BuyBoxProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        style={{ borderBottom: open ? "1px solid hsl(var(--border))" : "none" }}>
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg p-1.5 flex" style={{ background: `${color}15` }}><Icon size={18} style={{ color }} /></div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-foreground">{title}</h4>
            <p className="text-[11px] text-muted-foreground">{strategy}</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {details.map((d, i) => (
              <div key={i} className="bg-muted/50 rounded-lg px-3 py-2.5 border border-border">
                <div className="text-[10px] text-muted-foreground mb-0.5">{d.label}</div>
                <div className="text-[13px] font-semibold" style={{ color: d.color || "hsl(var(--foreground))" }}>{d.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
            <div className="flex items-center gap-1.5 mb-1"><Brain size={13} className="text-blue-500" /><span className="text-[11px] font-semibold text-blue-500">AI Insight</span></div>
            <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
            <div className="flex items-center gap-1.5 mb-1"><AlertTriangle size={13} className="text-amber-500" /><span className="text-[11px] font-semibold text-amber-500">Risk Assessment</span></div>
            <p className="text-xs text-muted-foreground leading-relaxed">{risk}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function RentalBuyBoxTab() {
  const [subtab, setSubtab] = useState<"rental" | "buybox">("rental");
  const med = 55112;

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 border-b border-border pb-2.5">
        {([
          { key: "rental" as const, label: "Rental Intel", icon: Home },
          { key: "buybox" as const, label: "AI Buy Box", icon: Brain },
        ]).map((t) => (
          <button key={t.key} onClick={() => setSubtab(t.key)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              subtab === t.key ? "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-600" : "text-muted-foreground hover:text-foreground")}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {subtab === "rental" && (
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
              <h3 className="text-sm font-bold text-foreground mb-3">Cap Rate by Zip Code</h3>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Avg Rent Trend (12mo)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={RENT_TREND}>
                  <defs><linearGradient id="rf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} /><stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="rent" name="Avg Rent" stroke={COLORS.cyan} fill="url(#rf)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cashflow Table */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-1">Cashflow Estimates by Zip</h3>
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
      )}

      {subtab === "buybox" && (
        <div className="space-y-3.5">
          <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl px-4 py-3 flex items-center gap-2.5">
            <Brain size={20} className="text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-blue-500">AI-Generated Buy Box Criteria</p>
              <p className="text-[11px] text-muted-foreground">Automatically calculated from Port Richey market data · Median: ${med.toLocaleString()} · 554 transactions · 76.2% cash</p>
            </div>
          </div>

          <BuyBoxCard title="Wholesale Buy Box" icon={Zap} color={COLORS.primary}
            strategy="Target distressed properties in high cash-buyer zip codes for assignment"
            details={[
              { label: "Target Price Range", value: `$${Math.round(med * 0.4).toLocaleString()} – $${Math.round(med * 0.85).toLocaleString()}`, color: COLORS.primary },
              { label: "Max Offer (% of ARV)", value: "55–65% of ARV", color: COLORS.warning },
              { label: "Assignment Fee Target", value: `$${Math.round(med * 0.08).toLocaleString()} – $${Math.round(med * 0.15).toLocaleString()}` },
              { label: "Target Zips (Cash >70%)", value: "34668, 34691, 34690, 34653, 34652", color: COLORS.cyan },
              { label: "Property Types", value: "SFH, Townhomes, Small Multi" },
              { label: "Condition", value: "Distressed, Needs Rehab, Vacant" },
              { label: "Max DOM for Comps", value: "83 days" },
              { label: "Min Cash Buyer Activity", value: "61%+ in zip", color: COLORS.primary },
              { label: "Ideal Bed/Bath", value: "3/2 or 3/1" },
              { label: "Equity Threshold", value: "30%+ estimated", color: COLORS.primary },
            ]}
            insight="This market has an exceptional Wholesale Score of 94. Five zip codes show 75%+ cash buyer ratios, with 34668 at 96.5% — indicating extremely active investor demand. The sub-$50K segment (233 sales) is the sweet spot. Focus on 34668 and 34691 for highest volume and fastest turns (66–77 DOM)."
            risk="Heavy competition in the sub-$100K segment. The 233 cash sales under $50K suggest a crowded wholesale market. Differentiate with speed-to-close and direct-to-seller marketing. Watch for thin margins in 34653 where prices have risen 4.2% QoQ."
          />

          <BuyBoxCard title="Fix & Flip Buy Box" icon={Target} color={COLORS.warning}
            strategy="Purchase undervalued properties in areas with strong retail activity for rehab and resale"
            details={[
              { label: "Target ARV", value: `$${Math.round(med * 1.2).toLocaleString()} – $${Math.round(med * 2.5).toLocaleString()}`, color: COLORS.warning },
              { label: "Max Purchase (% of ARV)", value: "65–70% of ARV" },
              { label: "Max Rehab Budget", value: `$${Math.round(med * 0.25).toLocaleString()} – $${Math.round(med * 0.40).toLocaleString()}` },
              { label: "Target Profit Margin", value: "15–20% net", color: COLORS.primary },
              { label: "Best Zips (Retail >10 sales)", value: "34655, 34667, 34652, 34654", color: COLORS.cyan },
              { label: "Property Types", value: "SFH 3/2+, 1200+ sqft" },
              { label: "Max Hold Time", value: "125 days (incl. rehab)" },
              { label: "Target Resale DOM", value: "< 83 days" },
              { label: "Neighborhood Grade", value: "B to B+ (appreciating)" },
              { label: "Avg $/SqFt (resale comps)", value: "$62 – $118" },
            ]}
            insight="Flip Score of 61 indicates moderate opportunity. Best flip zips are 34655 (44 retail sales, $135K median) and 34667 (34 retail, $100K median). The price gap between cash entry points ($45–55K) and retail resale ($100–135K) creates strong margin potential in these areas."
            risk="DOM averaging 83 days means holding costs are significant. Budget 4–5 months total hold time. In 34654 (129 DOM), flips carry elevated carrying risk. Focus on 34691 (66 DOM) and 34653 (57 DOM) for faster turns."
          />

          <BuyBoxCard title="Buy & Hold Buy Box" icon={Award} color={COLORS.purple}
            strategy="Acquire rental properties in high cap-rate areas for long-term cashflow"
            details={[
              { label: "Purchase Price Range", value: `$${Math.round(med * 0.7).toLocaleString()} – $${Math.round(med * 1.3).toLocaleString()}`, color: COLORS.purple },
              { label: "Min Cap Rate", value: `${(7.4 * 0.85).toFixed(1)}% (85% of market avg)`, color: COLORS.primary },
              { label: "Target Monthly Rent", value: `$${Math.round(1210 * 0.9).toLocaleString()} – $${Math.round(1210 * 1.2).toLocaleString()}` },
              { label: "Min Cash-on-Cash Return", value: "8%+", color: COLORS.primary },
              { label: "Target Zips (Cap >7%)", value: "34668, 34691, 34690, 34653, 34652", color: COLORS.cyan },
              { label: "Property Types", value: "SFH, Duplex, Small Multi" },
              { label: "Rent-to-Price Ratio", value: "2.19% (target >1%)", color: COLORS.primary },
              { label: "Max Vacancy Tolerance", value: "6.8%" },
              { label: "Preferred Bed/Bath", value: "3/2" },
              { label: "Neighborhood Class", value: "B-class, stable employment" },
            ]}
            insight="Rental Score of 78 is strong. Five zips show cap rates above 7%, with 34691 leading at 8.8%. The rent-to-price ratio of 2.19% is well above the 1% threshold. At the market median of $55K, projected cashflow is +$363/mo after expenses — an A-grade return. Vacancy at 4.8% is healthy."
            risk="Low-priced rentals ($41–49K) may require higher maintenance budgets. Screen tenants carefully in high cash-buyer areas (34668, 34691) where turnover can be faster. Consider budgeting 40% for expenses instead of 35% on sub-$50K properties."
          />
        </div>
      )}
    </div>
  );
}
