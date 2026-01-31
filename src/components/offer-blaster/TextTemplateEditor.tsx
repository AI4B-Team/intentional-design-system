import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Sparkles, Copy, RotateCcw, AlertTriangle } from "lucide-react";
import { TextTemplate, DEFAULT_TEXT_TEMPLATE } from "./types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TextTemplateEditorProps {
  template: TextTemplate;
  onChange: (template: TextTemplate) => void;
}

const AVAILABLE_VARIABLES = [
  { key: "{{seller_name}}", label: "Seller Name" },
  { key: "{{buyer_name}}", label: "Your Name" },
  { key: "{{property_address}}", label: "Address" },
  { key: "{{offer_amount}}", label: "Offer" },
];

export function TextTemplateEditor({
  template,
  onChange,
}: TextTemplateEditorProps) {
  const characterCount = template.body.length;
  const maxLength = template.maxLength || 160;
  const isOverLimit = characterCount > maxLength;
  const warningThreshold = maxLength * 0.9;
  const isNearLimit = characterCount >= warningThreshold && !isOverLimit;

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    toast.success("Variable copied to clipboard");
  };

  const resetToDefault = () => {
    onChange(DEFAULT_TEXT_TEMPLATE);
    toast.success("Template reset to default");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-success" />
          <h4 className="font-semibold text-foreground">SMS Template</h4>
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
          <span className="text-small font-medium">Variables</span>
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
      </Card>

      {/* Message */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="sms-body">Message</Label>
          <span
            className={cn(
              "text-tiny",
              isOverLimit && "text-destructive font-medium",
              isNearLimit && "text-warning",
              !isNearLimit && !isOverLimit && "text-muted-foreground"
            )}
          >
            {characterCount} / {maxLength} characters
          </span>
        </div>
        <Textarea
          id="sms-body"
          value={template.body}
          onChange={(e) => onChange({ ...template, body: e.target.value })}
          placeholder="Hi {{seller_name}}! This is {{buyer_name}}..."
          className={cn(
            "min-h-[120px]",
            isOverLimit && "border-destructive focus-visible:ring-destructive"
          )}
        />
        <Progress
          value={(characterCount / maxLength) * 100}
          className={cn(
            "mt-2 h-1",
            isOverLimit && "[&>div]:bg-destructive",
            isNearLimit && "[&>div]:bg-warning"
          )}
        />
      </div>

      {isOverLimit && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-small">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Message exceeds {maxLength} characters. It may be split into multiple
            texts which can increase costs.
          </span>
        </div>
      )}

      {/* Preview */}
      <Card variant="default" padding="md" className="bg-background-secondary">
        <p className="text-tiny text-muted-foreground mb-2">Preview</p>
        <div className="bg-success/10 rounded-2xl rounded-bl-none p-3 max-w-[280px]">
          <p className="text-small text-foreground whitespace-pre-wrap">
            {template.body
              .replace("{{seller_name}}", "John")
              .replace("{{buyer_name}}", "Alex")
              .replace("{{property_address}}", "123 Main St")
              .replace("{{offer_amount}}", "$150,000")}
          </p>
        </div>
      </Card>
    </div>
  );
}
