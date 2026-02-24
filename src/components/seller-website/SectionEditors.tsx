import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIWriterField } from "./AIWriterField";
import { X, Plus, RotateCcw, Upload, Image as ImageIcon, Trash2, ChevronUp, ChevronDown, Pencil, Sparkles, Link as LinkIcon } from "lucide-react";
import { getSiteTypeDefaults } from "./siteTypeConfig";

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

const SocialIcon = ({ id, size = 16 }: { id: string; size?: number }) => {
  const s = size;
  switch (id) {
    case "facebook":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case "instagram":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
    case "twitter":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case "tiktok":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>;
    case "youtube":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    case "linkedin":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    case "pinterest":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/></svg>;
    case "threads":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.22 1.332-2.96.834-.668 1.985-1.06 3.394-1.155.968-.064 1.88.004 2.735.198-.069-.937-.383-1.64-.935-2.084-.613-.494-1.518-.742-2.689-.738l-.031-.002c-.881.005-1.93.206-2.664.68l-1.064-1.71c1.07-.664 2.537-1.016 3.73-1.025h.034c1.61 0 2.91.416 3.862 1.236.896.772 1.446 1.862 1.618 3.227.525.158 1.005.367 1.44.63 1.157.7 2.028 1.69 2.522 2.863.757 1.797.794 4.523-1.327 6.603C18.022 23.163 15.62 23.967 12.186 24zm-1.248-7.498c-.896.06-1.56.293-1.975.648-.394.335-.572.762-.545 1.306.034.637.36 1.124.94 1.5.639.412 1.464.586 2.323.54 1.106-.063 1.95-.443 2.508-1.13.438-.54.726-1.27.861-2.18-.677-.204-1.406-.316-2.166-.316-.322 0-.65.018-.974.05l-.012.001-.96-.419z"/></svg>;
    case "bluesky":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.626 3.494 6.248 3.247-3.573.696-6.016 2.716-3.885 6.216 2.635 3.357 5.16 1.062 7.013-1.48 1.853 2.542 3.27 4.837 7.013 1.48 2.131-3.5-.312-5.52-3.885-6.216 2.622.247 5.463-.62 6.248-3.247C19.622 9.418 20 4.458 20 3.768c0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C12.046 4.747 9.087 8.686 8 10.8h4z"/></svg>;
    case "reddit":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm6.066 13.06c.084.346.128.702.128 1.065 0 3.636-4.032 6.583-9.004 6.583C4.22 20.708.187 17.761.187 14.125c0-.362.044-.72.128-1.065a1.795 1.795 0 01-.744-1.455c0-.992.805-1.797 1.797-1.797.467 0 .893.182 1.212.48 1.396-.932 3.216-1.506 5.23-1.56l1.098-3.645a.378.378 0 01.451-.27l2.62.624c.196-.396.604-.668 1.075-.668.664 0 1.202.538 1.202 1.202 0 .664-.538 1.202-1.202 1.202-.652 0-1.183-.522-1.2-1.17l-2.344-.558-.964 3.2c2.024.044 3.862.618 5.27 1.556.318-.298.745-.48 1.212-.48.992 0 1.797.805 1.797 1.797 0 .575-.272 1.087-.696 1.418zM8.4 13.03c-.665 0-1.203.538-1.203 1.202s.538 1.202 1.203 1.202c.664 0 1.202-.538 1.202-1.202s-.538-1.202-1.202-1.202zm7.2 0c-.664 0-1.202.538-1.202 1.202s.538 1.202 1.202 1.202 1.203-.538 1.203-1.202-.539-1.202-1.203-1.202zm-6.087 3.834a.378.378 0 01.534-.534c.726.726 2.18.786 2.953.012a.378.378 0 01.534.534c-1.08 1.08-3.24 1.08-4.02-.012z"/></svg>;
    case "snapchat":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="#222"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.959-.289a.42.42 0 01.195-.045c.12 0 .24.03.345.09.27.135.375.345.383.585.009.249-.15.48-.375.614-.135.075-.3.135-.405.165-.225.06-.48.12-.675.18-.195.06-.315.12-.375.165-.12.09-.21.21-.24.375-.015.075 0 .15.015.225.24.57.555 1.095.93 1.545.36.435.765.81 1.215 1.11.285.18.57.315.885.42.09.03.18.06.27.09.255.06.405.24.39.495-.015.24-.18.42-.435.48a6.552 6.552 0 01-1.065.225c-.135.03-.27.06-.39.09-.135.06-.195.135-.24.24-.06.12-.09.27-.12.39-.045.18-.105.36-.195.495-.12.18-.3.285-.525.285-.09 0-.195-.015-.3-.045a6.98 6.98 0 00-.825-.15 5.024 5.024 0 00-.66-.045c-.24 0-.42.015-.585.045-.36.075-.72.255-1.125.45-.6.285-1.275.615-2.22.645h-.06c-.945-.03-1.62-.36-2.22-.645-.405-.195-.765-.375-1.125-.45a3.558 3.558 0 00-.585-.045c-.225 0-.45.015-.66.045-.255.03-.54.09-.825.15-.105.03-.21.045-.3.045-.225 0-.405-.105-.525-.285a1.615 1.615 0 01-.195-.495c-.03-.12-.06-.27-.12-.39-.045-.105-.105-.18-.24-.24-.12-.03-.255-.06-.39-.09a6.552 6.552 0 01-1.065-.225c-.255-.06-.42-.24-.435-.48-.015-.255.135-.435.39-.495.09-.03.18-.06.27-.09.315-.105.6-.24.885-.42.45-.3.855-.675 1.215-1.11.375-.45.69-.975.93-1.545.015-.075.03-.15.015-.225a.47.47 0 00-.24-.375c-.06-.045-.18-.105-.375-.165-.195-.06-.45-.12-.675-.18-.105-.03-.27-.09-.405-.165-.225-.135-.384-.365-.375-.614.008-.24.113-.45.383-.585a.65.65 0 01.345-.09c.075 0 .135.015.195.045.3.165.66.273.96.289.195 0 .33-.045.405-.09l-.03-.51-.003-.06c-.104-1.628-.23-3.654.3-4.847C7.86 1.069 11.216.793 12.206.793z"/></svg>;
    default:
      return null;
  }
};

const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook", color: "#1877F2" },
  { id: "instagram", label: "Instagram", color: "#E4405F" },
  { id: "twitter", label: "X (Twitter)", color: "#000000" },
  { id: "tiktok", label: "TikTok", color: "#000000" },
  { id: "youtube", label: "YouTube", color: "#FF0000" },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2" },
  { id: "pinterest", label: "Pinterest", color: "#E60023" },
  { id: "threads", label: "Threads", color: "#000000" },
  { id: "bluesky", label: "Bluesky", color: "#0085FF" },
  { id: "reddit", label: "Reddit", color: "#FF4500" },
  { id: "snapchat", label: "Snapchat", color: "#FFFC00" },
];

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
