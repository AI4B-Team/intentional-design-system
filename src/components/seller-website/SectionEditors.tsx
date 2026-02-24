import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIWriterField } from "./AIWriterField";
import { X, Plus, RotateCcw, Upload, Image as ImageIcon, Trash2, ChevronUp, ChevronDown, Pencil, Sparkles, Link as LinkIcon, MapPin } from "lucide-react";
import { getSiteTypeDefaults } from "./siteTypeConfig";
import { USStateMap, US_STATES } from "./USStateMap";
import { SocialIcon, SOCIAL_PLATFORMS } from "./SocialIcons";
import { Badge } from "@/components/ui/badge";

interface EditorProps {
  data: Record<string, any>;
  onUpdate: (updates: Record<string, any>) => void;
  aiWriter: any;
  selectedSiteType: any;
}

function ItemCountBadge({ count, label }: { count: number; label: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
      {count} {label}
    </span>
  );
}

function LoadDefaultsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-xs gap-1"
      onClick={onClick}
    >
      <RotateCcw className="h-3 w-3" /> Load Defaults
    </Button>
  );
}

/* ─── Stats Bar ─── */
export function StatsEditor({ data, onUpdate, aiWriter, selectedSiteType }: EditorProps) {
  const items: Array<{ value: string; label: string }> = data.statsItems || [];
  const siteType = data.siteType || selectedSiteType?.id || "seller";
  const defaults = getSiteTypeDefaults(siteType);

  const updateItem = (idx: number, field: "value" | "label", val: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    onUpdate({ statsItems: updated });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Stats</Label>
          <ItemCountBadge count={items.length} label={items.length === 1 ? "stat" : "stats"} />
        </div>
        <LoadDefaultsButton onClick={() => onUpdate({ statsItems: [...defaults.stats] })} />
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={item.value}
            onChange={(v: string) => updateItem(i, "value", v)}
            placeholder="2,400+"
            className="w-24 flex-shrink-0"
          />
          <Input
            value={item.label}
            onChange={(v: string) => updateItem(i, "label", v)}
            placeholder="Homes Purchased"
            className="flex-1"
          />
          <Button
            variant="ghost" size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onUpdate({ statsItems: items.filter((_, idx) => idx !== i) })}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No custom stats. Defaults from your site type will be used. Click "Load Defaults" to customize.</p>
      )}
      <Button
        variant="secondary" size="sm" className="w-full"
        onClick={() => onUpdate({ statsItems: [...items, { value: "", label: "" }] })}
      >
        <Plus className="h-4 w-4 mr-1" /> Add Stat
      </Button>
    </div>
  );
}

