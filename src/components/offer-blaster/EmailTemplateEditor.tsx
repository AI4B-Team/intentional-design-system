import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Sparkles, Copy, RotateCcw } from "lucide-react";
import { EmailTemplate, DEFAULT_EMAIL_TEMPLATE } from "./types";
import { toast } from "sonner";

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  onChange: (template: EmailTemplate) => void;
}

const AVAILABLE_VARIABLES = [
  { key: "{{seller_name}}", label: "Seller Name" },
  { key: "{{buyer_name}}", label: "Your Name" },
  { key: "{{property_address}}", label: "Property Address" },
  { key: "{{offer_amount}}", label: "Offer Amount" },
  { key: "{{deposit_amount}}", label: "Deposit Amount" },
  { key: "{{closing_days}}", label: "Closing Days" },
  { key: "{{buyer_phone}}", label: "Your Phone" },
  { key: "{{buyer_email}}", label: "Your Email" },
  { key: "{{buyer_company}}", label: "Your Company" },
];

export function EmailTemplateEditor({
  template,
  onChange,
}: EmailTemplateEditorProps) {
  const insertVariable = (variable: string, field: "subject" | "body") => {
    const textarea = document.getElementById(`email-${field}`) as HTMLTextAreaElement | HTMLInputElement;
    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const currentValue = field === "subject" ? template.subject : template.body;
    const newValue =
      currentValue.slice(0, start) + variable + currentValue.slice(end);

    onChange({
      ...template,
      [field]: newValue,
    });

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    toast.success("Variable copied to clipboard");
  };

  const resetToDefault = () => {
    onChange(DEFAULT_EMAIL_TEMPLATE);
    toast.success("Template reset to default");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-info" />
          <h4 className="font-semibold text-foreground">Email Template</h4>
        </div>
        <Button variant="ghost" size="sm" onClick={resetToDefault}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Variables */}
      <Card variant="default" padding="sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-small font-medium">Available Variables</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_VARIABLES.map((v) => (
            <Badge
              key={v.key}
              variant="secondary"
              size="sm"
              className="cursor-pointer hover:bg-accent/20 transition-colors"
              onClick={() => copyVariable(v.key)}
            >
              <Copy className="h-3 w-3 mr-1" />
              {v.label}
            </Badge>
          ))}
        </div>
        <p className="text-tiny text-muted-foreground mt-2">
          Click to copy, then paste in subject or body
        </p>
      </Card>

      {/* Subject */}
      <div>
        <Label htmlFor="email-subject">Subject Line</Label>
        <Input
          id="email-subject"
          value={template.subject}
          onChange={(e) => onChange({ ...template, subject: e.target.value })}
          placeholder="Cash Offer for {{property_address}}"
          className="mt-2"
        />
      </div>

      {/* Body */}
      <div>
        <Label htmlFor="email-body">Email Body</Label>
        <Textarea
          id="email-body"
          value={template.body}
          onChange={(e) => onChange({ ...template, body: e.target.value })}
          placeholder="Dear {{seller_name}},..."
          className="mt-2 min-h-[300px] font-mono text-small"
        />
      </div>

      {/* Signature */}
      <div>
        <Label htmlFor="email-signature">Signature (Optional)</Label>
        <Textarea
          id="email-signature"
          value={template.signature || ""}
          onChange={(e) => onChange({ ...template, signature: e.target.value })}
          placeholder="Best regards,&#10;{{buyer_name}}"
          className="mt-2 min-h-[80px]"
          rows={3}
        />
      </div>
    </div>
  );
}
