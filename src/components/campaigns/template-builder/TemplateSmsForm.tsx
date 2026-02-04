import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Lightbulb, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const SMS_MERGE_FIELDS = [
  { value: "agent_first_name", label: "Agent First Name" },
  { value: "property_address", label: "Property Address" },
  { value: "offer_amount", label: "Offer Amount" },
  { value: "your_name", label: "Your Name" },
  { value: "your_phone", label: "Your Phone" },
];

interface TemplateSmsFormProps {
  message: string;
  includeSms: boolean;
  onMessageChange: (value: string) => void;
  onIncludeSmsChange: (value: boolean) => void;
}

export function TemplateSmsForm({ message, includeSms, onMessageChange, onIncludeSmsChange }: TemplateSmsFormProps) {
  const characterCount = message.length;
  const isOverLimit = characterCount > 160;

  const insertField = (field: string) => {
    const variable = `{${field}}`;
    onMessageChange(message + variable);
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Insert Field
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SMS_MERGE_FIELDS.map((field) => (
                  <DropdownMenuItem
                    key={field.value}
                    onClick={() => insertField(field.value)}
                  >
                    {`{${field.value}}`} - {field.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Textarea
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
