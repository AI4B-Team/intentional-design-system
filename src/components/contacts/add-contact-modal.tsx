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
import { useCreateContact, type ContactType, type ContactStatus, contactTypeConfig } from "@/hooks/useContacts";
import { z } from "zod";

interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: ContactType;
}

const contactSchema = z.object({
  type: z.enum([
    "agent", "seller", "lender", "buyer", "wholesaler", 
    "contractor", "title_company", "attorney", "property_manager", "inspector"
  ], { required_error: "Type is required" }),
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  company: z.string().max(100).optional(),
  phone: z.string().regex(/^(\+?1)?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, "Invalid phone format").optional().or(z.literal("")),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  zip: z.string().max(10).optional(),
  instagram: z.string().max(30).optional(),
  facebook: z.string().url("Invalid Facebook URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  source: z.string().optional(),
  status: z.enum(["cold", "contacted", "responded", "active", "inactive"]).default("cold"),
  notes: z.string().max(1000).optional(),
  // Type-specific fields
  specialty: z.array(z.string()).optional(),
  license_number: z.string().optional(),
});

type FormData = z.infer<typeof contactSchema>;

const getInitialFormData = (defaultType?: ContactType): Partial<FormData> => ({
  type: defaultType,
  name: "",
  company: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  zip: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  source: "",
  status: "cold",
  notes: "",
  specialty: [],
  license_number: "",
});

const sourceOptions = [
  "Instagram",
  "Facebook",
  "REIA",
  "BiggerPockets",
  "Referral",
  "Cold Outreach",
  "Website",
  "Networking Event",
  "Other",
];

const specialtyOptions: Record<string, string[]> = {
  contractor: ["General", "Kitchen", "Bathroom", "Roofing", "HVAC", "Electrical", "Plumbing", "Flooring", "Paint", "Landscaping"],
  inspector: ["General", "Structural", "Electrical", "Plumbing", "HVAC", "Roof", "Foundation", "Mold", "Pest"],
  attorney: ["Real Estate", "Contract", "Foreclosure", "Estate Planning", "Tax", "Commercial"],
};

export function AddContactModal({ open, onOpenChange, defaultType }: AddContactModalProps) {
  const [formData, setFormData] = useState<Partial<FormData>>(getInitialFormData(defaultType));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);
  
  const createContact = useCreateContact();

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    
    const result = contactSchema.safeParse(formData);
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
      await createContact.mutateAsync({
        type: result.data.type,
        name: result.data.name,
        company: result.data.company || null,
        phone: result.data.phone || null,
        email: result.data.email || null,
        city: result.data.city || null,
        state: result.data.state || null,
        zip: result.data.zip || null,
        instagram: result.data.instagram || null,
        facebook: result.data.facebook || null,
        linkedin: result.data.linkedin || null,
        source: result.data.source || null,
        status: result.data.status,
        notes: result.data.notes || null,
        specialty: result.data.specialty || null,
        license_number: result.data.license_number || null,
      });

      if (addAnother) {
        setFormData(getInitialFormData(defaultType));
        setErrors({});
      } else {
        onOpenChange(false);
        setFormData(getInitialFormData(defaultType));
        setErrors({});
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData(getInitialFormData(defaultType));
    setErrors({});
  };

  const showSpecialties = formData.type && specialtyOptions[formData.type];
  const showLicense = ["contractor", "agent", "lender", "inspector", "attorney"].includes(formData.type || "");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
          <DialogDescription>
            Add a new contact to your CRM
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Type & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleChange("type", v as ContactType)}
              >
                <SelectTrigger id="type" className={errors.type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(contactTypeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
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
                onValueChange={(v) => handleChange("status", v as ContactStatus)}
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

          {/* Location */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Miami"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value.toUpperCase().slice(0, 2))}
                placeholder="FL"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => handleChange("zip", e.target.value)}
                placeholder="33101"
              />
            </div>
          </div>

          {/* Type-specific: Specialties */}
          {showSpecialties && (
            <div className="space-y-2">
              <Label>Specialties</Label>
              <div className="flex flex-wrap gap-2">
                {specialtyOptions[formData.type!].map((specialty) => {
                  const isSelected = formData.specialty?.includes(specialty);
                  return (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => {
                        const current = formData.specialty || [];
                        handleChange(
                          "specialty",
                          isSelected
                            ? current.filter((s) => s !== specialty)
                            : [...current, specialty]
                        );
                      }}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-slate-700 border-slate-200 hover:border-primary"
                      }`}
                    >
                      {specialty}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Type-specific: License */}
          {showLicense && (
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => handleChange("license_number", e.target.value)}
                placeholder="Enter license number"
              />
            </div>
          )}

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
            disabled={createContact.isPending}
          >
            {createContact.isPending && saveAndAddAnother && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Save & Add Another
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit(false)}
            disabled={createContact.isPending}
          >
            {createContact.isPending && !saveAndAddAnother && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
