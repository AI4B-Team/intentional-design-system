import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalculatorInput, CalculatorSlider, InputGroup } from "./calculator-input";
import { ResultsCard, KeyMetric, MetricGrid } from "./results-card";
import { DealRating, ProfitBreakdown } from "./deal-rating";
import { RefreshCw, Download, Share, Save, TrendingUp, AlertCircle } from "lucide-react";

interface FixFlipInputs {
  // Acquisition
  purchasePrice: number;
  closingCostsBuying: number; // percentage
  financingType: "cash" | "loan";
  loanAmount: number;
  interestRate: number;
  loanTermMonths: number;
  loanPoints: number;
  
  // Rehab
  repairCosts: number;
  contingencyPercent: number;
  permitsAndFees: number;
  
  // Holding
  holdingPeriodMonths: number;
  propertyTaxesMonthly: number;
  insuranceMonthly: number;
  utilitiesMonthly: number;
  hoaMonthly: number;
  
  // Sale
  arv: number;
  closingCostsSelling: number; // percentage
  agentCommission: number; // percentage
}

const defaultInputs: FixFlipInputs = {
  purchasePrice: 200000,
  closingCostsBuying: 2,
  financingType: "loan",
  loanAmount: 160000,
  interestRate: 12,
  loanTermMonths: 12,
  loanPoints: 2,
  
  repairCosts: 50000,
  contingencyPercent: 10,
  permitsAndFees: 2500,
  
  holdingPeriodMonths: 6,
  propertyTaxesMonthly: 300,
  insuranceMonthly: 150,
  utilitiesMonthly: 200,
  hoaMonthly: 0,
  
  arv: 350000,
  closingCostsSelling: 2,
  agentCommission: 5,
};

type DealGrade = "Excellent" | "Good" | "Marginal" | "Poor";

function getDealGrade(roi: number): DealGrade {
  if (roi >= 25) return "Excellent";
  if (roi >= 15) return "Good";
  if (roi >= 10) return "Marginal";
  return "Poor";
}

function getGradeConfig(grade: DealGrade) {
  switch (grade) {
    case "Excellent":
      return { color: "text-success", bg: "bg-success/10", score: 95 };
    case "Good":
      return { color: "text-score-warm", bg: "bg-score-warm/10", score: 80 };
    case "Marginal":
      return { color: "text-warning", bg: "bg-warning/10", score: 65 };
    case "Poor":
      return { color: "text-destructive", bg: "bg-destructive/10", score: 40 };
  }
}

interface FixFlipCalculatorProps {
  propertyId?: string;
  initialValues?: Partial<FixFlipInputs>;
  onSaveToProperty?: (values: FixFlipInputs, results: any) => void;
}

