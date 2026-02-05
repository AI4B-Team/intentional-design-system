// Offer Blaster Types

export type OfferType = 
  | "cash" 
  | "subject_to" 
  | "seller_financing" 
  | "hybrid" 
  | "novation"
  | "listing"
  | "referral";

export type MarketType = "on_market" | "off_market";

export type DocumentType = "loi" | "purchase_agreement" | "both";

export interface OfferTypeConfig {
  id: OfferType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  features: string[];
  requiresPOF: boolean;
  isLicenseRequired?: boolean;
  disclosures?: string[];
}

export interface OfferTerms {
  depositAmount: number;
  depositType: "flat" | "percentage";
  inspectionPeriod: number;
  inspectionDayType: "calendar" | "business";
  offerExpiration: number;
  closingTimeline: number;
  financingContingency: boolean;
  appraisalContingency: boolean;
  inspectionContingency: boolean;
  titleContingency: boolean;
  // Creative terms
  downPayment?: number;
  interestRate?: number;
  termMonths?: number;
  balloonMonths?: number;
  monthlyPayment?: number;
  // Subject-To specific
  existingLoanBalance?: number;
  existingPayment?: number;
  // Novation specific
  marketingPeriod?: number;
  profitSplit?: number;
}

export interface POFDocument {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  expirationDate: string;
  amount: number;
  lenderName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  signature?: string;
}

export interface TextTemplate {
  body: string;
  maxLength: number;
}

export interface LOITemplate {
  content: string;
  variables: string[];
}

