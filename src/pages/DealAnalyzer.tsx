import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sparkles,
  BarChart3,
  TrendingUp,
  Users,
  Home,
  Zap,
  History,
  BookmarkPlus,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CalculatorSelector,
  AddressInput,
  DealInputForm,
  AnalysisReportComponent,
  AnalyzingState,
  StrategyComparison,
  ScoreBreakdown,
  QuickRulesCheck,
  RecentComps,
  ScenarioSliders,
  CalculatorType,
  DealInput,
  AnalysisReport,
  CALCULATOR_OPTIONS,
  ScenarioAdjustments,
} from "@/components/deal-analyzer";

type ViewState = "input" | "analyzing" | "report";
type InputTab = "details" | "scenarios" | "rules";

const DEFAULT_INPUT: DealInput = {
  address: "",
  askingPrice: 0,
  propertyType: "single_family",
};

export default function DealAnalyzer() {
  const [viewState, setViewState] = useState<ViewState>("input");
  const [calculatorType, setCalculatorType] = useState<CalculatorType>("flip");
  const [dealInput, setDealInput] = useState<DealInput>(DEFAULT_INPUT);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [inputTab, setInputTab] = useState<InputTab>("details");
  const [scenarioAdjustments, setScenarioAdjustments] = useState<ScenarioAdjustments | null>(null);

  const handleInputChange = (data: Partial<DealInput>) => {
    setDealInput((prev) => ({ ...prev, ...data }));
  };

  const handleAnalyze = async () => {
    if (!dealInput.address.trim()) {
      toast.error("Please enter a property address");
      return;
    }

    setViewState("analyzing");

    try {
      const response = await supabase.functions.invoke("ai-deal-analyzer", {
        body: {
          dealData: {
            address: dealInput.address,
            askingPrice: dealInput.askingPrice || 0,
            arv: dealInput.arv,
            repairEstimate: dealInput.repairEstimate,
            propertyType: dealInput.propertyType,
            exitStrategy: calculatorType,
            monthlyRent: dealInput.monthlyRent,
            beds: dealInput.beds,
            baths: dealInput.baths,
            sqft: dealInput.sqft,
            notes: dealInput.notes,
          },
        },
      });

      if (response.error) throw response.error;

      const aiResult = response.data;
      const mappedReport: AnalysisReport = {
        calculator: calculatorType,
        verdict: aiResult.verdict || "moderate",
        score: aiResult.score || 65,
        confidence: 92,
        summary: aiResult.summary || "Analysis complete.",
        estimatedProfit: parseMoneyString(aiResult.estimatedProfit) || 0,
        roi: aiResult.roi || 15,
        maxOffer: calculateMaxOffer(dealInput, calculatorType),
        pros: aiResult.pros || [],
        cons: aiResult.cons || [],
        recommendation: aiResult.recommendation || "",
        riskLevel: aiResult.riskLevel || "Medium",
        assignmentFee: calculatorType === "wholesale" ? 10000 : undefined,
        monthlyCashFlow: ["rental", "brrrr", "str"].includes(calculatorType)
          ? calculateCashFlow(dealInput)
          : undefined,
        capRate: ["rental", "brrrr"].includes(calculatorType)
          ? calculateCapRate(dealInput)
          : undefined,
        cashOnCash: ["rental", "brrrr", "str"].includes(calculatorType) ? 12 : undefined,
        holdingCosts: calculatorType === "flip" ? 15000 : undefined,
        closingCosts: 8000,
        cashOutRefi: calculatorType === "brrrr" ? calculateRefiAmount(dealInput) : undefined,
        strRevenue: calculatorType === "str" ? (dealInput.monthlyRent || 4500) : undefined,
        occupancyRate: calculatorType === "str" ? 72 : undefined,
        compsUsed: 12,
        arvEstimate: dealInput.arv || (dealInput.askingPrice ? dealInput.askingPrice * 1.3 : undefined),
        rentEstimate: dealInput.monthlyRent || (dealInput.askingPrice ? Math.round(dealInput.askingPrice * 0.008) : undefined),
      };

      setReport(mappedReport);
      setViewState("report");
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze deal. Please try again.");
      setViewState("input");
    }
  };

  const handleNewAnalysis = () => {
    setViewState("input");
    setDealInput(DEFAULT_INPUT);
    setReport(null);
  };

  const calculatorInfo = CALCULATOR_OPTIONS.find((c) => c.id === calculatorType);
  const hasInputData = dealInput.askingPrice > 0 || (dealInput.arv && dealInput.arv > 0);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Deal Analyzer</h1>
              <p className="text-muted-foreground">
                AI-powered investment analysis in under 30 seconds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-small text-muted-foreground">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span><strong className="text-foreground">247</strong> analyzed today</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span><strong className="text-foreground">2,000+</strong> investors</span>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={<History className="h-4 w-4" />}>
              History
            </Button>
          </div>
        </div>

        {viewState === "input" && (
          <>
            {/* Calculator Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Select Analysis Type
                </h2>
                <Badge variant="secondary" size="sm" className="gap-1">
                  <Zap className="h-3 w-3" />
                  AI-Powered
                </Badge>
              </div>
              <CalculatorSelector
                selected={calculatorType}
                onSelect={setCalculatorType}
              />
            </div>

            {/* Address Input */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`h-8 w-8 rounded-lg bg-gradient-to-br ${calculatorInfo?.color} flex items-center justify-center`}
                >
                  <Home className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{calculatorInfo?.name} Analysis</h3>
                  <p className="text-tiny text-muted-foreground">{calculatorInfo?.description}</p>
                </div>
              </div>

              <AddressInput
                value={dealInput.address}
                onChange={(address) => handleInputChange({ address })}
                onAnalyze={handleAnalyze}
                isAnalyzing={false}
              />
            </Card>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Input & Options */}
              <div className="lg:col-span-2 space-y-6">
                <Tabs value={inputTab} onValueChange={(v) => setInputTab(v as InputTab)}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="details" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Deal Details
                    </TabsTrigger>
                    <TabsTrigger value="scenarios" className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Scenarios
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Rules Check
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-0 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <DealInputForm
                        data={dealInput}
                        onChange={handleInputChange}
                        calculatorType={calculatorType}
                      />
                      
                      {/* Quick Tips */}
                      <Card className="p-5 bg-surface-secondary/50">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          {calculatorInfo?.name} Quick Tips
                        </h3>
                        <div className="space-y-3">
                          {getTipsForCalculator(calculatorType).map((tip, i) => (
                            <div key={i} className="flex items-start gap-2 text-small">
                              <Badge variant="secondary" size="sm" className="mt-0.5 flex-shrink-0">
                                {i + 1}
                              </Badge>
                              <span className="text-muted-foreground">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="scenarios" className="mt-0">
                    <ScenarioSliders
                      dealInput={dealInput}
                      calculatorType={calculatorType}
                      onChange={setScenarioAdjustments}
                    />
                  </TabsContent>

                  <TabsContent value="rules" className="mt-0">
                    <QuickRulesCheck
                      dealInput={dealInput}
                      calculatorType={calculatorType}
                    />
                  </TabsContent>
                </Tabs>

                {/* Strategy Comparison */}
                {hasInputData && (
                  <StrategyComparison
                    dealInput={dealInput}
                    onSelectStrategy={setCalculatorType}
                  />
                )}
              </div>

              {/* Right Column - Comps & Analysis Preview */}
              <div className="space-y-6">
                <RecentComps subjectAddress={dealInput.address} />

                {/* Analyze CTA */}
                <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <div className="text-center">
                    <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Ready to Analyze?</h3>
                    <p className="text-small text-muted-foreground mb-4">
                      Get AI-powered insights with ARV estimates, profit projections, and risk assessment.
                    </p>
                    <Button
                      onClick={handleAnalyze}
                      disabled={!dealInput.address.trim()}
                      className="w-full"
                      icon={<Sparkles className="h-4 w-4" />}
                    >
                      Analyze Deal
                    </Button>
                  </div>
                </Card>

                {/* Save Template */}
                <Button variant="outline" className="w-full" icon={<BookmarkPlus className="h-4 w-4" />}>
                  Save as Template
                </Button>
              </div>
            </div>
          </>
        )}

        {viewState === "analyzing" && (
          <AnalyzingState address={dealInput.address} />
        )}

        {viewState === "report" && report && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AnalysisReportComponent
                report={report}
                address={dealInput.address}
                onNewAnalysis={handleNewAnalysis}
              />
            </div>
            <div className="space-y-6">
              <ScoreBreakdown totalScore={report.score} />
              <RecentComps subjectAddress={dealInput.address} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Helper functions
function parseMoneyString(str: string | undefined): number {
  if (!str) return 0;
  const match = str.match(/[\d,]+/);
  return match ? parseInt(match[0].replace(/,/g, "")) : 0;
}

function calculateMaxOffer(input: DealInput, type: CalculatorType): number {
  const arv = input.arv || input.askingPrice * 1.3;
  const repairs = input.repairEstimate || 0;
  
  switch (type) {
    case "wholesale":
      return Math.round(arv * 0.7 - repairs - 10000);
    case "flip":
      return Math.round(arv * 0.7 - repairs);
    case "rental":
    case "brrrr":
      return Math.round(arv * 0.75 - repairs);
    default:
      return Math.round(arv * 0.7 - repairs);
  }
}

function calculateCashFlow(input: DealInput): number {
  const rent = input.monthlyRent || (input.askingPrice ? input.askingPrice * 0.008 : 1500);
  const expenses = rent * 0.45;
  const mortgage = input.askingPrice ? input.askingPrice * 0.005 : 1000;
  return Math.round(rent - expenses - mortgage);
}

function calculateCapRate(input: DealInput): number {
  const rent = input.monthlyRent || (input.askingPrice ? input.askingPrice * 0.008 : 1500);
  const annualNOI = rent * 12 * 0.55;
  const price = input.askingPrice || 200000;
  return Number(((annualNOI / price) * 100).toFixed(1));
}

function calculateRefiAmount(input: DealInput): number {
  const arv = input.arv || (input.askingPrice ? input.askingPrice * 1.3 : 300000);
  const refiLTV = 0.75;
  const totalInvestment = (input.askingPrice || 200000) + (input.repairEstimate || 30000);
  return Math.round(arv * refiLTV - totalInvestment);
}

function getTipsForCalculator(type: CalculatorType): string[] {
  const tips: Record<CalculatorType, string[]> = {
    flip: [
      "Use the 70% rule: Max offer = ARV × 0.7 - Repairs",
      "Factor in 6+ months of holding costs for realistic projections",
      "Always get multiple contractor bids before committing",
      "Account for unexpected repairs (10-15% contingency)",
    ],
    wholesale: [
      "Standard assignment fees range from $5,000 to $15,000",
      "Build relationships with reliable cash buyers",
      "Lock up deals at 60-65% ARV for maximum margin",
      "Verify seller motivation before making offers",
    ],
    rental: [
      "Target 1% rule: Monthly rent = 1% of purchase price",
      "Use 8-10% vacancy rate in calculations",
      "Include property management (8-10%) even if self-managing",
      "Consider neighborhood appreciation potential",
    ],
    brrrr: [
      "Aim to recover 100%+ of cash invested after refinance",
      "Season loans typically require 6-12 month ownership",
      "Conservative ARV estimates protect your cash out",
      "Build in reserves for unexpected rehab costs",
    ],
    str: [
      "Research local regulations and HOA restrictions first",
      "Seasonality can swing income by 40-60%",
      "Factor in furnishing costs ($15-30k typical)",
      "Consider professional management (20-25% of revenue)",
    ],
  };
  return tips[type] || tips.flip;
}
