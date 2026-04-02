import * as React from "react";
import { useNavigate } from "react-router-dom";
import { RealEliteLogo } from "@/components/brand/RealEliteLogo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Zap,
  Brain,
  Phone,
  Mail,
  BarChart3,
  Globe,
  Shield,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Sparkles,
  Target,
  Search,
  FileText,
  Layers,
  Bot,
  Star,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

/* ────────────────────────────── Data ──────────────────────────── */

const aiFeatures = [
  { icon: Bot, name: "Speed-To-Lead AI", desc: "Calls new leads within 15 seconds — before competitors even check their inbox." },
  { icon: Brain, name: "Deal Intelligence AI", desc: "Auto-calculates ARV, scores 6 exit strategies, and writes seller pitch scripts." },
  { icon: Phone, name: "Voice Agent AI", desc: "Makes & answers calls 24/7 — qualifies leads, books appointments, transfers live." },
  { icon: Sparkles, name: "Conversational AI", desc: "Two-way SMS that nurtures leads with full context from your CRM history." },
  { icon: Target, name: "Lead Score AI", desc: "Analyzes past deals to score every new lead on conversion probability." },
  { icon: BarChart3, name: "Call & Meet Grade AI", desc: "Grades every call and appointment so you can coach your team with data." },
];

const platformFeatures = [
  { icon: Layers, name: "List Stacking", desc: "Stack, dedupe, and tag lists to surface the most motivated sellers instantly." },
  { icon: Search, name: "Skip Tracing", desc: "FREE skip tracing on every plan — phones, emails, and owner data in seconds." },
  { icon: Globe, name: "Seller & Buyer Sites", desc: "SEO-optimized lead capture websites with custom forms, deployed in one click." },
  { icon: Mail, name: "Drip Campaigns", desc: "Multi-channel automation: SMS, email, ringless voicemail, and direct mail." },
  { icon: FileText, name: "Offer Blaster", desc: "Generate and blast LOIs, contracts, and POFs to agents — single or bulk." },
  { icon: DollarSign, name: "Full Accounting", desc: "Track every dollar in and out — P&L, deal profitability, and team spend." },
];

const stats = [
  { value: 2847, suffix: "+", label: "Deals Closed" },
  { value: 487, prefix: "$", suffix: "M", label: "Total Funded" },
  { value: 98, suffix: "%", label: "Satisfaction" },
  { value: 15, suffix: "s", label: "Speed-To-Lead" },
];

const testimonials = [
  { name: "Marcus T.", role: "Wholesaler, Dallas TX", quote: "Closed 3 deals in my first month. The AI caller alone paid for a year of the platform.", rating: 5 },
  { name: "Jennifer L.", role: "Fix & Flip, Atlanta GA", quote: "I replaced 6 different tools with RealElite. My team went from 2 deals/mo to 7.", rating: 5 },
  { name: "David R.", role: "Investor, Phoenix AZ", quote: "The deal analyzer scored a Novation strategy I never would have considered. $47K profit.", rating: 5 },
];

const comparisonRows = [
  { feature: "AI Voice Agent (Inbound + Outbound)", us: true, them: false },
  { feature: "Deal Intelligence & Strategy Scoring", us: true, them: false },
  { feature: "Free Skip Tracing", us: true, them: true },
  { feature: "Offer Blaster with LOI/POF", us: true, them: false },
  { feature: "List Stacking & Deduplication", us: true, them: true },
  { feature: "Multi-Channel Drip Campaigns", us: true, them: true },
  { feature: "Full Accounting System", us: true, them: true },
  { feature: "Lead Scraping (AI-Powered)", us: true, them: false },
  { feature: "Seller & Buyer Websites", us: true, them: true },
  { feature: "Speed-To-Lead (15s response)", us: true, them: true },
];

/* ────────────────────────────── Stat Counter ──────────────────────────── */
function StatBlock({ value, prefix, suffix, label, delay }: { value: number; prefix?: string; suffix?: string; label: string; delay: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const count = useCountUp(value, 1600, delay, inView);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-5xl font-bold text-primary tabular-nums">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-2 font-medium">{label}</div>
    </div>
  );
}

/* ────────────────────────────── Page ──────────────────────────── */

