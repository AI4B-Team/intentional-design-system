// Types for the Deal Intelligence Analyzer

export interface DealIntelligenceComp {
  address: string;
  salePrice: number;
  saleDate: string;
  sqft: number;
  beds: number;
  baths: number;
  distanceMiles: number;
  similarity: number;
}

export interface DealStrategy {
  name: string;
  score: number;
  projectedProfit: number;
  offerPrice: number;
  closeTimeline: string;
  riskLevel: "Low" | "Medium" | "High";
  monthlyPayment: number | null;
  cashNeeded: number;
  whyItWorks: string;
  dealNumbers: {
    purchasePrice: number;
    repairCosts: number;
    holdingCosts: number;
    sellingCosts: number;
    totalInvestment: number;
    exitPrice: number;
    netProfit: number;
  };
  sellerPitch: string;
}

export interface DealIntelligenceResult {
  propertyProfile: {
    estimatedValue: number;
    beds: number;
    baths: number;
    sqft: number;
    yearBuilt: number;
    propertyType: string;
    neighborhood: string;
    marketTrend: "appreciating" | "stable" | "declining";
  };
  arvAnalysis: {
    arvEstimate: number;
    confidence: number;
    pricePerSqft: number;
    comps: DealIntelligenceComp[];
  };
  mortgageEstimate: {
    estimatedBalance: number;
    estimatedPayment: number;
    estimatedRate: number;
    loanType: string;
  };
  strategies: DealStrategy[];
  overallVerdict: "strong" | "moderate" | "weak" | "pass";
  overallScore: number;
  summary: string;
}

export interface EditableMetrics {
  arv: number;
  asIsValue: number;
  mortgageBalance: number;
  repairEstimate: number;
}
