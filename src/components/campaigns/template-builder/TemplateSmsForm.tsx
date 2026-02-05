import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Reply } from "lucide-react";
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
  const messageCount = Math.ceil(characterCount / 160) || 1;
  const isMultiMessage = characterCount > 160;

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
            placeholder="Hi {agent_first_name}, this is {your_name} regarding {property_address}. Open to a quick call? Reply YES."
            rows={4}
          />

          <div className="flex items-center justify-between">
            {/* Best Practice Tip */}
            <div className="flex items-start gap-2 text-small text-muted-foreground max-w-[70%]">
              <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Best practice: 1 sentence, name + address + action</p>
                <p className="text-tiny mt-0.5">Example: "Hi John, this is Mike about 123 Oak St. Open to a quick call?"</p>
              </div>
            </div>
            
            {/* Character Counter */}
            <div className="text-right shrink-0">
              <span className={cn(
                "text-small font-medium",
                isMultiMessage ? "text-warning" : "text-muted-foreground"
              )}>
                {characterCount} characters
                {isMultiMessage && (
                  <span className="text-muted-foreground font-normal"> ({messageCount} messages)</span>
                )}
              </span>
              {isMultiMessage && (
                <p className="text-tiny text-muted-foreground mt-0.5">
                  Will be sent as {messageCount} SMS segments
                </p>
              )}
            </div>
          </div>

          {/* Reply Trigger Hint */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-success/10 border border-success/20">
            <Reply className="h-4 w-4 text-success shrink-0" />
            <p className="text-tiny text-success">
              Replies like YES or NO will be captured automatically
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}