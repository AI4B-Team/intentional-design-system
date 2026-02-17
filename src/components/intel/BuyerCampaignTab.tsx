import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  Check, Rocket, Mail, MessageSquare, Phone, Zap, Users, DollarSign,
  Home, TrendingUp, Sparkles, Eye, Filter, ChevronDown, ChevronUp,
  Target, Shield, Brain, Send, MapPin, Building, ArrowRight, Repeat,
  AlertTriangle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Data ───
const ZIPS = [
  { zip: "34668", name: "Port Richey", ts: 144, cs: 139, rs: 5, mp: 44900, dom: 77, cr: 96.5, score: 98, cashAvgPaid: 38200, retailAvgPaid: 127500, landlordSales: 52, flipperSales: 87, wholesalerEst: 31, leads: 312, domCash: 54, domRetail: 122, priceSweet: "Under $50K", topRange: "$20K-$50K", listToSale: 0.92, absRate: 18.0 },
  { zip: "34691", name: "Holiday", ts: 73, cs: 67, rs: 6, mp: 41000, dom: 66, cr: 91.8, score: 95, cashAvgPaid: 35800, retailAvgPaid: 118000, landlordSales: 28, flipperSales: 39, wholesalerEst: 18, leads: 189, domCash: 42, domRetail: 105, priceSweet: "Under $50K", topRange: "$25K-$48K", listToSale: 0.95, absRate: 9.1 },
  { zip: "34653", name: "New Port Richey", ts: 56, cs: 49, rs: 7, mp: 57500, dom: 57, cr: 87.5, score: 93, cashAvgPaid: 48200, retailAvgPaid: 142000, landlordSales: 22, flipperSales: 27, wholesalerEst: 14, leads: 156, domCash: 38, domRetail: 89, priceSweet: "$40K-$70K", topRange: "$35K-$65K", listToSale: 0.93, absRate: 7.0 },
  { zip: "34652", name: "Port Richey", ts: 73, cs: 55, rs: 18, mp: 45750, dom: 104, cr: 75.3, score: 91, cashAvgPaid: 39400, retailAvgPaid: 135000, landlordSales: 24, flipperSales: 31, wholesalerEst: 12, leads: 201, domCash: 72, domRetail: 134, priceSweet: "Under $50K", topRange: "$22K-$52K", listToSale: 0.88, absRate: 9.1 },
  { zip: "34690", name: "Holiday", ts: 41, cs: 38, rs: 3, mp: 49000, dom: 91, cr: 92.7, score: 90, cashAvgPaid: 42100, retailAvgPaid: 131000, landlordSales: 18, flipperSales: 20, wholesalerEst: 8, leads: 134, domCash: 61, domRetail: 148, priceSweet: "$30K-$55K", topRange: "$28K-$54K", listToSale: 0.92, absRate: 5.1 },
  { zip: "34655", name: "New Port Richey", ts: 74, cs: 30, rs: 44, mp: 135000, dom: 78, cr: 40.5, score: 82, cashAvgPaid: 112000, retailAvgPaid: 148000, landlordSales: 8, flipperSales: 22, wholesalerEst: 6, leads: 247, domCash: 52, domRetail: 96, priceSweet: "$100K-$180K", topRange: "$90K-$150K", listToSale: 0.95, absRate: 9.3 },
  { zip: "34667", name: "Hudson", ts: 66, cs: 32, rs: 34, mp: 100000, dom: 99, cr: 48.5, score: 78, cashAvgPaid: 82000, retailAvgPaid: 128000, landlordSales: 10, flipperSales: 22, wholesalerEst: 9, leads: 218, domCash: 64, domRetail: 118, priceSweet: "$60K-$120K", topRange: "$55K-$110K", listToSale: 0.95, absRate: 8.3 },
  { zip: "34654", name: "New Port Richey", ts: 27, cs: 12, rs: 15, mp: 105000, dom: 129, cr: 44.4, score: 72, cashAvgPaid: 88000, retailAvgPaid: 138000, landlordSales: 4, flipperSales: 8, wholesalerEst: 3, leads: 98, domCash: 88, domRetail: 156, priceSweet: "$80K-$130K", topRange: "$70K-$115K", listToSale: 0.94, absRate: 3.4 },
];

