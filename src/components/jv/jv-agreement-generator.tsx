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
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Send } from "lucide-react";
import { toast } from "sonner";

interface JVAgreementGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityTitle?: string;
  propertyAddress?: string;
}

interface AgreementFormData {
  // Partner 1
  partner1_name: string;
  partner1_email: string;
  partner1_role: string;
  partner1_contribution: string;
  // Partner 2
  partner2_name: string;
  partner2_email: string;
  partner2_role: string;
  partner2_contribution: string;
  // Deal
  property_address: string;
  purchase_price: string;
  rehab_budget: string;
  arv: string;
  // Split
  split_type: string;
  partner1_split: string;
  partner2_split: string;
  preferred_return: string;
  // Terms
  decision_making: string;
  exit_terms: string;
  additional_terms: string;
}

const SPLIT_TYPES = [
  { value: "simple", label: "Simple Split (e.g., 50/50)" },
  { value: "preferred", label: "Preferred Return + Split" },
  { value: "waterfall", label: "Waterfall Structure" },
];

const DECISION_OPTIONS = [
  { value: "unanimous", label: "Unanimous consent required" },
  { value: "majority_capital", label: "Majority capital decides" },
  { value: "operating_partner", label: "Operating partner decides day-to-day" },
];

export function JVAgreementGenerator({
  open,
  onOpenChange,
  opportunityTitle,
  propertyAddress,
}: JVAgreementGeneratorProps) {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState<AgreementFormData>({
    partner1_name: "",
    partner1_email: "",
    partner1_role: "Capital Partner",
    partner1_contribution: "",
    partner2_name: "",
    partner2_email: "",
    partner2_role: "Operating Partner",
    partner2_contribution: "",
    property_address: propertyAddress || "",
    purchase_price: "",
    rehab_budget: "",
    arv: "",
    split_type: "simple",
    partner1_split: "50",
    partner2_split: "50",
    preferred_return: "",
    decision_making: "operating_partner",
    exit_terms: "",
    additional_terms: "",
  });

  React.useEffect(() => {
    if (propertyAddress) {
      setFormData((p) => ({ ...p, property_address: propertyAddress }));
    }
  }, [propertyAddress]);

  const handleChange = (field: keyof AgreementFormData, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const handleGenerate = () => {
    // In production, this would generate actual document
    toast.success("JV Agreement generated! Download starting...");
    onOpenChange(false);
  };

  const totalSteps = 4;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate JV Agreement
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? "bg-brand-accent" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Partners */}
        {step === 1 && (
          <div className="space-y-6">
            <Card variant="default" padding="md">
              <h3 className="text-body font-semibold mb-4">Partner 1 (You)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.partner1_name}
                    onChange={(v) => handleChange("partner1_name", v)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.partner1_email}
                    onChange={(v) => handleChange("partner1_email", v)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={formData.partner1_role}
                    onValueChange={(v) => handleChange("partner1_role", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Capital Partner">Capital Partner</SelectItem>
                      <SelectItem value="Operating Partner">Operating Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Capital Contribution</Label>
                  <Input
                    type="number"
                    value={formData.partner1_contribution}
                    onChange={(v) => handleChange("partner1_contribution", v)}
                    placeholder="$ amount"
                  />
                </div>
              </div>
            </Card>

            <Card variant="default" padding="md">
              <h3 className="text-body font-semibold mb-4">Partner 2</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.partner2_name}
                    onChange={(v) => handleChange("partner2_name", v)}
                    placeholder="Partner's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.partner2_email}
                    onChange={(v) => handleChange("partner2_email", v)}
                    placeholder="partner@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={formData.partner2_role}
                    onValueChange={(v) => handleChange("partner2_role", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Capital Partner">Capital Partner</SelectItem>
                      <SelectItem value="Operating Partner">Operating Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Capital Contribution</Label>
                  <Input
                    type="number"
                    value={formData.partner2_contribution}
                    onChange={(v) => handleChange("partner2_contribution", v)}
                    placeholder="$ amount"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Deal Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Property Address</Label>
              <Input
                value={formData.property_address}
                onChange={(v) => handleChange("property_address", v)}
                placeholder="Full property address"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Purchase Price</Label>
                <Input
                  type="number"
                  value={formData.purchase_price}
                  onChange={(v) => handleChange("purchase_price", v)}
                  placeholder="$"
                />
              </div>
              <div className="space-y-2">
                <Label>Rehab Budget</Label>
                <Input
                  type="number"
                  value={formData.rehab_budget}
                  onChange={(v) => handleChange("rehab_budget", v)}
                  placeholder="$"
                />
              </div>
              <div className="space-y-2">
                <Label>ARV</Label>
                <Input
                  type="number"
                  value={formData.arv}
                  onChange={(v) => handleChange("arv", v)}
                  placeholder="$"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Profit Split */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Split Structure</Label>
              <Select
                value={formData.split_type}
                onValueChange={(v) => handleChange("split_type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPLIT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Partner 1 Split (%)</Label>
                <Input
                  type="number"
                  value={formData.partner1_split}
                  onChange={(v) => handleChange("partner1_split", v)}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Partner 2 Split (%)</Label>
                <Input
                  type="number"
                  value={formData.partner2_split}
                  onChange={(v) => handleChange("partner2_split", v)}
                  max={100}
                />
              </div>
            </div>

            {formData.split_type === "preferred" && (
              <div className="space-y-2">
                <Label>Preferred Return (%)</Label>
                <Input
                  type="number"
                  value={formData.preferred_return}
                  onChange={(v) => handleChange("preferred_return", v)}
                  placeholder="e.g., 8"
                />
                <p className="text-tiny text-muted-foreground">
                  Capital partner receives this return before profit split
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Terms */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Decision Making</Label>
              <Select
                value={formData.decision_making}
                onValueChange={(v) => handleChange("decision_making", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DECISION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Exit / Dissolution Terms</Label>
              <Textarea
                value={formData.exit_terms}
                onChange={(e) => handleChange("exit_terms", e.target.value)}
                placeholder="e.g., Either party may exit with 30-day notice after project completion..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Terms</Label>
              <Textarea
                value={formData.additional_terms}
                onChange={(e) => handleChange("additional_terms", e.target.value)}
                placeholder="Any other terms or conditions..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-border-subtle">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < totalSteps ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Download />} onClick={handleGenerate}>
                Download PDF
              </Button>
              <Button variant="primary" icon={<Send />} onClick={handleGenerate}>
                Send for Signature
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
