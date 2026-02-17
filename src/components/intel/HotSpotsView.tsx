import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

const COLORS = {
  primary: "hsl(var(--primary))",
  cyan: "#06B6D4",
  warning: "#F59E0B",
  accent: "#3B82F6",
  purple: "#8B5CF6",
  danger: "#EF4444",
};

const PRICE_MATRIX = [
  { range: "Under $50K", z68_c: 81, z68_r: 0, z91_c: 44, z91_r: 0, z53_c: 20, z53_r: 0, z52_c: 38, z52_r: 0, total_c: 233, total_r: 0 },
  { range: "$50-100K", z68_c: 58, z68_r: 0, z91_c: 23, z91_r: 0, z53_c: 29, z53_r: 0, z52_c: 17, z52_r: 5, total_c: 147, total_r: 42 },
  { range: "$100-150K", z68_c: 0, z68_r: 2, z91_c: 0, z91_r: 2, z53_c: 0, z53_r: 6, z52_c: 0, z52_r: 6, total_c: 18, total_r: 40 },
  { range: "$150-200K", z68_c: 0, z68_r: 1, z91_c: 0, z91_r: 3, z53_c: 0, z53_r: 1, z52_c: 0, z52_r: 2, total_c: 5, total_r: 28 },
  { range: "$200-300K", z68_c: 1, z68_r: 0, z91_c: 1, z91_r: 0, z53_c: 0, z53_r: 0, z52_c: 1, z52_r: 3, total_c: 3, total_r: 22 },
  { range: "$300K+", z68_c: 0, z68_r: 1, z91_c: 0, z91_r: 0, z53_c: 0, z53_r: 0, z52_c: 0, z52_r: 5, total_c: 0, total_r: 16 },
];

function HeatCell({ val, max }: { val: number; max: number }) {
  const pct = val / max;
  const colorClass = val === 0 ? "" : pct > 0.6 ? "bg-emerald-500/20" : pct > 0.3 ? "bg-cyan-500/20" : pct > 0.1 ? "bg-blue-500/20" : "bg-blue-500/10";
  return (
    <td className={cn("px-2 py-1.5 text-center text-[11px] rounded", colorClass, val > 0 ? "font-semibold text-foreground" : "text-muted-foreground")}>
      {val || "—"}
    </td>
  );
}

export function HotSpotsView() {
  return (
    <div className="space-y-3.5">
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
                  <th key={z} className="px-2.5 py-2 text-center text-emerald-500 text-[10px] font-bold">{z}</th>
                ))}
                <th className="px-2.5 py-2 text-center text-cyan-500 text-[10px] font-bold">TOTAL</th>
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
        <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">🏷️ Retail Buyer Heatmap <InfoTooltip text="Shows where retail buyers (non-investors) are purchasing by price range. Use this to identify the best exit market for flips." /></h3>
        <p className="text-[11px] text-muted-foreground mb-3">Retail transactions by price range — find your flip exit market</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px]" style={{ borderSpacing: 3 }}>
            <thead>
              <tr>
                <th className="px-2.5 py-2 text-left text-muted-foreground text-[10px]">PRICE RANGE</th>
                {["34668", "34691", "34653", "34652"].map((z) => (
                  <th key={z} className="px-2.5 py-2 text-center text-emerald-500 text-[10px] font-bold">{z}</th>
                ))}
                <th className="px-2.5 py-2 text-center text-amber-500 text-[10px] font-bold">TOTAL</th>
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
    </div>
  );
}
