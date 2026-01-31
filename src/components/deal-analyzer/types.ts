export type CalculatorType = "flip" | "wholesale" | "rental" | "brrrr" | "str";

export interface CalculatorOption {
  id: CalculatorType;
  name: string;
  description: string;
  icon: string;
  color: string;
  metrics: string[];
}

export interface DealInput {
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  askingPrice: number;
  arv?: number;
  repairEstimate?: number;
  propertyType: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  monthlyRent?: number;
  notes?: string;
}

export interface AnalysisReport {
  calculator: CalculatorType;
  verdict: "strong" | "moderate" | "weak" | "pass";
  score: number;
  confidence: number;
  summary: string;
  
  // Financial Metrics
  estimatedProfit: number;
  roi: number;
  cashOnCash?: number;
  capRate?: number;
  monthlyCashFlow?: number;
  maxOffer: number;
  
  // Strategy-specific
  assignmentFee?: number;
  holdingCosts?: number;
  closingCosts?: number;
  refiAmount?: number;
  cashOutRefi?: number;
  strRevenue?: number;
  occupancyRate?: number;
  
  // Analysis
  pros: string[];
  cons: string[];
  recommendation: string;
  riskLevel: "Low" | "Medium" | "High";
  
  // Comps
  compsUsed?: number;
  arvEstimate?: number;
  rentEstimate?: number;
}

export const CALCULATOR_OPTIONS: CalculatorOption[] = [
  {
    id: "flip",
    name: "Fix & Flip",
    description: "Analyze rehab projects with profit projections and holding costs",
    icon: "Hammer",
    color: "from-orange-500 to-amber-500",
    metrics: ["ARV", "Repairs", "Profit", "ROI"],
  },
  {
    id: "wholesale",
    name: "Wholesale",
    description: "Calculate MAO and assignment fees for quick flips",
    icon: "Handshake",
    color: "from-blue-500 to-cyan-500",
    metrics: ["MAO", "Assignment Fee", "Buyer ROI"],
  },
  {
    id: "rental",
    name: "Long-Term Rental",
    description: "Cash flow analysis with cap rate and cash-on-cash returns",
    icon: "Building",
    color: "from-green-500 to-emerald-500",
    metrics: ["Cash Flow", "Cap Rate", "CoC ROI"],
  },
  {
    id: "brrrr",
    name: "BRRRR",
    description: "Buy, Rehab, Rent, Refinance, Repeat strategy analysis",
    icon: "RefreshCw",
    color: "from-purple-500 to-violet-500",
    metrics: ["Cash Out", "Equity", "Cash Flow"],
  },
  {
    id: "str",
    name: "Short-Term Rental",
    description: "Airbnb/VRBO revenue projections with seasonality analysis",
    icon: "Plane",
    color: "from-pink-500 to-rose-500",
    metrics: ["Revenue", "Occupancy", "Net Income"],
  },
];
