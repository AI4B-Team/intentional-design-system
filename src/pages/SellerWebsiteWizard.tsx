import React, { useState } from "react";
import { getSiteTypeDefaults } from "@/components/seller-website/siteTypeConfig";
import { WizardLivePreview } from "@/components/seller-website/WizardLivePreview";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AIWriterField } from "@/components/seller-website/AIWriterField";
import { useAIWriter } from "@/hooks/useAIWriter";
import { BrandingStep } from "@/components/seller-website/BrandingStep";
import { PageBuilderStep } from "@/components/seller-website/PageBuilderStep";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Palette,
  FileText,
  Bell,
  Rocket,
  Upload,
  Home,
  Users,
  Building2,
  Zap,
  Sparkles,
  LayoutTemplate,
  Wand2,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  X,
  Plus,
  Image as ImageIcon,
  Brush,
  HelpCircle,
  ChevronDown,
  Scale,
  Cookie,
  ShieldAlert,
  FileText as FileTextIcon,
  Shield,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateWebsite } from "@/hooks/useSellerWebsites";
import { useAuth } from "@/contexts/AuthContext";

// ── Site Type Definitions ──
const SITE_TYPES = [
  {
    id: "seller",
    name: "Seller Site",
    description: "Capture motivated seller leads with a 'We Buy Houses' page",
    icon: Home,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    defaultHeadline: "We Buy Houses Fast For Cash",
    defaultSubheadline: "Get a fair cash offer in 24 hours. No repairs, no fees, no hassle.",
    defaultCta: "Get My Cash Offer",
  },
  {
    id: "buyer",
    name: "Buyer Site",
    description: "Showcase deals and properties to attract cash buyers",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    defaultHeadline: "Exclusive Off-Market Deals",
    defaultSubheadline: "Join our buyers list for first access to below-market investment properties.",
    defaultCta: "Join Buyers List",
  },
  {
    id: "company",
    name: "Company Site",
    description: "Professional company website with about, services, and contact info",
    icon: Building2,
    color: "text-violet-600",
    bg: "bg-violet-50",
    defaultHeadline: "Your Trusted Real Estate Partner",
    defaultSubheadline: "We help homeowners sell fast and investors find great deals.",
    defaultCta: "Contact Us",
  },
  {
    id: "squeeze",
    name: "Squeeze Page",
    description: "Minimal, high-converting single-purpose lead capture page",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    defaultHeadline: "Free Home Valuation",
    defaultSubheadline: "Enter your address to get an instant cash offer — no obligation.",
    defaultCta: "Get My Offer Now",
  },
];

