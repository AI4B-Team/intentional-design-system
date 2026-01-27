import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import type { JVOpportunity } from "@/hooks/useJVPartners";

interface JVInquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: JVOpportunity | null;
  onSubmit: (opportunityId: string, message: string) => void;
  isLoading?: boolean;
}

export function JVInquiryModal({
  open,
  onOpenChange,
  opportunity,
  onSubmit,
  isLoading,
}: JVInquiryModalProps) {
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setMessage("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (opportunity) {
      onSubmit(opportunity.id, message);
    }
  };

  if (!opportunity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Express Interest</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-muted rounded-lg">
          <h4 className="font-semibold text-small">{opportunity.title}</h4>
          {opportunity.capital_needed && (
            <p className="text-small text-muted-foreground">
              Capital Needed: ${opportunity.capital_needed.toLocaleString()}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Your Message</Label>
            <Textarea
              placeholder="Introduce yourself and explain why you're interested in this opportunity..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
            <p className="text-tiny text-muted-foreground">
              Your contact info will only be shared if the other party accepts your inquiry.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<Send />} disabled={isLoading}>
              Send Inquiry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
