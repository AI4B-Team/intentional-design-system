import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { SellerLead } from "@/hooks/useSellerLeads";

interface SendSmsModalProps {
  lead: SellerLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SMS_TEMPLATES = [
  {
    id: "intro",
    name: "Introduction",
    message:
      "Hi {{name}}, this is {{company}}. I saw you submitted info about your property at {{address}}. I'd love to discuss a cash offer. When's a good time to talk?",
  },
  {
    id: "followup",
    name: "Follow-up",
    message:
      "Hi {{name}}, just following up on your property at {{address}}. Are you still interested in selling? We can close quickly and pay cash.",
  },
  {
    id: "offer",
    name: "Offer Ready",
    message:
      "Hi {{name}}, I have a cash offer ready for {{address}}. Give me a call when you have a moment to discuss!",
  },
];

export function SendSmsModal({ lead, open, onOpenChange }: SendSmsModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!lead) return null;

  const applyTemplate = (templateId: string) => {
    const template = SMS_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      let msg = template.message;
      msg = msg.replace("{{name}}", lead.first_name || "there");
      msg = msg.replace("{{address}}", lead.property_address);
      msg = msg.replace("{{company}}", "We Buy Houses"); // Could be dynamic
      setMessage(msg);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);
    try {
      // TODO: Integrate with Twilio edge function
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("SMS sent successfully");
      onOpenChange(false);
      setMessage("");
    } catch (error) {
      toast.error("Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send SMS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-surface-secondary rounded-medium">
            <p className="text-small text-content-secondary">To:</p>
            <p className="font-medium">{lead.phone}</p>
          </div>

          <div>
            <Label>Template</Label>
            <Select onValueChange={applyTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {SMS_TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              maxLength={160}
            />
            <p className="text-tiny text-content-tertiary text-right mt-1">
              {message.length}/160 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSend} disabled={sending}>
            {sending && <Spinner size="sm" className="mr-2" />}
            Send SMS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