/* ─── How It Works ─── */
export function HowItWorksEditor({ data, onUpdate, aiWriter, selectedSiteType }: EditorProps) {
  const steps: Array<{ step: number; title: string; description: string }> = data.processSteps || [];
  const siteType = data.siteType || selectedSiteType?.id || "seller";
  const defaults = getSiteTypeDefaults(siteType);

  const updateStep = (idx: number, field: "title" | "description", val: string) => {
    const updated = [...steps];
    updated[idx] = { ...updated[idx], [field]: val };
    onUpdate({ processSteps: updated });
  };

  return (
    <div className="space-y-3">
      <AIWriterField
        label="Section Headline"
        fieldType="howItWorksHeadline"
        value={data.howItWorksHeadline || ""}
        onChange={(v: string) => onUpdate({ howItWorksHeadline: v })}
        placeholder="How It Works"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <AIWriterField
        label="Section Subheadline"
        fieldType="howItWorksSubheadline"
        value={data.howItWorksSubheadline || ""}
        onChange={(v: string) => onUpdate({ howItWorksSubheadline: v })}
        placeholder="Three simple steps — no surprises"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Steps</Label>
          <ItemCountBadge count={steps.length} label={steps.length === 1 ? "step" : "steps"} />
        </div>
        <LoadDefaultsButton onClick={() => onUpdate({ processSteps: [...defaults.processSteps] })} />
      </div>
      {steps.map((step, i) => (
        <div key={i} className="border border-border rounded-md p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Step {i + 1}</span>
            <Button
              variant="ghost" size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={() => onUpdate({ processSteps: steps.filter((_, idx) => idx !== i) })}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <AIWriterField
            label="Title"
            fieldType={`processStep_${i}_title`}
            value={step.title}
            onChange={(v: string) => updateStep(i, "title", v)}
            placeholder="Step title"
            loadingField={aiWriter.loadingField}
            onGenerate={async (ft, val, ctx) => {
              const result = await aiWriter.generateCopy(`processStepTitle`, val, `Step ${i+1} of a process section`);
              return result;
            }}
          />
          <AIWriterField
            label="Description"
            fieldType={`processStep_${i}_desc`}
            value={step.description}
            onChange={(v: string) => updateStep(i, "description", v)}
            placeholder="Step description"
            multiline
            rows={2}
            loadingField={aiWriter.loadingField}
            onGenerate={async (ft, val, ctx) => {
              const result = await aiWriter.generateCopy(`processStepDescription`, val, `Step ${i+1}: ${step.title}`);
              return result;
            }}
          />
        </div>
      ))}
      {steps.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No custom steps. Defaults will be used. Click "Load Defaults" to customize.</p>
      )}
      <Button
        variant="secondary" size="sm" className="w-full"
        onClick={() => onUpdate({ processSteps: [...steps, { step: steps.length + 1, title: "", description: "" }] })}
      >
        <Plus className="h-4 w-4 mr-1" /> Add Step
      </Button>
    </div>
  );
}

/* ─── Comparison Table ─── */
export function ComparisonEditor({ data, onUpdate, aiWriter, selectedSiteType }: EditorProps) {
  const rows: Array<{ label: string; traditional: string; company: string }> = data.comparisonRows || [];
  const siteType = data.siteType || selectedSiteType?.id || "seller";
  const defaults = getSiteTypeDefaults(siteType);

  const updateRow = (idx: number, field: "label" | "traditional" | "company", val: string) => {
    const updated = [...rows];
    updated[idx] = { ...updated[idx], [field]: val };
    onUpdate({ comparisonRows: updated });
  };

  return (
    <div className="space-y-3">
      <AIWriterField
        label="Section Headline"
        fieldType="comparisonHeadline"
        value={data.comparisonHeadline || ""}
        onChange={(v: string) => onUpdate({ comparisonHeadline: v })}
        placeholder="Why Sellers Choose Us"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <AIWriterField
        label="Subheadline"
        fieldType="comparisonSubheadline"
        value={data.comparisonSubheadline || ""}
        onChange={(v: string) => onUpdate({ comparisonSubheadline: v })}
        placeholder="See how we compare to listing with an agent"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Left Column Label</Label>
          <Input
            value={data.comparisonTraditionalLabel || ""}
            onChange={(v: string) => onUpdate({ comparisonTraditionalLabel: v })}
            placeholder="Traditional Agent"
          />
        </div>
        <div>
          <Label className="text-xs">Right Column Label</Label>
          <Input
            value={data.comparisonCompanyLabel || ""}
            onChange={(v: string) => onUpdate({ comparisonCompanyLabel: v })}
            placeholder="Your Company"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Comparison Rows</Label>
          <ItemCountBadge count={rows.length} label={rows.length === 1 ? "row" : "rows"} />
        </div>
        <LoadDefaultsButton onClick={() => onUpdate({
          comparisonRows: [...defaults.comparisonRows],
          comparisonTraditionalLabel: defaults.comparisonTraditionalLabel,
          comparisonCompanyLabel: defaults.comparisonCompanyLabel,
          comparisonHeadline: defaults.comparisonHeadline,
        })} />
      </div>
      {rows.map((row, i) => (
        <div key={i} className="border border-border rounded-md p-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <Input
              value={row.label}
              onChange={(v: string) => updateRow(i, "label", v)}
              placeholder="Feature name"
              className="flex-1"
            />
            <Button
              variant="ghost" size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive ml-1"
              onClick={() => onUpdate({ comparisonRows: rows.filter((_, idx) => idx !== i) })}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={row.traditional}
              onChange={(v: string) => updateRow(i, "traditional", v)}
              placeholder="Traditional"
            />
            <Input
              value={row.company}
              onChange={(v: string) => updateRow(i, "company", v)}
              placeholder="Your company"
            />
          </div>
        </div>
      ))}
      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No custom rows. Defaults will be used. Click "Load Defaults" to customize.</p>
      )}
      <Button
        variant="secondary" size="sm" className="w-full"
        onClick={() => onUpdate({ comparisonRows: [...rows, { label: "", traditional: "", company: "" }] })}
      >
        <Plus className="h-4 w-4 mr-1" /> Add Row
      </Button>
    </div>
  );
}

