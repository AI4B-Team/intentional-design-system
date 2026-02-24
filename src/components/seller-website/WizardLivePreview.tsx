import React from "react";
import { cn } from "@/lib/utils";
import { getSiteTypeDefaults } from "./siteTypeConfig";
import { Star, Shield, Clock, Home, Users, DollarSign, Building2, AlertTriangle, Zap, ArrowDown, Bug, Briefcase, ChevronDown, Phone, MapPin, Mail } from "lucide-react";
import { NetworkLogo } from "./NetworkLogos";

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
  // Credibility bar
  showCredibilityBar?: boolean;
  credibilityLogos?: string[];
  credibilityLogoImages?: Record<string, string>;
  credibilityAnimated?: boolean;
  // Section toggles
  showStats?: boolean;
  showHowItWorks?: boolean;
  showComparison?: boolean;
  showTestimonials?: boolean;
  showSituations?: boolean;
  showFAQ?: boolean;
  showCTA?: boolean;
  // Editable content overrides
  trustBadgeText?: string;
  benefitsLine?: string;
  ctaHeadline?: string;
  ctaSubheadline?: string;
  // Section content overrides
  statsItems?: Array<{ value: string; label: string }>;
  processSteps?: Array<{ step: number; title: string; description: string }>;
  howItWorksHeadline?: string;
  howItWorksSubheadline?: string;
  comparisonHeadline?: string;
  comparisonTraditionalLabel?: string;
  comparisonCompanyLabel?: string;
  comparisonRows?: Array<{ label: string; traditional: string; company: string }>;
  situationsHeadline?: string;
  situationsSubheadline?: string;
  situationItems?: Array<{ icon: string; label: string }>;
  faqHeadline?: string;
  faqItems?: Array<{ question: string; answer: string }>;
  testimonialsHeadline?: string;
  testimonialsTagline?: string;
  testimonialsSubheadline?: string;
  testimonialItems?: Array<{ name: string; role: string; company: string; quote: string; imageUrl: string }>;
  // Footer
  footerTagline?: string;
  footerAlignment?: "left" | "center" | "right";
  showSocialLinks?: boolean;
  socialProfiles?: Record<string, { enabled: boolean; url: string }>;
  showNewsletter?: boolean;
  newsletterHeadline?: string;
  newsletterDescription?: string;
  newsletterButtonText?: string;
  newsletterPlaceholder?: string;
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
  showCredibilityBar = true,
  credibilityLogos,
  credibilityLogoImages,
  credibilityAnimated = false,
  showStats: showStatsProp,
  showHowItWorks: showHowItWorksProp,
  showComparison: showComparisonProp,
  showTestimonials: showTestimonialsProp,
  showSituations: showSituationsProp,
  showFAQ: showFAQProp,
  showCTA: showCTAProp,
  trustBadgeText: trustBadgeTextProp,
  benefitsLine: benefitsLineProp,
  ctaHeadline: ctaHeadlineProp,
  ctaSubheadline: ctaSubheadlineProp,
  statsItems: statsItemsProp,
  processSteps: processStepsProp,
  howItWorksHeadline: howItWorksHeadlineProp,
  howItWorksSubheadline: howItWorksSubheadlineProp,
  comparisonHeadline: comparisonHeadlineProp,
  comparisonTraditionalLabel: comparisonTraditionalLabelProp,
  comparisonCompanyLabel: comparisonCompanyLabelProp,
  comparisonRows: comparisonRowsProp,
  situationsHeadline: situationsHeadlineProp,
  situationsSubheadline: situationsSubheadlineProp,
  situationItems: situationItemsProp,
  faqHeadline: faqHeadlineProp,
  faqItems: faqItemsProp,
  testimonialsHeadline: testimonialsHeadlineProp,
  testimonialsTagline: testimonialsTaglineProp,
  testimonialsSubheadline: testimonialsSubheadlineProp,
  testimonialItems: testimonialItemsProp,
  footerTagline,
  footerAlignment = "left",
  showSocialLinks = true,
  socialProfiles,
  showNewsletter = true,
  newsletterHeadline,
  newsletterDescription,
  newsletterButtonText,
  newsletterPlaceholder,
}: WizardLivePreviewProps) {
  const defaults = getSiteTypeDefaults(siteType);
  const headline = heroHeadline || defaults.heroHeadline;
  const subheadline = heroSubheadline || defaults.heroSubheadline;
  const submitText = formSubmitText || defaults.formSubmitText;
  const company = companyName || "Swift Home Buyers";
  const displayLogos = credibilityLogos && credibilityLogos.length > 0 ? credibilityLogos.filter(Boolean) : defaults.asSeenOn;
  
  // Section visibility (prop overrides defaults)
  const sShowStats = showStatsProp ?? defaults.showStats;
  const sShowHowItWorks = showHowItWorksProp ?? defaults.showHowItWorks;
  const sShowComparison = showComparisonProp ?? defaults.showComparison;
  const sShowTestimonials = showTestimonialsProp ?? true;
  const sShowSituations = showSituationsProp ?? defaults.showSituations;
  const sShowFAQ = showFAQProp ?? true;
  const sShowCTA = showCTAProp ?? true;
  
  // Content overrides
  const trustBadge = trustBadgeTextProp || defaults.trustBadgeText;
  const benefitsLn = benefitsLineProp || defaults.heroBenefitsLine;
  const ctaHl = ctaHeadlineProp || defaults.ctaHeadline;
  const ctaSub = ctaSubheadlineProp || defaults.ctaSubheadline;

  // Section content (custom overrides defaults)
  const displayStats = statsItemsProp && statsItemsProp.length > 0 ? statsItemsProp : defaults.stats;
  const displaySteps = processStepsProp && processStepsProp.length > 0 ? processStepsProp : defaults.processSteps;
  const displayHIWHeadline = howItWorksHeadlineProp || "How It Works";
  const displayHIWSubheadline = howItWorksSubheadlineProp || "Three simple steps — no surprises, no hidden costs";
  const displayCompHeadline = comparisonHeadlineProp || defaults.comparisonHeadline;
  const displayCompTradLabel = comparisonTraditionalLabelProp || defaults.comparisonTraditionalLabel;
  const displayCompCoLabel = comparisonCompanyLabelProp || defaults.comparisonCompanyLabel;
  const displayCompRows = comparisonRowsProp && comparisonRowsProp.length > 0 ? comparisonRowsProp : defaults.comparisonRows;
  const displaySitHeadline = situationsHeadlineProp || defaults.situationsHeadline;
  const displaySitSubheadline = situationsSubheadlineProp || defaults.situationsSubheadline;
  const displaySituations = situationItemsProp && situationItemsProp.length > 0 ? situationItemsProp : defaults.situations;
  const displayFAQHeadline = faqHeadlineProp || "Frequently Asked Questions";
  const displayFAQItems = faqItemsProp && faqItemsProp.length > 0 ? faqItemsProp : null;
  const displayTestimonialsHeadline = testimonialsHeadlineProp || defaults.testimonialsHeadline;
  const displayTestimonialsTagline = testimonialsTaglineProp || defaults.testimonialsTagline;
  const displayTestimonialsSubheadline = testimonialsSubheadlineProp || defaults.testimonialsSubheadline;
  const defaultTestimonials = [
    { name: "Sarah Mitchell", role: "Homeowner", company: "Miami, FL", quote: "After my mother passed, I inherited a house I couldn't maintain. They gave me a fair cash offer and closed in 5 days.", imageUrl: "" },
    { name: "James Rivera", role: "Homeowner", company: "Austin, TX", quote: "We had 3 weeks to move. They made an offer the next day and closed before our move date.", imageUrl: "" },
    { name: "Marcus Johnson", role: "Homeowner", company: "Phoenix, AZ", quote: "I was behind on payments and getting letters from the bank. They bought my house in 6 days.", imageUrl: "" },
  ];
  const displayTestimonials = testimonialItemsProp && testimonialItemsProp.length > 0 ? testimonialItemsProp : defaultTestimonials;

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
              <span className="text-[9px] text-muted-foreground">{trustBadge}</span>
            </div>

            <h1 className="text-[18px] font-bold leading-tight text-foreground">
              {headline.split(/(?=Fast|Fair|Simple|Cash)/i).map((part, i) => {
                const isAccent = /^(Fast|Fair|Simple|Cash)/i.test(part.trim());
                if (i === 0) return <span key={i}>{part}</span>;
                return (
                  <span key={i} style={{ color: isAccent ? primaryColor : undefined }}>
                    {part}
                  </span>
                );
              })}
            </h1>

            <p className="text-[10px] text-muted-foreground">{subheadline}</p>
            <p className="text-[9px] font-bold text-foreground">{benefitsLn}</p>
            <p className="text-[9px] text-muted-foreground">{defaults.heroBenefitsSubline}</p>

            {defaults.quickStats.length > 0 && (
              <div className="flex gap-4 pt-2">
                {defaults.quickStats.map((s, i) => (
                  <div key={i} className={i > 0 ? "border-l border-border pl-4" : ""}>
                    <div className="text-[13px] font-bold" style={{ color: primaryColor }}>{s.value}</div>
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
        {showCredibilityBar && displayLogos.length > 0 && (
          <div className="border-t border-border py-3 overflow-hidden" style={{ backgroundColor: "hsl(48 16% 92%)" }}>
            <div className={cn("px-5 flex items-center gap-2", credibilityAnimated && "animate-marquee-wrapper")}>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold whitespace-nowrap">
                Founders Featured On
              </span>
              <div className={cn(
                "flex items-center gap-4 opacity-60",
                credibilityAnimated && "animate-marquee"
              )}>
                {(credibilityAnimated ? [...displayLogos, ...displayLogos] : displayLogos).map((name, i) => {
                  const origIdx = i % displayLogos.length;
                  const imgUrl = credibilityLogoImages?.[String(origIdx)];
                  return imgUrl ? (
                    <img key={i} src={imgUrl} alt={name} className="h-[12px] max-w-[40px] object-contain" />
                  ) : (
                    <NetworkLogo key={i} name={name} sizeClass="text-[9px]" colorClass="text-foreground" />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── BUYER SITE: Off-Market Listings Grid ── */}
      {siteType === "buyer" ? (
        <>
          {/* Filter bar */}
          <div className="px-5 py-3 border-b border-border bg-background flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-semibold text-foreground">Filter:</span>
            {["All Deals", "Fix & Flip", "Buy & Hold", "Wholesale", "BRRRR"].map((f, i) => (
              <span
                key={f}
                className="text-[8px] px-2 py-0.5 rounded-full border cursor-pointer"
                style={i === 0 ? { backgroundColor: primaryColor, color: "white", borderColor: primaryColor } : {}}
              >
                {f}
              </span>
            ))}
            <span className="ml-auto text-[8px] text-muted-foreground">Showing 12 deals</span>
          </div>

          {/* Listings Grid */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold text-foreground">Available Off-Market Deals</h2>
              <span className="text-[8px] text-muted-foreground">Updated daily</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { address: "1423 Oak Ridge Dr", city: "Tampa, FL", price: "$165,000", arv: "$245,000", beds: 3, baths: 2, sqft: "1,450", roi: "32%", type: "Fix & Flip", status: "New", img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=200&fit=crop" },
                { address: "882 Palmetto Ave", city: "Orlando, FL", price: "$89,000", arv: "$155,000", beds: 2, baths: 1, sqft: "980", roi: "41%", type: "Wholesale", status: "Hot", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=200&fit=crop" },
                { address: "5501 Bayshore Blvd", city: "St Pete, FL", price: "$210,000", arv: "$310,000", beds: 4, baths: 2, sqft: "1,800", roi: "28%", type: "Buy & Hold", status: "New", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=200&fit=crop" },
                { address: "301 Magnolia St", city: "Clearwater, FL", price: "$125,000", arv: "$198,000", beds: 3, baths: 2, sqft: "1,200", roi: "35%", type: "BRRRR", status: "Price Drop", img: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=200&fit=crop" },
                { address: "7744 Elm Creek Rd", city: "Lakeland, FL", price: "$72,000", arv: "$130,000", beds: 2, baths: 1, sqft: "850", roi: "52%", type: "Wholesale", status: "Hot", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=200&fit=crop" },
                { address: "990 Sunset Terrace", city: "Sarasota, FL", price: "$185,000", arv: "$265,000", beds: 3, baths: 2, sqft: "1,550", roi: "25%", type: "Fix & Flip", status: "New", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=200&fit=crop" },
              ].map((deal, i) => (
                <div key={i} className="border rounded-lg overflow-hidden bg-background group">
                  {/* Property photo */}
                  <div className="h-[60px] relative overflow-hidden">
                    <img src={deal.img} alt={deal.address} className="w-full h-full object-cover" />
                    <span
                      className="absolute top-1 left-1 text-[6px] font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: deal.status === "Hot" ? "#ef4444" : deal.status === "Price Drop" ? "#f59e0b" : primaryColor }}
                    >
                      {deal.status}
                    </span>
                    <span className="absolute top-1 right-1 text-[6px] px-1.5 py-0.5 rounded bg-black/60 text-white font-medium">
                      {deal.type}
                    </span>
                  </div>
                  {/* Details */}
                  <div className="p-2">
                    <div className="text-[9px] font-bold text-foreground leading-tight">{deal.address}</div>
                    <div className="text-[7px] text-muted-foreground mb-1.5">{deal.city}</div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[11px] font-bold" style={{ color: primaryColor }}>{deal.price}</span>
                      <span className="text-[7px] text-muted-foreground">ARV: {deal.arv}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[7px] text-muted-foreground mb-1.5">
                      <span>{deal.beds}bd</span>
                      <span>{deal.baths}ba</span>
                      <span>{deal.sqft} sqft</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-semibold text-green-600">↑ {deal.roi} ROI</span>
                      <button
                        className="text-[7px] font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        View Deal
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA for buyers */}
          <div className="px-5 py-4 text-center bg-muted/10 border-t border-border">
            <h2 className="text-[13px] font-bold text-foreground mb-0.5">Want First Access To New Deals?</h2>
            <p className="text-[8px] text-muted-foreground mb-2">Join our buyers list and get notified before deals go public.</p>
            <button className="rounded-full px-4 py-1.5 text-[9px] font-bold text-white" style={{ backgroundColor: accentColor }}>
              {submitText}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ── STATS BAR ── */}
          {sShowStats && displayStats.length > 0 && (
            <div className="flex justify-around py-3 border-y border-border bg-muted/20">
              {displayStats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-[14px] font-bold text-foreground">{s.value}</div>
                  <div className="text-[8px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── HOW IT WORKS ── */}
          {sShowHowItWorks && displaySteps.length > 0 && (
            <div className="px-5 py-5 text-center">
              <h2 className="text-[14px] font-bold text-foreground mb-0.5">{displayHIWHeadline}</h2>
              <p className="text-[9px] text-muted-foreground mb-4">{displayHIWSubheadline}</p>
              <div className="flex gap-3">
                {displaySteps.map((step, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <div className="mx-auto w-8 h-8 rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: `${primaryColor}15` }}>
                      <span className="text-[10px] font-bold" style={{ color: primaryColor }}>0{idx + 1}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-foreground mb-0.5">{step.title}</div>
                    <div className="text-[8px] text-muted-foreground leading-tight">{step.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── COMPARISON TABLE ── */}
          {sShowComparison && displayCompRows.length > 0 && (
            <div className="px-5 py-5 bg-muted/10">
              <h2 className="text-[14px] font-bold text-foreground text-center mb-0.5">{replacePlaceholder(displayCompHeadline)}</h2>
              <p className="text-[9px] text-muted-foreground text-center mb-3">{defaults.comparisonSubheadline}</p>
              <div className="border rounded-lg overflow-hidden bg-background">
                <div className="grid grid-cols-3 text-[8px] font-semibold border-b">
                  <div className="p-1.5"></div>
                  <div className="p-1.5 text-center text-muted-foreground">{displayCompTradLabel}</div>
                  <div className="p-1.5 text-center text-white rounded-tr-lg" style={{ backgroundColor: primaryColor }}>{replacePlaceholder(displayCompCoLabel)}</div>
                </div>
                {displayCompRows.slice(0, 5).map((row, i) => (
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
          {sShowTestimonials && (
            <div className="px-5 py-5 text-center">
              <h2 className="text-[14px] font-bold text-foreground mb-0.5">{displayTestimonialsHeadline}</h2>
              {displayTestimonialsTagline && (
                <p className="text-[9px] mb-0.5" style={{ color: primaryColor }}>{displayTestimonialsTagline}</p>
              )}
              <p className="text-[9px] text-muted-foreground mb-3">{displayTestimonialsSubheadline}</p>
              <div className="flex gap-2">
                {displayTestimonials.map((t, i) => (
                  <div key={i} className="flex-1 border rounded-lg p-2 text-left bg-background">
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map(s => <Star key={s} className="h-2 w-2 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-[7px] text-muted-foreground mb-1.5 line-clamp-3">"{t.quote}"</p>
                    <div className="flex items-center gap-1">
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt={t.name} className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                          {t.name ? t.name.split(" ").map(n => n[0]).join("") : "?"}
                        </div>
                      )}
                      <div>
                        <div className="text-[7px] font-semibold text-foreground">{t.name || "Name"}</div>
                        <div className="text-[6px] text-muted-foreground">{[t.role, t.company].filter(Boolean).join(" · ") || "Role"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SITUATIONS ── */}
          {sShowSituations && displaySituations.length > 0 && (
            <div className="px-5 py-5 bg-muted/10 text-center">
              <h2 className="text-[14px] font-bold text-foreground mb-0.5">{displaySitHeadline}</h2>
              <p className="text-[9px] text-muted-foreground mb-3">{displaySitSubheadline}</p>
              <div className="grid grid-cols-6 gap-1.5">
                {displaySituations.map((s, i) => {
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
          {sShowFAQ && (
            <div className="px-5 py-5 text-center">
              <h2 className="text-[14px] font-bold text-foreground mb-0.5">{displayFAQHeadline}</h2>
              <p className="text-[9px] text-muted-foreground mb-3">Everything you need to know about selling with {company}</p>
              <div className="space-y-1 max-w-[350px] mx-auto">
                {(displayFAQItems || [
                  { question: "How does the cash offer process work?", answer: "" },
                  { question: "Are there any fees or commissions?", answer: "" },
                  { question: "Do I need to make repairs before selling?", answer: "" },
                  { question: "How fast can I close?", answer: "" },
                ]).map((q, i) => (
                  <div key={i} className="flex items-center justify-between border rounded px-2 py-1.5 text-left bg-background">
                    <span className="text-[8px] text-foreground">{q.question}</span>
                    <ChevronDown className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CTA BANNER ── */}
      {sShowCTA && (
        <div className="px-5 py-6 text-center text-white" style={{ backgroundColor: "#1a1a2e" }}>
          <h2 className="text-[14px] font-bold mb-1">{ctaHl}</h2>
          <p className="text-[9px] text-white/70 mb-3 max-w-[300px] mx-auto">{ctaSub}</p>
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
      )}

      {/* ── NEWSLETTER ── */}
      {showNewsletter && (
        <div className="px-5 py-4 border-t border-border" style={{ backgroundColor: primaryColor }}>
          <div className="text-center">
            <div className="text-[9px] font-bold text-white mb-0.5">{newsletterHeadline || "Stay Updated"}</div>
            <p className="text-[7px] text-white/70 mb-2">{newsletterDescription || "Get the latest news and updates"}</p>
            <div className="flex items-center gap-1 max-w-[200px] mx-auto">
              <div className="flex-1 bg-white/20 rounded px-2 py-1 text-[7px] text-white/50">{newsletterPlaceholder || "Enter your email"}</div>
              <div className="px-2 py-1 rounded text-[7px] font-semibold text-white" style={{ backgroundColor: accentColor }}>
                {newsletterButtonText || "Subscribe"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className={`px-5 py-4 border-t border-border text-${footerAlignment}`}>
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
            <p className="text-[7px] text-muted-foreground">{footerTagline || "We help homeowners sell their properties quickly and fairly."}</p>
            {/* Social Icons */}
            {showSocialLinks && socialProfiles && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {Object.entries(socialProfiles)
                  .filter(([, v]) => v.enabled)
                  .map(([key]) => (
                    <div
                      key={key}
                      className="w-3.5 h-3.5 rounded-sm flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span className="text-[5px] text-white font-bold">{key[0].toUpperCase()}</span>
                    </div>
                  ))}
              </div>
            )}
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