export function FixFlipCalculator({ propertyId, initialValues, onSaveToProperty }: FixFlipCalculatorProps) {
  const [inputs, setInputs] = React.useState<FixFlipInputs>({
    ...defaultInputs,
    ...initialValues,
  });

  const updateInput = <K extends keyof FixFlipInputs>(key: K, value: FixFlipInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Calculations
  const buyingClosingCosts = inputs.purchasePrice * (inputs.closingCostsBuying / 100);
  const loanPointsCost = inputs.financingType === "loan" ? inputs.loanAmount * (inputs.loanPoints / 100) : 0;
  
  const totalAcquisitionCosts = inputs.purchasePrice + buyingClosingCosts + loanPointsCost;
  
  const contingencyAmount = inputs.repairCosts * (inputs.contingencyPercent / 100);
  const totalRehabCosts = inputs.repairCosts + contingencyAmount + inputs.permitsAndFees;
  
  // Monthly loan interest (if financed)
  const monthlyLoanInterest = inputs.financingType === "loan" 
    ? (inputs.loanAmount * (inputs.interestRate / 100)) / 12 
    : 0;
  
  const monthlyHoldingCosts = 
    inputs.propertyTaxesMonthly + 
    inputs.insuranceMonthly + 
    inputs.utilitiesMonthly + 
    inputs.hoaMonthly + 
    monthlyLoanInterest;
  
  const totalHoldingCosts = monthlyHoldingCosts * inputs.holdingPeriodMonths;
  
  // Selling costs
  const sellingClosingCosts = inputs.arv * (inputs.closingCostsSelling / 100);
  const commissionCosts = inputs.arv * (inputs.agentCommission / 100);
  const totalSellingCosts = sellingClosingCosts + commissionCosts;
  
  // Totals
  const totalInvestment = totalAcquisitionCosts + totalRehabCosts + totalHoldingCosts;
  const netSaleProceeds = inputs.arv - totalSellingCosts;
  const grossProfit = netSaleProceeds - totalInvestment;
  
  // Cash invested (if financed, subtract loan amount)
  const cashInvested = inputs.financingType === "loan"
    ? totalInvestment - inputs.loanAmount + loanPointsCost
    : totalInvestment;
  
  // ROI calculations
  const roi = (grossProfit / cashInvested) * 100;
  const annualizedROI = roi * (12 / inputs.holdingPeriodMonths);
  const cashOnCash = inputs.financingType === "loan" 
    ? (grossProfit / cashInvested) * 100 
    : roi;
  
  const dealGrade = getDealGrade(roi);
  const gradeConfig = getGradeConfig(dealGrade);

  // Profit breakdown items for visualization
  const profitBreakdownItems = [
    { label: "Purchase", value: inputs.purchasePrice, color: "bg-brand" },
    { label: "Repairs", value: totalRehabCosts, color: "bg-warning" },
    { label: "Holding", value: totalHoldingCosts, color: "bg-info" },
    { label: "Selling", value: totalSellingCosts, color: "bg-destructive/70" },
    { label: "Profit", value: Math.max(0, grossProfit), color: "bg-success" },
  ];

  const handleReset = () => setInputs(defaultInputs);

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg">
        {/* Inputs - Left Column */}
        <div className="lg:col-span-3 space-y-lg">
          {/* Acquisition */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-h3 font-medium text-content">Acquisition</h3>
              <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={handleReset}>
                Reset All
              </Button>
            </div>
            <div className="p-md space-y-lg">
              <InputGroup title="Purchase">
                <CalculatorInput
                  label="Purchase Price"
                  value={inputs.purchasePrice}
                  onChange={(v) => updateInput("purchasePrice", v)}
                  type="currency"
                  tooltip="The agreed purchase price for the property"
                />
                <CalculatorSlider
                  label="Closing Costs (Buying)"
                  value={inputs.closingCostsBuying}
                  onChange={(v) => updateInput("closingCostsBuying", v)}
                  min={0}
                  max={5}
                  step={0.5}
                  tooltip="Estimated closing costs as percentage of purchase price"
                />
              </InputGroup>

              <div className="h-px bg-border-subtle" />

              <InputGroup title="Financing">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={inputs.financingType === "cash" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => updateInput("financingType", "cash")}
                  >
                    Cash
                  </Button>
                  <Button
                    variant={inputs.financingType === "loan" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => updateInput("financingType", "loan")}
                  >
                    Hard Money / Loan
                  </Button>
                </div>

                {inputs.financingType === "loan" && (
                  <div className="grid grid-cols-2 gap-4">
                    <CalculatorInput
                      label="Loan Amount"
                      value={inputs.loanAmount}
                      onChange={(v) => updateInput("loanAmount", v)}
                      type="currency"
                    />
                    <CalculatorSlider
                      label="Interest Rate"
                      value={inputs.interestRate}
                      onChange={(v) => updateInput("interestRate", v)}
                      min={6}
                      max={18}
                      step={0.5}
                    />
                    <CalculatorInput
                      label="Loan Term"
                      value={inputs.loanTermMonths}
                      onChange={(v) => updateInput("loanTermMonths", v)}
                      type="months"
                    />
                    <CalculatorSlider
                      label="Points"
                      value={inputs.loanPoints}
                      onChange={(v) => updateInput("loanPoints", v)}
                      min={0}
                      max={5}
                      step={0.5}
                    />
                  </div>
                )}
              </InputGroup>
            </div>
          </Card>

          {/* Rehab */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Rehab</h3>
            </div>
            <div className="p-md space-y-4">
              <CalculatorInput
                label="Repair Costs"
                value={inputs.repairCosts}
                onChange={(v) => updateInput("repairCosts", v)}
                type="currency"
                tooltip="Total estimated cost of repairs and renovations"
              />
              <div className="grid grid-cols-2 gap-4">
                <CalculatorSlider
                  label="Contingency"
                  value={inputs.contingencyPercent}
                  onChange={(v) => updateInput("contingencyPercent", v)}
                  min={0}
                  max={25}
                  step={1}
                  tooltip="Buffer for unexpected repair costs"
                />
                <CalculatorInput
                  label="Permits & Fees"
                  value={inputs.permitsAndFees}
                  onChange={(v) => updateInput("permitsAndFees", v)}
                  type="currency"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-small">
                <span className="text-small text-content-secondary">Total Rehab Budget</span>
                <span className="text-h3 font-semibold text-content tabular-nums">
                  ${totalRehabCosts.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Holding */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Holding Costs</h3>
            </div>
            <div className="p-md space-y-4">
              <CalculatorSlider
                label="Holding Period"
                value={inputs.holdingPeriodMonths}
                onChange={(v) => updateInput("holdingPeriodMonths", v)}
                min={1}
                max={18}
                step={1}
                suffix=" months"
                formatValue={(v) => `${v} months`}
              />
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Property Taxes (monthly)"
                  value={inputs.propertyTaxesMonthly}
                  onChange={(v) => updateInput("propertyTaxesMonthly", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Insurance (monthly)"
                  value={inputs.insuranceMonthly}
                  onChange={(v) => updateInput("insuranceMonthly", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Utilities (monthly)"
                  value={inputs.utilitiesMonthly}
                  onChange={(v) => updateInput("utilitiesMonthly", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="HOA (monthly)"
                  value={inputs.hoaMonthly}
                  onChange={(v) => updateInput("hoaMonthly", v)}
                  type="currency"
                />
              </div>
              {inputs.financingType === "loan" && (
                <div className="flex items-center justify-between p-3 bg-info/10 rounded-small">
                  <span className="text-small text-info">Monthly Loan Interest</span>
                  <span className="text-body font-semibold text-info tabular-nums">
                    ${monthlyLoanInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-small">
                <span className="text-small text-content-secondary">Total Holding Costs</span>
                <span className="text-h3 font-semibold text-content tabular-nums">
                  ${totalHoldingCosts.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Sale */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Sale</h3>
            </div>
            <div className="p-md space-y-4">
              <CalculatorInput
                label="After Repair Value (ARV)"
                value={inputs.arv}
                onChange={(v) => updateInput("arv", v)}
                type="currency"
                tooltip="Expected sale price after all repairs are complete"
              />
              <div className="grid grid-cols-2 gap-4">
                <CalculatorSlider
                  label="Closing Costs (Selling)"
                  value={inputs.closingCostsSelling}
                  onChange={(v) => updateInput("closingCostsSelling", v)}
                  min={0}
                  max={5}
                  step={0.5}
                />
                <CalculatorSlider
                  label="Agent Commission"
                  value={inputs.agentCommission}
                  onChange={(v) => updateInput("agentCommission", v)}
                  min={0}
                  max={7}
                  step={0.5}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-small">
                <span className="text-small text-content-secondary">Net Sale Proceeds</span>
                <span className="text-h3 font-semibold text-content tabular-nums">
                  ${netSaleProceeds.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Results - Right Column */}
        <div className="lg:col-span-2">
          <ResultsCard
            title="Deal Analysis"
            keyResult={{
              label: "Gross Profit",
              value: grossProfit,
              format: "currency",
              trend: grossProfit > 0 ? "positive" : "negative",
            }}
            dealScore={gradeConfig.score}
          >
            <div className="space-y-md">
              {/* Deal Grade Badge */}
              <div className="flex items-center justify-center gap-2">
                <Badge
                  variant={
                    dealGrade === "Excellent" ? "success" :
                    dealGrade === "Good" ? "warning" :
                    dealGrade === "Marginal" ? "info" : "error"
                  }
                  size="md"
                  className="px-4 py-1"
                >
                  {dealGrade} Deal
                </Badge>
              </div>

              {/* Key Metrics */}
              <MetricGrid columns={2}>
                <KeyMetric 
                  label="Total Investment" 
                  value={totalInvestment} 
                  format="currency" 
                />
                <KeyMetric 
                  label="Cash Invested" 
                  value={cashInvested} 
                  format="currency" 
                />
                <KeyMetric 
                  label="ROI" 
                  value={roi} 
                  format="percentage" 
                  trend={roi >= 15 ? "positive" : roi >= 10 ? "neutral" : "negative"}
                />
                <KeyMetric 
                  label="Annualized ROI" 
                  value={annualizedROI} 
                  format="percentage" 
                  trend={annualizedROI >= 25 ? "positive" : "neutral"}
                />
              </MetricGrid>

              {inputs.financingType === "loan" && (
                <>
                  <div className="h-px bg-border-subtle" />
                  <KeyMetric 
                    label="Cash-on-Cash Return" 
                    value={cashOnCash} 
                    format="percentage" 
                    trend={cashOnCash >= 20 ? "positive" : "neutral"}
                  />
                </>
              )}

              {/* Divider */}
              <div className="h-px bg-border-subtle" />

              {/* Profit Breakdown */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">Investment Breakdown</h4>
                <ProfitBreakdown total={inputs.arv} items={profitBreakdownItems} />
              </div>

              {/* Deal Rating Guide */}
              <div className="h-px bg-border-subtle" />
              <div className="space-y-2">
                <h4 className="text-small font-medium text-content">ROI Thresholds</h4>
                <div className="grid grid-cols-2 gap-2 text-tiny">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-content-secondary">Excellent: ≥25%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-score-warm" />
                    <span className="text-content-secondary">Good: 15-25%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    <span className="text-content-secondary">Marginal: 10-15%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-content-secondary">Poor: &lt;10%</span>
                  </div>
                </div>
              </div>

              {/* Warning for negative profit */}
              {grossProfit < 0 && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-small">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-small text-destructive">
                    This deal results in a loss. Consider renegotiating the purchase price or reducing costs.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {propertyId && onSaveToProperty && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<Save />}
                    onClick={() => onSaveToProperty(inputs, { grossProfit, roi, annualizedROI })}
                  >
                    Save to Property
                  </Button>
                )}
                <Button variant="secondary" size="sm" fullWidth={!propertyId} icon={<Download />}>
                  Export PDF
                </Button>
                <Button variant="secondary" size="sm" fullWidth={!propertyId} icon={<Share />}>
                  Share
                </Button>
              </div>
            </div>
          </ResultsCard>
        </div>
      </div>
    </div>
  );
}