/* ─── Situations / Services ─── */
export function SituationsEditor({ data, onUpdate, aiWriter, selectedSiteType }: EditorProps) {
  const items: Array<{ icon: string; label: string }> = data.situationItems || [];
  const siteType = data.siteType || selectedSiteType?.id || "seller";
  const defaults = getSiteTypeDefaults(siteType);

  return (
    <div className="space-y-3">
      <AIWriterField
        label="Section Headline"
        fieldType="situationsHeadline"
        value={data.situationsHeadline || ""}
        onChange={(v: string) => onUpdate({ situationsHeadline: v })}
        placeholder="We Buy Houses In Any Situation"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <AIWriterField
        label="Section Subheadline"
        fieldType="situationsSubheadline"
        value={data.situationsSubheadline || ""}
        onChange={(v: string) => onUpdate({ situationsSubheadline: v })}
        placeholder="Whatever you're going through..."
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Situations</Label>
          <ItemCountBadge count={items.length} label={items.length === 1 ? "item" : "items"} />
        </div>
        <LoadDefaultsButton onClick={() => onUpdate({ situationItems: [...defaults.situations] })} />
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={item.label}
            onChange={(v: string) => {
              const updated = [...items];
              updated[i] = { ...updated[i], label: v };
              onUpdate({ situationItems: updated });
            }}
            placeholder="Foreclosure, Inherited, etc."
            className="flex-1"
          />
          <Button
            variant="ghost" size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onUpdate({ situationItems: items.filter((_, idx) => idx !== i) })}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No custom situations. Defaults will be used. Click "Load Defaults" to customize.</p>
      )}
      <Button
        variant="secondary" size="sm" className="w-full"
        onClick={() => onUpdate({ situationItems: [...items, { icon: "home", label: "" }] })}
      >
        <Plus className="h-4 w-4 mr-1" /> Add Situation
      </Button>
    </div>
  );
}

