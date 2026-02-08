import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  FolderOpen,
  Trash2,
  Star,
  Clock,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface SavedOfferTemplate {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  lastUsed?: string;
  config: {
    offerPercentage: number;
    selectedTemplate: string;
    emailEnabled: boolean;
    smsEnabled: boolean;
    scheduleType: string;
    estRepairs: number;
    holdingCosts: number;
  };
}

interface OfferTemplateManagerProps {
  currentConfig: SavedOfferTemplate["config"];
  savedTemplates: SavedOfferTemplate[];
  onLoadTemplate: (template: SavedOfferTemplate) => void;
  onSaveTemplate: (template: Omit<SavedOfferTemplate, "id" | "createdAt">) => void;
  onDeleteTemplate: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function OfferTemplateManager({
  currentConfig,
  savedTemplates,
  onLoadTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onSetDefault,
}: OfferTemplateManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"load" | "save">("load");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);

  const handleSave = () => {
    if (!newTemplateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    onSaveTemplate({
      name: newTemplateName,
      description: newTemplateDescription,
      isDefault: setAsDefault,
      config: currentConfig,
    });

    toast.success("Template saved!", {
      description: setAsDefault ? "Set as your default template" : undefined,
    });

    setIsOpen(false);
    setNewTemplateName("");
    setNewTemplateDescription("");
    setSetAsDefault(false);
  };

  const handleLoad = (template: SavedOfferTemplate) => {
    onLoadTemplate(template);
    toast.success(`Loaded "${template.name}"`, {
      description: "Your offer settings have been updated",
    });
    setIsOpen(false);
  };

  const defaultTemplate = savedTemplates.find((t) => t.isDefault);

  return (
    <>
      {/* Inline Template Bar */}
      <Card className="p-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Quick Templates</p>
              {defaultTemplate && (
                <p className="text-xs text-muted-foreground">
                  Default: {defaultTemplate.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMode("load");
                setIsOpen(true);
              }}
              className="gap-1.5"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Load
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMode("save");
                setIsOpen(true);
              }}
              className="gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              Save Current
            </Button>
          </div>
        </div>
      </Card>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === "load" ? "Load Offer Template" : "Save Offer Template"}
            </DialogTitle>
          </DialogHeader>

          {mode === "load" && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {savedTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No saved templates yet</p>
                  <p className="text-sm">Save your current configuration to reuse it later</p>
                </div>
              ) : (
                savedTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      "p-3 cursor-pointer transition-all hover:border-primary/50",
                      template.isDefault && "border-primary/30 bg-primary/5"
                    )}
                    onClick={() => handleLoad(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{template.name}</p>
                          {template.isDefault && (
                            <Badge variant="secondary" size="sm" className="gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Default
                            </Badge>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{template.config.offerPercentage}% offer</span>
                          <span>{template.config.selectedTemplate}</span>
                          {template.lastUsed && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Used {template.lastUsed}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        {!template.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetDefault(template.id);
                            }}
                          >
                            <Star className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTemplate(template.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {mode === "save" && (
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g., Standard Cash Offer"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Input
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Quick description of when to use this template"
                  className="mt-1"
                />
              </div>

              <Card className="p-3 bg-muted/50">
                <p className="text-sm font-medium mb-2">Current Settings</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Offer %:</div>
                  <div className="font-medium">{currentConfig.offerPercentage}%</div>
                  <div className="text-muted-foreground">Template:</div>
                  <div className="font-medium capitalize">{currentConfig.selectedTemplate}</div>
                  <div className="text-muted-foreground">Delivery:</div>
                  <div className="font-medium">
                    {currentConfig.emailEnabled && "Email"}
                    {currentConfig.emailEnabled && currentConfig.smsEnabled && " + "}
                    {currentConfig.smsEnabled && "SMS"}
                  </div>
                </div>
              </Card>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Set As Default</p>
                  <p className="text-xs text-muted-foreground">
                    Auto-fill these settings for new offers
                  </p>
                </div>
                <Switch checked={setAsDefault} onCheckedChange={setSetAsDefault} />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Template
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Hook for managing templates with localStorage
export function useOfferTemplates() {
  const STORAGE_KEY = "offer_templates";

  const getTemplates = (): SavedOfferTemplate[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const [templates, setTemplates] = useState<SavedOfferTemplate[]>(getTemplates);

  const saveTemplate = (template: Omit<SavedOfferTemplate, "id" | "createdAt">) => {
    const newTemplate: SavedOfferTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    // If setting as default, unset other defaults
    let updatedTemplates = template.isDefault
      ? templates.map((t) => ({ ...t, isDefault: false }))
      : [...templates];

    updatedTemplates = [...updatedTemplates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const setDefault = (id: string) => {
    const updated = templates.map((t) => ({
      ...t,
      isDefault: t.id === id,
    }));
    setTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getDefaultTemplate = () => templates.find((t) => t.isDefault);

  return {
    templates,
    saveTemplate,
    deleteTemplate,
    setDefault,
    getDefaultTemplate,
  };
}
