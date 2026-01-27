import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalculatorSlider } from "@/components/calculators/calculator-input";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  Clock,
  Users,
  FileText,
  Home,
  DollarSign,
} from "lucide-react";
import confetti from "canvas-confetti";

interface WizardStep {
  id: string;
  label: string;
  icon: React.ElementType;
}

const steps: WizardStep[] = [
  { id: "property", label: "Property Info", icon: Home },
  { id: "funding", label: "Funding Details", icon: DollarSign },
  { id: "experience", label: "Your Experience", icon: Users },
  { id: "review", label: "Review & Submit", icon: FileText },
];

interface FundingRequest {
  // Property Info
  propertyType: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  purchasePrice: number;
  arv: number;
  
  // Funding Details
  loanType: string;
  loanAmount: number;
  ltv: number;
  exitStrategy: string;
  timelineNeeded: string;
  
  // Experience
  experienceLevel: string;
  dealsCompleted: number;
  additionalNotes: string;
  
  // Contact
  fullName: string;
  email: string;
  phone: string;
}

const defaultRequest: FundingRequest = {
  propertyType: "",
  propertyAddress: "",
  city: "",
  state: "",
  zipCode: "",
  purchasePrice: 0,
  arv: 0,
  loanType: "",
  loanAmount: 0,
  ltv: 70,
  exitStrategy: "",
  timelineNeeded: "",
  experienceLevel: "",
  dealsCompleted: 0,
  additionalNotes: "",
  fullName: "",
  email: "",
  phone: "",
};

interface FundingWizardProps {
  onComplete: (request: FundingRequest) => void;
  className?: string;
}