// ── Creation Method ──
const CREATION_METHODS = [
  {
    id: "template",
    name: "Start From Template",
    description: "Choose From Professionally Designed Templates",
    icon: LayoutTemplate,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "scratch",
    name: "Build From Scratch",
    description: "Start With A Blank Canvas And Customize Everything",
    icon: Palette,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    id: "ai",
    name: "AI-Generated",
    description: "Describe Your Site And Let AI Create It For You",
    icon: Wand2,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

// ── Templates per site type ──
const TEMPLATES: Record<string, Array<{ id: string; name: string; color: string; description: string }>> = {
  seller: [
    { id: "modern-seller", name: "Modern Clean", color: "#2563EB", description: "Clean blue tones, trust-focused" },
    { id: "bold-seller", name: "Bold & Urgent", color: "#DC2626", description: "Red/orange urgency design" },
    { id: "friendly-seller", name: "Friendly & Warm", color: "#16A34A", description: "Welcoming green tones" },
    { id: "professional-seller", name: "Professional", color: "#1E293B", description: "Dark/slate executive" },
  ],
  buyer: [
    { id: "investor-modern", name: "Investor Modern", color: "#0EA5E9", description: "Clean sky blue investor appeal" },
    { id: "deal-flow", name: "Deal Flow", color: "#8B5CF6", description: "Purple-accented deal showcase" },
    { id: "marketplace", name: "Marketplace", color: "#059669", description: "Green grid-based listing view" },
  ],
  company: [
    { id: "corporate", name: "Corporate", color: "#1E293B", description: "Sleek dark professional" },
    { id: "modern-brand", name: "Modern Brand", color: "#2563EB", description: "Clean blue branding" },
    { id: "warm-company", name: "Warm & Personal", color: "#D97706", description: "Warm amber tones" },
  ],
  squeeze: [
    { id: "minimal-dark", name: "Minimal Dark", color: "#18181B", description: "Dark, high contrast" },
    { id: "minimal-light", name: "Minimal Light", color: "#2563EB", description: "Clean white with accent" },
    { id: "urgency", name: "Urgency", color: "#DC2626", description: "Red countdown style" },
  ],
};

const FORM_FIELD_OPTIONS = [
  { id: "name", label: "Name (First & Last)", default: true },
  { id: "phone", label: "Phone Number", default: true },
  { id: "email", label: "Email Address", default: true },
  { id: "condition", label: "Property Condition", default: true },
  { id: "timeline", label: "Selling Timeline", default: true },
  { id: "reason", label: "Reason for Selling", default: false },
  { id: "property_type", label: "Property Type (SFH, Multi, etc.)", default: false },
  { id: "beds_baths", label: "Beds/Baths", default: false },
  { id: "notes", label: "Additional Notes", default: false },
  { id: "how_heard", label: "How Did You Hear About Us", default: false },
];

const STEPS = [
  { id: 1, title: "Site Type", icon: Globe, description: "Choose your site type" },
  { id: 2, title: "Setup", icon: Palette, description: "Company info" },
  { id: 3, title: "Branding", icon: Brush, description: "Logo, colors & fonts" },
  { id: 4, title: "Page", icon: FileText, description: "Page builder" },
  { id: 5, title: "Notifications", icon: Bell, description: "Lead alerts" },
  { id: 6, title: "Domain", icon: Globe, description: "URL & publish" },
  { id: 7, title: "Legal", icon: Scale, description: "Legal & compliance" },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

interface WizardData {
  siteType: string;
  creationMethod: string;
  aiPrompt: string;
  template: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  logoUrl: string;
  faviconUrl: string;
  selectedIcon: string;
  logoMode: "icon" | "upload";
  primaryColor: string;
  accentColor: string;
  fontPairing: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string;
  formFields: string[];
  formSubmitText: string;
  notifyEmail: string;
  notifySms: string;
  autoRespondEmail: boolean;
  autoRespondSms: boolean;
  slug: string;
  customDomain: string;
  publishNow: boolean;
  // Credibility bar
  showCredibilityBar: boolean;
  credibilityLogos: string[];
  credibilityLogoImages: Record<string, string>;
  credibilityAnimated: boolean;
  // Section toggles
  showStats: boolean;
  showHowItWorks: boolean;
  showComparison: boolean;
  showTestimonials: boolean;
  showSituations: boolean;
  showCoverage: boolean;
  showFAQ: boolean;
  showCTA: boolean;
  // Editable content
  trustBadgeText: string;
  benefitsLine: string;
  ctaHeadline: string;
  ctaSubheadline: string;
  ctaButtons: Array<{ label: string; variant: "primary" | "secondary"; link: string }>;
  // Section content
  statsItems: Array<{ value: string; label: string }>;
  processSteps: Array<{ step: number; title: string; description: string }>;
  howItWorksHeadline: string;
  howItWorksSubheadline: string;
  comparisonHeadline: string;
  comparisonSubheadline: string;
  comparisonTraditionalLabel: string;
  comparisonCompanyLabel: string;
  comparisonRows: Array<{ label: string; traditional: string; company: string }>;
  situationsHeadline: string;
  situationsSubheadline: string;
  situationItems: Array<{ icon: string; label: string }>;
  coverageHeadline: string;
  coverageSubheadline: string;
  coverageStates: string[];
  faqHeadline: string;
  faqItems: Array<{ question: string; answer: string }>;
  testimonialsHeadline: string;
  testimonialsTagline: string;
  testimonialsSubheadline: string;
  testimonialItems: Array<{ name: string; role: string; company: string; quote: string; imageUrl: string }>;
  // Footer
  footerTagline: string;
  footerAlignment: "left" | "center" | "right";
  showSocialLinks: boolean;
  socialProfiles: Record<string, { enabled: boolean; url: string }>;
  showNewsletter: boolean;
  newsletterHeadline: string;
  newsletterDescription: string;
  newsletterButtonText: string;
  newsletterPlaceholder: string;
  // Legal
  legalCompanyName: string;
  legalEmail: string;
  legalAddress: string;
  showCookieBanner: boolean;
  showAgeVerification: boolean;
  legalDocs: Array<{ id: string; title: string; icon: string; enabled: boolean; content: string; lastUpdated: string }>;
}

const DEFAULT_CREDIBILITY_LOGOS = ["Forbes", "NBC", "CBS", "Fox"];

function DomainSetupGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Setup Guide</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 text-sm border-t border-border pt-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">How Custom Domains Work</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground text-xs">
              <li>Enter your domain name below (e.g., <code className="bg-muted px-1 rounded text-foreground">sellmyhouse.com</code>)</li>
              <li>Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)</li>
              <li>Add an <strong className="text-foreground">A Record</strong> pointing to <code className="bg-muted px-1 rounded text-foreground">185.158.133.1</code></li>
              <li>Add a <strong className="text-foreground">www</strong> A Record also pointing to <code className="bg-muted px-1 rounded text-foreground">185.158.133.1</code></li>
              <li>Wait for DNS propagation (usually 15 min – 72 hours)</li>
              <li>SSL certificate is provisioned automatically</li>
            </ol>
          </div>
          <div className="bg-muted/50 rounded-md p-3 space-y-1">
            <h5 className="text-xs font-semibold text-foreground">DNS Records Summary</h5>
            <div className="grid grid-cols-3 gap-1 text-[11px]">
              <span className="text-muted-foreground font-medium">Type</span>
              <span className="text-muted-foreground font-medium">Name</span>
              <span className="text-muted-foreground font-medium">Value</span>
              <span className="text-foreground">A</span>
              <span className="text-foreground">@</span>
              <span className="font-mono text-foreground">185.158.133.1</span>
              <span className="text-foreground">A</span>
              <span className="text-foreground">www</span>
              <span className="font-mono text-foreground">185.158.133.1</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Remove any conflicting A or CNAME records for your root domain and www subdomain before adding the new records.
          </p>
        </div>
      )}
    </div>
  );
}

