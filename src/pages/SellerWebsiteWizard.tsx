import React, { useState } from "react";
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
    name: "Start from Template",
    description: "Choose From Professionally Designed Templates",
    icon: LayoutTemplate,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "scratch",
    name: "Build from Scratch",
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
  { id: 2, title: "Setup", icon: Palette, description: "Company & branding" },
  { id: 3, title: "Content", icon: FileText, description: "Headlines & form" },
  { id: 4, title: "Notifications", icon: Bell, description: "Lead alerts" },
  { id: 5, title: "Publish", icon: Rocket, description: "Domain & go live" },
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
  primaryColor: string;
  accentColor: string;
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
    primaryColor: "#2563EB",
    accentColor: "#10B981",
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
  });

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const selectedSiteType = SITE_TYPES.find((t) => t.id === data.siteType);

  const handleSiteTypeSelect = (typeId: string) => {
    const siteType = SITE_TYPES.find((t) => t.id === typeId);
    if (siteType) {
      updateData({
        siteType: typeId,
        heroHeadline: siteType.defaultHeadline,
        heroSubheadline: siteType.defaultSubheadline,
        formSubmitText: siteType.defaultCta,
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
    if (currentStep < 5) {
      if (currentStep === 4 && !data.slug && data.companyName) {
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
      case 5:
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
      case 3: return { title: "Customize Your Content", desc: "Edit your headline, form fields, and more" };
      case 4: return { title: "How Should We Notify You?", desc: "Configure notifications and auto-responses" };
      case 5: return { title: "Your Website Is Ready!", desc: "Configure your URL and publish" };
      default: return { title: "", desc: "" };
    }
  };

  const stepHeader = getStepHeader();

  return (
    <div className="flex h-full overflow-hidden bg-background" style={{ minHeight: "calc(100vh - 56px)" }}>
      {/* Left Step Navigation */}
      <div className="w-[240px] flex-shrink-0 border-r border-border bg-surface flex flex-col">
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
        <div className="px-3 py-4 flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">Configuration</p>
          <nav className="space-y-1">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isComplete = step.id < currentStep;
              const isClickable = step.id <= currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && setCurrentStep(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : isComplete
                      ? "text-foreground hover:bg-accent/50 cursor-pointer"
                      : "text-muted-foreground cursor-not-allowed"
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
                    <Label className="text-sm font-medium mb-3 block">How do you want to create it?</Label>
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
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={data.primaryColor}
                        onChange={(e) => updateData({ primaryColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        id="primaryColor"
                        value={data.primaryColor}
                        onChange={(e) => updateData({ primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={data.accentColor}
                        onChange={(e) => updateData({ accentColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        id="accentColor"
                        value={data.accentColor}
                        onChange={(e) => updateData({ accentColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

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

                <div>
                  <Label>Upload Logo</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Content */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="heroHeadline">Hero Headline</Label>
                  <Input
                    id="heroHeadline"
                    value={data.heroHeadline}
                    onChange={(e) => updateData({ heroHeadline: e.target.value })}
                    placeholder={selectedSiteType?.defaultHeadline || "Your Main Headline"}
                  />
                </div>

                <div>
                  <Label htmlFor="heroSubheadline">Hero Subheadline</Label>
                  <Textarea
                    id="heroSubheadline"
                    value={data.heroSubheadline}
                    onChange={(e) => updateData({ heroSubheadline: e.target.value })}
                    placeholder={selectedSiteType?.defaultSubheadline || "Your supporting text..."}
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Form Fields</Label>
                  <div className="p-3 bg-muted rounded-lg mb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox checked disabled />
                      <span className="font-medium">Property Address</span>
                      <span className="text-xs text-muted-foreground">(Required)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {FORM_FIELD_OPTIONS.map((field) => (
                      <label
                        key={field.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={data.formFields.includes(field.id)}
                          onCheckedChange={() => toggleFormField(field.id)}
                        />
                        <span>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="formSubmitText">Submit Button Text</Label>
                  <Input
                    id="formSubmitText"
                    value={data.formSubmitText}
                    onChange={(e) => updateData({ formSubmitText: e.target.value })}
                    placeholder={selectedSiteType?.defaultCta || "Submit"}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Notifications */}
            {currentStep === 4 && (
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

            {/* Step 5: Publish */}
            {currentStep === 5 && (
              <div className="space-y-6">
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

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={currentStep === 1 ? () => navigate("/websites") : handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentStep === 1 ? "Cancel" : "Back"}
              </Button>

              {currentStep < 5 ? (
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
                heroHeadline={data.heroHeadline}
                heroSubheadline={data.heroSubheadline}
                formSubmitText={data.formSubmitText}
                logoUrl={data.logoUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
