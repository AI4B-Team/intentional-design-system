import * as React from "react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  Home,
  Repeat,
  Building,
  Handshake,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Settings2,
  Zap,
  Target,
  BarChart3,
  PiggyBank,
  Timer,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExitStrategyTabProps {
  property: {
    id: string;
    arv?: number;
    repairs?: number;
    mortgageBalance?: number;
    mortgagePayment?: number;
    mortgageRate?: number;
    estimatedValue?: number;
    ownerName?: string;
  };
  onNavigateToUnderwriting?: () => void;
}

interface UserPreferences {
  availableCapital: number;
  desiredTimeline: "quick" | "6months" | "1year" | "longterm";
  riskTolerance: number; // 1-100
  experienceLevel: "beginner" | "intermediate" | "advanced";
  primaryGoal: "maxProfit" | "cashFlow" | "equityBuilding" | "quickTurnover";
}

interface StrategyResult {
  id: string;
  name: string;
  icon: React.ElementType;
  profitOrCashFlow: number;
  profitType: "oneTime" | "monthly";
  capitalRequired: number;
  capitalReturnedNote?: string;
  timeline: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  fitScore: number;
  pros: string[];
  cons: string[];
  applicable: boolean;
  notApplicableReason?: string;
}

interface DetailedAnalysis {
  strategy: StrategyResult;
  steps: string[];
  projections: { month: number; cashFlow?: number; equity?: number; note?: string }[];
  assumptions: string[];
  risks: string[];
  nextSteps: string[];
  documentsNeeded: string[];
}

const STORAGE_KEY = "exit-strategy-preferences";

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getRiskBadgeVariant(risk: string): "success" | "warning" | "error" {
  switch (risk) {
    case "LOW": return "success";
    case "MEDIUM": return "warning";
    case "HIGH": return "error";
    default: return "warning";
  }
}

