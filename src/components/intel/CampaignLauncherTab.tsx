import React, { useState, useMemo } from "react";
import {
  Check, Rocket, Mail, MessageSquare, Phone, Zap,
  Sparkles, Eye, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

const COLORS = {
  primary: "#10B981", cyan: "#06B6D4", warning: "#F59E0B",
  accent: "#3B82F6", purple: "#8B5CF6",
};

const ZIPS = [
  { zip: "34668", name: "Port Richey", cs: 139, score: 98, leads: 312, cr: 96.5 },
  { zip: "34691", name: "Holiday", cs: 67, score: 95, leads: 189, cr: 91.8 },
  { zip: "34653", name: "New Port Richey", cs: 49, score: 93, leads: 156, cr: 87.5 },
  { zip: "34652", name: "Port Richey", cs: 55, score: 91, leads: 201, cr: 75.3 },
  { zip: "34690", name: "Holiday", cs: 38, score: 90, leads: 134, cr: 92.7 },
  { zip: "34655", name: "New Port Richey", cs: 30, score: 82, leads: 247, cr: 40.5 },
  { zip: "34667", name: "Hudson", cs: 32, score: 78, leads: 218, cr: 48.5 },
  { zip: "34654", name: "New Port Richey", cs: 12, score: 72, leads: 98, cr: 44.4 },
];

const CHANNELS = [
  { id: "all", label: "All Channels", desc: "Email + SMS + Call", icon: Zap, color: COLORS.primary },
  { id: "email", label: "Email Campaign", desc: "Cold email outreach", icon: Mail, color: COLORS.accent },
  { id: "sms", label: "SMS Campaign", desc: "Text message blast", icon: MessageSquare, color: COLORS.cyan },
  { id: "call", label: "Cold Call", desc: "Dialer campaign", icon: Phone, color: COLORS.warning },
];

const STRATEGIES = ["AI Buy Box Criteria", "% of ARV", "Fixed Amount", "Comps Based"];
const FILTERS = ["All Distressed", "Pre-Foreclosure", "Absentee Owners", "High Equity 30%+", "Vacant Properties", "Tax Delinquent", "Probate"];

const MSG_TEMPLATES: Record<string, { subject?: string; body: string }> = {
  email: {
    subject: "Offer for {{property_address}}",
    body: `Hi {{first_name}},\n\nI noticed your property at {{property_address}} in {{city}} and wanted to reach out. I'm a local investor actively purchasing homes in your area.\n\nI can make a competitive cash offer with a quick close — no repairs needed, no agent commissions, and we cover all closing costs.\n\nWould you be open to a brief conversation about selling? I'd love to discuss what a fair offer looks like for your situation.\n\nBest regards,\n[Your Name]\n[Your Company]`,
  },
  sms: { body: `Hi {{first_name}}, I'm interested in buying your property at {{property_address}} in {{city}}. I buy houses for cash and can close quickly. Would you consider an offer? Reply YES and I'll send details. - [Your Name]` },
  call: { body: `Opening: "Hi, is this {{first_name}}? My name is [Your Name] with [Company]. I'm reaching out because I'm an investor buying properties in {{city}} and I noticed your home at {{property_address}}."\n\nPitch: "I buy homes as-is for cash — no repairs, no commissions. Is that something you'd be open to discussing?"\n\nClose: "Great, I'd love to put together a fair offer. What's the best email to send that to?"` },
};

export function CampaignLauncherTab() {
  const [sel, setSel] = useState<string[]>([]);
  const [ch, setCh] = useState("all");
  const [strat, setStrat] = useState("AI Buy Box Criteria");
  const [filt, setFilt] = useState("All Distressed");
  const [name, setName] = useState("Port Richey - Wholesale Campaign");
  const [maxOffer, setMaxOffer] = useState("35822");
  const [preview, setPreview] = useState(false);

  const tog = (z: string) => setSel((p) => p.includes(z) ? p.filter((x) => x !== z) : [...p, z]);
  const autoSel = () => setSel(ZIPS.filter((z) => z.score >= 85).map((z) => z.zip));
  const totalLeads = useMemo(() => ZIPS.filter((z) => sel.includes(z.zip)).reduce((s, z) => s + z.leads, 0), [sel]);
  const msgType = ch === "sms" ? "sms" : ch === "call" ? "call" : "email";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT: ZIP SELECTION */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[15px] font-bold text-foreground flex items-center gap-1.5 capitalize">Target Zip Codes <InfoTooltip text="Select zip codes to target in your campaign. Higher scores indicate stronger investor markets with more deal flow." /></h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Select zips to include in campaign</p>
          </div>
          <Button variant="secondary" size="sm" onClick={autoSel} icon={<Sparkles className="h-3 w-3" />}>
            Auto-Select 85+
          </Button>
        </div>

        {ZIPS.map((z) => {
          const s = sel.includes(z.zip);
          return (
            <div key={z.zip} onClick={() => tog(z.zip)}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 cursor-pointer transition-all",
                s ? "bg-emerald-500/10 ring-1 ring-emerald-600" : "hover:bg-muted/50")}>
              <div className={cn("w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0",
                s ? "border-emerald-500 bg-emerald-500" : "border-slate-400")}>
                {s && <Check size={12} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[13px] text-emerald-500">{z.zip}</span>
                  <span className="text-[11px] text-muted-foreground">{z.name}</span>
                </div>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{z.cs} investor sales</span>
                  <span className="text-[10px] text-muted-foreground">{z.leads} leads</span>
                  <span className={cn("text-[10px]", z.cr > 80 ? "text-emerald-500" : z.cr > 50 ? "text-amber-500" : "text-muted-foreground")}>{z.cr}% investor</span>
                </div>
              </div>
              <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold",
                z.score >= 90 ? "bg-emerald-500/15 text-emerald-500" : z.score >= 75 ? "bg-amber-500/15 text-amber-500" : "bg-blue-500/15 text-blue-500")}>{z.score}</span>
            </div>
          );
        })}

        {sel.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 mt-3 border border-border">
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground">Selected Zips</span>
              <span className="text-[13px] font-bold text-emerald-500">{sel.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-muted-foreground">Estimated Leads</span>
              <span className="text-[13px] font-bold text-cyan-500">~{totalLeads.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: CAMPAIGN CONFIG */}
      <div className="space-y-3.5">
        {/* Channel Select */}
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

        {/* Config */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
          <h3 className="text-[15px] font-bold text-foreground mb-1 capitalize">Configuration</h3>
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">Campaign Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Offer Strategy</label>
              <select value={strat} onChange={(e) => setStrat(e.target.value)}
                className="w-full bg-background border border-border rounded-md text-xs px-2.5 py-2">
                {STRATEGIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Lead Filters</label>
              <select value={filt} onChange={(e) => setFilt(e.target.value)}
                className="w-full bg-background border border-border rounded-md text-xs px-2.5 py-2">
                {FILTERS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">Max Offer Price (auto: 65% of median)</label>
            <div className="flex items-center">
              <span className="bg-muted border border-border border-r-0 px-2.5 py-2 rounded-l-md text-sm text-muted-foreground">$</span>
              <Input value={maxOffer} onChange={(e) => setMaxOffer(e.target.value)} className="h-9 text-sm rounded-l-none" />
            </div>
          </div>
        </div>

        {/* Message Preview */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-500" />
              <h3 className="text-[15px] font-bold text-foreground capitalize">AI-Generated Message</h3>
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{msgType === "email" ? "Email" : "SMS/Script"}</span>
          </div>
          {msgType === "email" && MSG_TEMPLATES.email.subject && (
            <div className="mb-2">
              <span className="text-[10px] text-muted-foreground">Subject: </span>
              <span className="text-xs text-foreground font-semibold">{MSG_TEMPLATES.email.subject}</span>
            </div>
          )}
          <div className="bg-muted/50 rounded-lg p-3 border border-border max-h-[200px] overflow-y-auto">
            <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
              {MSG_TEMPLATES[msgType].body}
            </pre>
          </div>
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            {["{{first_name}}", "{{property_address}}", "{{city}}"].map((t) => (
              <span key={t} className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full text-[10px] font-medium">{t}</span>
            ))}
          </div>
        </div>

        {/* Launch */}
        <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => setPreview(!preview)} icon={<Eye className="h-4 w-4" />}>
            Preview
          </Button>
          <Button disabled={sel.length === 0}
            className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
            icon={<Rocket className="h-4 w-4" />}>
            Launch Campaign to ~{totalLeads.toLocaleString()} Leads
          </Button>
        </div>

        {/* Preview Panel */}
        {preview && (
          <div className="bg-card border border-blue-500/30 rounded-xl p-4">
            <h4 className="text-sm font-bold text-blue-500 mb-3">Campaign Summary</h4>
            <div className="grid grid-cols-2 gap-x-2 text-xs">
              {[
                ["Campaign", name],
                ["Channel", CHANNELS.find((c) => c.id === ch)?.label || ""],
                ["Zips", sel.join(", ") || "None"],
                ["Est. Leads", `~${totalLeads.toLocaleString()}`],
                ["Strategy", strat],
                ["Lead Filter", filt],
                ["Max Offer", `$${parseInt(maxOffer).toLocaleString()}`],
                ["Message Type", msgType === "email" ? "Email" : "SMS/Call Script"],
              ].map(([k, v], i) => (
                <React.Fragment key={i}>
                  <div className="py-1.5 border-b border-border text-muted-foreground">{k}</div>
                  <div className="py-1.5 border-b border-border text-foreground font-semibold text-right truncate">{v}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
