import * as React from "react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Calendar,
  DollarSign,
  Home,
  Package,
  Settings,
  AlertTriangle,
  Bed,
  Bath,
  Ruler,
  Phone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { MarketplaceDeal } from "@/hooks/useMockDeals";

interface MakeOfferWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: MarketplaceDeal;
}

interface OfferTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  supportsEmail: boolean;
  supportsSms: boolean;
  isDefault?: boolean;
  badge?: string;
}

type ScheduleType = "immediate" | "drip" | "scheduled" | "draft";

const OFFER_TEMPLATES: OfferTemplate[] = [
  {
    id: "cash",
    name: "Professional Cash Offer",
    description: "Standard cash offer with quick close timeline",
    icon: <DollarSign className="h-5 w-5" />,
    supportsEmail: true,
    supportsSms: true,
    isDefault: true,
    badge: "Most Common",
  },
  {
    id: "seller-financing",
    name: "Seller Financing Offer",
    description: "Creative financing with seller-carried note",
    icon: <FileText className="h-5 w-5" />,
    supportsEmail: true,
    supportsSms: true,
  },
  {
    id: "subject-to",
    name: "Subject-To Acquisition",
    description: "Take over existing mortgage payments",
    icon: <Home className="h-5 w-5" />,
    supportsEmail: true,
    supportsSms: true,
  },
  {
    id: "hybrid",
    name: "Hybrid Offer Package",
    description: "Combined cash + seller financing terms",
    icon: <Package className="h-5 w-5" />,
    supportsEmail: true,
    supportsSms: true,
  },
];

