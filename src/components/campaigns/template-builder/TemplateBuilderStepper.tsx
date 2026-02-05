import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  FileCheck,
  FileText,
  Mail,
  MessageSquare,
  Check,
  ChevronRight,
  ArrowLeft,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TemplateDocumentSelector,
  TemplateTermsForm,
  TemplateEmailForm,
  TemplateSmsForm,
  TemplateLivePreview,
} from "./index";

interface StepConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: StepConfig[] = [
  { id: "general", label: "General", description: "Campaign settings", icon: Settings },
  { id: "terms", label: "Terms", description: "Offer terms", icon: FileCheck },
  { id: "loi", label: "LOI", description: "Letter of intent", icon: FileText },
  { id: "email", label: "Email", description: "Email template", icon: Mail },
  { id: "sms", label: "SMS", description: "Text message", icon: MessageSquare },
];

interface FormData {
  name: string;
  description: string;
  offer_type: string;
  market_type: string;
  document_type: string;
  email_subject: string;
  email_body: string;
  email_signature: string;
  sms_body: string;
  loi_content: string;
  include_pof: boolean;
  is_default: boolean;
  terms: Record<string, unknown>;
}

interface TemplateBuilderStepperProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
  isEditing: boolean;
}

export function TemplateBuilderStepper({
  formData,
  setFormData,
  onSave,
  onBack,
  isSaving,
  isEditing,
}: TemplateBuilderStepperProps) {
  const [activeStep, setActiveStep] = useState("general");
  const [useSampleData, setUseSampleData] = useState(true);
  const [includeSms, setIncludeSms] = useState(true);

  const currentStepIndex = STEPS.findIndex((s) => s.id === activeStep);

  const isStepComplete = (stepId: string) => {
    switch (stepId) {
      case "general":
        return !!formData.name.trim();
      case "terms":
        return true; // Terms have defaults
      case "loi":
        return !!formData.offer_type;
      case "email":
        return !!formData.email_subject.trim();
      case "sms":
        return true; // Optional
      default:
        return false;
    }
  };

  const goToNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setActiveStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const goToPrev = () => {
    if (currentStepIndex > 0) {
      setActiveStep(STEPS[currentStepIndex - 1].id);
    }
  };

  const getTemplateName = () => {
    switch (formData.offer_type) {
      case "cash": return "Cash Offer";
      case "hybrid": return "Hybrid - Subj-To & Seller Financing";
      case "seller_financing": return "Seller Financing Offer";
      case "subject_to": return "Subject-To Offer";
      case "novation": return "Novation Offer";
      default: return "Cash Offer";
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? "Edit Campaign Template" : "Create Campaign Template"}
            </h1>
            <p className="text-muted-foreground">
              {formData.name || "Configure your offer template step by step"}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={!formData.name.trim() || isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Template"}
        </Button>
      </div>

      {/* Top Horizontal Stepper */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = activeStep === step.id;
            const isComplete = isStepComplete(step.id);
            const isPast = index < currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
                    isActive
                      ? "bg-accent/10 border border-accent"
                      : "hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all",
                      isActive
                        ? "bg-accent text-white"
                        : isComplete || isPast
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isComplete || isPast ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <p
                      className={cn(
                        "font-medium text-sm",
                        isActive ? "text-accent" : "text-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 rounded-full transition-colors",
                      index < currentStepIndex ? "bg-success" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Main Content with Preview */}
      <div className="flex gap-6">
        {/* Form Content */}
        <div className="flex-1">
          {/* General Step */}
          {activeStep === "general" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Campaign Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure basic settings for this offer template
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Campaign Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Professional Cash Offer"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe when to use this template..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Market Type</Label>
                    <Select
                      value={formData.market_type}
                      onValueChange={(v) => setFormData({ ...formData, market_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on_market">On-Market (MLS)</SelectItem>
                        <SelectItem value="off_market">Off-Market</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Offer Type</Label>
                    <Select
                      value={formData.offer_type}
                      onValueChange={(v) => setFormData({ ...formData, offer_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash Offer</SelectItem>
                        <SelectItem value="seller_financing">Seller Financing</SelectItem>
                        <SelectItem value="subject_to">Subject-To</SelectItem>
                        <SelectItem value="novation">Novation</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Subj-To + Seller Finance)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id="is-default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_default: !!checked })
                    }
                  />
                  <Label htmlFor="is-default" className="cursor-pointer">
                    Set as default template for this offer type
                  </Label>
                </div>
              </div>
            </Card>
          )}

          {/* Terms Step */}
          {activeStep === "terms" && (
            <TemplateTermsForm
              terms={formData.terms}
              offerType={formData.offer_type}
              onChange={(terms) => setFormData({ ...formData, terms })}
            />
          )}

          {/* LOI Step */}
          {activeStep === "loi" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Letter of Intent</h2>
                  <p className="text-sm text-muted-foreground">
                    Select the LOI template for your offer
                  </p>
                </div>
              </div>

              <TemplateDocumentSelector
                selectedTemplate={formData.offer_type}
                onSelectTemplate={(id) => setFormData({ ...formData, offer_type: id })}
              />
            </Card>
          )}

          {/* Email Step */}
          {activeStep === "email" && (
            <TemplateEmailForm
              subject={formData.email_subject}
              body={formData.email_body}
              onSubjectChange={(v) => setFormData({ ...formData, email_subject: v })}
              onBodyChange={(v) => setFormData({ ...formData, email_body: v })}
            />
          )}

          {/* SMS Step */}
          {activeStep === "sms" && (
            <TemplateSmsForm
              message={formData.sms_body}
              includeSms={includeSms}
              onMessageChange={(v) => setFormData({ ...formData, sms_body: v })}
              onIncludeSmsChange={setIncludeSms}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={goToPrev}
              disabled={currentStepIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStepIndex < STEPS.length - 1 ? (
              <Button variant="primary" onClick={goToNext} className="gap-2">
                Next Step
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={onSave}
                disabled={!formData.name.trim() || isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Template"}
              </Button>
            )}
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="w-[400px] shrink-0">
          <div className="sticky top-4">
            <TemplateLivePreview
              templateName={getTemplateName()}
              templateType={formData.offer_type}
              loiContent={formData.loi_content}
              useSampleData={useSampleData}
              onToggleSampleData={() => setUseSampleData(!useSampleData)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
