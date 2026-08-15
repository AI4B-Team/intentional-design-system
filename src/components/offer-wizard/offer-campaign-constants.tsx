import React from "react";
import { DollarSign, FileText, Home, Package, Settings2, Send, Eye, Check } from "lucide-react";

export interface OfferTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  supportsEmail: boolean;
  supportsSms: boolean;
  isDefault?: boolean;
  badge?: string;
}

export type ScheduleType = "immediate" | "drip" | "scheduled" | "draft";

export const OFFER_TEMPLATES: OfferTemplate[] = [
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

export const PRESET_PERCENTAGES = [60, 65, 70, 75, 80];

export const WIZARD_STEPS = [
  { number: 1, title: "Deal", icon: Settings2 },
  { number: 2, title: "Offer", icon: Package },
  { number: 3, title: "Pricing", icon: DollarSign },
  { number: 4, title: "Delivery", icon: Send },
  { number: 5, title: "Preview", icon: Eye },
  { number: 6, title: "Send", icon: Check },
];

export const MOCK_POF_DOCUMENTS = [
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
export const MOCK_DEALS_OPTIONS = {
  filters: {
    address: "",
    leadType: "all",
    homeTypes: [] as string[],
    priceMin: "",
    priceMax: "",
    bedsMin: "",
    bathsMin: "",
  },
  sortBy: "newest",
  page: 1,
  perPage: 100,
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Shared prop surface for the offer campaign wizard steps. Each step
 * destructures only the fields it needs.
 */
export interface OfferWizardStepProps {
  deal: any;
  arv: number;
  offerAmount: number;
  effectivePercentage: number;
  offerPercentage: number;
  setOfferPercentage: (v: number) => void;
  customOfferAmount: number | null;
  setCustomOfferAmount: (v: number | null) => void;
  estRepairsInput: number;
  setEstRepairsInput: (v: number) => void;
  holdingCostsInput: number;
  setHoldingCostsInput: (v: number) => void;
  closingCosts: number;
  agentCommission: number;
  flipperProfit: number;
  wholesalerProfit: number;
  buyerMaxOffer: number;
  selectedTemplate: string;
  setSelectedTemplate: (v: string) => void;
  templateTab: "templates" | "custom";
  setTemplateTab: (v: "templates" | "custom") => void;
  templates: any[];
  saveTemplate: (...args: any[]) => any;
  deleteTemplate: (...args: any[]) => any;
  setDefault: (...args: any[]) => any;
  currentTemplateConfig: any;
  selectedTemplateData?: OfferTemplate;
  emailEnabled: boolean;
  setEmailEnabled: (v: boolean) => void;
  smsEnabled: boolean;
  setSmsEnabled: (v: boolean) => void;
  twilioNumber: string;
  setTwilioNumber: (v: string) => void;
  scheduleType: ScheduleType;
  setScheduleType: (v: ScheduleType) => void;
  dripBatchSize: number;
  setDripBatchSize: (v: number) => void;
  dripInterval: number;
  setDripInterval: (v: number) => void;
  scheduledDate: string;
  setScheduledDate: (v: string) => void;
  scheduledTime: string;
  setScheduledTime: (v: string) => void;
  previewTab: "email" | "sms";
  setPreviewTab: (v: "email" | "sms") => void;
  autoFollowUp: boolean;
  setAutoFollowUp: (v: boolean) => void;
  followUpDays: number;
  setFollowUpDays: (v: number) => void;
  emailSubject: string;
  emailBody: string;
  smsBody: string;
  propertyImages: string[];
  packageInsight: any;
  pricingInsight: any;
  deliveryInsight: any;
  previewInsight: any;
  reviewInsight: any;
  isOnMarket: boolean;
  navigate: (...args: any[]) => any;
  mockContact: any;
  setCurrentStep: (v: number) => void;
  isSubmitting: boolean;
}
