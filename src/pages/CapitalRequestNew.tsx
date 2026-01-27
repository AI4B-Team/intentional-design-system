import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Building2,
  DollarSign,
  Clock,
  User,
  Home,
  FileText,
  Send,
  Hammer,
  RefreshCw,
  Wallet,
  TrendingUp,
  AlertCircle,
  PartyPopper,
  Users,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateFundingRequest, useMarketplaceLenders, useSubmitToLenders } from "@/hooks/useCapital";

const steps = [
  { id: 1, label: "Request Type", icon: FileText },
  { id: 2, label: "Property", icon: Home },
  { id: 3, label: "Loan Details", icon: DollarSign },
  { id: 4, label: "Profile", icon: User },
  { id: 5, label: "Review", icon: CheckCircle2 },
];

const requestTypes = [
  {
    value: "purchase",
    label: "Purchase Loan",
    description: "Buying a property - hard money or private financing for acquisitions",
    icon: Building2,
    gradient: "from-brand to-brand-accent",
  },
  {
    value: "refinance",
    label: "Refinance",
    description: "Already own the property - pull cash out or get better terms",
    icon: TrendingUp,
    gradient: "from-info to-info/70",
  },
  {
    value: "bridge",
    label: "Bridge Loan",
    description: "Short-term capital need between transactions",
    icon: RefreshCw,
    gradient: "from-warning to-warning/70",
  },
  {
    value: "emd",
    label: "EMD Funding",
    description: "Earnest money deposit - get funds in 24-48 hours",
    icon: Wallet,
    gradient: "from-success to-success/70",
  },
  {
    value: "transactional",
    label: "Transactional Funding",
    description: "Same-day double close funding for wholesale assignments",
    icon: Hammer,
    gradient: "from-brand-accent to-brand",
  },
];

const timelineOptions = [
  { value: "asap", label: "ASAP (1-3 days)" },
  { value: "1_week", label: "Within 1-2 weeks" },
  { value: "2_weeks", label: "Within 2-4 weeks" },
  { value: "30_days", label: "30+ days" },
];

const creditScoreOptions = [
  { value: "750_plus", label: "750+" },
  { value: "700_749", label: "700-749" },
  { value: "650_699", label: "650-699" },
  { value: "600_649", label: "600-649" },
  { value: "below_600", label: "Below 600" },
];

const experienceOptions = [
  { value: "first_deal", label: "First deal" },
  { value: "1_to_5", label: "1-5 deals" },
  { value: "6_to_20", label: "6-20 deals" },
  { value: "20_plus", label: "20+ deals" },
];

const exitStrategyOptions = [
  { value: "flip_sell", label: "Flip & Sell" },
  { value: "brrrr_refinance", label: "BRRRR & Refinance" },
  { value: "buy_hold", label: "Buy & Hold" },
];

const refinancePurposeOptions = [
  { value: "lower_rate", label: "Lower rate" },
  { value: "cash_out", label: "Cash out" },
  { value: "remove_partner", label: "Remove partner" },
  { value: "other", label: "Other" },
];

const propertyTypeOptions = [
  { value: "SFH", label: "Single Family" },
  { value: "Multi", label: "Multi-Family" },
  { value: "Commercial", label: "Commercial" },
  { value: "Land", label: "Land" },
];

const stateOptions = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const entityTypeOptions = [
  { value: "individual", label: "Individual" },
  { value: "llc", label: "LLC" },
  { value: "corporation", label: "Corporation" },
];

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Hook to get user's properties
function useUserProperties() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-properties-for-funding"],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("id, address, city, state, zip, property_type, arv, estimated_value")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

interface FormData {
  request_type: string;
  // Property
  property_id: string | null;
  property_source: "existing" | "new";
  address: string;
  city: string;
  state: string;
  zip: string;
  property_type: string;
  property_value: string;
  arv: string;
  // Loan details
  loan_amount_requested: string;
  purchase_price: string;
  rehab_budget: string;
  exit_strategy: string;
  timeline_needed: string;
  purpose: string;
  // Refinance specific
  current_loan_balance: string;
  cash_out_amount: string;
  // EMD specific
  emd_amount: string;
  contract_close_date: string;
  is_time_sensitive: boolean;
  // Transactional specific
  ab_purchase_price: string;
  bc_sale_price: string;
  closing_date: string;
  // Profile
  credit_score_range: string;
  experience_level: string;
  entity_type: string;
  has_bankruptcy: boolean;
  notes: string;
  // Consent
  consent_to_contact: boolean;
}