function calculateStrategies(
  arv: number,
  repairs: number,
  preferences: UserPreferences,
  mortgageBalance?: number,
  mortgagePayment?: number
): StrategyResult[] {
  const strategies: StrategyResult[] = [];
  
  // Calculate base values
  const purchasePrice = arv * 0.7 - repairs; // MAO
  const wholesaleFee = Math.min(arv * 0.05, 15000); // Typical wholesale fee
  const flipProfit = arv - purchasePrice - repairs - (arv * 0.08); // 8% selling costs
  const rentalValue = arv * 0.008; // 0.8% of ARV as monthly rent estimate
  const cashFlowMonthly = rentalValue - (purchasePrice * 0.07 / 12) - (arv * 0.01 / 12); // Rough estimate
  
  // WHOLESALE
  const wholesaleScore = calculateFitScore("wholesale", preferences);
  strategies.push({
    id: "wholesale",
    name: "Wholesale",
    icon: Handshake,
    profitOrCashFlow: wholesaleFee,
    profitType: "oneTime",
    capitalRequired: 5000, // EMD
    timeline: "2-4 weeks",
    riskLevel: "LOW",
    fitScore: wholesaleScore,
    pros: [
      "No capital needed beyond EMD",
      "Quick turnaround (2-4 weeks)",
      "No rehab risk or management",
      "Learn the market with low stakes"
    ],
    cons: [
      "Lowest profit potential",
      "Need buyer lined up quickly",
      "Assignment fee limits in some markets",
      "Reputation risk if deal falls through"
    ],
    applicable: true,
  });

  // FIX & FLIP
  const flipScore = calculateFitScore("flip", preferences);
  const flipCapitalNeeded = purchasePrice * 0.2 + repairs; // 20% down + repairs
  strategies.push({
    id: "flip",
    name: "Fix & Flip",
    icon: TrendingUp,
    profitOrCashFlow: flipProfit,
    profitType: "oneTime",
    capitalRequired: flipCapitalNeeded,
    timeline: "4-6 months",
    riskLevel: "MEDIUM",
    fitScore: flipScore,
    pros: [
      "Highest one-time profit potential",
      "Forced appreciation through improvements",
      "Builds contractor relationships",
      "Tangible value creation"
    ],
    cons: [
      "Requires significant capital",
      "Rehab cost overruns common",
      "Market timing risk",
      "Holding costs add up quickly"
    ],
    applicable: preferences.availableCapital >= flipCapitalNeeded * 0.5,
    notApplicableReason: preferences.availableCapital < flipCapitalNeeded * 0.5 
      ? "Insufficient capital for down payment and repairs" 
      : undefined,
  });

  // BRRRR
  const brrrrScore = calculateFitScore("brrrr", preferences);
  const brrrrCapital = purchasePrice * 0.2 + repairs;
  const refiValue = arv * 0.75; // 75% LTV refi
  const capitalReturned = refiValue - purchasePrice;
  const brrrrCashFlow = rentalValue - (refiValue * 0.07 / 12) - (arv * 0.01 / 12);
  strategies.push({
    id: "brrrr",
    name: "BRRRR",
    icon: Repeat,
    profitOrCashFlow: Math.max(0, brrrrCashFlow),
    profitType: "monthly",
    capitalRequired: brrrrCapital,
    capitalReturnedNote: `${formatCurrency(Math.max(0, capitalReturned))} returned at refi`,
    timeline: "6-12 months to stabilize",
    riskLevel: "MEDIUM",
    fitScore: brrrrScore,
    pros: [
      "Recycle capital for next deal",
      "Build long-term portfolio",
      "Combines flipping and rental benefits",
      "Forced appreciation + cash flow"
    ],
    cons: [
      "Complex execution",
      "Refi not guaranteed",
      "Requires accurate ARV estimation",
      "Two-phase project management"
    ],
    applicable: preferences.experienceLevel !== "beginner",
    notApplicableReason: preferences.experienceLevel === "beginner" 
      ? "Recommended for investors with prior experience" 
      : undefined,
  });

  // BUY & HOLD
  const holdScore = calculateFitScore("hold", preferences);
  const downPayment = purchasePrice * 0.25;
  strategies.push({
    id: "hold",
    name: "Buy & Hold (Rental)",
    icon: Building,
    profitOrCashFlow: Math.max(0, cashFlowMonthly),
    profitType: "monthly",
    capitalRequired: downPayment + repairs,
    timeline: "Long-term (5+ years)",
    riskLevel: "LOW",
    fitScore: holdScore,
    pros: [
      "Predictable monthly income",
      "Long-term appreciation",
      "Tax advantages (depreciation)",
      "Equity building through paydown"
    ],
    cons: [
      "Capital locked long-term",
      "Property management required",
      "Tenant/vacancy risk",
      "Maintenance ongoing"
    ],
    applicable: true,
  });

  // SUBJECT-TO
  const subToApplicable = !!mortgageBalance && mortgageBalance > 0;
  const subToScore = calculateFitScore("subto", preferences);
  const subToCashFlow = rentalValue - (mortgagePayment || 0) - (arv * 0.005 / 12);
  strategies.push({
    id: "subto",
    name: "Subject-To",
    icon: FileText,
    profitOrCashFlow: Math.max(0, subToCashFlow),
    profitType: "monthly",
    capitalRequired: 10000, // Closing costs + reserves
    timeline: "Immediate cash flow",
    riskLevel: "MEDIUM",
    fitScore: subToApplicable ? subToScore : 0,
    pros: [
      "Little capital required",
      "Immediate cash flow",
      "No traditional financing needed",
      "Take over favorable loan terms"
    ],
    cons: [
      "Due-on-sale clause risk",
      "Seller must agree to structure",
      "Complex legal documentation",
      "Insurance considerations"
    ],
    applicable: subToApplicable,
    notApplicableReason: !subToApplicable 
      ? "Requires existing mortgage data" 
      : undefined,
  });

  // SELLER FINANCE
  const sellerFinanceScore = calculateFitScore("sellerfinance", preferences);
  const estimatedEquity = arv - (mortgageBalance || purchasePrice * 0.5);
  const sellerFinanceApplicable = estimatedEquity > arv * 0.3;
  const monthlyPayment = purchasePrice * 0.006; // ~7% over 30 years roughly
  strategies.push({
    id: "sellerfinance",
    name: "Seller Finance",
    icon: Home,
    profitOrCashFlow: rentalValue - monthlyPayment - (arv * 0.005 / 12),
    profitType: "monthly",
    capitalRequired: purchasePrice * 0.1, // 10% down typically
    timeline: "Varies by terms",
    riskLevel: "LOW",
    fitScore: sellerFinanceApplicable ? sellerFinanceScore : 0,
    pros: [
      "Flexible terms negotiable",
      "No bank qualification needed",
      "Lower closing costs",
      "Win-win with motivated seller"
    ],
    cons: [
      "Seller must agree",
      "Usually higher rate than banks",
      "Balloon payments common",
      "Limited to equity-rich sellers"
    ],
    applicable: sellerFinanceApplicable,
    notApplicableReason: !sellerFinanceApplicable 
      ? "Seller needs significant equity for this strategy" 
      : undefined,
  });

  // Sort by fit score descending
  return strategies.sort((a, b) => b.fitScore - a.fitScore);
}

