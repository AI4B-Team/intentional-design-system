import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SignatureTemplate,
  categoryConfig,
  mockTemplates,
  TemplateCategory,
} from "@/types/signature-templates";

interface TemplateLibraryProps {
  onSelectTemplate: (template: SignatureTemplate) => void;
  compact?: boolean;
}

export function TemplateLibrary({ onSelectTemplate, compact = false }: TemplateLibraryProps) {
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<TemplateCategory | "all">("all");
  const [previewTemplate, setPreviewTemplate] = React.useState<SignatureTemplate | null>(null);

  const categories: { value: TemplateCategory | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "purchase", label: "Purchase" },
    { value: "assignment", label: "Assignment" },
    { value: "disclosure", label: "Disclosure" },
    { value: "addendum", label: "Addendum" },
    { value: "financing", label: "Financing" },
  ];

  const filtered = mockTemplates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    return matchesSearch && matchesCategory && t.isActive;
  });

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

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          {previewTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{previewTemplate.name}</DialogTitle>
                  <Badge variant="outline" className={cn("text-xs", categoryConfig[previewTemplate.category].color)}>
                    {categoryConfig[previewTemplate.category].label}
                  </Badge>
                </div>
                <DialogDescription>{previewTemplate.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-surface-secondary">
                    <p className="text-lg font-bold text-foreground">{previewTemplate.useCount}</p>
                    <p className="text-xs text-muted-foreground">Times Used</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-surface-secondary">
                    <p className="text-lg font-bold text-success">{previewTemplate.completionRate}%</p>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-surface-secondary">
                    <p className="text-lg font-bold text-foreground">{previewTemplate.avgCompletionTime}h</p>
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

              <DialogFooter>
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