const PRESET_PERCENTAGES = [60, 65, 70, 75];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function MakeOfferWizard({ open, onOpenChange, deal }: MakeOfferWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Template Selection
  const [templateTab, setTemplateTab] = useState<"templates" | "custom">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("cash");

  // Step 2: Offer Settings (Pricing)
  const [offerPercentage, setOfferPercentage] = useState(65);
  
  // Step 3: Delivery Configuration
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [twilioNumber, setTwilioNumber] = useState("");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("immediate");
  const [dripBatchSize, setDripBatchSize] = useState(5);
  const [dripInterval, setDripInterval] = useState(30);
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [scheduledTime, setScheduledTime] = useState("09:00");

  // Step 4: Preview
  const [previewTab, setPreviewTab] = useState<"email" | "sms">("email");

  // Calculations
  const marketValue = deal.price;
  const offerAmount = Math.round(marketValue * (offerPercentage / 100));
  const estimatedSavings = marketValue - offerAmount;

  const steps = [
    { number: 1, title: "Offer Package", icon: Package },
    { number: 2, title: "Pricing", icon: DollarSign },
    { number: 3, title: "Delivery", icon: Send },
    { number: 4, title: "Preview", icon: Eye },
    { number: 5, title: "Review", icon: Check },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedTemplate;
      case 2:
        return offerPercentage >= 50 && offerPercentage <= 100;
      case 3:
        if (smsEnabled && !twilioNumber) return false;
        return emailEnabled || smsEnabled || scheduleType === "draft";
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Check for Twilio if SMS enabled
    if (smsEnabled && !twilioNumber) {
      toast.error("Error Sending Offers: Twilio configuration not found", {
        description: "Please configure Twilio or remove text delivery",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate campaign creation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (scheduleType === "draft") {
        toast.success("Campaign saved as draft");
        onOpenChange(false);
      } else {
        toast.success("Offer campaign created successfully!", {
          description: "Transaction Roadmap has been initiated",
        });
        
        onOpenChange(false);
        
        // Navigate to Transaction Roadmap
        navigate(`/marketplace/deal/${deal.id}/roadmap`);
      }
    } catch (error) {
      toast.error("Failed to create offer campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTemplateData = OFFER_TEMPLATES.find((t) => t.id === selectedTemplate);

  // Email preview content
  const emailSubject = `Cash Offer for ${deal.address}`;
  const emailBody = `Dear Property Owner,

I am writing to express my interest in purchasing your property located at:

${deal.address}
${deal.city}, ${deal.state} ${deal.zip}

After careful analysis, I would like to make the following cash offer:

PURCHASE PRICE: ${formatCurrency(offerAmount)}

TERMS:
• All Cash – No financing contingencies
• Close in as little as 14-21 days
• Property purchased AS-IS
• Earnest Money Deposit: $5,000
• Inspection Period: 10 days
• Closing Timeline: Flexible to your needs

I have proof of funds readily available and can close on your timeline. This is a firm offer and I am prepared to move quickly.

Please feel free to contact me at your earliest convenience to discuss this offer.

Best regards,
[Your Name]
[Your Company]
[Your Phone]`;

  const smsBody = `Hi! I'm interested in your property at ${deal.address}. I can offer ${formatCurrency(offerAmount)} cash and close in 14 days. Would you like to discuss? Reply YES or call me.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col bg-white p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Make Offer Campaign
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <button
                  onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                  className={cn(
                    "flex items-center gap-2 text-small transition-colors",
                    currentStep === step.number
                      ? "text-primary font-semibold"
                      : currentStep > step.number
                      ? "text-success cursor-pointer hover:text-success/80"
                      : "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-tiny font-medium",
                      currentStep === step.number
                        ? "bg-primary text-primary-foreground"
                        : currentStep > step.number
                        ? "bg-success text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="hidden lg:inline">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-3",
                      currentStep > step.number ? "bg-success" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 min-h-[400px]">
            {/* Step 1: Offer Package Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Select Offer Option</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose how your offer will be structured
                  </p>
                </div>

                <Tabs value={templateTab} onValueChange={(v) => setTemplateTab(v as any)}>
                  <TabsList className="grid w-full grid-cols-2 max-w-xs">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="custom">Custom Packages</TabsTrigger>
                  </TabsList>

                  <TabsContent value="templates" className="mt-4">
                    <div className="grid gap-3">
                      {OFFER_TEMPLATES.map((template) => (
                        <Card
                          key={template.id}
                          className={cn(
                            "p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm",
                            selectedTemplate === template.id
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          )}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                selectedTemplate === template.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {template.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{template.name}</h4>
                                {template.badge && (
                                  <Badge variant="default" size="sm">
                                    {template.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {template.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                {template.supportsEmail && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" /> Email
                                  </span>
                                )}
                                {template.supportsSms && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MessageSquare className="h-3 w-3" /> SMS
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <FileText className="h-3 w-3" /> LOI
                                </span>
                              </div>
                            </div>
                            <div
                              className={cn(
                                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                selectedTemplate === template.id
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              )}
                            >
                              {selectedTemplate === template.id && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="mt-4">
                    <Card className="p-8 text-center border-dashed">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <h4 className="font-medium mt-4">No Custom Packages Yet</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create reusable offer packages in the Offer Builder
                      </p>
                      <Button variant="outline" className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Create in Offer Builder
                      </Button>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Selected Property Summary */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Selected Property</h4>
                  <Card className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {deal.images?.[0] ? (
                          <img
                            src={deal.images[0]}
                            alt={deal.address}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium truncate">{deal.address}</h5>
                        <p className="text-sm text-muted-foreground">
                          {deal.city}, {deal.state} {deal.zip}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Bed className="h-3.5 w-3.5" /> {deal.beds}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-3.5 w-3.5" /> {deal.baths}
                          </span>
                          <span className="flex items-center gap-1">
                            <Ruler className="h-3.5 w-3.5" /> {deal.sqft.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Asking Price</p>
                        <p className="text-lg font-semibold">{formatCurrency(deal.price)}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 2: Offer Settings (Pricing) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Offer Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Define your offer amount based on asking price
                  </p>
                </div>

                {/* Preset Buttons */}
                <div className="flex gap-2">
                  {PRESET_PERCENTAGES.map((pct) => (
                    <Button
                      key={pct}
                      variant={offerPercentage === pct ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOfferPercentage(pct)}
                      className={cn(
                        offerPercentage === pct && "bg-primary text-primary-foreground"
                      )}
                    >
                      {pct}%
                    </Button>
                  ))}
                </div>

                {/* Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Offer Percentage</Label>
                    <span className="text-lg font-semibold text-primary">{offerPercentage}%</span>
                  </div>
                  <Slider
                    value={[offerPercentage]}
                    onValueChange={([val]) => setOfferPercentage(val)}
                    min={50}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Calculations Display */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Market Value</p>
                    <p className="text-xl font-semibold">{formatCurrency(marketValue)}</p>
                  </Card>
                  <Card className="p-4 text-center bg-primary/5 border-primary">
                    <p className="text-sm text-muted-foreground mb-1">Your Offer</p>
                    <p className="text-xl font-semibold text-primary">
                      {formatCurrency(offerAmount)}
                    </p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Est. Savings</p>
                    <p className="text-xl font-semibold text-success">
                      {formatCurrency(estimatedSavings)}
                    </p>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 3: Delivery Configuration */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Delivery Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose how and when your offers will be sent
                  </p>
                </div>

                {/* Delivery Methods */}
                <div className="space-y-4">
                  <h4 className="font-medium">Delivery Methods</h4>
                  
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Mail className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">
                            Send professional offer letter via email
                          </p>
                        </div>
                      </div>
                      <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <MessageSquare className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-medium">Text (SMS)</p>
                          <p className="text-sm text-muted-foreground">
                            Send concise offer via SMS
                          </p>
                        </div>
                      </div>
                      <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
                    </div>
                    
                    {smsEnabled && (
                      <div className="mt-4 pt-4 border-t">
                        <Label htmlFor="twilioNumber">Twilio Number</Label>
                        <Select value={twilioNumber} onValueChange={setTwilioNumber}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a Twilio number" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+15125551234">+1 (512) 555-1234</SelectItem>
                            <SelectItem value="+15125555678">+1 (512) 555-5678</SelectItem>
                          </SelectContent>
                        </Select>
                        {smsEnabled && !twilioNumber && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Twilio number required for SMS delivery
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Scheduling Options */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Scheduling</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Card
                      className={cn(
                        "p-4 cursor-pointer transition-all",
                        scheduleType === "immediate"
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => setScheduleType("immediate")}
                    >
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        <span className="font-medium">Send Immediately</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        All offers sent at once
                      </p>
                    </Card>

                    <Card
                      className={cn(
                        "p-4 cursor-pointer transition-all",
                        scheduleType === "drip"
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => setScheduleType("drip")}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Drip Campaign</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Stagger delivery over time
                      </p>
                    </Card>

                    <Card
                      className={cn(
                        "p-4 cursor-pointer transition-all",
                        scheduleType === "scheduled"
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => setScheduleType("scheduled")}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Schedule for Later</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Set a specific date & time
                      </p>
                    </Card>

                    <Card
                      className={cn(
                        "p-4 cursor-pointer transition-all",
                        scheduleType === "draft"
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => setScheduleType("draft")}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Save As Draft</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Save without sending
                      </p>
                    </Card>
                  </div>

                  {/* Drip Settings */}
                  {scheduleType === "drip" && (
                    <Card className="p-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Batch Size</Label>
                          <Input
                            type="number"
                            value={dripBatchSize}
                            onChange={(e) => setDripBatchSize(parseInt(e.target.value) || 1)}
                            min={1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Interval (minutes)</Label>
                          <Input
                            type="number"
                            value={dripInterval}
                            onChange={(e) => setDripInterval(parseInt(e.target.value) || 30)}
                            min={5}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                        <p>
                          <strong>1</strong> offer in <strong>1</strong> batch
                        </p>
                        <p className="text-muted-foreground">
                          Estimated duration: {dripInterval} minutes
                        </p>
                      </div>
                    </Card>
                  )}

                  {/* Schedule Settings */}
                  {scheduleType === "scheduled" && (
                    <Card className="p-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Time</Label>
                          <Input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        Campaign will start on {scheduledDate} at {scheduledTime}
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Preview */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Preview Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Review exactly what recipients will receive
                  </p>
                </div>

                <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as any)}>
                  <TabsList>
                    <TabsTrigger value="email" disabled={!emailEnabled}>
                      <Mail className="h-4 w-4 mr-2" /> Email Preview
                    </TabsTrigger>
                    <TabsTrigger value="sms" disabled={!smsEnabled}>
                      <MessageSquare className="h-4 w-4 mr-2" /> Text Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="mt-4">
                    <Card className="overflow-hidden">
                      {/* Email Header */}
                      <div className="p-4 border-b bg-muted/30">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Subject:</span>
                          <span>{emailSubject}</span>
                        </div>
                      </div>
                      
                      {/* Key Terms Strip */}
                      <div className="px-4 py-2 bg-primary/5 border-b flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">Offer:</span>{" "}
                          <span className="font-semibold">{formatCurrency(offerAmount)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Close:</span>{" "}
                          <span className="font-semibold">14-21 Days</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">EMD:</span>{" "}
                          <span className="font-semibold">$5,000</span>
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {emailBody}
                        </pre>
                      </div>

                      {/* Merge Field Indicators */}
                      <div className="px-4 py-3 border-t bg-muted/30">
                        <p className="text-xs text-muted-foreground">
                          Merge fields:{" "}
                          <code className="bg-muted px-1 rounded">{"{property_address}"}</code>,{" "}
                          <code className="bg-muted px-1 rounded">{"{offer_amount}"}</code>
                        </p>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="sms" className="mt-4">
                    <Card className="overflow-hidden max-w-md mx-auto">
                      {/* Phone Frame */}
                      <div className="p-4 bg-muted/30 border-b">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">SMS Preview</span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-bl-sm p-3 max-w-[85%]">
                          <p className="text-sm">{smsBody}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {smsBody.length} characters ({Math.ceil(smsBody.length / 160)} message
                          {Math.ceil(smsBody.length / 160) > 1 ? "s" : ""})
                        </p>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Step 5: Review & Confirm */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Review Campaign</h3>
                  <p className="text-sm text-muted-foreground">
                    Confirm your offer campaign details before sending
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Campaign Summary */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Campaign Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Offer Package</p>
                        <p className="font-medium">{selectedTemplateData?.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Properties</p>
                        <p className="font-medium">1 property</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Offer Amount</p>
                        <p className="font-medium text-primary">{formatCurrency(offerAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Offer Percentage</p>
                        <p className="font-medium">{offerPercentage}% of asking</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Delivery Settings
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Methods</p>
                        <div className="flex items-center gap-2 mt-1">
                          {emailEnabled && (
                            <Badge variant="secondary" size="sm">
                              <Mail className="h-3 w-3 mr-1" /> Email
                            </Badge>
                          )}
                          {smsEnabled && (
                            <Badge variant="secondary" size="sm">
                              <MessageSquare className="h-3 w-3 mr-1" /> SMS
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Schedule</p>
                        <p className="font-medium capitalize">
                          {scheduleType === "immediate"
                            ? "Send Immediately"
                            : scheduleType === "drip"
                            ? "Drip Campaign"
                            : scheduleType === "scheduled"
                            ? `${scheduledDate} at ${scheduledTime}`
                            : "Save As Draft"}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Property Card */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Target Property
                    </h4>
                    <div className="flex gap-4">
                      <div className="w-20 h-16 rounded bg-muted overflow-hidden flex-shrink-0">
                        {deal.images?.[0] ? (
                          <img
                            src={deal.images[0]}
                            alt={deal.address}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{deal.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {deal.city}, {deal.state} {deal.zip}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span>Asking: {formatCurrency(deal.price)}</span>
                          <span className="text-primary font-medium">
                            Offer: {formatCurrency(offerAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Transaction Roadmap Notice */}
                  {scheduleType !== "draft" && (
                    <Card className="p-4 bg-success/5 border-success/20">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-success">
                            Transaction Roadmap Will Be Created
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Once your offer is sent, a Transaction Roadmap will be automatically
                            created to track negotiation, due diligence, closing, and post-close
                            strategy execution.
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < 5 ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="gap-2 min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  {scheduleType === "draft" ? "Saving..." : "Sending..."}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {scheduleType === "draft" ? "Save Draft" : "Send Offer"}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