function calculateFitScore(
  strategyId: string,
  preferences: UserPreferences
): number {
  let score = 50; // Base score
  
  const { desiredTimeline, riskTolerance, primaryGoal, experienceLevel, availableCapital } = preferences;
  
  switch (strategyId) {
    case "wholesale":
      if (desiredTimeline === "quick") score += 25;
      if (primaryGoal === "quickTurnover") score += 20;
      if (riskTolerance < 40) score += 15;
      if (experienceLevel === "beginner") score += 10;
      if (availableCapital < 20000) score += 15;
      break;
      
    case "flip":
      if (primaryGoal === "maxProfit") score += 25;
      if (desiredTimeline === "6months") score += 15;
      if (riskTolerance > 50) score += 10;
      if (experienceLevel !== "beginner") score += 10;
      if (availableCapital >= 50000) score += 10;
      break;
      
    case "brrrr":
      if (primaryGoal === "equityBuilding") score += 25;
      if (desiredTimeline === "1year") score += 15;
      if (riskTolerance > 40 && riskTolerance < 70) score += 10;
      if (experienceLevel === "advanced") score += 15;
      if (availableCapital >= 75000) score += 10;
      break;
      
    case "hold":
      if (primaryGoal === "cashFlow") score += 25;
      if (desiredTimeline === "longterm") score += 20;
      if (riskTolerance < 50) score += 10;
      if (experienceLevel !== "beginner") score += 5;
      break;
      
    case "subto":
      if (primaryGoal === "cashFlow") score += 15;
      if (desiredTimeline === "quick" || desiredTimeline === "6months") score += 10;
      if (riskTolerance > 50) score += 10;
      if (experienceLevel === "advanced") score += 20;
      if (availableCapital < 30000) score += 15;
      break;
      
    case "sellerfinance":
      if (primaryGoal === "cashFlow") score += 15;
      if (riskTolerance < 60) score += 10;
      if (experienceLevel !== "beginner") score += 10;
      if (availableCapital < 50000) score += 10;
      break;
  }
  
  return Math.min(100, Math.max(0, score));
}

