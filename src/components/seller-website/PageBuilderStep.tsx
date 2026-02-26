import React, { useState, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AIWriterField } from "./AIWriterField";
import { StatsEditor, HowItWorksEditor, ComparisonEditor, SituationsEditor, FAQEditor, TestimonialsEditor, CTAEditor, FooterEditor, CoverageEditor } from "./SectionEditors";
import { NetworkLogo } from "./NetworkLogos";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  LayoutTemplate,
  Award,
  BarChart3,
  GitCompare,
  MessageSquare,
  HelpCircle,
  Megaphone,
  Footprints,
  Wrench,
  Sparkles,
  X,
  Plus,
  Lock,
  Upload,
  Image as ImageIcon,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageSection {
  id: string;
  label: string;
  icon: React.ElementType;
  toggleKey: string;
  locked?: boolean; // Hero is always on
}

const PAGE_SECTIONS: PageSection[] = [
  { id: "hero", label: "Hero Section", icon: LayoutTemplate, toggleKey: "", locked: true },
  { id: "optinForm", label: "Opt-In Form", icon: Lock, toggleKey: "", locked: true },
  { id: "credibility", label: "Credibility Section", icon: Award, toggleKey: "showCredibilityBar" },
  { id: "stats", label: "Stats Bar", icon: BarChart3, toggleKey: "showStats" },
  { id: "howItWorks", label: "How It Works", icon: Wrench, toggleKey: "showHowItWorks" },
  { id: "comparison", label: "Comparison Table", icon: GitCompare, toggleKey: "showComparison" },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare, toggleKey: "showTestimonials" },
  { id: "situations", label: "Situations / Services", icon: Sparkles, toggleKey: "showSituations" },
  { id: "coverage", label: "Coverage / Service Areas", icon: MapPin, toggleKey: "showCoverage" },
  { id: "faq", label: "FAQ Section", icon: HelpCircle, toggleKey: "showFAQ" },
  { id: "cta", label: "Call To Action", icon: Megaphone, toggleKey: "showCTA" },
  { id: "footer", label: "Footer", icon: Footprints, toggleKey: "", locked: true },
];

interface PageBuilderStepProps {
  data: Record<string, any>;
  onUpdate: (updates: Record<string, any>) => void;
  aiWriter: {
    loadingField: string | null;
    generateCopy: (fieldType: string, currentValue: string, context?: string) => Promise<string | null>;
  };
  selectedSiteType: any;
}

