import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Lightbulb, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EMAIL_MERGE_FIELDS = [
  { value: "agent_name", label: "Agent Name" },
  { value: "agent_first_name", label: "Agent First Name" },
  { value: "property_address", label: "Property Address" },
  { value: "offer_amount", label: "Offer Amount" },
  { value: "earnest_money", label: "Earnest Money" },
  { value: "closing_timeline", label: "Closing Timeline" },
  { value: "inspection_period", label: "Inspection Period" },
  { value: "your_name", label: "Your Name" },
  { value: "your_company", label: "Your Company" },
  { value: "your_phone", label: "Your Phone" },
  { value: "your_email", label: "Your Email" },
];

interface TemplateEmailFormProps {
  subject: string;
  body: string;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
}

export function TemplateEmailForm({ subject, body, onSubjectChange, onBodyChange }: TemplateEmailFormProps) {
  const insertField = (field: string, target: "subject" | "body") => {
    const variable = `{${field}}`;
    if (target === "subject") {
      onSubjectChange(subject + variable);
    } else {
      onBodyChange(body + variable);
    }
  };

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Email Message</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Insert Field
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
            {EMAIL_MERGE_FIELDS.map((field) => (
              <DropdownMenuItem
                key={field.value}
                onClick={() => insertField(field.value, "body")}
              >
                {`{${field.value}}`} - {field.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-small">Subject Line</Label>
          <Input
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Offer for {property_address}"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-small">Email Body</Label>
          <Textarea
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Write your email content..."
            rows={16}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex items-start gap-2 text-small text-muted-foreground">
          <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p>
            Use merge fields like {"{property_address}"} and {"{offer_amount}"} to personalize each email
          </p>
        </div>
      </div>
    </Card>
  );
}
