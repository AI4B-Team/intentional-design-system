import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIWriterField } from "./AIWriterField";
import { X, Plus } from "lucide-react";

interface EditorProps {
  data: Record<string, any>;
  onUpdate: (updates: Record<string, any>) => void;
  aiWriter: any;
  selectedSiteType: any;
}

/* ─── Stats Bar ─── */
export function StatsEditor({ data, onUpdate }: EditorProps) {
  const items: Array<{ value: string; label: string }> = data.statsItems || [];

  const updateItem = (idx: number, field: "value" | "label", val: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    onUpdate({ statsItems: updated });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs mb-1 block">Stats (value + label)</Label>
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
export function HowItWorksEditor({ data, onUpdate, aiWriter }: EditorProps) {
  const steps: Array<{ step: number; title: string; description: string }> = data.processSteps || [];

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
      <Label className="text-xs mb-1 block">Steps</Label>
      {steps.map((step, i) => (
        <div key={i} className="border border-border rounded-md p-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Step {i + 1}</span>
            <Button
              variant="ghost" size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={() => onUpdate({ processSteps: steps.filter((_, idx) => idx !== i) })}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Input
            value={step.title}
            onChange={(v: string) => updateStep(i, "title", v)}
            placeholder="Step title"
          />
          <Textarea
            value={step.description}
            onChange={(e) => updateStep(i, "description", e.target.value)}
            placeholder="Step description"
            rows={2}
            className="text-sm"
          />
        </div>
      ))}
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
export function ComparisonEditor({ data, onUpdate, aiWriter }: EditorProps) {
  const rows: Array<{ label: string; traditional: string; company: string }> = data.comparisonRows || [];

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
      <Label className="text-xs mb-1 block">Comparison Rows</Label>
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
export function SituationsEditor({ data, onUpdate, aiWriter }: EditorProps) {
  const items: Array<{ icon: string; label: string }> = data.situationItems || [];

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
      <Label className="text-xs mb-1 block">Situations</Label>
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
export function FAQEditor({ data, onUpdate, aiWriter }: EditorProps) {
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
      <Label className="text-xs mb-1 block">Questions & Answers</Label>
      {items.map((item, i) => (
        <div key={i} className="border border-border rounded-md p-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Q{i + 1}</span>
            <Button
              variant="ghost" size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={() => onUpdate({ faqItems: items.filter((_, idx) => idx !== i) })}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Input
            value={item.question}
            onChange={(v: string) => updateItem(i, "question", v)}
            placeholder="How does the process work?"
          />
          <Textarea
            value={item.answer}
            onChange={(e) => updateItem(i, "answer", e.target.value)}
            placeholder="Answer text..."
            rows={2}
            className="text-sm"
          />
        </div>
      ))}
      <Button
        variant="secondary" size="sm" className="w-full"
        onClick={() => onUpdate({ faqItems: [...items, { question: "", answer: "" }] })}
      >
        <Plus className="h-4 w-4 mr-1" /> Add Question
      </Button>
    </div>
  );
}