export function PageBuilderStep({ data, onUpdate, aiWriter, selectedSiteType }: PageBuilderStepProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [sectionOrder, setSectionOrder] = useState<string[]>(PAGE_SECTIONS.map((s) => s.id));

  const toggleExpand = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    setSectionOrder((prev) => {
      const idx = prev.indexOf(id);
      if (direction === "up" && idx > 0) {
        const next = [...prev];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        return next;
      }
      if (direction === "down" && idx < prev.length - 1) {
        const next = [...prev];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        return next;
      }
      return prev;
    });
  };

  const enabledCount = PAGE_SECTIONS.filter(
    (s) => s.locked || (s.toggleKey && data[s.toggleKey])
  ).length;

  const orderedSections = sectionOrder
    .map((id) => PAGE_SECTIONS.find((s) => s.id === id))
    .filter(Boolean) as PageSection[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Page Sections</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {enabledCount} of {PAGE_SECTIONS.length} Enabled
        </span>
      </div>

      {/* Section Cards */}
      <div className="space-y-2">
        {orderedSections.map((section, idx) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;
          const isEnabled = section.locked || (section.toggleKey ? data[section.toggleKey] : true);

          return (
            <div key={section.id} className="border border-border rounded-lg bg-background">
              {/* Reorder arrows */}
              <div className="flex items-center">
                <div className="flex flex-col items-center px-1 py-2 text-muted-foreground">
                  <button
                    onClick={() => moveSection(section.id, "up")}
                    disabled={idx === 0}
                    className="p-0.5 hover:text-foreground disabled:opacity-20"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <GripVertical className="h-3 w-3 opacity-40" />
                  <button
                    onClick={() => moveSection(section.id, "down")}
                    disabled={idx === orderedSections.length - 1}
                    className="p-0.5 hover:text-foreground disabled:opacity-20"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                {/* Section header */}
                <button
                  onClick={() => toggleExpand(section.id)}
                  className="flex-1 flex items-center gap-3 px-3 py-3 text-left"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground flex-1">
                    {section.label}
                  </span>
                  {section.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                </button>

                {/* Toggle + expand */}
                <div className="flex items-center gap-2 pr-3">
                  {!section.locked && section.toggleKey && (
                    <Switch
                      checked={!!data[section.toggleKey]}
                      onCheckedChange={(v) => onUpdate({ [section.toggleKey]: v })}
                    />
                  )}
                  <button
                    onClick={() => toggleExpand(section.id)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">
                  {renderSectionEditor(section.id, data, onUpdate, aiWriter, selectedSiteType)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FORM_FIELD_OPTIONS = [
  { id: "address", label: "Property Address", icon: "📍" },
  { id: "name", label: "Name (First & Last)", icon: "👤" },
  { id: "phone", label: "Phone Number", icon: "📞" },
  { id: "email", label: "Email Address", icon: "✉️" },
  { id: "condition", label: "Property Condition", icon: "🏠" },
  { id: "timeline", label: "Selling Timeline", icon: "📅" },
  { id: "reason", label: "Reason for Selling", icon: "❓" },
  { id: "property_type", label: "Property Type", icon: "🏘️" },
  { id: "beds_baths", label: "Beds / Baths", icon: "🛏️" },
  { id: "notes", label: "Additional Notes", icon: "📝" },
  { id: "how_heard", label: "How Did You Hear About Us", icon: "📣" },
];

function OptInFormEditor({
  data,
  onUpdate,
  aiWriter,
}: {
  data: Record<string, any>;
  onUpdate: (updates: Record<string, any>) => void;
  aiWriter: any;
}) {
  const formFields: string[] = data.formFields || ["address", "name", "phone", "email"];

  const toggleField = (fieldId: string) => {
    const current = [...formFields];
    if (current.includes(fieldId)) {
      onUpdate({ formFields: current.filter((f) => f !== fieldId) });
    } else {
      onUpdate({ formFields: [...current, fieldId] });
    }
  };

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const current = [...formFields];
    const idx = current.indexOf(fieldId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= current.length) return;
    [current[idx], current[swapIdx]] = [current[swapIdx], current[idx]];
    onUpdate({ formFields: current });
  };

  return (
    <div className="space-y-4">
      {/* Form Headline */}
      <AIWriterField
        label="Form Headline"
        fieldType="formHeadline"
        value={data.formHeadline || ""}
        onChange={(v: string) => onUpdate({ formHeadline: v })}
        placeholder="Get Your Free Cash Offer"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      {/* Form Subheadline */}
      <AIWriterField
        label="Form Subheadline"
        fieldType="formSubheadline"
        value={data.formSubheadline || ""}
        onChange={(v: string) => onUpdate({ formSubheadline: v })}
        placeholder="No Obligation. No Pressure. Takes 7 Minutes."
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />

      {/* Form Fields */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Form Fields</Label>
        <p className="text-[10px] text-muted-foreground mb-2">Toggle fields on/off and reorder them.</p>
        <div className="space-y-1">
          {/* Active fields first, in order */}
          {formFields.map((fieldId, idx) => {
            const opt = FORM_FIELD_OPTIONS.find((f) => f.id === fieldId);
            if (!opt) return null;
            return (
              <div
                key={fieldId}
                className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5"
              >
                <span className="text-sm">{opt.icon}</span>
                <span className="text-xs flex-1">{opt.label}</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={idx === 0}
                  onClick={() => moveField(fieldId, "up")}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={idx === formFields.length - 1}
                  onClick={() => moveField(fieldId, "down")}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="text-destructive hover:text-destructive/80"
                  onClick={() => toggleField(fieldId)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Inactive fields */}
        {FORM_FIELD_OPTIONS.filter((f) => !formFields.includes(f.id)).length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] text-muted-foreground mb-1">Available fields:</p>
            <div className="flex flex-wrap gap-1">
              {FORM_FIELD_OPTIONS.filter((f) => !formFields.includes(f.id)).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-[10px] hover:bg-muted transition-colors"
                  onClick={() => toggleField(opt.id)}
                >
                  <Plus className="h-3 w-3" />
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button Text */}
      <AIWriterField
        label="Submit Button Text"
        fieldType="formSubmitText"
        value={data.formSubmitText || ""}
        onChange={(v: string) => onUpdate({ formSubmitText: v })}
        placeholder="Get My Cash Offer →"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />

      {/* Privacy Text */}
      <div>
        <Label className="text-xs font-medium mb-1 block">Privacy Notice (below button)</Label>
        <Input
          value={data.formPrivacyText ?? "🔒 Your info is safe. We never share or sell your data."}
          onChange={(e) => onUpdate({ formPrivacyText: e.target.value })}
          placeholder="🔒 Your info is safe. We never share or sell your data."
          className="text-xs"
        />
        <p className="text-[10px] text-muted-foreground mt-1">Leave blank to hide.</p>
      </div>
    </div>
  );
}


function renderSectionEditor(
  sectionId: string,
  data: Record<string, any>,
  onUpdate: (updates: Record<string, any>) => void,
  aiWriter: any,
  selectedSiteType: any
) {
  switch (sectionId) {
    case "hero":
      return (
        <div className="space-y-3">
          <AIWriterField
            label="Trust Badge Text"
            fieldType="trustBadgeText"
            value={data.trustBadgeText || ""}
            onChange={(v: string) => onUpdate({ trustBadgeText: v })}
            placeholder="Rated 4.9★ By 2,400+ Homeowners"
            loadingField={aiWriter.loadingField}
            onGenerate={aiWriter.generateCopy}
          />
          <AIWriterField
            label="Headline"
            fieldType="heroHeadline"
            value={data.heroHeadline || ""}
            onChange={(v: string) => onUpdate({ heroHeadline: v })}
            placeholder={selectedSiteType?.defaultHeadline || "Your Main Headline"}
            loadingField={aiWriter.loadingField}
            onGenerate={aiWriter.generateCopy}
          />
          <AIWriterField
            label="Subheadline"
            fieldType="heroSubheadline"
            value={data.heroSubheadline || ""}
            onChange={(v: string) => onUpdate({ heroSubheadline: v })}
            placeholder={selectedSiteType?.defaultSubheadline || "Supporting text..."}
            multiline
            rows={2}
            loadingField={aiWriter.loadingField}
            onGenerate={aiWriter.generateCopy}
            context={data.heroHeadline}
          />
          <AIWriterField
            label="Benefits Line"
            fieldType="benefitsLine"
            value={data.benefitsLine || ""}
            onChange={(v: string) => onUpdate({ benefitsLine: v })}
            placeholder="NO Commissions! NO Repairs! NO Listing Fees!"
            loadingField={aiWriter.loadingField}
            onGenerate={aiWriter.generateCopy}
          />
        </div>
      );

    case "optinForm":
      return <OptInFormEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} />;

    case "credibility":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Animated (Scrolling Marquee)</Label>
            <Switch
              checked={data.credibilityAnimated || false}
              onCheckedChange={(v) => onUpdate({ credibilityAnimated: v })}
            />
          </div>
          <div>
            <Label className="text-xs mb-2 block">Logos / Networks</Label>
            <div className="space-y-3">
              {(data.credibilityLogos || []).map((logo: string, i: number) => {
                const logoImages: Record<string, string> = data.credibilityLogoImages || {};
                const imageUrl = logoImages[String(i)];
                return (
                   <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                    {/* Logo preview */}
                    {logo && !imageUrl && (
                      <div className="flex items-center justify-center bg-muted/30 rounded-md py-2">
                        <NetworkLogo name={logo} sizeClass="text-base" colorClass="text-foreground" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        value={logo}
                        onChange={(v: string) => {
                          const updated = [...(data.credibilityLogos || [])];
                          updated[i] = v;
                          onUpdate({ credibilityLogos: updated });
                        }}
                        className="flex-1"
                        placeholder="Logo name (e.g. Forbes)"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                          const newLogos = (data.credibilityLogos || []).filter((_: any, idx: number) => idx !== i);
                          const oldImages: Record<string, string> = data.credibilityLogoImages || {};
                          const newImages: Record<string, string> = {};
                          let newIdx = 0;
                          for (let j = 0; j < (data.credibilityLogos || []).length; j++) {
                            if (j === i) continue;
                            if (oldImages[String(j)]) {
                              newImages[String(newIdx)] = oldImages[String(j)];
                            }
                            newIdx++;
                          }
                          onUpdate({ credibilityLogos: newLogos, credibilityLogoImages: newImages });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {imageUrl ? (
                      <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
                        <img src={imageUrl} alt={logo} className="h-8 max-w-[100px] object-contain" />
                        <span className="text-[10px] text-muted-foreground flex-1">Custom logo</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-destructive hover:text-destructive px-2"
                          onClick={() => {
                            const updated = { ...(data.credibilityLogoImages || {}) };
                            delete updated[String(i)];
                            onUpdate({ credibilityLogoImages: updated });
                          }}
                        >
                          Remove
                        </Button>
                        <LogoImageUpload
                          imageUrl={imageUrl}
                          onUpload={(url) => {
                            const updated = { ...(data.credibilityLogoImages || {}), [String(i)]: url };
                            onUpdate({ credibilityLogoImages: updated });
                          }}
                          onRemove={() => {
                            const updated = { ...(data.credibilityLogoImages || {}) };
                            delete updated[String(i)];
                            onUpdate({ credibilityLogoImages: updated });
                          }}
                        />
                      </div>
                    ) : (
                      <LogoImageUploadFull
                        onUpload={(url) => {
                          const updated = { ...(data.credibilityLogoImages || {}), [String(i)]: url };
                          onUpdate({ credibilityLogoImages: updated });
                        }}
                      />
                    )}
                  </div>
                );
              })}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onUpdate({ credibilityLogos: [...(data.credibilityLogos || []), ""] })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Logo
              </Button>
            </div>
          </div>
        </div>
      );

    case "cta":
      return <CTAEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} selectedSiteType={selectedSiteType} />;

    case "testimonials":
      return <TestimonialsEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} selectedSiteType={selectedSiteType} />;

    case "footer":
      return <FooterEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} />;

    case "stats":
      return <StatsEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} selectedSiteType={selectedSiteType} />;

    case "howItWorks":
      return <HowItWorksEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} selectedSiteType={selectedSiteType} />;

    case "comparison":
      return <ComparisonEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} selectedSiteType={selectedSiteType} />;

    case "situations":
      return <SituationsEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} selectedSiteType={selectedSiteType} />;

    case "faq":
      return <FAQEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} selectedSiteType={selectedSiteType} />;

    case "coverage":
      return <CoverageEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} />;

    default:
      return (
        <p className="text-xs text-muted-foreground">
          No additional settings for this section.
        </p>
      );
  }
}

function LogoImageUpload({
  imageUrl,
  onUpload,
  onRemove,
}: {
  imageUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);
    // Reset so re-selecting the same file works
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        onClick={() => inputRef.current?.click()}
        title={imageUrl ? "Replace logo image" : "Upload logo image"}
      >
        {imageUrl ? <ImageIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
      </Button>
    </>
  );
}

function LogoImageUploadFull({ onUpload }: { onUpload: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <Upload className="h-3.5 w-3.5" />
        Upload Custom Logo Image
      </button>
    </>
  );
}