export interface OfferPackage {
  id?: string;
  offerType: OfferType;
  marketType: MarketType;
  documentType: DocumentType;
  terms: OfferTerms;
  includePOF: boolean;
  pofId?: string;
  emailTemplate: EmailTemplate;
  textTemplate: TextTemplate;
  loiTemplate: LOITemplate;
  isDefault: boolean;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const OFFER_TYPE_CONFIGS: OfferTypeConfig[] = [
  {
    id: "cash",
    label: "Cash Offer",
    description: "Simple, fast closing with no financing contingencies. Most attractive to motivated sellers.",
    icon: "DollarSign",
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: ["Fast closing (7-14 days)", "No financing contingency", "Simple terms", "High acceptance rate"],
    requiresPOF: false, // POF only required for on-market (MLS) properties
  },
  {
    id: "subject_to",
    label: "Subject-To",
    description: "Take over existing mortgage payments. Great for properties with favorable loan terms.",
    icon: "Key",
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: ["No new financing needed", "Lower cash requirement", "Keep existing rate", "Flexible terms"],
    requiresPOF: false,
  },
  {
    id: "seller_financing",
    label: "Seller Financing",
    description: "Seller acts as the bank. Good for sellers wanting monthly income stream.",
    icon: "Wallet",
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: ["No bank qualification", "Flexible terms", "Win-win structure", "Monthly income for seller"],
    requiresPOF: false,
  },
  {
    id: "hybrid",
    label: "Hybrid Offer",
    description: "Cash down payment with seller financing for the balance. Best of both worlds.",
    icon: "Layers",
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: ["Cash + financing combo", "Lower cash required", "Competitive offer", "Flexible structure"],
    requiresPOF: false, // POF only required for on-market (MLS) properties
  },
  {
    id: "novation",
    label: "Novation Agreement",
    description: "Control property, market it, and split profits. No purchase until buyer found.",
    icon: "Handshake",
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: ["No upfront capital", "Profit sharing", "Marketing control", "Low risk strategy"],
    requiresPOF: false,
  },
  {
    id: "listing",
    label: "Listing Agreement",
    description: "Offer to list the seller's property on MLS. Requires real estate license.",
    icon: "Building",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    features: ["MLS exposure", "Professional marketing", "Full service", "Commission based"],
    requiresPOF: false,
    isLicenseRequired: true,
    disclosures: [
      "Agent/Broker must hold valid real estate license in property state",
      "Agency disclosure required before any property discussions",
      "Material facts must be disclosed to all parties",
      "Commission structure must be clearly stated in listing agreement",
    ],
  },
  {
    id: "referral",
    label: "Agent Referral",
    description: "Refer the lead to another licensed agent for a referral fee. Requires license.",
    icon: "UserPlus",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    features: ["Passive income", "No transaction work", "Referral fee (25-35%)", "License required"],
    requiresPOF: false,
    isLicenseRequired: true,
    disclosures: [
      "Referral fee must be disclosed and agreed upon in writing",
      "Referring agent must hold valid license",
      "Referral agreement must be signed before lead transfer",
      "Cannot receive fee if license is inactive or expired",
    ],
  },
];

export const DEFAULT_OFFER_TERMS: OfferTerms = {
  depositAmount: 1000,
  depositType: "flat",
  inspectionPeriod: 10,
  inspectionDayType: "business",
  offerExpiration: 72,
  closingTimeline: 14,
  financingContingency: false,
  appraisalContingency: false,
  inspectionContingency: true,
  titleContingency: true,
  downPayment: 10,
  interestRate: 6,
  termMonths: 360,
  balloonMonths: 60,
};

export const DEFAULT_EMAIL_TEMPLATE: EmailTemplate = {
  subject: "Cash Offer for {{property_address}}",
  body: `Dear {{seller_name}},

I hope this message finds you well. My name is {{buyer_name}}, and I am a local real estate investor interested in purchasing your property at {{property_address}}.

I am prepared to make you a cash offer of {{offer_amount}} with the following terms:

• Earnest Money Deposit: {{deposit_amount}}
• Closing Timeline: {{closing_days}} days
• No financing contingency
• Quick, hassle-free closing

I understand that selling a property can be a big decision, and I want to make this process as smooth as possible for you. I am flexible on timing and can work around your schedule.

Would you be available for a brief call to discuss this further? I am happy to answer any questions you may have.

Best regards,
{{buyer_name}}
{{buyer_phone}}
{{buyer_email}}`,
  signature: "",
};

export const DEFAULT_TEXT_TEMPLATE: TextTemplate = {
  body: "Hi {{seller_name}}! This is {{buyer_name}}. I'm interested in making a cash offer on your property at {{property_address}}. Would you be open to a quick call? Reply YES and I'll give you a ring.",
  maxLength: 160,
};

export const DEFAULT_LOI_TEMPLATE: LOITemplate = {
  content: `LETTER OF INTENT TO PURCHASE REAL ESTATE

Date: {{date}}

Dear {{seller_name}},

This Letter of Intent ("LOI") outlines the basic terms and conditions under which {{buyer_name}} ("Buyer") proposes to purchase the real property located at:

{{property_address}}
{{property_city}}, {{property_state}} {{property_zip}}

1. PURCHASE PRICE: {{offer_amount}}

2. EARNEST MONEY DEPOSIT: {{deposit_amount}}, to be deposited within {{deposit_days}} business days of acceptance.

3. INSPECTION PERIOD: {{inspection_period}} {{inspection_day_type}} days from acceptance.

4. CLOSING DATE: {{closing_days}} days from acceptance, or sooner by mutual agreement.

5. TITLE: Seller to provide marketable title, free and clear of all liens and encumbrances.

6. CONTINGENCIES:
{{contingencies}}

7. CLOSING COSTS: To be split per local custom or as negotiated.

8. POSSESSION: At closing unless otherwise agreed.

This LOI is non-binding and subject to the execution of a mutually acceptable Purchase Agreement. This offer expires on {{expiration_date}}.

Sincerely,

{{buyer_name}}
{{buyer_company}}
{{buyer_phone}}
{{buyer_email}}`,
  variables: [
    "date",
    "seller_name",
    "buyer_name",
    "buyer_company",
    "property_address",
    "property_city",
    "property_state",
    "property_zip",
    "offer_amount",
    "deposit_amount",
    "deposit_days",
    "inspection_period",
    "inspection_day_type",
    "closing_days",
    "contingencies",
    "expiration_date",
    "buyer_phone",
    "buyer_email",
  ],
};
