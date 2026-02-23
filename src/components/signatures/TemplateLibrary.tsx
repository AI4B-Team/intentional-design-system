import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Copy,
  Eye,
  Send,
  BarChart3,
  Layers,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  SignatureTemplate,
  categoryConfig,
  mockTemplates,
  TemplateCategory,
  TemplateVariable,
  VariableType,
} from "@/types/signature-templates";

interface TemplateLibraryProps {
  onSelectTemplate: (template: SignatureTemplate) => void;
  compact?: boolean;
}

// ─── Create Template Dialog ─────────────────────────────────

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: SignatureTemplate) => void;
}

const VARIABLE_TYPES: { value: VariableType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "address", label: "Address" },
  { value: "percentage", label: "Percentage" },
];

const CATEGORY_OPTIONS: { value: TemplateCategory; label: string }[] = [
  { value: "purchase", label: "Purchase Agreement" },
  { value: "assignment", label: "Assignment" },
  { value: "disclosure", label: "Disclosure" },
  { value: "addendum", label: "Addendum" },
  { value: "financing", label: "Financing" },
  { value: "lease", label: "Lease" },
  { value: "other", label: "Other" },
];

function CreateTemplateDialog({ open, onOpenChange, onSave }: CreateTemplateDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<TemplateCategory>("purchase");
  const [body, setBody] = React.useState("");
  const [variables, setVariables] = React.useState<TemplateVariable[]>([]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("purchase");
    setBody("");
    setVariables([]);
  };

  const addVariable = () => {
    setVariables((prev) => [
      ...prev,
      {
        key: `field_${Date.now()}`,
        label: "",
        type: "text" as VariableType,
        required: false,
        placeholder: "",
      },
    ]);
  };

  const updateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    setVariables((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        const updated = { ...v, ...updates };
        // Auto-generate key from label
        if (updates.label !== undefined) {
          updated.key = updates.label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "");
        }
        return updated;
      })
    );
  };

  const removeVariable = (index: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    const template: SignatureTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      variables: variables.filter((v) => v.label.trim()),
      conditionalBlocks: [],
      clauseIds: [],
      body: body.trim(),
      isActive: true,
      isSystem: false,
      useCount: 0,
      avgCompletionTime: undefined,
      completionRate: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onSave(template);
    resetForm();
    onOpenChange(false);
    toast.success("Template created successfully");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create Template</DialogTitle>
          <DialogDescription>Build a custom document template with merge fields.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4 min-h-0">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Template Name *</Label>
              <Input
                placeholder="e.g. Custom Purchase Agreement"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="col-span-2">
              <Label>Description *</Label>
              <Input
                placeholder="Brief description of this template"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Merge Fields */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Merge Fields
              </Label>
              <Button variant="outline" size="sm" onClick={addVariable} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add Field
              </Button>
            </div>

            {variables.length === 0 ? (
              <div className="border border-dashed rounded-lg p-6 text-center">
                <Layers className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No fields yet. Add merge fields that signers will fill in.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Use {"{{field_name}}"} in the body to reference them.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {variables.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-secondary">
                    <div className="flex-1 min-w-0">
                      <Input
                        placeholder="Field label (e.g. Buyer Name)"
                        value={v.label}
                        onChange={(e) => updateVariable(i, { label: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <Select value={v.type} onValueChange={(val) => updateVariable(i, { type: val as VariableType })}>
                      <SelectTrigger className="w-28 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VARIABLE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={v.required ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-xs px-2.5"
                      onClick={() => updateVariable(i, { required: !v.required })}
                    >
                      {v.required ? "Required" : "Optional"}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeVariable(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Body */}
          <div>
            <Label>Document Body</Label>
            <p className="text-xs text-muted-foreground mb-1.5">
              Use {"{{field_key}}"} to insert merge fields. E.g. {"{{buyer_name}}"}.
            </p>
            <Textarea
              placeholder="Enter your document content here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[160px] font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function TemplateLibrary({ onSelectTemplate, compact = false }: TemplateLibraryProps) {
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<TemplateCategory | "all">("all");
  const [previewTemplate, setPreviewTemplate] = React.useState<SignatureTemplate | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [customTemplates, setCustomTemplates] = React.useState<SignatureTemplate[]>([]);

  const allTemplates = [...mockTemplates, ...customTemplates];

  const categories: { value: TemplateCategory | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "purchase", label: "Purchase" },
    { value: "assignment", label: "Assignment" },
    { value: "disclosure", label: "Disclosure" },
    { value: "addendum", label: "Addendum" },
    { value: "financing", label: "Financing" },
  ];

  const filtered = allTemplates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    return matchesSearch && matchesCategory && t.isActive;
  });

  const handleCreateTemplate = (template: SignatureTemplate) => {
    setCustomTemplates((prev) => [...prev, template]);
  };

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              size="sm"
              variant={activeCategory === cat.value ? "default" : "outline"}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
        {filtered.map((template) => {
          const catInfo = categoryConfig[template.category];
          return (
            <Card
              key={template.id}
              padding="md"
              className="group hover:shadow-md transition-all cursor-pointer flex flex-col"
              onClick={() => setPreviewTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">{template.name}</h4>
                    <Badge variant="outline" className={cn("text-[10px] mt-0.5", catInfo.color)}>
                      {catInfo.label}
                    </Badge>
                  </div>
                </div>
                {template.isSystem && (
                  <Badge variant="outline" className="text-[10px] bg-surface-secondary">System</Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                {template.description}
              </p>

              {/* Template Stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border-subtle pt-3 mt-auto">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {template.variables.length} fields
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  {template.useCount} used
                </span>
                {template.completionRate !== undefined && (
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle className="h-3 w-3" />
                    {template.completionRate}%
                  </span>
                )}
                {template.avgCompletionTime !== undefined && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.avgCompletionTime}h avg
                  </span>
                )}
              </div>
            </Card>
          );
        })}

        {/* Add Custom Template Card */}
        <Card
          padding="md"
          className="flex flex-col items-center justify-center border-dashed border-2 cursor-pointer hover:bg-surface-secondary transition-colors min-h-[180px]"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">Create Template</p>
          <p className="text-xs text-muted-foreground/70">Build a custom template</p>
        </Card>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No templates found</p>
        </div>
      )}

      {/* Create Template Dialog */}
      <CreateTemplateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={handleCreateTemplate}
      />

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
          {previewTemplate && (
            <>
              <DialogHeader className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <DialogTitle>{previewTemplate.name}</DialogTitle>
                  <Badge variant="outline" className={cn("text-xs", categoryConfig[previewTemplate.category].color)}>
                    {categoryConfig[previewTemplate.category].label}
                  </Badge>
                </div>
                <DialogDescription>{previewTemplate.description}</DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-5 py-4 min-h-0">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-surface-secondary">
                    <p className="text-lg font-bold text-foreground">{previewTemplate.useCount}</p>
                    <p className="text-xs text-muted-foreground">Times Used</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-surface-secondary">
                    <p className="text-lg font-bold text-success">{previewTemplate.completionRate ?? 0}%</p>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-surface-secondary">
                    <p className="text-lg font-bold text-foreground">{previewTemplate.avgCompletionTime ?? 0}h</p>
                    <p className="text-xs text-muted-foreground">Avg Sign Time</p>
                  </div>
                </div>

                {/* Variables */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Merge Fields ({previewTemplate.variables.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {previewTemplate.variables.map((v) => (
                      <div key={v.key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-secondary text-sm">
                        <span className="font-medium text-foreground">{v.label}</span>
                        <div className="flex items-center gap-1.5">
                          {v.required && (
                            <span className="text-[10px] text-destructive font-medium">Required</span>
                          )}
                          {v.source && v.source !== "manual" && (
                            <Badge variant="outline" className="text-[10px] capitalize">{v.source}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conditional Blocks */}
                {previewTemplate.conditionalBlocks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Conditional Sections</h4>
                    {previewTemplate.conditionalBlocks.map((block) => (
                      <div key={block.id} className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm mb-2">
                        <p className="font-medium text-amber-800">{block.label}</p>
                        <p className="text-xs text-amber-600 mt-0.5">Shows when: {block.condition}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="flex-shrink-0">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => {
                    onSelectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  <Send className="h-4 w-4" />
                  Use Template
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
