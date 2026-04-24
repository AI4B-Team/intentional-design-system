import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { RealEliteLogo } from "@/components/brand/RealEliteLogo";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Building2,
  Landmark,
  UserCheck,
  FileText,
  PenLine,
  MapPin,
  Phone,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Upload,
  Zap,
  ShieldCheck,
  Rocket,
  Mail,
  X,
} from "lucide-react";

const WELCOME_KEY = "realelite_welcome_setup";
const WELCOME_DONE_KEY = "realelite_welcome_completed";

type StepId =
  | "intro"
  | "vendors"
  | "documents"
  | "entity"
  | "markets"
  | "comms"
  | "buyers"
  | "done";

interface Vendor {
  name: string;
  company: string;
  email: string;
  phone: string;
}

interface WelcomeData {
  titleCompany: Vendor;
  lender: Vendor;
  agent: Vendor;
  docMode: "upload" | "templates" | "later";
  uploadedDocs: { name: string; size: number }[];
  selectedTemplates: string[];
  entity: { llcName: string; ein: string; signerName: string; signerTitle: string; signatureDataUrl: string };
  markets: string[];
  buyBox: { minPrice: string; maxPrice: string; propertyType: string };
  comms: { wantsNumber: boolean; areaCode: string; businessHoursStart: string; businessHoursEnd: string };
  buyersCsv: { name: string; size: number; rows: number } | null;
}

const emptyVendor = (): Vendor => ({ name: "", company: "", email: "", phone: "" });

const initialData: WelcomeData = {
  titleCompany: emptyVendor(),
  lender: emptyVendor(),
  agent: emptyVendor(),
  docMode: "templates",
  uploadedDocs: [],
  selectedTemplates: ["purchase", "loi"],
  entity: { llcName: "", ein: "", signerName: "", signerTitle: "Managing Member", signatureDataUrl: "" },
  markets: [],
  buyBox: { minPrice: "", maxPrice: "", propertyType: "single_family" },
  comms: { wantsNumber: false, areaCode: "", businessHoursStart: "09:00", businessHoursEnd: "18:00" },
  buyersCsv: null,
};

const STEPS: { id: StepId; label: string; icon: React.ElementType }[] = [
  { id: "intro", label: "Welcome", icon: Sparkles },
  { id: "vendors", label: "Team", icon: Building2 },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "entity", label: "Entity & Signature", icon: PenLine },
  { id: "markets", label: "Markets", icon: MapPin },
  { id: "comms", label: "Communications", icon: Phone },
  { id: "buyers", label: "Cash Buyers", icon: Users },
  { id: "done", label: "Launch", icon: Rocket },
];

const TEMPLATES = [
  { id: "purchase", label: "Purchase & Sale Agreement", description: "Standard Wholesale-Friendly Contract" },
  { id: "loi", label: "Letter Of Intent (LOI)", description: "Soft Offer To Test Seller Interest" },
  { id: "assignment", label: "Assignment Of Contract", description: "Assign Your Contract To An End Buyer" },
  { id: "jv", label: "JV Agreement", description: "Partner With Another Investor On A Deal" },
  { id: "addendum", label: "Inspection Addendum", description: "Standard Inspection Contingency" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

function WhyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
      <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      <div className="text-sm text-foreground/90">{children}</div>
    </div>
  );
}

