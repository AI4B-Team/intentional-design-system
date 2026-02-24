import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIWriterField } from "./AIWriterField";
import { X, Plus, RotateCcw } from "lucide-react";
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
