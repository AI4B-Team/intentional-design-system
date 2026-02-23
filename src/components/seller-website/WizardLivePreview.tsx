import React from "react";
import { getSiteTypeDefaults } from "./siteTypeConfig";
import { Star, Shield, Clock, Home, Users, DollarSign, Building2, AlertTriangle, Zap, ArrowDown, Bug, Briefcase, ChevronDown, Phone, MapPin, Mail } from "lucide-react";

interface WizardLivePreviewProps {
  siteType: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  primaryColor: string;
  accentColor: string;
  heroHeadline: string;
  heroSubheadline: string;
  formSubmitText: string;
  logoUrl?: string;
}

const SITUATION_ICONS: Record<string, React.ElementType> = {
  clock: Clock,
  home: Home,
  users: Users,
  briefcase: Briefcase,
  dollar: DollarSign,
  building: Building2,
  warning: AlertTriangle,
  zap: Zap,
  bug: Bug,
  arrow_down: ArrowDown,
  warehouse: Building2,
};

export function WizardLivePreview({
  siteType,
  companyName,
  companyPhone,
  companyEmail,
  primaryColor,
  accentColor,
  heroHeadline,
  heroSubheadline,
  formSubmitText,
  logoUrl,
}: WizardLivePreviewProps) {
  const defaults = getSiteTypeDefaults(siteType);
  const headline = heroHeadline || defaults.heroHeadline;
  const subheadline = heroSubheadline || defaults.heroSubheadline;
  const submitText = formSubmitText || defaults.formSubmitText;
  const company = companyName || "HomesDaily";

  const replacePlaceholder = (text: string) => text.replace(/\{companyName\}/g, company);

  return (
    <div className="text-[11px] leading-relaxed">
      {/* ── HERO SECTION ── */}
      <section style={{ backgroundColor: "hsl(48 19% 95%)" }}>
        <div className="flex gap-4 px-5 py-6">
          {/* Left: Headlines */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="inline-flex items-center gap-1 bg-background border border-border rounded-full px-2 py-0.5">
              <Star className="h-2.5 w-2.5" style={{ color: accentColor }} />
              <span className="text-[9px] text-muted-foreground">{defaults.trustBadgeText}</span>
            </div>

            <h1 className="text-[18px] font-bold leading-tight text-foreground">
              {headline.split(/(?=Fast|Fair|Simple|Cash)/i).map((part, i) => {
                const isAccent = /^(Fast|Fair|Simple|Cash)/i.test(part.trim());
                if (i === 0) return <span key={i}>{part}</span>;
                return (
                  <span key={i} style={{ color: isAccent ? accentColor : undefined }}>
                    {part}
                  </span>
                );
              })}
            </h1>

            <p className="text-[10px] text-muted-foreground">{subheadline}</p>
            <p className="text-[9px] font-bold text-foreground">{defaults.heroBenefitsLine}</p>
            <p className="text-[9px] text-muted-foreground">{defaults.heroBenefitsSubline}</p>

            {defaults.quickStats.length > 0 && (
              <div className="flex gap-4 pt-2">
                {defaults.quickStats.map((s, i) => (
                  <div key={i} className={i > 0 ? "border-l border-border pl-4" : ""}>
                    <div className="text-[13px] font-bold" style={{ color: accentColor }}>{s.value}</div>
                    <div className="text-[8px] text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Lead Form */}
          <div className="w-[200px] flex-shrink-0 rounded-xl p-3 bg-background shadow-lg border border-border">
            <h3 className="text-[12px] font-bold text-center mb-0.5">{defaults.formHeadline}</h3>
            <p className="text-[8px] text-muted-foreground text-center mb-2">{defaults.formSubheadline}</p>
            <div className="space-y-1.5">
              <div>
                <label className="text-[8px] font-medium text-foreground">Property Address</label>
                <div className="border rounded px-2 py-1 text-[8px] text-muted-foreground bg-muted/30">123 Main St, City, State</div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[8px] font-medium text-foreground">Your Name</label>
                  <div className="border rounded px-2 py-1 text-[8px] text-muted-foreground bg-muted/30">Full Name</div>
                </div>
                <div>
                  <label className="text-[8px] font-medium text-foreground">Phone</label>
                  <div className="border rounded px-2 py-1 text-[8px] text-muted-foreground bg-muted/30">(555) 000-0000</div>
                </div>
              </div>
              <div>
                <label className="text-[8px] font-medium text-foreground">Email</label>
                <div className="border rounded px-2 py-1 text-[8px] text-muted-foreground bg-muted/30">you@example.com</div>
              </div>
              <button
                className="w-full rounded-lg py-1.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {submitText}
              </button>
              <p className="text-[7px] text-muted-foreground text-center">🔒 Your info is safe. We never share or sell your data.</p>
            </div>
          </div>
        </div>

        {/* Founders Featured On bar */}
        {defaults.asSeenOn.length > 0 && (
          <div className="border-t border-border py-3" style={{ backgroundColor: "hsl(48 16% 92%)" }}>
            <div className="px-5 flex items-center gap-2">
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold whitespace-nowrap">
                Founders Featured On
              </span>
              <div className="flex items-center gap-2 opacity-60">
                {defaults.asSeenOn.map((name, i) => (
                  <span key={i} className="text-[8px] font-bold text-foreground">{name}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── STATS BAR ── */}
      {defaults.showStats && defaults.stats.length > 0 && (
        <div className="flex justify-around py-3 border-y border-border bg-muted/20">
          {defaults.stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-[14px] font-bold text-foreground">{s.value}</div>
              <div className="text-[8px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── HOW IT WORKS ── */}
      {defaults.showHowItWorks && defaults.processSteps.length > 0 && (
        <div className="px-5 py-5 text-center">
          <h2 className="text-[14px] font-bold text-foreground mb-0.5">How It Works</h2>
          <p className="text-[9px] text-muted-foreground mb-4">Three simple steps — no surprises, no hidden costs</p>
          <div className="flex gap-3">
            {defaults.processSteps.map((step) => (
              <div key={step.step} className="flex-1 text-center">
                <div className="mx-auto w-8 h-8 rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: `${primaryColor}15` }}>
                  <span className="text-[10px] font-bold" style={{ color: primaryColor }}>0{step.step}</span>
                </div>
                <div className="text-[10px] font-semibold text-foreground mb-0.5">{step.title}</div>
                <div className="text-[8px] text-muted-foreground leading-tight">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── COMPARISON TABLE ── */}
      {defaults.showComparison && defaults.comparisonRows.length > 0 && (
        <div className="px-5 py-5 bg-muted/10">
          <h2 className="text-[14px] font-bold text-foreground text-center mb-0.5">{replacePlaceholder(defaults.comparisonHeadline)}</h2>
          <p className="text-[9px] text-muted-foreground text-center mb-3">{defaults.comparisonSubheadline}</p>
          <div className="border rounded-lg overflow-hidden bg-background">
            <div className="grid grid-cols-3 text-[8px] font-semibold border-b">
              <div className="p-1.5"></div>
              <div className="p-1.5 text-center text-muted-foreground">{defaults.comparisonTraditionalLabel}</div>
              <div className="p-1.5 text-center text-white rounded-tr-lg" style={{ backgroundColor: primaryColor }}>{replacePlaceholder(defaults.comparisonCompanyLabel)}</div>
            </div>
            {defaults.comparisonRows.slice(0, 5).map((row, i) => (
              <div key={i} className="grid grid-cols-3 text-[8px] border-b last:border-0">
                <div className="p-1.5 font-medium text-foreground">{row.label}</div>
                <div className="p-1.5 text-center text-muted-foreground">{row.traditional}</div>
                <div className="p-1.5 text-center font-semibold" style={{ color: primaryColor }}>{row.company}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TESTIMONIALS ── */}
      <div className="px-5 py-5 text-center">
        <h2 className="text-[14px] font-bold text-foreground mb-0.5">{defaults.testimonialsHeadline}</h2>
        {defaults.testimonialsTagline && (
          <p className="text-[9px] mb-0.5" style={{ color: primaryColor }}>{defaults.testimonialsTagline}</p>
        )}
        <p className="text-[9px] text-muted-foreground mb-3">{defaults.testimonialsSubheadline}</p>
        <div className="flex gap-2">
          {[
            { name: "Sarah Mitchell", location: "Miami, FL", amount: "$285,000", text: "After my mother passed, I inherited a house I couldn't maintain. They gave me a fair cash offer and closed in 5 days." },
            { name: "James Rivera", location: "Austin, TX", amount: "$342,000", text: "We had 3 weeks to move. They made an offer the next day and closed before our move date." },
            { name: "Marcus Johnson", location: "Phoenix, AZ", amount: "$198,000", text: "I was behind on payments and getting letters from the bank. They bought my house in 6 days." },
          ].map((t, i) => (
            <div key={i} className="flex-1 border rounded-lg p-2 text-left bg-background">
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-2 w-2 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-[7px] text-muted-foreground mb-1.5 line-clamp-3">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-[7px] font-semibold text-foreground">{t.name}</div>
                    <div className="text-[6px] text-muted-foreground">{t.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-bold text-foreground">{t.amount}</div>
                  <div className="text-[6px] text-muted-foreground">Sale price</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SITUATIONS ── */}
      {defaults.showSituations && defaults.situations.length > 0 && (
        <div className="px-5 py-5 bg-muted/10 text-center">
          <h2 className="text-[14px] font-bold text-foreground mb-0.5">{defaults.situationsHeadline}</h2>
          <p className="text-[9px] text-muted-foreground mb-3">{defaults.situationsSubheadline}</p>
          <div className="grid grid-cols-6 gap-1.5">
            {defaults.situations.map((s, i) => {
              const Icon = SITUATION_ICONS[s.icon] || Home;
              return (
                <div key={i} className="border rounded-lg p-2 bg-background text-center">
                  <Icon className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-[7px] text-foreground">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FAQ ── */}
      <div className="px-5 py-5 text-center">
        <h2 className="text-[14px] font-bold text-foreground mb-0.5">Frequently Asked Questions</h2>
        <p className="text-[9px] text-muted-foreground mb-3">Everything you need to know about selling with {company}</p>
        <div className="space-y-1 max-w-[350px] mx-auto">
          {["How does the cash offer process work?", "Are there any fees or commissions?", "Do I need to make repairs before selling?", "How fast can I close?"].map((q, i) => (
            <div key={i} className="flex items-center justify-between border rounded px-2 py-1.5 text-left bg-background">
              <span className="text-[8px] text-foreground">{q}</span>
              <ChevronDown className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA BANNER ── */}
      <div className="px-5 py-6 text-center text-white" style={{ backgroundColor: "#1a1a2e" }}>
        <h2 className="text-[14px] font-bold mb-1">{defaults.ctaHeadline}</h2>
        <p className="text-[9px] text-white/70 mb-3 max-w-[300px] mx-auto">{defaults.ctaSubheadline}</p>
        <div className="flex items-center justify-center gap-2">
          <button className="rounded-full px-4 py-1.5 text-[9px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
            {defaults.ctaButtonText}
          </button>
          {companyPhone && (
            <span className="text-[9px] text-white/70 flex items-center gap-1">
              <Phone className="h-2.5 w-2.5" /> {companyPhone}
            </span>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="px-5 py-4 border-t border-border">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div>
            <div className="flex items-center gap-1 mb-1">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-3 w-3 object-contain" />
              ) : (
                <div className="h-3 w-3 rounded" style={{ backgroundColor: primaryColor }} />
              )}
              <span className="text-[8px] font-bold text-foreground">{company}</span>
            </div>
            <p className="text-[7px] text-muted-foreground">We help homeowners sell their properties quickly and fairly.</p>
          </div>
          <div>
            <div className="text-[8px] font-semibold text-foreground mb-1">Company</div>
            {["About Us", "How It Works", "Testimonials", "Blog"].map(l => (
              <div key={l} className="text-[7px] text-muted-foreground">{l}</div>
            ))}
          </div>
          <div>
            <div className="text-[8px] font-semibold text-foreground mb-1">Resources</div>
            {["FAQ", "Cost Guides", "Browse Properties", "Home Services"].map(l => (
              <div key={l} className="text-[7px] text-muted-foreground">{l}</div>
            ))}
          </div>
          <div>
            <div className="text-[8px] font-semibold text-foreground mb-1">Contact</div>
            <div className="space-y-0.5 text-[7px] text-muted-foreground">
              <div className="flex items-center gap-0.5"><Phone className="h-2 w-2" /> {companyPhone || "(555) 123-4567"}</div>
              <div className="flex items-center gap-0.5"><Mail className="h-2 w-2" /> {companyEmail || "support@company.com"}</div>
              <div className="flex items-center gap-0.5"><MapPin className="h-2 w-2" /> Tampa, FL</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-[7px] text-muted-foreground">© 2026 {company}. All rights reserved.</span>
          <div className="flex gap-2 text-[7px] text-muted-foreground">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </div>
  );
}
