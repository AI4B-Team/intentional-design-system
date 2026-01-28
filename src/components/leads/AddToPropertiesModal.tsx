import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Home, User, Phone, Mail } from "lucide-react";
import type { SellerLead } from "@/hooks/useSellerLeads";
import { useConvertLeadToProperty } from "@/hooks/useSellerLeads";

interface AddToPropertiesModalProps {
  lead: SellerLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (propertyId: string) => void;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New Lead" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "appointment", label: "Appointment Set" },
  { value: "negotiating", label: "Negotiating" },
  { value: "under_contract", label: "Under Contract" },
];

const PIPELINE_STAGES = [
  { value: "lead", label: "Lead" },
  { value: "prospect", label: "Prospect" },
  { value: "opportunity", label: "Opportunity" },
  { value: "contract", label: "Contract" },
  { value: "closed", label: "Closed" },
];

export function AddToPropertiesModal({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: AddToPropertiesModalProps) {
  const convertLead = useConvertLeadToProperty();
  const [status, setStatus] = useState("new");
  const [pipelineStage, setPipelineStage] = useState("lead");
  const [copyNotes, setCopyNotes] = useState(true);
  const [tags, setTags] = useState("");

  if (!lead) return null;

  const handleSubmit = async () => {
    const property = await convertLead.mutateAsync({
      lead,
      propertyData: {
        status,
        pipeline_stage: pipelineStage,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        copyNotes,
      },
    });
    onOpenChange(false);
    onSuccess?.(property.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Property from Lead</DialogTitle>
          <DialogDescription>
            This will create a new property in your database from this lead.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pre-filled Info */}
          <div className="p-4 bg-surface-secondary rounded-medium space-y-2">
            <div className="flex items-center gap-2 text-small">
              <Home className="h-4 w-4 text-content-tertiary" />
              <span className="font-medium">{lead.property_address}</span>
            </div>
            {lead.property_city && (
              <p className="text-small text-content-secondary ml-6">
                {[lead.property_city, lead.property_state, lead.property_zip]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {lead.full_name && (
              <div className="flex items-center gap-2 text-small">
                <User className="h-4 w-4 text-content-tertiary" />
                <span>{lead.full_name}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-small">
                <Phone className="h-4 w-4 text-content-tertiary" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-2 text-small">
                <Mail className="h-4 w-4 text-content-tertiary" />
                <span>{lead.email}</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pipeline Stage */}
          <div>
            <Label>Pipeline Stage</Label>
            <Select value={pipelineStage} onValueChange={setPipelineStage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="seller-lead, motivated, etc."
            />
            <p className="text-tiny text-content-tertiary mt-1">
              Separate with commas
            </p>
          </div>

          {/* Copy Notes */}
          <label className="flex items-center gap-2">
            <Checkbox
              checked={copyNotes}
              onCheckedChange={(checked) => setCopyNotes(!!checked)}
            />
            <span className="text-small">Copy lead notes to property</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={convertLead.isPending}
          >
            {convertLead.isPending && <Spinner size="sm" className="mr-2" />}
            Create Property
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
