import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Zap,
  MessageSquare,
  Calendar,
  DollarSign,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useQuickTemplates,
  fillTemplate,
  type QuickTemplate,
} from "@/hooks/useInboxAI";

interface QuickTemplatesPanelProps {
  open: boolean;
  onClose: () => void;
  onSelect: (text: string) => void;
  context?: {
    contactName?: string;
    propertyAddress?: string;
    offerAmount?: number;
  };
}

const categoryConfig = {
  'follow-up': { icon: MessageSquare, color: 'text-info', label: 'Follow-up' },
  'counter-offer': { icon: DollarSign, color: 'text-success', label: 'Counter' },
  'scheduling': { icon: Calendar, color: 'text-warning', label: 'Schedule' },
  'closing': { icon: Zap, color: 'text-brand', label: 'Close' },
  'general': { icon: FileText, color: 'text-content-secondary', label: 'General' },
};

export function QuickTemplatesPanel({
  open,
  onClose,
  onSelect,
  context,
}: QuickTemplatesPanelProps) {
  const { data: templates = [] } = useQuickTemplates();
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = React.useState<QuickTemplate | null>(null);
  const [variableValues, setVariableValues] = React.useState<Record<string, string>>({});

  // Filter templates
  const filteredTemplates = React.useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch = !search || 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.template.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, search, selectedCategory]);

  // Pre-fill variables from context
  React.useEffect(() => {
    if (previewTemplate && context) {
      const prefilled: Record<string, string> = {};
      if (context.contactName && previewTemplate.variables.includes('name')) {
        prefilled.name = context.contactName;
      }
      if (context.propertyAddress && previewTemplate.variables.includes('property')) {
        prefilled.property = context.propertyAddress;
      }
      if (context.offerAmount && previewTemplate.variables.includes('amount')) {
        prefilled.amount = `$${context.offerAmount.toLocaleString()}`;
      }
      setVariableValues(prefilled);
    }
  }, [previewTemplate, context]);

  const handleSelectTemplate = (template: QuickTemplate) => {
    if (template.variables.length === 0) {
      // No variables, use directly
      onSelect(template.template);
      onClose();
    } else {
      // Show preview to fill variables
      setPreviewTemplate(template);
      setVariableValues({});
    }
  };

  const handleInsert = () => {
    if (!previewTemplate) return;
    const filled = fillTemplate(previewTemplate.template, variableValues);
    onSelect(filled);
    setPreviewTemplate(null);
    setVariableValues({});
    onClose();
  };

  const previewText = previewTemplate 
    ? fillTemplate(previewTemplate.template, variableValues)
    : "";

  const categories = Object.keys(categoryConfig) as (keyof typeof categoryConfig)[];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand" />
            Quick Templates
          </DialogTitle>
        </DialogHeader>

        {previewTemplate ? (
          // Variable filling view
          <div className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-small font-medium mb-1">{previewTemplate.name}</p>
              <p className="text-small text-content-secondary whitespace-pre-wrap">
                {previewText}
              </p>
            </div>

            {previewTemplate.variables.length > 0 && (
              <div className="space-y-3">
                <p className="text-tiny font-medium text-content-secondary">Fill in variables:</p>
                {previewTemplate.variables.map((variable) => (
                  <div key={variable}>
                    <label className="text-tiny text-content-tertiary capitalize mb-1 block">
                      {variable.replace(/_/g, ' ')}
                    </label>
                    <Input
                      placeholder={`Enter ${variable}...`}
                      value={variableValues[variable] || ''}
                      onChange={(e) => setVariableValues(prev => ({
                        ...prev,
                        [variable]: e.target.value
                      }))}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={() => setPreviewTemplate(null)} className="flex-1">
                Back
              </Button>
              <Button variant="primary" onClick={handleInsert} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Insert
              </Button>
            </div>
          </div>
        ) : (
          // Template selection view
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "primary" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((cat) => {
                const config = categoryConfig[cat];
                const Icon = config.icon;
                return (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="gap-1"
                  >
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Button>
                );
              })}
            </div>

            {/* Templates list */}
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredTemplates.map((template) => {
                  const config = categoryConfig[template.category];
                  const Icon = config.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={cn(
                        "w-full p-3 rounded-lg border border-border-subtle text-left",
                        "hover:bg-muted/50 hover:border-brand/30 transition-colors"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={cn("h-4 w-4", config.color)} />
                        <span className="text-small font-medium">{template.name}</span>
                        <Badge variant="secondary" size="sm" className="ml-auto">
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-tiny text-content-tertiary line-clamp-2">
                        {template.template}
                      </p>
                      {template.variables.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {template.variables.map((v) => (
                            <Badge key={v} variant="secondary" size="sm" className="text-tiny">
                              {`{{${v}}}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
                {filteredTemplates.length === 0 && (
                  <div className="text-center py-8 text-content-tertiary">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-small">No templates found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
