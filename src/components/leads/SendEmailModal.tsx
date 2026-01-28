import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Mail } from "lucide-react";
import { toast } from "sonner";
import type { SellerLead } from "@/hooks/useSellerLeads";

interface SendEmailModalProps {
  lead: SellerLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMAIL_TEMPLATES = [
  {
    id: "intro",
    name: "Introduction",
    subject: "Cash Offer for Your Property at {{address}}",
    body: `Hi {{name}},

Thank you for reaching out about your property at {{address}}. We're a local home buying company and we'd love to make you a fair cash offer.

We buy houses in any condition and can close on your timeline. No repairs needed, no agent fees, and no hassle.

Would you be available for a quick call this week to discuss?

Best regards,
{{company}}`,
  },
  {
    id: "followup",
    name: "Follow-up",
    subject: "Still Interested in Selling {{address}}?",
    body: `Hi {{name}},

I wanted to follow up on your property at {{address}}. Are you still interested in selling?

We can close quickly - often in as little as 7 days - and pay all cash. Let me know if you'd like to discuss!

Best regards,
{{company}}`,
  },
];

export function SendEmailModal({ lead, open, onOpenChange }: SendEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  if (!lead) return null;

  const applyTemplate = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      let subj = template.subject;
      let msg = template.body;
      
      const replacements = {
        "{{name}}": lead.first_name || "there",
        "{{address}}": lead.property_address,
        "{{company}}": "We Buy Houses",
      };

      Object.entries(replacements).forEach(([key, value]) => {
        subj = subj.replace(new RegExp(key, "g"), value);
        msg = msg.replace(new RegExp(key, "g"), value);
      });

      setSubject(subj);
      setBody(msg);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Please enter subject and message");
      return;
    }

    setSending(true);
    try {
      // TODO: Integrate with email sending edge function
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Email sent successfully");
      onOpenChange(false);
      setSubject("");
      setBody("");
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-surface-secondary rounded-medium">
            <p className="text-small text-content-secondary">To:</p>
            <p className="font-medium">{lead.email}</p>
          </div>

          <div>
            <Label>Template</Label>
            <Select onValueChange={applyTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>

          <div>
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message..."
              rows={8}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSend} disabled={sending}>
            {sending && <Spinner size="sm" className="mr-2" />}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
