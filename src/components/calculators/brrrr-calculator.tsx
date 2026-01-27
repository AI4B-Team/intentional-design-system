import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalculatorInput, CalculatorSlider, InputGroup } from "./calculator-input";
import { ResultsCard, KeyMetric, MetricGrid } from "./results-card";
import { DealRating } from "./deal-rating";
import { RefreshCw, Download, Share, CheckCircle2, XCircle, Repeat, TrendingUp, Infinity as InfinityIcon } from "lucide-react";

interface BRRRRInputs {
  // Buy
  purchasePrice: number;
  closingCostsBuying: number;
  
  // Rehab
  rehabBudget: number;
  contingencyPercent: number;
  holdingDuringRehabMonths: number;
  holdingCostsMonthly: number;
  
  // Rent
  arv: number;
  monthlyRent: number;
  monthlyExpenses: number;
  
  // Refinance
  refinanceLTV: number;
  newInterestRate: number;
  newLoanTermYears: number;
  refinanceClosingCosts: number;
  originalLoanBalance: number;
}

const defaultInputs: BRRRRInputs = {
  purchasePrice: 120000,
  closingCostsBuying: 3000,
  
  rehabBudget: 40000,
  contingencyPercent: 10,
  holdingDuringRehabMonths: 3,
  holdingCostsMonthly: 800,
  
  arv: 200000,
  monthlyRent: 1600,
  monthlyExpenses: 500,
  
  refinanceLTV: 75,
  newInterestRate: 7,
  newLoanTermYears: 30,
  refinanceClosingCosts: 3000,
  originalLoanBalance: 0,
};

function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
}

type BRRRRGrade = "A" | "B" | "C" | "F";

interface BRRRRCalculatorProps {
  propertyId?: string;
  initialValues?: Partial<BRRRRInputs>;
}

