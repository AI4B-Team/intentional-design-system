import React, { useState, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Mail,
  FileText,
  Layers,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageSection {
  id: string;
  label: string;
  icon: React.ElementType;
  toggleKey: string;
  locked?: boolean;
}

const PAGE_SECTIONS: PageSection[] = [
  { id: "hero", label: "Hero Section", icon: LayoutTemplate, toggleKey: "", locked: true },
  { id: "optinForm", label: "Opt-In Form", icon: Lock, toggleKey: "", locked: true },
  { id: "thankYou", label: "Thank You Page", icon: CheckCircle2, toggleKey: "showThankYou" },
  { id: "followUp", label: "Follow-Up Questionnaire", icon: ClipboardList, toggleKey: "showFollowUp" },
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

type BuilderTab = "page" | "emails" | "files";

export function PageBuilderStep({ data, onUpdate, aiWriter, selectedSiteType }: PageBuilderStepProps) {
  const [activeTab, setActiveTab] = useState<BuilderTab>("page");
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

  const TABS: { id: BuilderTab; label: string; icon: React.ElementType }[] = [
    { id: "page", label: "Page", icon: Layers },
    { id: "emails", label: "Emails", icon: Mail },
    { id: "files", label: "Files", icon: FileText },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Page Tab */}
      {activeTab === "page" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Page Sections</h3>
            <span className="text-xs text-muted-foreground">
              {enabledCount} of {PAGE_SECTIONS.length} Enabled
            </span>
          </div>
          <div className="space-y-2">
            {orderedSections.map((section, idx) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id;
              const isEnabled = section.locked || (section.toggleKey ? data[section.toggleKey] : true);

              return (
                <div key={section.id} className="border border-border rounded-lg bg-background">
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
      )}

      {/* Emails Tab */}
      {activeTab === "emails" && (
        <EmailAutomationEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} />
      )}

      {/* Files Tab */}
      {activeTab === "files" && (
        <FileDeliveryEditor data={data} onUpdate={onUpdate} />
      )}
    </div>
  );
}

// ─── Form Field Options ──────────────────────────────────────────────────────

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

// ─── OptIn Form Editor ───────────────────────────────────────────────────────

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
      <AIWriterField
        label="Form Headline"
        fieldType="formHeadline"
        value={data.formHeadline || ""}
        onChange={(v: string) => onUpdate({ formHeadline: v })}
        placeholder="Get Your Free Cash Offer"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <AIWriterField
        label="Form Subheadline"
        fieldType="formSubheadline"
        value={data.formSubheadline || ""}
        onChange={(v: string) => onUpdate({ formSubheadline: v })}
        placeholder="No Obligation. No Pressure. Takes 7 Minutes."
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <div>
        <Label className="text-xs font-medium mb-2 block">Form Fields</Label>
        <p className="text-[10px] text-muted-foreground mb-2">Toggle fields on/off and reorder them.</p>
        <div className="space-y-1">
          {formFields.map((fieldId, idx) => {
            const opt = FORM_FIELD_OPTIONS.find((f) => f.id === fieldId);
            if (!opt) return null;
            return (
              <div key={fieldId} className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
                <span className="text-sm">{opt.icon}</span>
                <span className="text-xs flex-1">{opt.label}</span>
                <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={idx === 0} onClick={() => moveField(fieldId, "up")}>
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={idx === formFields.length - 1} onClick={() => moveField(fieldId, "down")}>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="text-destructive hover:text-destructive/80" onClick={() => toggleField(fieldId)}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
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
      <AIWriterField
        label="Submit Button Text"
        fieldType="formSubmitText"
        value={data.formSubmitText || ""}
        onChange={(v: string) => onUpdate({ formSubmitText: v })}
        placeholder="Get My Cash Offer →"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
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
      <AITip text="Forms with 3–5 fields convert 40% better than long forms. Keep required fields minimal — collect more via the follow-up questionnaire." />
    </div>
  );
}

// ─── Thank You Page Editor ──────────────────────────────────────────────────

function ThankYouPageEditor({
  data,
  onUpdate,
  aiWriter,
}: {
  data: Record<string, any>;
  onUpdate: (updates: Record<string, any>) => void;
  aiWriter: any;
}) {
  const steps: string[] = data.thankYouSteps || [];

  return (
    <div className="space-y-4">
      <AIWriterField
        label="Headline"
        fieldType="thankYouHeadline"
        value={data.thankYouHeadline || ""}
        onChange={(v: string) => onUpdate({ thankYouHeadline: v })}
        placeholder="We've Got Your Info!"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <AIWriterField
        label="Subheadline"
        fieldType="thankYouSubheadline"
        value={data.thankYouSubheadline || ""}
        onChange={(v: string) => onUpdate({ thankYouSubheadline: v })}
        placeholder="Our team is reviewing your property details..."
        multiline
        rows={2}
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />

      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Show "Next Steps" Section</Label>
        <Switch
          checked={data.thankYouShowNextSteps ?? true}
          onCheckedChange={(v) => onUpdate({ thankYouShowNextSteps: v })}
        />
      </div>

      {data.thankYouShowNextSteps && (
        <div className="space-y-2">
          <Label className="text-xs font-medium block">Steps</Label>
          {steps.map((step: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                {i + 1}
              </span>
              <Input
                value={step}
                onChange={(e) => {
                  const updated = [...steps];
                  updated[i] = e.target.value;
                  onUpdate({ thankYouSteps: updated });
                }}
                className="text-xs"
              />
              <button
                type="button"
                className="text-destructive hover:text-destructive/80"
                onClick={() => onUpdate({ thankYouSteps: steps.filter((_: string, idx: number) => idx !== i) })}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onUpdate({ thankYouSteps: [...steps, "New step..."] })}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Step
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Auto-Redirect After Submission</Label>
        <Switch
          checked={data.thankYouRedirectAfter ?? false}
          onCheckedChange={(v) => onUpdate({ thankYouRedirectAfter: v })}
        />
      </div>

      {data.thankYouRedirectAfter && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium mb-1 block">Redirect URL</Label>
            <Input
              value={data.thankYouRedirectUrl || ""}
              onChange={(e) => onUpdate({ thankYouRedirectUrl: e.target.value })}
              placeholder="https://yoursite.com/next-step"
              className="text-xs"
            />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 block">Redirect After (seconds)</Label>
            <Input
              type="number"
              value={data.thankYouRedirectDelay || 3}
              onChange={(e) => onUpdate({ thankYouRedirectDelay: parseInt(e.target.value) || 3 })}
              className="text-xs w-20"
            />
          </div>
        </div>
      )}

      <AITip text="A 'What Happens Next' section reduces seller anxiety and cuts no-show rates by 35%. Show exactly 3 steps — more creates overwhelm." />
    </div>
  );
}

// ─── Follow-Up Questionnaire Editor ─────────────────────────────────────────

function FollowUpEditor({
  data,
  onUpdate,
}: {
  data: Record<string, any>;
  onUpdate: (updates: Record<string, any>) => void;
}) {
  const followUpSteps: Array<{
    id: string;
    enabled: boolean;
    title: string;
    fields: Array<{
      id: string;
      label: string;
      type: string;
      options?: string[];
      placeholder?: string;
    }>;
  }> = data.followUpSteps || [];

  const updateStep = (stepIdx: number, updates: Record<string, any>) => {
    const updated = [...followUpSteps];
    updated[stepIdx] = { ...updated[stepIdx], ...updates };
    onUpdate({ followUpSteps: updated });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Shown after the opt-in form is submitted. Collects deeper property info while the lead is engaged.
      </p>

      {followUpSteps.map((step, si) => (
        <div key={step.id} className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50">
            <span className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0",
              step.enabled ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30 text-muted-foreground"
            )}>
              {si + 1}
            </span>
            <Input
              value={step.title}
              onChange={(e) => updateStep(si, { title: e.target.value })}
              className="text-xs font-semibold border-none bg-transparent h-7 p-0"
            />
            <Switch
              checked={step.enabled}
              onCheckedChange={(v) => updateStep(si, { enabled: v })}
            />
          </div>
          {step.enabled && (
            <div className="p-3 space-y-1.5">
              {step.fields.map((field) => (
                <div key={field.id} className="flex items-center gap-2 px-2 py-1.5 bg-muted/30 border border-border rounded-md">
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] text-foreground flex-1">{field.label}</span>
                  <Badge variant="secondary" className="text-[10px] h-5">{field.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <AITip text="Multi-step questionnaires collect 3x more data than single forms. Break into bite-sized steps (3–4 questions each) to maintain momentum." />
    </div>
  );
}

// ─── Email Automation Editor ─────────────────────────────────────────────────

const DELAY_OPTIONS = [
  { value: "immediately", label: "Immediately after opt-in" },
  { value: "1h", label: "1 hour after opt-in" },
  { value: "24h", label: "24 hours later (Day 1)" },
  { value: "3d", label: "3 days later" },
  { value: "7d", label: "7 days later" },
  { value: "14d", label: "14 days later" },
  { value: "30d", label: "30 days later" },
];

const EMAIL_TOKENS = ["{{first_name}}", "{{property_address}}", "{{company_name}}", "{{phone_number}}", "{{offer_amount}}"];

function EmailAutomationEditor({
  data,
  onUpdate,
  aiWriter,
}: {
  data: Record<string, any>;
  onUpdate: (updates: Record<string, any>) => void;
  aiWriter: any;
}) {
  const emails: Array<{
    id: string;
    enabled: boolean;
    label: string;
    delay: string;
    delayValue: string;
    subject: string;
    preview: string;
    body: string;
  }> = data.emailSequence || [];

  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const updateEmail = (index: number, updates: Record<string, any>) => {
    const updated = [...emails];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ emailSequence: updated });
  };

  const addEmail = () => {
    const newEmail = {
      id: `e${emails.length + 1}`,
      enabled: true,
      label: `Custom Email ${emails.length + 1}`,
      delay: "Custom",
      delayValue: "7d",
      subject: "Following up...",
      preview: "",
      body: "Hi {{first_name}},\n\n",
    };
    onUpdate({ emailSequence: [...emails, newEmail] });
  };

  const removeEmail = (index: number) => {
    onUpdate({ emailSequence: emails.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Email Automation Sequence</h3>
        <p className="text-xs text-muted-foreground">Triggered when a lead submits the opt-in form</p>
      </div>

      <AITip text="Your 5-email sequence is optimized for motivated sellers. The 24h cadence for the first 3 days captures 70% of deal-ready leads before they go cold." />

      {/* Token Buttons */}
      <div>
        <Label className="text-[10px] text-muted-foreground mb-1 block">Available Tokens (click to copy)</Label>
        <div className="flex flex-wrap gap-1">
          {EMAIL_TOKENS.map((t) => (
            <button
              key={t}
              onClick={() => navigator.clipboard.writeText(t)}
              className="bg-muted border border-border rounded px-2 py-0.5 text-[10px] text-foreground hover:bg-muted/80 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Email Cards */}
      <div className="space-y-2">
        {emails.map((email, i) => {
          const isExpanded = expandedEmail === email.id;
          return (
            <div key={email.id} className="border border-border rounded-lg overflow-hidden">
              <div
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedEmail(isExpanded ? null : email.id)}
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{email.label}</p>
                  <p className="text-[10px] text-muted-foreground">{email.delay}</p>
                </div>
                <Switch
                  checked={email.enabled}
                  onCheckedChange={(v) => { updateEmail(i, { enabled: v }); }}
                  onClick={(e) => e.stopPropagation()}
                />
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
              </div>
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-border space-y-3">
                  <div>
                    <Label className="text-[11px] font-semibold mb-1 block">Subject Line</Label>
                    <Input
                      value={email.subject}
                      onChange={(e) => updateEmail(i, { subject: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold mb-1 block">Preview Text</Label>
                    <Input
                      value={email.preview}
                      onChange={(e) => updateEmail(i, { preview: e.target.value })}
                      placeholder="Short preview shown in inbox..."
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold mb-1 block">Email Body</Label>
                    <Textarea
                      value={email.body}
                      onChange={(e) => updateEmail(i, { body: e.target.value })}
                      rows={4}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold mb-1 block">Send Delay</Label>
                    <Select
                      value={email.delayValue}
                      onValueChange={(value) => {
                        const opt = DELAY_OPTIONS.find((d) => d.value === value);
                        updateEmail(i, { delayValue: value, delay: opt?.label || value });
                      }}
                    >
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DELAY_OPTIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value} className="text-xs">
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive text-xs"
                    onClick={() => removeEmail(i)}
                  >
                    <X className="h-3 w-3 mr-1" /> Remove Email
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="w-full border-dashed text-xs"
        onClick={addEmail}
      >
        <Plus className="h-3.5 w-3.5 mr-1" /> Add Email to Sequence
      </Button>

      {/* Trigger Settings */}
      <div className="border border-border rounded-lg p-3 space-y-3 bg-muted/30">
        <h4 className="text-xs font-semibold text-foreground">Trigger Settings</h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground">Send on weekdays only</span>
          <Switch
            checked={data.emailSendWeekdaysOnly ?? true}
            onCheckedChange={(v) => onUpdate({ emailSendWeekdaysOnly: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground">Stop sequence on reply</span>
          <Switch
            checked={data.emailStopOnReply ?? true}
            onCheckedChange={(v) => onUpdate({ emailStopOnReply: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground">Stop when deal marked closed</span>
          <Switch
            checked={data.emailStopOnDealClosed ?? true}
            onCheckedChange={(v) => onUpdate({ emailStopOnDealClosed: v })}
          />
        </div>
        <AITip text="Stopping sequences when leads reply increases trust. 62% of deals are closed by sellers who received 3+ follow-up emails." />
      </div>
    </div>
  );
}

// ─── File Delivery Editor ────────────────────────────────────────────────────

function FileDeliveryEditor({
  data,
  onUpdate,
}: {
  data: Record<string, any>;
  onUpdate: (updates: Record<string, any>) => void;
}) {
  const SUGGESTED_FILES = [
    "Home Seller's Guide (PDF)",
    "What to Expect During Closing (PDF)",
    "Avoid These Costly Mistakes (PDF)",
    "Cash vs. Agent: Real Cost Comparison",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">File / PDF Delivery</h3>
          <p className="text-xs text-muted-foreground">Send files to subscribers after opt-in</p>
        </div>
        <Switch
          checked={data.fileDeliveryEnabled ?? false}
          onCheckedChange={(v) => onUpdate({ fileDeliveryEnabled: v })}
        />
      </div>

      {!data.fileDeliveryEnabled && (
        <div className="bg-muted/30 border-2 border-dashed border-border rounded-lg p-6 text-center">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground mt-2">Enable to send PDFs, guides, or resources to your leads automatically.</p>
        </div>
      )}

      {data.fileDeliveryEnabled && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-5 text-center bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
            <Upload className="h-6 w-6 mx-auto text-primary" />
            <p className="text-xs font-semibold text-primary mt-2">Upload PDF or File</p>
            <p className="text-[10px] text-muted-foreground mt-1">PDF, DOC, JPG up to 25MB</p>
          </div>

          <div>
            <Label className="text-[11px] font-semibold mb-2 block">Suggested Resources:</Label>
            <div className="space-y-1">
              {SUGGESTED_FILES.map((f) => (
                <div key={f} className="flex items-center gap-2 px-2 py-1.5 bg-muted/30 border border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                  <FileText className="h-3 w-3 text-primary shrink-0" />
                  <span className="text-[11px] text-foreground flex-1">{f}</span>
                  <span className="text-[10px] text-muted-foreground">Use template</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[11px] font-semibold mb-1 block">Delivery Method</Label>
            <Select
              value={data.fileDeliveryMethod || "email"}
              onValueChange={(v) => onUpdate({ fileDeliveryMethod: v })}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email" className="text-xs">Send via Email (with download link)</SelectItem>
                <SelectItem value="thankYouPage" className="text-xs">Show on Thank You Page</SelectItem>
                <SelectItem value="both" className="text-xs">Both Email + Thank You Page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(data.fileDeliveryMethod === "email" || data.fileDeliveryMethod === "both") && (
            <div className="space-y-3">
              <div>
                <Label className="text-[11px] font-semibold mb-1 block">Delivery Email Subject</Label>
                <Input
                  value={data.fileDeliveryEmailSubject || ""}
                  onChange={(e) => onUpdate({ fileDeliveryEmailSubject: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold mb-1 block">Delivery Email Body</Label>
                <Textarea
                  value={data.fileDeliveryEmailBody || ""}
                  onChange={(e) => onUpdate({ fileDeliveryEmailBody: e.target.value })}
                  rows={3}
                  className="text-xs"
                />
              </div>
            </div>
          )}

          <AITip text="Leads who receive a valuable free resource convert at 2x the rate. 'Home Seller Guides' perform best for seller sites — position it as exclusive access." />
        </div>
      )}
    </div>
  );
}

// ─── AI Tip Component ────────────────────────────────────────────────────────

function AITip({ text }: { text: string }) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 flex items-start gap-2">
      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
      <p className="text-[11px] text-primary leading-relaxed">
        <strong>AI Insight:</strong> {text}
      </p>
    </div>
  );
}

// ─── Section Editor Router ───────────────────────────────────────────────────

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

    case "thankYou":
      return <ThankYouPageEditor data={data} onUpdate={onUpdate} aiWriter={aiWriter} />;

    case "followUp":
      return <FollowUpEditor data={data} onUpdate={onUpdate} />;

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

// ─── Logo Upload Helpers ─────────────────────────────────────────────────────

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
    e.target.value = "";
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
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
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
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
