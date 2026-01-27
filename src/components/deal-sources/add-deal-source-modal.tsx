import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
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
import { Loader2, Instagram, Facebook, Linkedin } from "lucide-react";
import { useCreateDealSource, type DealSourceType, type DealSourceStatus } from "@/hooks/useDealSources";
import { z } from "zod";

interface AddDealSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const dealSourceSchema = z.object({
  type: z.enum(["agent", "wholesaler", "lender"], { required_error: "Type is required" }),
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  company: z.string().max(100).optional(),
  phone: z.string().regex(/^(\+?1)?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, "Invalid phone format").optional().or(z.literal("")),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  instagram: z.string().max(30).optional(),
  facebook: z.string().url("Invalid Facebook URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  source: z.string().optional(),
  status: z.enum(["cold", "contacted", "responded", "active", "inactive"]).default("cold"),
  notes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof dealSourceSchema>;

const initialFormData: Partial<FormData> = {
  type: undefined,
  name: "",
  company: "",
  phone: "",
  email: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  source: "",
  status: "cold",
  notes: "",
};

const sourceOptions = [
  "Instagram",
  "Facebook",
  "REIA",
  "BiggerPockets",
  "Referral",
  "Cold Outreach",
  "Other",
];

export function AddDealSourceModal({ open, onOpenChange }: AddDealSourceModalProps) {
  const [formData, setFormData] = useState<Partial<FormData>>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);
  
  const createDealSource = useCreateDealSource();

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (addAnother: boolean = false) => {
    setSaveAndAddAnother(addAnother);
    
    // Validate
    const result = dealSourceSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await createDealSource.mutateAsync({
        type: result.data.type,
        name: result.data.name,
        company: result.data.company || null,
        phone: result.data.phone || null,
        email: result.data.email || null,
        instagram: result.data.instagram || null,
        facebook: result.data.facebook || null,
        linkedin: result.data.linkedin || null,
        source: result.data.source || null,
        status: result.data.status,
        notes: result.data.notes || null,
      });

      if (addAnother) {
        setFormData(initialFormData);
        setErrors({});
      } else {
        onOpenChange(false);
        setFormData(initialFormData);
        setErrors({});
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Deal Source</DialogTitle>
          <DialogDescription>
            Add a new agent, wholesaler, or lender to your network
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Type & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleChange("type", v as DealSourceType)}
              >
                <SelectTrigger id="type" className={errors.type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="lender">Lender</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-tiny text-destructive">{errors.type}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Smith"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-tiny text-destructive">{errors.name}</p>}
            </div>
          </div>

          {/* Company & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="ABC Realty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleChange("status", v as DealSourceStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-tiny text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-tiny text-destructive">{errors.email}</p>}
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-3">
            <Label className="text-small text-content-secondary">Social Media</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-tiny text-content-tertiary">
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </div>
                <Input
                  value={formData.instagram}
                  onChange={(e) => handleChange("instagram", e.target.value.replace("@", ""))}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-tiny text-content-tertiary">
                  <Facebook className="h-4 w-4" />
                  <span>Facebook</span>
                </div>
                <Input
                  value={formData.facebook}
                  onChange={(e) => handleChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/..."
                  className={errors.facebook ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-tiny text-content-tertiary">
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </div>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className={errors.linkedin ? "border-destructive" : ""}
                />
              </div>
            </div>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">How did you find them?</Label>
            <Select
              value={formData.source}
              onValueChange={(v) => handleChange("source", v)}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((opt) => (
                  <SelectItem key={opt} value={opt.toLowerCase()}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lender-specific fields */}
          {formData.type === "lender" && (
            <div className="p-4 bg-surface-secondary rounded-medium border border-border-subtle">
              <h4 className="text-small font-medium text-content mb-2">Lending Criteria</h4>
              <p className="text-tiny text-content-secondary">
                Detailed lending criteria management coming soon. For now, add notes below.
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any additional notes about this contact..."
              rows={3}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit(true)}
            disabled={createDealSource.isPending}
          >
            {createDealSource.isPending && saveAndAddAnother && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Save & Add Another
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit(false)}
            disabled={createDealSource.isPending}
          >
            {createDealSource.isPending && !saveAndAddAnother && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
