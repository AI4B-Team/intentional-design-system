import { useState, useMemo } from "react";
import {
  Check, Rocket, Mail, MessageSquare, Phone, Zap,
  Users, DollarSign, MapPin, ArrowRight, Sparkles,
  Target, Brain, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuyerActivityTab } from "./BuyerActivityTab";

// ─── Campaign Data ───
const ZIPS = [
  { zip: "34668", name: "Port Richey", cs: 139, score: 98, leads: 312, cr: 96.5, cashAvgPaid: 38200, retailAvgPaid: 127500, domCash: 54, topRange: "$20K-$50K" },
  { zip: "34691", name: "Holiday", cs: 67, score: 95, leads: 189, cr: 91.8, cashAvgPaid: 35800, retailAvgPaid: 118000, domCash: 42, topRange: "$25K-$48K" },
  { zip: "34653", name: "New Port Richey", cs: 49, score: 93, leads: 156, cr: 87.5, cashAvgPaid: 48200, retailAvgPaid: 142000, domCash: 38, topRange: "$35K-$65K" },
  { zip: "34652", name: "Port Richey", cs: 55, score: 91, leads: 201, cr: 75.3, cashAvgPaid: 39400, retailAvgPaid: 135000, domCash: 72, topRange: "$22K-$52K" },
  { zip: "34690", name: "Holiday", cs: 38, score: 90, leads: 134, cr: 92.7, cashAvgPaid: 42100, retailAvgPaid: 131000, domCash: 61, topRange: "$28K-$54K" },
  { zip: "34655", name: "New Port Richey", cs: 30, score: 82, leads: 247, cr: 40.5, cashAvgPaid: 112000, retailAvgPaid: 148000, domCash: 52, topRange: "$90K-$150K" },
  { zip: "34667", name: "Hudson", cs: 32, score: 78, leads: 218, cr: 48.5, cashAvgPaid: 82000, retailAvgPaid: 128000, domCash: 64, topRange: "$55K-$110K" },
  { zip: "34654", name: "New Port Richey", cs: 12, score: 72, leads: 98, cr: 44.4, cashAvgPaid: 88000, retailAvgPaid: 138000, domCash: 88, topRange: "$70K-$115K" },
];

const CHANNELS = [
  { id: "all", label: "All Channels", desc: "Email + SMS + Call", icon: Zap, color: "#10B981" },
  { id: "email", label: "Email Campaign", desc: "Cold email outreach", icon: Mail, color: "#3B82F6" },
  { id: "sms", label: "SMS Campaign", desc: "Text message blast", icon: MessageSquare, color: "#06B6D4" },
  { id: "call", label: "Cold Call", desc: "Dialer campaign", icon: Phone, color: "#F59E0B" },
];

const LEAD_FILTERS = ["All Distressed", "Pre-Foreclosure", "Absentee Owners", "High Equity 30%+", "Vacant Properties", "Tax Delinquent", "Probate", "Code Violations"];

