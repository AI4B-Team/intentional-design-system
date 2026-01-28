import * as React from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface CallScript {
  id: string;
  name: string;
  opening?: string | null;
  body?: string | null;
  closing?: string | null;
  objection_handlers?: Array<{ objection: string; response: string }> | any;
}

interface MergeData {
  owner_name?: string;
  owner_first_name?: string;
  property_address?: string;
  your_name?: string;
  your_company?: string;
  your_phone?: string;
}

interface CallScriptPanelProps {
  script: CallScript | null;
  mergeData: MergeData;
  notes: string;
  onNotesChange: (notes: string) => void;
  previousNotes?: Array<{ date: string; content: string }>;
}

export function CallScriptPanel({
  script,
  mergeData,
  notes,
  onNotesChange,
  previousNotes = [],
}: CallScriptPanelProps) {
  const [checklist, setChecklist] = React.useState<Record<string, boolean>>({
    asked_selling: false,
    discussed_timeline: false,
    mentioned_cash: false,
    asked_price: false,
  });

  const mergePlaceholders = (text: string | null | undefined): string => {
    if (!text) return "";
    return text
      .replace(/\{\{owner_name\}\}/g, mergeData.owner_name || "[Owner Name]")
      .replace(
        /\{\{owner_first_name\}\}/g,
        mergeData.owner_first_name || "[First Name]"
      )
      .replace(
        /\{\{property_address\}\}/g,
        mergeData.property_address || "[Property Address]"
      )
      .replace(/\{\{your_name\}\}/g, mergeData.your_name || "[Your Name]")
      .replace(
        /\{\{your_company\}\}/g,
        mergeData.your_company || "[Your Company]"
      )
      .replace(/\{\{your_phone\}\}/g, mergeData.your_phone || "[Your Phone]");
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for bold
    const merged = mergePlaceholders(text);
    const parts = merged.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
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

  const checklistItems = [
    { id: "asked_selling", label: "Asked about selling" },
    { id: "discussed_timeline", label: "Discussed timeline" },
    { id: "mentioned_cash", label: "Mentioned cash offer" },
    { id: "asked_price", label: "Asked about price expectations" },
  ];

  if (!script) {
    return (
      <div className="bg-white border border-border-subtle rounded-medium p-6 text-center">
        <p className="text-muted-foreground">
          No script selected. Select a queue with an assigned script.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-subtle rounded-medium overflow-hidden">
      <Tabs defaultValue="script" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-muted/30 p-0 h-auto">
          <TabsTrigger
            value="script"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Script
          </TabsTrigger>
          <TabsTrigger
            value="objections"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Objections
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Notes
          </TabsTrigger>
        </TabsList>

        {/* Script Tab */}
        <TabsContent value="script" className="p-4 space-y-4 m-0">
          {/* Opening */}
          {script.opening && (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-medium text-foreground hover:text-accent">
                <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
                Opening
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 pl-6">
                <p className="text-body text-muted-foreground leading-relaxed">
                  {renderMarkdown(script.opening)}
                </p>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Body */}
          {script.body && (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-medium text-foreground hover:text-accent">
                <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
                Key Points
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 pl-6">
                <div className="text-body text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {renderMarkdown(script.body)}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Closing */}
          {script.closing && (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-medium text-foreground hover:text-accent">
                <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
                Closing
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 pl-6">
                <p className="text-body text-muted-foreground leading-relaxed">
                  {renderMarkdown(script.closing)}
                </p>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Checklist */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-foreground mb-3">Call Checklist</h4>
            <div className="space-y-2">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    id={item.id}
                    checked={checklist[item.id]}
                    onCheckedChange={(checked) =>
                      setChecklist((prev) => ({
                        ...prev,
                        [item.id]: checked === true,
                      }))
                    }
                  />
                  <Label
                    htmlFor={item.id}
                    className={cn(
                      "text-small cursor-pointer",
                      checklist[item.id]
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    )}
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Objections Tab */}
        <TabsContent value="objections" className="p-4 m-0">
          {script.objection_handlers && script.objection_handlers.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {script.objection_handlers.map((handler, idx) => (
                <AccordionItem key={idx} value={`objection-${idx}`}>
                  <AccordionTrigger className="text-left text-body font-medium hover:no-underline">
                    "{handler.objection}"
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-body text-muted-foreground pl-4 border-l-2 border-accent">
                      {handler.response}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No objection handlers defined for this script.
            </p>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="p-4 space-y-4 m-0">
          {/* Previous Notes */}
          {previousNotes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-foreground text-small">
                Previous Call Notes
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {previousNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="text-small text-muted-foreground bg-muted/50 p-2 rounded-small"
                  >
                    <span className="text-tiny text-muted-foreground">
                      {note.date}:
                    </span>
                    <p>{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Notes */}
          <div className="space-y-2">
            <Label htmlFor="call-notes" className="font-medium text-foreground">
              Call Notes
            </Label>
            <Textarea
              id="call-notes"
              placeholder="Enter notes about this call..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-tiny text-muted-foreground">
              Notes are auto-saved
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
