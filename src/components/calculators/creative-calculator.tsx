import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalculatorInput, CalculatorSlider, InputGroup } from "./calculator-input";
import { ResultsCard, KeyMetric, MetricGrid } from "./results-card";
import { 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Share, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  TrendingUp,
  ArrowRight,
  Shield,
  Clock,
  DollarSign,
  Home,
  FileText,
  Sparkles
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Sub-navigation tabs for creative strategies
const creativeStrategies = [
  { id: "subto", label: "Subject-To", icon: FileText },
  { id: "seller-finance", label: "Seller Finance", icon: DollarSign },
  { id: "lease-option", label: "Lease Option", icon: Home },
  { id: "wrap", label: "Wraparound", icon: Sparkles },
];

interface SubToInputs {
  // Existing Loan
  originalLoanAmount: number;
  currentBalance: number;
  interestRate: number;
  monthlyPI: number;
  escrowMonthly: number;
  yearsRemaining: number;
  loanType: string;
  
  // Property
  propertyValue: number;
  arv: number;
  repairCosts: number;
  monthlyRent: number;
  
  // Acquisition
  cashToSeller: number;
  closingCosts: number;
  backPayments: number;
}

const defaultSubToInputs: SubToInputs = {
  originalLoanAmount: 250000,
  currentBalance: 195000,
  interestRate: 3.5,
  monthlyPI: 1122,
  escrowMonthly: 350,
  yearsRemaining: 25,
  loanType: "conventional",
  
  propertyValue: 280000,
  arv: 280000,
  repairCosts: 5000,
  monthlyRent: 2200,
  
  cashToSeller: 5000,
  closingCosts: 2500,
  backPayments: 0,
};

function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
}

function getDueSaleRisk(loanType: string): { level: string; color: string; description: string } {
  switch (loanType.toLowerCase()) {
    case "fha":
    case "va":
      return {
        level: "Higher",
        color: "text-warning",
        description: "FHA/VA loans have stricter due-on-sale enforcement. Consider LLC protection strategies."
      };
    case "conventional":
      return {
        level: "Moderate",
        color: "text-info",
        description: "Conventional loans have due-on-sale clauses but enforcement varies by lender and situation."
      };
    default:
      return {
        level: "Unknown",
        color: "text-content-secondary",
        description: "Verify loan documents for due-on-sale clause terms."
      };
  }
}