function VendorForm({ vendor, onChange, prefix }: { vendor: Vendor; onChange: (v: Vendor) => void; prefix: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Contact name</Label>
        <Input placeholder="Jane Smith" value={vendor.name} onChange={(e) => onChange({ ...vendor, name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Company</Label>
        <Input placeholder={`${prefix} Co.`} value={vendor.company} onChange={(e) => onChange({ ...vendor, company: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Email</Label>
        <Input type="email" placeholder="email@company.com" value={vendor.email} onChange={(e) => onChange({ ...vendor, email: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Phone</Label>
        <Input placeholder="(555) 555-5555" value={vendor.phone} onChange={(e) => onChange({ ...vendor, phone: e.target.value })} />
      </div>
    </div>
  );
}

function SignaturePad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  React.useEffect(() => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "hsl(var(--foreground))";
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    const ctx = getCtx()!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = getCtx()!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current!.toDataURL("image/png"));
  };
  const clear = () => {
    const ctx = getCtx()!;
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <canvas
          ref={canvasRef}
          width={500}
          height={140}
          className="w-full touch-none cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">Sign with mouse, finger, or stylus</p>
        <Button type="button" variant="ghost" size="sm" onClick={clear}>Clear</Button>
      </div>
    </div>
  );
}

export default function Welcome() {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = React.useState(0);
  const [data, setData] = React.useState<WelcomeData>(() => {
    try {
      const stored = localStorage.getItem(WELCOME_KEY);
      return stored ? { ...initialData, ...JSON.parse(stored) } : initialData;
    } catch {
      return initialData;
    }
  });

  const step = STEPS[stepIdx];
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const update = <K extends keyof WelcomeData>(key: K, value: WelcomeData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const persist = React.useCallback(() => {
    localStorage.setItem(WELCOME_KEY, JSON.stringify(data));
    // Mirror vendor + entity into Account Defaults so settings UI picks them up
    const existingDefaults = (() => {
      try { return JSON.parse(localStorage.getItem("realelite_account_defaults") || "{}"); }
      catch { return {}; }
    })();
    localStorage.setItem("realelite_account_defaults", JSON.stringify({
      ...existingDefaults,
      titleCompany: { ...existingDefaults.titleCompany, ...data.titleCompany, isDefault: true },
      lender: { ...existingDefaults.lender, ...data.lender, isDefault: true },
      agent: { ...existingDefaults.agent, ...data.agent, isDefault: true },
      entity: data.entity,
    }));
    if (data.entity.signatureDataUrl) {
      localStorage.setItem("realelite_signature", data.entity.signatureDataUrl);
      localStorage.setItem("realelite_signer", JSON.stringify({ name: data.entity.signerName, title: data.entity.signerTitle, llc: data.entity.llcName, ein: data.entity.ein }));
    }
  }, [data]);

  const next = () => {
    persist();
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };
  const back = () => stepIdx > 0 && setStepIdx(stepIdx - 1);

  const finish = () => {
    persist();
    localStorage.setItem(WELCOME_DONE_KEY, "true");
    toast.success("Setup saved! Welcome to RealElite.");
    navigate("/dashboard");
  };

  const skipAll = () => {
    localStorage.setItem(WELCOME_DONE_KEY, "skipped");
    toast.info("You can finish setup any time from Settings.");
    navigate("/dashboard");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    update("uploadedDocs", [...data.uploadedDocs, ...files.map((f) => ({ name: f.name, size: f.size }))]);
    update("docMode", "upload");
    toast.success(`${files.length} document(s) ready to upload`);
  };

  const handleBuyersCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = (reader.result as string).split("\n").filter(Boolean).length - 1;
      update("buyersCsv", { name: f.name, size: f.size, rows: Math.max(0, rows) });
      toast.success(`${rows} buyers detected — we'll import on launch`);
    };
    reader.readAsText(f);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <RealEliteLogo />
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Step {stepIdx + 1} of {STEPS.length}
            </span>
            <button
              onClick={skipAll}
              className="text-xs text-muted-foreground/70 hover:text-foreground underline-offset-4 hover:underline transition-colors"
            >
              Skip Setup
            </button>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none mt-2" />
      </header>

      {/* Stepper rail */}
      <div className="border-b border-border-subtle bg-surface/30">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === stepIdx;
            const isDone = i < stepIdx;
            return (
              <button
                key={s.id}
                onClick={() => i <= stepIdx && setStepIdx(i)}
                disabled={i > stepIdx}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                  isActive && "bg-primary/10 text-primary",
                  isDone && "text-muted-foreground hover:text-foreground cursor-pointer",
                  !isActive && !isDone && "text-muted-foreground/50",
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className={cn("max-w-3xl mx-auto px-6", step.id === "intro" || step.id === "done" ? "py-6 pb-28" : "py-10 pb-32")}>
          {step.id === "intro" && (
            <div className="space-y-4 text-center">
              <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 items-center justify-center mx-auto">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Welcome To RealElite 🎉</h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
                  Let's set up your account so the platform can run on autopilot — sending offers, routing contracts to title,
                  and signing agreements with your information already filled in.
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto pt-2">
                {[
                  { icon: Zap, title: "5 Minutes", desc: "Each Step Is Optional And Skippable" },
                  { icon: ShieldCheck, title: "Private & Secure", desc: "Only Your Team Sees This Data" },
                  { icon: Rocket, title: "Unlock Automation", desc: "Auto-Offers, E-Sign, Title Routing" },
                ].map((b) => (
                  <Card key={b.title} className="p-3">
                    <b.icon className="h-4 w-4 text-primary mb-1.5" />
                    <p className="text-sm font-semibold text-foreground">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step.id === "vendors" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Build Your Deal Team</h2>
                <p className="text-muted-foreground mt-2">Title company, lender, and agent details auto-fill on every contract you send.</p>
              </div>
              <WhyCard>
                <strong>Why This Matters:</strong> When the platform sends an LOI or executes a contract, it automatically routes
                a copy to your title company and CCs your lender. Without this, you'll have to forward each one manually.
              </WhyCard>

              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /><h3 className="font-semibold">Title Company</h3></div>
                <VendorForm vendor={data.titleCompany} onChange={(v) => update("titleCompany", v)} prefix="Title" />
              </Card>
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /><h3 className="font-semibold">Preferred Lender</h3></div>
                <VendorForm vendor={data.lender} onChange={(v) => update("lender", v)} prefix="Lending" />
              </Card>
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-primary" /><h3 className="font-semibold">Default Agent</h3></div>
                <VendorForm vendor={data.agent} onChange={(v) => update("agent", v)} prefix="Realty" />
              </Card>
            </div>
          )}

          {step.id === "documents" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Set Up Your Documents</h2>
                <p className="text-muted-foreground mt-2">Use our state-aware templates, upload your own, or do both.</p>
              </div>
              <WhyCard>
                <strong>Why This Matters:</strong> Your documents power Auto-Offer Engine, the Offer Blaster, and one-click
                e-signature. The faster they're in place, the faster you send compliant contracts.
              </WhyCard>

              <div className="grid sm:grid-cols-2 gap-3">
                <Card className={cn("p-5 cursor-pointer transition", data.docMode === "templates" && "ring-2 ring-primary")} onClick={() => update("docMode", "templates")}>
                  <FileText className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">Use Our Templates</h3>
                  <p className="text-xs text-muted-foreground">Attorney-reviewed, state-aware, ready in seconds.</p>
                </Card>
                <Card className={cn("p-5 cursor-pointer transition", data.docMode === "upload" && "ring-2 ring-primary")} onClick={() => update("docMode", "upload")}>
                  <Upload className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">Upload My Own</h3>
                  <p className="text-xs text-muted-foreground">Bring your existing PDFs / Word docs.</p>
                </Card>
              </div>

              {data.docMode === "templates" && (
                <Card className="p-5 space-y-3">
                  <p className="text-sm font-medium text-foreground">Pick The Templates To Enable:</p>
                  {TEMPLATES.map((t) => {
                    const checked = data.selectedTemplates.includes(t.id);
                    return (
                      <label key={t.id} className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle hover:bg-surface-hover cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            update("selectedTemplates", checked
                              ? data.selectedTemplates.filter((x) => x !== t.id)
                              : [...data.selectedTemplates, t.id])
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{t.label}</p>
                          <p className="text-xs text-muted-foreground">{t.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </Card>
              )}

              {data.docMode === "upload" && (
                <Card className="p-5">
                  <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Click to upload contracts, LOIs, or agreements</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or DOCX</p>
                    <input type="file" multiple accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                  </label>
                  {data.uploadedDocs.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {data.uploadedDocs.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-surface">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 truncate">{d.name}</span>
                          <Badge variant="secondary" className="text-xs">{(d.size / 1024).toFixed(0)} KB</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {step.id === "entity" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Business Entity & Signature</h2>
                <p className="text-muted-foreground mt-2">Used on every contract, LOI, and agreement we send on your behalf.</p>
              </div>
              <WhyCard>
                <strong>Why This Matters:</strong> Your e-signature, LLC, and signing authority will be auto-applied across
                LOIs, purchase agreements, and JV docs in the Agreements app — no need to sign manually each time.
              </WhyCard>

              <Card className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Business / LLC name</Label>
                    <Input placeholder="Acme Holdings LLC" value={data.entity.llcName} onChange={(e) => update("entity", { ...data.entity, llcName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">EIN (optional)</Label>
                    <Input placeholder="XX-XXXXXXX" value={data.entity.ein} onChange={(e) => update("entity", { ...data.entity, ein: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Signer name</Label>
                    <Input placeholder="Jane Smith" value={data.entity.signerName} onChange={(e) => update("entity", { ...data.entity, signerName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Title</Label>
                    <Input placeholder="Managing Member" value={data.entity.signerTitle} onChange={(e) => update("entity", { ...data.entity, signerTitle: e.target.value })} />
                  </div>
                </div>
              </Card>

              <Card className="p-5 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Your E-Signature</p>
                  <p className="text-xs text-muted-foreground">Draw once — applied automatically to every signed document.</p>
                </div>
                <SignaturePad value={data.entity.signatureDataUrl} onChange={(v) => update("entity", { ...data.entity, signatureDataUrl: v })} />
              </Card>
            </div>
          )}

          {step.id === "markets" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Where Do You Invest?</h2>
                <p className="text-muted-foreground mt-2">We'll surface deals, scrape leads, and run AI Scanner in your markets.</p>
              </div>
              <WhyCard>
                <strong>Why This Matters:</strong> Markets + buy box power the AI Lead Scout, Offer Blaster, and AI Scanner.
                Without them, you'll see deals from everywhere instead of just your zone.
              </WhyCard>

              <Card className="p-5 space-y-4">
                <p className="text-sm font-medium text-foreground">Select Your States</p>
                <div className="flex flex-wrap gap-2">
                  {US_STATES.map((s) => {
                    const active = data.markets.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => update("markets", active ? data.markets.filter((x) => x !== s) : [...data.markets, s])}
                        className={cn(
                          "h-8 min-w-[44px] px-2.5 rounded-md text-xs font-medium border transition",
                          active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-5 space-y-4">
                <p className="text-sm font-medium text-foreground">Quick Buy Box (Optional)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Min Price ($)</Label>
                    <Input type="number" placeholder="50,000" value={data.buyBox.minPrice} onChange={(e) => update("buyBox", { ...data.buyBox, minPrice: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max Price ($)</Label>
                    <Input type="number" placeholder="350,000" value={data.buyBox.maxPrice} onChange={(e) => update("buyBox", { ...data.buyBox, maxPrice: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Property Type</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={data.buyBox.propertyType}
                      onChange={(e) => update("buyBox", { ...data.buyBox, propertyType: e.target.value })}
                    >
                      <option value="single_family">Single Family</option>
                      <option value="multi_family">Multi-Family</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {step.id === "comms" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Communications Setup</h2>
                <p className="text-muted-foreground mt-2">Get a dedicated business number for the dialer, SMS, and AI Voice Agent.</p>
              </div>
              <WhyCard>
                <strong>Why This Matters:</strong> A dedicated number protects your personal cell, enables call recording &
                AI coaching, and unlocks SMS sequences. Required for the AI Voice Acquisition Agent.
              </WhyCard>

              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Provision A Business Number</p>
                    <p className="text-xs text-muted-foreground">We'll set this up in the dialer after launch.</p>
                  </div>
                  <Switch checked={data.comms.wantsNumber} onCheckedChange={(v) => update("comms", { ...data.comms, wantsNumber: v })} />
                </div>
                {data.comms.wantsNumber && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Preferred Area Code</Label>
                    <Input placeholder="305" maxLength={3} value={data.comms.areaCode} onChange={(e) => update("comms", { ...data.comms, areaCode: e.target.value.replace(/\D/g, "") })} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Business Hours Start</Label>
                    <Input type="time" value={data.comms.businessHoursStart} onChange={(e) => update("comms", { ...data.comms, businessHoursStart: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Business Hours End</Label>
                    <Input type="time" value={data.comms.businessHoursEnd} onChange={(e) => update("comms", { ...data.comms, businessHoursEnd: e.target.value })} />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {step.id === "buyers" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Import Your Cash Buyers</h2>
                <p className="text-muted-foreground mt-2">Drop a CSV so dispositions can fire from day one.</p>
              </div>
              <WhyCard>
                <strong>Why This Matters:</strong> The moment you lock up a deal, the platform can blast it to matched buyers
                in your list — no manual list-building required. Skip if you're starting from scratch.
              </WhyCard>

              <Card className="p-5">
                <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Click To Upload Cash Buyers CSV</p>
                  <p className="text-xs text-muted-foreground mt-1">Name, Email, Phone, Markets, Max Price</p>
                  <input type="file" accept=".csv" className="hidden" onChange={handleBuyersCsv} />
                </label>
                {data.buyersCsv && (
                  <div className="mt-4 flex items-center gap-2 text-sm p-3 rounded bg-success/5 border border-success/20">
                    <Check className="h-4 w-4 text-success" />
                    <span className="flex-1">{data.buyersCsv.name}</span>
                    <Badge variant="secondary">{data.buyersCsv.rows} buyers</Badge>
                  </div>
                )}
              </Card>
            </div>
          )}

          {step.id === "done" && (
            <div className="space-y-6 text-center">
              <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-success to-success/60 items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">You're Ready To Launch 🚀</h1>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                  Your defaults are saved. The platform will start using them automatically — and you can edit anything any time
                  from <strong>Settings</strong> or your <strong>Setup Hub</strong>.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto pt-4">
                {[
                  { label: "Title Company", val: data.titleCompany.company || "Skipped" },
                  { label: "Preferred Lender", val: data.lender.company || "Skipped" },
                  { label: "Default Agent", val: data.agent.company || "Skipped" },
                  { label: "Documents", val: data.docMode === "upload" ? `${data.uploadedDocs.length} Uploaded` : `${data.selectedTemplates.length} Templates` },
                  { label: "Signature", val: data.entity.signatureDataUrl ? "Saved" : "Skipped" },
                  { label: "Markets", val: data.markets.length ? `${data.markets.length} States` : "Skipped" },
                  { label: "Business Number", val: data.comms.wantsNumber ? `Area ${data.comms.areaCode || "Any"}` : "Skipped" },
                  { label: "Cash Buyers", val: data.buyersCsv ? `${data.buyersCsv.rows} Imported` : "Skipped" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface">
                    <span className="text-xs text-muted-foreground">{r.label}</span>
                    <span className="text-sm font-medium text-foreground truncate ml-2">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer nav */}
      <footer className="border-t border-border-subtle bg-surface/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={back} disabled={stepIdx === 0} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {step.id !== "intro" && step.id !== "done" && (
              <Button variant="ghost" onClick={next} className="text-muted-foreground">
                Skip This Step
              </Button>
            )}
            {step.id === "done" ? (
              <Button onClick={finish} className="gap-2">
                Go To Dashboard <Rocket className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={next} className="gap-2">
                {step.id === "intro" ? "Let's Go" : "Continue"} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
