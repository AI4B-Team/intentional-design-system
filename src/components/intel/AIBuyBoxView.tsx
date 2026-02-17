import React, { useState } from "react";
import {
  Brain, Zap, Target, Award, AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react";

const COLORS = {
  primary: "#10B981", cyan: "#06B6D4", warning: "#F59E0B",
  purple: "#8B5CF6",
};

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

export function AIBuyBoxView() {
  const med = 55112;

  return (
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
          { label: "Min Investor Activity", value: "61%+ in zip", color: COLORS.primary },
          { label: "Ideal Bed/Bath", value: "3/2 or 3/1" },
          { label: "Equity Threshold", value: "30%+ estimated", color: COLORS.primary },
        ]}
        insight="This market has an exceptional Wholesale Score of 94. Five zip codes show 75%+ investor ratios, with 34668 at 96.5% — indicating extremely active investor demand. The sub-$50K segment (233 sales) is the sweet spot. Focus on 34668 and 34691 for highest volume and fastest turns (66–77 DOM)."
        risk="Heavy competition in the sub-$100K segment. The 233 investor sales under $50K suggest a crowded wholesale market. Differentiate with speed-to-close and direct-to-seller marketing. Watch for thin margins in 34653 where prices have risen 4.2% QoQ."
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
  );
}
