import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb } from "lucide-react";
import { MergeFieldsPopover } from "./MergeFieldsPopover";

interface TemplateEmailFormProps {
  subject: string;
  body: string;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
}

export function TemplateEmailForm({ subject, body, onSubjectChange, onBodyChange }: TemplateEmailFormProps) {
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [activeField, setActiveField] = React.useState<"subject" | "body">("body");

  const insertField = (field: string) => {
    if (activeField === "subject") {
      const input = subjectRef.current;
      if (input) {
        const start = input.selectionStart || subject.length;
        const end = input.selectionEnd || subject.length;
        const newValue = subject.slice(0, start) + field + subject.slice(end);
        onSubjectChange(newValue);
        // Restore cursor position after React re-renders
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(start + field.length, start + field.length);
        }, 0);
      }
    } else {
      const textarea = bodyRef.current;
      if (textarea) {
        const start = textarea.selectionStart || body.length;
        const end = textarea.selectionEnd || body.length;
        const newValue = body.slice(0, start) + field + body.slice(end);
        onBodyChange(newValue);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + field.length, start + field.length);
        }, 0);
      }
    }
  };

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Email Message</h3>
        <MergeFieldsPopover onInsert={insertField} variant="email" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-small">Subject Line</Label>
          <Input
            ref={subjectRef}
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            onFocus={() => setActiveField("subject")}
            placeholder="Offer for {property_address}"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-small">Email Body</Label>
          <Textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            onFocus={() => setActiveField("body")}
            placeholder="Write your email content..."
            rows={16}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex items-start gap-2 text-small text-muted-foreground">
          <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p>
            Insert merge fields to auto-fill property details, agent info, and offer terms for each recipient
          </p>
        </div>
      </div>
    </Card>
  );
}