const CHANNELS = [
  { id: "all", label: "All Channels", desc: "Email + SMS + Call", icon: Zap, color: "emerald" },
  { id: "email", label: "Email", desc: "Cold outreach", icon: Mail, color: "blue" },
  { id: "sms", label: "SMS", desc: "Text blast", icon: MessageSquare, color: "cyan" },
  { id: "call", label: "Cold Call", desc: "Dialer", icon: Phone, color: "amber" },
];

const LEAD_FILTERS = ["All Distressed", "Pre-Foreclosure", "Absentee Owners", "High Equity 30%+", "Vacant Properties", "Tax Delinquent", "Probate", "Code Violations"];

const COLORS = {
  primary: "hsl(var(--primary))",
  cyan: "#06B6D4",
  warning: "#F59E0B",
  accent: "#3B82F6",
  purple: "#8B5CF6",
  danger: "#EF4444",
};

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
            {typeof p.value === "number" && p.value > 999 ? `$${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BuyerCampaignTab() {
  const [sel, setSel] = useState<string[]>([]);
  const [buyerType, setBuyerType] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [step, setStep] = useState(1);
  const [offerMode, setOfferMode] = useState("buyer_avg");
  const [pctOfAvg, setPctOfAvg] = useState(85);
  const [ch, setCh] = useState("all");
  const [filt, setFilt] = useState("All Distressed");
  const [campName, setCampName] = useState("Port Richey - Buyer Data Campaign");
  const [offerStrategy, setOfferStrategy] = useState("ai_buy_box");
  const [maxOfferPrice, setMaxOfferPrice] = useState("");

  const tog = (z: string) => setSel((p) => p.includes(z) ? p.filter((x) => x !== z) : [...p, z]);

  const sortedZips = useMemo(() => {
    const mapped = [...ZIPS].map((z) => {
      let activityCount = 0;
      if (buyerType === "cash") activityCount = z.cs;
      else if (buyerType === "landlord") activityCount = z.landlordSales;
      else if (buyerType === "flipper") activityCount = z.flipperSales;
      else activityCount = z.ts;
      return { ...z, activityCount };
    });
    if (sortBy === "activity") return mapped.sort((a, b) => b.activityCount - a.activityCount);
    if (sortBy === "score") return mapped.sort((a, b) => b.score - a.score);
    if (sortBy === "cashpaid") return mapped.sort((a, b) => a.cashAvgPaid - b.cashAvgPaid);
    if (sortBy === "dom") return mapped.sort((a, b) => a.domCash - b.domCash);
    return mapped;
  }, [buyerType, sortBy]);

  const selZips = ZIPS.filter((z) => sel.includes(z.zip));
  const totalLeads = selZips.reduce((s, z) => s + z.leads, 0);
  const avgCashPaid = selZips.length ? Math.round(selZips.reduce((s, z) => s + z.cashAvgPaid, 0) / selZips.length) : 0;
  const suggestedOffer = offerMode === "buyer_avg" ? Math.round(avgCashPaid * (pctOfAvg / 100)) : offerMode === "pct_arv" ? Math.round(avgCashPaid * 0.65) : avgCashPaid;

  const autoSelectTop = () => setSel(sortedZips.filter((z) => z.score >= 85).map((z) => z.zip));

  return (
    <div className="space-y-4">
      {/* Step Indicator */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { n: 1, label: "Select Zips", icon: MapPin },
          { n: 2, label: "Set Offers", icon: DollarSign },
          { n: 3, label: "Launch Campaign", icon: Rocket },
        ].map((s) => (
          <button key={s.n} onClick={() => setStep(s.n)}
            className={cn("flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-colors",
              step === s.n ? "border-emerald-500 bg-emerald-500/10" : step > s.n ? "border-emerald-700 bg-emerald-500/5" : "border-border bg-transparent")}>
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
              step >= s.n ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground")}>
              {step > s.n ? <Check size={12} /> : s.n}
            </div>
            <s.icon size={14} className={cn(step === s.n ? "text-emerald-500" : step > s.n ? "text-emerald-700" : "text-muted-foreground")} />
            <span className={cn("text-xs font-semibold", step === s.n ? "text-emerald-500" : step > s.n ? "text-emerald-700" : "text-muted-foreground")}>{s.label}</span>
            {s.n === 1 && sel.length > 0 && (
              <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">{sel.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ STEP 1: SELECT ZIPS ═══ */}
      {step === 1 && (
        <div className="space-y-3.5">
          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-0.5 bg-card border border-border rounded-lg p-0.5">
              {[
                { id: "all", label: "All Buyers", icon: Users },
                { id: "cash", label: "Investors", icon: DollarSign },
                { id: "landlord", label: "Landlords", icon: Building },
                { id: "flipper", label: "Flippers", icon: Repeat },
              ].map((t) => (
                <button key={t.id} onClick={() => setBuyerType(t.id)}
                  className={cn("flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors",
                    buyerType === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                  <t.icon size={12} />{t.label}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="bg-card border border-border rounded-lg text-muted-foreground text-[11px] px-2.5 py-1.5">
              <option value="score">Sort: Investor Score</option>
              <option value="activity">Sort: Activity Count</option>
              <option value="cashpaid">Sort: Lowest Avg Paid</option>
              <option value="dom">Sort: Fastest DOM</option>
            </select>
            <button onClick={autoSelectTop}
              className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-700 rounded-lg px-3 py-1.5 text-emerald-500 text-[11px] font-semibold hover:bg-emerald-500/20 transition-colors">
              <Sparkles size={12} />Auto-Select 85+
            </button>
            {sel.length > 0 && (
              <button onClick={() => setSel([])}
                className="border border-border rounded-lg px-3 py-1.5 text-muted-foreground text-[11px] hover:text-foreground transition-colors">
                Clear All
              </button>
            )}
          </div>

          {/* Zip Table */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-border">
                    {["", "ZIP", "AREA",
                      buyerType === "all" ? "TOTAL" : buyerType === "cash" ? "INVESTOR" : buyerType === "landlord" ? "LANDLORD" : "FLIPPER",
                      "INVESTOR %", "AVG INVESTOR PAID", "AVG RETAIL PAID", "INVESTOR DOM", "SWEET SPOT", "SCORE"
                    ].map((h, i) => (
                      <th key={i} className={cn("px-2.5 py-2.5 text-muted-foreground text-[10px] font-semibold whitespace-nowrap",
                        i < 3 ? "text-left" : i === 9 ? "text-center" : "text-right")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedZips.map((z) => {
                    const s = sel.includes(z.zip);
                    return (
                      <tr key={z.zip} onClick={() => tog(z.zip)}
                        className={cn("border-b border-border cursor-pointer transition-colors",
                          s ? "bg-emerald-500/10" : "hover:bg-muted/50")}>
                        <td className="px-2.5 py-2.5">
                          <div className={cn("w-[18px] h-[18px] rounded flex items-center justify-center border-2",
                            s ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/40")}>
                            {s && <Check size={11} className="text-white" />}
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 font-bold text-emerald-500">{z.zip}</td>
                        <td className="px-2.5 py-2.5 text-muted-foreground">{z.name}</td>
                        <td className={cn("px-2.5 py-2.5 text-right font-bold text-sm",
                          buyerType === "cash" ? "text-cyan-500" : buyerType === "landlord" ? "text-purple-500" : buyerType === "flipper" ? "text-amber-500" : "text-foreground")}>
                          {z.activityCount}
                        </td>
                        <td className="px-2.5 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-9 h-[5px] rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full" style={{
                                width: `${z.cr}%`,
                                background: z.cr > 80 ? COLORS.primary : z.cr > 50 ? COLORS.warning : COLORS.danger,
                              }} />
                            </div>
                            <span className={cn("font-semibold text-[11px]",
                              z.cr > 80 ? "text-emerald-500" : z.cr > 50 ? "text-amber-500" : "text-red-500")}>{z.cr}%</span>
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 text-right font-bold text-cyan-500">${z.cashAvgPaid.toLocaleString()}</td>
                        <td className="px-2.5 py-2.5 text-right text-amber-500">${z.retailAvgPaid.toLocaleString()}</td>
                        <td className={cn("px-2.5 py-2.5 text-right", z.domCash < 60 ? "text-emerald-500" : z.domCash < 80 ? "text-cyan-500" : "text-amber-500")}>{z.domCash}d</td>
                        <td className="px-2.5 py-2.5 text-right text-muted-foreground text-[11px]">{z.priceSweet}</td>
                        <td className="px-2.5 py-2.5 text-center">
                          <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold",
                            z.score >= 90 ? "bg-emerald-500/15 text-emerald-500" : z.score >= 75 ? "bg-amber-500/15 text-amber-500" : "bg-red-500/15 text-red-500")}>{z.score}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">What Investors Are Paying <InfoTooltip text="Average price that investors actually paid in each zip. Use this to calibrate your offer prices to be competitive." /></h3>
              <p className="text-[11px] text-muted-foreground mb-3">Average acquisition price by zip</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[...ZIPS].sort((a, b) => a.cashAvgPaid - b.cashAvgPaid)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="cashAvgPaid" name="Avg Investor Price" radius={[4, 4, 0, 0]}>
                    {[...ZIPS].sort((a, b) => a.cashAvgPaid - b.cashAvgPaid).map((z, i) => (
                      <Cell key={i} fill={sel.includes(z.zip) ? COLORS.cyan : "#334155"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Investor vs Retail Price Gap <InfoTooltip text="The difference between investor and retail buyer prices. A larger spread means more margin opportunity for wholesalers and flippers." /></h3>
              <p className="text-[11px] text-muted-foreground mb-3">The spread = your margin opportunity</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ZIPS} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="cashAvgPaid" name="Investor Avg" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="retailAvgPaid" name="Retail Avg" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Selected Summary */}
          {sel.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-700 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-5">
                <div><div className="text-[10px] text-muted-foreground">Selected Zips</div><div className="text-xl font-bold text-emerald-500">{sel.length}</div></div>
                <div><div className="text-[10px] text-muted-foreground">Est. Leads</div><div className="text-xl font-bold text-cyan-500">~{totalLeads.toLocaleString()}</div></div>
                <div><div className="text-[10px] text-muted-foreground">Avg Investor Paid</div><div className="text-xl font-bold text-amber-500">${avgCashPaid.toLocaleString()}</div></div>
              </div>
              <Button onClick={() => setStep(2)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2">
                Set Offer Prices <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ═══ STEP 2: OFFER PRICING ═══ */}
      {step === 2 && (
        <div className="space-y-3.5">
          {/* Offer Mode */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-[15px] font-bold text-foreground mb-0.5 capitalize">How Do You Want to Price Your Offers?</h3>
            <p className="text-xs text-muted-foreground mb-3">We'll auto-calculate based on real buyer data from your selected zips</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                { id: "buyer_avg", title: "Based on Buyer Activity", desc: "Offer a % of what investors are actually paying", icon: Users, colorClass: "cyan", rec: true },
                { id: "pct_arv", title: "% of ARV", desc: "Classic wholesale formula — 55-70% of after-repair value", icon: Target, colorClass: "amber" },
                { id: "buybox", title: "AI Buy Box Match", desc: "Use AI buy box criteria to auto-price each zip", icon: Brain, colorClass: "purple" },
              ].map((m) => (
                <div key={m.id} onClick={() => setOfferMode(m.id)}
                  className={cn("relative p-4 rounded-xl cursor-pointer border transition-colors",
                    offerMode === m.id ? `border-${m.colorClass}-500 bg-${m.colorClass}-500/10` : "border-border hover:border-muted-foreground/40")}>
                  {m.rec && <span className="absolute top-2 right-2 bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-full text-[9px] font-semibold">Recommended</span>}
                  <m.icon size={20} className={cn("mb-2", offerMode === m.id ? `text-${m.colorClass}-500` : "text-muted-foreground")} />
                  <div className={cn("text-[13px] font-bold mb-1", offerMode === m.id ? `text-${m.colorClass}-500` : "text-foreground")}>{m.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Slider */}
          {offerMode === "buyer_avg" && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[15px] font-bold text-foreground mb-0.5 capitalize">Offer as % of Avg Investor Price</h3>
              <p className="text-xs text-muted-foreground mb-3">Adjust how aggressive your offers are</p>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-[11px] text-muted-foreground">More Aggressive</span>
                <input type="range" min={60} max={100} value={pctOfAvg} onChange={(e) => setPctOfAvg(Number(e.target.value))}
                  className="flex-1 accent-emerald-500" />
                <span className="text-[11px] text-muted-foreground">Market Rate</span>
              </div>
              <div className="text-center mb-2">
                <span className={cn("text-3xl font-bold",
                  pctOfAvg < 75 ? "text-emerald-500" : pctOfAvg < 90 ? "text-cyan-500" : "text-amber-500")}>{pctOfAvg}%</span>
                <span className="text-sm text-muted-foreground ml-2">of avg investor price</span>
              </div>
              <div className="flex justify-center gap-3 text-[11px] text-muted-foreground">
                <span>60-74% = Deep discount</span>
                <span>75-89% = Competitive</span>
                <span>90-100% = Match market</span>
              </div>
            </div>
          )}

          {/* Per-Zip Offers */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-[15px] font-bold text-foreground mb-0.5 capitalize">Offer Price by Zip Code</h3>
            <p className="text-xs text-muted-foreground mb-3">Auto-calculated based on actual buyer data</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-border">
                    {["ZIP", "AREA", "INVESTORS PAY", "YOUR OFFER", "SAVINGS VS MARKET", "SWEET SPOT RANGE", "INVESTOR DOM"].map((h, i) => (
                      <th key={i} className={cn("px-2.5 py-2 text-muted-foreground text-[10px] font-semibold", i < 2 ? "text-left" : "text-right")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selZips.map((z) => {
                    const offer = offerMode === "buyer_avg" ? Math.round(z.cashAvgPaid * (pctOfAvg / 100)) : offerMode === "pct_arv" ? Math.round(z.retailAvgPaid * 0.65) : Math.round(z.cashAvgPaid * 0.80);
                    const savings = z.cashAvgPaid - offer;
                    const pctSave = ((savings / z.cashAvgPaid) * 100).toFixed(0);
                    return (
                      <tr key={z.zip} className="border-b border-border">
                        <td className="px-2.5 py-2.5 font-bold text-emerald-500">{z.zip}</td>
                        <td className="px-2.5 py-2.5 text-muted-foreground">{z.name}</td>
                        <td className="px-2.5 py-2.5 text-right text-cyan-500 font-semibold">${z.cashAvgPaid.toLocaleString()}</td>
                        <td className="px-2.5 py-2.5 text-right">
                          <span className="bg-emerald-500/15 text-emerald-500 px-2.5 py-1 rounded-lg font-bold text-[13px]">${offer.toLocaleString()}</span>
                        </td>
                        <td className="px-2.5 py-2.5 text-right text-emerald-500 font-semibold">${savings.toLocaleString()} ({pctSave}%)</td>
                        <td className="px-2.5 py-2.5 text-right text-muted-foreground text-[11px]">{z.topRange}</td>
                        <td className={cn("px-2.5 py-2.5 text-right", z.domCash < 60 ? "text-emerald-500" : "text-cyan-500")}>{z.domCash}d</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><Brain size={16} className="text-blue-500" /><span className="text-[13px] font-bold text-blue-500">AI Offer Insight</span></div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {offerMode === "buyer_avg"
                ? `At ${pctOfAvg}% of average investor price, your offers will be ${pctOfAvg < 80 ? "significantly below" : "near"} market. Investors in your selected ${sel.length} zips are paying an average of $${avgCashPaid.toLocaleString()}. Your suggested max offer of $${suggestedOffer.toLocaleString()} gives you ${pctOfAvg < 80 ? "strong margin for wholesale assignments" : "room for buy-and-hold or light rehab plays"}.`
                : offerMode === "pct_arv"
                ? "Using 65% of ARV formula across selected zips. This works best in areas with strong retail comps (34655, 34667). Verify ARV with recent retail sales before sending offers."
                : "AI Buy Box is targeting distressed properties with 30%+ equity in high investor concentration zips. Offers calibrated to 80% of investor average."}
            </p>
          </div>

          {/* Nav */}
          <div className="flex gap-2.5">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back to Zip Selection</Button>
            <Button onClick={() => setStep(3)} className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2">
              Configure Campaign <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: LAUNCH ═══ */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Left: Summary */}
          <div className="space-y-3.5">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[15px] font-bold text-foreground mb-3 capitalize">Campaign Targets</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted rounded-lg p-2.5"><div className="text-[10px] text-muted-foreground">Zips</div><div className="text-sm font-bold text-emerald-500">{sel.join(", ")}</div></div>
                <div className="bg-muted rounded-lg p-2.5"><div className="text-[10px] text-muted-foreground">Est. Leads</div><div className="text-sm font-bold text-cyan-500">~{totalLeads.toLocaleString()}</div></div>
                <div className="bg-muted rounded-lg p-2.5"><div className="text-[10px] text-muted-foreground">Offer Strategy</div><div className="text-[13px] font-semibold text-foreground">{offerMode === "buyer_avg" ? `${pctOfAvg}% of Buyer Avg` : offerMode === "pct_arv" ? "65% of ARV" : "AI Buy Box"}</div></div>
                <div className="bg-muted rounded-lg p-2.5"><div className="text-[10px] text-muted-foreground">Avg Offer</div><div className="text-sm font-bold text-emerald-500">${suggestedOffer.toLocaleString()}</div></div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[15px] font-bold text-foreground mb-3 capitalize">Per-Zip Offer Prices</h3>
              {selZips.map((z) => {
                const offer = offerMode === "buyer_avg" ? Math.round(z.cashAvgPaid * (pctOfAvg / 100)) : offerMode === "pct_arv" ? Math.round(z.retailAvgPaid * 0.65) : Math.round(z.cashAvgPaid * 0.80);
                return (
                  <div key={z.zip} className="flex items-center justify-between py-2 border-b border-border">
                    <div><span className="font-bold text-emerald-500 mr-2">{z.zip}</span><span className="text-[11px] text-muted-foreground">{z.name}</span></div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground">Buyers pay ${z.cashAvgPaid.toLocaleString()}</span>
                      <ArrowRight size={12} className="text-muted-foreground" />
                      <span className="font-bold text-emerald-500">${offer.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Config */}
          <div className="space-y-3.5">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[15px] font-bold text-foreground mb-3 flex items-center gap-1.5 capitalize">Campaign Type <InfoTooltip text="Choose how to reach leads. Multi-channel (All) typically gets the highest response rates." /></h3>
              <div className="grid grid-cols-2 gap-2">
                {CHANNELS.map((c) => {
                  const colorMap: Record<string, string> = { emerald: "#10B981", blue: "#3B82F6", cyan: "#06B6D4", amber: "#F59E0B" };
                  const hex = colorMap[c.color] || "#10B981";
                  return (
                    <div key={c.id} onClick={() => setCh(c.id)}
                      className={cn("px-3.5 py-3 rounded-lg cursor-pointer border transition-all",
                        ch === c.id ? "border-current" : "border-border hover:border-muted-foreground/30")}
                      style={ch === c.id ? { borderColor: hex, background: `${hex}10` } : {}}>
                      <div className="flex items-center gap-2 mb-1">
                        <c.icon size={16} style={{ color: ch === c.id ? hex : "hsl(var(--muted-foreground))" }} />
                        <span className="text-xs font-semibold" style={{ color: ch === c.id ? hex : "hsl(var(--muted-foreground))" }}>{c.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{c.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[15px] font-bold text-foreground mb-3 capitalize">Configuration</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Campaign Name</label>
                  <Input value={campName} onChange={(e) => setCampName(e.target.value)} className="text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Offer Strategy</label>
                    <select value={offerStrategy} onChange={(e) => setOfferStrategy(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-xs">
                      <option value="ai_buy_box">AI Buy Box Criteria</option>
                      <option value="pct_arv">% of ARV</option>
                      <option value="pct_median">% of Median</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Lead Filters</label>
                    <select value={filt} onChange={(e) => setFilt(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-xs">
                      {LEAD_FILTERS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                {(offerStrategy === "pct_median" || offerStrategy === "fixed") && (
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">
                      Max Offer Price {offerStrategy === "pct_median" ? "(auto: 65% of median)" : ""}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                      <Input
                        type="number"
                        value={maxOfferPrice || (offerStrategy === "pct_median" ? Math.round(avgCashPaid * 0.65) : "")}
                        onChange={(e) => setMaxOfferPrice(e.target.value)}
                        className="text-sm pl-7"
                        placeholder="Enter max price"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2.5"><Sparkles size={14} className="text-blue-500" /><h3 className="text-[15px] font-bold text-foreground capitalize">AI Message</h3></div>
              <div className="bg-muted rounded-lg p-3.5 text-xs text-muted-foreground leading-relaxed">
                Hi {"{{first_name}}"},<br /><br />
                I'm a local investor buying homes in {"{{city}}"} and noticed your property at {"{{property_address}}"}. I can make a <span className="text-emerald-500 font-semibold">cash offer up to ${suggestedOffer.toLocaleString()}</span> based on current market activity in your area.<br /><br />
                I buy as-is — no repairs, no commissions, quick close. Would you consider selling?
              </div>
              <div className="flex gap-1 mt-2">
                {["{{first_name}}", "{{property_address}}", "{{city}}", "{{offer_price}}"].map((t) => (
                  <span key={t} className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full text-[9px]">{t}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 shadow-lg">
                <Rocket size={18} /> Launch Campaign To ~{totalLeads.toLocaleString()} Leads
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
