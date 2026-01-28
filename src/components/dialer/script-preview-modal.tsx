import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScriptPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script: {
    name: string;
    opening?: string | null;
    body?: string | null;
    closing?: string | null;
    objection_handlers?: Array<{ objection: string; response: string }> | any;
  } | null;
  sampleData?: {
    owner_name?: string;
    owner_first_name?: string;
    property_address?: string;
    property_street?: string;
    property_city?: string;
    property_state?: string;
    beds?: string;
    baths?: string;
    sqft?: string;
    estimated_value?: string;
    equity_percent?: string;
    your_name?: string;
    your_company?: string;
    your_phone?: string;
    today_date?: string;
  };
}

const DEFAULT_SAMPLE_DATA = {
  owner_name: "John Smith",
  owner_first_name: "John",
  property_address: "123 Main St, Austin, TX 78701",
  property_street: "123 Main St",
  property_city: "Austin",
  property_state: "TX",
  beds: "3",
  baths: "2",
  sqft: "1,850",
  estimated_value: "$285,000",
  equity_percent: "45%",
  your_name: "Your Name",
  your_company: "Your Company",
  your_phone: "(555) 000-0000",
  today_date: new Date().toLocaleDateString(),
};

export function ScriptPreviewModal({
  open,
  onOpenChange,
  script,
  sampleData = DEFAULT_SAMPLE_DATA,
}: ScriptPreviewModalProps) {
  const [showPlaceholders, setShowPlaceholders] = React.useState(false);

  const mergeFields = (text: string | null | undefined): string => {
    if (!text) return "";
    if (showPlaceholders) return text;

    return text
      .replace(/\{\{owner_name\}\}/g, sampleData.owner_name || "[Owner Name]")
      .replace(/\{\{owner_first_name\}\}/g, sampleData.owner_first_name || "[First Name]")
      .replace(/\{\{property_address\}\}/g, sampleData.property_address || "[Property Address]")
      .replace(/\{\{property_street\}\}/g, sampleData.property_street || "[Street]")
      .replace(/\{\{property_city\}\}/g, sampleData.property_city || "[City]")
      .replace(/\{\{property_state\}\}/g, sampleData.property_state || "[State]")
      .replace(/\{\{beds\}\}/g, sampleData.beds || "[Beds]")
      .replace(/\{\{baths\}\}/g, sampleData.baths || "[Baths]")
      .replace(/\{\{sqft\}\}/g, sampleData.sqft || "[SqFt]")
      .replace(/\{\{estimated_value\}\}/g, sampleData.estimated_value || "[Est. Value]")
      .replace(/\{\{equity_percent\}\}/g, sampleData.equity_percent || "[Equity %]")
      .replace(/\{\{your_name\}\}/g, sampleData.your_name || "[Your Name]")
      .replace(/\{\{your_company\}\}/g, sampleData.your_company || "[Your Company]")
      .replace(/\{\{your_phone\}\}/g, sampleData.your_phone || "[Your Phone]")
      .replace(/\{\{today_date\}\}/g, sampleData.today_date || "[Today's Date]");
  };

  const renderText = (text: string) => {
    // Highlight merge fields when showing placeholders
    if (showPlaceholders) {
      const parts = text.split(/(\{\{[^}]+\}\})/g);
      return parts.map((part, idx) => {
        if (part.match(/^\{\{[^}]+\}\}$/)) {
          return (
            <Badge key={idx} variant="info" size="sm" className="mx-0.5">
              {part}
            </Badge>
          );
        }
        return <span key={idx}>{part}</span>;
      });
    }
    // Bold text rendering
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  if (!script) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview: {script.name}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 border-b">
          <p className="text-small text-muted-foreground">
            Preview with sample contact
          </p>
          <div className="flex items-center gap-2">
            <Switch
              id="show-placeholders"
              checked={showPlaceholders}
              onCheckedChange={setShowPlaceholders}
            />
            <Label htmlFor="show-placeholders" className="text-small cursor-pointer">
              Show merge field codes
            </Label>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Opening */}
            {script.opening && (
              <div>
                <h4 className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Opening
                </h4>
                <div className="bg-muted/30 rounded-medium p-4">
                  <p className="text-body text-foreground leading-relaxed whitespace-pre-wrap">
                    {renderText(mergeFields(script.opening))}
                  </p>
                </div>
              </div>
            )}

            {/* Body */}
            {script.body && (
              <div>
                <h4 className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Main Script
                </h4>
                <div className="bg-muted/30 rounded-medium p-4">
                  <div className="text-body text-foreground leading-relaxed whitespace-pre-wrap">
                    {renderText(mergeFields(script.body))}
                  </div>
                </div>
              </div>
            )}

            {/* Objection Handlers */}
            {script.objection_handlers && script.objection_handlers.length > 0 && (
              <div>
                <h4 className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Objection Handlers
                </h4>
                <div className="space-y-3">
                  {script.objection_handlers.map((handler: any, idx: number) => (
                    <div key={idx} className="bg-muted/30 rounded-medium p-4">
                      <p className="font-medium text-foreground mb-2">
                        "{handler.objection}"
                      </p>
                      <p className="text-muted-foreground pl-4 border-l-2 border-accent">
                        {renderText(mergeFields(handler.response))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Closing */}
            {script.closing && (
              <div>
                <h4 className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Closing
                </h4>
                <div className="bg-muted/30 rounded-medium p-4">
                  <p className="text-body text-foreground leading-relaxed whitespace-pre-wrap">
                    {renderText(mergeFields(script.closing))}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
