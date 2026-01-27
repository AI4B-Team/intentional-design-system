import * as React from "react";
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  Check,
  Eye,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Home,
  Phone,
  Building,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAddOffer } from "@/hooks/usePropertyMutations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface OfferWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  property: {
    address?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhone?: string;
    ownerAddress?: string;
    maoStandard?: number;
    maoAggressive?: number;
    maoConservative?: number;
  };
}

interface DeliveryOption {
  enabled: boolean;
  recipient: string;
  subject?: string;
  message?: string;
  mailType?: "standard" | "certified" | "priority";
}

interface FollowupItem {
  id: string;
  daysAfter: number;
  channel: "email" | "sms";
  subject: string;
  content: string;
}

const DEFAULT_TEMPLATE = `Dear {owner_name},

I'm writing regarding your property at {property_address}.

After reviewing the property, I'd like to make a cash offer of {offer_amount}.

Here's what I can offer:
• All cash - no financing contingencies
• Close in as little as 14 days (or on your timeline)
• Buy as-is - no repairs or cleaning needed
• I cover all closing costs

I understand this may be below what you were hoping for, but I'd love the opportunity to discuss how we might make this work for both of us.

Please call or text me at {your_phone}, or reply to this email. I'm available to talk anytime.

Best regards,
{your_name}
{your_company}
{your_email}`;

const DEFAULT_SMS_TEMPLATE = `Hi {owner_name}, I'm interested in buying your property at {property_address}. I can offer {offer_amount} cash and close quickly. Would you like to discuss? - {your_name}`;

const DEFAULT_FOLLOWUPS: FollowupItem[] = [
  {
    id: "1",
    daysAfter: 3,
    channel: "email",
    subject: "Following up on my offer for {property_address}",
    content: "Hi {owner_name},\n\nI wanted to follow up on the offer I sent a few days ago for {property_address}. I'm still very interested and flexible on terms. Would you be open to a quick call?\n\nBest,\n{your_name}",
  },
  {
    id: "2",
    daysAfter: 7,
    channel: "sms",
    subject: "",
    content: "Hi {owner_name}, just checking in about my offer for {property_address}. Still interested if you'd like to chat! - {your_name}",
  },
  {
    id: "3",
    daysAfter: 14,
    channel: "email",
    subject: "Last follow-up: {property_address}",
    content: "Hi {owner_name},\n\nI've reached out a couple times about {property_address} and haven't heard back, so I'll assume the timing isn't right.\n\nIf anything changes or you'd like to discuss in the future, please keep my contact info. I'm always happy to make a fair offer.\n\nWishing you the best,\n{your_name}\n{your_phone}",
  },
];

const VARIABLE_BUTTONS = [
  { key: "{owner_name}", label: "Owner Name", icon: User },
  { key: "{property_address}", label: "Property", icon: Home },
  { key: "{offer_amount}", label: "Offer Amount", icon: DollarSign },
  { key: "{your_name}", label: "Your Name", icon: User },
  { key: "{your_company}", label: "Company", icon: Building },
  { key: "{your_phone}", label: "Your Phone", icon: Phone },
  { key: "{your_email}", label: "Your Email", icon: Mail },
  { key: "{close_timeline}", label: "Timeline", icon: Calendar },
];

