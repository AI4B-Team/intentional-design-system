import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  Check,
  AlertTriangle,
  Save,
  Sparkles,
  File,
  ScrollText,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentTemplate {
  id: string;
  name: string;
  type: "contract" | "loi" | "addendum" | "disclosure" | "custom";
  source: "system" | "uploaded";
  fileName?: string;
  isDefault: boolean;
  hasDisclaimer: boolean;
  lastUpdated: string;
}

const SYSTEM_TEMPLATES: DocumentTemplate[] = [
  {
    id: "sys-purchase-agreement",
    name: "Standard Purchase Agreement",
    type: "contract",
    source: "system",
    isDefault: true,
    hasDisclaimer: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "sys-loi",
    name: "Letter of Intent (LOI)",
    type: "loi",
    source: "system",
    isDefault: false,
    hasDisclaimer: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "sys-assignment",
    name: "Assignment Contract",
    type: "contract",
    source: "system",
    isDefault: false,
    hasDisclaimer: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "sys-option",
    name: "Option to Purchase",
    type: "contract",
    source: "system",
    isDefault: false,
    hasDisclaimer: true,
    lastUpdated: new Date().toISOString(),
  },
];

const typeColors: Record<string, string> = {
  contract: "text-blue-400 bg-blue-400/10",
  loi: "text-emerald-400 bg-emerald-400/10",
  addendum: "text-purple-400 bg-purple-400/10",
  disclosure: "text-amber-400 bg-amber-400/10",
  custom: "text-slate-400 bg-slate-400/10",
};

const typeLabels: Record<string, string> = {
  contract: "Contract",
  loi: "LOI",
  addendum: "Addendum",
  disclosure: "Disclosure",
  custom: "Custom",
};

export function DocumentDefaultsSection() {
  const [templates, setTemplates] = React.useState<DocumentTemplate[]>(SYSTEM_TEMPLATES);
  const [useSystemTemplates, setUseSystemTemplates] = React.useState(true);
  const [autoAttachDisclaimer, setAutoAttachDisclaimer] = React.useState(true);
  const [autoGenerateLoi, setAutoGenerateLoi] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newTemplate: DocumentTemplate = {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      type: "custom",
      source: "uploaded",
      fileName: file.name,
      isDefault: false,
      hasDisclaimer: autoAttachDisclaimer,
      lastUpdated: new Date().toISOString(),
    };

    setTemplates(prev => [...prev, newTemplate]);
    toast({ title: "Document Uploaded", description: `${file.name} has been added to your templates.` });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setAsDefault = (id: string, type: string) => {
    setTemplates(prev =>
      prev.map(t => ({
        ...t,
        isDefault: t.type === type ? t.id === id : t.isDefault,
      }))
    );
  };

  const removeTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleSave = () => {
    localStorage.setItem("realelite_document_defaults", JSON.stringify({
      templates,
      useSystemTemplates,
      autoAttachDisclaimer,
      autoGenerateLoi,
    }));
    toast({ title: "Document Defaults Saved", description: "Your template preferences have been updated." });
  };

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-h3 font-semibold text-content">Document Templates & Defaults</h2>
        <p className="text-small text-content-secondary mt-1">
          Manage your offer contracts, LOIs, and document templates. These will be used by the automated offer system.
        </p>
      </div>

      {/* Disclaimer Notice */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-small font-medium text-content">Legal Disclaimer</p>
            <p className="text-tiny text-content-secondary mt-1">
              All system-provided templates include a standard disclaimer. These are not a substitute for legal advice.
              Always have contracts reviewed by a licensed attorney in your state. RealElite is not a law firm and does
              not provide legal advice.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-body">Template Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-small font-medium text-content">Use System Templates</p>
              <p className="text-tiny text-content-tertiary">Include RealElite's pre-built contract templates</p>
            </div>
            <Switch checked={useSystemTemplates} onCheckedChange={setUseSystemTemplates} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-small font-medium text-content">Auto-Attach Disclaimer</p>
              <p className="text-tiny text-content-tertiary">Add legal disclaimer to all outgoing documents</p>
            </div>
            <Switch checked={autoAttachDisclaimer} onCheckedChange={setAutoAttachDisclaimer} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-small font-medium text-content">AI Auto-Generate LOI</p>
              <p className="text-tiny text-content-tertiary">
                Let AI generate a Letter of Intent when no LOI template is set
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">AI</Badge>
              <Switch checked={autoGenerateLoi} onCheckedChange={setAutoGenerateLoi} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-small font-semibold text-content">Your Templates</h3>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Upload Template
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        <div className="space-y-2">
          {templates.filter(t => useSystemTemplates || t.source !== "system").map(template => (
            <div
              key={template.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all",
                template.isDefault
                  ? "border-brand/30 bg-brand/5"
                  : "border-border-subtle bg-surface"
              )}
            >
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", typeColors[template.type])}>
                {template.type === "loi" ? (
                  <ScrollText className="h-5 w-5" />
                ) : template.type === "contract" ? (
                  <Scale className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-small font-medium text-content truncate">{template.name}</p>
                  {template.isDefault && <Badge variant="success" size="sm">Default</Badge>}
                  {template.source === "system" && <Badge variant="outline" size="sm">System</Badge>}
                </div>
                <p className="text-tiny text-content-tertiary">
                  {typeLabels[template.type]} · {template.source === "uploaded" ? template.fileName : "Built-in template"}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!template.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAsDefault(template.id, template.type)}
                    className="text-tiny"
                  >
                    Set Default
                  </Button>
                )}
                {template.source === "uploaded" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTemplate(template.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Document Defaults
        </Button>
      </div>
    </div>
  );
}
