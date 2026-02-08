import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Bed,
  Bath,
  Ruler,
  DollarSign,
  TrendingUp,
  Mail,
  MessageSquare,
  FileText,
  Send,
  Clock,
  Check,
  Eye,
  Plus,
  Home,
  Package,
  AlertTriangle,
  Phone,
  Sparkles,
  Target,
  CheckCircle2,
  Lock,
  Users,
  Key,
  Settings2,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useMockDeals } from "@/hooks/useMockDeals";
import { ContactPanel } from "@/components/marketplace-deals/ContactPanel";
import { BuyersPanel } from "@/components/marketplace-deals/BuyersPanel";
import { OfferInsightCard } from "@/components/ai/OfferInsightCard";
import { useOfferInsight } from "@/hooks/useOfferInsight";
import {
  DealSetupStep,
  ComplianceWarnings,
  OfferTemplateManager,
  useOfferTemplates,
} from "@/components/offer-wizard";
import {
  Milestone1DealTeam,
  Milestone2Offer,
  Milestone3DueDiligence,
  Milestone4Closing,
  Milestone5Strategy,
  type TransactionData,
} from "@/components/transactions/TransactionRoadmapContent";

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
    name: "Cash Offer",
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
    name: "Subject-To Offer",
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

const PRESET_PERCENTAGES = [60, 65, 70, 75, 80];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Mock POF documents
const MOCK_POF_DOCUMENTS = [
  {
    id: "pof-1",
    fileName: "Lima_One_POF_500k.pdf",
    amount: 500000,
    lenderName: "Lima One Capital",
    expirationDate: "2026-03-15",
    isActive: true,
  },
  {
    id: "pof-2",
    fileName: "Personal_Bank_Statement.pdf",
    amount: 250000,
    lenderName: "Wells Fargo",
    expirationDate: "2026-02-10",
    isActive: true,
  },
];

// Default filter values for useMockDeals
const defaultOptions = {
  filters: {
    address: "",
    leadType: "all",
    homeTypes: [],
    priceMin: "",
    priceMax: "",
    bedsMin: "",
    bathsMin: "",
  },
  sortBy: "newest",
  page: 1,
  perPage: 100,
};

