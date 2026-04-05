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
  Home,
  Megaphone,
  MapPin,
  CalendarCheck,
  MessageSquare,
  Send,
  Hammer,
  Eye,
  Settings,
  ListChecks,
  Workflow,
  PhoneCall,
  MailCheck,
  PieChart,
  Building,
  Radar,
  UserCheck,
  Handshake,
  Rocket,
  CircleDot,
  Car,
  Headphones,
  Package,
  Wrench,
  SearchCheck,
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

/* ────────────────────────── Autonomous Pipeline Steps ────────────────────────── */

const pipelineSteps = [
  { icon: Search, label: "Find", desc: "AI scrapes every corner of the web — Zillow, Craigslist, Facebook, FSBO, MLS, and sites you don't even know exist — to surface motivated sellers before your competition." },
  { icon: PhoneCall, label: "Contact", desc: "Speed-To-Lead AI calls new leads within 15 seconds. Voice AI answers inbound 24/7, qualifies sellers, and books appointments — no human needed." },
  { icon: MessageSquare, label: "Follow Up", desc: "Conversational AI sends personalized SMS, email, and ringless voicemail drip sequences — relentlessly nurturing every lead until they convert or opt out." },
  { icon: Brain, label: "Analyze", desc: "Deal Intelligence AI auto-pulls comps, calculates ARV, scores 6 exit strategies (Novation, Sub-To, Wholesale, Flip, Seller Finance, Hybrid), and writes the pitch script." },
  { icon: Send, label: "Offer", desc: "Auto-Offer Engine matches properties to your buy box, generates LOIs with your terms, and blasts offers to agents and owners — single or bulk." },
  { icon: FileText, label: "Contract", desc: "One click generates purchase agreements, novation contracts, POFs, and assignment docs — pre-filled with deal data, ready for e-signature." },
  { icon: Megaphone, label: "Market", desc: "Instantly blast deals to your verified cash buyer list, post to the buyer marketplace, and track interest — turning contracts into closings." },
  { icon: DollarSign, label: "Sold", desc: "Track closings, collect assignment fees or double-close profits, and watch your dashboard update in real time — the only step where you actually show up." },
];

/* ────────────────────────── Feature Categories (FreedomSoft-style) ────────────────────────── */

