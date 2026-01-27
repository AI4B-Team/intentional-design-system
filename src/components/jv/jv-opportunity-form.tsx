import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Save } from "lucide-react";
import type { JVOpportunity } from "@/hooks/useJVPartners";
import { addDays, format } from "date-fns";

interface JVOpportunityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: JVOpportunity | null;
  onSave: (data: Partial<JVOpportunity>) => void;
  isLoading?: boolean;
  properties?: Array<{ id: string; address: string; city: string; state: string }>;
}

const DEAL_TYPES = [
  "Wholesale",
  "Fix & Flip",
  "BRRRR",
  "Buy & Hold",
  "New Construction",
  "Commercial",
  "Land Development",
  "Multi-Family",
];

const SPLIT_OPTIONS = [
  "50/50",
  "60/40 to Capital",
  "60/40 to Operator",
  "70/30 to Capital",
  "70/30 to Operator",
  "Preferred Return + Split",
  "Custom",
];

const EXPIRATION_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
];

export function JVOpportunityForm({
  open,
  onOpenChange,
  opportunity,
  onSave,
  isLoading,
  properties = [],
}: JVOpportunityFormProps) {
  const [formData, setFormData] = React.useState({
    property_id: opportunity?.property_id || "",
    title: opportunity?.title || "",
    description: opportunity?.description || "",
    capital_needed: opportunity?.capital_needed?.toString() || "",
    your_contribution: opportunity?.your_contribution || "",
    seeking: opportunity?.seeking || "",
    proposed_split: opportunity?.proposed_split || "50/50",
    deal_type: opportunity?.deal_type || "",
    location: opportunity?.location || "",
    visibility: opportunity?.visibility || "public",
    expiration_days: "30",
  });

  React.useEffect(() => {
    if (opportunity) {
      setFormData({
        property_id: opportunity.property_id || "",
        title: opportunity.title,
        description: opportunity.description || "",
        capital_needed: opportunity.capital_needed?.toString() || "",
        your_contribution: opportunity.your_contribution || "",
        seeking: opportunity.seeking || "",
        proposed_split: opportunity.proposed_split || "50/50",
        deal_type: opportunity.deal_type || "",
        location: opportunity.location || "",
        visibility: opportunity.visibility || "public",
        expiration_days: "30",
      });
    } else {
      setFormData({
        property_id: "",
        title: "",
        description: "",
        capital_needed: "",
        your_contribution: "",
        seeking: "",
        proposed_split: "50/50",
        deal_type: "",
        location: "",
        visibility: "public",
        expiration_days: "30",
      });
    }
  }, [opportunity, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expiresAt = addDays(new Date(), parseInt(formData.expiration_days));
    onSave({
      ...formData,
      capital_needed: formData.capital_needed ? parseFloat(formData.capital_needed) : null,
      property_id: formData.property_id || null,
      expires_at: format(expiresAt, "yyyy-MM-dd'T'HH:mm:ss"),
      id: opportunity?.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? "Edit Opportunity" : "Post JV Opportunity"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Link to Property */}
          {properties.length > 0 && (
            <div className="space-y-2">
              <Label>Link to Property (Optional)</Label>
              <Select
                value={formData.property_id}
                onValueChange={(v) => setFormData((p) => ({ ...p, property_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No property linked</SelectItem>
                  {properties.map((prop) => (
                    <SelectItem key={prop.id} value={prop.id}>
                      {prop.address}, {prop.city}, {prop.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              placeholder="e.g., Seeking Capital Partner for Fix & Flip"
              value={formData.title}
              onChange={(v) => setFormData((p) => ({ ...p, title: v }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the opportunity in detail..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Capital Needed */}
            <div className="space-y-2">
              <Label>Capital Needed</Label>
              <Input
                type="number"
                placeholder="e.g., 150000"
                value={formData.capital_needed}
                onChange={(v) => setFormData((p) => ({ ...p, capital_needed: v }))}
              />
            </div>

            {/* Deal Type */}
            <div className="space-y-2">
              <Label>Deal Type</Label>
              <Select
                value={formData.deal_type}
                onValueChange={(v) => setFormData((p) => ({ ...p, deal_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select deal type" />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Your Contribution */}
          <div className="space-y-2">
            <Label>What You're Bringing</Label>
            <Input
              placeholder="e.g., Deal sourcing, project management, partial capital"
              value={formData.your_contribution}
              onChange={(v) => setFormData((p) => ({ ...p, your_contribution: v }))}
            />
          </div>

          {/* Seeking */}
          <div className="space-y-2">
            <Label>What You're Seeking</Label>
            <Input
              placeholder="e.g., Full capital funding, experienced partner"
              value={formData.seeking}
              onChange={(v) => setFormData((p) => ({ ...p, seeking: v }))}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Proposed Split */}
            <div className="space-y-2">
              <Label>Proposed Split</Label>
              <Select
                value={formData.proposed_split}
                onValueChange={(v) => setFormData((p) => ({ ...p, proposed_split: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPLIT_OPTIONS.map((split) => (
                    <SelectItem key={split} value={split}>
                      {split}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="e.g., Houston, TX"
                value={formData.location}
                onChange={(v) => setFormData((p) => ({ ...p, location: v }))}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Visibility */}
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(v) => setFormData((p) => ({ ...p, visibility: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Everyone can see</SelectItem>
                  <SelectItem value="connections_only">Connections Only</SelectItem>
                  <SelectItem value="private">Private - By invite only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label>Expires In</Label>
              <Select
                value={formData.expiration_days}
                onValueChange={(v) => setFormData((p) => ({ ...p, expiration_days: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<Save />} disabled={isLoading}>
              {opportunity ? "Update" : "Post Opportunity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
