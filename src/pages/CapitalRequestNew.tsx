import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
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
import { ArrowLeft, ArrowRight, CheckCircle2, Building2, DollarSign, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateFundingRequest } from "@/hooks/useCapital";

const steps = [
  { id: 1, label: "Loan Type", icon: Building2 },
  { id: 2, label: "Property Details", icon: DollarSign },
  { id: 3, label: "Your Profile", icon: User },
  { id: 4, label: "Review", icon: CheckCircle2 },
];

const requestTypes = [
  { value: "purchase", label: "Purchase", description: "Financing for property acquisition" },
  { value: "refinance", label: "Refinance", description: "Replace existing loan with better terms" },
  { value: "bridge", label: "Bridge Loan", description: "Short-term funding between transactions" },
  { value: "emd", label: "EMD", description: "Earnest money deposit funding" },
  { value: "transactional", label: "Transactional", description: "Same-day double close funding" },
];

const timelineOptions = [
  { value: "asap", label: "ASAP (1-3 days)" },
  { value: "1_week", label: "Within 1 week" },
  { value: "2_weeks", label: "Within 2 weeks" },
  { value: "30_days", label: "Within 30 days" },
];

const creditScoreOptions = [
  { value: "excellent", label: "Excellent (740+)" },
  { value: "good", label: "Good (670-739)" },
  { value: "fair", label: "Fair (580-669)" },
  { value: "poor", label: "Below 580" },
];

const experienceOptions = [
  { value: "first_deal", label: "First deal" },
  { value: "1_to_5", label: "1-5 deals" },
  { value: "6_to_20", label: "6-20 deals" },
  { value: "20_plus", label: "20+ deals" },
];

const exitStrategyOptions = [
  { value: "sell", label: "Sell/Flip" },
  { value: "refinance", label: "Refinance to long-term" },
  { value: "hold_rental", label: "Hold as rental" },
  { value: "wholesale", label: "Wholesale assignment" },
];

