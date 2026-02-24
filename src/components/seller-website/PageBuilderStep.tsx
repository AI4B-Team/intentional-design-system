import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AIWriterField } from "./AIWriterField";
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
  { id: "credibility", label: "Credibility Section", icon: Award, toggleKey: "showCredibilityBar" },
  { id: "stats", label: "Stats Bar", icon: BarChart3, toggleKey: "showStats" },
  { id: "howItWorks", label: "How It Works", icon: Wrench, toggleKey: "showHowItWorks" },
  { id: "comparison", label: "Comparison Table", icon: GitCompare, toggleKey: "showComparison" },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare, toggleKey: "showTestimonials" },
  { id: "situations", label: "Situations / Services", icon: Sparkles, toggleKey: "showSituations" },
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
            label="Trust Badge Text"
            fieldType="trustBadgeText"
            value={data.trustBadgeText || ""}
            onChange={(v: string) => onUpdate({ trustBadgeText: v })}
            placeholder="Rated 4.9★ By 2,400+ Homeowners"
            loadingField={aiWriter.loadingField}
            onGenerate={aiWriter.generateCopy}
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
          <AIWriterField
            label="Submit Button Text"
            fieldType="formSubmitText"
            value={data.formSubmitText || ""}
            onChange={(v: string) => onUpdate({ formSubmitText: v })}
            placeholder={selectedSiteType?.defaultCta || "Submit"}
            loadingField={aiWriter.loadingField}
            onGenerate={aiWriter.generateCopy}
          />
        </div>
      );

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
            <div className="space-y-2">
              {(data.credibilityLogos || []).map((logo: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={logo}
                    onChange={(v: string) => {
                      const updated = [...(data.credibilityLogos || [])];
                      updated[i] = v;
                      onUpdate({ credibilityLogos: updated });
                    }}
                    className="flex-1"
                    placeholder="Logo name"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => {
                      onUpdate({
                        credibilityLogos: (data.credibilityLogos || []).filter((_: any, idx: number) => idx !== i),
                      });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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
      return (
        <div className="space-y-3">
          <AIWriterField
            label="CTA Headline"
            fieldType="ctaHeadline"
            value={data.ctaHeadline || ""}
            onChange={(v: string) => onUpdate({ ctaHeadline: v })}
            placeholder="Ready To Sell Your House For Cash?"
            loadingField={aiWriter.loadingField}
            onGenerate={aiWriter.generateCopy}
          />
          <AIWriterField
            label="CTA Subheadline"
            fieldType="ctaSubheadline"
            value={data.ctaSubheadline || ""}
            onChange={(v: string) => onUpdate({ ctaSubheadline: v })}
            placeholder="Get your free, no-obligation cash offer..."
            multiline
            rows={2}
            loadingField={aiWriter.loadingField}
            onGenerate={aiWriter.generateCopy}
          />
        </div>
      );

    case "testimonials":
      return (
        <div className="space-y-3">
          <AIWriterField
            label="Section Headline"
            fieldType="testimonialsHeadline"
            value={data.testimonialsHeadline || ""}
            onChange={(v: string) => onUpdate({ testimonialsHeadline: v })}
            placeholder="What Our Clients Say"
            loadingField={aiWriter.loadingField}
            onGenerate={aiWriter.generateCopy}
          />
          <p className="text-xs text-muted-foreground">
            Testimonial content uses default examples. Full customization coming soon.
          </p>
        </div>
      );

    case "footer":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Company Name</Label>
            <Input
              value={data.companyName || ""}
              onChange={(v: string) => onUpdate({ companyName: v })}
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input
              value={data.companyPhone || ""}
              onChange={(v: string) => onUpdate({ companyPhone: v })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              value={data.companyEmail || ""}
              onChange={(v: string) => onUpdate({ companyEmail: v })}
              placeholder="info@company.com"
            />
          </div>
        </div>
      );

    default:
      return (
        <p className="text-xs text-muted-foreground">
          This section uses smart defaults based on your site type. Expanded editing coming soon.
        </p>
      );
  }
}