function StepIndicator({
  steps,
  currentStep,
  completedSteps,
}: {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: number[];
}) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isCurrent = index === currentStep;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                  isCompleted
                    ? "bg-success text-white"
                    : isCurrent
                    ? "bg-brand-accent text-white"
                    : "bg-surface-tertiary text-content-tertiary"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-tiny mt-2 hidden sm:block",
                  isCurrent ? "text-brand-accent font-medium" : "text-content-tertiary"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-12 sm:w-20 mx-2",
                  isCompleted ? "bg-success" : "bg-border-subtle"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function FundingWizard({ onComplete, className }: FundingWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const [request, setRequest] = React.useState<FundingRequest>(defaultRequest);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const updateRequest = <K extends keyof FundingRequest>(
    key: K,
    value: FundingRequest[K]
  ) => {
    setRequest((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#3b82f6", "#8b5cf6"],
    });
    setIsSubmitted(true);
    onComplete(request);
  };

  if (isSubmitted) {
    return (
      <Card variant="default" padding="lg" className={cn("text-center", className)}>
        <div className="py-8">
          <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-h1 font-bold text-content mb-2">Request Submitted!</h2>
          <p className="text-body text-content-secondary mb-6 max-w-md mx-auto">
            Your funding request has been sent to our network of lenders.
            Expect to hear back within 24 hours.
          </p>

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="flex items-center gap-2 text-content-secondary mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-small">Avg Response Time</span>
              </div>
              <div className="text-h3 font-semibold text-content">4 hours</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <div className="flex items-center gap-2 text-content-secondary mb-1">
                <Users className="h-4 w-4" />
                <span className="text-small">Lenders Notified</span>
              </div>
              <div className="text-h3 font-semibold text-content">12</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="primary">View Request Status</Button>
            <Button variant="secondary">Browse More Lenders</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg" className={className}>
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Step 1: Property Info */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-h2 font-semibold text-content">Property Information</h2>
            <p className="text-small text-content-secondary">Tell us about the property you need funding for</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select value={request.propertyType} onValueChange={(v) => updateRequest("propertyType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="sfr">Single Family</SelectItem>
                  <SelectItem value="multi">Multi-Family (2-4)</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select value={request.state} onValueChange={(v) => updateRequest("state", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-60">
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="GA">Georgia</SelectItem>
                  <SelectItem value="NC">North Carolina</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Property Address</Label>
            <Input
              placeholder="123 Main Street"
              value={request.propertyAddress}
              onChange={(e) => updateRequest("propertyAddress", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                placeholder="City"
                value={request.city}
                onChange={(e) => updateRequest("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                placeholder="ZIP"
                value={request.zipCode}
                onChange={(e) => updateRequest("zipCode", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Purchase Price</Label>
              <Input
                type="number"
                placeholder="$0"
                value={request.purchasePrice || ""}
                onChange={(e) => updateRequest("purchasePrice", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>After Repair Value (ARV)</Label>
              <Input
                type="number"
                placeholder="$0"
                value={request.arv || ""}
                onChange={(e) => updateRequest("arv", Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Funding Details */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-h2 font-semibold text-content">Funding Details</h2>
            <p className="text-small text-content-secondary">What type of funding do you need?</p>
          </div>

          <div className="space-y-2">
            <Label>Loan Type</Label>
            <RadioGroup
              value={request.loanType}
              onValueChange={(v) => updateRequest("loanType", v)}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { value: "fix-flip", label: "Fix & Flip" },
                { value: "dscr", label: "DSCR Rental" },
                { value: "bridge", label: "Bridge Loan" },
                { value: "construction", label: "Construction" },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-medium border cursor-pointer transition-all",
                    request.loanType === option.value
                      ? "border-brand-accent bg-brand-accent/5"
                      : "border-border hover:border-brand-accent/50"
                  )}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Loan Amount Needed</Label>
            <Input
              type="number"
              placeholder="$0"
              value={request.loanAmount || ""}
              onChange={(e) => updateRequest("loanAmount", Number(e.target.value))}
            />
          </div>

          <CalculatorSlider
            label="Desired LTV"
            value={request.ltv}
            onChange={(v) => updateRequest("ltv", v)}
            min={50}
            max={90}
            step={5}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Exit Strategy</Label>
              <Select value={request.exitStrategy} onValueChange={(v) => updateRequest("exitStrategy", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="sell">Sell after rehab</SelectItem>
                  <SelectItem value="refinance">Refinance to long-term</SelectItem>
                  <SelectItem value="hold">Hold as rental</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>When do you need funding?</Label>
              <Select value={request.timelineNeeded} onValueChange={(v) => updateRequest("timelineNeeded", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="asap">ASAP (1-3 days)</SelectItem>
                  <SelectItem value="1-week">Within 1 week</SelectItem>
                  <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Experience */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-h2 font-semibold text-content">Your Experience</h2>
            <p className="text-small text-content-secondary">Help lenders understand your background</p>
          </div>

          <div className="space-y-2">
            <Label>Experience Level</Label>
            <RadioGroup
              value={request.experienceLevel}
              onValueChange={(v) => updateRequest("experienceLevel", v)}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { value: "beginner", label: "Beginner", desc: "0-2 deals" },
                { value: "intermediate", label: "Intermediate", desc: "3-10 deals" },
                { value: "experienced", label: "Experienced", desc: "10+ deals" },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`exp-${option.value}`}
                  className={cn(
                    "flex flex-col items-center gap-1 p-4 rounded-medium border cursor-pointer transition-all text-center",
                    request.experienceLevel === option.value
                      ? "border-brand-accent bg-brand-accent/5"
                      : "border-border hover:border-brand-accent/50"
                  )}
                >
                  <RadioGroupItem value={option.value} id={`exp-${option.value}`} className="sr-only" />
                  <span className="font-medium">{option.label}</span>
                  <span className="text-tiny text-content-tertiary">{option.desc}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Deals Completed (Last 12 months)</Label>
            <Input
              type="number"
              placeholder="0"
              value={request.dealsCompleted || ""}
              onChange={(e) => updateRequest("dealsCompleted", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Anything else lenders should know about you or this deal..."
              value={request.additionalNotes}
              onChange={(e) => updateRequest("additionalNotes", e.target.value)}
              rows={4}
            />
          </div>

          <div className="border-t border-border-subtle pt-6">
            <h4 className="text-body font-medium text-content mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Your name"
                  value={request.fullName}
                  onChange={(e) => updateRequest("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={request.email}
                  onChange={(e) => updateRequest("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={request.phone}
                  onChange={(e) => updateRequest("phone", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-h2 font-semibold text-content">Review Your Request</h2>
            <p className="text-small text-content-secondary">Make sure everything looks correct</p>
          </div>

          {/* Summary Card */}
          <Card variant="bordered" padding="md" className="bg-surface-secondary/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-tiny uppercase tracking-wide text-content-secondary mb-3">Property</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Address</span>
                    <span className="text-content font-medium">{request.propertyAddress || "—"}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Type</span>
                    <span className="text-content font-medium">{request.propertyType || "—"}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Purchase Price</span>
                    <span className="text-content font-medium">${request.purchasePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">ARV</span>
                    <span className="text-content font-medium">${request.arv.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-tiny uppercase tracking-wide text-content-secondary mb-3">Funding</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Loan Type</span>
                    <span className="text-content font-medium">{request.loanType || "—"}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Amount</span>
                    <span className="text-content font-medium">${request.loanAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">LTV</span>
                    <span className="text-content font-medium">{request.ltv}%</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Timeline</span>
                    <span className="text-content font-medium">{request.timelineNeeded || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Matched Lenders Preview */}
          <div className="border border-border-subtle rounded-medium p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-body font-medium text-content">Matched Lenders</h4>
              <Badge variant="success">12 matches</Badge>
            </div>
            <p className="text-small text-content-secondary mb-3">
              Based on your request, we've found 12 lenders who match your criteria.
            </p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-content-tertiary" />
              <span className="text-small text-content-secondary">
                Estimated response time: <span className="font-medium text-content">2-4 hours</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
        <Button
          variant="ghost"
          icon={<ChevronLeft />}
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            variant="primary"
            icon={<ChevronRight />}
            iconPosition="right"
            onClick={handleNext}
          >
            Continue
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit}>
            Submit Request
          </Button>
        )}
      </div>
    </Card>
  );
}
