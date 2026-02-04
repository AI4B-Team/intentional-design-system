import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Check, DollarSign, Key, Wallet, Layers, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  badge: string;
  badgeColor: string;
}

const LOI_TEMPLATES: TemplateOption[] = [
  {
    id: "hybrid",
    name: "Hybrid Offer- Subject To + Seller Finance",
    description: "Combined financing approach",
    badge: "Hybrid",
    badgeColor: "bg-warning/20 text-warning border-warning/30",
  },
  {
    id: "seller_financing",
    name: "Seller Financing Offer",
    description: "Owner financing terms",
    badge: "Seller Financing",
    badgeColor: "bg-info/20 text-info border-info/30",
  },
  {
    id: "subject_to",
    name: "Subject To Acquisition",
    description: "Take over existing financing",
    badge: "Subject To",
    badgeColor: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  },
  {
    id: "cash",
    name: "Standard Cash Offer",
    description: "Quick closing with cash offer",
    badge: "Cash",
    badgeColor: "bg-success/20 text-success border-success/30",
  },
];

interface TemplateDocumentSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
}

export function TemplateDocumentSelector({ selectedTemplate, onSelectTemplate }: TemplateDocumentSelectorProps) {
  const selectedConfig = LOI_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Select LOI Template</h3>
      
      <div className="space-y-2">
        {LOI_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelectTemplate(template.id)}
            className={cn(
              "w-full p-4 rounded-lg border-2 text-left transition-all flex items-start gap-3",
              selectedTemplate === template.id
                ? "border-accent bg-accent/5"
                : "border-border bg-background hover:border-accent/50 hover:bg-muted/30"
            )}
          >
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{template.name}</span>
                <Badge 
                  variant="outline" 
                  size="sm" 
                  className={cn("shrink-0", template.badgeColor)}
                >
                  {template.badge}
                </Badge>
              </div>
              <p className="text-small text-muted-foreground mt-0.5">{template.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Template Card */}
      {selectedConfig && (
        <Card className="bg-accent/5 border-accent/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-accent" />
              <div>
                <p className="text-tiny text-muted-foreground uppercase tracking-wide font-medium">Selected Template</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-foreground">{selectedConfig.name}</span>
                  <Badge 
                    variant="outline" 
                    size="sm" 
                    className={selectedConfig.badgeColor}
                  >
                    {selectedConfig.badge}
                  </Badge>
                </div>
                <p className="text-small text-muted-foreground">{selectedConfig.description}</p>
              </div>
            </div>
            <Button variant="link" size="sm" className="text-accent shrink-0">
              Change
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export { LOI_TEMPLATES };