const LEGAL_DOC_ICONS: Record<string, React.ElementType> = {
  scroll: ScrollText,
  shield: Shield,
  scale: Scale,
  cookie: Cookie,
};

function LegalDocumentsList({ data, updateData, aiWriter }: { data: any; updateData: (u: any) => void; aiWriter: any }) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const docs: Array<{ id: string; title: string; icon: string; enabled: boolean; content: string; lastUpdated: string }> = data.legalDocs || [];

  const updateDoc = (idx: number, field: string, val: any) => {
    const updated = [...docs];
    updated[idx] = { ...updated[idx], [field]: val };
    updateData({ legalDocs: updated });
  };

  return (
    <div className="space-y-3">
      {docs.map((doc, i) => {
        const IconComp = LEGAL_DOC_ICONS[doc.icon] || FileTextIcon;
        const isExpanded = expandedDoc === doc.id;

        return (
          <div key={doc.id} className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <IconComp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">Last Updated: {doc.lastUpdated}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={doc.enabled}
                  onCheckedChange={(v) => updateDoc(i, "enabled", v)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                >
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                </Button>
              </div>
            </div>
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <Textarea
                  value={doc.content}
                  onChange={(e) => updateDoc(i, "content", e.target.value)}
                  placeholder={`Enter your ${doc.title} content here...`}
                  className="min-h-[200px] font-mono text-xs"
                />
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={aiWriter.loadingField !== null}
                    onClick={async () => {
                      const companyName = data.legalCompanyName || data.companyName || "our company";
                      const prompt = `Generate a professional ${doc.title} document for "${companyName}". Include standard legal sections appropriate for a real estate website. Use plain language. Format with numbered sections and clear headings.`;
                      try {
                        const result = await aiWriter.generateCopy(`legal_${doc.id}`, doc.content, prompt);
                        if (result) {
                          updateDoc(i, "content", result);
                          updateDoc(i, "lastUpdated", new Date().toLocaleDateString());
                        }
                      } catch { /* ignore */ }
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Customize With AI
                  </Button>
                  <span className="text-xs text-muted-foreground">AI will personalize this document with your company details</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

type DeviceType = "desktop" | "tablet" | "mobile";

export default function SellerWebsiteWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createWebsite = useCreateWebsite();
  const [currentStep, setCurrentStep] = useState(1);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [data, setData] = useState<WizardData>({
    siteType: "",
    creationMethod: "",
    aiPrompt: "",
    template: "",
    companyName: "",
    companyPhone: "",
    companyEmail: user?.email || "",
    logoUrl: "",
    faviconUrl: "",
    selectedIcon: "",
    logoMode: "icon",
    primaryColor: "#2563EB",
    accentColor: "#10B981",
    fontPairing: "default",
    heroHeadline: "",
    heroSubheadline: "",
    heroImageUrl: "",
    formFields: FORM_FIELD_OPTIONS.filter((f) => f.default).map((f) => f.id),
    formSubmitText: "",
    notifyEmail: user?.email || "",
    notifySms: "",
    autoRespondEmail: true,
    autoRespondSms: false,
    slug: "",
    customDomain: "",
    publishNow: true,
    showCredibilityBar: true,
    credibilityLogos: [...DEFAULT_CREDIBILITY_LOGOS],
    credibilityLogoImages: {},
    credibilityAnimated: false,
    showStats: true,
    showHowItWorks: true,
    showComparison: true,
    showTestimonials: true,
    showSituations: true,
    showCoverage: true,
    showFAQ: true,
    showCTA: true,
    trustBadgeText: "Rated 4.9★ By 2,400+ Homeowners",
    benefitsLine: "NO Commissions! NO Repairs! NO Listing Fees! NO Hassles!",
    ctaHeadline: "Ready To Sell Your House For Cash?",
    ctaSubheadline: "Get your free, no-obligation cash offer in under 2 minutes.",
    ctaButtons: [],
    statsItems: [
      { value: "2,400+", label: "Homes Purchased" },
      { value: "$480M+", label: "Paid to Homeowners" },
      { value: "4.9★", label: "Google Rating" },
      { value: "6", label: "Avg. Days to Close" },
    ],
    processSteps: [
      { step: 1, title: "Submit Your Property", description: "Fill out our simple form or give us a call." },
      { step: 2, title: "Get Your Cash Offer", description: "We'll present a fair, no-obligation cash offer within 24 hours." },
      { step: 3, title: "Close & Get Paid", description: "Pick your closing date. We handle all paperwork and you walk away with cash." },
    ],
    howItWorksHeadline: "How It Works",
    howItWorksSubheadline: "Three simple steps — no surprises, no hidden costs",
    comparisonHeadline: "Why Sellers Choose {companyName}",
    comparisonSubheadline: "See how we compare to listing with an agent",
    comparisonTraditionalLabel: "Traditional Agent",
    comparisonCompanyLabel: "{companyName}",
    comparisonRows: [
      { label: "Commissions & Fees", traditional: "6% ($18,000+)", company: "$0" },
      { label: "Closing Costs", traditional: "Seller pays", company: "We pay" },
      { label: "Time to Close", traditional: "60–90 days", company: "3–14 days" },
      { label: "Repairs Required", traditional: "Yes", company: "None" },
      { label: "Showings & Open Houses", traditional: "Required", company: "None" },
      { label: "Certainty of Sale", traditional: "Uncertain", company: "Guaranteed" },
      { label: "Closing Date", traditional: "Buyer decides", company: "You choose" },
    ],
    situationsHeadline: "We Buy Houses In Any Situation",
    situationsSubheadline: "Whatever you're going through, we've helped someone just like you",
    situationItems: [
      { icon: "clock", label: "Foreclosure" },
      { icon: "home", label: "Inherited Property" },
      { icon: "users", label: "Divorce" },
      { icon: "briefcase", label: "Relocating" },
      { icon: "dollar", label: "Behind on Payments" },
      { icon: "building", label: "Vacant Property" },
    ],
    coverageHeadline: "Areas We Serve",
    coverageSubheadline: "We buy houses across these states — select yours to learn more",
    coverageStates: ["FL", "TX", "GA", "NC", "OH"],
    faqHeadline: "Frequently Asked Questions",
    faqItems: [],
    testimonialsHeadline: "Real Stories From Real Sellers",
    testimonialsTagline: "Over 1,000 Homeowners Have Successfully Sold Their Home",
    testimonialsSubheadline: "Don't Take Our Word For It — Take Theirs",
    testimonialItems: [],
    footerTagline: "We help homeowners sell their properties quickly and fairly.",
    footerAlignment: "left" as const,
    showSocialLinks: true,
    socialProfiles: {
      facebook: { enabled: false, url: "" },
      instagram: { enabled: false, url: "" },
      twitter: { enabled: false, url: "" },
      tiktok: { enabled: false, url: "" },
      youtube: { enabled: false, url: "" },
      linkedin: { enabled: false, url: "" },
      pinterest: { enabled: false, url: "" },
      threads: { enabled: false, url: "" },
      bluesky: { enabled: false, url: "" },
      reddit: { enabled: false, url: "" },
      snapchat: { enabled: false, url: "" },
    },
    showNewsletter: true,
    newsletterHeadline: "Stay Updated",
    newsletterDescription: "Get the latest news and updates",
    newsletterButtonText: "Subscribe",
    newsletterPlaceholder: "Enter your email",
    legalCompanyName: "",
    legalEmail: "",
    legalAddress: "",
    showCookieBanner: true,
    showAgeVerification: false,
    legalDocs: [
      { id: "tos", title: "Terms of Service", icon: "scroll", enabled: true, content: "", lastUpdated: new Date().toLocaleDateString() },
      { id: "privacy", title: "Privacy Policy", icon: "shield", enabled: true, content: "", lastUpdated: new Date().toLocaleDateString() },
      { id: "refund", title: "Refund Policy", icon: "scale", enabled: true, content: "", lastUpdated: new Date().toLocaleDateString() },
      { id: "cookie", title: "Cookie Policy", icon: "cookie", enabled: true, content: "", lastUpdated: new Date().toLocaleDateString() },
    ],
  });

  const aiWriter = useAIWriter({ siteType: data.siteType, companyName: data.companyName });

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const selectedSiteType = SITE_TYPES.find((t) => t.id === data.siteType);

  const handleSiteTypeSelect = (typeId: string) => {
    const siteType = SITE_TYPES.find((t) => t.id === typeId);
    if (siteType) {
      const defaults = getSiteTypeDefaults(typeId);
      const defaultTestimonials = [
        { name: "Sarah Mitchell", role: "Homeowner", company: "Miami, FL", quote: "After my mother passed, I inherited a house I couldn't maintain. They gave me a fair cash offer and closed in 5 days.", imageUrl: "" },
        { name: "James Rivera", role: "Homeowner", company: "Austin, TX", quote: "We had 3 weeks to move. They made an offer the next day and closed before our move date.", imageUrl: "" },
        { name: "Marcus Johnson", role: "Homeowner", company: "Phoenix, AZ", quote: "I was behind on payments and getting letters from the bank. They bought my house in 6 days.", imageUrl: "" },
      ];
      const defaultFaqItems = [
        { question: "How does the cash offer process work?", answer: "Simply submit your property details through our form, and we'll present you with a fair cash offer within 24 hours. No obligation." },
        { question: "Are there any fees or commissions?", answer: "Absolutely not. We charge zero fees and zero commissions. The offer you accept is the amount you receive." },
        { question: "Do I need to make repairs before selling?", answer: "No repairs needed. We buy houses in any condition — as-is, no questions asked." },
        { question: "How fast can I close?", answer: "We can close in as little as 3 days, or on your timeline. You pick the date that works best for you." },
      ];
      updateData({
        siteType: typeId,
        heroHeadline: siteType.defaultHeadline,
        heroSubheadline: siteType.defaultSubheadline,
        formSubmitText: siteType.defaultCta,
        ctaHeadline: defaults.ctaHeadline,
        ctaSubheadline: defaults.ctaSubheadline,
        testimonialItems: defaultTestimonials,
        faqItems: defaultFaqItems,
        faqHeadline: "Frequently Asked Questions",
      });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const allTemplates = Object.values(TEMPLATES).flat();
    const template = allTemplates.find((t) => t.id === templateId);
    updateData({
      template: templateId,
      primaryColor: template?.color || "#2563EB",
    });
  };

  const toggleFormField = (fieldId: string) => {
    setData((prev) => ({
      ...prev,
      formFields: prev.formFields.includes(fieldId)
        ? prev.formFields.filter((f) => f !== fieldId)
        : [...prev.formFields, fieldId],
    }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      if (currentStep === 5 && !data.slug && data.companyName) {
        updateData({ slug: generateSlug(data.companyName) });
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    try {
      const website = await createWebsite.mutateAsync({
        name: data.companyName || "My Website",
        slug: data.slug || generateSlug(data.companyName || "my-website"),
        site_type: data.siteType,
        company_name: data.companyName,
        company_phone: data.companyPhone || undefined,
        company_email: data.companyEmail || undefined,
        logo_url: data.logoUrl || undefined,
        primary_color: data.primaryColor,
        accent_color: data.accentColor,
        hero_headline: data.heroHeadline,
        hero_subheadline: data.heroSubheadline,
        hero_image_url: data.heroImageUrl || undefined,
        form_fields: ["address", ...data.formFields],
        form_submit_text: data.formSubmitText,
        lead_notification_email: data.notifyEmail || undefined,
        lead_notification_sms: data.notifySms || undefined,
        auto_respond_email: data.autoRespondEmail,
        auto_respond_sms: data.autoRespondSms,
        status: data.publishNow ? "published" : "draft",
      });

      navigate(`/websites/${website.id}/edit`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.siteType && data.creationMethod;
      case 2:
        return data.companyName.trim().length > 0;
      case 6:
        return data.slug.trim().length > 0;
      default:
        return true;
    }
  };

  const currentTemplates = TEMPLATES[data.siteType] || TEMPLATES.seller;

  const getDeviceWidth = () => {
    switch (device) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      default: return "100%";
    }
  };

  // ── Step Title & Description ──
  const getStepHeader = () => {
    switch (currentStep) {
      case 1: return { title: "What Kind Of Website Do You Want To Build?", desc: "Choose a site type and how you'd like to create it" };
      case 2: return { title: `Set Up Your ${selectedSiteType?.name || "Website"}`, desc: data.creationMethod === "template" ? "Choose a template and enter your company info" : "Enter your company info to get started" };
      case 3: return { title: "Branding", desc: "Customize your brand identity with logos, colors, and themes" };
      case 4: return { title: "Page Builder", desc: "Configure and customize your page sections. Changes are reflected in the live preview." };
      case 5: return { title: "How Should We Notify You?", desc: "Configure notifications and auto-responses" };
      case 6: return { title: "Domain Settings", desc: "Connect your custom domain for a fully branded experience" };
      case 7: return { title: "Legal & Compliance", desc: "Configure legal documents and compliance settings for your platform" };
      default: return { title: "", desc: "" };
    }
  };

  const stepHeader = getStepHeader();

  return (
    <div className="flex h-full overflow-hidden bg-background" style={{ minHeight: "calc(100vh - 56px)" }}>
      {/* Left Step Navigation */}
      <div className="w-[240px] flex-shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden">
        {/* Back button */}
        <div className="p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate("/websites")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back To Websites
          </Button>
        </div>

        {/* Site info */}
        {selectedSiteType && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-md", selectedSiteType.bg)}>
                <selectedSiteType.icon className={cn("h-4 w-4", selectedSiteType.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{data.companyName || "New Website"}</p>
                <p className="text-xs text-muted-foreground">{selectedSiteType.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">Configuration</p>
          <nav className="space-y-1">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isComplete = step.id < currentStep;
              const isClickable = true;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  disabled={false}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-foreground hover:bg-accent/50 cursor-pointer"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                      isComplete
                        ? "bg-success text-success-foreground"
                        : isActive
                        ? "bg-brand text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isComplete ? <Check className="h-3.5 w-3.5" /> : step.id}
                  </div>
                  <span>{step.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Center: Form Inputs */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-8 py-8">
            {/* Step Header */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-foreground">{stepHeader.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{stepHeader.desc}</p>
            </div>

            {/* Step 1: Site Type */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Site Type</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {SITE_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = data.siteType === type.id;
                      return (
                        <button
                          key={type.id}
                          onClick={() => handleSiteTypeSelect(type.id)}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-lg border text-left transition-colors",
                            isSelected
                              ? "border-brand bg-brand/5 ring-1 ring-brand/20"
                              : "border-border hover:border-brand/50"
                          )}
                        >
                          <div className={cn("p-2 rounded-lg shrink-0", type.bg)}>
                            <Icon className={cn("h-5 w-5", type.color)} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground">{type.name}</div>
                            <div className="text-sm text-muted-foreground mt-0.5">{type.description}</div>
                          </div>
                          {isSelected && <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {data.siteType && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">How Do You Want To Create It?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {CREATION_METHODS.map((method) => {
                        const Icon = method.icon;
                        const isSelected = data.creationMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            onClick={() => updateData({ creationMethod: method.id })}
                            className={cn(
                              "flex flex-col items-center gap-2 p-5 rounded-lg border text-center transition-colors",
                              isSelected
                                ? "border-brand bg-brand/5 ring-1 ring-brand/20"
                                : "border-border hover:border-brand/50"
                            )}
                          >
                            <div className={cn("p-3 rounded-lg", method.bg)}>
                              <Icon className={cn("h-6 w-6", method.color)} />
                            </div>
                            <div className="font-medium text-foreground">{method.name}</div>
                            <div className="text-xs text-muted-foreground">{method.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {data.creationMethod === "ai" && (
                  <div>
                    <Label htmlFor="aiPrompt">Describe your website</Label>
                    <Textarea
                      id="aiPrompt"
                      value={data.aiPrompt}
                      onChange={(e) => updateData({ aiPrompt: e.target.value })}
                      placeholder={`Describe your ideal ${selectedSiteType?.name || "website"}...`}
                      rows={4}
                      className="mt-2"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-muted-foreground">
                        AI will generate your site content, design, and structure
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Setup */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {data.creationMethod === "template" && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Choose a Template</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {currentTemplates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => handleTemplateSelect(template.id)}
                          className={cn(
                            "relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all",
                            data.template === template.id
                              ? "border-brand ring-2 ring-brand/20"
                              : "border-border hover:border-brand/50"
                          )}
                        >
                          <div className="h-24" style={{ backgroundColor: template.color }} />
                          <div className="p-3">
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className="text-xs text-muted-foreground">{template.description}</div>
                          </div>
                          {data.template === template.id && (
                            <div className="absolute top-2 right-2 bg-brand text-white rounded-full p-1">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">
                      Company / Website Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      value={data.companyName}
                      onChange={(e) => updateData({ companyName: e.target.value })}
                      placeholder="ABC Home Buyers"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone">Phone Number</Label>
                    <Input
                      id="companyPhone"
                      value={data.companyPhone}
                      onChange={(e) => updateData({ companyPhone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={data.companyEmail}
                    onChange={(e) => updateData({ companyEmail: e.target.value })}
                    placeholder="info@company.com"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Branding */}
            {currentStep === 3 && (
              <BrandingStep
                logoUrl={data.logoUrl}
                faviconUrl={data.faviconUrl}
                selectedIcon={data.selectedIcon}
                logoMode={data.logoMode}
                primaryColor={data.primaryColor}
                accentColor={data.accentColor}
                fontPairing={data.fontPairing}
                companyName={data.companyName}
                siteType={data.siteType}
                onUpdate={updateData}
                aiWriter={aiWriter}
              />
            )}

            {/* Step 4: Page Builder */}
            {currentStep === 4 && (
              <PageBuilderStep
                data={data}
                onUpdate={updateData}
                aiWriter={aiWriter}
                selectedSiteType={selectedSiteType}
              />
            )}

            {/* Step 5: Notifications */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Notify me via:</Label>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-3 mb-2">
                        <Checkbox checked={!!data.notifyEmail} onCheckedChange={() => {}} />
                        <span>Email</span>
                      </label>
                      <Input
                        value={data.notifyEmail}
                        onChange={(e) => updateData({ notifyEmail: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-3 mb-2">
                        <Checkbox
                          checked={!!data.notifySms}
                          onCheckedChange={(checked) =>
                            updateData({ notifySms: checked ? data.companyPhone : "" })
                          }
                        />
                        <span>SMS</span>
                      </label>
                      <Input
                        value={data.notifySms}
                        onChange={(e) => updateData({ notifySms: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Auto-respond to leads:</Label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={data.autoRespondEmail}
                          onCheckedChange={(checked) => updateData({ autoRespondEmail: !!checked })}
                        />
                        <div>
                          <div className="font-medium">Send automatic email confirmation</div>
                          <div className="text-sm text-muted-foreground">Instantly confirm receipt to leads</div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={data.autoRespondSms}
                          onCheckedChange={(checked) => updateData({ autoRespondSms: !!checked })}
                        />
                        <div>
                          <div className="font-medium">Send automatic SMS confirmation</div>
                          <div className="text-sm text-muted-foreground">Text leads when they submit</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Domain Settings */}
            {currentStep === 6 && (
              <div className="space-y-6">
                {/* Setup Guide */}
                <DomainSetupGuide />

                <div>
                  <Label htmlFor="slug">Website URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">/s/</span>
                    <Input
                      id="slug"
                      value={data.slug}
                      onChange={(e) => updateData({ slug: generateSlug(e.target.value) })}
                      placeholder="my-website"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your website will be at: /s/{data.slug || "your-url"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="customDomain">Custom Domain (optional)</Label>
                  <Input
                    id="customDomain"
                    value={data.customDomain}
                    onChange={(e) => updateData({ customDomain: e.target.value })}
                    placeholder="mywebsite.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Point your domain's DNS to our servers. Works without a custom domain too.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Publish Options</Label>
                  <RadioGroup
                    value={data.publishNow ? "now" : "draft"}
                    onValueChange={(value) => updateData({ publishNow: value === "now" })}
                    className="space-y-3"
                  >
                    <label
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        data.publishNow ? "border-brand bg-brand/5" : "border-border hover:border-brand/50"
                      )}
                    >
                      <RadioGroupItem value="now" className="mt-0.5" />
                      <div>
                        <div className="font-medium">Publish Now</div>
                        <div className="text-sm text-muted-foreground">Go live immediately</div>
                      </div>
                    </label>
                    <label
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        !data.publishNow ? "border-brand bg-brand/5" : "border-border hover:border-brand/50"
                      )}
                    >
                      <RadioGroupItem value="draft" className="mt-0.5" />
                      <div>
                        <div className="font-medium">Save as Draft</div>
                        <div className="text-sm text-muted-foreground">Edit more before publishing</div>
                      </div>
                    </label>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 7: Legal & Compliance */}
            {currentStep === 7 && (
              <div className="space-y-6">
                {/* Company Information */}
                <div className="border border-border rounded-lg p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Company Information</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">This information will be used across all legal documents</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Company Name</Label>
                      <Input
                        value={data.legalCompanyName || data.companyName}
                        onChange={(e) => updateData({ legalCompanyName: e.target.value })}
                        placeholder="Your Company Name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Legal Email</Label>
                      <Input
                        value={data.legalEmail}
                        onChange={(e) => updateData({ legalEmail: e.target.value })}
                        placeholder="legal@yourcompany.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Business Address</Label>
                    <Input
                      value={data.legalAddress}
                      onChange={(e) => updateData({ legalAddress: e.target.value })}
                      placeholder="123 Business Street, City, Country"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Compliance Settings */}
                <div className="border border-border rounded-lg p-5 space-y-3">
                  <h3 className="font-semibold text-foreground">Compliance Settings</h3>
                  <div className="border border-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cookie className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Cookie Consent Banner</p>
                        <p className="text-xs text-muted-foreground">Show GDPR-compliant cookie notice</p>
                      </div>
                    </div>
                    <Switch
                      checked={data.showCookieBanner}
                      onCheckedChange={(v) => updateData({ showCookieBanner: v })}
                    />
                  </div>
                  <div className="border border-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Age Verification</p>
                        <p className="text-xs text-muted-foreground">Require users to confirm they are 18+</p>
                      </div>
                    </div>
                    <Switch
                      checked={data.showAgeVerification}
                      onCheckedChange={(v) => updateData({ showAgeVerification: v })}
                    />
                  </div>
                </div>

                {/* Legal Documents */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Legal Documents</h3>
                    <span className="text-sm text-muted-foreground">
                      {data.legalDocs.filter((d) => d.enabled).length} of {data.legalDocs.length} Enabled
                    </span>
                  </div>
                  <LegalDocumentsList data={data} updateData={updateData} aiWriter={aiWriter} />
                </div>

                {/* Legal Disclaimer */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Legal Disclaimer</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        These templates are provided as a starting point. We recommend having a legal professional review all documents before publishing to ensure compliance with local laws and regulations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={currentStep === 1 ? () => navigate("/websites") : handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentStep === 1 ? "Cancel" : "Back"}
              </Button>

              {currentStep < 7 ? (
                <Button variant="default" onClick={handleNext} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleCreate}
                  disabled={!canProceed() || createWebsite.isPending}
                >
                  {createWebsite.isPending ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <Rocket className="h-4 w-4 mr-2" />
                  )}
                  {createWebsite.isPending ? "Creating..." : "Create Website"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="w-[45%] flex-shrink-0 border-l border-border flex flex-col bg-muted/30">
        {/* Preview Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Live Preview</span>
            <Badge variant="secondary" className="text-xs">Auto-Sync</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={device === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setDevice("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={device === "tablet" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setDevice("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={device === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setDevice("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-4 flex justify-center">
          <div
            className="bg-background rounded-lg border border-border shadow-sm overflow-hidden transition-all duration-300"
            style={{
              width: getDeviceWidth(),
              maxWidth: "100%",
              minHeight: "500px",
            }}
          >
            {/* Mock browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2 bg-muted border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground text-center truncate">
                  {data.customDomain || `${data.slug || "your-site"}.yourdomain.app`}
                </div>
              </div>
            </div>

            {/* Preview Body */}
            <div className="p-0">
              {/* Nav */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  {data.logoUrl ? (
                    <img src={data.logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
                  ) : (
                    <div className="h-6 w-6 rounded-md" style={{ backgroundColor: data.primaryColor }} />
                  )}
                  <span className="font-semibold text-xs">{data.companyName || "Your Company"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Login</span>
                  <button className="h-6 px-3 rounded-md text-[10px] font-medium text-white" style={{ backgroundColor: data.primaryColor }}>
                    {data.formSubmitText || "Get Started"}
                  </button>
                </div>
              </div>

              {/* Full Preview Body */}
              <WizardLivePreview
                siteType={data.siteType}
                companyName={data.companyName}
                companyPhone={data.companyPhone}
                companyEmail={data.companyEmail}
                primaryColor={data.primaryColor}
                accentColor={data.accentColor}
                heroHeadline={data.heroHeadline}
                heroSubheadline={data.heroSubheadline}
                formSubmitText={data.formSubmitText}
                logoUrl={data.logoUrl}
                showCredibilityBar={data.showCredibilityBar}
                credibilityLogos={data.credibilityLogos}
                credibilityLogoImages={data.credibilityLogoImages}
                credibilityAnimated={data.credibilityAnimated}
                showStats={data.showStats}
                showHowItWorks={data.showHowItWorks}
                showComparison={data.showComparison}
                showTestimonials={data.showTestimonials}
                showSituations={data.showSituations}
                showCoverage={data.showCoverage}
                showFAQ={data.showFAQ}
                showCTA={data.showCTA}
                trustBadgeText={data.trustBadgeText}
                benefitsLine={data.benefitsLine}
                ctaHeadline={data.ctaHeadline}
                ctaSubheadline={data.ctaSubheadline}
                statsItems={data.statsItems}
                processSteps={data.processSteps}
                howItWorksHeadline={data.howItWorksHeadline}
                howItWorksSubheadline={data.howItWorksSubheadline}
                comparisonHeadline={data.comparisonHeadline}
                comparisonSubheadline={data.comparisonSubheadline}
                comparisonTraditionalLabel={data.comparisonTraditionalLabel}
                comparisonCompanyLabel={data.comparisonCompanyLabel}
                comparisonRows={data.comparisonRows}
                situationsHeadline={data.situationsHeadline}
                situationsSubheadline={data.situationsSubheadline}
                situationItems={data.situationItems}
                coverageHeadline={data.coverageHeadline}
                coverageSubheadline={data.coverageSubheadline}
                coverageStates={data.coverageStates}
                faqHeadline={data.faqHeadline}
                faqItems={data.faqItems}
                testimonialsHeadline={data.testimonialsHeadline}
                testimonialsTagline={data.testimonialsTagline}
                testimonialsSubheadline={data.testimonialsSubheadline}
                testimonialItems={data.testimonialItems}
                footerTagline={data.footerTagline}
                footerAlignment={data.footerAlignment}
                showSocialLinks={data.showSocialLinks}
                socialProfiles={data.socialProfiles}
                showNewsletter={data.showNewsletter}
                newsletterHeadline={data.newsletterHeadline}
                newsletterDescription={data.newsletterDescription}
                newsletterButtonText={data.newsletterButtonText}
                newsletterPlaceholder={data.newsletterPlaceholder}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