export default function CapitalRequestNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createRequest = useCreateFundingRequest();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    request_type: searchParams.get("type") || "",
    loan_amount_requested: "",
    purpose: "",
    property_value: "",
    arv: "",
    purchase_price: "",
    rehab_budget: "",
    exit_strategy: "",
    timeline_needed: "",
    credit_score_range: "",
    experience_level: "",
    notes: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    await createRequest.mutateAsync({
      request_type: formData.request_type,
      loan_amount_requested: formData.loan_amount_requested ? parseFloat(formData.loan_amount_requested) : null,
      purpose: formData.purpose || null,
      property_value: formData.property_value ? parseFloat(formData.property_value) : null,
      arv: formData.arv ? parseFloat(formData.arv) : null,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      rehab_budget: formData.rehab_budget ? parseFloat(formData.rehab_budget) : null,
      exit_strategy: formData.exit_strategy || null,
      timeline_needed: formData.timeline_needed || null,
      credit_score_range: formData.credit_score_range || null,
      experience_level: formData.experience_level || null,
      notes: formData.notes || null,
      property_id: null,
    });
    navigate("/capital");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.request_type;
      case 2:
        return !!formData.loan_amount_requested;
      case 3:
        return !!formData.timeline_needed;
      default:
        return true;
    }
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-lg">
        <button
          onClick={() => navigate("/capital")}
          className="flex items-center gap-2 text-content-secondary hover:text-content mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Capital
        </button>
        <h1 className="text-h1 font-bold text-content">New Funding Request</h1>
        <p className="text-body text-content-secondary mt-1">
          Tell us about your deal to get matched with the right lenders
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-lg">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                currentStep === step.id
                  ? "bg-brand text-white"
                  : currentStep > step.id
                  ? "bg-success/10 text-success"
                  : "bg-surface-secondary text-content-tertiary"
              )}
            >
              {currentStep > step.id ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
              <span className="text-small font-medium hidden sm:inline">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 transition-colors",
                  currentStep > step.id ? "bg-success" : "bg-border-subtle"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <Card variant="default" padding="lg" className="max-w-2xl mx-auto">
        {/* Step 1: Loan Type */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-h2 font-semibold text-content mb-2">What type of funding do you need?</h2>
              <p className="text-body text-content-secondary">Select the loan type that best fits your deal.</p>
            </div>
            <div className="grid gap-3">
              {requestTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-medium border-2 text-left transition-all",
                    formData.request_type === type.value
                      ? "border-brand bg-brand/5"
                      : "border-border-subtle hover:border-brand/50"
                  )}
                  onClick={() => updateField("request_type", type.value)}
                >
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                      formData.request_type === type.value ? "border-brand" : "border-border-subtle"
                    )}
                  >
                    {formData.request_type === type.value && (
                      <div className="h-2.5 w-2.5 rounded-full bg-brand" />
                    )}
                  </div>
                  <div>
                    <p className="text-body font-medium text-content">{type.label}</p>
                    <p className="text-small text-content-secondary">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Property Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-h2 font-semibold text-content mb-2">Property & Loan Details</h2>
              <p className="text-body text-content-secondary">Provide details about the property and loan amount.</p>
            </div>
            <div className="grid gap-4">
              <div>
                <Label>Loan Amount Requested *</Label>
                <Input
                  type="number"
                  placeholder="250000"
                  value={formData.loan_amount_requested}
                  onChange={(e) => updateField("loan_amount_requested", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Property Value</Label>
                  <Input
                    type="number"
                    placeholder="350000"
                    value={formData.property_value}
                    onChange={(e) => updateField("property_value", e.target.value)}
                  />
                </div>
                <div>
                  <Label>After Repair Value (ARV)</Label>
                  <Input
                    type="number"
                    placeholder="450000"
                    value={formData.arv}
                    onChange={(e) => updateField("arv", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Purchase Price</Label>
                  <Input
                    type="number"
                    placeholder="300000"
                    value={formData.purchase_price}
                    onChange={(e) => updateField("purchase_price", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Rehab Budget</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={formData.rehab_budget}
                    onChange={(e) => updateField("rehab_budget", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Exit Strategy</Label>
                <Select value={formData.exit_strategy} onValueChange={(v) => updateField("exit_strategy", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exit strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {exitStrategyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Purpose / Notes</Label>
                <Textarea
                  placeholder="Describe the deal..."
                  value={formData.purpose}
                  onChange={(e) => updateField("purpose", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Your Profile */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-h2 font-semibold text-content mb-2">Your Profile</h2>
              <p className="text-body text-content-secondary">Help us match you with the right lenders.</p>
            </div>
            <div className="grid gap-4">
              <div>
                <Label>Timeline Needed *</Label>
                <Select value={formData.timeline_needed} onValueChange={(v) => updateField("timeline_needed", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you need funding?" />
                  </SelectTrigger>
                  <SelectContent>
                    {timelineOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Credit Score Range</Label>
                <Select
                  value={formData.credit_score_range}
                  onValueChange={(v) => updateField("credit_score_range", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select credit score range" />
                  </SelectTrigger>
                  <SelectContent>
                    {creditScoreOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Experience Level</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(v) => updateField("experience_level", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How many deals have you done?" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any additional details that might help..."
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-h2 font-semibold text-content mb-2">Review Your Request</h2>
              <p className="text-body text-content-secondary">Confirm the details before submitting.</p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-surface-secondary rounded-medium">
                <h3 className="text-small font-medium text-content-tertiary uppercase tracking-wide mb-3">
                  Loan Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-tiny text-content-tertiary">Type</p>
                    <p className="text-body font-medium text-content capitalize">
                      {formData.request_type.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-tiny text-content-tertiary">Amount</p>
                    <p className="text-body font-medium text-content">
                      ${parseFloat(formData.loan_amount_requested || "0").toLocaleString()}
                    </p>
                  </div>
                  {formData.property_value && (
                    <div>
                      <p className="text-tiny text-content-tertiary">Property Value</p>
                      <p className="text-body text-content">${parseFloat(formData.property_value).toLocaleString()}</p>
                    </div>
                  )}
                  {formData.arv && (
                    <div>
                      <p className="text-tiny text-content-tertiary">ARV</p>
                      <p className="text-body text-content">${parseFloat(formData.arv).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-surface-secondary rounded-medium">
                <h3 className="text-small font-medium text-content-tertiary uppercase tracking-wide mb-3">
                  Your Profile
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-tiny text-content-tertiary">Timeline</p>
                    <p className="text-body text-content capitalize">
                      {formData.timeline_needed?.replace("_", " ") || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-tiny text-content-tertiary">Credit Score</p>
                    <p className="text-body text-content capitalize">
                      {formData.credit_score_range || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-tiny text-content-tertiary">Experience</p>
                    <p className="text-body text-content capitalize">
                      {formData.experience_level?.replace("_", " ") || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-tiny text-content-tertiary">Exit Strategy</p>
                    <p className="text-body text-content capitalize">
                      {formData.exit_strategy?.replace("_", " ") || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {formData.purpose && (
                <div className="p-4 bg-surface-secondary rounded-medium">
                  <h3 className="text-small font-medium text-content-tertiary uppercase tracking-wide mb-2">
                    Purpose
                  </h3>
                  <p className="text-body text-content">{formData.purpose}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {currentStep < steps.length ? (
            <Button variant="primary" onClick={handleNext} disabled={!canProceed()}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} loading={createRequest.isPending}>
              Submit Request
            </Button>
          )}
        </div>
      </Card>
    </PageLayout>
  );
}