/* ─── FAQ ─── */
export function FAQEditor({ data, onUpdate, aiWriter, selectedSiteType }: EditorProps) {
  const items: Array<{ question: string; answer: string }> = data.faqItems || [];

  const updateItem = (idx: number, field: "question" | "answer", val: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    onUpdate({ faqItems: updated });
  };

  return (
    <div className="space-y-3">
      <AIWriterField
        label="Section Headline"
        fieldType="faqHeadline"
        value={data.faqHeadline || ""}
        onChange={(v: string) => onUpdate({ faqHeadline: v })}
        placeholder="Frequently Asked Questions"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Questions & Answers</Label>
          <ItemCountBadge count={items.length} label={items.length === 1 ? "question" : "questions"} />
        </div>
        <LoadDefaultsButton onClick={() => onUpdate({
          faqItems: [
            { question: "How does the cash offer process work?", answer: "Simply submit your property details through our form, and we'll present you with a fair cash offer within 24 hours. No obligation." },
            { question: "Are there any fees or commissions?", answer: "Absolutely not. We charge zero fees and zero commissions. The offer you accept is the amount you receive." },
            { question: "Do I need to make repairs before selling?", answer: "No repairs needed. We buy houses in any condition — as-is, no questions asked." },
            { question: "How fast can I close?", answer: "We can close in as little as 3 days, or on your timeline. You pick the date that works best for you." },
          ],
        })} />
      </div>
      {items.map((item, i) => (
        <div key={i} className="border border-border rounded-md p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Q{i + 1}</span>
            <Button
              variant="ghost" size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={() => onUpdate({ faqItems: items.filter((_, idx) => idx !== i) })}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <AIWriterField
            label="Question"
            fieldType={`faq_${i}_question`}
            value={item.question}
            onChange={(v: string) => updateItem(i, "question", v)}
            placeholder="How does the process work?"
            loadingField={aiWriter.loadingField}
            onGenerate={async (ft, val, ctx) => {
              const result = await aiWriter.generateCopy(`faqQuestion`, val, `FAQ question for a real estate website`);
              return result;
            }}
          />
          <AIWriterField
            label="Answer"
            fieldType={`faq_${i}_answer`}
            value={item.answer}
            onChange={(v: string) => updateItem(i, "answer", v)}
            placeholder="Answer text..."
            multiline
            rows={2}
            loadingField={aiWriter.loadingField}
            onGenerate={async (ft, val, ctx) => {
              const result = await aiWriter.generateCopy(`faqAnswer`, val, `Answer to: ${item.question}`);
              return result;
            }}
          />
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No custom FAQ items. Default questions will be used. Click "Load Defaults" to customize.</p>
      )}
      <Button
        variant="secondary" size="sm" className="w-full"
        onClick={() => onUpdate({ faqItems: [...items, { question: "", answer: "" }] })}
      >
        <Plus className="h-4 w-4 mr-1" /> Add Question
      </Button>
    </div>
  );
}

/* ─── Testimonials ─── */
function TestimonialImageUpload({ imageUrl, onUpload, onRemove }: { imageUrl?: string; onUpload: (url: string) => void; onRemove: () => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") onUpload(reader.result); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-3">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {imageUrl ? (
        <div className="relative">
          <img src={imageUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-border" />
          <button
            onClick={onRemove}
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-muted-foreground/60 transition-colors"
        >
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      <span className="text-[11px] text-muted-foreground">
        {imageUrl ? "Photo uploaded" : "Upload a profile photo or leave empty for initials"}
      </span>
    </div>
  );
}

export function TestimonialsEditor({ data, onUpdate, aiWriter, selectedSiteType }: EditorProps) {
  const items: Array<{ name: string; role: string; company: string; quote: string; imageUrl: string }> = data.testimonialItems || [];

  const updateItem = (idx: number, field: string, val: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    onUpdate({ testimonialItems: updated });
  };

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
      <AIWriterField
        label="Tagline"
        fieldType="testimonialsTagline"
        value={data.testimonialsTagline || ""}
        onChange={(v: string) => onUpdate({ testimonialsTagline: v })}
        placeholder="Over 1,000 homeowners have sold with us..."
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <AIWriterField
        label="Subheadline"
        fieldType="testimonialsSubheadline"
        value={data.testimonialsSubheadline || ""}
        onChange={(v: string) => onUpdate({ testimonialsSubheadline: v })}
        placeholder="Don't Take Our Word For It — Take Theirs"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />

      <p className="text-xs text-muted-foreground">
        Add testimonials with text, images, or both. All fields are optional for maximum flexibility.
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Testimonials</Label>
          <ItemCountBadge count={items.length} label={items.length === 1 ? "testimonial" : "testimonials"} />
        </div>
        <LoadDefaultsButton onClick={() => onUpdate({
          testimonialItems: [
            { name: "Sarah Mitchell", role: "Homeowner", company: "Miami, FL", quote: "After my mother passed, I inherited a house I couldn't maintain. They gave me a fair cash offer and closed in 5 days.", imageUrl: "" },
            { name: "James Rivera", role: "Homeowner", company: "Austin, TX", quote: "We had 3 weeks to move. They made an offer the next day and closed before our move date.", imageUrl: "" },
            { name: "Marcus Johnson", role: "Homeowner", company: "Phoenix, AZ", quote: "I was behind on payments and getting letters from the bank. They bought my house in 6 days.", imageUrl: "" },
          ],
        })} />
      </div>

      {items.map((item, i) => (
        <div key={i} className="border border-border rounded-lg p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Testimonial {i + 1}</span>
            <Button
              variant="ghost" size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => onUpdate({ testimonialItems: items.filter((_, idx) => idx !== i) })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <TestimonialImageUpload
            imageUrl={item.imageUrl}
            onUpload={(url) => updateItem(i, "imageUrl", url)}
            onRemove={() => updateItem(i, "imageUrl", "")}
          />

          <div className="grid grid-cols-2 gap-2">
            <AIWriterField
              label="Name"
              fieldType={`testimonial_${i}_name`}
              value={item.name}
              onChange={(v: string) => updateItem(i, "name", v)}
              placeholder="Sarah Johnson"
              loadingField={aiWriter.loadingField}
              onGenerate={async (ft, val) => {
                const result = await aiWriter.generateCopy("testimonialName", val, "A realistic homeowner name");
                return result;
              }}
            />
            <AIWriterField
              label="Role"
              fieldType={`testimonial_${i}_role`}
              value={item.role}
              onChange={(v: string) => updateItem(i, "role", v)}
              placeholder="Homeowner"
              loadingField={aiWriter.loadingField}
              onGenerate={async (ft, val) => {
                const result = await aiWriter.generateCopy("testimonialRole", val, "A role or title");
                return result;
              }}
            />
          </div>

          <AIWriterField
            label="Company / Location"
            fieldType={`testimonial_${i}_company`}
            value={item.company}
            onChange={(v: string) => updateItem(i, "company", v)}
            placeholder="Miami, FL"
            loadingField={aiWriter.loadingField}
            onGenerate={async (ft, val) => {
              const result = await aiWriter.generateCopy("testimonialCompany", val, "A company name or city/state");
              return result;
            }}
          />

          <AIWriterField
            label="Quote"
            fieldType={`testimonial_${i}_quote`}
            value={item.quote}
            onChange={(v: string) => updateItem(i, "quote", v)}
            placeholder="This platform has completely transformed how we operate..."
            multiline
            rows={3}
            loadingField={aiWriter.loadingField}
            onGenerate={async (ft, val) => {
              const result = await aiWriter.generateCopy("testimonialQuote", val, `Testimonial from ${item.name || "a client"}`);
              return result;
            }}
          />
        </div>
      ))}

      <Button
        variant="secondary" size="sm" className="w-full"
        onClick={() => onUpdate({ testimonialItems: [...items, { name: "", role: "", company: "", quote: "", imageUrl: "" }] })}
      >
        <Plus className="h-4 w-4 mr-1" /> Add Testimonial
      </Button>

      <Button
        variant="outline" size="sm" className="w-full gap-1.5"
        disabled={aiWriter.loadingField !== null}
        onClick={async () => {
          const siteType = data.siteType || selectedSiteType?.id || "seller";
          const companyName = data.companyName || "our company";
          const prompt = `Generate 3 realistic testimonials for a ${siteType} real estate website for "${companyName}". For each, provide name, role, company/location, and a compelling 1-2 sentence quote. Return as JSON array with fields: name, role, company, quote.`;
          try {
            const result = await aiWriter.generateCopy("testimonialItems", "", prompt);
            if (result) {
              try {
                const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
                const parsed = JSON.parse(cleaned);
                if (Array.isArray(parsed)) {
                  onUpdate({ testimonialItems: parsed.map((t: any) => ({ name: t.name || "", role: t.role || "", company: t.company || "", quote: t.quote || "", imageUrl: "" })) });
                }
              } catch { /* ignore parse errors */ }
            }
          } catch { /* ignore */ }
        }}
      >
        <Sparkles className="h-3.5 w-3.5" /> Generate Entire Section With AI
      </Button>
    </div>
  );
}

/* ─── CTA Section ─── */
export function CTAEditor({ data, onUpdate, aiWriter, selectedSiteType }: EditorProps) {
  const buttons: Array<{ label: string; variant: "primary" | "secondary"; link: string }> = data.ctaButtons || [];
  const [editingIdx, setEditingIdx] = React.useState<number | null>(null);

  const updateButton = (idx: number, field: string, val: string) => {
    const updated = [...buttons];
    updated[idx] = { ...updated[idx], [field]: val };
    onUpdate({ ctaButtons: updated });
  };

  const moveButton = (idx: number, dir: "up" | "down") => {
    const updated = [...buttons];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= updated.length) return;
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    onUpdate({ ctaButtons: updated });
  };

  return (
    <div className="space-y-3">
      <AIWriterField
        label="Headline"
        fieldType="ctaHeadline"
        value={data.ctaHeadline || ""}
        onChange={(v: string) => onUpdate({ ctaHeadline: v })}
        placeholder="Ready To Sell Your House For Cash?"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <AIWriterField
        label="Subheadline"
        fieldType="ctaSubheadline"
        value={data.ctaSubheadline || ""}
        onChange={(v: string) => onUpdate({ ctaSubheadline: v })}
        placeholder="Get your free, no-obligation cash offer..."
        multiline
        rows={2}
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />

      {/* CTA Buttons */}
      <div className="border border-border rounded-lg p-3 space-y-2">
        <Label className="text-xs font-semibold">CTA Buttons</Label>
        {buttons.map((btn, i) => (
          <div key={i} className="border border-border rounded-md p-2.5">
            {editingIdx === i ? (
              <div className="space-y-2">
                <Input
                  value={btn.label}
                  onChange={(v: string) => updateButton(i, "label", v)}
                  placeholder="Button text"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground">Link / Action</Label>
                    <Input
                      value={btn.link}
                      onChange={(v: string) => updateButton(i, "link", v)}
                      placeholder="#form or https://..."
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Style</Label>
                    <div className="flex gap-1 mt-1">
                      <Button
                        variant={btn.variant === "primary" ? "default" : "outline"}
                        size="sm"
                        className="text-[10px] h-7 px-2"
                        onClick={() => updateButton(i, "variant", "primary")}
                      >
                        Primary
                      </Button>
                      <Button
                        variant={btn.variant === "secondary" ? "default" : "outline"}
                        size="sm"
                        className="text-[10px] h-7 px-2"
                        onClick={() => updateButton(i, "variant", "secondary")}
                      >
                        Secondary
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="text-xs" onClick={() => setEditingIdx(null)}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <button
                    onClick={() => moveButton(i, "up")}
                    disabled={i === 0}
                    className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => moveButton(i, "down")}
                    disabled={i === buttons.length - 1}
                    className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{btn.label || "Untitled"}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      {btn.variant === "primary" ? "Primary" : "Secondary"}
                    </span>
                  </div>
                  {btn.link && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <LinkIcon className="h-2.5 w-2.5" />
                      {btn.link}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost" size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setEditingIdx(i)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => onUpdate({ ctaButtons: buttons.filter((_, idx) => idx !== i) })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
        {buttons.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No custom buttons. Default CTA button will be used.</p>
        )}
        <Button
          variant="secondary" size="sm" className="w-full"
          onClick={() => {
            onUpdate({ ctaButtons: [...buttons, { label: "", variant: buttons.length === 0 ? "primary" : "secondary", link: "#form" }] });
            setEditingIdx(buttons.length);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Button
        </Button>
      </div>

      {/* Generate Entire Section */}
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5"
        disabled={aiWriter.loadingField !== null}
        onClick={async () => {
          const headline = await aiWriter.generateCopy("ctaHeadline", data.ctaHeadline || "", "CTA section headline for a real estate website");
          if (headline) onUpdate({ ctaHeadline: headline });
          const sub = await aiWriter.generateCopy("ctaSubheadline", data.ctaSubheadline || "", "CTA section subheadline");
          if (sub) onUpdate({ ctaSubheadline: sub });
        }}
      >
        <Sparkles className="h-4 w-4" /> Generate Entire Section With AI
      </Button>
    </div>
  );
}



/* ─── Footer ─── */
export function FooterEditor({ data, onUpdate, aiWriter }: Omit<EditorProps, "selectedSiteType">) {
  const profiles: Record<string, { enabled: boolean; url: string }> = data.socialProfiles || {};
  const alignment: string = data.footerAlignment || "left";

  const updateProfile = (id: string, field: "enabled" | "url", value: any) => {
    const updated = { ...profiles, [id]: { ...profiles[id], [field]: value } };
    onUpdate({ socialProfiles: updated });
  };

  return (
    <div className="space-y-5">
      {/* Company Name */}
      <div>
        <Label className="text-xs font-semibold">Company Name</Label>
        <AIWriterField
          label=""
          fieldType="companyName"
          value={data.companyName || ""}
          onChange={(v: string) => onUpdate({ companyName: v })}
          placeholder="Your Company Name"
          loadingField={aiWriter.loadingField}
          onGenerate={aiWriter.generateCopy}
        />
      </div>

      {/* Tagline */}
      <div>
        <Label className="text-xs font-semibold">Tagline</Label>
        <AIWriterField
          label=""
          fieldType="footerTagline"
          value={data.footerTagline || ""}
          onChange={(v: string) => onUpdate({ footerTagline: v })}
          placeholder="Empowering businesses with AI"
          loadingField={aiWriter.loadingField}
          onGenerate={aiWriter.generateCopy}
        />
      </div>

      {/* Text Alignment */}
      <div>
        <Label className="text-xs font-semibold mb-2 block">Text Alignment</Label>
        <div className="flex gap-2">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              onClick={() => onUpdate({ footerAlignment: align })}
              className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors ${
                alignment === align
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Show Social Links */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">Show Social Links</Label>
        <SwitchToggle checked={data.showSocialLinks !== false} onChange={(v) => onUpdate({ showSocialLinks: v })} />
      </div>

      {/* Social Media Profiles */}
      {data.showSocialLinks !== false && (
        <div className="border border-border rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Social Media Profiles</p>
            <p className="text-xs text-muted-foreground italic mt-0.5">Select which social platforms to display and add your profile URLs.</p>
          </div>
          <div className="space-y-1">
            {SOCIAL_PLATFORMS.map((platform) => {
              const profile = profiles[platform.id] || { enabled: false, url: "" };
              return (
                <div key={platform.id}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: platform.color }}
                      >
                        <SocialIcon id={platform.id} size={16} />
                      </div>
                      <span className="text-sm text-foreground">{platform.label}</span>
                    </div>
                    <SwitchToggle
                      checked={profile.enabled}
                      onChange={(v) => updateProfile(platform.id, "enabled", v)}
                    />
                  </div>
                  {profile.enabled && (
                    <Input
                      value={profile.url}
                      onChange={(e: any) => updateProfile(platform.id, "url", typeof e === "string" ? e : e.target.value)}
                      placeholder={`https://${platform.id}.com/yourprofile`}
                      className="mb-2 ml-11"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show Newsletter Signup */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">Show Newsletter Signup</Label>
        <SwitchToggle checked={data.showNewsletter !== false} onChange={(v) => onUpdate({ showNewsletter: v })} />
      </div>

      {/* Newsletter Settings */}
      {data.showNewsletter !== false && (
        <div className="border border-border rounded-lg p-4 space-y-4">
          <p className="text-sm font-semibold text-foreground">Newsletter Settings</p>
          <div>
            <Label className="text-xs font-semibold">Headline</Label>
            <AIWriterField
              label=""
              fieldType="newsletterHeadline"
              value={data.newsletterHeadline || ""}
              onChange={(v: string) => onUpdate({ newsletterHeadline: v })}
              placeholder="Stay Updated"
              loadingField={aiWriter.loadingField}
              onGenerate={aiWriter.generateCopy}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold">Description</Label>
            <AIWriterField
              label=""
              fieldType="newsletterDescription"
              value={data.newsletterDescription || ""}
              onChange={(v: string) => onUpdate({ newsletterDescription: v })}
              placeholder="Get the latest news and updates"
              loadingField={aiWriter.loadingField}
              onGenerate={aiWriter.generateCopy}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold">Button Text</Label>
            <AIWriterField
              label=""
              fieldType="newsletterButtonText"
              value={data.newsletterButtonText || ""}
              onChange={(v: string) => onUpdate({ newsletterButtonText: v })}
              placeholder="Subscribe"
              loadingField={aiWriter.loadingField}
              onGenerate={aiWriter.generateCopy}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold">Placeholder Text</Label>
            <AIWriterField
              label=""
              fieldType="newsletterPlaceholder"
              value={data.newsletterPlaceholder || ""}
              onChange={(v: string) => onUpdate({ newsletterPlaceholder: v })}
              placeholder="Enter your email"
              loadingField={aiWriter.loadingField}
              onGenerate={aiWriter.generateCopy}
            />
          </div>
        </div>
      )}

      {/* Generate Entire Section With AI */}
      <Button
        variant="outline"
        className="w-full gap-2"
        disabled={aiWriter.loadingField !== null}
        onClick={async () => {
          const companyName = data.companyName || "our company";
          const prompt = `Generate footer content for "${companyName}". Return JSON with fields: tagline (string), newsletterHeadline (string), newsletterDescription (string), newsletterButtonText (string).`;
          try {
            const result = await aiWriter.generateCopy("footerTagline", "", prompt);
            if (result) {
              const cleaned = result.replace(/\`\`\`json\n?/g, "").replace(/\`\`\`\n?/g, "").trim();
              const parsed = JSON.parse(cleaned);
              if (parsed.tagline) onUpdate({ footerTagline: parsed.tagline });
              if (parsed.newsletterHeadline) onUpdate({ newsletterHeadline: parsed.newsletterHeadline });
              if (parsed.newsletterDescription) onUpdate({ newsletterDescription: parsed.newsletterDescription });
              if (parsed.newsletterButtonText) onUpdate({ newsletterButtonText: parsed.newsletterButtonText });
            }
          } catch { /* ignore */ }
        }}
      >
        <Sparkles className="h-4 w-4" /> Generate Entire Section With AI
      </Button>
    </div>
  );
}

function SwitchToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-brand" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ─── Coverage / Service Areas ─── */
export function CoverageEditor({ data, onUpdate, aiWriter }: Omit<EditorProps, "selectedSiteType">) {
  const states: string[] = data.coverageStates || [];

  const toggleState = (code: string) => {
    const updated = states.includes(code)
      ? states.filter((s) => s !== code)
      : [...states, code];
    onUpdate({ coverageStates: updated });
  };

  const sortedStates = [...states].sort((a, b) => (US_STATES[a] || "").localeCompare(US_STATES[b] || ""));

  return (
    <div className="space-y-3">
      <AIWriterField
        label="Section Headline"
        fieldType="coverageHeadline"
        value={data.coverageHeadline || ""}
        onChange={(v: string) => onUpdate({ coverageHeadline: v })}
        placeholder="Areas We Serve"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />
      <AIWriterField
        label="Subheadline"
        fieldType="coverageSubheadline"
        value={data.coverageSubheadline || ""}
        onChange={(v: string) => onUpdate({ coverageSubheadline: v })}
        placeholder="We buy houses across these states"
        loadingField={aiWriter.loadingField}
        onGenerate={aiWriter.generateCopy}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Click states on the map to select</Label>
            <ItemCountBadge count={states.length} label={states.length === 1 ? "state" : "states"} />
          </div>
          {states.length > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => onUpdate({ coverageStates: [] })}>
              Clear All
            </Button>
          )}
        </div>
        <div className="border border-border rounded-lg overflow-hidden bg-muted/30 p-2">
          <USStateMap
            selectedStates={states}
            onToggleState={toggleState}
            primaryColor={data.primaryColor || data.accentColor || "#2563eb"}
          />
        </div>
      </div>

      {sortedStates.length > 0 && (
        <div>
          <Label className="text-xs mb-1.5 block">Selected States</Label>
          <div className="flex flex-wrap gap-1.5">
            {sortedStates.map((code) => (
              <Badge
                key={code}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={() => toggleState(code)}
              >
                {US_STATES[code]} ×
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
