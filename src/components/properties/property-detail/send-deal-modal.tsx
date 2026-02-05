import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  DollarSign,
  Wrench,
  TrendingUp,
  Mail,
  MessageSquare,
  Send,
  ArrowRight,
  ArrowLeft,
  Zap,
  Star,
  Clock,
  Check,
  Pencil,
  Users,
} from "lucide-react";
import { useSendDeal, type PropertyForMatching, type BuyerMatch } from "@/hooks/useBuyerMatching";
import { cn } from "@/lib/utils";

interface SendDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: PropertyForMatching;
  buyers: BuyerMatch[];
}

type Step = "deal-sheet" | "delivery" | "confirm";

const urgencyOptions = [
  { value: "standard", label: "Standard", description: "New deal available", icon: Mail },
  { value: "urgent", label: "Urgent", description: "🔥 HOT DEAL - First come first served", icon: Zap },
  { value: "exclusive", label: "Exclusive", description: "You're one of 5 buyers seeing this", icon: Star },
];

function formatCurrency(value: number | null | undefined): string {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function SendDealModal({
  open,
  onOpenChange,
  property,
  buyers,
}: SendDealModalProps) {
  const sendDeal = useSendDeal();

  const [step, setStep] = React.useState<Step>("deal-sheet");
  const [askingPrice, setAskingPrice] = React.useState(
    property.mao_standard?.toString() || ""
  );
  const [assignmentFee, setAssignmentFee] = React.useState("10000");
  const [isEditingSheet, setIsEditingSheet] = React.useState(false);
  const [channels, setChannels] = React.useState({ email: true, sms: false });
  const [subject, setSubject] = React.useState(
    `Investment Opportunity: ${property.address}`
  );
  const [message, setMessage] = React.useState(
    `Hi [Buyer Name],\n\nI have a new investment opportunity that matches your buy box:\n\n${property.address}\n\nInterested? Reply YES or call me.\n\nBest regards`
  );
  const [urgency, setUrgency] = React.useState<"standard" | "urgent" | "exclusive">("standard");
  const [sendTiming, setSendTiming] = React.useState<"now" | "staggered">("now");

  const arv = property.arv ? Number(property.arv) : 0;
  const repairs = property.repair_estimate ? Number(property.repair_estimate) : 0;
  const price = parseFloat(askingPrice) || 0;
  const spread = arv - repairs - price;
  const fee = parseFloat(assignmentFee) || 0;

  const handleReset = () => {
    setStep("deal-sheet");
    setIsEditingSheet(false);
    setChannels({ email: true, sms: false });
    setSendTiming("now");
    setUrgency("standard");
  };

  const handleSend = async () => {
    const selectedChannels: ("email" | "sms")[] = [];
    if (channels.email) selectedChannels.push("email");
    if (channels.sms) selectedChannels.push("sms");

    await sendDeal.mutateAsync({
      propertyId: property.id,
      buyerIds: buyers.map((b) => b.buyer.id),
      channels: selectedChannels,
      subject,
      message,
      dealSheet: {
        askingPrice: price,
        arv,
        repairs,
        spread,
        assignmentFee: fee,
      },
      urgency,
    });

    handleReset();
    onOpenChange(false);
  };

  const emailCount = channels.email ? buyers.length : 0;
  const smsCount = channels.sms ? buyers.length : 0;
  const totalSends = emailCount + smsCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Send Deal to {buyers.length} Buyer{buyers.length > 1 ? "s" : ""}</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-4">
          {[
            { id: "deal-sheet", label: "Deal Sheet" },
            { id: "delivery", label: "Delivery" },
            { id: "confirm", label: "Confirm" },
          ].map((s, i) => (
            <React.Fragment key={s.id}>
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-small font-medium transition-colors",
                  step === s.id
                    ? "bg-brand text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <span>{i + 1}</span>
                <span>{s.label}</span>
              </div>
              {i < 2 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        {step === "deal-sheet" && (
          <div className="space-y-4">
            {/* Deal Sheet Preview */}
            <Card variant="elevated" padding="md" className="bg-gradient-to-br from-muted/50 to-muted">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-brand/10 flex items-center justify-center">
                    <Home className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{property.address}</h3>
                    <p className="text-small text-muted-foreground">
                      {[property.city, property.state, property.zip].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Pencil />}
                  onClick={() => setIsEditingSheet(!isEditingSheet)}
                >
                  {isEditingSheet ? "Done" : "Edit"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-small text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" />
                    ARV
                  </div>
                  <div className="text-h3 font-bold">{formatCurrency(arv)}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-small text-muted-foreground">
                    <Wrench className="h-3.5 w-3.5" />
                    Repairs
                  </div>
                  <div className="text-h3 font-bold">{formatCurrency(repairs)}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-small text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" />
                    Asking Price
                  </div>
                  {isEditingSheet ? (
                    <Input
                      type="number"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(e.target.value)}
                      className="h-9"
                    />
                  ) : (
                    <div className="text-h3 font-bold">{formatCurrency(price)}</div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-small text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Spread
                  </div>
                  <div className={cn("text-h3 font-bold", spread > 0 ? "text-success" : "text-destructive")}>
                    {formatCurrency(spread)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-small text-muted-foreground">Assignment Fee</span>
                  {isEditingSheet ? (
                    <Input
                      type="number"
                      value={assignmentFee}
                      onChange={(e) => setAssignmentFee(e.target.value)}
                      className="w-32 h-8"
                    />
                  ) : (
                    <span className="font-bold text-brand">{formatCurrency(fee)}</span>
                  )}
                </div>
              </div>

              {/* Property Details */}
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="flex flex-wrap gap-3 text-small text-muted-foreground">
                  {property.beds && <span>{property.beds} beds</span>}
                  {property.baths && <span>{property.baths} baths</span>}
                  {property.sqft && <span>{property.sqft.toLocaleString()} sqft</span>}
                  {property.property_type && <span>{property.property_type}</span>}
                </div>
              </div>
            </Card>

            {/* Selected Buyers Preview */}
            <div className="space-y-2">
              <Label>Sending to:</Label>
              <div className="flex flex-wrap gap-2">
                {buyers.slice(0, 5).map((b) => (
                  <Badge key={b.buyer.id} variant="secondary" size="sm">
                    {b.buyer.name}
                  </Badge>
                ))}
                {buyers.length > 5 && (
                  <Badge variant="secondary" size="sm">
                    +{buyers.length - 5} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border-subtle">
              <Button variant="primary" onClick={() => setStep("delivery")}>
                Next: Delivery Options
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "delivery" && (
          <div className="space-y-6">
            {/* Channels */}
            <div className="space-y-3">
              <Label>Delivery Channels</Label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={channels.email}
                    onCheckedChange={(c) => setChannels((prev) => ({ ...prev, email: !!c }))}
                  />
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Email</div>
                    <div className="text-small text-muted-foreground">
                      Send detailed deal sheet via email
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={channels.sms}
                    onCheckedChange={(c) => setChannels((prev) => ({ ...prev, sms: !!c }))}
                  />
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">SMS</div>
                    <div className="text-small text-muted-foreground">
                      Quick text with property highlights
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-3">
              <Label>Urgency Level</Label>
              <div className="grid grid-cols-3 gap-3">
                {urgencyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setUrgency(opt.value as typeof urgency)}
                    className={cn(
                      "p-3 border rounded-lg text-left transition-all",
                      urgency === opt.value
                        ? "border-brand bg-brand/5 ring-1 ring-brand"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <opt.icon className={cn(
                      "h-5 w-5 mb-2",
                      urgency === opt.value ? "text-brand" : "text-muted-foreground"
                    )} />
                    <div className="font-medium text-small">{opt.label}</div>
                    <div className="text-tiny text-muted-foreground">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Customization */}
            {channels.email && (
              <div className="space-y-3">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
              <p className="text-tiny text-muted-foreground">
                Use [Buyer Name] to personalize. "Interested? Reply YES or call" is automatically included.
              </p>
            </div>

            {/* Timing */}
            <div className="space-y-3">
              <Label>Send Timing</Label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSendTiming("now")}
                  className={cn(
                    "flex-1 p-3 border rounded-lg text-left transition-all",
                    sendTiming === "now"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "hover:bg-muted/50"
                  )}
                >
                  <Zap className={cn("h-5 w-5 mb-1", sendTiming === "now" ? "text-brand" : "text-muted-foreground")} />
                  <div className="font-medium text-small">Send Now</div>
                  <div className="text-tiny text-muted-foreground">All at once</div>
                </button>
                <button
                  onClick={() => setSendTiming("staggered")}
                  className={cn(
                    "flex-1 p-3 border rounded-lg text-left transition-all",
                    sendTiming === "staggered"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "hover:bg-muted/50"
                  )}
                >
                  <Clock className={cn("h-5 w-5 mb-1", sendTiming === "staggered" ? "text-brand" : "text-muted-foreground")} />
                  <div className="font-medium text-small">Staggered</div>
                  <div className="text-tiny text-muted-foreground">10 per hour</div>
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border-subtle">
              <Button variant="ghost" onClick={() => setStep("deal-sheet")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep("confirm")}
                disabled={!channels.email && !channels.sms}
              >
                Review & Confirm
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-6">
            {/* Summary */}
            <Card variant="elevated" padding="md" className="bg-gradient-to-br from-success/5 to-success/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Ready to Send</h3>
                  <p className="text-small text-muted-foreground">
                    Review your deal blast settings
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border-subtle">
                  <span className="text-muted-foreground">Property</span>
                  <span className="font-medium">{property.address}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border-subtle">
                  <span className="text-muted-foreground">Asking Price</span>
                  <span className="font-medium">{formatCurrency(price)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border-subtle">
                  <span className="text-muted-foreground">Assignment Fee</span>
                  <span className="font-medium text-brand">{formatCurrency(fee)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border-subtle">
                  <span className="text-muted-foreground">Recipients</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{buyers.length} buyers</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border-subtle">
                  <span className="text-muted-foreground">Channels</span>
                  <div className="flex items-center gap-2">
                    {channels.email && <Badge variant="info" size="sm">Email</Badge>}
                    {channels.sms && <Badge variant="info" size="sm">SMS</Badge>}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Total Sends</span>
                  <span className="font-bold text-h3">{totalSends}</span>
                </div>
              </div>
            </Card>

            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-small text-warning-foreground">
                <strong>Note:</strong> This will send{" "}
                {emailCount > 0 && `${emailCount} email${emailCount > 1 ? "s" : ""}`}
                {emailCount > 0 && smsCount > 0 && " and "}
                {smsCount > 0 && `${smsCount} SMS message${smsCount > 1 ? "s" : ""}`}.
                Make sure your deal sheet is accurate.
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t border-border-subtle">
              <Button variant="ghost" onClick={() => setStep("delivery")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={sendDeal.isPending}
                icon={<Send />}
              >
                {sendDeal.isPending ? "Sending..." : "Send Now"}
              </Button>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
