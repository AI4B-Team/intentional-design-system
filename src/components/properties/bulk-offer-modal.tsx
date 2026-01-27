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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Send,
  Mail,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  DollarSign,
  AlertTriangle,
  Building2,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Property {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  owner_mailing_address: string | null;
  mao_standard: number | null;
  mao_aggressive: number | null;
  mao_conservative: number | null;
  arv: number | null;
}

interface BulkOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
  onComplete: () => void;
}

const DEFAULT_TEMPLATE = `Dear {owner_name},

I'm interested in purchasing your property at {property_address}.

I'd like to make a cash offer of {offer_amount}.

• All cash - no financing contingencies
• Close quickly on your timeline
• Buy as-is - no repairs needed

Please call or reply to discuss.

Best regards,
{your_name}`;

function formatCurrency(value: number | undefined): string {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export function BulkOfferModal({ open, onOpenChange, properties, onComplete }: BulkOfferModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Confirm properties
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(
    new Set(properties.map(p => p.id))
  );

  // Step 2: Offer formula
  const [offerFormula, setOfferFormula] = useState<"mao_standard" | "mao_aggressive" | "mao_conservative" | "custom">("mao_standard");
  const [customPercentage, setCustomPercentage] = useState("70");

  // Step 3: Delivery channels
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [mailEnabled, setMailEnabled] = useState(false);

  // Step 4: Template
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

  // Step 5: Schedule
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));

  const selectedProperties = properties.filter(p => selectedPropertyIds.has(p.id));

  const steps = [
    { number: 1, title: "Select Properties" },
    { number: 2, title: "Offer Formula" },
    { number: 3, title: "Delivery Channels" },
    { number: 4, title: "Template" },
    { number: 5, title: "Review & Send" },
  ];

  const getOfferAmount = (property: Property): number => {
    switch (offerFormula) {
      case "mao_aggressive":
        return property.mao_aggressive || 0;
      case "mao_conservative":
        return property.mao_conservative || 0;
      case "mao_standard":
        return property.mao_standard || 0;
      case "custom":
        return (property.arv || 0) * (parseFloat(customPercentage) / 100);
      default:
        return 0;
    }
  };

  const deliverySummary = {
    email: emailEnabled ? selectedProperties.filter(p => p.owner_email).length : 0,
    sms: smsEnabled ? selectedProperties.filter(p => p.owner_phone).length : 0,
    mail: mailEnabled ? selectedProperties.filter(p => p.owner_mailing_address).length : 0,
  };

  const totalDeliveries = deliverySummary.email + deliverySummary.sms + deliverySummary.mail;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedPropertyIds.size > 0;
      case 2:
        return offerFormula !== "custom" || (parseFloat(customPercentage) > 0);
      case 3:
        return emailEnabled || smsEnabled || mailEnabled;
      case 4:
        return template.trim().length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const batchId = crypto.randomUUID();

      for (const property of selectedProperties) {
        const offerAmount = getOfferAmount(property);
        if (offerAmount <= 0) continue;

        // Create offer
        const { data: offer, error: offerError } = await supabase
          .from("offers")
          .insert({
            property_id: property.id,
            offer_amount: offerAmount,
            offer_type: "opening",
            sent_date: scheduleType === "now" ? new Date().toISOString() : scheduledDate,
            response: "pending",
            notes: `Bulk offer - Batch ID: ${batchId}`,
          })
          .select()
          .single();

        if (offerError) throw offerError;

        // Create deliveries
        const deliveries: any[] = [];

        if (emailEnabled && property.owner_email) {
          deliveries.push({
            offer_id: offer.id,
            property_id: property.id,
            user_id: user.id,
            channel: "email",
            recipient_email: property.owner_email,
            status: scheduleType === "now" ? "queued" : "scheduled",
            content: { body: template },
          });
        }

        if (smsEnabled && property.owner_phone) {
          deliveries.push({
            offer_id: offer.id,
            property_id: property.id,
            user_id: user.id,
            channel: "sms",
            recipient_phone: property.owner_phone,
            status: scheduleType === "now" ? "queued" : "scheduled",
            content: { body: template.substring(0, 160) },
          });
        }

        if (mailEnabled && property.owner_mailing_address) {
          deliveries.push({
            offer_id: offer.id,
            property_id: property.id,
            user_id: user.id,
            channel: "mail",
            recipient_address: property.owner_mailing_address,
            status: "queued",
            content: { body: template },
          });
        }

        if (deliveries.length > 0) {
          const { error: deliveryError } = await supabase
            .from("offer_deliveries")
            .insert(deliveries);
          if (deliveryError) throw deliveryError;
        }
      }

      toast.success(`Created ${selectedProperties.length} offers with ${totalDeliveries} deliveries!`);
      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating bulk offers:", error);
      toast.error(error.message || "Failed to create offers");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProperty = (id: string) => {
    setSelectedPropertyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-brand" />
            Bulk Send Offers
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
                    "h-6 w-6 rounded-full flex items-center justify-center text-tiny font-medium",
                    currentStep === step.number
                      ? "bg-brand text-white"
                      : currentStep > step.number
                      ? "bg-success text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.number ? <Check className="h-3.5 w-3.5" /> : step.number}
                </div>
                <span className="hidden md:inline text-tiny">{step.title}</span>
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
          {/* Step 1: Confirm Properties */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-small text-muted-foreground">
                Confirm the {properties.length} properties you want to send offers to:
              </p>
              <div className="border border-border rounded-small max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedPropertyIds.size === properties.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPropertyIds(new Set(properties.map(p => p.id)));
                            } else {
                              setSelectedPropertyIds(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>MAO</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPropertyIds.has(property.id)}
                            onCheckedChange={() => toggleProperty(property.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="text-small font-medium">{property.address}</div>
                          <div className="text-tiny text-muted-foreground">
                            {[property.city, property.state].filter(Boolean).join(", ")}
                          </div>
                        </TableCell>
                        <TableCell>{property.owner_name || "-"}</TableCell>
                        <TableCell>
                          {property.mao_standard ? formatCurrency(property.mao_standard) : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {property.owner_email && <Mail className="h-3.5 w-3.5 text-success" />}
                            {property.owner_phone && <MessageSquare className="h-3.5 w-3.5 text-success" />}
                            {property.owner_mailing_address && <FileText className="h-3.5 w-3.5 text-success" />}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-small text-muted-foreground">
                {selectedPropertyIds.size} of {properties.length} selected
              </div>
            </div>
          )}

          {/* Step 2: Offer Formula */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-small text-muted-foreground">
                How should offer amounts be calculated?
              </p>
              <div className="grid gap-3">
                {[
                  { value: "mao_standard", label: "Standard MAO", desc: "70% ARV minus repairs" },
                  { value: "mao_aggressive", label: "Aggressive MAO", desc: "75% ARV minus repairs" },
                  { value: "mao_conservative", label: "Conservative MAO", desc: "65% ARV minus repairs" },
                  { value: "custom", label: "Custom Percentage", desc: "Set your own % of ARV" },
                ].map((option) => (
                  <Card
                    key={option.value}
                    variant="default"
                    padding="md"
                    className={cn(
                      "cursor-pointer transition-all",
                      offerFormula === option.value && "ring-2 ring-brand"
                    )}
                    onClick={() => setOfferFormula(option.value as any)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                          offerFormula === option.value ? "border-brand bg-brand" : "border-border"
                        )}
                      >
                        {offerFormula === option.value && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-tiny text-muted-foreground">{option.desc}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {offerFormula === "custom" && (
                <div className="flex items-center gap-2 mt-4">
                  <Input
                    type="number"
                    value={customPercentage}
                    onChange={(e) => setCustomPercentage(e.target.value)}
                    className="w-24"
                    min="1"
                    max="100"
                  />
                  <span className="text-muted-foreground">% of ARV</span>
                </div>
              )}

              {/* Preview */}
              <Card variant="default" padding="md" className="bg-muted/30 mt-4">
                <h4 className="text-small font-medium mb-2">Preview (first 3 properties):</h4>
                {selectedProperties.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex justify-between text-small py-1">
                    <span className="truncate max-w-[200px]">{p.address}</span>
                    <span className="font-semibold">{formatCurrency(getOfferAmount(p))}</span>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* Step 3: Delivery Channels */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-small text-muted-foreground">
                Select how you want to deliver offers:
              </p>
              <div className="space-y-3">
                <Card variant="default" padding="md" className={cn(emailEnabled && "ring-2 ring-brand")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-tiny text-muted-foreground">
                          {selectedProperties.filter(p => p.owner_email).length} properties with email
                        </div>
                      </div>
                    </div>
                    <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                  </div>
                </Card>

                <Card variant="default" padding="md" className={cn(smsEnabled && "ring-2 ring-brand")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">SMS Text</div>
                        <div className="text-tiny text-muted-foreground">
                          {selectedProperties.filter(p => p.owner_phone).length} properties with phone
                        </div>
                      </div>
                    </div>
                    <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
                  </div>
                </Card>

                <Card variant="default" padding="md" className={cn(mailEnabled && "ring-2 ring-brand")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Physical Mail</div>
                        <div className="text-tiny text-muted-foreground">
                          {selectedProperties.filter(p => p.owner_mailing_address).length} properties with address
                        </div>
                      </div>
                    </div>
                    <Switch checked={mailEnabled} onCheckedChange={setMailEnabled} />
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Template */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Label>Offer Letter Template</Label>
              <p className="text-tiny text-muted-foreground">
                Variables: {"{owner_name}"}, {"{property_address}"}, {"{offer_amount}"}, {"{your_name}"}
              </p>
              <Textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={10}
                className="font-mono text-small"
              />
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <Card variant="default" padding="md" className="bg-muted/30">
                <h3 className="text-body font-semibold mb-3">Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-small">
                  <div>
                    <span className="text-muted-foreground">Properties:</span>
                    <span className="font-semibold ml-2">{selectedProperties.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Formula:</span>
                    <span className="font-medium ml-2 capitalize">{offerFormula.replace("_", " ")}</span>
                  </div>
                </div>
              </Card>

              <Card variant="default" padding="md">
                <h3 className="text-body font-semibold mb-3">Deliveries</h3>
                <div className="space-y-2">
                  {deliverySummary.email > 0 && (
                    <div className="flex items-center gap-2 text-small">
                      <Mail className="h-4 w-4 text-brand" />
                      <span>{deliverySummary.email} emails</span>
                    </div>
                  )}
                  {deliverySummary.sms > 0 && (
                    <div className="flex items-center gap-2 text-small">
                      <MessageSquare className="h-4 w-4 text-brand" />
                      <span>{deliverySummary.sms} SMS texts</span>
                    </div>
                  )}
                  {deliverySummary.mail > 0 && (
                    <div className="flex items-center gap-2 text-small">
                      <FileText className="h-4 w-4 text-brand" />
                      <span>{deliverySummary.mail} physical mail pieces</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border-subtle mt-2">
                    <span className="font-semibold">Total: {totalDeliveries} deliveries</span>
                  </div>
                </div>
              </Card>

              {/* Warning if some properties missing contact info */}
              {selectedProperties.some(p => !p.owner_email && !p.owner_phone && !p.owner_mailing_address) && (
                <Card variant="default" padding="md" className="bg-warning/10 border-warning/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                    <p className="text-small text-warning">
                      Some properties are missing contact information and will be skipped.
                    </p>
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
              disabled={isSubmitting || totalDeliveries === 0}
              icon={<Send />}
            >
              {isSubmitting ? "Sending..." : `Send ${totalDeliveries} Offers`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
