import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Loader2 } from "lucide-react";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const PROPERTY_CONDITIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "needs_work", label: "Needs Some Work" },
  { value: "poor", label: "Needs Major Repairs" },
];

const SELL_TIMELINES = [
  { value: "asap", label: "ASAP - As soon as possible" },
  { value: "30_days", label: "Within 30 days" },
  { value: "60_days", label: "Within 60 days" },
  { value: "90_days", label: "Within 90 days" },
  { value: "not_sure", label: "Just exploring options" },
];

const SELLING_REASONS = [
  { value: "relocating", label: "Relocating" },
  { value: "downsizing", label: "Downsizing" },
  { value: "divorce", label: "Divorce" },
  { value: "inherited", label: "Inherited Property" },
  { value: "behind_on_payments", label: "Behind on Payments" },
  { value: "tired_landlord", label: "Tired Landlord" },
  { value: "need_cash", label: "Need Cash" },
  { value: "other", label: "Other" },
];

interface LeadCaptureFormProps {
  formHeadline: string;
  formSubheadline: string;
  formFields: string[];
  formSubmitText: string;
  formPrivacyText?: string;
  accentColor: string;
  primaryColor: string;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
  isSubmitted?: boolean;
}

export interface FormData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  propertyCondition: string;
  sellTimeline: string;
  reasonSelling: string;
  notes: string;
}

export function LeadCaptureForm({
  formHeadline,
  formSubheadline,
  formFields,
  formSubmitText,
  formPrivacyText,
  accentColor,
  primaryColor,
  onSubmit,
  isSubmitting = false,
  isSubmitted = false,
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    propertyAddress: "",
    propertyCity: "",
    propertyState: "",
    propertyZip: "",
    propertyCondition: "",
    sellTimeline: "",
    reasonSelling: "",
    notes: "",
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const fields = formFields || ["address", "name", "phone", "email"];

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
        <div 
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <svg 
            className="w-10 h-10" 
            fill="none" 
            stroke={accentColor} 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
          Thank You!
        </h3>
        <p className="text-gray-600 mb-4">
          We've received your information and will contact you within 24 hours with your cash offer.
        </p>
        <p className="text-sm text-gray-500">
          Check your email and phone for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
      <h2 
        className="text-xl md:text-2xl font-bold mb-1 text-center text-gray-900"
      >
        {formHeadline}
      </h2>
      <p className="text-gray-500 text-center mb-6 text-sm">
        {formSubheadline}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Property Address - Single Field */}
        {fields.includes("address") && (
          <div>
            <Label htmlFor="propertyAddress" className="text-sm font-medium">
              Property Address
            </Label>
            <Input
              id="propertyAddress"
              required
              placeholder="123 Main St, City, State"
              value={formData.propertyAddress}
              onChange={(e) => handleChange("propertyAddress", e.target.value)}
              className="mt-1"
            />
          </div>
        )}

        {/* Name & Phone - Side by Side */}
        {(fields.includes("name") || fields.includes("phone")) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.includes("name") && (
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Your Name
                </Label>
                <Input
                  id="fullName"
                  required
                  placeholder="Full Name"
                  value={formData.fullName || `${formData.firstName} ${formData.lastName}`.trim()}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange("fullName", val);
                    const parts = val.split(" ");
                    handleChange("firstName", parts[0] || "");
                    handleChange("lastName", parts.slice(1).join(" ") || "");
                  }}
                  className="mt-1"
                />
              </div>
            )}
            {fields.includes("phone") && (
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        )}

        {/* Email Field */}
        {fields.includes("email") && (
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="mt-1"
            />
          </div>
        )}

        {/* Property Condition */}
        {fields.includes("condition") && (
          <div>
            <Label htmlFor="propertyCondition" className="text-sm font-medium">
              Property Condition
            </Label>
            <Select
              value={formData.propertyCondition}
              onValueChange={(value) => handleChange("propertyCondition", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_CONDITIONS.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Timeline */}
        {fields.includes("timeline") && (
          <div>
            <Label htmlFor="sellTimeline" className="text-sm font-medium">
              How soon do you want to sell?
            </Label>
            <Select
              value={formData.sellTimeline}
              onValueChange={(value) => handleChange("sellTimeline", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                {SELL_TIMELINES.map((timeline) => (
                  <SelectItem key={timeline.value} value={timeline.value}>
                    {timeline.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reason for Selling */}
        {fields.includes("reason") && (
          <div>
            <Label htmlFor="reasonSelling" className="text-sm font-medium">
              Reason for Selling
            </Label>
            <Select
              value={formData.reasonSelling}
              onValueChange={(value) => handleChange("reasonSelling", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {SELLING_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notes */}
        {fields.includes("notes") && (
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              Anything else we should know?
            </Label>
            <Textarea
              id="notes"
              placeholder="Tell us more about your property or situation..."
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-lg py-6 font-bold"
          style={{ backgroundColor: accentColor }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            formSubmitText
          )}
        </Button>

        {/* Privacy Notice */}
        {(formPrivacyText === undefined || formPrivacyText) && (
          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
            {formPrivacyText || "🔒 Your info is safe. We never share or sell your data."}
          </p>
        )}
      </form>
    </div>
  );
}