export default function Landing() {
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = React.useState(false);

  const goSignup = () => navigate("/signup/flow");
  const goLogin = () => navigate("/login");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <RealEliteLogo height={28} />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#ai" className="hover:text-foreground transition-colors">AI Suite</a>
            <a href="#compare" className="hover:text-foreground transition-colors">Compare</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={goLogin}>Log In</Button>
            <Button size="sm" onClick={goSignup} className="bg-primary text-primary-foreground hover:bg-accent-hover">
              Start Free Trial <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileNav && (
          <div className="md:hidden border-t border-border px-6 py-4 flex flex-col gap-3 bg-background">
            <a href="#features" className="py-2 text-sm font-medium" onClick={() => setMobileNav(false)}>Features</a>
            <a href="#ai" className="py-2 text-sm font-medium" onClick={() => setMobileNav(false)}>AI Suite</a>
            <a href="#compare" className="py-2 text-sm font-medium" onClick={() => setMobileNav(false)}>Compare</a>
            <a href="#pricing" className="py-2 text-sm font-medium" onClick={() => setMobileNav(false)}>Pricing</a>
            <Button size="sm" onClick={goSignup} className="bg-primary text-primary-foreground mt-2">Start Free Trial</Button>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-info/5 blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            The #1 AI-Powered CRM For Real Estate Investors
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            Close More Deals.
            <br />
            <span className="text-primary">Work Less.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "200ms" }}>
            AI agents that call leads, analyze deals, and send offers — while you focus on closing.
            Replace 6+ tools with one platform built for serious investors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Button size="lg" onClick={goSignup} className="bg-primary text-primary-foreground hover:bg-accent-hover text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.97]">
              Start Your 30-Day Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl border-border hover:bg-muted" onClick={() => navigate("/login")}>
              <Play className="mr-2 h-4 w-4" /> Watch Demo
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
            No credit card required · Cancel anytime · Full access to all features
          </p>
        </div>
      </section>

      {/* ─── Social Proof Logos ─── */}
      <section className="border-y border-border bg-muted/30 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-6">Trusted By Investors Nationwide</p>
          <div className="flex items-center justify-center gap-10 md:gap-16 opacity-40">
            {["Forbes", "NBC", "CBS", "Fox", "Yahoo"].map(name => (
              <span key={name} className="text-lg font-bold tracking-tight text-foreground">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <StatBlock key={s.label} {...s} delay={i * 150} />
          ))}
        </div>
      </section>

      {/* ─── AI Suite ─── */}
      <section id="ai" className="py-16 md:py-28 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Brain className="h-4 w-4" /> AI Suite
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              6 AI Agents. <span className="text-primary">Zero Extra Cost.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every plan includes our full AI suite — no add-ons, no per-minute charges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {aiFeatures.map((f, i) => (
              <div
                key={f.name}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2">{f.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Platform Features ─── */}
      <section id="features" className="py-16 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need. <span className="text-primary">Nothing You Don't.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Data, Marketing, Sales, and Operations — unified in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {platformFeatures.map((f, i) => (
              <div
                key={f.name}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-base font-bold mb-2">{f.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison Table ─── */}
      <section id="compare" className="py-16 md:py-28 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Investors <span className="text-primary">Switch</span>
            </h2>
            <p className="text-muted-foreground">See how RealElite stacks up against legacy CRMs.</p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] text-sm font-semibold border-b border-border">
              <div className="p-4 text-muted-foreground">Feature</div>
              <div className="p-4 text-center text-primary">RealElite</div>
              <div className="p-4 text-center text-muted-foreground">Others</div>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={row.feature} className={cn("grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] text-sm", i < comparisonRows.length - 1 && "border-b border-border")}>
                <div className="p-4 font-medium">{row.feature}</div>
                <div className="p-4 flex items-center justify-center">
                  {row.us ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <X className="h-4 w-4 text-muted-foreground/40" />}
                </div>
                <div className="p-4 flex items-center justify-center">
                  {row.them ? <CheckCircle2 className="h-5 w-5 text-muted-foreground/40" /> : <X className="h-4 w-4 text-muted-foreground/40" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-16 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Real Investors. <span className="text-primary">Real Results.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.name} className="bg-card border border-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Teaser ─── */}
      <section id="pricing" className="py-16 md:py-28 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Simple Pricing. <span className="text-primary">No Surprises.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-12">
            Every plan includes the full AI suite, free skip tracing, and unlimited features. Just pick your team size.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "$99", per: "/mo", desc: "Solo investors getting started", highlights: ["1 User", "1 Phone Line", "5,000 Skip Traces", "Full AI Suite"] },
              { name: "Pro", price: "$199", per: "/mo", desc: "Teams doing 3+ deals/month", highlights: ["5 Users", "3 Phone Lines", "25,000 Skip Traces", "Full AI Suite"], popular: true },
              { name: "Enterprise", price: "$399", per: "/mo", desc: "High-volume operations", highlights: ["Unlimited Users", "10 Phone Lines", "100,000 Skip Traces", "Priority Support"] },
            ].map((plan, i) => (
              <div
                key={plan.name}
                className={cn(
                  "bg-card border rounded-2xl p-6 text-left relative animate-fade-in",
                  plan.popular ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary" : "border-border"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.per}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.highlights.map(h => (
                    <li key={h} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={goSignup}
                  className={cn("w-full rounded-xl", plan.popular ? "bg-primary text-primary-foreground hover:bg-accent-hover" : "bg-muted text-foreground hover:bg-muted/80")}
                >
                  Start Free Trial
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Cost Savings ─── */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Replace <span className="text-destructive line-through decoration-2">6 Apps</span> With One
              </h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Stop paying for Salesforce, CallRail, DocuSign, Carrot, Mailchimp, and QuickBooks separately. RealElite does it all.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground line-through text-lg">$4,048/yr</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-3xl font-bold text-primary">$1,188/yr</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Save up to $2,860/year</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Salesforce", "CallRail", "DocuSign", "Carrot", "Mailchimp", "QuickBooks"].map(app => (
                <div key={app} className="bg-muted rounded-lg p-3 text-center">
                  <span className="text-xs font-medium text-muted-foreground line-through">{app}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready To Close More Deals?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join thousands of investors who switched to RealElite and never looked back. Start your 30-day free trial today.
          </p>
          <Button
            size="lg"
            onClick={goSignup}
            className="bg-primary text-primary-foreground hover:bg-accent-hover text-base px-10 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.97]"
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            No credit card required · Full AI suite included · Cancel anytime
          </p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <RealEliteLogo height={22} />
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">Privacy</button>
              <button onClick={() => navigate("/terms")} className="hover:text-foreground transition-colors">Terms</button>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} RealElite. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