export default function MakeOfferPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { deals } = useMockDeals(defaultOptions);
  const deal = deals.find((d) => d.id === id);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Template management
  const { templates, saveTemplate, deleteTemplate, setDefault, getDefaultTemplate } = useOfferTemplates();

  // Step 1: Deal Setup (POF + Agent + Property)
  const [dealSetupData, setDealSetupData] = useState({
    selectedPofId: null as string | null,
    includePof: true,
    listingAgent: null as { name: string; email: string; phone: string; brokerage?: string; type: "listing" | "buyer" } | null,
    buyerAgent: null as { name: string; email: string; phone: string; brokerage?: string; type: "listing" | "buyer" } | null,
    useDualAgency: true,
    propertyConfirmed: false,
  });

  // Step 2: Template Selection
  const [templateTab, setTemplateTab] = useState<"templates" | "custom">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("cash");

  // Step 3: Offer Settings (Pricing)
  const [offerPercentage, setOfferPercentage] = useState(65);
  const [customOfferAmount, setCustomOfferAmount] = useState<number | null>(null);
  const [estRepairsInput, setEstRepairsInput] = useState(20000);
  const [holdingCostsInput, setHoldingCostsInput] = useState(8000);
  
  // Step 4: Delivery Configuration
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [twilioNumber, setTwilioNumber] = useState("");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("immediate");
  const [dripBatchSize, setDripBatchSize] = useState(5);
  const [dripInterval, setDripInterval] = useState(30);
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [scheduledTime, setScheduledTime] = useState("09:00");

  // Step 5: Preview
  const [previewTab, setPreviewTab] = useState<"email" | "sms">("email");

  // Auto follow-up settings
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [followUpDays, setFollowUpDays] = useState(3);

  // Offer sent state (unlocks steps 7-11)
  const [offerSent, setOfferSent] = useState(false);

  // Steps 7-11: Transaction Roadmap Data
  const [transactionData, setTransactionData] = useState<TransactionData>({
    currentMilestone: 1,
    lenderConfirmed: false,
    includePof: true,
    realtorConfirmed: false,
    escrowConfirmed: false,
    inspectorAgentRecommended: false,
    appraiserAgentRecommended: false,
    closingFinancingFinalized: false,
    closingEscrowWired: false,
    closingFinalWalkthrough: false,
    closingDocumentsSigned: false,
    closingKeysReceived: false,
    strategyPhaseBuy: false,
    strategyPhaseRehab: false,
    strategyPhaseRent: false,
    strategyPhaseRefinance: false,
    strategyPhaseRepeat: false,
  });

  const updateTransactionData = (updates: Partial<TransactionData>) => {
    setTransactionData(prev => ({ ...prev, ...updates }));
  };

  // Load default template on mount
  useEffect(() => {
    const defaultTpl = getDefaultTemplate();
    if (defaultTpl) {
      setOfferPercentage(defaultTpl.config.offerPercentage);
      setSelectedTemplate(defaultTpl.config.selectedTemplate);
      setEmailEnabled(defaultTpl.config.emailEnabled);
      setSmsEnabled(defaultTpl.config.smsEnabled);
      setEstRepairsInput(defaultTpl.config.estRepairs);
      setHoldingCostsInput(defaultTpl.config.holdingCosts);
    }
  }, []);

  // Mock contact for demo - set as listing agent
  const mockContact = {
    name: "Sarah Mitchell",
    type: "agent" as const,
    phone: "(512) 555-0147",
    email: "sarah.mitchell@premierrealty.com",
    brokerage: "Premier Realty Group",
  };

  // Set listing agent from mock contact
  useEffect(() => {
    if (!dealSetupData.listingAgent) {
      setDealSetupData(prev => ({
        ...prev,
        listingAgent: {
          name: mockContact.name,
          email: mockContact.email,
          phone: mockContact.phone,
          brokerage: mockContact.brokerage,
          type: "listing",
        },
      }));
    }
  }, []);

  // Mock images
  const propertyImages = [
    `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop`,
    `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop`,
    `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop`,
    `https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop`,
  ];

  if (!deal) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Property not found</p>
        </div>
      </AppLayout>
    );
  }

  // Determine if on-market (MLS) - for demo, check property type or default
  const isOnMarket = (deal as any).leadType === "on_market" || (deal as any).leadType === "mls" || false;

  // Calculations
  const arv = deal.arv;
  const offerAmount = customOfferAmount !== null ? customOfferAmount : Math.round(arv * (offerPercentage / 100));
  const effectivePercentage = customOfferAmount !== null ? Math.round((customOfferAmount / arv) * 100) : offerPercentage;
  const estimatedSavings = arv - offerAmount;
  
  // Flipper profit calculation
  const closingCosts = Math.round(arv * 0.06);
  const agentCommission = Math.round(arv * 0.05);
  const flipperProfit = arv - offerAmount - estRepairsInput - holdingCostsInput - closingCosts - agentCommission;
  
  // Wholesaler calculation
  const buyerMaxOffer = Math.round(arv * 0.70);
  const wholesalerProfit = buyerMaxOffer - offerAmount;

  // AI Insight context
  const insightContext = {
    propertyAddress: deal.address,
    arv,
    askingPrice: deal.price,
    offerAmount,
    offerPercentage,
    flipperProfit,
    wholesalerProfit,
    selectedTemplate,
    emailEnabled,
    smsEnabled,
  };

  // AI Insights for each step
  const dealSetupInsight = useOfferInsight("dealSetup", insightContext, currentStep === 1);
  const packageInsight = useOfferInsight("package", insightContext, currentStep === 2);
  const pricingInsight = useOfferInsight("pricing", insightContext, currentStep === 3);
  const deliveryInsight = useOfferInsight("delivery", insightContext, currentStep === 4);
  const previewInsight = useOfferInsight("preview", insightContext, currentStep === 5);
  const reviewInsight = useOfferInsight("review", insightContext, currentStep === 6);

  // New 11-step flow
  const steps = [
    // Offer Steps (1-6)
    { number: 1, title: "Deal Setup", icon: Settings2, locked: false },
    { number: 2, title: "Offer Type", icon: Package, locked: false },
    { number: 3, title: "Pricing", icon: DollarSign, locked: false },
    { number: 4, title: "Delivery", icon: Send, locked: false },
    { number: 5, title: "Preview", icon: Eye, locked: false },
    { number: 6, title: "Send", icon: Check, locked: false },
    // Transaction Roadmap Steps (7-11) - locked until offer sent
    { number: 7, title: "Deal Team", icon: Users, locked: !offerSent },
    { number: 8, title: "Negotiate", icon: DollarSign, locked: !offerSent },
    { number: 9, title: "Due Diligence", icon: FileText, locked: !offerSent },
    { number: 10, title: "Closing", icon: Key, locked: !offerSent },
    { number: 11, title: "Strategy", icon: Target, locked: !offerSent },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Deal Setup: property confirmed, POF if on-market
        if (!dealSetupData.propertyConfirmed) return false;
        if (isOnMarket && !dealSetupData.selectedPofId) return false;
        return true;
      case 2:
        return !!selectedTemplate;
      case 3:
        return offerPercentage >= 50 && offerPercentage <= 100;
      case 4:
        if (smsEnabled && !twilioNumber) return false;
        return emailEnabled || smsEnabled || scheduleType === "draft";
      case 5:
        return true;
      case 6:
        return true;
      // Transaction steps
      case 7:
        return (transactionData.lenderConfirmed || transactionData.lenderName) && 
               (transactionData.realtorConfirmed || transactionData.realtorName);
      case 8:
        return !!transactionData.acceptedOffer && transactionData.escrowConfirmed;
      case 9:
        return !!transactionData.inspectorName && !!transactionData.appraiserName && !!transactionData.insuranceName;
      case 10:
        return transactionData.closingFinancingFinalized && transactionData.closingEscrowWired && 
               transactionData.closingFinalWalkthrough && transactionData.closingDocumentsSigned && 
               transactionData.closingKeysReceived;
      case 11:
        return !!transactionData.investmentStrategy;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 11 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendOffer = async () => {
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
        navigate(`/marketplace/deal/${deal.id}`);
      } else {
        // Mark offer as sent and auto-advance to step 7
        setOfferSent(true);
        setCurrentStep(7);
        
        // Pre-fill transaction data with offer details
        updateTransactionData({
          listingPrice: deal.price,
          mao: offerAmount,
          // Copy lender info from deal setup if confirmed
          lenderName: dealSetupData.selectedPofId ? "Lima One Capital" : undefined,
          lenderConfirmed: !!dealSetupData.selectedPofId,
          // Copy realtor info
          realtorName: dealSetupData.useDualAgency 
            ? dealSetupData.listingAgent?.name 
            : dealSetupData.buyerAgent?.name,
          realtorConfirmed: !!dealSetupData.listingAgent || !!dealSetupData.buyerAgent,
        });
        
        toast.success("Offer sent successfully!", {
          description: autoFollowUp 
            ? `AI will auto-follow up in ${followUpDays} days if no reply. Now complete the transaction steps.`
            : "Now complete the transaction roadmap to close the deal.",
        });
      }
    } catch (error) {
      toast.error("Failed to send offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTransaction = () => {
    toast.success("Transaction completed! 🎉", {
      description: "Congratulations on closing this deal!",
    });
    navigate(`/marketplace/deal/${deal.id}`);
  };

  // Template management
  const currentTemplateConfig = {
    offerPercentage,
    selectedTemplate,
    emailEnabled,
    smsEnabled,
    scheduleType,
    estRepairs: estRepairsInput,
    holdingCosts: holdingCostsInput,
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  return (
    <AppLayout fullWidth>
      <div className="min-h-full flex flex-col bg-white">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/marketplace/deal/${id}`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back To Property
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Make Offer Campaign
                </h1>
                <p className="text-sm text-muted-foreground">{deal.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={cn(
                currentStep <= 6 ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
              )}>
                Step {currentStep} of 11
              </Badge>
              {isOnMarket && (
                <Badge variant="secondary" className="bg-info/10 text-info">
                  MLS - POF Required
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Split Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Property Details */}
          <div className="w-[420px] flex-shrink-0 border-r border-border bg-white flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Image Gallery */}
                <Card className="overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={propertyImages[currentImageIndex]}
                      alt={`Property ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-between p-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge variant="secondary" className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm">
                      {deal.propertyType}
                    </Badge>
                    <div className="absolute bottom-2 right-2 flex gap-1.5">
                      {propertyImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            idx === currentImageIndex
                              ? "w-4 bg-white"
                              : "w-1.5 bg-white/60"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="p-2 flex gap-2">
                    {propertyImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          "w-16 h-12 rounded-md overflow-hidden border-2 transition-all",
                          idx === currentImageIndex
                            ? "border-primary"
                            : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Property Info */}
                <Card className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold">{deal.address}</h2>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{deal.city}, {deal.state} {deal.zip}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-2xl font-bold text-foreground">
                        ${deal.price.toLocaleString()}
                      </div>
                      <div className="text-lg font-semibold text-success">
                        ARV: ${deal.arv.toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-2 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Bed className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">{deal.beds}</p>
                        <p className="text-xs text-muted-foreground">Beds</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Bath className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">{deal.baths}</p>
                        <p className="text-xs text-muted-foreground">Baths</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Ruler className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">{deal.sqft.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Sq Ft</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">2005</p>
                        <p className="text-xs text-muted-foreground">Built</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Offer Summary */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Your Offer
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ARV</span>
                      <span className="font-semibold text-success">${arv.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Your Offer ({effectivePercentage}%)</span>
                      <span className="font-bold text-lg">{formatCurrency(offerAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Flipper Profit</span>
                      <span className={cn("font-semibold", flipperProfit > 0 ? "text-success" : "text-destructive")}>
                        {formatCurrency(flipperProfit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Wholesaler Fee</span>
                      <span className={cn("font-semibold", wholesalerProfit > 0 ? "text-success" : "text-destructive")}>
                        {formatCurrency(wholesalerProfit)}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Investment Metrics */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Investment Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Est. Repairs</span>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          value={estRepairsInput}
                          onChange={(e) => setEstRepairsInput(Number(e.target.value))}
                          className="w-24 h-7 text-sm text-right font-semibold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Holding Costs</span>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          value={holdingCostsInput}
                          onChange={(e) => setHoldingCostsInput(Number(e.target.value))}
                          className="w-24 h-7 text-sm text-right font-semibold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Closing Costs</span>
                      <span className="font-semibold">${closingCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Days on Market</span>
                      <span className="font-semibold">14</span>
                    </div>
                  </div>
                </Card>

                {/* Contact Panel */}
                <ContactPanel
                  contact={mockContact}
                  propertyAddress={deal.address}
                  propertyPrice={deal.price}
                />

                {/* Buyers Panel */}
                <BuyersPanel
                  viewMode="flip"
                  onShowOnMap={() => {}}
                  propertyAddress={deal.address}
                />
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Offer Wizard */}
          <div className="flex-1 bg-white overflow-hidden flex flex-col">
            {/* Step Indicator - Two Rows */}
            <div className="px-6 py-4 border-b bg-muted/30">
              <div className="space-y-3 max-w-4xl mx-auto">
                {/* Offer Steps Row (1-6) */}
                <div className="flex items-center">
                  <div className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0">Offer</div>
                  <div className="flex-1 flex items-center">
                    {steps.slice(0, 6).map((step, index) => (
                      <React.Fragment key={step.number}>
                        <button
                          onClick={() => !step.locked && step.number < currentStep && setCurrentStep(step.number)}
                          disabled={step.locked}
                          className={cn(
                            "flex items-center gap-1.5 text-xs transition-colors",
                            step.locked
                              ? "text-muted-foreground/50 cursor-not-allowed"
                              : currentStep === step.number
                              ? "text-primary font-semibold"
                              : currentStep > step.number
                              ? "text-success cursor-pointer hover:text-success/80"
                              : "text-muted-foreground"
                          )}
                        >
                          <div
                            className={cn(
                              "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium",
                              step.locked
                                ? "bg-muted/50 text-muted-foreground/50"
                                : currentStep === step.number
                                ? "bg-primary text-primary-foreground"
                                : currentStep > step.number
                                ? "bg-success text-white"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {step.locked ? (
                              <Lock className="h-3 w-3" />
                            ) : currentStep > step.number ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <step.icon className="h-3 w-3" />
                            )}
                          </div>
                          <span className="hidden xl:inline">{step.title}</span>
                        </button>
                        {index < 5 && (
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
                </div>
                
                {/* Transaction Steps Row (7-11) */}
                <div className="flex items-center">
                  <div className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0">Transaction</div>
                  <div className="flex-1 flex items-center">
                    {steps.slice(6, 11).map((step, index) => (
                      <React.Fragment key={step.number}>
                        <button
                          onClick={() => !step.locked && step.number < currentStep && setCurrentStep(step.number)}
                          disabled={step.locked}
                          className={cn(
                            "flex items-center gap-1.5 text-xs transition-colors",
                            step.locked
                              ? "text-muted-foreground/50 cursor-not-allowed"
                              : currentStep === step.number
                              ? "text-primary font-semibold"
                              : currentStep > step.number
                              ? "text-success cursor-pointer hover:text-success/80"
                              : "text-muted-foreground"
                          )}
                        >
                          <div
                            className={cn(
                              "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium",
                              step.locked
                                ? "bg-muted/50 text-muted-foreground/50"
                                : currentStep === step.number
                                ? "bg-primary text-primary-foreground"
                                : currentStep > step.number
                                ? "bg-success text-white"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {step.locked ? (
                              <Lock className="h-3 w-3" />
                            ) : currentStep > step.number ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <step.icon className="h-3 w-3" />
                            )}
                          </div>
                          <span className="hidden xl:inline">{step.title}</span>
                        </button>
                        {index < 4 && (
                          <div
                            className={cn(
                              "flex-1 h-0.5 mx-2",
                              step.locked ? "bg-muted/50" : currentStep > step.number ? "bg-success" : "bg-muted"
                            )}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 max-w-3xl mx-auto">
                {/* Step 1: Deal Setup (POF + Agent + Property) */}
                {currentStep === 1 && (
                  <DealSetupStep
                    isOnMarket={isOnMarket}
                    propertyAddress={`${deal.address}, ${deal.city}, ${deal.state} ${deal.zip}`}
                    propertyState={deal.state}
                    arv={arv}
                    offerAmount={offerAmount}
                    pofDocuments={MOCK_POF_DOCUMENTS}
                    listingAgent={dealSetupData.listingAgent || undefined}
                    data={dealSetupData}
                    onUpdate={(updates) => setDealSetupData((prev) => ({ ...prev, ...updates }))}
                    onUploadPof={() => navigate("/documents?folder=proof-of-funds")}
                    insight={dealSetupInsight.insight}
                    insightLoading={dealSetupInsight.isLoading}
                    insightError={dealSetupInsight.error}
                    onRefreshInsight={dealSetupInsight.refetch}
                  />
                )}

                {/* Step 2: Offer Package Selection */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Select Offer Package</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose how your offer will be structured
                      </p>
                    </div>

                    {/* Template Manager */}
                    <OfferTemplateManager
                      currentConfig={currentTemplateConfig}
                      savedTemplates={templates}
                      onLoadTemplate={(tpl) => {
                        setOfferPercentage(tpl.config.offerPercentage);
                        setSelectedTemplate(tpl.config.selectedTemplate);
                        setEmailEnabled(tpl.config.emailEnabled);
                        setSmsEnabled(tpl.config.smsEnabled);
                        setEstRepairsInput(tpl.config.estRepairs);
                        setHoldingCostsInput(tpl.config.holdingCosts);
                      }}
                      onSaveTemplate={saveTemplate}
                      onDeleteTemplate={deleteTemplate}
                      onSetDefault={setDefault}
                    />

                    <OfferInsightCard
                      insight={packageInsight.insight}
                      isLoading={packageInsight.isLoading}
                      error={packageInsight.error}
                      onRefresh={packageInsight.refetch}
                    />

                    <Tabs value={templateTab} onValueChange={(v) => setTemplateTab(v as any)}>
                      <div className="flex gap-2 max-w-xs">
                        <Button
                          variant={templateTab === "templates" ? "default" : "outline"}
                          onClick={() => setTemplateTab("templates")}
                          className="flex-1"
                        >
                          Templates
                        </Button>
                        <Button
                          variant={templateTab === "custom" ? "default" : "outline"}
                          onClick={() => setTemplateTab("custom")}
                          className="flex-1"
                        >
                          Custom
                        </Button>
                      </div>

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
                                      <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5 bg-warning/15 text-warning border-warning/20">
                                        {template.badge}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-0.5">
                                    {template.description}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <FileText className="h-3 w-3" /> LOI
                                    </span>
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
                  </div>
                )}

                {/* Step 3: Offer Settings (Pricing) */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Offer Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Define your offer amount based on ARV
                      </p>
                    </div>

                    <OfferInsightCard
                      insight={pricingInsight.insight}
                      isLoading={pricingInsight.isLoading}
                      error={pricingInsight.error}
                      onRefresh={pricingInsight.refetch}
                    />

                    {/* Preset Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {PRESET_PERCENTAGES.map((pct) => (
                        <Button
                          key={pct}
                          variant={customOfferAmount === null && offerPercentage === pct ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setOfferPercentage(pct);
                            setCustomOfferAmount(null);
                          }}
                        >
                          {pct}%
                        </Button>
                      ))}
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-muted-foreground">Custom:</span>
                        <Input
                          type="number"
                          min={50}
                          max={100}
                          value={customOfferAmount !== null ? effectivePercentage : offerPercentage}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(50, Number(e.target.value)));
                            setOfferPercentage(val);
                            setCustomOfferAmount(null);
                          }}
                          className="w-20 h-9 text-center text-sm font-medium"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Offer Percentage</Label>
                        <span className="text-lg font-semibold text-primary">{effectivePercentage}%</span>
                      </div>
                      <Slider
                        value={[effectivePercentage]}
                        onValueChange={([val]) => {
                          setOfferPercentage(val);
                          setCustomOfferAmount(null);
                        }}
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
                        <p className="text-sm text-muted-foreground mb-1">After Repaired Value (ARV)</p>
                        <p className="text-xl font-semibold text-success">{formatCurrency(arv)}</p>
                      </Card>
                      <Card className="p-4 text-center bg-primary/5 border-primary">
                        <p className="text-sm text-muted-foreground mb-1">Your Offer</p>
                        <p className="text-2xl font-bold">${offerAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">({effectivePercentage}% of ARV)</p>
                      </Card>
                      <Card className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Flipper Profit</p>
                        <p className={cn("text-xl font-semibold", flipperProfit > 0 ? "text-success" : "text-destructive")}>
                          {formatCurrency(flipperProfit)}
                        </p>
                      </Card>
                    </div>

                    {/* Wholesaler Calculation */}
                    <Card className="p-4 mt-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium mb-1">Wholesaler Opportunity</p>
                          <p className="text-xs text-muted-foreground">
                            Sell to end buyer at {formatCurrency(buyerMaxOffer)} (70% ARV)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-0.5">Assignment Fee</p>
                          <p className={cn("text-xl font-bold", wholesalerProfit > 0 ? "text-success" : "text-destructive")}>
                            {formatCurrency(wholesalerProfit)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Step 4: Delivery Configuration */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Delivery Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose how and when your offers will be sent
                      </p>
                    </div>

                    <OfferInsightCard
                      insight={deliveryInsight.insight}
                      isLoading={deliveryInsight.isLoading}
                      error={deliveryInsight.error}
                      onRefresh={deliveryInsight.refetch}
                    />

                    {/* Delivery Methods */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Delivery Methods</h4>
                      
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Mail className="h-5 w-5 text-primary" />
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
                            <div className="p-2 rounded-lg bg-success/10">
                              <MessageSquare className="h-5 w-5 text-success" />
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

                    {/* Inbox Integration & Auto Follow-up */}
                    <Card className="p-4 bg-primary/5 border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Inbox className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">AI Auto Follow-Up</p>
                              <p className="text-sm text-muted-foreground">
                                Automatically follow up if no reply. All communication syncs to your Inbox.
                              </p>
                            </div>
                            <Switch checked={autoFollowUp} onCheckedChange={setAutoFollowUp} />
                          </div>
                          {autoFollowUp && (
                            <div className="mt-3 pt-3 border-t border-primary/20 flex items-center gap-3">
                              <Label className="text-sm whitespace-nowrap">Follow up after</Label>
                              <Select value={followUpDays.toString()} onValueChange={(v) => setFollowUpDays(Number(v))}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 day</SelectItem>
                                  <SelectItem value="2">2 days</SelectItem>
                                  <SelectItem value="3">3 days</SelectItem>
                                  <SelectItem value="5">5 days</SelectItem>
                                  <SelectItem value="7">7 days</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-sm text-muted-foreground">if no response</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

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
                            <span className="font-medium">Schedule For Later</span>
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
                        </Card>
                      )}

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

                {/* Step 5: Preview */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Preview Delivery</h3>
                      <p className="text-sm text-muted-foreground">
                        Review exactly what recipients will receive
                      </p>
                    </div>

                    <OfferInsightCard
                      insight={previewInsight.insight}
                      isLoading={previewInsight.isLoading}
                      error={previewInsight.error}
                      onRefresh={previewInsight.refetch}
                    />

                    <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as any)}>
                      <div className="flex gap-2">
                        <Button
                          variant={previewTab === "email" ? "default" : "outline"}
                          size="sm"
                          disabled={!emailEnabled}
                          onClick={() => setPreviewTab("email")}
                        >
                          <Mail className="h-4 w-4 mr-2" /> Email Preview
                        </Button>
                        <Button
                          variant={previewTab === "sms" ? "default" : "outline"}
                          size="sm"
                          disabled={!smsEnabled}
                          onClick={() => setPreviewTab("sms")}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" /> Text Preview
                        </Button>
                      </div>

                      <TabsContent value="email" className="mt-4">
                        <Card className="overflow-hidden">
                          <div className="p-4 border-b bg-muted/30">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Subject:</span>
                              <span>{emailSubject}</span>
                            </div>
                          </div>
                          
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

                          <div className="p-4">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                              {emailBody}
                            </pre>
                          </div>

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

                {/* Step 6: Review & Send */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Review & Send</h3>
                      <p className="text-sm text-muted-foreground">
                        Confirm all details before sending your offer
                      </p>
                    </div>

                    <OfferInsightCard
                      insight={reviewInsight.insight}
                      isLoading={reviewInsight.isLoading}
                      error={reviewInsight.error}
                      onRefresh={reviewInsight.refetch}
                    />

                    {/* Compliance Check */}
                    <ComplianceWarnings
                      state={deal.state}
                      offerType={selectedTemplate}
                      offerAmount={offerAmount}
                      warnings={[]}
                      disclosures={[]}
                      allCleared={true}
                    />

                    {/* Summary Cards */}
                    <Card className="p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Offer Configuration
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Package Type</p>
                          <p className="font-medium">{selectedTemplateData?.name || "Cash Offer"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Offer Amount</p>
                          <p className="font-medium text-lg">{formatCurrency(offerAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Offer Percentage</p>
                          <p className="font-medium">{effectivePercentage}% of ARV</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">POF</p>
                          <p className="font-medium flex items-center gap-1">
                            {dealSetupData.includePof && dealSetupData.selectedPofId ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                Attached
                              </>
                            ) : (
                              "Not Required"
                            )}
                          </p>
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
                        <div>
                          <p className="text-muted-foreground">Auto Follow-Up</p>
                          <p className="font-medium">
                            {autoFollowUp ? `After ${followUpDays} days` : "Disabled"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Inbox Sync</p>
                          <p className="font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            Enabled
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Property Card */}
                    <Card className="p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Subject Property
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
                            <span className="text-success">ARV: {formatCurrency(arv)}</span>
                            <span className="text-primary font-medium">
                              Offer: {formatCurrency(offerAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Transaction Next Steps Notice */}
                    {scheduleType !== "draft" && (
                      <Card className="p-4 bg-success/5 border-success/20">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-success">
                              Continue To Transaction Steps
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              After sending your offer, you'll continue to Steps 7-11 to assemble your 
                              deal team, negotiate, complete due diligence, close, and execute your investment strategy.
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {/* Step 7: Deal Team */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div>
                      <Badge variant="secondary" className="mb-2 bg-success/10 text-success">
                        Offer Sent
                      </Badge>
                      <h3 className="text-lg font-semibold mb-1">Assemble Your Deal Team</h3>
                      <p className="text-sm text-muted-foreground">
                        Select or confirm your lender and realtor to move forward
                      </p>
                    </div>
                    <Milestone1DealTeam 
                      data={transactionData} 
                      updateData={updateTransactionData} 
                    />
                  </div>
                )}

                {/* Step 8: Negotiate */}
                {currentStep === 8 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Make & Negotiate Offer</h3>
                      <p className="text-sm text-muted-foreground">
                        Capture the economics and get the property under contract
                      </p>
                    </div>
                    <Milestone2Offer 
                      data={transactionData} 
                      updateData={updateTransactionData}
                      propertyPrice={deal.price}
                    />
                  </div>
                )}

                {/* Step 9: Due Diligence */}
                {currentStep === 9 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Under Contract / Due Diligence</h3>
                      <p className="text-sm text-muted-foreground">
                        Validate the deal before closing
                      </p>
                    </div>
                    <Milestone3DueDiligence 
                      data={transactionData} 
                      updateData={updateTransactionData} 
                    />
                  </div>
                )}

                {/* Step 10: Closing */}
                {currentStep === 10 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Close the Deal</h3>
                      <p className="text-sm text-muted-foreground">
                        Final checklist to ownership transfer
                      </p>
                    </div>
                    <Milestone4Closing 
                      data={transactionData} 
                      updateData={updateTransactionData} 
                    />
                  </div>
                )}

                {/* Step 11: Strategy */}
                {currentStep === 11 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Execute Investment Strategy</h3>
                      <p className="text-sm text-muted-foreground">
                        Turn the property into a performing asset
                      </p>
                    </div>
                    <Milestone5Strategy 
                      data={transactionData} 
                      updateData={updateTransactionData} 
                    />
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between bg-white">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || (currentStep === 7 && offerSent)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              {currentStep < 6 ? (
                <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : currentStep === 6 ? (
                <Button
                  onClick={handleSendOffer}
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
              ) : currentStep < 11 ? (
                <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                  Complete & Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteTransaction}
                  disabled={!canProceed()}
                  className="gap-2 min-w-[180px]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Transaction
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
