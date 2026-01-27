import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Target,
  DollarSign,
  Mail,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Upload,
  Plus,
  X,
  Eye,
  Loader2,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCreateCampaign,
  useAddCampaignProperties,
  defaultEmailTemplate,
  type CampaignPropertyInsert,
} from "@/hooks/useCampaigns";
import { toast } from "sonner";

const steps = [
  { id: 1, name: "Basics", icon: FileText },
  { id: 2, name: "Properties", icon: Target },
  { id: 3, name: "Offer", icon: DollarSign },
  { id: 4, name: "Message", icon: Mail },
];

const closingOptions = ["14 days", "21 days", "30 days", "Flexible"];

interface PropertyEntry {
  address: string;
  city: string;
  state: string;
  zip: string;
  list_price: string;
  days_on_market: string;
  agent_name: string;
  agent_email: string;
}

const emptyProperty: PropertyEntry = {
  address: "",
  city: "",
  state: "",
  zip: "",
  list_price: "",
  days_on_market: "",
  agent_name: "",
  agent_email: "",
};

export default function CampaignWizard() {
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();
  const addProperties = useAddCampaignProperties();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Step 1: Basics
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Properties
  const [properties, setProperties] = useState<PropertyEntry[]>([{ ...emptyProperty }]);

  // Step 3: Offer
  const [offerType, setOfferType] = useState<"percentage" | "fixed" | "custom">("percentage");
  const [offerPercentage, setOfferPercentage] = useState(65);
  const [offerFixedDiscount, setOfferFixedDiscount] = useState("");
  const [includeEarnest, setIncludeEarnest] = useState(true);
  const [earnestAmount, setEarnestAmount] = useState("5000");
  const [closingTimeline, setClosingTimeline] = useState("21 days");

  // Step 4: Message
  const [emailSubject, setEmailSubject] = useState(defaultEmailTemplate.subject);
  const [emailBody, setEmailBody] = useState(defaultEmailTemplate.body);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return properties.some((p) => p.address.trim().length > 0);
      case 3:
        return true;
      case 4:
        return emailSubject.trim().length > 0 && emailBody.trim().length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const addProperty = () => {
    setProperties([...properties, { ...emptyProperty }]);
  };

  const removeProperty = (index: number) => {
    if (properties.length > 1) {
      setProperties(properties.filter((_, i) => i !== index));
    }
  };

  const updateProperty = (index: number, field: keyof PropertyEntry, value: string) => {
    const updated = [...properties];
    updated[index] = { ...updated[index], [field]: value };
    setProperties(updated);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      
      if (lines.length < 2) {
        toast.error("CSV must have at least a header row and one data row");
        return;
      }

      const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
      const parsed: PropertyEntry[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const entry: PropertyEntry = { ...emptyProperty };

        headers.forEach((header, idx) => {
          const value = values[idx] || "";
          if (header.includes("address")) entry.address = value;
          else if (header.includes("city")) entry.city = value;
          else if (header.includes("state")) entry.state = value;
          else if (header.includes("zip")) entry.zip = value;
          else if (header.includes("price") || header.includes("list")) entry.list_price = value.replace(/[$,]/g, "");
          else if (header.includes("dom") || header.includes("days")) entry.days_on_market = value;
          else if (header.includes("agent") && header.includes("name")) entry.agent_name = value;
          else if (header.includes("agent") && header.includes("email")) entry.agent_email = value;
          else if (header.includes("email")) entry.agent_email = value;
          else if (header.includes("name") && !entry.agent_name) entry.agent_name = value;
        });

        if (entry.address) {
          parsed.push(entry);
        }
      }

      if (parsed.length > 0) {
        setProperties(parsed);
        toast.success(`Imported ${parsed.length} properties`);
      } else {
        toast.error("No valid properties found in CSV");
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      // Create campaign
      const campaign = await createCampaign.mutateAsync({
        name,
        description: description || undefined,
        offer_formula_type: offerType,
        offer_percentage: offerType === "percentage" ? offerPercentage : undefined,
        offer_fixed_discount: offerType === "fixed" ? Number(offerFixedDiscount) : undefined,
        include_earnest_money: includeEarnest,
        earnest_money: includeEarnest ? Number(earnestAmount) : undefined,
        closing_timeline: closingTimeline,
        email_subject: emailSubject,
        email_body: emailBody,
      });

      // Add properties
      const validProperties = properties
        .filter((p) => p.address.trim())
        .map((p) => ({
          address: p.address,
          city: p.city || undefined,
          state: p.state || undefined,
          zip: p.zip || undefined,
          list_price: p.list_price ? Number(p.list_price) : undefined,
          days_on_market: p.days_on_market ? Number(p.days_on_market) : undefined,
          agent_name: p.agent_name || undefined,
          agent_email: p.agent_email || undefined,
        }));

      if (validProperties.length > 0) {
        await addProperties.mutateAsync({
          campaignId: campaign.id,
          properties: validProperties,
          offerPercentage: offerType === "percentage" ? offerPercentage : undefined,
        });
      }

      navigate(`/campaigns/${campaign.id}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPreviewEmail = () => {
    const sampleData = {
      agent_name: properties[0]?.agent_name || "John Agent",
      property_address: properties[0]?.address || "123 Sample St, Austin TX",
      list_price: properties[0]?.list_price ? `$${Number(properties[0].list_price).toLocaleString()}` : "$250,000",
      days_on_market: properties[0]?.days_on_market || "90",
      offer_amount: properties[0]?.list_price
        ? `$${Math.round(Number(properties[0].list_price) * (offerPercentage / 100)).toLocaleString()}`
        : "$162,500",
      closing_timeline: closingTimeline,
      your_name: "Your Name",
      your_company: "Your Company",
      your_phone: "(555) 123-4567",
      your_email: "you@example.com",
    };

    let preview = emailBody;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{${key}\\}`, "g"), value);
    });

    return preview;
  };

  const validPropertyCount = properties.filter((p) => p.address.trim()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-secondary to-background">
      {/* Header */}
      <header className="bg-white border-b border-border-subtle">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/campaigns")}
            className="flex items-center gap-2 text-content-secondary hover:text-content mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </button>
          <h1 className="text-h1 font-bold text-content">Create New Campaign</h1>
          <p className="text-body text-content-secondary mt-1">
            Set up a bulk offer campaign for agent-listed properties
          </p>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                        isCompleted
                          ? "bg-success text-white"
                          : isActive
                          ? "bg-brand text-white"
                          : "bg-surface-secondary text-content-tertiary"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-tiny font-medium mt-2",
                        isActive ? "text-brand" : "text-content-tertiary"
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2",
                        step.id < currentStep ? "bg-success" : "bg-border-subtle"
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card variant="elevated" padding="lg">
          <CardContent className="p-0">
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-semibold text-content">Campaign Basics</h2>
                    <p className="text-small text-content-secondary">Name and describe your campaign</p>
                  </div>
                </div>

                <Input
                  label="Campaign Name"
                  required
                  value={name}
                  onChange={setName}
                  placeholder="e.g., Austin 90+ DOM Q1 2025"
                />

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this campaign's focus..."
                    rows={3}
                  />
                </div>

                <div className="p-4 bg-surface-secondary rounded-medium">
                  <p className="text-small font-medium text-content">Campaign Type</p>
                  <p className="text-small text-content-secondary mt-1">Agent Outreach</p>
                  <p className="text-tiny text-content-tertiary mt-2">
                    More campaign types coming soon (expired listings, FSBOs, etc.)
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Properties */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-semibold text-content">Target Properties</h2>
                    <p className="text-small text-content-secondary">Add properties to target in this campaign</p>
                  </div>
                </div>

                {/* CSV Upload */}
                <div className="p-4 border-2 border-dashed border-border rounded-medium text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-content-tertiary" />
                    <span className="text-body font-medium text-content">Upload CSV</span>
                    <span className="text-small text-content-secondary">
                      Columns: Address, City, State, Zip, List Price, DOM, Agent Name, Agent Email
                    </span>
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border-subtle" />
                  </div>
                  <div className="relative flex justify-center text-tiny uppercase">
                    <span className="bg-white px-2 text-content-tertiary">Or add manually</span>
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="space-y-4">
                  {properties.map((prop, index) => (
                    <div
                      key={index}
                      className="p-4 bg-surface-secondary rounded-medium space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-small font-medium text-content">Property {index + 1}</span>
                        {properties.length > 1 && (
                          <button
                            onClick={() => removeProperty(index)}
                            className="p-1 text-content-tertiary hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          label="Address"
                          value={prop.address}
                          onChange={(v) => updateProperty(index, "address", v)}
                          placeholder="123 Main St"
                        />
                        <Input
                          label="City"
                          value={prop.city}
                          onChange={(v) => updateProperty(index, "city", v)}
                          placeholder="Austin"
                        />
                        <Input
                          label="State"
                          value={prop.state}
                          onChange={(v) => updateProperty(index, "state", v)}
                          placeholder="TX"
                        />
                        <Input
                          label="Zip"
                          value={prop.zip}
                          onChange={(v) => updateProperty(index, "zip", v)}
                          placeholder="78701"
                        />
                        <Input
                          label="List Price"
                          type="number"
                          value={prop.list_price}
                          onChange={(v) => updateProperty(index, "list_price", v)}
                          placeholder="250000"
                        />
                        <Input
                          label="Days on Market"
                          type="number"
                          value={prop.days_on_market}
                          onChange={(v) => updateProperty(index, "days_on_market", v)}
                          placeholder="90"
                        />
                        <Input
                          label="Agent Name"
                          value={prop.agent_name}
                          onChange={(v) => updateProperty(index, "agent_name", v)}
                          placeholder="John Agent"
                        />
                        <Input
                          label="Agent Email"
                          type="email"
                          value={prop.agent_email}
                          onChange={(v) => updateProperty(index, "agent_email", v)}
                          placeholder="agent@realty.com"
                        />
                      </div>
                    </div>
                  ))}

                  <Button variant="secondary" icon={<Plus />} onClick={addProperty}>
                    Add Another Property
                  </Button>
                </div>

                <div className="p-3 bg-brand/5 border border-brand/20 rounded-medium">
                  <p className="text-small font-medium text-brand">
                    {validPropertyCount} {validPropertyCount === 1 ? "property" : "properties"} ready
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Offer */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-semibold text-content">Offer Settings</h2>
                    <p className="text-small text-content-secondary">Configure your offer formula</p>
                  </div>
                </div>

                {/* Offer Formula Type */}
                <div className="space-y-3">
                  <Label>Offer Formula</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: "percentage", label: "% of List Price", desc: "Offer based on percentage" },
                      { value: "fixed", label: "Fixed Discount", desc: "$ amount below list" },
                      { value: "custom", label: "Custom per Property", desc: "Set manually" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setOfferType(opt.value as typeof offerType)}
                        className={cn(
                          "p-4 rounded-medium border text-left transition-all",
                          offerType === opt.value
                            ? "border-brand bg-brand/5"
                            : "border-border hover:border-brand/50"
                        )}
                      >
                        <p className="text-body font-medium text-content">{opt.label}</p>
                        <p className="text-small text-content-secondary">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {offerType === "percentage" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Offer Percentage</Label>
                      <span className="text-h3 font-semibold text-brand">{offerPercentage}%</span>
                    </div>
                    <Slider
                      value={[offerPercentage]}
                      onValueChange={(v) => setOfferPercentage(v[0])}
                      min={50}
                      max={85}
                      step={1}
                    />
                    <div className="flex justify-between text-tiny text-content-tertiary">
                      <span>50%</span>
                      <span>65% (Default)</span>
                      <span>85%</span>
                    </div>
                  </div>
                )}

                {offerType === "fixed" && (
                  <Input
                    label="Fixed Discount Amount"
                    type="number"
                    value={offerFixedDiscount}
                    onChange={setOfferFixedDiscount}
                    placeholder="50000"
                    hint="Amount to subtract from list price"
                  />
                )}

                {offerType === "custom" && (
                  <div className="p-4 bg-surface-secondary rounded-medium">
                    <p className="text-small text-content-secondary">
                      You'll set offer amounts manually for each property after creating the campaign.
                    </p>
                  </div>
                )}

                <div className="border-t border-border-subtle pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={includeEarnest}
                      onCheckedChange={(c) => setIncludeEarnest(!!c)}
                    />
                    <Label className="cursor-pointer">Include earnest money in offer</Label>
                  </div>

                  {includeEarnest && (
                    <Input
                      label="Earnest Money Amount"
                      type="number"
                      value={earnestAmount}
                      onChange={setEarnestAmount}
                      placeholder="5000"
                    />
                  )}

                  <div className="space-y-2">
                    <Label>Closing Timeline</Label>
                    <Select value={closingTimeline} onValueChange={setClosingTimeline}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {closingOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Message */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-semibold text-content">Email Template</h2>
                    <p className="text-small text-content-secondary">Customize your outreach message</p>
                  </div>
                </div>

                <Input
                  label="Subject Line"
                  value={emailSubject}
                  onChange={setEmailSubject}
                  placeholder="Cash Offer for {property_address}"
                />

                <div className="space-y-2">
                  <Label>Email Body</Label>
                  <Textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={12}
                    className="font-mono text-small"
                  />
                </div>

                <div className="p-4 bg-surface-secondary rounded-medium">
                  <p className="text-small font-medium text-content mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "{agent_name}",
                      "{property_address}",
                      "{list_price}",
                      "{offer_amount}",
                      "{days_on_market}",
                      "{closing_timeline}",
                      "{your_name}",
                      "{your_company}",
                      "{your_phone}",
                      "{your_email}",
                    ].map((v) => (
                      <code
                        key={v}
                        className="px-2 py-1 bg-white rounded text-tiny text-brand font-mono"
                      >
                        {v}
                      </code>
                    ))}
                  </div>
                </div>

                <Button variant="secondary" icon={<Eye />} onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? "Hide Preview" : "Preview Email"}
                </Button>

                {showPreview && (
                  <div className="p-4 bg-white border border-border rounded-medium">
                    <p className="text-small font-semibold text-content mb-2">
                      Subject: {emailSubject.replace("{property_address}", properties[0]?.address || "123 Sample St")}
                    </p>
                    <pre className="text-small text-content whitespace-pre-wrap font-sans">
                      {renderPreviewEmail()}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={currentStep === 1}
                icon={<ArrowLeft />}
              >
                Back
              </Button>

              {currentStep < 4 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  icon={<ArrowRight />}
                  iconPosition="right"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateStep(4)}
                  loading={isSubmitting}
                >
                  Create Campaign
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