function SubToCalculator() {
  const [inputs, setInputs] = React.useState<SubToInputs>(defaultSubToInputs);
  const [showExplainer, setShowExplainer] = React.useState(true);

  const updateInput = <K extends keyof SubToInputs>(key: K, value: SubToInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Calculations
  const totalMonthlyPayment = inputs.monthlyPI + inputs.escrowMonthly;
  const totalCashToAcquire = inputs.cashToSeller + inputs.closingCosts + inputs.backPayments + inputs.repairCosts;
  
  // Monthly Position
  const monthlyCashFlow = inputs.monthlyRent - totalMonthlyPayment;
  const annualCashFlow = monthlyCashFlow * 12;
  
  // Equity Position
  const instantEquity = inputs.propertyValue - inputs.currentBalance - inputs.cashToSeller;
  const equityCapturePercent = (instantEquity / inputs.propertyValue) * 100;
  
  // Returns
  const cashOnCash = totalCashToAcquire > 0 ? (annualCashFlow / totalCashToAcquire) * 100 : 0;
  const totalFirstYearReturn = annualCashFlow + instantEquity;
  
  // 5-Year Projection (simplified - assumes consistent paydown)
  const monthlyPaydownEstimate = inputs.monthlyPI * 0.3; // Rough estimate that 30% goes to principal
  const fiveYearProjection = [1, 2, 3, 4, 5].map(year => {
    const cumulativeCashFlow = annualCashFlow * year;
    const estimatedPaydown = monthlyPaydownEstimate * 12 * year;
    const estimatedBalance = Math.max(0, inputs.currentBalance - estimatedPaydown);
    const estimatedEquity = inputs.propertyValue - estimatedBalance;
    return {
      year,
      cashFlow: cumulativeCashFlow,
      estimatedEquity,
      totalReturn: cumulativeCashFlow + estimatedEquity - inputs.cashToSeller
    };
  });
  
  // Comparison: Sub-To vs New Financing
  const newLoanDownPayment = inputs.propertyValue * 0.20; // 20% down
  const newLoanAmount = inputs.propertyValue - newLoanDownPayment;
  const currentMarketRate = 7.5; // Current market rate assumption
  const newLoanMonthlyPI = calculateMonthlyPayment(newLoanAmount, currentMarketRate, 30);
  const newLoanTotalPayment = newLoanMonthlyPI + inputs.escrowMonthly;
  const newLoanCashFlow = inputs.monthlyRent - newLoanTotalPayment;
  const newLoanCashRequired = newLoanDownPayment + inputs.closingCosts + inputs.repairCosts;
  const newLoanCoC = newLoanCashRequired > 0 ? ((newLoanCashFlow * 12) / newLoanCashRequired) * 100 : 0;
  
  // Due-on-Sale Risk
  const dosRisk = getDueSaleRisk(inputs.loanType);
  
  // Deal Score
  const dealScore = Math.min(100, Math.max(0,
    (monthlyCashFlow >= 500 ? 30 : monthlyCashFlow >= 300 ? 20 : monthlyCashFlow >= 100 ? 10 : 0) +
    (cashOnCash >= 20 ? 25 : cashOnCash >= 15 ? 20 : cashOnCash >= 10 ? 15 : cashOnCash >= 5 ? 10 : 0) +
    (equityCapturePercent >= 30 ? 25 : equityCapturePercent >= 20 ? 20 : equityCapturePercent >= 10 ? 15 : 5) +
    (inputs.interestRate <= 4 ? 20 : inputs.interestRate <= 5 ? 15 : inputs.interestRate <= 6 ? 10 : 5)
  ));

  const handleReset = () => setInputs(defaultSubToInputs);

  return (
    <div className="space-y-lg">
      {/* Explainer Section */}
      <Collapsible open={showExplainer} onOpenChange={setShowExplainer}>
        <Card variant="default" padding="none" className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full px-md py-4 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-brand-accent/10 flex items-center justify-center">
                  <Info className="h-4 w-4 text-brand-accent" />
                </div>
                <h3 className="text-h3 font-medium text-content">What is Subject-To?</h3>
              </div>
              {showExplainer ? <ChevronUp className="h-5 w-5 text-content-tertiary" /> : <ChevronDown className="h-5 w-5 text-content-tertiary" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-md pb-md">
              <div className="p-4 bg-surface-secondary/50 rounded-medium space-y-3">
                <p className="text-body text-content">
                  <strong>Subject-To</strong> means buying a property "subject to" the existing mortgage remaining in place. 
                  You take over payments without formally assuming the loan.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    <div className="text-small text-content-secondary">Keep seller's low interest rate</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    <div className="text-small text-content-secondary">Little to no money down possible</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    <div className="text-small text-content-secondary">No loan qualification needed</div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg">
        {/* Inputs - Left Column */}
        <div className="lg:col-span-3 space-y-lg">
          {/* Existing Loan */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-h3 font-medium text-content">Existing Loan</h3>
              <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={handleReset}>
                Reset All
              </Button>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Original Loan Amount"
                  value={inputs.originalLoanAmount}
                  onChange={(v) => updateInput("originalLoanAmount", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Current Balance"
                  value={inputs.currentBalance}
                  onChange={(v) => updateInput("currentBalance", v)}
                  type="currency"
                  tooltip="Remaining principal balance on the loan"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorSlider
                  label="Interest Rate"
                  value={inputs.interestRate}
                  onChange={(v) => updateInput("interestRate", v)}
                  min={2}
                  max={10}
                  step={0.125}
                />
                <CalculatorSlider
                  label="Years Remaining"
                  value={inputs.yearsRemaining}
                  onChange={(v) => updateInput("yearsRemaining", v)}
                  min={1}
                  max={30}
                  step={1}
                  suffix=" yrs"
                  formatValue={(v) => `${v} years`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Monthly P&I"
                  value={inputs.monthlyPI}
                  onChange={(v) => updateInput("monthlyPI", v)}
                  type="currency"
                  tooltip="Principal and Interest payment"
                />
                <CalculatorInput
                  label="Escrow (Taxes + Insurance)"
                  value={inputs.escrowMonthly}
                  onChange={(v) => updateInput("escrowMonthly", v)}
                  type="currency"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-small">
                <span className="text-small text-content-secondary">Total Monthly Payment</span>
                <span className="text-h3 font-semibold text-content tabular-nums">
                  ${totalMonthlyPayment.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                <label className="text-small font-medium text-content">Loan Type</label>
                <div className="flex gap-2">
                  {["conventional", "fha", "va"].map((type) => (
                    <Button
                      key={type}
                      variant={inputs.loanType === type ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => updateInput("loanType", type)}
                    >
                      {type.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Property */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Property</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Current Property Value"
                  value={inputs.propertyValue}
                  onChange={(v) => updateInput("propertyValue", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="After Repair Value"
                  value={inputs.arv}
                  onChange={(v) => updateInput("arv", v)}
                  type="currency"
                  tooltip="If doing repairs, enter expected value after"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Repair Costs"
                  value={inputs.repairCosts}
                  onChange={(v) => updateInput("repairCosts", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Expected Monthly Rent"
                  value={inputs.monthlyRent}
                  onChange={(v) => updateInput("monthlyRent", v)}
                  type="currency"
                />
              </div>
            </div>
          </Card>

          {/* Acquisition */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Acquisition Costs</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <CalculatorInput
                  label="Cash to Seller"
                  value={inputs.cashToSeller}
                  onChange={(v) => updateInput("cashToSeller", v)}
                  type="currency"
                  tooltip="Amount paid directly to seller (can be $0)"
                />
                <CalculatorInput
                  label="Closing Costs"
                  value={inputs.closingCosts}
                  onChange={(v) => updateInput("closingCosts", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Back Payments"
                  value={inputs.backPayments}
                  onChange={(v) => updateInput("backPayments", v)}
                  type="currency"
                  tooltip="If seller is behind on payments"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-brand-accent/10 rounded-small">
                <span className="text-small text-brand-accent">Total Cash to Acquire</span>
                <span className="text-h3 font-semibold text-brand-accent tabular-nums">
                  ${totalCashToAcquire.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Comparison Panel */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Subject-To vs New Financing</h3>
            </div>
            <div className="p-md">
              <div className="overflow-x-auto">
                <table className="w-full text-small">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="py-3 text-left font-medium text-content-secondary">Metric</th>
                      <th className="py-3 text-right font-medium text-success">Subject-To</th>
                      <th className="py-3 text-right font-medium text-content-secondary">New 20% Down</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    <tr>
                      <td className="py-3 text-content-secondary">Cash Required</td>
                      <td className={cn("py-3 text-right font-semibold tabular-nums", totalCashToAcquire < newLoanCashRequired ? "text-success" : "text-content")}>
                        ${totalCashToAcquire.toLocaleString()}
                        {totalCashToAcquire < newLoanCashRequired && <span className="ml-1 text-success">✓</span>}
                      </td>
                      <td className="py-3 text-right tabular-nums text-content">${newLoanCashRequired.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-content-secondary">Interest Rate</td>
                      <td className={cn("py-3 text-right font-semibold tabular-nums", inputs.interestRate < currentMarketRate ? "text-success" : "text-content")}>
                        {inputs.interestRate}%
                        {inputs.interestRate < currentMarketRate && <span className="ml-1 text-success">✓</span>}
                      </td>
                      <td className="py-3 text-right tabular-nums text-content">{currentMarketRate}%</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-content-secondary">Monthly Payment</td>
                      <td className={cn("py-3 text-right font-semibold tabular-nums", totalMonthlyPayment < newLoanTotalPayment ? "text-success" : "text-content")}>
                        ${totalMonthlyPayment.toLocaleString()}
                        {totalMonthlyPayment < newLoanTotalPayment && <span className="ml-1 text-success">✓</span>}
                      </td>
                      <td className="py-3 text-right tabular-nums text-content">${newLoanTotalPayment.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-content-secondary">Monthly Cash Flow</td>
                      <td className={cn("py-3 text-right font-semibold tabular-nums", monthlyCashFlow > newLoanCashFlow ? "text-success" : "text-content")}>
                        ${monthlyCashFlow.toLocaleString()}
                        {monthlyCashFlow > newLoanCashFlow && <span className="ml-1 text-success">✓</span>}
                      </td>
                      <td className="py-3 text-right tabular-nums text-content">${newLoanCashFlow.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-content-secondary">Cash-on-Cash Return</td>
                      <td className={cn("py-3 text-right font-semibold tabular-nums", cashOnCash > newLoanCoC ? "text-success" : "text-content")}>
                        {cashOnCash.toFixed(1)}%
                        {cashOnCash > newLoanCoC && <span className="ml-1 text-success">✓</span>}
                      </td>
                      <td className="py-3 text-right tabular-nums text-content">{newLoanCoC.toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {totalCashToAcquire < newLoanCashRequired && (
                <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-small">
                  <p className="text-small text-success font-medium">
                    💰 Subject-To saves ${(newLoanCashRequired - totalCashToAcquire).toLocaleString()} in cash required!
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Due-on-Sale Risk */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="text-h3 font-medium text-content">Due-on-Sale Risk</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-small">
                <span className="text-small text-content-secondary">Risk Level ({inputs.loanType.toUpperCase()})</span>
                <Badge variant={dosRisk.level === "Higher" ? "warning" : "info"} size="sm">
                  {dosRisk.level}
                </Badge>
              </div>
              <p className="text-small text-content-secondary">{dosRisk.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-small font-medium text-content">Mitigation Strategies</h4>
                <div className="space-y-2">
                  {[
                    "Use a land trust to hold title",
                    "Keep payments current at all times",
                    "Maintain insurance with lender as loss payee",
                    "Consider a performance deed in escrow",
                    "Have attorney review all documents"
                  ].map((strategy, i) => (
                    <div key={i} className="flex items-center gap-2 text-small text-content-secondary">
                      <Shield className="h-3 w-3 text-info" />
                      {strategy}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Exit Strategies */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Exit Strategies</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-surface-secondary rounded-medium">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <h4 className="text-small font-medium text-content">Hold for Cash Flow</h4>
                  </div>
                  <p className="text-tiny text-content-secondary mb-3">5-year projected total return</p>
                  <p className="text-h2 font-bold text-success tabular-nums">
                    ${fiveYearProjection[4].totalReturn.toLocaleString()}
                  </p>
                </div>
                
                <div className="p-4 bg-surface-secondary rounded-medium">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-info" />
                    <h4 className="text-small font-medium text-content">Sell on Wrap</h4>
                  </div>
                  <p className="text-tiny text-content-secondary mb-3">Potential wrap profit at 8% rate</p>
                  <p className="text-h2 font-bold text-info tabular-nums">
                    ${Math.round((inputs.propertyValue * 1.05) - inputs.currentBalance).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-4 bg-surface-secondary rounded-medium">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-4 w-4 text-brand-accent" />
                    <h4 className="text-small font-medium text-content">Lease-Option Exit</h4>
                  </div>
                  <p className="text-tiny text-content-secondary mb-3">With 3% option fee + premium rent</p>
                  <p className="text-h2 font-bold text-brand-accent tabular-nums">
                    ${Math.round(inputs.propertyValue * 0.03 + (inputs.monthlyRent * 0.1 * 24)).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-4 bg-surface-secondary rounded-medium">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-warning" />
                    <h4 className="text-small font-medium text-content">Refinance Timeline</h4>
                  </div>
                  <p className="text-tiny text-content-secondary mb-3">When you can refi into your loan</p>
                  <p className="text-h2 font-bold text-warning tabular-nums">
                    12-24 months
                  </p>
                  <p className="text-tiny text-content-tertiary">After seasoning period</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Results - Right Column */}
        <div className="lg:col-span-2 space-y-lg">
          <ResultsCard
            title="Deal Analysis"
            keyResult={{
              label: "Monthly Cash Flow",
              value: monthlyCashFlow,
              format: "currency",
              trend: monthlyCashFlow > 0 ? "positive" : "negative",
            }}
            dealScore={dealScore}
          >
            <div className="space-y-md">
              {/* Rate Advantage Badge */}
              {inputs.interestRate < 5 && (
                <div className="flex justify-center">
                  <Badge variant="success" size="md" className="px-4">
                    🔥 {inputs.interestRate}% Rate Lock - Great Deal!
                  </Badge>
                </div>
              )}

              {/* Monthly Position */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">Monthly Position</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Rent Income</span>
                    <span className="font-medium text-success tabular-nums">+${inputs.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Loan Payment</span>
                    <span className="font-medium text-destructive tabular-nums">-${totalMonthlyPayment.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border-subtle" />
                  <div className="flex justify-between text-body">
                    <span className="font-medium text-content">Net Cash Flow</span>
                    <span className={cn("font-bold tabular-nums", monthlyCashFlow > 0 ? "text-success" : "text-destructive")}>
                      ${monthlyCashFlow.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              {/* Equity Position */}
              <MetricGrid columns={2}>
                <KeyMetric 
                  label="Instant Equity" 
                  value={instantEquity} 
                  format="currency"
                  trend="positive"
                />
                <KeyMetric 
                  label="Equity Capture" 
                  value={equityCapturePercent} 
                  format="percentage"
                  trend={equityCapturePercent >= 20 ? "positive" : "neutral"}
                />
              </MetricGrid>

              <div className="h-px bg-border-subtle" />

              {/* Returns */}
              <MetricGrid columns={2}>
                <KeyMetric 
                  label="Annual Cash Flow" 
                  value={annualCashFlow} 
                  format="currency"
                  trend={annualCashFlow > 0 ? "positive" : "negative"}
                />
                <KeyMetric 
                  label="Cash-on-Cash" 
                  value={cashOnCash} 
                  format="percentage"
                  trend={cashOnCash >= 15 ? "positive" : cashOnCash >= 10 ? "neutral" : "negative"}
                />
              </MetricGrid>

              <div className="h-px bg-border-subtle" />

              {/* First Year Total */}
              <div className="p-4 bg-gradient-to-br from-brand-accent/10 to-transparent rounded-medium text-center">
                <p className="text-tiny uppercase tracking-wide text-content-secondary mb-1">First Year Total Return</p>
                <p className="text-display font-bold text-brand-accent tabular-nums">
                  ${totalFirstYearReturn.toLocaleString()}
                </p>
                <p className="text-tiny text-content-tertiary mt-1">Cash Flow + Equity Captured</p>
              </div>

              {/* 5-Year Projection Preview */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">5-Year Hold Projection</h4>
                <div className="space-y-2">
                  {fiveYearProjection.map((year) => (
                    <div key={year.year} className="flex items-center gap-2">
                      <span className="text-tiny text-content-tertiary w-10">Yr {year.year}</span>
                      <div className="flex-1 h-2 bg-surface-tertiary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-success to-success/70 rounded-full"
                          style={{ width: `${Math.min(100, (year.totalReturn / fiveYearProjection[4].totalReturn) * 100)}%` }}
                        />
                      </div>
                      <span className="text-tiny font-medium text-content tabular-nums w-20 text-right">
                        ${(year.totalReturn / 1000).toFixed(0)}K
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="primary" size="sm" fullWidth icon={<Download />}>
                  Save Analysis
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

function PlaceholderCalculator({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-surface-secondary/50 rounded-medium border border-border-subtle">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-content-tertiary" />
        </div>
        <h3 className="text-h3 font-medium text-content mb-2">
          {title} Calculator
        </h3>
        <p className="text-body text-content-secondary max-w-md">
          Coming soon! This creative financing calculator is under development.
        </p>
      </div>
    </div>
  );
}

export function CreativeCalculator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const subParam = searchParams.get("sub") || "subto";
  const [activeStrategy, setActiveStrategy] = React.useState(subParam);
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  React.useEffect(() => {
    if (subParam && creativeStrategies.some(s => s.id === subParam)) {
      setActiveStrategy(subParam);
    }
  }, [subParam]);

  React.useEffect(() => {
    const activeElement = tabRefs.current.get(activeStrategy);
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeStrategy]);

  const handleStrategyChange = (strategyId: string) => {
    setActiveStrategy(strategyId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sub", strategyId);
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="space-y-lg">
      {/* Sub-Navigation */}
      <div className="relative border-b border-border-subtle">
        <div className="flex items-center gap-1">
          {creativeStrategies.map((strategy) => {
            const Icon = strategy.icon;
            return (
              <button
                key={strategy.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(strategy.id, el);
                }}
                onClick={() => handleStrategyChange(strategy.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-small transition-colors whitespace-nowrap",
                  activeStrategy === strategy.id
                    ? "text-content font-medium"
                    : "text-content-secondary hover:text-content"
                )}
              >
                <Icon className="h-4 w-4" />
                {strategy.label}
              </button>
            );
          })}
        </div>

        {/* Animated Underline */}
        <div
          className="absolute bottom-0 h-0.5 bg-brand-accent transition-all duration-200 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      </div>

      {/* Calculator Content */}
      <div className="animate-fade-in">
        {activeStrategy === "subto" && <SubToCalculator />}
        {activeStrategy === "seller-finance" && <PlaceholderCalculator title="Seller Finance" />}
        {activeStrategy === "lease-option" && <PlaceholderCalculator title="Lease Option" />}
        {activeStrategy === "wrap" && <PlaceholderCalculator title="Wraparound" />}
      </div>
    </div>
  );
}