export default function CapitalRequestNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createRequest = useCreateFundingRequest();
  const submitToLenders = useSubmitToLenders();
  const { data: userProperties, isLoading: propertiesLoading } = useUserProperties();
  const { data: allLenders } = useMarketplaceLenders();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ requestId: string; lenderCount: number } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    request_type: searchParams.get("type") || "",
    property_id: null,
    property_source: "new",
    address: "",
    city: "",
    state: "",
    zip: "",
    property_type: "",
    property_value: "",
    arv: "",
    loan_amount_requested: "",
    purchase_price: "",
    rehab_budget: "",
    exit_strategy: "",
    timeline_needed: "",
    purpose: "",
    current_loan_balance: "",
    cash_out_amount: "",
    emd_amount: "",
    contract_close_date: "",
    is_time_sensitive: false,
    ab_purchase_price: "",
    bc_sale_price: "",
    closing_date: "",
    credit_score_range: "",
    experience_level: "",
    entity_type: "",
    has_bankruptcy: false,
    notes: "",
    consent_to_contact: false,
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Select existing property
  const selectExistingProperty = (propertyId: string) => {
    const property = userProperties?.find((p) => p.id === propertyId);
    if (property) {
      setFormData((prev) => ({
        ...prev,
        property_id: property.id,
        property_source: "existing",
        address: property.address,
        city: property.city || "",
        state: property.state || "",
        zip: property.zip || "",
        property_type: property.property_type || "",
        property_value: property.estimated_value?.toString() || "",
        arv: property.arv?.toString() || "",
      }));
    }
  };

  // Lender matching logic
  const matchedLenders = useMemo(() => {
    if (!allLenders) return [];

    const loanAmount = parseFloat(formData.loan_amount_requested) || parseFloat(formData.emd_amount) || 0;
    const propertyType = formData.property_type;
    const state = formData.state;
    const requestType = formData.request_type;

    // Map request types to lender types
    const lenderTypeMap: Record<string, string[]> = {
      purchase: ["hard_money", "private"],
      refinance: ["dscr", "private"],
      bridge: ["hard_money", "private"],
      emd: ["emd", "transactional"],
      transactional: ["transactional", "emd"],
    };

    const matchingLenderTypes = lenderTypeMap[requestType] || [];

    return allLenders.filter((lender) => {
      // Check lender type
      if (matchingLenderTypes.length > 0 && !matchingLenderTypes.includes(lender.lender_type)) {
        return false;
      }

      // Check loan amount
      if (loanAmount > 0) {
        if (lender.min_loan_amount && loanAmount < lender.min_loan_amount) return false;
        if (lender.max_loan_amount && loanAmount > lender.max_loan_amount) return false;
      }

      // Check property type
      if (propertyType && lender.property_types.length > 0) {
        if (!lender.property_types.includes(propertyType)) return false;
      }

      // Check state
      if (state && lender.states_served.length > 0) {
        if (!lender.states_served.includes("nationwide") && !lender.states_served.includes(state)) {
          return false;
        }
      }

      return true;
    });
  }, [allLenders, formData.loan_amount_requested, formData.emd_amount, formData.property_type, formData.state, formData.request_type]);

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
    setIsSubmitting(true);
    try {
      // Calculate loan amount based on request type
      let loanAmount = parseFloat(formData.loan_amount_requested) || null;
      if (formData.request_type === "emd") {
        loanAmount = parseFloat(formData.emd_amount) || null;
      } else if (formData.request_type === "transactional") {
        loanAmount = parseFloat(formData.ab_purchase_price) || null;
      }

      // Create funding request
      const result = await createRequest.mutateAsync({
        request_type: formData.request_type,
        property_id: formData.property_id,
        loan_amount_requested: loanAmount,
        purpose: formData.purpose || null,
        property_value: parseFloat(formData.property_value) || null,
        arv: parseFloat(formData.arv) || null,
        purchase_price: parseFloat(formData.purchase_price) || null,
        rehab_budget: parseFloat(formData.rehab_budget) || null,
        exit_strategy: formData.exit_strategy || null,
        timeline_needed: formData.timeline_needed || null,
        credit_score_range: formData.credit_score_range || null,
        experience_level: formData.experience_level || null,
        notes: formData.notes || null,
      });

      // Submit to matched lenders
      if (result?.id && matchedLenders.length > 0) {
        await submitToLenders.mutateAsync({
          requestId: result.id,
          lenderIds: matchedLenders.map((l) => l.id),
        });
      }

      setSubmittedData({
        requestId: result?.id || "",
        lenderCount: matchedLenders.length,
      });
      setSubmissionComplete(true);
    } catch (error) {
      console.error("Error submitting funding request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.request_type;
      case 2:
        return formData.property_source === "existing" ? !!formData.property_id : !!formData.address;
      case 3:
        if (formData.request_type === "emd") {
          return !!formData.emd_amount && !!formData.contract_close_date;
        }
        if (formData.request_type === "transactional") {
          return !!formData.ab_purchase_price && !!formData.bc_sale_price;
        }
        return !!formData.loan_amount_requested;
      case 4:
        return !!formData.timeline_needed && !!formData.credit_score_range;
      case 5:
        return formData.consent_to_contact;
      default:
        return true;
    }
  };

  // Success screen
  if (submissionComplete && submittedData) {
    return (
      <PageLayout>
        <Card variant="default" padding="lg" className="max-w-xl mx-auto text-center">
          <div className="mb-6">
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-h1 font-bold text-content mb-2">Request Submitted!</h1>
            <p className="text-body text-content-secondary">
              Your funding request has been sent to our lender network.
            </p>
          </div>

          <div className="p-6 bg-surface-secondary rounded-medium mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="h-6 w-6 text-brand-accent" />
              <span className="text-h2 font-bold text-content">{submittedData.lenderCount} Lenders</span>
            </div>
            <p className="text-body text-content-secondary">
              Matched lenders will review your request and respond within 24-48 hours.
            </p>
          </div>

          <div className="space-y-3 text-left p-4 bg-info/5 rounded-medium mb-6">
            <h3 className="text-body font-semibold text-content">What happens next?</h3>
            <ul className="space-y-2 text-small text-content-secondary">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                Lenders will review your request details
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                You'll receive term sheets from interested lenders
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                Compare offers and select the best one for your deal
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => navigate("/capital")}>
              Back to Capital
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => navigate(`/capital/request/${submittedData.requestId}`)}
            >
              View Request Status
            </Button>
          </div>
        </Card>
      </PageLayout>
    );
  }

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
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-lg overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              disabled={step.id > currentStep}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full transition-colors min-w-fit",
                currentStep === step.id
                  ? "bg-brand text-white"
                  : currentStep > step.id
                  ? "bg-success/10 text-success cursor-pointer hover:bg-success/20"
                  : "bg-surface-secondary text-content-tertiary cursor-not-allowed"
              )}
            >
              {currentStep > step.id ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
              <span className="text-small font-medium hidden sm:inline">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-4 sm:w-8 transition-colors flex-shrink-0",
                  currentStep > step.id ? "bg-success" : "bg-border-subtle"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <Card variant="default" padding="lg" className="max-w-2xl mx-auto">
        {/* Step 1: Request Type */}
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
                    "flex items-center gap-4 p-4 rounded-medium border-2 text-left transition-all group",
                    formData.request_type === type.value
                      ? "border-brand bg-brand/5"
                      : "border-border-subtle hover:border-brand/50 hover:bg-surface-secondary"
                  )}
                  onClick={() => updateField("request_type", type.value)}
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all bg-gradient-to-br",
                      type.gradient,
                      formData.request_type === type.value ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                    )}
                  >
                    <type.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-medium text-content">{type.label}</p>
                    <p className="text-small text-content-secondary">{type.description}</p>
                  </div>
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      formData.request_type === type.value ? "border-brand" : "border-border-subtle"
                    )}
                  >
                    {formData.request_type === type.value && (
                      <div className="h-2.5 w-2.5 rounded-full bg-brand" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Property Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-h2 font-semibold text-content mb-2">Property Information</h2>
              <p className="text-body text-content-secondary">
                Select an existing property or enter new property details.
              </p>
            </div>

            {/* Property Source Toggle */}
            <div className="flex gap-2 p-1 bg-surface-secondary rounded-medium">
              <button
                type="button"
                className={cn(
                  "flex-1 py-2 px-4 rounded-small text-small font-medium transition-colors",
                  formData.property_source === "existing"
                    ? "bg-background text-content shadow-sm"
                    : "text-content-secondary hover:text-content"
                )}
                onClick={() => updateField("property_source", "existing")}
              >
                Select Existing
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 py-2 px-4 rounded-small text-small font-medium transition-colors",
                  formData.property_source === "new"
                    ? "bg-background text-content shadow-sm"
                    : "text-content-secondary hover:text-content"
                )}
                onClick={() => {
                  updateField("property_source", "new");
                  updateField("property_id", null);
                }}
              >
                Enter New
              </button>
            </div>

            {/* Existing Properties */}
            {formData.property_source === "existing" && (
              <div className="space-y-3">
                {propertiesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : userProperties && userProperties.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userProperties.map((property) => (
                      <button
                        key={property.id}
                        type="button"
                        onClick={() => selectExistingProperty(property.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-medium border text-left transition-colors",
                          formData.property_id === property.id
                            ? "border-brand bg-brand/5"
                            : "border-border-subtle hover:border-brand/50"
                        )}
                      >
                        <div className="h-10 w-10 rounded-small bg-surface-secondary flex items-center justify-center">
                          <Home className="h-5 w-5 text-content-tertiary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body font-medium text-content truncate">{property.address}</p>
                          <p className="text-small text-content-secondary">
                            {property.city}, {property.state} {property.zip}
                            {property.arv && ` • ARV: ${formatCurrency(property.arv)}`}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            formData.property_id === property.id ? "border-brand" : "border-border-subtle"
                          )}
                        >
                          {formData.property_id === property.id && (
                            <div className="h-2.5 w-2.5 rounded-full bg-brand" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-content-secondary">
                    <Home className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-body">No properties found</p>
                    <p className="text-small">Enter new property details instead</p>
                  </div>
                )}
              </div>
            )}

            {/* New Property Form */}
            {formData.property_source === "new" && (
              <div className="space-y-4">
                <div>
                  <Label>Property Address *</Label>
                  <Input
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={(v) => updateField("address", v)}
                  />
                </div>
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-3">
                    <Label>City</Label>
                    <Input
                      placeholder="City"
                      value={formData.city}
                      onChange={(v) => updateField("city", v)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>State</Label>
                    <Select value={formData.state} onValueChange={(v) => updateField("state", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {stateOptions.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Label>Zip</Label>
                    <Input
                      placeholder="12345"
                      value={formData.zip}
                      onChange={(v) => updateField("zip", v)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Property Type</Label>
                    <Select value={formData.property_type} onValueChange={(v) => updateField("property_type", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Current Value / Purchase Price</Label>
                    <Input
                      type="number"
                      placeholder="350000"
                      value={formData.property_value}
                      onChange={(v) => updateField("property_value", v)}
                    />
                  </div>
                </div>
                <div>
                  <Label>After Repair Value (ARV)</Label>
                  <Input
                    type="number"
                    placeholder="450000"
                    value={formData.arv}
                    onChange={(v) => updateField("arv", v)}
                  />
                  <p className="text-tiny text-content-tertiary mt-1">Leave blank if no rehab planned</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Loan Details - Dynamic based on request type */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-h2 font-semibold text-content mb-2">Loan Details</h2>
              <p className="text-body text-content-secondary">
                {formData.request_type === "purchase" && "Tell us about your purchase financing needs."}
                {formData.request_type === "refinance" && "Tell us about your refinance needs."}
                {formData.request_type === "bridge" && "Tell us about your bridge loan needs."}
                {formData.request_type === "emd" && "Tell us about your earnest money deposit needs."}
                {formData.request_type === "transactional" && "Tell us about your double close transaction."}
              </p>
            </div>

            {/* PURCHASE LOAN */}
            {(formData.request_type === "purchase" || formData.request_type === "bridge") && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Purchase Price *</Label>
                    <Input
                      type="number"
                      placeholder="300000"
                      value={formData.purchase_price}
                      onChange={(v) => updateField("purchase_price", v)}
                    />
                  </div>
                  <div>
                    <Label>Rehab Budget</Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={formData.rehab_budget}
                      onChange={(v) => updateField("rehab_budget", v)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Total Loan Amount Requested *</Label>
                  <Input
                    type="number"
                    placeholder="250000"
                    value={formData.loan_amount_requested}
                    onChange={(v) => updateField("loan_amount_requested", v)}
                  />
                </div>
                <div>
                  <Label>Exit Strategy</Label>
                  <Select value={formData.exit_strategy} onValueChange={(v) => updateField("exit_strategy", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How will you exit this deal?" />
                    </SelectTrigger>
                    <SelectContent>
                      {exitStrategyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* REFINANCE */}
            {formData.request_type === "refinance" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Property Value</Label>
                    <Input
                      type="number"
                      placeholder="400000"
                      value={formData.property_value}
                      onChange={(v) => updateField("property_value", v)}
                    />
                  </div>
                  <div>
                    <Label>Current Loan Balance</Label>
                    <Input
                      type="number"
                      placeholder="250000"
                      value={formData.current_loan_balance}
                      onChange={(v) => updateField("current_loan_balance", v)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cash Out Amount Needed</Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={formData.cash_out_amount}
                      onChange={(v) => updateField("cash_out_amount", v)}
                    />
                  </div>
                  <div>
                    <Label>Total Loan Amount *</Label>
                    <Input
                      type="number"
                      placeholder="300000"
                      value={formData.loan_amount_requested}
                      onChange={(v) => updateField("loan_amount_requested", v)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Purpose of Refinance</Label>
                  <Select value={formData.purpose} onValueChange={(v) => updateField("purpose", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {refinancePurposeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* EMD FUNDING */}
            {formData.request_type === "emd" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>EMD Amount Needed *</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={formData.emd_amount}
                      onChange={(v) => updateField("emd_amount", v)}
                    />
                  </div>
                  <div>
                    <Label>Contract Close Date *</Label>
                    <Input
                      type="date"
                      value={formData.contract_close_date}
                      onChange={(v) => updateField("contract_close_date", v)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Purchase Price</Label>
                  <Input
                    type="number"
                    placeholder="200000"
                    value={formData.purchase_price}
                    onChange={(v) => updateField("purchase_price", v)}
                  />
                </div>
                <div className="flex items-center gap-3 p-3 bg-warning/5 border border-warning/20 rounded-medium">
                  <Checkbox
                    checked={formData.is_time_sensitive}
                    onCheckedChange={(checked) => updateField("is_time_sensitive", checked as boolean)}
                  />
                  <div>
                    <Label className="cursor-pointer">This is a time-sensitive need</Label>
                    <p className="text-tiny text-content-tertiary">Check if you need EMD within 24-48 hours</p>
                  </div>
                </div>
              </div>
            )}

            {/* TRANSACTIONAL FUNDING */}
            {formData.request_type === "transactional" && (
              <div className="space-y-4">
                <div className="p-4 bg-info/5 border border-info/20 rounded-medium mb-4">
                  <p className="text-small text-content-secondary">
                    <strong>Double Close:</strong> You buy from A, then immediately sell to C.
                    We fund your A-B purchase, you repay us at B-C closing.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>A-B Purchase Price (Your Buy) *</Label>
                    <Input
                      type="number"
                      placeholder="150000"
                      value={formData.ab_purchase_price}
                      onChange={(v) => updateField("ab_purchase_price", v)}
                    />
                  </div>
                  <div>
                    <Label>B-C Sale Price (Your Sell) *</Label>
                    <Input
                      type="number"
                      placeholder="175000"
                      value={formData.bc_sale_price}
                      onChange={(v) => updateField("bc_sale_price", v)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Closing Date</Label>
                  <Input
                    type="date"
                    value={formData.closing_date}
                    onChange={(v) => updateField("closing_date", v)}
                  />
                </div>
                {formData.ab_purchase_price && formData.bc_sale_price && (
                  <div className="p-3 bg-success/10 rounded-medium">
                    <p className="text-small text-success font-medium">
                      Potential spread: {formatCurrency(parseFloat(formData.bc_sale_price) - parseFloat(formData.ab_purchase_price))}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Profile */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-h2 font-semibold text-content mb-2">Your Profile</h2>
              <p className="text-body text-content-secondary">Help us match you with the right lenders.</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Credit Score Range *</Label>
                  <Select
                    value={formData.credit_score_range}
                    onValueChange={(v) => updateField("credit_score_range", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditScoreOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Real Estate Experience *</Label>
                  <Select
                    value={formData.experience_level}
                    onValueChange={(v) => updateField("experience_level", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Entity Type</Label>
                  <Select value={formData.entity_type} onValueChange={(v) => updateField("entity_type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Timeline Needed *</Label>
                  <Select value={formData.timeline_needed} onValueChange={(v) => updateField("timeline_needed", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="When needed?" />
                    </SelectTrigger>
                    <SelectContent>
                      {timelineOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface-secondary rounded-medium">
                <Checkbox
                  checked={formData.has_bankruptcy}
                  onCheckedChange={(checked) => updateField("has_bankruptcy", checked as boolean)}
                />
                <Label className="cursor-pointer">
                  Any bankruptcies or foreclosures in the last 7 years?
                </Label>
              </div>
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any additional details that might help lenders evaluate your request..."
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-h2 font-semibold text-content mb-2">Review Your Request</h2>
              <p className="text-body text-content-secondary">Confirm the details before submitting.</p>
            </div>

            {/* Request Summary */}
            <div className="space-y-4">
              <div className="p-4 bg-surface-secondary rounded-medium">
                <h3 className="text-small font-medium text-content-tertiary uppercase tracking-wide mb-3">
                  Loan Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-tiny text-content-tertiary">Type</p>
                    <p className="text-body font-medium text-content capitalize">
                      {requestTypes.find(t => t.value === formData.request_type)?.label || formData.request_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-tiny text-content-tertiary">Amount</p>
                    <p className="text-body font-medium text-content">
                      {formData.request_type === "emd"
                        ? formatCurrency(parseFloat(formData.emd_amount) || 0)
                        : formData.request_type === "transactional"
                        ? formatCurrency(parseFloat(formData.ab_purchase_price) || 0)
                        : formatCurrency(parseFloat(formData.loan_amount_requested) || 0)}
                    </p>
                  </div>
                  {formData.property_value && (
                    <div>
                      <p className="text-tiny text-content-tertiary">Property Value</p>
                      <p className="text-body text-content">{formatCurrency(parseFloat(formData.property_value))}</p>
                    </div>
                  )}
                  {formData.arv && (
                    <div>
                      <p className="text-tiny text-content-tertiary">ARV</p>
                      <p className="text-body text-content">{formatCurrency(parseFloat(formData.arv))}</p>
                    </div>
                  )}
                  {formData.exit_strategy && (
                    <div>
                      <p className="text-tiny text-content-tertiary">Exit Strategy</p>
                      <p className="text-body text-content capitalize">{formData.exit_strategy.replace(/_/g, " ")}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-tiny text-content-tertiary">Timeline</p>
                    <p className="text-body text-content capitalize">{formData.timeline_needed.replace(/_/g, " ")}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface-secondary rounded-medium">
                <h3 className="text-small font-medium text-content-tertiary uppercase tracking-wide mb-3">
                  Property
                </h3>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-content-tertiary" />
                  <div>
                    <p className="text-body font-medium text-content">{formData.address || "No address provided"}</p>
                    {(formData.city || formData.state) && (
                      <p className="text-small text-content-secondary">
                        {formData.city}{formData.city && formData.state && ", "}{formData.state} {formData.zip}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface-secondary rounded-medium">
                <h3 className="text-small font-medium text-content-tertiary uppercase tracking-wide mb-3">
                  Your Profile
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-tiny text-content-tertiary">Credit Score</p>
                    <p className="text-body text-content">{formData.credit_score_range?.replace(/_/g, " ") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-tiny text-content-tertiary">Experience</p>
                    <p className="text-body text-content capitalize">{formData.experience_level?.replace(/_/g, " ") || "—"}</p>
                  </div>
                  {formData.entity_type && (
                    <div>
                      <p className="text-tiny text-content-tertiary">Entity</p>
                      <p className="text-body text-content capitalize">{formData.entity_type}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Matched Lenders Preview */}
            <div className="p-4 bg-brand-accent/5 border border-brand-accent/20 rounded-medium">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-brand-accent" />
                <h3 className="text-body font-semibold text-content">
                  {matchedLenders.length} Lenders Match Your Criteria
                </h3>
              </div>
              {matchedLenders.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {matchedLenders.slice(0, 5).map((lender) => (
                    <Badge key={lender.id} variant="secondary" size="sm">
                      {lender.name}
                    </Badge>
                  ))}
                  {matchedLenders.length > 5 && (
                    <Badge variant="secondary" size="sm">
                      +{matchedLenders.length - 5} more
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-small text-content-secondary">
                  No exact matches found, but we'll still process your request.
                </p>
              )}
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3 p-4 bg-surface-secondary rounded-medium">
              <Checkbox
                checked={formData.consent_to_contact}
                onCheckedChange={(checked) => updateField("consent_to_contact", checked as boolean)}
                className="mt-0.5"
              />
              <div>
                <Label className="cursor-pointer text-body">
                  I understand lenders will contact me about this request
                </Label>
                <p className="text-small text-content-tertiary mt-1">
                  By submitting, you agree to be contacted by matched lenders regarding your funding request.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            icon={<ArrowLeft />}
          >
            Back
          </Button>

          {currentStep < steps.length ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              icon={<ArrowRight />}
              iconPosition="right"
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              icon={isSubmitting ? <Clock className="animate-spin" /> : <Send />}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          )}
        </div>
      </Card>
    </PageLayout>
  );
}
