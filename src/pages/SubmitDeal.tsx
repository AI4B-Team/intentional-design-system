import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  User,
  FileText,
  ImageIcon,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Home,
  MapPin,
  DollarSign,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubmitDeal, type SubmitDealData } from "@/hooks/useDealSubmissions";
import { PageLayout } from "@/components/layout";

const steps = [
  { id: 1, name: "Your Info", icon: User },
  { id: 2, name: "Property", icon: Home },
  { id: 3, name: "Deal Details", icon: DollarSign },
  { id: 4, name: "Photos & Notes", icon: ImageIcon },
  { id: 5, name: "Review", icon: CheckCircle2 },
];

const referralOptions = ["Referral", "Social Media", "REIA", "BiggerPockets", "Other"];
const submitterTypes = ["Wholesaler", "Agent", "Property Owner", "Other"];
const propertyTypes = ["SFH", "Duplex", "Triplex", "Quadplex", "Multi 5+", "Land", "Commercial"];
const conditionOptions = ["Gut Rehab", "Major Work Needed", "Moderate Updates", "Light Cosmetic", "Turnkey"];
const occupancyOptions = ["Vacant", "Owner Occupied", "Tenant Occupied"];
const motivationOptions = ["Very Motivated - needs to sell fast", "Somewhat Motivated", "Testing the Market", "Unknown"];
const timelineOptions = ["ASAP", "30 days", "60 days", "90 days", "Flexible"];
const stateOptions = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