function generateDetailedAnalysis(
  strategy: StrategyResult,
  arv: number,
  repairs: number,
  preferences: UserPreferences
): DetailedAnalysis {
  const purchasePrice = arv * 0.7 - repairs;
  
  const baseAnalysis: DetailedAnalysis = {
    strategy,
    steps: [],
    projections: [],
    assumptions: [],
    risks: [],
    nextSteps: [],
    documentsNeeded: [],
  };
  
  switch (strategy.id) {
    case "wholesale":
      return {
        ...baseAnalysis,
        steps: [
          "Get property under contract with assignment clause",
          "Order title search and verify clear title",
          "Market deal to cash buyer list",
          "Negotiate assignment fee with end buyer",
          "Assign contract and collect fee at closing",
        ],
        projections: [
          { month: 1, note: "Property under contract, marketing to buyers" },
          { month: 1, cashFlow: strategy.profitOrCashFlow, note: "Deal closes, assignment fee collected" },
        ],
        assumptions: [
          `Purchase price: ${formatCurrency(purchasePrice)}`,
          `Assignment fee: ${formatCurrency(strategy.profitOrCashFlow)}`,
          "Buyer closes within 2-4 weeks",
          "Clean title with no major issues",
        ],
        risks: [
          "Buyer backs out at last minute",
          "Title issues discovered",
          "Seller changes mind",
          "Market conditions shift during contract period",
        ],
        nextSteps: [
          "Submit offer with assignment clause",
          "Prepare buyer marketing materials",
          "Reach out to top 5 cash buyers",
          "Order preliminary title report",
        ],
        documentsNeeded: [
          "Purchase and Sale Agreement (with assignment clause)",
          "Assignment of Contract",
          "Earnest Money Deposit",
          "Property disclosure (if required)",
        ],
      };
      
    case "flip":
      const flipMonths = 5;
      return {
        ...baseAnalysis,
        steps: [
          "Secure financing (hard money or private)",
          "Close on property",
          "Create detailed scope of work",
          "Hire and manage contractors",
          "Complete renovations",
          "Stage and list property",
          "Sell to retail buyer",
        ],
        projections: [
          { month: 1, cashFlow: -strategy.capitalRequired, note: "Purchase and begin rehab" },
          { month: 2, cashFlow: -(repairs * 0.4), note: "Rehab in progress" },
          { month: 3, cashFlow: -(repairs * 0.4), note: "Rehab completing" },
          { month: 4, note: "Property listed, showings begin" },
          { month: 5, cashFlow: strategy.profitOrCashFlow, note: "Property sold, profit realized" },
        ],
        assumptions: [
          `Purchase price: ${formatCurrency(purchasePrice)}`,
          `Repair costs: ${formatCurrency(repairs)}`,
          `ARV: ${formatCurrency(arv)}`,
          "Selling costs at 8% of ARV",
          `Holding costs: ${formatCurrency(purchasePrice * 0.01 * flipMonths)} for ${flipMonths} months`,
        ],
        risks: [
          "Rehab costs exceed estimates",
          "Extended timeline increases holding costs",
          "Market shifts during renovation",
          "Contractor reliability issues",
          "Unexpected structural/mechanical issues",
        ],
        nextSteps: [
          "Get 3 contractor bids on scope of work",
          "Apply for hard money loan",
          "Create detailed project timeline",
          "Identify backup exit (rental) if market softens",
        ],
        documentsNeeded: [
          "Purchase Agreement",
          "Proof of Funds / Loan Approval",
          "Scope of Work",
          "Contractor Agreements",
          "Insurance (Builder's Risk)",
          "Permits (as required)",
        ],
      };
      
    case "brrrr":
      return {
        ...baseAnalysis,
        steps: [
          "Buy property with hard money or cash",
          "Rehab to rental-ready condition",
          "Rent to qualified tenant",
          "Refinance with conventional lender",
          "Repeat with recovered capital",
        ],
        projections: [
          { month: 1, cashFlow: -strategy.capitalRequired, equity: 0, note: "Purchase and begin rehab" },
          { month: 3, equity: repairs, note: "Rehab complete, value added" },
          { month: 4, cashFlow: strategy.profitOrCashFlow, note: "Tenant placed, cash flowing" },
          { month: 6, note: "Seasoning period for refi" },
          { month: 8, cashFlow: parseFloat(strategy.capitalReturnedNote?.replace(/[^0-9.-]/g, '') || '0'), note: "Refinance complete, capital returned" },
        ],
        assumptions: [
          `Purchase: ${formatCurrency(purchasePrice)}`,
          `Rehab: ${formatCurrency(repairs)}`,
          `ARV: ${formatCurrency(arv)}`,
          "75% LTV refinance",
          "6-month seasoning requirement",
        ],
        risks: [
          "Appraisal comes in lower than expected",
          "Interest rates rise before refi",
          "Tenant placement takes longer",
          "Rehab costs overrun",
        ],
        nextSteps: [
          "Confirm refi lender requirements",
          "Create rent-ready scope of work",
          "Research market rents for comps",
          "Build property management relationship",
        ],
        documentsNeeded: [
          "Purchase Agreement",
          "Hard Money Loan Documents",
          "Contractor Scope of Work",
          "Rental License / Permits",
          "Lease Agreement Template",
          "Refinance Application",
        ],
      };
      
    default:
      return {
        ...baseAnalysis,
        steps: ["Contact for personalized strategy plan"],
        projections: [],
        assumptions: ["Based on current market conditions"],
        risks: ["Market fluctuations"],
        nextSteps: ["Schedule consultation"],
        documentsNeeded: ["Purchase Agreement"],
      };
  }
}