function formatCurrency(value: number | undefined): string {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export function OfferWizardModal({ open, onOpenChange, propertyId, property }: OfferWizardModalProps) {
  const { user } = useAuth();
  const addOffer = useAddOffer();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Step 1: Offer Details
  const [offerAmount, setOfferAmount] = useState("");
  const [offerType, setOfferType] = useState("opening");
  const [notes, setNotes] = useState("");

  // Step 2: Delivery Options
  const [emailDelivery, setEmailDelivery] = useState<DeliveryOption>({
    enabled: !!property.ownerEmail,
    recipient: property.ownerEmail || "",
    subject: `Cash Offer for ${property.address || "Your Property"}`,
  });
  const [smsDelivery, setSmsDelivery] = useState<DeliveryOption>({
    enabled: !!property.ownerPhone,
    recipient: property.ownerPhone || "",
    message: DEFAULT_SMS_TEMPLATE,
  });
  const [mailDelivery, setMailDelivery] = useState<DeliveryOption>({
    enabled: false,
    recipient: property.ownerAddress || "",
    mailType: "standard",
  });
  const [draftOnly, setDraftOnly] = useState(false);

  // Step 3: Offer Letter Content
  const [letterContent, setLetterContent] = useState(DEFAULT_TEMPLATE);
  const [activeTextarea, setActiveTextarea] = useState<"letter" | "sms" | null>(null);

  // Step 4: Follow-ups
  const [enableFollowups, setEnableFollowups] = useState(true);
  const [followups, setFollowups] = useState<FollowupItem[]>(DEFAULT_FOLLOWUPS);
  const [stopOnResponse, setStopOnResponse] = useState(true);

  // Step 5: Schedule
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));

  const steps = [
    { number: 1, title: "Offer Details" },
    { number: 2, title: "Delivery Options" },
    { number: 3, title: "Offer Letter" },
    { number: 4, title: "Follow-ups" },
    { number: 5, title: "Review & Send" },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!offerAmount && parseFloat(offerAmount) > 0;
      case 2:
        return draftOnly || emailDelivery.enabled || smsDelivery.enabled || mailDelivery.enabled;
      case 3:
        return letterContent.trim().length > 0;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const insertVariable = (variable: string) => {
    if (activeTextarea === "letter") {
      setLetterContent(prev => prev + variable);
    } else if (activeTextarea === "sms") {
      setSmsDelivery(prev => ({
        ...prev,
        message: (prev.message || "") + variable,
      }));
    }
  };

  const addFollowup = () => {
    const lastFollowup = followups[followups.length - 1];
    const newDays = lastFollowup ? lastFollowup.daysAfter + 7 : 3;
    setFollowups([
      ...followups,
      {
        id: Date.now().toString(),
        daysAfter: newDays,
        channel: "email",
        subject: "Following up on {property_address}",
        content: "Hi {owner_name}, just wanted to check in about my offer. Let me know if you'd like to discuss. - {your_name}",
      },
    ]);
  };

  const removeFollowup = (id: string) => {
    setFollowups(followups.filter((f) => f.id !== id));
  };

  const updateFollowup = (id: string, updates: Partial<FollowupItem>) => {
    setFollowups(followups.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const renderPreview = (content: string) => {
    const amount = parseFloat(offerAmount) || 0;
    return content
      .replace(/{owner_name}/g, property.ownerName || "[Owner Name]")
      .replace(/{property_address}/g, property.address || "[Property Address]")
      .replace(/{offer_amount}/g, formatCurrency(amount))
      .replace(/{your_name}/g, "[Your Name]")
      .replace(/{your_company}/g, "[Your Company]")
      .replace(/{your_phone}/g, "[Your Phone]")
      .replace(/{your_email}/g, user?.email || "[Your Email]")
      .replace(/{close_timeline}/g, "14 days");
  };

  const getDeliverySummary = () => {
    const deliveries: string[] = [];
    if (emailDelivery.enabled) deliveries.push("1 Email");
    if (smsDelivery.enabled) deliveries.push("1 SMS");
    if (mailDelivery.enabled) deliveries.push(`1 ${mailDelivery.mailType} Mail`);
    return deliveries;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Create the offer
      const { data: offerData, error: offerError } = await supabase
        .from("offers")
        .insert({
          property_id: propertyId,
          offer_amount: parseFloat(offerAmount),
          offer_type: offerType,
          notes: notes || null,
          sent_via: draftOnly ? null : getDeliverySummary().join(", "),
          sent_date: draftOnly ? null : (scheduleType === "now" ? new Date().toISOString() : scheduledDate),
          response: "pending",
        })
        .select()
        .single();

      if (offerError) throw offerError;

      // Create delivery records if not draft only
      if (!draftOnly && offerData) {
        const deliveries: any[] = [];

        if (emailDelivery.enabled) {
          deliveries.push({
            offer_id: offerData.id,
            property_id: propertyId,
            user_id: user.id,
            channel: "email",
            recipient_email: emailDelivery.recipient,
            status: scheduleType === "now" ? "queued" : "scheduled",
            content: {
              subject: emailDelivery.subject,
              body: letterContent,
            },
          });
        }

        if (smsDelivery.enabled) {
          deliveries.push({
            offer_id: offerData.id,
            property_id: propertyId,
            user_id: user.id,
            channel: "sms",
            recipient_phone: smsDelivery.recipient,
            status: scheduleType === "now" ? "queued" : "scheduled",
            content: {
              body: smsDelivery.message,
            },
          });
        }

        if (mailDelivery.enabled) {
          deliveries.push({
            offer_id: offerData.id,
            property_id: propertyId,
            user_id: user.id,
            channel: "mail",
            recipient_address: mailDelivery.recipient,
            status: "queued",
            content: {
              body: letterContent,
              mailType: mailDelivery.mailType,
            },
          });
        }

        if (deliveries.length > 0) {
          const { error: deliveryError } = await supabase
            .from("offer_deliveries")
            .insert(deliveries);
          if (deliveryError) throw deliveryError;
        }

        // Create followup records
        if (enableFollowups && followups.length > 0) {
          const baseDate = scheduleType === "now" ? new Date() : new Date(scheduledDate);
          const followupRecords = followups.map((f, index) => ({
            offer_id: offerData.id,
            user_id: user.id,
            sequence_number: index + 1,
            scheduled_for: addDays(baseDate, f.daysAfter).toISOString(),
            channel: f.channel,
            status: "scheduled",
            content: {
              subject: f.subject,
              body: f.content,
            },
          }));

          const { error: followupError } = await supabase
            .from("offer_followups")
            .insert(followupRecords);
          if (followupError) throw followupError;
        }
      }

      toast.success(draftOnly ? "Offer saved as draft" : "Offer created and deliveries scheduled!");
      onOpenChange(false);
      
      // Reset form
      setCurrentStep(1);
      setOfferAmount("");
      setOfferType("opening");
      setNotes("");
    } catch (error: any) {
      console.error("Error creating offer:", error);
      toast.error(error.message || "Failed to create offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-brand" />
            Make Offer - {property.address}
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <button
                onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                className={cn(
                  "flex items-center gap-2 text-small transition-colors",
                  currentStep === step.number
                    ? "text-brand font-semibold"
                    : currentStep > step.number
                    ? "text-success cursor-pointer hover:text-success/80"
                    : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-tiny font-medium",
                    currentStep === step.number
                      ? "bg-brand text-white"
                      : currentStep > step.number
                      ? "bg-success text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span className="hidden md:inline">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    currentStep > step.number ? "bg-success" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* Step 1: Offer Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="offerAmount">Offer Amount *</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="offerAmount"
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="285000"
                    className="pl-9 text-lg font-semibold"
                  />
                </div>
                {/* Quick MAO buttons */}
                {(property.maoAggressive || property.maoStandard || property.maoConservative) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {property.maoAggressive && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOfferAmount(property.maoAggressive!.toString())}
                        className="text-xs"
                      >
                        Aggressive: {formatCurrency(property.maoAggressive)}
                      </Button>
                    )}
                    {property.maoStandard && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOfferAmount(property.maoStandard!.toString())}
                        className="text-xs"
                      >
                        Standard: {formatCurrency(property.maoStandard)}
                      </Button>
                    )}
                    {property.maoConservative && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOfferAmount(property.maoConservative!.toString())}
                        className="text-xs"
                      >
                        Conservative: {formatCurrency(property.maoConservative)}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label>Offer Type</Label>
                <Select value={offerType} onValueChange={setOfferType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="opening">Opening Offer</SelectItem>
                    <SelectItem value="counter">Counter Offer</SelectItem>
                    <SelectItem value="final">Final Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Internal)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any internal notes about this offer..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 2: Delivery Options */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-small text-content-secondary">
                How would you like to send this offer?
              </p>

              {/* Email */}
              <Card variant="default" padding="md" className={cn(emailDelivery.enabled && "ring-2 ring-brand")}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="emailEnabled"
                    checked={emailDelivery.enabled}
                    onCheckedChange={(checked) =>
                      setEmailDelivery({ ...emailDelivery, enabled: checked === true })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="emailEnabled" className="flex items-center gap-2 cursor-pointer">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    {emailDelivery.enabled && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label className="text-tiny">To:</Label>
                          <Input
                            value={emailDelivery.recipient}
                            onChange={(e) =>
                              setEmailDelivery({ ...emailDelivery, recipient: e.target.value })
                            }
                            placeholder="owner@email.com"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-tiny">Subject:</Label>
                          <Input
                            value={emailDelivery.subject}
                            onChange={(e) =>
                              setEmailDelivery({ ...emailDelivery, subject: e.target.value })
                            }
                            placeholder="Cash Offer for Your Property"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* SMS */}
              <Card variant="default" padding="md" className={cn(smsDelivery.enabled && "ring-2 ring-brand")}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="smsEnabled"
                    checked={smsDelivery.enabled}
                    onCheckedChange={(checked) =>
                      setSmsDelivery({ ...smsDelivery, enabled: checked === true })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="smsEnabled" className="flex items-center gap-2 cursor-pointer">
                      <MessageSquare className="h-4 w-4" />
                      SMS Text
                    </Label>
                    {smsDelivery.enabled && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label className="text-tiny">To:</Label>
                          <Input
                            value={smsDelivery.recipient}
                            onChange={(e) =>
                              setSmsDelivery({ ...smsDelivery, recipient: e.target.value })
                            }
                            placeholder="(555) 123-4567"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-tiny">Message:</Label>
                          <Textarea
                            value={smsDelivery.message}
                            onChange={(e) =>
                              setSmsDelivery({ ...smsDelivery, message: e.target.value })
                            }
                            onFocus={() => setActiveTextarea("sms")}
                            rows={3}
                            className="mt-1"
                          />
                          <p className="text-tiny text-muted-foreground mt-1">
                            {(smsDelivery.message || "").length}/160 characters
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Mail */}
              <Card variant="default" padding="md" className={cn(mailDelivery.enabled && "ring-2 ring-brand")}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="mailEnabled"
                    checked={mailDelivery.enabled}
                    onCheckedChange={(checked) =>
                      setMailDelivery({ ...mailDelivery, enabled: checked === true })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="mailEnabled" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      Physical Mail
                    </Label>
                    {mailDelivery.enabled && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label className="text-tiny">To:</Label>
                          <Textarea
                            value={mailDelivery.recipient}
                            onChange={(e) =>
                              setMailDelivery({ ...mailDelivery, recipient: e.target.value })
                            }
                            placeholder="123 Main St, City, ST 12345"
                            rows={2}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-tiny">Mail Type:</Label>
                          <Select
                            value={mailDelivery.mailType}
                            onValueChange={(v) =>
                              setMailDelivery({ ...mailDelivery, mailType: v as any })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="standard">Standard ($0.60)</SelectItem>
                              <SelectItem value="certified">Certified ($4.50)</SelectItem>
                              <SelectItem value="priority">Priority ($8.00)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Draft Only */}
              <Card variant="default" padding="md" className={cn(draftOnly && "ring-2 ring-muted-foreground")}>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="draftOnly"
                    checked={draftOnly}
                    onCheckedChange={(checked) => {
                      setDraftOnly(checked === true);
                      if (checked) {
                        setEmailDelivery({ ...emailDelivery, enabled: false });
                        setSmsDelivery({ ...smsDelivery, enabled: false });
                        setMailDelivery({ ...mailDelivery, enabled: false });
                      }
                    }}
                  />
                  <Label htmlFor="draftOnly" className="cursor-pointer text-muted-foreground">
                    Save as Draft Only (don't send)
                  </Label>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: Offer Letter Content */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Offer Letter Content</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  icon={<Eye />}
                >
                  {showPreview ? "Edit" : "Preview"}
                </Button>
              </div>

              {/* Variable Buttons */}
              <div className="flex flex-wrap gap-1">
                {VARIABLE_BUTTONS.map((v) => (
                  <Button
                    key={v.key}
                    variant="outline"
                    size="sm"
                    className="text-tiny h-7"
                    onClick={() => insertVariable(v.key)}
                    disabled={showPreview}
                  >
                    <v.icon className="h-3 w-3 mr-1" />
                    {v.label}
                  </Button>
                ))}
              </div>

              {showPreview ? (
                <Card variant="default" padding="md" className="bg-muted/30">
                  <pre className="whitespace-pre-wrap text-small font-sans">
                    {renderPreview(letterContent)}
                  </pre>
                </Card>
              ) : (
                <Textarea
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  onFocus={() => setActiveTextarea("letter")}
                  rows={12}
                  className="font-mono text-small"
                />
              )}
            </div>
          )}

          {/* Step 4: Follow-ups */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={enableFollowups}
                    onCheckedChange={setEnableFollowups}
                  />
                  <Label>Enable automatic follow-ups</Label>
                </div>
              </div>

              {enableFollowups && (
                <>
                  <div className="space-y-3">
                    {followups.map((followup, index) => (
                      <Card key={followup.id} variant="default" padding="md">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" size="sm">
                                Follow-up {index + 1}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={followup.daysAfter}
                                  onChange={(e) =>
                                    updateFollowup(followup.id, {
                                      daysAfter: parseInt(e.target.value) || 1,
                                    })
                                  }
                                  className="w-16 h-8 text-center"
                                  min={1}
                                />
                                <span className="text-small text-muted-foreground">days after, via</span>
                                <Select
                                  value={followup.channel}
                                  onValueChange={(v) =>
                                    updateFollowup(followup.id, { channel: v as any })
                                  }
                                >
                                  <SelectTrigger className="w-24 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="sms">SMS</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            {followup.channel === "email" && (
                              <Input
                                placeholder="Subject"
                                value={followup.subject}
                                onChange={(e) =>
                                  updateFollowup(followup.id, { subject: e.target.value })
                                }
                                className="text-small"
                              />
                            )}
                            <Textarea
                              placeholder="Message content..."
                              value={followup.content}
                              onChange={(e) =>
                                updateFollowup(followup.id, { content: e.target.value })
                              }
                              rows={2}
                              className="text-small"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFollowup(followup.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" onClick={addFollowup} icon={<Plus />}>
                    Add Follow-up
                  </Button>

                  <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                    <Checkbox
                      id="stopOnResponse"
                      checked={stopOnResponse}
                      onCheckedChange={(checked) => setStopOnResponse(checked === true)}
                    />
                    <Label htmlFor="stopOnResponse" className="text-small cursor-pointer">
                      Stop follow-ups if any response received
                    </Label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Review & Send */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <Card variant="default" padding="md" className="bg-muted/30">
                <h3 className="text-body font-semibold mb-3">Offer Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-small">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold ml-2">{formatCurrency(parseFloat(offerAmount) || 0)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium ml-2 capitalize">{offerType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Property:</span>
                    <span className="font-medium ml-2">{property.address}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium ml-2">{property.ownerName || "Unknown"}</span>
                  </div>
                </div>
              </Card>

              {!draftOnly && (
                <>
                  <Card variant="default" padding="md">
                    <h3 className="text-body font-semibold mb-3">Deliveries</h3>
                    <div className="space-y-2">
                      {emailDelivery.enabled && (
                        <div className="flex items-center gap-2 text-small">
                          <Mail className="h-4 w-4 text-brand" />
                          <span>Email to {emailDelivery.recipient}</span>
                        </div>
                      )}
                      {smsDelivery.enabled && (
                        <div className="flex items-center gap-2 text-small">
                          <MessageSquare className="h-4 w-4 text-brand" />
                          <span>SMS to {smsDelivery.recipient}</span>
                        </div>
                      )}
                      {mailDelivery.enabled && (
                        <div className="flex items-center gap-2 text-small">
                          <FileText className="h-4 w-4 text-brand" />
                          <span>{mailDelivery.mailType} mail to {mailDelivery.recipient?.split("\n")[0]}</span>
                        </div>
                      )}
                      {!emailDelivery.enabled && !smsDelivery.enabled && !mailDelivery.enabled && (
                        <p className="text-muted-foreground text-small">No deliveries selected</p>
                      )}
                    </div>
                  </Card>

                  {enableFollowups && followups.length > 0 && (
                    <Card variant="default" padding="md">
                      <h3 className="text-body font-semibold mb-3">
                        Follow-ups Scheduled: {followups.length}
                      </h3>
                      <div className="space-y-1">
                        {followups.map((f, i) => (
                          <div key={f.id} className="flex items-center gap-2 text-small text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              Day {f.daysAfter}: {f.channel === "email" ? "Email" : "SMS"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <div className="space-y-3">
                    <Label>When to send?</Label>
                    <div className="flex gap-3">
                      <Button
                        variant={scheduleType === "now" ? "primary" : "outline"}
                        onClick={() => setScheduleType("now")}
                        icon={<Send />}
                      >
                        Send Now
                      </Button>
                      <Button
                        variant={scheduleType === "later" ? "primary" : "outline"}
                        onClick={() => setScheduleType("later")}
                        icon={<Calendar />}
                      >
                        Schedule
                      </Button>
                    </div>
                    {scheduleType === "later" && (
                      <Input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                      />
                    )}
                  </div>
                </>
              )}

              {draftOnly && (
                <Card variant="default" padding="md" className="bg-warning/10 border-warning/20">
                  <p className="text-small text-warning">
                    This offer will be saved as a draft. No emails, texts, or mail will be sent.
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-4">
          <Button
            variant="ghost"
            onClick={() => (currentStep === 1 ? onOpenChange(false) : setCurrentStep(currentStep - 1))}
            icon={currentStep > 1 ? <ChevronLeft /> : undefined}
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          {currentStep < 5 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              icon={<ChevronRight className="ml-1" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              icon={<Send />}
            >
              {isSubmitting
                ? "Sending..."
                : draftOnly
                ? "Save Draft"
                : scheduleType === "now"
                ? "Send Now"
                : "Schedule"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
