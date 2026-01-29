import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Send,
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  DollarSign,
  FileText,
  Mail,
  MessageSquare,
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Calculator,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  useLoiTemplates,
  useCreateOfferBatch,
  calculateOfferAmount,
  calculateEarnestMoney,
  calculateMonthlyPayment,
  formatCurrency,
  type LoiType,
  type LoiTemplate,
  DEFAULT_LOI_TEMPLATES,
} from "@/hooks/useAcquireFlow";

interface Property {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  list_price?: number | null;
  arv?: number | null;
  owner_name?: string | null;
  owner_email?: string | null;
  owner_phone?: string | null;
  agent_name?: string | null;
  agent_email?: string | null;
  agent_phone?: string | null;
}

type Step = "select" | "configure" | "preview" | "send";

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "select", label: "Select Properties", icon: Building2 },
  { key: "configure", label: "Configure Offer", icon: Calculator },
  { key: "preview", label: "Preview & Customize", icon: FileText },
  { key: "send", label: "Send Offers", icon: Send },
];

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                isComplete && "bg-success/10 text-success",
                isCurrent && "bg-brand/10 text-brand",
                !isComplete && !isCurrent && "bg-surface-secondary text-content-tertiary"
              )}
            >
              {isComplete ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="text-small font-medium">{step.label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={cn("w-8 h-0.5", isComplete ? "bg-success" : "bg-border-subtle")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function BulkOfferSender() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: templates, isLoading: templatesLoading } = useLoiTemplates();
  const createBatch = useCreateOfferBatch();

  // Step state
  const [step, setStep] = React.useState<Step>("select");

  // Selection state
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [loadingProperties, setLoadingProperties] = React.useState(true);

  // Configuration state
  const [loiType, setLoiType] = React.useState<LoiType>("cash");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");
  const [offerPercentage, setOfferPercentage] = React.useState(70);
  const [earnestMoneyPercent, setEarnestMoneyPercent] = React.useState(1);
  const [closingDays, setClosingDays] = React.useState(14);
  const [downPaymentPercent, setDownPaymentPercent] = React.useState(10);
  const [interestRate, setInterestRate] = React.useState(6);
  const [termMonths, setTermMonths] = React.useState(360);
  const [deliveryChannels, setDeliveryChannels] = React.useState<string[]>(["email"]);
  const [dailyLimit, setDailyLimit] = React.useState(50);

  // Send state
  const [isSending, setIsSending] = React.useState(false);
  const [sendProgress, setSendProgress] = React.useState(0);
  const [sendComplete, setSendComplete] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // Load properties
  React.useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoadingProperties(true);
    const { data, error } = await supabase
      .from("properties")
      .select("id, address, city, state, zip, arv, owner_name, owner_email, owner_phone")
      .order("created_at", { ascending: false })
      .limit(500);

    if (!error && data) {
      setProperties(data as Property[]);
    }
    setLoadingProperties(false);
  };

  const selectedProperties = React.useMemo(() => {
    return properties.filter((p) => selectedIds.has(p.id));
  }, [properties, selectedIds]);

  const propertiesWithContact = React.useMemo(() => {
    return selectedProperties.filter((p) => p.owner_email || p.owner_phone);
  }, [selectedProperties]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(properties.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleNext = () => {
    const steps: Step[] = ["select", "configure", "preview", "send"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ["select", "configure", "preview", "send"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSend = async () => {
    setConfirmOpen(false);
    setIsSending(true);
    setSendProgress(0);

    try {
      // Create the batch
      const batchItems = propertiesWithContact.map((p) => {
        const basePrice = p.list_price || p.arv || 100000;
        const offerAmount = calculateOfferAmount(basePrice, offerPercentage);

        return {
          property_id: p.id,
          property_address: p.address,
          property_city: p.city,
          property_state: p.state,
          property_zip: p.zip,
          contact_name: p.owner_name,
          contact_email: p.owner_email,
          contact_phone: p.owner_phone,
          contact_type: "seller" as const,
          list_price: basePrice,
          offer_amount: offerAmount,
        };
      });

      await createBatch.mutateAsync({
        name: `Bulk Offer - ${new Date().toLocaleDateString()}`,
        loi_type: loiType,
        loi_template_id: selectedTemplateId || undefined,
        offer_percentage: offerPercentage,
        earnest_money: earnestMoneyPercent,
        closing_days: closingDays,
        down_payment_percentage: loiType !== "cash" ? downPaymentPercent : undefined,
        interest_rate: loiType !== "cash" ? interestRate : undefined,
        term_months: loiType !== "cash" ? termMonths : undefined,
        delivery_channels: deliveryChannels,
        daily_limit: dailyLimit,
        properties: batchItems,
      });

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setSendProgress(i);
        await new Promise((r) => setTimeout(r, 200));
      }

      setSendComplete(true);
      toast.success(`${propertiesWithContact.length} offers queued for delivery`);
    } catch (error) {
      console.error("Error sending offers:", error);
      toast.error("Failed to create offer batch");
    } finally {
      setIsSending(false);
    }
  };

  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId);

  return (
    <PageLayout>
      <PageHeader
        title="Bulk Offer Sender"
        description="Send personalized offers to multiple properties at once"
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        }
      />

      <StepIndicator currentStep={step} />

      {/* Step 1: Select Properties */}
      {step === "select" && (
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-brand" />
              Select Properties
            </CardTitle>
            <CardDescription>
              Choose properties to include in your bulk offer campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.size === properties.length && properties.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-small text-content-secondary">
                  {selectedIds.size} of {properties.length} selected
                </span>
              </div>
              <Badge variant="secondary">
                {propertiesWithContact.length} with contact info
              </Badge>
            </div>

            <div className="border rounded-medium max-h-96 overflow-y-auto">
              {loadingProperties ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="p-8 text-center">
                  <Building2 className="h-12 w-12 text-content-tertiary mx-auto mb-3" />
                  <p className="text-content-secondary">No properties found</p>
                </div>
              ) : (
                properties.map((property) => (
                  <div
                    key={property.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 border-b last:border-b-0 transition-colors",
                      selectedIds.has(property.id) && "bg-brand/5"
                    )}
                  >
                    <Checkbox
                      checked={selectedIds.has(property.id)}
                      onCheckedChange={(checked) => handleSelect(property.id, !!checked)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{property.address}</p>
                      <p className="text-small text-content-secondary">
                        {[property.city, property.state, property.zip].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    {property.list_price && (
                      <Badge variant="secondary">
                        {formatCurrency(property.list_price)}
                      </Badge>
                    )}
                    {(property.owner_email || property.owner_phone) ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configure Offer */}
      {step === "configure" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand" />
                Offer Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={loiType} onValueChange={(v) => setLoiType(v as LoiType)}>
                <div className="space-y-3">
                  <label className={cn(
                    "flex items-start gap-3 p-4 rounded-medium border cursor-pointer transition-colors",
                    loiType === "cash" ? "border-brand bg-brand/5" : "border-border-subtle hover:border-brand/50"
                  )}>
                    <RadioGroupItem value="cash" className="mt-1" />
                    <div>
                      <p className="font-medium">Cash Offer</p>
                      <p className="text-small text-content-secondary">
                        All-cash purchase with quick close, no financing contingencies
                      </p>
                    </div>
                  </label>
                  <label className={cn(
                    "flex items-start gap-3 p-4 rounded-medium border cursor-pointer transition-colors",
                    loiType === "creative" ? "border-brand bg-brand/5" : "border-border-subtle hover:border-brand/50"
                  )}>
                    <RadioGroupItem value="creative" className="mt-1" />
                    <div>
                      <p className="font-medium">Creative / Seller Financing</p>
                      <p className="text-small text-content-secondary">
                        Down payment with owner-financed terms over time
                      </p>
                    </div>
                  </label>
                  <label className={cn(
                    "flex items-start gap-3 p-4 rounded-medium border cursor-pointer transition-colors",
                    loiType === "hybrid" ? "border-brand bg-brand/5" : "border-border-subtle hover:border-brand/50"
                  )}>
                    <RadioGroupItem value="hybrid" className="mt-1" />
                    <div>
                      <p className="font-medium">Hybrid</p>
                      <p className="text-small text-content-secondary">
                        Part cash at closing, balance via seller financing
                      </p>
                    </div>
                  </label>
                </div>
              </RadioGroup>

              <div className="space-y-4">
                <div>
                  <Label>Offer Percentage of List Price</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[offerPercentage]}
                      onValueChange={([v]) => setOfferPercentage(v)}
                      min={50}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={offerPercentage}
                      onChange={(e) => setOfferPercentage(Number(e.target.value))}
                      className="w-20 text-center"
                    />
                    <span className="text-content-secondary">%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Earnest Money %</Label>
                    <Input
                      type="number"
                      value={earnestMoneyPercent}
                      onChange={(e) => setEarnestMoneyPercent(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Closing Days</Label>
                    <Input
                      type="number"
                      value={closingDays}
                      onChange={(e) => setClosingDays(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                </div>

                {loiType !== "cash" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Down Payment %</Label>
                        <Input
                          type="number"
                          value={downPaymentPercent}
                          onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Interest Rate %</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={interestRate}
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Term (months)</Label>
                      <Select value={String(termMonths)} onValueChange={(v) => setTermMonths(Number(v))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">5 years (60 mo)</SelectItem>
                          <SelectItem value="120">10 years (120 mo)</SelectItem>
                          <SelectItem value="180">15 years (180 mo)</SelectItem>
                          <SelectItem value="240">20 years (240 mo)</SelectItem>
                          <SelectItem value="360">30 years (360 mo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand" />
                LOI Template & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>LOI Template</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templatesLoading ? (
                      <SelectItem value="" disabled>Loading...</SelectItem>
                    ) : templates && templates.length > 0 ? (
                      templates
                        .filter((t) => t.loi_type === loiType)
                        .map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))
                    ) : (
                      DEFAULT_LOI_TEMPLATES
                        .filter((t) => t.loi_type === loiType)
                        .map((t, i) => (
                          <SelectItem key={i} value={`default-${i}`}>
                            {t.name} (Default)
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Delivery Channels</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={deliveryChannels.includes("email")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setDeliveryChannels([...deliveryChannels, "email"]);
                        } else {
                          setDeliveryChannels(deliveryChannels.filter((c) => c !== "email"));
                        }
                      }}
                    />
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={deliveryChannels.includes("sms")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setDeliveryChannels([...deliveryChannels, "sms"]);
                        } else {
                          setDeliveryChannels(deliveryChannels.filter((c) => c !== "sms"));
                        }
                      }}
                    />
                    <MessageSquare className="h-4 w-4" />
                    <span>SMS</span>
                  </label>
                </div>
              </div>

              <div>
                <Label>Daily Sending Limit</Label>
                <Input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="mt-2"
                />
                <p className="text-tiny text-content-tertiary mt-1">
                  Respects rate limits to protect deliverability
                </p>
              </div>

              <Card variant="bordered" padding="md">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-brand" />
                  <div>
                    <p className="font-medium">{propertiesWithContact.length} offers will be sent</p>
                    <p className="text-small text-content-secondary">
                      Over {Math.ceil(propertiesWithContact.length / dailyLimit)} days at {dailyLimit}/day
                    </p>
                  </div>
                </div>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Preview Offers</CardTitle>
            <CardDescription>
              Review how your offers will appear to recipients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto border rounded-medium">
              {propertiesWithContact.slice(0, 10).map((property) => {
                const basePrice = property.list_price || property.arv || 100000;
                const offerAmount = calculateOfferAmount(basePrice, offerPercentage);
                const earnestMoney = calculateEarnestMoney(offerAmount, earnestMoneyPercent);

                return (
                  <div key={property.id} className="p-4 border-b last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{property.address}</p>
                      <Badge variant="default">{formatCurrency(offerAmount)}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-small text-content-secondary">
                      <span>List: {formatCurrency(basePrice)}</span>
                      <span>Earnest: {formatCurrency(earnestMoney)}</span>
                      <span>Close: {closingDays} days</span>
                      <span>To: {property.owner_name || property.owner_email}</span>
                    </div>
                  </div>
                );
              })}
              {propertiesWithContact.length > 10 && (
                <div className="p-4 text-center text-content-secondary">
                  + {propertiesWithContact.length - 10} more properties
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Send */}
      {step === "send" && (
        <Card variant="default" padding="lg">
          <CardContent className="py-12 text-center">
            {sendComplete ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                <h2 className="text-h2 font-bold mb-2">Offers Queued!</h2>
                <p className="text-content-secondary mb-6">
                  {propertiesWithContact.length} offers have been queued for delivery
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="secondary" onClick={() => navigate("/marketing/offers")}>
                    View Offer Tracking
                  </Button>
                  <Button variant="primary" onClick={() => navigate("/inbox")}>
                    Go to Inbox
                  </Button>
                </div>
              </>
            ) : isSending ? (
              <>
                <Loader2 className="h-16 w-16 text-brand animate-spin mx-auto mb-4" />
                <h2 className="text-h2 font-bold mb-2">Sending Offers...</h2>
                <p className="text-content-secondary mb-6">
                  Please don't close this window
                </p>
                <Progress value={sendProgress} className="max-w-md mx-auto" />
              </>
            ) : (
              <>
                <Send className="h-16 w-16 text-brand mx-auto mb-4" />
                <h2 className="text-h2 font-bold mb-2">Ready to Send</h2>
                <p className="text-content-secondary mb-6">
                  You're about to send {propertiesWithContact.length} personalized offers
                </p>
                <Button variant="primary" size="lg" onClick={() => setConfirmOpen(true)}>
                  <Zap className="h-5 w-5 mr-2" />
                  Send {propertiesWithContact.length} Offers
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {!sendComplete && !isSending && (
        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={step === "select"}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {step !== "send" && (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={step === "select" && selectedIds.size === 0}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Send</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to send {propertiesWithContact.length} offers via{" "}
              {deliveryChannels.join(" and ")}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>
              Send Offers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