const featureCategories = [
  {
    name: "AI Agents",
    badge: "Included Free",
    desc: "6 autonomous AI agents working your pipeline 24/7 — no per-minute charges, no add-ons.",
    features: [
      { icon: Bot, name: "Speed-To-Lead AI", desc: "Calls new leads in under 15 seconds — before competitors even check their inbox." },
      { icon: Phone, name: "Voice Agent AI", desc: "Answers & makes calls 24/7. Qualifies sellers, books appointments, transfers hot leads live." },
      { icon: MessageSquare, name: "Conversational AI", desc: "Two-way SMS that nurtures leads with full context from your CRM and deal history." },
      { icon: Brain, name: "Deal Intelligence AI", desc: "Auto-calculates ARV, scores 6 creative strategies, and writes seller pitch scripts with real numbers." },
      { icon: Target, name: "Lead Score AI", desc: "Machine-learning model trained on your closed deals to score every new lead on close probability." },
      { icon: BarChart3, name: "Call & Meet Grade AI", desc: "Grades every call and appointment so you can coach your team with data, not guesswork." },
    ],
  },
  {
    name: "Intelligent Data",
    desc: "Daily-updated nationwide property data, list building, and skip tracing — the foundation of every deal.",
    features: [
      { icon: Layers, name: "List Stacking", desc: "Stack, dedupe, and tag multiple lists to surface the most motivated sellers instantly." },
      { icon: MapPin, name: "Heat Maps", desc: "Discover the hottest zip codes in any market nationwide with visual deal density mapping." },
      { icon: Search, name: "Free Skip Tracing", desc: "Phones, emails, and owner data in seconds — included free on every plan, no per-record fees." },
      { icon: Radar, name: "AI Lead Scout", desc: "Scrapes Zillow, Craigslist, Facebook, OfferUp, FSBO sites, and the entire web for off-market leads." },
      { icon: Home, name: "Property Snapshots", desc: "Instant property & owner details, tax records, sales history, and comparable sales for any address." },
      { icon: TrendingUp, name: "Deal Score", desc: "Every lead scored automatically — higher score means higher motivation and higher close probability." },
    ],
  },
  {
    name: "Marketing Automation",
    desc: "Multi-channel campaigns that follow up automatically so no lead ever goes cold.",
    features: [
      { icon: Mail, name: "Drip Campaigns", desc: "Automated SMS, email, and ringless voicemail sequences that nurture leads on autopilot." },
      { icon: Send, name: "Offer Blaster", desc: "Generate and blast LOIs, contracts, and POFs to agents and owners — single or bulk." },
      { icon: Megaphone, name: "Direct Mail", desc: "Launch one-off or multi-step direct mail campaigns using ready-made templates." },
      { icon: Globe, name: "Seller & Buyer Websites", desc: "SEO-optimized lead capture sites with custom forms, deployed in one click." },
      { icon: MailCheck, name: "Auto-Responders", desc: "Instant email & SMS responses to new leads — no lead waits more than seconds." },
      { icon: PhoneCall, name: "Click-To-Call Dialer", desc: "One-click calling with power dialer, call recording, and automatic disposition logging." },
    ],
  },
  {
    name: "Deal Analysis",
    desc: "Comps, repair estimates, and AI-powered strategy scoring — make offers with confidence.",
    features: [
      { icon: Brain, name: "Deal Intelligence", desc: "Drop in any address and get ARV, 6 exit strategy scores, projected profit, and seller scripts." },
      { icon: DollarSign, name: "Comp Analysis", desc: "Pull sales & rental comps directly inside the platform to know exactly what properties are worth." },
      { icon: Hammer, name: "Repair Estimator", desc: "Generate accurate rehab budgets room-by-room — no construction experience required." },
      { icon: FileText, name: "Offer Generator", desc: "Auto-generate LOIs, purchase agreements, novation contracts, and assignment docs pre-filled with deal data." },
      { icon: PieChart, name: "Rental Calculator", desc: "Analyze cash flow, cap rate, and ROI for buy-and-hold strategies in seconds." },
      { icon: Building, name: "Auto-Offer Engine", desc: "Matches properties to your buy box criteria and queues offers automatically — full-auto or hybrid mode." },
    ],
  },
  {
    name: "CRM & Operations",
    desc: "Your command center — manage leads, teams, tasks, and the entire deal lifecycle in one place.",
    features: [
      { icon: ListChecks, name: "Pipeline Management", desc: "Drag-and-drop Kanban board with custom stages, automated status triggers, and team assignments." },
      { icon: Workflow, name: "Workflow Automation", desc: "Update a lead status and auto-trigger campaigns, tasks, notifications, and AI follow-ups." },
      { icon: Users, name: "Team Permissions", desc: "Role-based access control — admins, acquisitions, dispositions, VAs — everyone sees only what they need." },
      { icon: CalendarCheck, name: "Task & Appointment Engine", desc: "Unified task system with automated reminders, appointment scheduling, and AI-driven follow-ups." },
      { icon: UserCheck, name: "Dispositions", desc: "Manage the selling side — match deals to cash buyers, track closings, and manage the entire exit." },
      { icon: DollarSign, name: "Full Accounting", desc: "Track every dollar in and out — P&L, deal profitability, marketing spend, and team costs." },
    ],
  },
];

/* ────────────────────────── Stats ────────────────────────── */

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
  { name: "Sarah K.", role: "Wholesaler, Houston TX", quote: "The AI Lead Scout found 43 off-market mobile homes in my market that nobody else was targeting. Closed 5 in 60 days.", rating: 5 },
  { name: "Carlos M.", role: "Novation Specialist, Miami FL", quote: "Auto-Offer Engine sent 200 offers while I slept. Woke up to 3 signed LOIs. This is the future.", rating: 5 },
  { name: "Angela W.", role: "Land Investor, Nashville TN", quote: "Speed-to-lead AI called my inbound leads before I even saw the notification. My close rate tripled.", rating: 5 },
];

const comparisonRows = [
  { feature: "AI Voice Agent (24/7 Inbound + Outbound)", us: true, them: false },
  { feature: "Speed-To-Lead (15-Second Auto-Call)", us: true, them: false },
  { feature: "Deal Intelligence & 6-Strategy Scoring", us: true, them: false },
  { feature: "AI Lead Scout (Web Scraping)", us: true, them: false },
  { feature: "Auto-Offer Engine", us: true, them: false },
  { feature: "Offer Blaster with LOI/POF/Contracts", us: true, them: false },
  { feature: "Conversational AI (2-Way SMS)", us: true, them: false },
  { feature: "Free Skip Tracing", us: true, them: true },
  { feature: "List Stacking & Deduplication", us: true, them: true },
  { feature: "Multi-Channel Drip Campaigns", us: true, them: true },
  { feature: "Seller & Buyer Websites", us: true, them: true },
  { feature: "Full Accounting System", us: true, them: true },
  { feature: "Cash Buyer Marketplace", us: true, them: false },
];

