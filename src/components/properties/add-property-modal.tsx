import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Check } from "lucide-react";

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

export function AddPropertyModal({ open, onOpenChange, onSave }: AddPropertyModalProps) {
  const [formData, setFormData] = React.useState<PropertyFormData>(initialFormData);
  const [step, setStep] = React.useState(1);
  const totalSteps = 3;

  const updateField = (field: keyof PropertyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setStep(1);
    onOpenChange(false);
  };

  const handleSave = () => {
    onSave?.(formData);
    handleClose();
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
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <h4 className="text-body font-medium text-content">Property Details</h4>
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
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Beds"
                    type="number"
                    placeholder="3"
                    value={formData.beds}
                    onChange={(v) => updateField("beds", v)}
                  />
                  <Input
                    label="Baths"
                    type="number"
                    placeholder="2"
                    value={formData.baths}
                    onChange={(v) => updateField("baths", v)}
                  />
                  <Input
                    label="Sq Ft"
                    type="number"
                    placeholder="1,500"
                    value={formData.sqft}
                    onChange={(v) => updateField("sqft", v)}
                  />
                </div>
                <Input
                  label="Year Built"
                  type="number"
                  placeholder="1985"
                  value={formData.yearBuilt}
                  onChange={(v) => updateField("yearBuilt", v)}
                />
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
