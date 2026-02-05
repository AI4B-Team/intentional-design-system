import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddOutreach } from "@/hooks/usePropertyMutations";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface AddOutreachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
}

const channelOptions = [
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "call", label: "Phone Call" },
  { value: "dm", label: "DM" },
  { value: "mail", label: "Mail" },
  { value: "voicemail", label: "Voicemail" },
];

const directionOptions = [
  { value: "outbound", label: "Outbound" },
  { value: "inbound", label: "Inbound" },
];

const statusOptions = [
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "opened", label: "Opened" },
  { value: "responded", label: "Responded" },
  { value: "failed", label: "Failed" },
];

export function AddOutreachModal({ open, onOpenChange, propertyId }: AddOutreachModalProps) {
  const addOutreach = useAddOutreach();
  const { user } = useAuth();

  const [formData, setFormData] = React.useState({
    channel: "call",
    direction: "outbound",
    content: "",
    status: "sent",
    responseContent: "",
    optedIn: false,
    dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const resetForm = () => {
    setFormData({
      channel: "call",
      direction: "outbound",
      content: "",
      status: "sent",
      responseContent: "",
      optedIn: false,
      dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    await addOutreach.mutateAsync({
      target_id: propertyId,
      target_type: "property",
      user_id: user.id,
      channel: formData.channel,
      direction: formData.direction,
      content: formData.content || null,
      status: formData.status,
      response_content: formData.responseContent || null,
      opted_in: formData.optedIn,
      created_at: new Date(formData.dateTime).toISOString(),
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Log Contact</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Channel & Direction */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Channel</Label>
              <Select
                value={formData.channel}
                onValueChange={(v) => setFormData({ ...formData, channel: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {channelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Direction</Label>
              <Select
                value={formData.direction}
                onValueChange={(v) => setFormData({ ...formData, direction: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {directionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="What was discussed or communicated..."
              rows={4}
            />
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Response Content */}
          {(formData.direction === "inbound" || formData.status === "responded") && (
            <div>
              <Label htmlFor="responseContent">Response Content</Label>
              <Textarea
                id="responseContent"
                value={formData.responseContent}
                onChange={(e) => setFormData({ ...formData, responseContent: e.target.value })}
                placeholder="Their response..."
                rows={3}
              />
            </div>
          )}

          {/* Date/Time */}
          <div>
            <Label htmlFor="dateTime">Date & Time</Label>
            <Input
              id="dateTime"
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
            />
          </div>

          {/* Opted In Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="optedIn"
              checked={formData.optedIn}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, optedIn: checked === true })
              }
            />
            <Label htmlFor="optedIn" className="text-small font-normal cursor-pointer">
              Seller opted in for AI calling
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={addOutreach.isPending}>
              {addOutreach.isPending ? "Saving..." : "Log Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
