import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Search, Sparkles } from "lucide-react";
import { useAttomLookup } from "@/hooks/useAttom";
import { mapPropertyType, type AttomPropertyData } from "@/lib/attom";
import { toast } from "sonner";

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: PropertyFormData) => void;
}

interface PropertyFormData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  beds: string;
  baths: string;
  sqft: string;
  yearBuilt: string;
  askingPrice: string;
  arv: string;
  source: string;
  notes: string;
  // ATTOM fields
  attom_id?: number;
  apn?: string;
  fips?: string;
  latitude?: number;
  longitude?: number;
  owner_name?: string;
  owner_mailing_address?: string;
  assessed_value?: number;
  tax_amount?: number;
  last_sale_date?: string;
  last_sale_price?: number;
}

const initialFormData: PropertyFormData = {
  address: "",
  city: "",
  state: "",
  zipCode: "",
  propertyType: "",
  beds: "",
  baths: "",
  sqft: "",
  yearBuilt: "",
  askingPrice: "",
  arv: "",
  source: "",
  notes: "",
};

const propertyTypes = [
  "Single Family",
  "Multi-Family",
  "Condo",
  "Townhouse",
  "Land",
  "Commercial",
];

const sources = [
  "Direct Mail",
  "Cold Call",
  "Driving for Dollars",
  "Referral",
  "MLS",
  "Wholesaler",
  "Other",
];

const states = ["TX", "FL", "CA", "AZ", "GA", "NC", "TN", "OH", "PA", "NY"];

// Track which fields were auto-filled
type AutoFilledFields = Set<keyof PropertyFormData>;

