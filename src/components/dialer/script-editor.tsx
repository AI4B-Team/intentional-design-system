import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Plus, Trash2, GripVertical } from "lucide-react";

interface ObjectionHandler {
  objection: string;
  response: string;
}

interface ScriptEditorProps {
  opening: string;
  body: string;
  closing: string;
  objectionHandlers: ObjectionHandler[];
  onOpeningChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onClosingChange: (value: string) => void;
  onObjectionHandlersChange: (handlers: ObjectionHandler[]) => void;
}

const MERGE_FIELD_BUTTONS = [
  { code: "{{owner_name}}", label: "Owner Name" },
  { code: "{{owner_first_name}}", label: "First Name" },
  { code: "{{property_address}}", label: "Address" },
  { code: "{{your_name}}", label: "Your Name" },
  { code: "{{your_company}}", label: "Company" },
];

export function ScriptEditor({
  opening,
  body,
  closing,
  objectionHandlers,
  onOpeningChange,
  onBodyChange,
  onClosingChange,
  onObjectionHandlersChange,
}: ScriptEditorProps) {
  const [expandedSections, setExpandedSections] = React.useState<string[]>([
    "opening",
    "body",
    "objections",
    "closing",
  ]);
  const [editingObjection, setEditingObjection] = React.useState<number | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const insertMergeField = (
    field: string,
    setter: (value: string) => void,
    currentValue: string,
    textareaId: string
  ) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        currentValue.slice(0, start) + field + currentValue.slice(end);
      setter(newValue);
      // Restore cursor position after the inserted field
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + field.length, start + field.length);
      }, 0);
    } else {
      setter(currentValue + field);
    }
  };

  const addObjection = () => {
    onObjectionHandlersChange([
      ...objectionHandlers,
      { objection: "", response: "" },
    ]);
    setEditingObjection(objectionHandlers.length);
  };

  const updateObjection = (index: number, updates: Partial<ObjectionHandler>) => {
    const updated = [...objectionHandlers];
    updated[index] = { ...updated[index], ...updates };
    onObjectionHandlersChange(updated);
  };

  const removeObjection = (index: number) => {
    onObjectionHandlersChange(objectionHandlers.filter((_, i) => i !== index));
    setEditingObjection(null);
  };

  const MergeFieldBar = ({
    onClick,
  }: {
    onClick: (field: string) => void;
  }) => (
    <div className="flex flex-wrap gap-1 mb-2">
      {MERGE_FIELD_BUTTONS.map((field) => (
        <Button
          key={field.code}
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-tiny"
          onClick={() => onClick(field.code)}
        >
          {field.label}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Opening Section */}
      <Collapsible
        open={expandedSections.includes("opening")}
        onOpenChange={() => toggleSection("opening")}
        className="bg-white border border-border-subtle rounded-medium overflow-hidden"
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-4 text-left hover:bg-muted/30">
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expandedSections.includes("opening") && "rotate-180"
            )}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Opening</h3>
            <p className="text-small text-muted-foreground">
              How you introduce yourself and the purpose of the call
            </p>
          </div>
          {opening && (
            <Badge variant="success" size="sm">
              ✓
            </Badge>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 border-t">
            <MergeFieldBar
              onClick={(field) =>
                insertMergeField(field, onOpeningChange, opening, "opening-textarea")
              }
            />
            <Textarea
              id="opening-textarea"
              value={opening}
              onChange={(e) => onOpeningChange(e.target.value)}
              placeholder="Hi, is this {{owner_first_name}}? Great! My name is {{your_name}} and I'm a local real estate investor..."
              className="min-h-[120px]"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Body Section */}
      <Collapsible
        open={expandedSections.includes("body")}
        onOpenChange={() => toggleSection("body")}
        className="bg-white border border-border-subtle rounded-medium overflow-hidden"
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-4 text-left hover:bg-muted/30">
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expandedSections.includes("body") && "rotate-180"
            )}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Main Script</h3>
            <p className="text-small text-muted-foreground">
              The main content - questions, value proposition, etc.
            </p>
          </div>
          {body && (
            <Badge variant="success" size="sm">
              ✓
            </Badge>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 border-t">
            <MergeFieldBar
              onClick={(field) =>
                insertMergeField(field, onBodyChange, body, "body-textarea")
              }
            />
            <Textarea
              id="body-textarea"
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              placeholder="I was calling about your property at {{property_address}}...

**Key Questions:**
• Are you considering selling the property?
• What's your timeline?
• Have you had it appraised recently?

**Value Proposition:**
We can close quickly, pay cash, and handle all the paperwork..."
              className="min-h-[200px]"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Objection Handlers Section */}
      <Collapsible
        open={expandedSections.includes("objections")}
        onOpenChange={() => toggleSection("objections")}
        className="bg-white border border-border-subtle rounded-medium overflow-hidden"
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-4 text-left hover:bg-muted/30">
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expandedSections.includes("objections") && "rotate-180"
            )}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Objection Handlers</h3>
            <p className="text-small text-muted-foreground">
              Common objections and your responses
            </p>
          </div>
          {objectionHandlers.length > 0 && (
            <Badge variant="secondary" size="sm">
              {objectionHandlers.length}
            </Badge>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 border-t space-y-3">
            {objectionHandlers.map((handler, index) => (
              <div
                key={index}
                className={cn(
                  "border rounded-medium overflow-hidden",
                  editingObjection === index ? "border-primary" : "border-border-subtle"
                )}
              >
                {editingObjection === index ? (
                  <div className="p-3 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-small">Objection</Label>
                      <Input
                        value={handler.objection}
                        onChange={(e) =>
                          updateObjection(index, { objection: e.target.value })
                        }
                        placeholder="e.g., I'm not interested"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-small">Response</Label>
                      <Textarea
                        value={handler.response}
                        onChange={(e) =>
                          updateObjection(index, { response: e.target.value })
                        }
                        placeholder="Your response to this objection..."
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeObjection(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingObjection(null)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingObjection(index)}
                    className="w-full p-3 text-left hover:bg-muted/30"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          "{handler.objection || "No objection set"}"
                        </p>
                        <p className="text-small text-muted-foreground truncate">
                          {handler.response || "No response set"}
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addObjection}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Objection
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Closing Section */}
      <Collapsible
        open={expandedSections.includes("closing")}
        onOpenChange={() => toggleSection("closing")}
        className="bg-white border border-border-subtle rounded-medium overflow-hidden"
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-4 text-left hover:bg-muted/30">
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expandedSections.includes("closing") && "rotate-180"
            )}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Closing</h3>
            <p className="text-small text-muted-foreground">
              How you wrap up the call based on outcome
            </p>
          </div>
          {closing && (
            <Badge variant="success" size="sm">
              ✓
            </Badge>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 border-t">
            <MergeFieldBar
              onClick={(field) =>
                insertMergeField(field, onClosingChange, closing, "closing-textarea")
              }
            />
            <Textarea
              id="closing-textarea"
              value={closing}
              onChange={(e) => onClosingChange(e.target.value)}
              placeholder="Thank you for your time, {{owner_first_name}}. I'll follow up with more information by email..."
              className="min-h-[100px]"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