export default function SubmitDeal() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmationId, setConfirmationId] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    // Step 1
    submitterName: "",
    submitterCompany: "",
    submitterPhone: "",
    submitterEmail: "",
    referralSource: "",
    submitterType: "",
    // Step 2
    address: "",
    city: "",
    state: "",
    zip: "",
    propertyType: "",
    beds: "",
    baths: "",
    sqft: "",
    yearBuilt: "",
    lotSize: "",
    // Step 3
    askingPrice: "",
    arv: "",
    repairEstimate: "",
    isWholesale: false,
    assignmentFee: "",
    propertyCondition: "",
    occupancy: "",
    sellerMotivation: "",
    timeline: "",
    // Step 4
    dealNotes: "",
    additionalNotes: "",
  });

  const submitDeal = useSubmitDeal();

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).slice(0, 10 - photos.length);
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 10));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.submitterName && formData.submitterPhone && formData.submitterEmail);
      case 2:
        return !!(formData.address && formData.city && formData.state && formData.zip);
      case 3:
        return !!formData.askingPrice;
      case 4:
        return true;
      case 5:
        return confirmed;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    try {
      const submitData: SubmitDealData = {
        submitterName: formData.submitterName,
        submitterCompany: formData.submitterCompany || undefined,
        submitterPhone: formData.submitterPhone,
        submitterEmail: formData.submitterEmail,
        referralSource: formData.referralSource || undefined,
        submitterType: formData.submitterType || undefined,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        propertyType: formData.propertyType || undefined,
        beds: formData.beds ? Number(formData.beds) : undefined,
        baths: formData.baths ? Number(formData.baths) : undefined,
        sqft: formData.sqft ? Number(formData.sqft) : undefined,
        yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
        lotSize: formData.lotSize ? Number(formData.lotSize) : undefined,
        askingPrice: Number(formData.askingPrice),
        arv: formData.arv ? Number(formData.arv) : undefined,
        repairEstimate: formData.repairEstimate ? Number(formData.repairEstimate) : undefined,
        isWholesale: formData.isWholesale,
        assignmentFee: formData.assignmentFee ? Number(formData.assignmentFee) : undefined,
        propertyCondition: formData.propertyCondition || undefined,
        occupancy: formData.occupancy || undefined,
        sellerMotivation: formData.sellerMotivation || undefined,
        timeline: formData.timeline || undefined,
        dealNotes: formData.dealNotes || undefined,
        additionalNotes: formData.additionalNotes || undefined,
        photos: photos.length > 0 ? photos : undefined,
      };

      const result = await submitDeal.mutateAsync(submitData);
      setConfirmationId(result.property.id);
      setIsSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      submitterName: "",
      submitterCompany: "",
      submitterPhone: "",
      submitterEmail: "",
      referralSource: "",
      submitterType: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      propertyType: "",
      beds: "",
      baths: "",
      sqft: "",
      yearBuilt: "",
      lotSize: "",
      askingPrice: "",
      arv: "",
      repairEstimate: "",
      isWholesale: false,
      assignmentFee: "",
      propertyCondition: "",
      occupancy: "",
      sellerMotivation: "",
      timeline: "",
      dealNotes: "",
      additionalNotes: "",
    });
    setPhotos([]);
    setConfirmed(false);
    setCurrentStep(1);
    setIsSuccess(false);
    setConfirmationId("");
  };

  if (isSuccess) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto py-8">
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-h1 font-bold text-content mb-2">Thank You!</h1>
            <p className="text-body text-content-secondary mb-6">
              We received your deal and will review it within 24 hours.
            </p>
            
            <div className="bg-surface-secondary rounded-medium p-4 mb-6">
              <p className="text-small text-content-secondary mb-1">Confirmation Number</p>
              <p className="text-body font-mono font-medium text-content">{confirmationId.slice(0, 8).toUpperCase()}</p>
            </div>

            <div className="space-y-3">
              <Button variant="primary" fullWidth onClick={resetForm}>
                Submit Another Deal
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border-subtle">
              <p className="text-small text-content-secondary">
                Questions? Contact us at{" "}
                <a href="mailto:deals@dealflow.com" className="text-brand hover:underline">
                  deals@dealflow.com
                </a>
              </p>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-content">Submit a Deal</h1>
          <p className="text-body text-content-secondary mt-1">
            We review all submissions within 24 hours
          </p>
        </div>

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
                        "text-tiny font-medium mt-2 hidden sm:block",
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
            {/* Step 1: Your Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-semibold text-content">Your Information</h2>
                    <p className="text-small text-content-secondary">Tell us about yourself</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    required
                    value={formData.submitterName}
                    onChange={(v) => updateField("submitterName", v)}
                    placeholder="John Smith"
                  />
                  <Input
                    label="Company Name"
                    value={formData.submitterCompany}
                    onChange={(v) => updateField("submitterCompany", v)}
                    placeholder="ABC Investments"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    required
                    type="tel"
                    value={formData.submitterPhone}
                    onChange={(v) => updateField("submitterPhone", v)}
                    placeholder="(555) 123-4567"
                  />
                  <Input
                    label="Email"
                    required
                    type="email"
                    value={formData.submitterEmail}
                    onChange={(v) => updateField("submitterEmail", v)}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>How did you hear about us?</Label>
                    <Select
                      value={formData.referralSource}
                      onValueChange={(v) => updateField("referralSource", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {referralOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Are you a:</Label>
                    <Select
                      value={formData.submitterType}
                      onValueChange={(v) => updateField("submitterType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {submitterTypes.map((opt) => (
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

            {/* Step 2: Property Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                    <Home className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-semibold text-content">Property Information</h2>
                    <p className="text-small text-content-secondary">Details about the property</p>
                  </div>
                </div>

                <Input
                  label="Property Address"
                  required
                  value={formData.address}
                  onChange={(v) => updateField("address", v)}
                  placeholder="123 Main Street"
                  icon={<MapPin />}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <Input
                      label="City"
                      required
                      value={formData.city}
                      onChange={(v) => updateField("city", v)}
                      placeholder="Austin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(v) => updateField("state", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {stateOptions.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    label="Zip Code"
                    required
                    value={formData.zip}
                    onChange={(v) => updateField("zip", v)}
                    placeholder="78701"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(v) => updateField("propertyType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    label="Bedrooms"
                    type="number"
                    value={formData.beds}
                    onChange={(v) => updateField("beds", v)}
                    placeholder="3"
                  />
                  <Input
                    label="Bathrooms"
                    type="number"
                    step="0.5"
                    value={formData.baths}
                    onChange={(v) => updateField("baths", v)}
                    placeholder="2"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Input
                    label="Approx. Square Feet"
                    type="number"
                    value={formData.sqft}
                    onChange={(v) => updateField("sqft", v)}
                    placeholder="1500"
                  />
                  <Input
                    label="Year Built"
                    type="number"
                    value={formData.yearBuilt}
                    onChange={(v) => updateField("yearBuilt", v)}
                    placeholder="1985"
                  />
                  <Input
                    label="Lot Size (sqft)"
                    type="number"
                    value={formData.lotSize}
                    onChange={(v) => updateField("lotSize", v)}
                    placeholder="5000"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Deal Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-semibold text-content">Deal Details</h2>
                    <p className="text-small text-content-secondary">Financial and condition info</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Asking Price"
                    required
                    type="number"
                    value={formData.askingPrice}
                    onChange={(v) => updateField("askingPrice", v)}
                    placeholder="150000"
                    icon={<DollarSign />}
                  />
                  <Input
                    label="Your Estimated ARV"
                    type="number"
                    value={formData.arv}
                    onChange={(v) => updateField("arv", v)}
                    placeholder="220000"
                    hint="After Repair Value"
                  />
                  <Input
                    label="Estimated Repairs"
                    type="number"
                    value={formData.repairEstimate}
                    onChange={(v) => updateField("repairEstimate", v)}
                    placeholder="35000"
                  />
                </div>

                <div className="p-4 bg-surface-secondary rounded-medium space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.isWholesale}
                      onCheckedChange={(checked) => updateField("isWholesale", !!checked)}
                    />
                    <Label className="cursor-pointer">This is a wholesale assignment</Label>
                  </div>
                  {formData.isWholesale && (
                    <Input
                      label="Assignment Fee"
                      type="number"
                      value={formData.assignmentFee}
                      onChange={(v) => updateField("assignmentFee", v)}
                      placeholder="10000"
                      icon={<DollarSign />}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property Condition</Label>
                    <Select
                      value={formData.propertyCondition}
                      onValueChange={(v) => updateField("propertyCondition", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition..." />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Occupancy</Label>
                    <Select
                      value={formData.occupancy}
                      onValueChange={(v) => updateField("occupancy", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {occupancyOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Seller Motivation</Label>
                    <Select
                      value={formData.sellerMotivation}
                      onValueChange={(v) => updateField("sellerMotivation", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {motivationOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeline to Close</Label>
                    <Select
                      value={formData.timeline}
                      onValueChange={(v) => updateField("timeline", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {timelineOptions.map((opt) => (
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

            {/* Step 4: Photos & Notes */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-semibold text-content">Photos & Notes</h2>
                    <p className="text-small text-content-secondary">Add photos and additional information</p>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-3">
                  <Label>Property Photos (max 10)</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed border-border rounded-medium p-8 text-center",
                      photos.length >= 10 && "opacity-50"
                    )}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={photos.length >= 10}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className={cn(
                        "cursor-pointer flex flex-col items-center gap-2",
                        photos.length >= 10 && "cursor-not-allowed"
                      )}
                    >
                      <Upload className="h-8 w-8 text-content-tertiary" />
                      <span className="text-body text-content-secondary">
                        {photos.length >= 10
                          ? "Maximum photos reached"
                          : "Click to upload or drag and drop"}
                      </span>
                      <span className="text-small text-content-tertiary">
                        {photos.length}/10 photos
                      </span>
                    </label>
                  </div>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-medium"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 h-6 w-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>What makes this a good deal?</Label>
                  <Textarea
                    value={formData.dealNotes}
                    onChange={(e) => updateField("dealNotes", e.target.value)}
                    placeholder="Explain why this is a great opportunity..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Any other notes</Label>
                  <Textarea
                    value={formData.additionalNotes}
                    onChange={(e) => updateField("additionalNotes", e.target.value)}
                    placeholder="Additional information about the property or seller..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-semibold text-content">Review Your Submission</h2>
                    <p className="text-small text-content-secondary">Confirm all information is correct</p>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Your Info */}
                  <div className="p-4 bg-surface-secondary rounded-medium">
                    <h4 className="text-small font-semibold text-content-secondary mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" /> Your Information
                    </h4>
                    <div className="space-y-1 text-small">
                      <p><span className="text-content-secondary">Name:</span> {formData.submitterName}</p>
                      {formData.submitterCompany && (
                        <p><span className="text-content-secondary">Company:</span> {formData.submitterCompany}</p>
                      )}
                      <p><span className="text-content-secondary">Phone:</span> {formData.submitterPhone}</p>
                      <p><span className="text-content-secondary">Email:</span> {formData.submitterEmail}</p>
                      {formData.submitterType && (
                        <p><span className="text-content-secondary">Type:</span> {formData.submitterType}</p>
                      )}
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-4 bg-surface-secondary rounded-medium">
                    <h4 className="text-small font-semibold text-content-secondary mb-3 flex items-center gap-2">
                      <Home className="h-4 w-4" /> Property
                    </h4>
                    <div className="space-y-1 text-small">
                      <p className="font-medium">{formData.address}</p>
                      <p>{formData.city}, {formData.state} {formData.zip}</p>
                      {formData.propertyType && <p><span className="text-content-secondary">Type:</span> {formData.propertyType}</p>}
                      {(formData.beds || formData.baths) && (
                        <p>{formData.beds} bed / {formData.baths} bath</p>
                      )}
                      {formData.sqft && <p>{Number(formData.sqft).toLocaleString()} sqft</p>}
                    </div>
                  </div>

                  {/* Deal Details */}
                  <div className="p-4 bg-surface-secondary rounded-medium">
                    <h4 className="text-small font-semibold text-content-secondary mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Deal Details
                    </h4>
                    <div className="space-y-1 text-small">
                      <p><span className="text-content-secondary">Asking:</span> ${Number(formData.askingPrice).toLocaleString()}</p>
                      {formData.arv && <p><span className="text-content-secondary">ARV:</span> ${Number(formData.arv).toLocaleString()}</p>}
                      {formData.repairEstimate && <p><span className="text-content-secondary">Repairs:</span> ${Number(formData.repairEstimate).toLocaleString()}</p>}
                      {formData.isWholesale && <p><span className="text-content-secondary">Wholesale Fee:</span> ${Number(formData.assignmentFee || 0).toLocaleString()}</p>}
                      {formData.propertyCondition && <p><span className="text-content-secondary">Condition:</span> {formData.propertyCondition}</p>}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="p-4 bg-surface-secondary rounded-medium">
                    <h4 className="text-small font-semibold text-content-secondary mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Status
                    </h4>
                    <div className="space-y-1 text-small">
                      {formData.occupancy && <p><span className="text-content-secondary">Occupancy:</span> {formData.occupancy}</p>}
                      {formData.sellerMotivation && <p><span className="text-content-secondary">Motivation:</span> {formData.sellerMotivation}</p>}
                      {formData.timeline && <p><span className="text-content-secondary">Timeline:</span> {formData.timeline}</p>}
                      {photos.length > 0 && <p><span className="text-content-secondary">Photos:</span> {photos.length} uploaded</p>}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {(formData.dealNotes || formData.additionalNotes) && (
                  <div className="p-4 bg-surface-secondary rounded-medium">
                    <h4 className="text-small font-semibold text-content-secondary mb-2">Notes</h4>
                    {formData.dealNotes && (
                      <p className="text-small text-content mb-2">{formData.dealNotes}</p>
                    )}
                    {formData.additionalNotes && (
                      <p className="text-small text-content-secondary">{formData.additionalNotes}</p>
                    )}
                  </div>
                )}

                {/* Confirmation */}
                <div className="p-4 border border-border rounded-medium">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={confirmed}
                      onCheckedChange={(checked) => setConfirmed(!!checked)}
                    />
                    <label className="text-small text-content cursor-pointer" onClick={() => setConfirmed(!confirmed)}>
                      I confirm that all information provided is accurate to the best of my knowledge.
                    </label>
                  </div>
                </div>
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

              {currentStep < 5 ? (
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
                  disabled={!confirmed || isSubmitting}
                  loading={isSubmitting}
                >
                  Submit Deal
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
