import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { MergeFieldsPopover } from "./MergeFieldsPopover";

interface TemplateSmsFormProps {
  message: string;
  includeSms: boolean;
  onMessageChange: (value: string) => void;
  onIncludeSmsChange: (value: boolean) => void;
}

export function TemplateSmsForm({ message, includeSms, onMessageChange, onIncludeSmsChange }: TemplateSmsFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const characterCount = message.length;
  const isOverLimit = characterCount > 160;

  const insertField = (field: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart || message.length;
      const end = textarea.selectionEnd || message.length;
      const newValue = message.slice(0, start) + field + message.slice(end);
      onMessageChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + field.length, start + field.length);
      }, 0);
    }
  };

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Text Message (Optional)</h3>
          <p className="text-small text-muted-foreground mt-1">
            Send a quick SMS notification along with your email
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="include-sms"
            checked={includeSms}
            onCheckedChange={onIncludeSmsChange}
          />
          <Label htmlFor="include-sms" className="cursor-pointer text-small">
            Include text message
          </Label>
        </div>
      </div>

      {includeSms && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-small">Message</Label>
            <MergeFieldsPopover onInsert={insertField} variant="sms" />
          </div>

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Hey {agent_first_name}! Just sent over an offer for {property_address}..."
            rows={4}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2 text-small text-muted-foreground">
              <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p>Keep it short and direct - this is just a notification</p>
            </div>
            <span className={cn(
              "text-small font-medium",
              isOverLimit ? "text-warning" : "text-muted-foreground"
            )}>
              {characterCount}/160
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