export function BuyerIntelTab() {
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState<string[]>([]);
  const [offerMode, setOfferMode] = useState("buyer_avg");
  const [pctOfAvg, setPctOfAvg] = useState(85);
  const [ch, setCh] = useState("all");
  const [filt, setFilt] = useState("All Distressed");
  const [campName, setCampName] = useState("Port Richey - Buyer Data Campaign");
  const [preview, setPreview] = useState(false);

  const selZips = ZIPS.filter((z) => sel.includes(z.zip));
  const totalLeads = selZips.reduce((s, z) => s + z.leads, 0);
  const avgCashPaid = selZips.length ? Math.round(selZips.reduce((s, z) => s + z.cashAvgPaid, 0) / selZips.length) : 0;
  const suggestedOffer = offerMode === "buyer_avg" ? Math.round(avgCashPaid * (pctOfAvg / 100)) : offerMode === "pct_arv" ? Math.round(avgCashPaid * 0.65) : Math.round(avgCashPaid * 0.80);

  const autoSelectTop = () => setSel(ZIPS.filter((z) => z.score >= 85).map((z) => z.zip));
  const tog = (z: string) => setSel((p) => p.includes(z) ? p.filter((x) => x !== z) : [...p, z]);

  return (
    <div className="space-y-4">
      {/* Workflow Steps */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { n: 1, label: "Select Zips", icon: MapPin, tip: "Browse top zip codes ranked by investor activity and select the markets you want to target." },
          { n: 2, label: "Set Offers", icon: DollarSign, tip: "Configure your offer pricing strategy — choose a fixed discount or percentage of ARV for selected zips." },
          { n: 3, label: "Launch Campaign", icon: Rocket, tip: "Review your selections and launch multi-channel outreach via email, SMS, or phone to targeted leads." },
        ].map((s) => (
          <button key={s.n} onClick={() => s.n <= (sel.length > 0 ? 3 : 1) && setStep(s.n)}
            className={cn("flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-colors",
              step === s.n ? "border-emerald-500 bg-emerald-500/10" : step > s.n ? "border-emerald-700 bg-emerald-500/5" : "border-border bg-transparent")}>
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
              step >= s.n ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground")}>
              {step > s.n ? <Check size={12} /> : s.n}
            </div>
            <s.icon size={14} className={cn(step === s.n ? "text-emerald-500" : step > s.n ? "text-emerald-700" : "text-muted-foreground")} />
            <span className={cn("text-xs font-semibold", step === s.n ? "text-emerald-500" : step > s.n ? "text-emerald-700" : "text-muted-foreground")}>{s.label}</span>
            <InfoTooltip text={s.tip} />
            {s.n === 1 && sel.length > 0 && (
              <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">{sel.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ STEP 1: BUYER ACTIVITY + ZIP SELECTION ═══ */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Buyer Activity Content with Zip Selection inserted between stat cards and charts */}
          <BuyerActivityTab>
            {/* Top Zip Codes */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-[15px] font-bold text-foreground flex items-center gap-1.5 capitalize">
                    Top Zip Codes
                    <InfoTooltip text="These are the top zip codes ranked by investor buyer activity, including cash purchases, flip volume, and overall deal velocity. Higher scores indicate stronger wholesale and investment potential. Use these insights to focus your outreach on the most active markets." />
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Choose zips for your campaign, then explore buyer data below</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={autoSelectTop} icon={<Sparkles className="h-3 w-3" />}>
                    Auto-Select 85+
                  </Button>
                  {sel.length > 0 && (
                    <Button variant="secondary" size="sm" onClick={() => setSel([])}>Clear All</Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {ZIPS.map((z) => {
                  const s = sel.includes(z.zip);
                  return (
                    <div key={z.zip} onClick={() => tog(z.zip)}
                      className={cn("flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all border",
                        s ? "bg-emerald-500/10 border-emerald-600" : "border-border hover:bg-muted/50")}>
                      <div className={cn("w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0",
                        s ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/40")}>
                        {s && <Check size={10} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[12px] text-emerald-500">{z.zip}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{z.name}</span>
                        </div>
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-[9px] text-muted-foreground">{z.leads} leads</span>
                          <span className={cn("text-[9px]", z.score >= 90 ? "text-emerald-500" : "text-amber-500")}>{z.score}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </BuyerActivityTab>

          {/* Selected Summary */}
          {sel.length > 0 && (
            <div className="bg-card border border-emerald-600 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4">
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
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-[15px] font-bold text-foreground mb-0.5 capitalize">How Do You Want To Price Your Offers?</h3>
            <p className="text-xs text-muted-foreground mb-3">We'll auto-calculate based on real buyer data from your selected zips</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                { id: "buyer_avg", title: "Based on Buyer Activity", desc: "Offer a % of what investors are actually paying", icon: Users, color: "#06B6D4", rec: true },
                { id: "pct_arv", title: "% of ARV", desc: "Classic wholesale formula — 55-70% of after-repair value", icon: Target, color: "#F59E0B" },
                { id: "buybox", title: "AI Buy Box Match", desc: "Use AI buy box criteria to auto-price each zip", icon: Brain, color: "#8B5CF6" },
              ].map((m) => (
                <div key={m.id} onClick={() => setOfferMode(m.id)}
                  className={cn("relative p-4 rounded-xl cursor-pointer border transition-colors",
                    offerMode === m.id ? "border-current" : "border-border hover:border-muted-foreground/40")}
                  style={offerMode === m.id ? { borderColor: m.color, background: `${m.color}10` } : {}}>
                  {m.rec && <span className="absolute top-2 right-2 bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-full text-[9px] font-semibold">Recommended</span>}
                  <m.icon size={20} className="mb-2" style={{ color: offerMode === m.id ? m.color : "hsl(var(--muted-foreground))" }} />
                  <div className="text-[13px] font-bold mb-1" style={{ color: offerMode === m.id ? m.color : "hsl(var(--foreground))" }}>{m.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {offerMode === "buyer_avg" && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[15px] font-bold text-foreground mb-0.5 capitalize">Offer As % Of Avg Investor Price</h3>
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

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-[15px] font-bold text-foreground mb-0.5 capitalize">Offer Price By Zip Code</h3>
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

          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back To Zip Selection</Button>
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
                {CHANNELS.map((c) => (
                  <div key={c.id} onClick={() => setCh(c.id)}
                    className={cn("px-3.5 py-3 rounded-lg cursor-pointer border transition-all",
                      ch === c.id ? "border-current" : "border-border hover:border-muted-foreground/30")}
                    style={ch === c.id ? { borderColor: c.color, background: `${c.color}10` } : {}}>
                    <div className="flex items-center gap-2 mb-1">
                      <c.icon size={16} style={{ color: ch === c.id ? c.color : "hsl(var(--muted-foreground))" }} />
                      <span className="text-xs font-semibold" style={{ color: ch === c.id ? c.color : "hsl(var(--muted-foreground))" }}>{c.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{c.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[15px] font-bold text-foreground mb-2.5 capitalize">Details</h3>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Campaign Name</label>
                  <Input value={campName} onChange={(e) => setCampName(e.target.value)} className="text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Lead Filter</label>
                  <select value={filt} onChange={(e) => setFilt(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-xs">
                    {LEAD_FILTERS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
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
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button disabled={sel.length === 0} className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 shadow-lg disabled:opacity-50">
                <Rocket size={18} /> Launch Campaign To ~{totalLeads.toLocaleString()} Leads
              </Button>
            </div>

            {preview && (
              <div className="bg-card border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-sm font-bold text-blue-500 mb-3">Campaign Summary</h4>
                <div className="grid grid-cols-2 gap-x-2 text-xs">
                  {[
                    ["Campaign", campName],
                    ["Channel", CHANNELS.find((c) => c.id === ch)?.label || ""],
                    ["Zips", sel.join(", ") || "None"],
                    ["Est. Leads", `~${totalLeads.toLocaleString()}`],
                    ["Strategy", offerMode === "buyer_avg" ? `${pctOfAvg}% of Buyer Avg` : offerMode === "pct_arv" ? "65% of ARV" : "AI Buy Box"],
                    ["Lead Filter", filt],
                    ["Avg Offer", `$${suggestedOffer.toLocaleString()}`],
                  ].map(([k, v], i) => (
                    <div key={i} className={cn(i % 2 === 0 ? "py-1.5 border-b border-border text-muted-foreground" : "py-1.5 border-b border-border text-foreground font-semibold text-right truncate")}>
                      {i % 2 === 0 ? k : v}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