export function AddPropertyModal({ open, onOpenChange, onSave }: AddPropertyModalProps) {
  const [formData, setFormData] = React.useState<PropertyFormData>(initialFormData);
  const [autoFilledFields, setAutoFilledFields] = React.useState<AutoFilledFields>(new Set());
  const [step, setStep] = React.useState(1);
  const totalSteps = 3;

  const attomLookup = useAttomLookup();

  const updateField = (field: keyof PropertyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Remove auto-fill badge if user manually edits
    setAutoFilledFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setAutoFilledFields(new Set());
    setStep(1);
    onOpenChange(false);
  };

  const handleSave = () => {
    onSave?.(formData);
    handleClose();
  };

  const handleAutoFill = async () => {
    if (!formData.address || !formData.city || !formData.state) {
      toast.error("Please enter address, city, and state first");
      return;
    }

    try {
      const data = await attomLookup.mutateAsync({
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
      });

      // Map ATTOM data to form fields
      const newAutoFilled = new Set<keyof PropertyFormData>();
      const updates: Partial<PropertyFormData> = {};

      if (data.property_type) {
        updates.propertyType = mapPropertyType(data.property_type);
        newAutoFilled.add("propertyType");
      }
      if (data.beds) {
        updates.beds = String(data.beds);
        newAutoFilled.add("beds");
      }
      if (data.baths) {
        updates.baths = String(data.baths);
        newAutoFilled.add("baths");
      }
      if (data.sqft) {
        updates.sqft = String(data.sqft);
        newAutoFilled.add("sqft");
      }
      if (data.year_built) {
        updates.yearBuilt = String(data.year_built);
        newAutoFilled.add("yearBuilt");
      }

      // Store ATTOM-specific data
      if (data.attom_id) updates.attom_id = data.attom_id;
      if (data.apn) updates.apn = data.apn;
      if (data.fips) updates.fips = data.fips;
      if (data.latitude) updates.latitude = data.latitude;
      if (data.longitude) updates.longitude = data.longitude;
      if (data.owner_name) {
        updates.owner_name = data.owner_name;
        newAutoFilled.add("owner_name" as any);
      }
      if (data.owner_mailing_address) {
        updates.owner_mailing_address = data.owner_mailing_address;
      }
      if (data.assessed_value) updates.assessed_value = data.assessed_value;
      if (data.tax_amount) updates.tax_amount = data.tax_amount;
      if (data.last_sale_date) updates.last_sale_date = data.last_sale_date;
      if (data.last_sale_price) updates.last_sale_price = data.last_sale_price;

      setFormData((prev) => ({ ...prev, ...updates }));
      setAutoFilledFields(newAutoFilled);

      toast.success("Property data loaded!", {
        description: "Review the auto-filled fields and save.",
      });
    } catch (error: any) {
      toast.warning("Property not found in database", {
        description: "Please enter details manually.",
      });
    }
  };

  const isStepValid = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return Boolean(formData.address && formData.city && formData.state);
      case 2:
        return Boolean(formData.propertyType);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(step);
  const canAutoFill = formData.address && formData.city && formData.state;

  const renderFieldWithBadge = (
    field: keyof PropertyFormData,
    element: React.ReactNode
  ) => {
    if (autoFilledFields.has(field)) {
      return (
        <div className="relative">
          {element}
          <Badge
            variant="success"
            size="sm"
            className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0"
          >
            <Sparkles className="h-2.5 w-2.5 mr-0.5" />
            Auto
          </Badge>
        </div>
      );
    }
    return element;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border-subtle pb-4">
          <DialogTitle>Add New Property</DialogTitle>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => {
              const stepNum = i + 1;
              const isComplete = step > stepNum;
              const isCurrent = step === stepNum;

              return (
                <React.Fragment key={stepNum}>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-small font-medium transition-colors",
                      isComplete
                        ? "bg-success text-white"
                        : isCurrent
                        ? "bg-brand text-white"
                        : "bg-surface-tertiary text-content-secondary"
                    )}
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  <span
                    className={cn(
                      "text-small",
                      isCurrent ? "text-content font-medium" : "text-content-secondary"
                    )}
                  >
                    {stepNum === 1 && "Location"}
                    {stepNum === 2 && "Details"}
                    {stepNum === 3 && "Financials"}
                  </span>
                  {stepNum < totalSteps && (
                    <div className="flex-1 h-px bg-border mx-2" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto">
          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <h4 className="text-body font-medium text-content">Property Address</h4>
                <Input
                  label="Street Address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(v) => updateField("address", v)}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="Austin"
                    value={formData.city}
                    onChange={(v) => updateField("city", v)}
                    required
                  />
                  <div className="space-y-1.5">
                    <label className="block text-small font-medium text-content">
                      State <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={formData.state}
                      onValueChange={(v) => updateField("state", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Input
                  label="ZIP Code"
                  placeholder="78701"
                  value={formData.zipCode}
                  onChange={(v) => updateField("zipCode", v)}
                />

                {/* Auto-Fill Button */}
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={handleAutoFill}
                    disabled={!canAutoFill || attomLookup.isPending}
                    icon={
                      attomLookup.isPending ? (
                        <Spinner size="sm" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )
                    }
                  >
                    {attomLookup.isPending
                      ? "Fetching property data from ATTOM..."
                      : "Auto-Fill Property Data"}
                  </Button>
                  <p className="text-tiny text-content-tertiary text-center mt-2">
                    Automatically fetch beds, baths, sqft, year built, and more
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <h4 className="text-body font-medium text-content">Property Details</h4>
                {renderFieldWithBadge(
                  "propertyType",
                  <div className="space-y-1.5">
                    <label className="block text-small font-medium text-content">
                      Property Type <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(v) => updateField("propertyType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  {renderFieldWithBadge(
                    "beds",
                    <Input
                      label="Beds"
                      type="number"
                      placeholder="3"
                      value={formData.beds}
                      onChange={(v) => updateField("beds", v)}
                    />
                  )}
                  {renderFieldWithBadge(
                    "baths",
                    <Input
                      label="Baths"
                      type="number"
                      placeholder="2"
                      value={formData.baths}
                      onChange={(v) => updateField("baths", v)}
                    />
                  )}
                  {renderFieldWithBadge(
                    "sqft",
                    <Input
                      label="Sq Ft"
                      type="number"
                      placeholder="1,500"
                      value={formData.sqft}
                      onChange={(v) => updateField("sqft", v)}
                    />
                  )}
                </div>
                {renderFieldWithBadge(
                  "yearBuilt",
                  <Input
                    label="Year Built"
                    type="number"
                    placeholder="1985"
                    value={formData.yearBuilt}
                    onChange={(v) => updateField("yearBuilt", v)}
                  />
                )}
                <div className="space-y-1.5">
                  <label className="block text-small font-medium text-content">
                    Lead Source
                  </label>
                  <Select
                    value={formData.source}
                    onValueChange={(v) => updateField("source", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How did you find this?" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financials */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <h4 className="text-body font-medium text-content">Financial Details</h4>
                <p className="text-small text-content-secondary">
                  These fields are optional but help with analysis.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Asking Price"
                    placeholder="$250,000"
                    value={formData.askingPrice}
                    onChange={(v) => updateField("askingPrice", v)}
                  />
                  <Input
                    label="ARV (After Repair Value)"
                    placeholder="$350,000"
                    value={formData.arv}
                    onChange={(v) => updateField("arv", v)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-small font-medium text-content">
                    Notes
                  </label>
                  <textarea
                    placeholder="Any additional notes about this property..."
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="flex min-h-[100px] w-full rounded-small border border-border bg-background px-3.5 py-2.5 text-body transition-all duration-150 placeholder:text-content-tertiary focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/10 resize-none"
                  />
                </div>

                {/* Show auto-filled info */}
                {autoFilledFields.size > 0 && (
                  <div className="p-3 rounded-medium bg-success/5 border border-success/20">
                    <p className="text-small text-content">
                      <Sparkles className="h-4 w-4 inline-block mr-1.5 text-success" />
                      {autoFilledFields.size} fields were auto-filled from ATTOM data
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="border-t border-border-subtle pt-4">
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              onClick={step === 1 ? handleClose : () => setStep(step - 1)}
            >
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            <div className="flex gap-3">
              {step < totalSteps ? (
                <Button
                  variant="primary"
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed}
                >
                  Continue
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSave}>
                  Save Property
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