const replacedApps = [
  { name: "REsimpli", cost: "$299/mo" },
  { name: "FreedomSoft", cost: "$297/mo" },
  { name: "BatchLeads", cost: "$199/mo" },
  { name: "CallRail", cost: "$95/mo" },
  { name: "Carrot", cost: "$99/mo" },
  { name: "DocuSign", cost: "$45/mo" },
  { name: "Mailchimp", cost: "$45/mo" },
  { name: "Podio", cost: "$24/mo" },
];

/* ────────────────────────── Stat Counter ────────────────────────── */
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

/* ────────────────────────── Page ────────────────────────── */

export default function Landing() {
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState(0);

  const goSignup = () => navigate("/signup/flow");
  const goLogin = () => navigate("/login");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border overflow-visible">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14 overflow-visible">
          <div className="relative z-10 self-start mt-2">
            <RealEliteLogo height={28} />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
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
            <a href="#how-it-works" className="py-2 text-sm font-medium" onClick={() => setMobileNav(false)}>How It Works</a>
            <a href="#features" className="py-2 text-sm font-medium" onClick={() => setMobileNav(false)}>Features</a>
            <a href="#compare" className="py-2 text-sm font-medium" onClick={() => setMobileNav(false)}>Compare</a>
            <a href="#pricing" className="py-2 text-sm font-medium" onClick={() => setMobileNav(false)}>Pricing</a>
            <Button size="sm" onClick={goSignup} className="bg-primary text-primary-foreground mt-2">Start Free Trial</Button>
          </div>
        )}
      </nav>

      {/* ─── Hero (KEPT AS-IS) ─── */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
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
            AI agents that find leads, call sellers, analyze deals, send offers, close contracts, and sell deals — while you focus on cashing checks.
            Replace 8+ tools with one platform built for serious investors.
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

      {/* ─── Social Proof ─── */}
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

      {/* ═══════════════════════════════════════════════════════════════
          AUTONOMOUS PIPELINE — "Your Next Hire Isn't a Person"
          ═══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Rocket className="h-4 w-4" /> Fully Autonomous
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Your Next Hire <span className="text-primary">Isn't a Person.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Imagine a system that finds leads, calls them, follows up, analyzes the deal, sends the offer, generates the contract, and markets it to buyers — <strong className="text-foreground">all without you lifting a finger.</strong>
            </p>
          </div>

          {/* Pipeline Steps */}
          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-12 left-[calc(50%-1px)] w-0.5 bg-border" style={{ height: 'calc(100% - 48px)' }} />

            <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-1 lg:gap-0">
              {pipelineSteps.map((step, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <div key={step.label} className="relative lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                    {/* Step Number Dot */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-6 z-10">
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20">
                        {i + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={cn(
                      "bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300",
                      isLeft ? "lg:col-start-1 lg:text-right" : "lg:col-start-2"
                    )}>
                      <div className={cn("flex items-center gap-3 mb-3", isLeft ? "lg:flex-row-reverse" : "")}>
                        <div className="lg:hidden h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
                          {i + 1}
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <step.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold">{step.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>

                    {/* Spacer for alternating layout */}
                    {isLeft && <div className="hidden lg:block" />}
                    {!isLeft && <div className="hidden lg:block lg:col-start-1 lg:row-start-1" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-16">
            <Button size="lg" onClick={goSignup} className="bg-primary text-primary-foreground hover:bg-accent-hover text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20">
              Put Your Pipeline On Autopilot <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          NO INTEGRATIONS. NO HEADACHES. (REsimpli-style grid)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3">
              No Integrations. <span className="text-primary">No Headaches.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need — AI, data, marketing, analysis, CRM, and operations — built into one platform. Zero setup.
            </p>
          </div>

          {/* Quick icon grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { icon: Bot, name: "Voice Agent AI", premium: true },
              { icon: PhoneCall, name: "Speed-To-Lead", premium: true },
              { icon: Brain, name: "Deal Intelligence", premium: true },
              { icon: MessageSquare, name: "Conversational AI", premium: true },
              { icon: Target, name: "Lead Score AI", premium: true },
              { icon: BarChart3, name: "Call Grade AI" },
              { icon: Layers, name: "List Stacking" },
              { icon: Search, name: "Skip Tracing" },
              { icon: Radar, name: "AI Lead Scout", premium: true },
              { icon: Send, name: "Auto-Offer Engine", premium: true },
              { icon: Mail, name: "Drip Campaigns" },
              { icon: Globe, name: "Seller Websites" },
              { icon: MapPin, name: "Heat Maps" },
              { icon: Hammer, name: "Repair Estimator" },
              { icon: DollarSign, name: "Comp Analysis" },
              { icon: FileText, name: "Contract Gen", premium: true },
              { icon: Users, name: "Cash Buyer CRM" },
              { icon: ListChecks, name: "Pipeline CRM" },
              { icon: Workflow, name: "Automation", premium: true },
              { icon: PieChart, name: "KPIs & Reports" },
              { icon: CalendarCheck, name: "Task Manager" },
              { icon: Megaphone, name: "Direct Mail" },
              { icon: Shield, name: "Full Accounting" },
              { icon: Sparkles, name: "Web Scout AI", premium: true },
            ].map((item) => (
              <div
                key={item.name}
                className={cn(
                  "bg-card border rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 group relative",
                  item.premium
                    ? "border-primary/30 hover:border-primary/50 hover:shadow-primary/10"
                    : "border-border hover:border-primary/30"
                )}
              >
                {item.premium && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
                  </span>
                )}
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                  item.premium ? "bg-primary/15 group-hover:bg-primary/20" : "bg-primary/10 group-hover:bg-primary/15"
                )}>
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURE DEEP DIVE — Tabbed Categories (FreedomSoft-style)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need. <span className="text-primary">Nothing You Don't.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From intelligent data and AI agents to marketing automation, deal analysis, and operations — RealElite is designed to simplify your life and maximize your profits.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {featureCategories.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(i)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeCategory === i
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Active Category */}
          {featureCategories.map((cat, catIdx) => (
            <div key={cat.name} className={cn(catIdx === activeCategory ? "block" : "hidden")}>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                {cat.badge && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold mb-2">
                    <Sparkles className="h-3 w-3" /> {cat.badge}
                  </span>
                )}
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">{cat.desc}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cat.features.map((f, i) => (
                  <div
                    key={f.name}
                    className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-base font-bold mb-2">{f.name}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          COMPARISON TABLE
          ═══════════════════════════════════════════════════════════════ */}
      <section id="compare" className="py-16 md:py-28 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Investors <span className="text-primary">Switch</span>
            </h2>
            <p className="text-muted-foreground">RealElite vs. REsimpli, FreedomSoft, BatchLeads, and every other CRM you've tried.</p>
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

      {/* ═══════════════════════════════════════════════════════════════
          REPLACE 8 APPS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-4xl font-bold mb-3">
                Replace <span className="text-destructive line-through decoration-2">8 Apps</span> With <span className="text-primary">One Platform</span>
              </h3>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Stop duct-taping tools together. Stop paying 8 subscriptions. Stop losing leads between platforms.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {replacedApps.map(app => (
                <div key={app.name} className="bg-muted rounded-xl p-4 text-center">
                  <span className="text-sm font-medium text-muted-foreground line-through block">{app.name}</span>
                  <span className="text-xs text-destructive/60">{app.cost}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-baseline gap-3">
                <span className="text-muted-foreground line-through text-xl">$1,103/mo</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <span className="text-4xl font-bold text-primary">$99/mo</span>
              </div>
              <p className="text-sm text-muted-foreground">Save over <strong className="text-foreground">$12,000/year</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-28 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Real Investors. <span className="text-primary">Real Results.</span>
            </h2>
            <p className="text-muted-foreground">Trusted by thousands of real estate investors nationwide.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.name} className="bg-card border border-border rounded-2xl p-6">
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

      {/* ═══════════════════════════════════════════════════════════════
          PRICING
          ═══════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-16 md:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Simple Pricing. <span className="text-primary">No Surprises.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-12">
            Every plan includes the full AI suite, free skip tracing, and unlimited features. Just pick your team size.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "$99", per: "/mo", desc: "Solo investors getting started", highlights: ["1 User", "1 Phone Line", "5,000 Skip Traces/mo", "Full AI Suite", "Unlimited Properties", "Offer Blaster"] },
              { name: "Pro", price: "$199", per: "/mo", desc: "Teams doing 3+ deals/month", highlights: ["5 Users", "3 Phone Lines", "25,000 Skip Traces/mo", "Full AI Suite", "Auto-Offer Engine", "Priority Support"], popular: true },
              { name: "Enterprise", price: "$399", per: "/mo", desc: "High-volume operations", highlights: ["Unlimited Users", "10 Phone Lines", "100,000 Skip Traces/mo", "White-Label Websites", "Dedicated Account Manager", "Custom Integrations"] },
            ].map((plan, i) => (
              <div
                key={plan.name}
                className={cn(
                  "bg-card border rounded-2xl p-6 text-left relative",
                  plan.popular ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary" : "border-border"
                )}
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

          <p className="text-xs text-muted-foreground mt-6">
            All plans include a 30-day money-back guarantee · No credit card required to start
          </p>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Stop Working Your Pipeline.
          </h2>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-primary">
            Let Your Pipeline Work For You.
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join thousands of investors who replaced their entire tech stack — and half their team's busy work — with RealElite. Start your 30-day free trial today.
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
