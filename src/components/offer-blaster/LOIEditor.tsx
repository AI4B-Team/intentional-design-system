import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  Sparkles,
  Copy,
  RotateCcw,
  FileCheck,
  Eye,
} from "lucide-react";
import { LOITemplate, DocumentType, DEFAULT_LOI_TEMPLATE } from "./types";
import { toast } from "sonner";

interface LOIEditorProps {
  template: LOITemplate;
  documentType: DocumentType;
  onChange: (template: LOITemplate) => void;
  onDocumentTypeChange: (type: DocumentType) => void;
}

const SAMPLE_DATA = {
  date: new Date().toLocaleDateString(),
  seller_name: "John Smith",
  buyer_name: "Alex Johnson",
  buyer_company: "ABC Investments LLC",
  property_address: "123 Main Street",
  property_city: "Dallas",
  property_state: "TX",
  property_zip: "75001",
  offer_amount: "$185,000",
  deposit_amount: "$1,000",
  deposit_days: "3",
  inspection_period: "10",
  inspection_day_type: "business",
  closing_days: "14",
  contingencies: "• Inspection Contingency\n• Title Contingency",
  expiration_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toLocaleDateString(),
  buyer_phone: "(555) 123-4567",
  buyer_email: "alex@abcinvestments.com",
};

export function LOIEditor({
  template,
  documentType,
  onChange,
  onDocumentTypeChange,
}: LOIEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
    toast.success("Variable copied to clipboard");
  };

  const resetToDefault = () => {
    onChange(DEFAULT_LOI_TEMPLATE);
    toast.success("Template reset to default");
  };

  const getPreviewContent = () => {
    let content = template.content;
    Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
    return content;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          <h4 className="font-semibold text-foreground">
            Letter of Intent / Purchase Agreement
          </h4>
        </div>
        <Button variant="ghost" size="sm" onClick={resetToDefault}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Document Type Selection */}
      <Card variant="default" padding="md">
        <Label className="mb-3 block">Document Type</Label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onDocumentTypeChange("loi")}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              documentType === "loi"
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent/50"
            }`}
          >
            <FileText className="h-5 w-5 text-accent mb-2" />
            <p className="font-medium text-small">LOI Only</p>
            <p className="text-tiny text-muted-foreground">
              Non-binding letter of intent
            </p>
          </button>

          <button
            type="button"
            onClick={() => onDocumentTypeChange("purchase_agreement")}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              documentType === "purchase_agreement"
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent/50"
            }`}
          >
            <FileCheck className="h-5 w-5 text-success mb-2" />
            <p className="font-medium text-small">Purchase Agreement</p>
            <p className="text-tiny text-muted-foreground">
              Binding contract
            </p>
          </button>

          <button
            type="button"
            onClick={() => onDocumentTypeChange("both")}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              documentType === "both"
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent/50"
            }`}
          >
            <div className="flex gap-1 mb-2">
              <FileText className="h-5 w-5 text-accent" />
              <FileCheck className="h-5 w-5 text-success" />
            </div>
            <p className="font-medium text-small">Both</p>
            <p className="text-tiny text-muted-foreground">
              LOI + Agreement
            </p>
          </button>
        </div>
      </Card>

      {/* Variables */}
      <Card variant="default" padding="sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-small font-medium">Available Variables</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {template.variables.slice(0, 12).map((v) => (
            <Badge
              key={v}
              variant="secondary"
              size="sm"
              className="cursor-pointer hover:bg-accent/20 transition-colors text-tiny"
              onClick={() => copyVariable(v)}
            >
              <Copy className="h-3 w-3 mr-1" />
              {v}
            </Badge>
          ))}
          {template.variables.length > 12 && (
            <Badge variant="secondary" size="sm">
              +{template.variables.length - 12} more
            </Badge>
          )}
        </div>
      </Card>

      {/* Editor with Preview Toggle */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
        <TabsList className="mb-3">
          <TabsTrigger value="edit">
            <FileText className="h-4 w-4 mr-2" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Textarea
            value={template.content}
            onChange={(e) => onChange({ ...template, content: e.target.value })}
            className="min-h-[400px] font-mono text-small"
            placeholder="Enter your LOI template..."
          />
        </TabsContent>

        <TabsContent value="preview">
          <Card variant="default" padding="lg" className="bg-white min-h-[400px]">
            <pre className="whitespace-pre-wrap font-sans text-small text-foreground leading-relaxed">
              {getPreviewContent()}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