export function BRRRRCalculator({ propertyId, initialValues }: BRRRRCalculatorProps) {
  const [inputs, setInputs] = React.useState<BRRRRInputs>({
    ...defaultInputs,
    ...initialValues,
  });

  const updateInput = <K extends keyof BRRRRInputs>(key: K, value: BRRRRInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Buy calculations
  const totalAcquisitionCost = inputs.purchasePrice + inputs.closingCostsBuying;
  
  // Rehab calculations
  const contingencyAmount = inputs.rehabBudget * (inputs.contingencyPercent / 100);
  const totalRehabCost = inputs.rehabBudget + contingencyAmount;
  const holdingDuringRehab = inputs.holdingCostsMonthly * inputs.holdingDuringRehabMonths;
  
  // Total cash invested (before refinance)
  const totalCashInvested = totalAcquisitionCost + totalRehabCost + holdingDuringRehab;
  
  // Refinance calculations
  const newLoanAmount = inputs.arv * (inputs.refinanceLTV / 100);
  const cashOutAmount = newLoanAmount - inputs.originalLoanBalance - inputs.refinanceClosingCosts;
  const cashLeftInDeal = totalCashInvested - cashOutAmount;
  const cashRecovered = Math.max(0, cashOutAmount);
  
  // New mortgage payment
  const newMonthlyMortgage = calculateMonthlyPayment(newLoanAmount, inputs.newInterestRate, inputs.newLoanTermYears);
  
  // Cash flow after refinance
  const monthlyCashFlow = inputs.monthlyRent - inputs.monthlyExpenses - newMonthlyMortgage;
  const annualCashFlow = monthlyCashFlow * 12;
  
  // Equity position
  const equityCaptured = inputs.arv - newLoanAmount;
  const equityPercent = (equityCaptured / inputs.arv) * 100;
  
  // Cash-on-cash (based on cash left in deal)
  const cashOnCash = cashLeftInDeal > 0 ? (annualCashFlow / cashLeftInDeal) * 100 : 
    cashLeftInDeal <= 0 && annualCashFlow > 0 ? Infinity : 0;
  
  // Infinite return check
  const infiniteReturn = cashLeftInDeal <= 0;
  
  // BRRRR Scorecard
  const recovered100Percent = cashRecovered >= totalCashInvested;
  const positiveCashFlow = monthlyCashFlow > 0;
  const equity20Percent = equityPercent >= 20;
  
  const scoreCount = [recovered100Percent, positiveCashFlow, equity20Percent].filter(Boolean).length;
  const brrrrGrade: BRRRRGrade = scoreCount === 3 ? "A" : scoreCount === 2 ? "B" : scoreCount === 1 ? "C" : "F";
  
  const gradeConfig = {
    A: { color: "text-success", bg: "bg-success/10", score: 95, label: "Excellent BRRRR" },
    B: { color: "text-score-warm", bg: "bg-score-warm/10", score: 80, label: "Good BRRRR" },
    C: { color: "text-warning", bg: "bg-warning/10", score: 65, label: "Fair BRRRR" },
    F: { color: "text-destructive", bg: "bg-destructive/10", score: 40, label: "Poor BRRRR" },
  }[brrrrGrade];

  const handleReset = () => setInputs(defaultInputs);

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg">
        {/* Inputs - Left Column */}
        <div className="lg:col-span-3 space-y-lg">
          {/* Buy */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-h3 font-medium text-content flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white text-tiny font-bold">B</span>
                Buy
              </h3>
              <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={handleReset}>
                Reset All
              </Button>
            </div>
            <div className="p-md space-y-4">
              <CalculatorInput
                label="Purchase Price"
                value={inputs.purchasePrice}
                onChange={(v) => updateInput("purchasePrice", v)}
                type="currency"
                tooltip="The price you're paying for the property"
              />
              <CalculatorInput
                label="Closing Costs (Buying)"
                value={inputs.closingCostsBuying}
                onChange={(v) => updateInput("closingCostsBuying", v)}
                type="currency"
              />
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-small">
                <span className="text-small text-content-secondary">Total Acquisition</span>
                <span className="text-h3 font-semibold text-content tabular-nums">
                  ${totalAcquisitionCost.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Rehab */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning text-white text-tiny font-bold">R</span>
                Rehab
              </h3>
            </div>
            <div className="p-md space-y-4">
              <CalculatorInput
                label="Rehab Budget"
                value={inputs.rehabBudget}
                onChange={(v) => updateInput("rehabBudget", v)}
                type="currency"
              />
              <div className="grid grid-cols-2 gap-4">
                <CalculatorSlider
                  label="Contingency"
                  value={inputs.contingencyPercent}
                  onChange={(v) => updateInput("contingencyPercent", v)}
                  min={0}
                  max={25}
                  step={1}
                />
                <CalculatorSlider
                  label="Rehab Duration"
                  value={inputs.holdingDuringRehabMonths}
                  onChange={(v) => updateInput("holdingDuringRehabMonths", v)}
                  min={1}
                  max={12}
                  step={1}
                  suffix=" mo"
                  formatValue={(v) => `${v} months`}
                />
              </div>
              <CalculatorInput
                label="Monthly Holding Costs"
                value={inputs.holdingCostsMonthly}
                onChange={(v) => updateInput("holdingCostsMonthly", v)}
                type="currency"
                tooltip="Insurance, utilities, taxes, loan payments during rehab"
              />
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-small">
                <span className="text-small text-warning">Total Rehab + Holding</span>
                <span className="text-body font-semibold text-warning tabular-nums">
                  ${(totalRehabCost + holdingDuringRehab).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Rent */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-white text-tiny font-bold">R</span>
                Rent
              </h3>
            </div>
            <div className="p-md space-y-4">
              <CalculatorInput
                label="After Repair Value (ARV)"
                value={inputs.arv}
                onChange={(v) => updateInput("arv", v)}
                type="currency"
                tooltip="Expected appraised value after renovations"
              />
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Monthly Rent"
                  value={inputs.monthlyRent}
                  onChange={(v) => updateInput("monthlyRent", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Monthly Expenses"
                  value={inputs.monthlyExpenses}
                  onChange={(v) => updateInput("monthlyExpenses", v)}
                  type="currency"
                  tooltip="Taxes, insurance, management, repairs, vacancy"
                />
              </div>
            </div>
          </Card>

          {/* Refinance */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-info text-white text-tiny font-bold">R</span>
                Refinance
              </h3>
            </div>
            <div className="p-md space-y-4">
              <CalculatorSlider
                label="Refinance LTV"
                value={inputs.refinanceLTV}
                onChange={(v) => updateInput("refinanceLTV", v)}
                min={50}
                max={80}
                step={5}
                tooltip="Loan-to-value ratio for refinance"
              />
              <div className="flex items-center justify-between p-3 bg-info/10 rounded-small">
                <span className="text-small text-info">New Loan Amount</span>
                <span className="text-body font-semibold text-info tabular-nums">
                  ${newLoanAmount.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorSlider
                  label="Interest Rate"
                  value={inputs.newInterestRate}
                  onChange={(v) => updateInput("newInterestRate", v)}
                  min={4}
                  max={10}
                  step={0.125}
                />
                <CalculatorSlider
                  label="Loan Term"
                  value={inputs.newLoanTermYears}
                  onChange={(v) => updateInput("newLoanTermYears", v)}
                  min={15}
                  max={30}
                  step={5}
                  suffix=" yrs"
                  formatValue={(v) => `${v} years`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Refinance Closing Costs"
                  value={inputs.refinanceClosingCosts}
                  onChange={(v) => updateInput("refinanceClosingCosts", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Original Loan Balance"
                  value={inputs.originalLoanBalance}
                  onChange={(v) => updateInput("originalLoanBalance", v)}
                  type="currency"
                  tooltip="Balance on any existing loan to pay off"
                />
              </div>
            </div>
          </Card>

          {/* Repeat Summary */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-white text-tiny font-bold">R</span>
                Repeat
              </h3>
            </div>
            <div className="p-md">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-secondary rounded-medium text-center">
                  <p className="text-tiny uppercase text-content-secondary mb-1">Cash Invested</p>
                  <p className="text-h2 font-bold text-content tabular-nums">${totalCashInvested.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-success/10 rounded-medium text-center">
                  <p className="text-tiny uppercase text-success mb-1">Cash Recovered</p>
                  <p className="text-h2 font-bold text-success tabular-nums">${cashRecovered.toLocaleString()}</p>
                </div>
              </div>
              <div className={cn(
                "mt-4 p-4 rounded-medium text-center",
                infiniteReturn ? "bg-brand-accent/10" : cashLeftInDeal < totalCashInvested * 0.2 ? "bg-success/10" : "bg-warning/10"
              )}>
                <p className="text-tiny uppercase text-content-secondary mb-1">Cash Left in Deal</p>
                <p className={cn(
                  "text-h2 font-bold tabular-nums",
                  infiniteReturn ? "text-brand-accent" : cashLeftInDeal < totalCashInvested * 0.2 ? "text-success" : "text-warning"
                )}>
                  {cashLeftInDeal <= 0 ? "$0" : `$${cashLeftInDeal.toLocaleString()}`}
                </p>
                {infiniteReturn && (
                  <Badge variant="success" size="sm" className="mt-2">
                    <InfinityIcon className="h-3 w-3 mr-1" />
                    Infinite Return!
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Results - Right Column */}
        <div className="lg:col-span-2 space-y-lg">
          <ResultsCard
            title="BRRRR Analysis"
            keyResult={{
              label: "Monthly Cash Flow",
              value: monthlyCashFlow,
              format: "currency",
              trend: monthlyCashFlow > 0 ? "positive" : "negative",
            }}
            dealScore={gradeConfig.score}
          >
            <div className="space-y-md">
              {/* Grade Badge */}
              <div className="flex items-center justify-center">
                <Badge
                  variant={
                    brrrrGrade === "A" ? "success" :
                    brrrrGrade === "B" ? "warning" :
                    brrrrGrade === "C" ? "info" : "error"
                  }
                  size="md"
                  className="px-4 py-1"
                >
                  Grade {brrrrGrade} - {gradeConfig.label}
                </Badge>
              </div>

              {/* Key Metrics */}
              <MetricGrid columns={2}>
                <KeyMetric 
                  label="Annual Cash Flow" 
                  value={annualCashFlow} 
                  format="currency"
                  trend={annualCashFlow > 0 ? "positive" : "negative"}
                />
                <KeyMetric 
                  label="Equity Captured" 
                  value={equityCaptured} 
                  format="currency"
                  trend="positive"
                />
                <KeyMetric 
                  label="Cash-on-Cash" 
                  value={infiniteReturn ? "∞" : `${cashOnCash.toFixed(1)}%`}
                  trend={infiniteReturn || cashOnCash >= 10 ? "positive" : "neutral"}
                />
                <KeyMetric 
                  label="Equity Position" 
                  value={equityPercent} 
                  format="percentage"
                  trend={equityPercent >= 20 ? "positive" : "neutral"}
                />
              </MetricGrid>

              <div className="h-px bg-border-subtle" />

              {/* Additional Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-small">
                  <span className="text-content-secondary">New Monthly Payment</span>
                  <span className="font-medium text-content tabular-nums">
                    ${newMonthlyMortgage.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-small">
                  <span className="text-content-secondary">Cash Out at Refi</span>
                  <span className="font-medium text-content tabular-nums">
                    ${cashOutAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              {/* BRRRR Scorecard */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  BRRRR Scorecard
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-surface-secondary rounded-small">
                    <span className="text-small text-content-secondary">100%+ Cash Recovered?</span>
                    {recovered100Percent ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-surface-secondary rounded-small">
                    <span className="text-small text-content-secondary">Positive Cash Flow?</span>
                    {positiveCashFlow ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-surface-secondary rounded-small">
                    <span className="text-small text-content-secondary">Equity Position ≥ 20%?</span>
                    {equity20Percent ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </div>
              </div>

              {/* Infinite Return Banner */}
              {infiniteReturn && (
                <>
                  <div className="h-px bg-border-subtle" />
                  <div className="flex items-center gap-3 p-3 bg-brand-accent/10 border border-brand-accent/20 rounded-medium">
                    <TrendingUp className="h-5 w-5 text-brand-accent" />
                    <div>
                      <p className="text-small font-medium text-brand-accent">Ready to Repeat!</p>
                      <p className="text-tiny text-content-secondary">All cash recovered - use it for the next deal</p>
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="sm" fullWidth icon={<Download />}>
                  Export PDF
                </Button>
                <Button variant="secondary" size="sm" fullWidth icon={<Share />}>
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