export function ExitStrategyTab({ property, onNavigateToUnderwriting }: ExitStrategyTabProps) {
  const [preferencesOpen, setPreferencesOpen] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      availableCapital: 50000,
      desiredTimeline: "6months",
      riskTolerance: 50,
      experienceLevel: "intermediate",
      primaryGoal: "maxProfit",
    };
  });
  const [strategies, setStrategies] = useState<StrategyResult[] | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<DetailedAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const hasRequiredData = property.arv && property.repairs;
  const arv = property.arv || 0;
  const repairs = property.repairs || 0;

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate analysis delay for UX
    setTimeout(() => {
      const results = calculateStrategies(
        arv,
        repairs,
        preferences,
        property.mortgageBalance,
        property.mortgagePayment
      );
      setStrategies(results);
      setIsAnalyzing(false);
    }, 800);
  };

  const handleViewAnalysis = (strategy: StrategyResult) => {
    const detailed = generateDetailedAnalysis(strategy, arv, repairs, preferences);
    setSelectedStrategy(detailed);
  };

  const topStrategy = strategies?.[0];
  const secondStrategy = strategies?.[1];

  if (!hasRequiredData) {
    return (
      <div className="p-lg">
        <Card variant="default" padding="lg" className="text-center max-w-md mx-auto">
          <div className="mb-4">
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <h2 className="text-h3 font-semibold text-content mb-2">Missing Property Data</h2>
            <p className="text-small text-content-secondary">
              Add ARV and repair estimates to see exit strategy analysis
            </p>
          </div>
          <Button variant="primary" onClick={onNavigateToUnderwriting}>
            Go to Underwriting Tab
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-lg space-y-lg">
      {/* User Preferences Panel */}
      <Collapsible open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <Card variant="default" padding="md">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-content-tertiary" />
                <h2 className="text-h3 font-semibold text-content">Your Investment Preferences</h2>
              </div>
              {preferencesOpen ? (
                <ChevronUp className="h-5 w-5 text-content-tertiary" />
              ) : (
                <ChevronDown className="h-5 w-5 text-content-tertiary" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {/* Available Capital */}
              <div>
                <Label className="text-small text-content-secondary">Available Capital</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={preferences.availableCapital}
                    onChange={(e) => setPreferences({ ...preferences, availableCapital: parseInt(e.target.value) || 0 })}
                    className="pl-9"
                    placeholder="50000"
                  />
                </div>
              </div>

              {/* Desired Timeline */}
              <div>
                <Label className="text-small text-content-secondary">Desired Timeline</Label>
                <Select
                  value={preferences.desiredTimeline}
                  onValueChange={(v) => setPreferences({ ...preferences, desiredTimeline: v as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="quick">Quick Flip (1-2 months)</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="longterm">Long-term Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level */}
              <div>
                <Label className="text-small text-content-secondary">Experience Level</Label>
                <Select
                  value={preferences.experienceLevel}
                  onValueChange={(v) => setPreferences({ ...preferences, experienceLevel: v as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="beginner">Beginner (0-2 deals)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (3-10 deals)</SelectItem>
                    <SelectItem value="advanced">Advanced (10+ deals)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Primary Goal */}
              <div>
                <Label className="text-small text-content-secondary">Primary Goal</Label>
                <Select
                  value={preferences.primaryGoal}
                  onValueChange={(v) => setPreferences({ ...preferences, primaryGoal: v as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="maxProfit">Maximum Profit</SelectItem>
                    <SelectItem value="cashFlow">Cash Flow</SelectItem>
                    <SelectItem value="equityBuilding">Equity Building</SelectItem>
                    <SelectItem value="quickTurnover">Quick Turnover</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Risk Tolerance */}
              <div className="md:col-span-2">
                <Label className="text-small text-content-secondary">
                  Risk Tolerance: {preferences.riskTolerance < 35 ? "Conservative" : preferences.riskTolerance < 65 ? "Moderate" : "Aggressive"}
                </Label>
                <div className="flex items-center gap-3 mt-2">
                  <Shield className="h-4 w-4 text-success" />
                  <Slider
                    value={[preferences.riskTolerance]}
                    onValueChange={([v]) => setPreferences({ ...preferences, riskTolerance: v })}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <Zap className="h-4 w-4 text-destructive" />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border-subtle">
              <Button 
                variant="primary" 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                icon={isAnalyzing ? undefined : <Sparkles />}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Exit Strategies"}
              </Button>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* AI Recommendation */}
      {topStrategy && (
        <Card variant="default" padding="md" className="bg-brand/5 border-brand/20">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <div className="flex-1">
              <h3 className="text-body font-semibold text-content mb-1">
                AI Recommendation: {topStrategy.name}
              </h3>
              <p className="text-small text-content-secondary mb-3">
                For THIS deal, based on your preferences, we recommend <strong>{topStrategy.name}</strong>.
              </p>
              <div className="space-y-1 text-small text-content-secondary">
                <p>• Your goal of "{preferences.primaryGoal.replace(/([A-Z])/g, ' $1').trim()}" aligns well with this strategy</p>
                <p>• Fits your {preferences.desiredTimeline === "quick" ? "quick" : preferences.desiredTimeline} timeline</p>
                <p>• Capital requirement ({formatCurrency(topStrategy.capitalRequired)}) is within your budget</p>
              </div>
              {secondStrategy && (
                <p className="text-small text-content-tertiary mt-3 italic">
                  This is our #1 pick, but <strong>{secondStrategy.name}</strong> (score: {secondStrategy.fitScore}/100) is a close second if you want {secondStrategy.id === "wholesale" ? "lower risk" : secondStrategy.id === "hold" ? "passive income" : "different terms"}.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Strategy Comparison Grid */}
      {strategies && (
        <div>
          <h2 className="text-h3 font-semibold text-content mb-4">Strategy Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {strategies.map((strategy) => {
              const Icon = strategy.icon;
              const isTop = strategy.id === topStrategy?.id;
              
              return (
                <Card 
                  key={strategy.id} 
                  variant="default" 
                  padding="md"
                  className={cn(
                    "relative transition-all",
                    isTop && "ring-2 ring-brand",
                    !strategy.applicable && "opacity-60"
                  )}
                >
                  {isTop && (
                    <Badge variant="info" size="sm" className="absolute -top-2 -right-2">
                      Best Fit
                    </Badge>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      "h-8 w-8 rounded-medium flex items-center justify-center",
                      isTop ? "bg-brand/10" : "bg-muted"
                    )}>
                      <Icon className={cn("h-4 w-4", isTop ? "text-brand" : "text-muted-foreground")} />
                    </div>
                    <h3 className="text-body font-semibold text-content">{strategy.name}</h3>
                  </div>

                  {!strategy.applicable && (
                    <div className="mb-3 p-2 bg-warning/10 rounded-small text-tiny text-warning">
                      {strategy.notApplicableReason}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-small">
                      <span className="text-content-secondary">
                        {strategy.profitType === "oneTime" ? "Profit Potential" : "Cash Flow"}
                      </span>
                      <span className="font-semibold text-success">
                        {formatCurrency(strategy.profitOrCashFlow)}
                        {strategy.profitType === "monthly" && "/mo"}
                      </span>
                    </div>
                    <div className="flex justify-between text-small">
                      <span className="text-content-secondary">Capital Required</span>
                      <span className="font-medium text-content">{formatCurrency(strategy.capitalRequired)}</span>
                    </div>
                    {strategy.capitalReturnedNote && (
                      <p className="text-tiny text-content-tertiary italic">{strategy.capitalReturnedNote}</p>
                    )}
                    <div className="flex justify-between text-small">
                      <span className="text-content-secondary">Timeline</span>
                      <span className="font-medium text-content">{strategy.timeline}</span>
                    </div>
                    <div className="flex justify-between text-small items-center">
                      <span className="text-content-secondary">Risk Level</span>
                      <Badge variant={getRiskBadgeVariant(strategy.riskLevel)} size="sm">
                        {strategy.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-small items-center">
                      <span className="text-content-secondary">Your Fit Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              strategy.fitScore >= 70 ? "bg-success" : strategy.fitScore >= 50 ? "bg-warning" : "bg-destructive"
                            )}
                            style={{ width: `${strategy.fitScore}%` }}
                          />
                        </div>
                        <span className="font-semibold text-content">{strategy.fitScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-tiny font-medium text-success mb-1">Pros</p>
                      <ul className="space-y-0.5">
                        {strategy.pros.slice(0, 2).map((pro, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-tiny text-content-secondary">
                            <CheckCircle2 className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-tiny font-medium text-destructive mb-1">Cons</p>
                      <ul className="space-y-0.5">
                        {strategy.cons.slice(0, 2).map((con, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-tiny text-content-secondary">
                            <XCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewAnalysis(strategy)}
                    disabled={!strategy.applicable}
                    icon={<ArrowRight className="h-4 w-4" />}
                  >
                    View Full Analysis
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Analysis Modal */}
      <Dialog open={!!selectedStrategy} onOpenChange={() => setSelectedStrategy(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
          {selectedStrategy && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <selectedStrategy.strategy.icon className="h-5 w-5 text-brand" />
                  {selectedStrategy.strategy.name} - Full Analysis
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card variant="default" padding="sm" className="text-center">
                    <p className="text-tiny text-content-tertiary">Profit/Cash Flow</p>
                    <p className="text-h3 font-bold text-success">
                      {formatCurrency(selectedStrategy.strategy.profitOrCashFlow)}
                      {selectedStrategy.strategy.profitType === "monthly" && <span className="text-small">/mo</span>}
                    </p>
                  </Card>
                  <Card variant="default" padding="sm" className="text-center">
                    <p className="text-tiny text-content-tertiary">Capital Needed</p>
                    <p className="text-h3 font-bold text-content">
                      {formatCurrency(selectedStrategy.strategy.capitalRequired)}
                    </p>
                  </Card>
                  <Card variant="default" padding="sm" className="text-center">
                    <p className="text-tiny text-content-tertiary">Timeline</p>
                    <p className="text-body font-bold text-content">{selectedStrategy.strategy.timeline}</p>
                  </Card>
                  <Card variant="default" padding="sm" className="text-center">
                    <p className="text-tiny text-content-tertiary">Risk</p>
                    <Badge variant={getRiskBadgeVariant(selectedStrategy.strategy.riskLevel)} size="md">
                      {selectedStrategy.strategy.riskLevel}
                    </Badge>
                  </Card>
                </div>

                {/* Implementation Steps */}
                <div>
                  <h3 className="text-small font-semibold text-content mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Step-by-Step Implementation
                  </h3>
                  <ol className="space-y-2">
                    {selectedStrategy.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-small text-content-secondary">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-brand/10 text-brand text-tiny font-semibold flex items-center justify-center">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Projections */}
                {selectedStrategy.projections.length > 0 && (
                  <div>
                    <h3 className="text-small font-semibold text-content mb-2 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Timeline & Projections
                    </h3>
                    <div className="space-y-2">
                      {selectedStrategy.projections.map((proj, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-muted/30 rounded-small">
                          <span className="text-tiny font-medium text-content-tertiary w-16">
                            Month {proj.month}
                          </span>
                          {proj.cashFlow !== undefined && (
                            <span className={cn(
                              "text-small font-semibold",
                              proj.cashFlow >= 0 ? "text-success" : "text-destructive"
                            )}>
                              {formatCurrency(proj.cashFlow)}
                            </span>
                          )}
                          <span className="text-small text-content-secondary">{proj.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assumptions */}
                <div>
                  <h3 className="text-small font-semibold text-content mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Assumptions
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {selectedStrategy.assumptions.map((a, i) => (
                      <li key={i} className="text-tiny text-content-secondary flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-content-tertiary" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div>
                  <h3 className="text-small font-semibold text-content mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Risk Factors
                  </h3>
                  <ul className="space-y-1">
                    {selectedStrategy.risks.map((r, i) => (
                      <li key={i} className="text-small text-content-secondary flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="text-small font-semibold text-content mb-2 flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Required Next Steps
                  </h3>
                  <ul className="space-y-1">
                    {selectedStrategy.nextSteps.map((s, i) => (
                      <li key={i} className="text-small text-content-secondary flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Documents Needed */}
                <div>
                  <h3 className="text-small font-semibold text-content mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents/Contracts Needed
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStrategy.documentsNeeded.map((d, i) => (
                      <Badge key={i} variant="secondary" size="sm">{d}</Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border-subtle">
                  <Button variant="ghost" onClick={() => setSelectedStrategy(null)}>
                    Close
                  </Button>
                  <Button variant="primary" icon={<CheckCircle2 />}>
                    Apply This Strategy
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
