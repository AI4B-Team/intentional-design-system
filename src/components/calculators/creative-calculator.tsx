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

interface SellerFinanceInputs {
  // Property
  purchasePrice: number;
  downPayment: number;
  propertyValue: number;
  monthlyRent: number;
  closingCosts: number;
  
  // Seller Finance Terms
  interestRate: number;
  amortizationYears: number;
  balloonYears: number; // 0 = no balloon
  
  // Monthly Expenses
  propertyTaxes: number;
  insurance: number;
  otherExpenses: number;
}

const defaultSellerFinanceInputs: SellerFinanceInputs = {
  purchasePrice: 250000,
  downPayment: 25000,
  propertyValue: 250000,
  monthlyRent: 2000,
  closingCosts: 3000,
  
  interestRate: 6,
  amortizationYears: 30,
  balloonYears: 5,
  
  propertyTaxes: 250,
  insurance: 100,
  otherExpenses: 50,
};

interface ScenarioInputs {
  rate: number;
  balloon: number;
}

function SellerFinanceCalculator() {
  const [inputs, setInputs] = React.useState<SellerFinanceInputs>(defaultSellerFinanceInputs);
  const [showExplainer, setShowExplainer] = React.useState(true);
  const [showFullAmortization, setShowFullAmortization] = React.useState(false);
  const [scenarios, setScenarios] = React.useState<ScenarioInputs[]>([
    { rate: 5, balloon: 5 },
    { rate: 6, balloon: 7 },
    { rate: 7, balloon: 0 }, // 0 = no balloon, full amortization
  ]);

  const updateInput = <K extends keyof SellerFinanceInputs>(key: K, value: SellerFinanceInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const updateScenario = (index: number, key: keyof ScenarioInputs, value: number) => {
    setScenarios(prev => prev.map((s, i) => i === index ? { ...s, [key]: value } : s));
  };

  // Calculations
  const downPaymentPercent = (inputs.downPayment / inputs.purchasePrice) * 100;
  const financedAmount = inputs.purchasePrice - inputs.downPayment;
  
  // Monthly P&I calculation
  const monthlyRate = inputs.interestRate / 100 / 12;
  const numPayments = inputs.amortizationYears * 12;
  const monthlyPI = financedAmount > 0 && monthlyRate > 0
    ? financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  
  const monthlyTaxesInsurance = inputs.propertyTaxes + inputs.insurance;
  const totalMonthlyPayment = monthlyPI + monthlyTaxesInsurance + inputs.otherExpenses;
  
  // Balloon calculation
  const balloonMonths = inputs.balloonYears > 0 ? inputs.balloonYears * 12 : numPayments;
  const balloonBalance = (() => {
    if (inputs.balloonYears === 0 || inputs.balloonYears >= inputs.amortizationYears) return 0;
    let balance = financedAmount;
    for (let i = 0; i < balloonMonths; i++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPI - interest;
      balance -= principal;
    }
    return Math.max(0, balance);
  })();
  
  // Buyer Analysis
  const totalCashAtClosing = inputs.downPayment + inputs.closingCosts;
  const monthlyCashFlow = inputs.monthlyRent - totalMonthlyPayment;
  const annualCashFlow = monthlyCashFlow * 12;
  const cashOnCash = totalCashAtClosing > 0 ? (annualCashFlow / totalCashAtClosing) * 100 : 0;
  const equityAtPurchase = inputs.propertyValue - financedAmount;
  
  // Amortization Schedule
  const amortizationSchedule = React.useMemo(() => {
    const schedule: { month: number; payment: number; principal: number; interest: number; balance: number; isBalloon?: boolean }[] = [];
    let balance = financedAmount;
    
    const effectiveMonths = inputs.balloonYears > 0 ? Math.min(balloonMonths, numPayments) : numPayments;
    
    for (let month = 1; month <= effectiveMonths && balance > 0; month++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPI - interest;
      balance = Math.max(0, balance - principal);
      
      schedule.push({
        month,
        payment: monthlyPI,
        principal,
        interest,
        balance,
        isBalloon: inputs.balloonYears > 0 && month === balloonMonths
      });
    }
    
    return schedule;
  }, [financedAmount, monthlyRate, monthlyPI, numPayments, balloonMonths, inputs.balloonYears]);
  
  // Seller Benefit Analysis
  const totalInterestEarned = amortizationSchedule.reduce((sum, row) => sum + row.interest, 0) + 
    (inputs.balloonYears > 0 ? balloonBalance * (inputs.balloonYears / inputs.amortizationYears) * inputs.interestRate / 100 : 0);
  const totalPaymentsToSeller = (monthlyPI * (inputs.balloonYears > 0 ? balloonMonths : numPayments)) + (inputs.balloonYears > 0 ? balloonBalance : 0);
  const totalSellerReceives = inputs.downPayment + totalPaymentsToSeller;
  
  // Present Value calculation (simplified - 5% discount rate)
  const discountRate = 0.05 / 12;
  const presentValueOfNote = (() => {
    let pv = inputs.downPayment;
    for (let i = 1; i <= (inputs.balloonYears > 0 ? balloonMonths : numPayments); i++) {
      pv += monthlyPI / Math.pow(1 + discountRate, i);
    }
    if (inputs.balloonYears > 0) {
      pv += balloonBalance / Math.pow(1 + discountRate, balloonMonths);
    }
    return pv;
  })();
  
  // Scenario calculations
  const calculateScenario = (rate: number, balloon: number) => {
    const scenarioMonthlyRate = rate / 100 / 12;
    const scenarioMonthlyPI = financedAmount > 0 && scenarioMonthlyRate > 0
      ? financedAmount * (scenarioMonthlyRate * Math.pow(1 + scenarioMonthlyRate, numPayments)) / (Math.pow(1 + scenarioMonthlyRate, numPayments) - 1)
      : 0;
    
    const scenarioTotalPayment = scenarioMonthlyPI + monthlyTaxesInsurance + inputs.otherExpenses;
    const scenarioCashFlow = inputs.monthlyRent - scenarioTotalPayment;
    const scenarioCoC = totalCashAtClosing > 0 ? ((scenarioCashFlow * 12) / totalCashAtClosing) * 100 : 0;
    
    // Calculate balloon balance
    const scenarioBalloonMonths = balloon > 0 ? balloon * 12 : numPayments;
    let balance = financedAmount;
    for (let i = 0; i < scenarioBalloonMonths && i < numPayments; i++) {
      const interest = balance * scenarioMonthlyRate;
      const principal = scenarioMonthlyPI - interest;
      balance -= principal;
    }
    const scenarioBalloon = balloon > 0 && balloon < inputs.amortizationYears ? Math.max(0, balance) : 0;
    
    return {
      monthlyPI: scenarioMonthlyPI,
      totalPayment: scenarioTotalPayment,
      cashFlow: scenarioCashFlow,
      cashOnCash: scenarioCoC,
      balloon: scenarioBalloon
    };
  };
  
  // Deal Score
  const dealScore = Math.min(100, Math.max(0,
    (monthlyCashFlow >= 400 ? 30 : monthlyCashFlow >= 200 ? 20 : monthlyCashFlow >= 0 ? 10 : 0) +
    (cashOnCash >= 15 ? 25 : cashOnCash >= 10 ? 20 : cashOnCash >= 5 ? 10 : 0) +
    (downPaymentPercent <= 10 ? 25 : downPaymentPercent <= 20 ? 20 : 15) +
    (inputs.interestRate <= 5 ? 20 : inputs.interestRate <= 7 ? 15 : 10)
  ));

  const handleReset = () => setInputs(defaultSellerFinanceInputs);

  const displaySchedule = showFullAmortization ? amortizationSchedule : amortizationSchedule.slice(0, 24);

  return (
    <div className="space-y-lg">
      {/* Explainer Section */}
      <Collapsible open={showExplainer} onOpenChange={setShowExplainer}>
        <Card variant="default" padding="none" className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full px-md py-4 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
                <h3 className="text-h3 font-medium text-content">What is Seller Financing?</h3>
              </div>
              {showExplainer ? <ChevronUp className="h-5 w-5 text-content-tertiary" /> : <ChevronDown className="h-5 w-5 text-content-tertiary" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-md pb-md">
              <div className="p-4 bg-surface-secondary/50 rounded-medium space-y-4">
                <p className="text-body text-content">
                  <strong>Seller Financing</strong> means the seller acts as the bank. Instead of getting a traditional loan, 
                  you make payments directly to the seller over time.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-small font-medium text-success">Buyer Benefits</h4>
                    <div className="space-y-1">
                      {["No bank qualification needed", "Flexible down payment", "Negotiable terms", "Faster closing"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-small text-content-secondary">
                          <CheckCircle2 className="h-3 w-3 text-success" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-small font-medium text-info">Seller Benefits</h4>
                    <div className="space-y-1">
                      {["Monthly income stream", "Higher total payout", "Tax benefits (installment sale)", "Attracts more buyers"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-small text-content-secondary">
                          <CheckCircle2 className="h-3 w-3 text-info" />
                          {item}
                        </div>
                      ))}
                    </div>
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
          {/* Property */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-h3 font-medium text-content">Property</h3>
              <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={handleReset}>
                Reset All
              </Button>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Purchase Price"
                  value={inputs.purchasePrice}
                  onChange={(v) => updateInput("purchasePrice", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Property Value / ARV"
                  value={inputs.propertyValue}
                  onChange={(v) => updateInput("propertyValue", v)}
                  type="currency"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Down Payment"
                  value={inputs.downPayment}
                  onChange={(v) => updateInput("downPayment", v)}
                  type="currency"
                />
                <div className="space-y-1.5">
                  <label className="text-small font-medium text-content">Down Payment %</label>
                  <div className="h-10 px-3 flex items-center justify-end bg-surface-secondary rounded-small text-body font-semibold text-content tabular-nums">
                    {downPaymentPercent.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Monthly Rent (expected)"
                  value={inputs.monthlyRent}
                  onChange={(v) => updateInput("monthlyRent", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Closing Costs"
                  value={inputs.closingCosts}
                  onChange={(v) => updateInput("closingCosts", v)}
                  type="currency"
                />
              </div>
            </div>
          </Card>

          {/* Seller Finance Terms */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Seller Finance Terms</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="flex items-center justify-between p-3 bg-brand-accent/10 rounded-small">
                <span className="text-small text-brand-accent">Financed Amount</span>
                <span className="text-h3 font-semibold text-brand-accent tabular-nums">
                  ${financedAmount.toLocaleString()}
                </span>
              </div>
              <CalculatorSlider
                label="Interest Rate"
                value={inputs.interestRate}
                onChange={(v) => updateInput("interestRate", v)}
                min={0}
                max={12}
                step={0.25}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-small font-medium text-content">Amortization Period</label>
                  <select
                    value={inputs.amortizationYears}
                    onChange={(e) => updateInput("amortizationYears", Number(e.target.value))}
                    className="flex h-10 w-full rounded-small border border-border bg-white px-3 text-body focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/10"
                  >
                    {[15, 20, 25, 30].map(years => (
                      <option key={years} value={years}>{years} years</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-small font-medium text-content">Balloon Term</label>
                  <select
                    value={inputs.balloonYears}
                    onChange={(e) => updateInput("balloonYears", Number(e.target.value))}
                    className="flex h-10 w-full rounded-small border border-border bg-white px-3 text-body focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/10"
                  >
                    <option value={0}>No Balloon (Full Amort)</option>
                    {[3, 5, 7, 10].map(years => (
                      <option key={years} value={years}>{years} years</option>
                    ))}
                  </select>
                </div>
              </div>
              {inputs.balloonYears > 0 && (
                <div className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded-small">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-small text-warning">Balloon Due in {inputs.balloonYears} years</span>
                  </div>
                  <span className="text-body font-semibold text-warning tabular-nums">
                    ${balloonBalance.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Monthly Expenses */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Monthly Expenses</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <CalculatorInput
                  label="Property Taxes"
                  value={inputs.propertyTaxes}
                  onChange={(v) => updateInput("propertyTaxes", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Insurance"
                  value={inputs.insurance}
                  onChange={(v) => updateInput("insurance", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Other"
                  value={inputs.otherExpenses}
                  onChange={(v) => updateInput("otherExpenses", v)}
                  type="currency"
                />
              </div>
            </div>
          </Card>

          {/* Amortization Schedule */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Amortization Schedule</h3>
            </div>
            <div className="p-md">
              <div className="rounded-medium border border-border-subtle overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-small">
                    <thead className="bg-surface-secondary">
                      <tr>
                        <th className="px-3 py-2 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">Month</th>
                        <th className="px-3 py-2 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">Payment</th>
                        <th className="px-3 py-2 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">Principal</th>
                        <th className="px-3 py-2 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">Interest</th>
                        <th className="px-3 py-2 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displaySchedule.map((row, index) => (
                        <tr 
                          key={row.month} 
                          className={cn(
                            "h-9",
                            index % 2 === 0 ? "bg-white" : "bg-surface-secondary/30",
                            row.isBalloon && "bg-warning/10 border-t-2 border-warning"
                          )}
                        >
                          <td className="px-3">
                            {row.month}
                            {row.isBalloon && <Badge variant="warning" size="sm" className="ml-2">Balloon</Badge>}
                          </td>
                          <td className="px-3 text-right tabular-nums">${row.payment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="px-3 text-right tabular-nums text-success">${row.principal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="px-3 text-right tabular-nums text-content-secondary">${row.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="px-3 text-right tabular-nums font-medium">${row.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {amortizationSchedule.length > 24 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullAmortization(!showFullAmortization)}
                  className="w-full mt-3"
                >
                  {showFullAmortization ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show All {amortizationSchedule.length} Months
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* Seller Benefit Analysis */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Seller Benefit Analysis</h3>
              <p className="text-small text-content-secondary mt-1">Use this to negotiate with the seller</p>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-secondary rounded-medium text-center">
                  <p className="text-tiny uppercase text-content-tertiary mb-1">Cash Sale Today</p>
                  <p className="text-h2 font-bold text-content tabular-nums">${inputs.purchasePrice.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-success/10 rounded-medium text-center">
                  <p className="text-tiny uppercase text-success mb-1">Total with Financing</p>
                  <p className="text-h2 font-bold text-success tabular-nums">${totalSellerReceives.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Down Payment Received</span>
                  <span className="font-medium text-content tabular-nums">${inputs.downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Monthly Income to Seller</span>
                  <span className="font-medium text-success tabular-nums">${monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Total Interest Earned</span>
                  <span className="font-medium text-success tabular-nums">${totalInterestEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Present Value of Note (5% discount)</span>
                  <span className="font-medium text-content tabular-nums">${presentValueOfNote.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="p-3 bg-info/10 border border-info/20 rounded-small">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-small font-medium text-info">Installment Sale Tax Benefit</p>
                    <p className="text-tiny text-content-secondary mt-1">
                      Seller can spread capital gains over the life of the loan, potentially saving thousands in taxes 
                      compared to receiving the full amount in one year.
                    </p>
                  </div>
                </div>
              </div>

              {totalSellerReceives > inputs.purchasePrice && (
                <div className="text-center">
                  <Badge variant="success" size="md">
                    Seller earns ${(totalSellerReceives - inputs.purchasePrice).toLocaleString()} more with financing!
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Scenario Comparison */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Scenario Comparison</h3>
            </div>
            <div className="p-md">
              <div className="overflow-x-auto">
                <table className="w-full text-small">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="py-3 text-left font-medium text-content-secondary">Metric</th>
                      {scenarios.map((s, i) => (
                        <th key={i} className="py-3 text-center font-medium text-content">
                          Scenario {String.fromCharCode(65 + i)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    <tr>
                      <td className="py-3 text-content-secondary">Interest Rate</td>
                      {scenarios.map((s, i) => {
                        const calc = calculateScenario(s.rate, s.balloon);
                        return (
                          <td key={i} className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => updateScenario(i, 'rate', Math.max(0, s.rate - 0.5))}
                                className="h-6 w-6 rounded bg-surface-secondary hover:bg-surface-tertiary flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="w-12 font-semibold tabular-nums">{s.rate}%</span>
                              <button
                                onClick={() => updateScenario(i, 'rate', Math.min(15, s.rate + 0.5))}
                                className="h-6 w-6 rounded bg-surface-secondary hover:bg-surface-tertiary flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-3 text-content-secondary">Balloon</td>
                      {scenarios.map((s, i) => (
                        <td key={i} className="py-3 text-center">
                          <select
                            value={s.balloon}
                            onChange={(e) => updateScenario(i, 'balloon', Number(e.target.value))}
                            className="h-8 px-2 rounded border border-border bg-white text-small text-center"
                          >
                            <option value={0}>None</option>
                            {[3, 5, 7, 10].map(y => (
                              <option key={y} value={y}>{y} yr</option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 text-content-secondary">Monthly P&I</td>
                      {scenarios.map((s, i) => {
                        const calc = calculateScenario(s.rate, s.balloon);
                        return (
                          <td key={i} className="py-3 text-center font-medium tabular-nums">
                            ${calc.monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-3 text-content-secondary">Monthly Cash Flow</td>
                      {scenarios.map((s, i) => {
                        const calc = calculateScenario(s.rate, s.balloon);
                        const isBest = calc.cashFlow === Math.max(...scenarios.map(sc => calculateScenario(sc.rate, sc.balloon).cashFlow));
                        return (
                          <td key={i} className={cn("py-3 text-center font-medium tabular-nums", isBest && "text-success")}>
                            ${calc.cashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            {isBest && <span className="ml-1">✓</span>}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-3 text-content-secondary">Cash-on-Cash</td>
                      {scenarios.map((s, i) => {
                        const calc = calculateScenario(s.rate, s.balloon);
                        const isBest = calc.cashOnCash === Math.max(...scenarios.map(sc => calculateScenario(sc.rate, sc.balloon).cashOnCash));
                        return (
                          <td key={i} className={cn("py-3 text-center font-medium tabular-nums", isBest && "text-success")}>
                            {calc.cashOnCash.toFixed(1)}%
                            {isBest && <span className="ml-1">✓</span>}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-3 text-content-secondary">Balloon Due</td>
                      {scenarios.map((s, i) => {
                        const calc = calculateScenario(s.rate, s.balloon);
                        return (
                          <td key={i} className="py-3 text-center font-medium tabular-nums">
                            {calc.balloon > 0 ? `$${calc.balloon.toLocaleString()}` : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Negotiation Helper */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Negotiation Helper</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="p-4 bg-surface-secondary rounded-medium">
                <h4 className="text-small font-medium text-content mb-2">
                  If seller wants ${inputs.purchasePrice.toLocaleString()} purchase price:
                </h4>
                <p className="text-body text-content-secondary">
                  Offer <span className="font-semibold text-brand-accent">{inputs.interestRate}% interest</span> with{" "}
                  <span className="font-semibold text-brand-accent">
                    {inputs.balloonYears > 0 ? `${inputs.balloonYears}-year balloon` : "30-year full amortization"}
                  </span>
                  {" "}for monthly payments of{" "}
                  <span className="font-semibold text-success">${monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </p>
              </div>
              
              <div className="p-4 bg-surface-secondary rounded-medium">
                <h4 className="text-small font-medium text-content mb-2">
                  If seller wants ${monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month income:
                </h4>
                <p className="text-body text-content-secondary">
                  Structure at <span className="font-semibold text-brand-accent">${inputs.purchasePrice.toLocaleString()}</span> price,{" "}
                  <span className="font-semibold text-brand-accent">${inputs.downPayment.toLocaleString()}</span> down ({downPaymentPercent.toFixed(0)}%),{" "}
                  <span className="font-semibold text-brand-accent">{inputs.interestRate}%</span> rate over{" "}
                  <span className="font-semibold text-brand-accent">{inputs.amortizationYears} years</span>
                </p>
              </div>

              <div className="p-4 bg-info/10 border border-info/20 rounded-medium">
                <h4 className="text-small font-medium text-info mb-2">💡 Higher Price with Better Terms</h4>
                <p className="text-small text-content-secondary">
                  Offering ${(inputs.purchasePrice * 1.05).toLocaleString()} (+5%) at{" "}
                  <span className="font-medium">{Math.max(0, inputs.interestRate - 1)}%</span> rate still gives you{" "}
                  <span className="font-medium text-success">
                    ${(inputs.monthlyRent - calculateScenario(inputs.interestRate - 1, inputs.balloonYears).totalPayment).toLocaleString()}/mo
                  </span>{" "}
                  cash flow while seller gets more total!
                </p>
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
              {/* Payment Breakdown */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">Payment Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Monthly P&I</span>
                    <span className="font-medium text-content tabular-nums">${monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Taxes & Insurance</span>
                    <span className="font-medium text-content tabular-nums">${monthlyTaxesInsurance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Other Expenses</span>
                    <span className="font-medium text-content tabular-nums">${inputs.otherExpenses.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border-subtle" />
                  <div className="flex justify-between text-body">
                    <span className="font-medium text-content">Total Monthly</span>
                    <span className="font-bold text-content tabular-nums">${totalMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              {/* Buyer Analysis */}
              <MetricGrid columns={2}>
                <KeyMetric 
                  label="Cash at Closing" 
                  value={totalCashAtClosing} 
                  format="currency"
                />
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
                  trend={cashOnCash >= 10 ? "positive" : cashOnCash >= 5 ? "neutral" : "negative"}
                />
                <KeyMetric 
                  label="Equity at Purchase" 
                  value={equityAtPurchase} 
                  format="currency"
                  trend="positive"
                />
              </MetricGrid>

              {inputs.balloonYears > 0 && (
                <>
                  <div className="h-px bg-border-subtle" />
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-small">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-warning" />
                      <span className="text-small font-medium text-warning">Balloon Payment</span>
                    </div>
                    <p className="text-h3 font-bold text-warning tabular-nums">${balloonBalance.toLocaleString()}</p>
                    <p className="text-tiny text-content-secondary mt-1">Due in {inputs.balloonYears} years ({inputs.balloonYears * 12} months)</p>
                  </div>
                </>
              )}

              <div className="h-px bg-border-subtle" />

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-secondary rounded-medium text-center">
                  <p className="text-tiny text-content-tertiary mb-1">Down Payment</p>
                  <p className="text-body font-semibold text-content">{downPaymentPercent.toFixed(0)}%</p>
                </div>
                <div className="p-3 bg-surface-secondary rounded-medium text-center">
                  <p className="text-tiny text-content-tertiary mb-1">Interest Rate</p>
                  <p className="text-body font-semibold text-content">{inputs.interestRate}%</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="primary" size="sm" fullWidth icon={<Download />}>
                  Save Deal
                </Button>
                <Button variant="secondary" size="sm" fullWidth icon={<FileText />}>
                  Seller Presentation
                </Button>
              </div>
            </div>
          </ResultsCard>
        </div>
      </div>
    </div>
  );
}

// ============ LEASE OPTION CALCULATOR ============

interface LeaseOptionInputs {
  // Terms with Seller
  currentPropertyValue: number;
  optionFeeToSeller: number;
  strikePriceFromSeller: number;
  monthlyRentToSeller: number;
  optionPeriodMonths: number;
  
  // Terms with Tenant-Buyer (Sandwich)
  optionFeeFromTB: number;
  strikePriceToTB: number;
  monthlyRentFromTB: number;
  rentCreditPercent: number;
  
  // Appreciation
  appreciationRate: number;
  closingCosts: number;
}

const defaultLeaseOptionInputs: LeaseOptionInputs = {
  currentPropertyValue: 250000,
  optionFeeToSeller: 5000,
  strikePriceFromSeller: 240000,
  monthlyRentToSeller: 1500,
  optionPeriodMonths: 24,
  
  optionFeeFromTB: 10000,
  strikePriceToTB: 275000,
  monthlyRentFromTB: 1900,
  rentCreditPercent: 15,
  
  appreciationRate: 3,
  closingCosts: 5000,
};

function LeaseOptionCalculator() {
  const [inputs, setInputs] = React.useState<LeaseOptionInputs>(defaultLeaseOptionInputs);
  const [showExplainer, setShowExplainer] = React.useState(true);

  const updateInput = <K extends keyof LeaseOptionInputs>(key: K, value: LeaseOptionInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Cash Position
  const netUpfront = inputs.optionFeeFromTB - inputs.optionFeeToSeller;
  const monthlyCashFlow = inputs.monthlyRentFromTB - inputs.monthlyRentToSeller;
  const annualCashFlow = monthlyCashFlow * 12;
  const totalMonthsCashFlow = monthlyCashFlow * inputs.optionPeriodMonths;
  
  // Rent Credit accumulation
  const monthlyRentCredit = inputs.monthlyRentFromTB * (inputs.rentCreditPercent / 100);
  const totalRentCredits = monthlyRentCredit * inputs.optionPeriodMonths;
  
  // If Tenant-Buyer Exercises
  const grossSpreadOnExercise = inputs.strikePriceToTB - inputs.strikePriceFromSeller;
  const netProfitOnExercise = grossSpreadOnExercise - inputs.optionFeeToSeller - inputs.closingCosts - totalRentCredits;
  const totalProfitIfExercised = netProfitOnExercise + totalMonthsCashFlow + netUpfront;
  
  // If Tenant-Buyer Does NOT Exercise
  const nonRefundableKept = inputs.optionFeeFromTB;
  const totalIfNotExercised = nonRefundableKept + totalMonthsCashFlow;
  
  // Appreciation
  const yearsInOption = inputs.optionPeriodMonths / 12;
  const appreciatedValue = inputs.currentPropertyValue * Math.pow(1 + inputs.appreciationRate / 100, yearsInOption);
  const appreciationGain = appreciatedValue - inputs.currentPropertyValue;
  const lockedInEquity = appreciatedValue - inputs.strikePriceFromSeller;
  
  // Deal Score
  const dealScore = Math.min(100, Math.max(0,
    (netUpfront >= 5000 ? 25 : netUpfront >= 2000 ? 15 : netUpfront >= 0 ? 10 : 0) +
    (monthlyCashFlow >= 400 ? 25 : monthlyCashFlow >= 200 ? 20 : monthlyCashFlow >= 100 ? 10 : 0) +
    (grossSpreadOnExercise >= 30000 ? 25 : grossSpreadOnExercise >= 20000 ? 20 : grossSpreadOnExercise >= 10000 ? 15 : 10) +
    (inputs.strikePriceFromSeller < inputs.currentPropertyValue ? 25 : 15)
  ));

  const handleReset = () => setInputs(defaultLeaseOptionInputs);

  return (
    <div className="space-y-lg">
      {/* Explainer Section */}
      <Collapsible open={showExplainer} onOpenChange={setShowExplainer}>
        <Card variant="default" padding="none" className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full px-md py-4 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center">
                  <Home className="h-4 w-4 text-info" />
                </div>
                <h3 className="text-h3 font-medium text-content">What is a Lease Option?</h3>
              </div>
              {showExplainer ? <ChevronUp className="h-5 w-5 text-content-tertiary" /> : <ChevronDown className="h-5 w-5 text-content-tertiary" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-md pb-md">
              <div className="p-4 bg-surface-secondary/50 rounded-medium space-y-4">
                <p className="text-body text-content">
                  A <strong>Lease Option</strong> is a lease agreement that includes the option (not obligation) to purchase the property 
                  at a predetermined price within a specified time period.
                </p>
                <div className="p-3 bg-brand-accent/10 border border-brand-accent/20 rounded-small">
                  <h4 className="text-small font-medium text-brand-accent mb-2">🥪 Sandwich Lease Option</h4>
                  <p className="text-small text-content-secondary">
                    You get an option from the seller, then give a separate option to a tenant-buyer. 
                    You profit from the spread in option fees, monthly rent, and strike prices.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-surface-tertiary rounded-small">
                    <div className="text-h3 font-bold text-success">1</div>
                    <p className="text-tiny text-content-secondary">Get option from seller</p>
                  </div>
                  <div className="text-center p-3 bg-surface-tertiary rounded-small">
                    <div className="text-h3 font-bold text-info">2</div>
                    <p className="text-tiny text-content-secondary">Find tenant-buyer</p>
                  </div>
                  <div className="text-center p-3 bg-surface-tertiary rounded-small">
                    <div className="text-h3 font-bold text-brand-accent">3</div>
                    <p className="text-tiny text-content-secondary">Profit from spread</p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg">
        {/* Inputs */}
        <div className="lg:col-span-3 space-y-lg">
          {/* Terms with Seller */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-h3 font-medium text-content">Terms with Seller (Your Purchase Option)</h3>
              <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={handleReset}>
                Reset All
              </Button>
            </div>
            <div className="p-md space-y-4">
              <CalculatorInput
                label="Current Property Value"
                value={inputs.currentPropertyValue}
                onChange={(v) => updateInput("currentPropertyValue", v)}
                type="currency"
              />
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Option Fee to Seller"
                  value={inputs.optionFeeToSeller}
                  onChange={(v) => updateInput("optionFeeToSeller", v)}
                  type="currency"
                  tooltip="Non-refundable fee for the option"
                />
                <CalculatorInput
                  label="Your Strike Price"
                  value={inputs.strikePriceFromSeller}
                  onChange={(v) => updateInput("strikePriceFromSeller", v)}
                  type="currency"
                  tooltip="Price you can buy at"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Monthly Rent to Seller"
                  value={inputs.monthlyRentToSeller}
                  onChange={(v) => updateInput("monthlyRentToSeller", v)}
                  type="currency"
                />
                <CalculatorSlider
                  label="Option Period"
                  value={inputs.optionPeriodMonths}
                  onChange={(v) => updateInput("optionPeriodMonths", v)}
                  min={6}
                  max={60}
                  step={6}
                  suffix=" mo"
                  formatValue={(v) => `${v} months`}
                />
              </div>
              {inputs.strikePriceFromSeller < inputs.currentPropertyValue && (
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-small">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-small text-success">
                    Strike price is ${(inputs.currentPropertyValue - inputs.strikePriceFromSeller).toLocaleString()} below market!
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Terms with Tenant-Buyer */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Terms with Tenant-Buyer (Sandwich)</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Option Fee from Tenant-Buyer"
                  value={inputs.optionFeeFromTB}
                  onChange={(v) => updateInput("optionFeeFromTB", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Strike Price to Tenant-Buyer"
                  value={inputs.strikePriceToTB}
                  onChange={(v) => updateInput("strikePriceToTB", v)}
                  type="currency"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Monthly Rent from Tenant-Buyer"
                  value={inputs.monthlyRentFromTB}
                  onChange={(v) => updateInput("monthlyRentFromTB", v)}
                  type="currency"
                />
                <CalculatorSlider
                  label="Rent Credit"
                  value={inputs.rentCreditPercent}
                  onChange={(v) => updateInput("rentCreditPercent", v)}
                  min={0}
                  max={30}
                  step={5}
                  tooltip="Portion of rent applied to purchase"
                />
              </div>
              <div className="p-3 bg-info/10 rounded-small">
                <div className="flex justify-between text-small">
                  <span className="text-info">Monthly Rent Credit to TB</span>
                  <span className="font-semibold text-info tabular-nums">${monthlyRentCredit.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between text-small mt-1">
                  <span className="text-info">Total Credits if Exercised</span>
                  <span className="font-semibold text-info tabular-nums">${totalRentCredits.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Appreciation Modeling */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Appreciation Modeling</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CalculatorSlider
                  label="Expected Appreciation"
                  value={inputs.appreciationRate}
                  onChange={(v) => updateInput("appreciationRate", v)}
                  min={0}
                  max={10}
                  step={0.5}
                  tooltip="Annual appreciation rate"
                />
                <CalculatorInput
                  label="Closing Costs (on exercise)"
                  value={inputs.closingCosts}
                  onChange={(v) => updateInput("closingCosts", v)}
                  type="currency"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-secondary rounded-medium text-center">
                  <p className="text-tiny uppercase text-content-tertiary mb-1">Value at End of Option</p>
                  <p className="text-h2 font-bold text-content tabular-nums">${appreciatedValue.toLocaleString()}</p>
                  <p className="text-tiny text-success mt-1">+${appreciationGain.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-success/10 rounded-medium text-center">
                  <p className="text-tiny uppercase text-success mb-1">Locked-In Equity</p>
                  <p className="text-h2 font-bold text-success tabular-nums">${lockedInEquity.toLocaleString()}</p>
                  <p className="text-tiny text-content-secondary mt-1">If you exercise at {inputs.strikePriceFromSeller.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Outcome Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* If Exercises */}
            <Card variant="default" padding="none" className="border-success/30">
              <div className="px-md py-4 border-b border-success/20 bg-success/5">
                <h3 className="text-h3 font-medium text-success flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  If TB Exercises Option
                </h3>
              </div>
              <div className="p-md space-y-3">
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Your Purchase Price</span>
                  <span className="font-medium text-content tabular-nums">${inputs.strikePriceFromSeller.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Sale Price to TB</span>
                  <span className="font-medium text-content tabular-nums">${inputs.strikePriceToTB.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Gross Spread</span>
                  <span className="font-medium text-success tabular-nums">${grossSpreadOnExercise.toLocaleString()}</span>
                </div>
                <div className="h-px bg-border-subtle" />
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Less: Option Fee Paid</span>
                  <span className="font-medium text-destructive tabular-nums">-${inputs.optionFeeToSeller.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Less: Rent Credits</span>
                  <span className="font-medium text-destructive tabular-nums">-${totalRentCredits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Less: Closing Costs</span>
                  <span className="font-medium text-destructive tabular-nums">-${inputs.closingCosts.toLocaleString()}</span>
                </div>
                <div className="h-px bg-border-subtle" />
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Net Profit on Sale</span>
                  <span className="font-medium text-success tabular-nums">${netProfitOnExercise.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Plus: Cash Flow Collected</span>
                  <span className="font-medium text-success tabular-nums">+${totalMonthsCashFlow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Plus: Net Option Fees</span>
                  <span className="font-medium text-success tabular-nums">+${netUpfront.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-success/10 rounded-small">
                  <div className="flex justify-between">
                    <span className="font-medium text-success">TOTAL PROFIT</span>
                    <span className="text-h3 font-bold text-success tabular-nums">${totalProfitIfExercised.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* If Does NOT Exercise */}
            <Card variant="default" padding="none" className="border-warning/30">
              <div className="px-md py-4 border-b border-warning/20 bg-warning/5">
                <h3 className="text-h3 font-medium text-warning flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  If TB Does NOT Exercise
                </h3>
              </div>
              <div className="p-md space-y-3">
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Option Fee Kept</span>
                  <span className="font-medium text-success tabular-nums">${inputs.optionFeeFromTB.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-content-secondary">Cash Flow Collected</span>
                  <span className="font-medium text-success tabular-nums">${totalMonthsCashFlow.toLocaleString()}</span>
                </div>
                <div className="h-px bg-border-subtle" />
                <div className="p-3 bg-warning/10 rounded-small">
                  <div className="flex justify-between">
                    <span className="font-medium text-warning">TOTAL KEPT</span>
                    <span className="text-h3 font-bold text-warning tabular-nums">${totalIfNotExercised.toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-3 bg-info/10 border border-info/20 rounded-small mt-4">
                  <p className="text-small text-info">
                    <strong>Plus:</strong> You can re-lease option to a new tenant-buyer and repeat the process!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-lg">
          <ResultsCard
            title="Sandwich L/O Analysis"
            keyResult={{
              label: "Monthly Cash Flow",
              value: monthlyCashFlow,
              format: "currency",
              trend: monthlyCashFlow > 0 ? "positive" : "negative",
            }}
            dealScore={dealScore}
          >
            <div className="space-y-md">
              {/* Cash Position */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">Upfront Cash Position</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Option Fee In (from TB)</span>
                    <span className="font-medium text-success tabular-nums">+${inputs.optionFeeFromTB.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Option Fee Out (to Seller)</span>
                    <span className="font-medium text-destructive tabular-nums">-${inputs.optionFeeToSeller.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border-subtle" />
                  <div className="flex justify-between">
                    <span className="font-medium text-content">Net Upfront</span>
                    <span className={cn("text-h3 font-bold tabular-nums", netUpfront >= 0 ? "text-success" : "text-destructive")}>
                      ${netUpfront.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              {/* Monthly Position */}
              <MetricGrid columns={2}>
                <KeyMetric 
                  label="Monthly Spread" 
                  value={monthlyCashFlow} 
                  format="currency"
                  trend={monthlyCashFlow > 0 ? "positive" : "negative"}
                />
                <KeyMetric 
                  label="Annual Cash Flow" 
                  value={annualCashFlow} 
                  format="currency"
                  trend={annualCashFlow > 0 ? "positive" : "negative"}
                />
              </MetricGrid>

              <div className="h-px bg-border-subtle" />

              {/* Spreads */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">Your Spreads</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-secondary rounded-medium text-center">
                    <p className="text-tiny text-content-tertiary">Option Fee Spread</p>
                    <p className="text-h3 font-bold text-content tabular-nums">${netUpfront.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-surface-secondary rounded-medium text-center">
                    <p className="text-tiny text-content-tertiary">Price Spread</p>
                    <p className="text-h3 font-bold text-content tabular-nums">${grossSpreadOnExercise.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              {/* Quick Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-success/10 rounded-small">
                  <span className="text-small text-success">If Exercised</span>
                  <span className="font-bold text-success tabular-nums">${totalProfitIfExercised.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-warning/10 rounded-small">
                  <span className="text-small text-warning">If Not Exercised</span>
                  <span className="font-bold text-warning tabular-nums">${totalIfNotExercised.toLocaleString()}</span>
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

// ============ WRAPAROUND CALCULATOR ============

interface WrapInputs {
  // Underlying Loan
  underlyingBalance: number;
  underlyingRate: number;
  underlyingPayment: number;
  underlyingYearsRemaining: number;
  
  // Your Acquisition
  purchasePrice: number;
  cashToSeller: number;
  closingCosts: number;
  
  // Wrap Note
  wrapSalePrice: number;
  wrapDownPayment: number;
  wrapRate: number;
  wrapAmortizationYears: number;
}

const defaultWrapInputs: WrapInputs = {
  underlyingBalance: 180000,
  underlyingRate: 3.5,
  underlyingPayment: 1150,
  underlyingYearsRemaining: 25,
  
  purchasePrice: 200000,
  cashToSeller: 10000,
  closingCosts: 3000,
  
  wrapSalePrice: 260000,
  wrapDownPayment: 20000,
  wrapRate: 7.5,
  wrapAmortizationYears: 30,
};

function WrapCalculator() {
  const [inputs, setInputs] = React.useState<WrapInputs>(defaultWrapInputs);
  const [showExplainer, setShowExplainer] = React.useState(true);

  const updateInput = <K extends keyof WrapInputs>(key: K, value: WrapInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Calculations
  const wrapLoanAmount = inputs.wrapSalePrice - inputs.wrapDownPayment;
  const totalBasis = inputs.underlyingBalance + inputs.cashToSeller + inputs.closingCosts;
  
  // Wrap monthly payment calculation
  const wrapMonthlyRate = inputs.wrapRate / 100 / 12;
  const wrapNumPayments = inputs.wrapAmortizationYears * 12;
  const wrapMonthlyPayment = wrapLoanAmount > 0 && wrapMonthlyRate > 0
    ? wrapLoanAmount * (wrapMonthlyRate * Math.pow(1 + wrapMonthlyRate, wrapNumPayments)) / (Math.pow(1 + wrapMonthlyRate, wrapNumPayments) - 1)
    : 0;
  
  // Monthly spread
  const monthlySpread = wrapMonthlyPayment - inputs.underlyingPayment;
  const annualSpread = monthlySpread * 12;
  
  // Interest rate arbitrage
  const rateSpread = inputs.wrapRate - inputs.underlyingRate;
  const annualArbitrageProfit = (rateSpread / 100) * inputs.underlyingBalance;
  
  // Front-end profit
  const frontEndProfit = inputs.wrapDownPayment + (inputs.purchasePrice - totalBasis);
  
  // Principal position over time
  const calculateBalances = (years: number) => {
    const underlyingMonthlyRate = inputs.underlyingRate / 100 / 12;
    const underlyingPayments = inputs.underlyingYearsRemaining * 12;
    
    let underlyingBal = inputs.underlyingBalance;
    let wrapBal = wrapLoanAmount;
    
    for (let m = 0; m < years * 12; m++) {
      // Underlying paydown
      const underlyingInterest = underlyingBal * underlyingMonthlyRate;
      const underlyingPrincipal = inputs.underlyingPayment - underlyingInterest;
      underlyingBal = Math.max(0, underlyingBal - underlyingPrincipal);
      
      // Wrap paydown
      const wrapInterest = wrapBal * wrapMonthlyRate;
      const wrapPrincipal = wrapMonthlyPayment - wrapInterest;
      wrapBal = Math.max(0, wrapBal - wrapPrincipal);
    }
    
    return { underlying: underlyingBal, wrap: wrapBal, equity: wrapBal - underlyingBal };
  };
  
  // Early payoff scenarios
  const earlyPayoffScenarios = [3, 5, 7].map(year => {
    const balances = calculateBalances(year);
    const cashFlowCollected = monthlySpread * year * 12;
    const profit = balances.wrap - balances.underlying + cashFlowCollected + inputs.wrapDownPayment;
    return {
      year,
      wrapBalance: balances.wrap,
      underlyingPayoff: balances.underlying,
      cashFlowCollected,
      totalProfit: profit
    };
  });
  
  // Full term projections
  const totalInterestCollected = wrapMonthlyPayment * wrapNumPayments - wrapLoanAmount;
  const underlyingTotalPayments = inputs.underlyingPayment * inputs.underlyingYearsRemaining * 12;
  const underlyingInterestPaid = underlyingTotalPayments - inputs.underlyingBalance;
  const netInterestProfit = totalInterestCollected - underlyingInterestPaid;
  
  // Deal Score
  const dealScore = Math.min(100, Math.max(0,
    (monthlySpread >= 400 ? 30 : monthlySpread >= 200 ? 20 : monthlySpread >= 100 ? 10 : 0) +
    (rateSpread >= 3 ? 25 : rateSpread >= 2 ? 20 : rateSpread >= 1 ? 15 : 10) +
    (inputs.wrapDownPayment >= 20000 ? 25 : inputs.wrapDownPayment >= 10000 ? 20 : 15) +
    (inputs.underlyingRate <= 4 ? 20 : inputs.underlyingRate <= 5 ? 15 : 10)
  ));

  const handleReset = () => setInputs(defaultWrapInputs);

  return (
    <div className="space-y-lg">
      {/* Explainer Section */}
      <Collapsible open={showExplainer} onOpenChange={setShowExplainer}>
        <Card variant="default" padding="none" className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full px-md py-4 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-brand-accent/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-brand-accent" />
                </div>
                <h3 className="text-h3 font-medium text-content">What is a Wraparound Mortgage?</h3>
              </div>
              {showExplainer ? <ChevronUp className="h-5 w-5 text-content-tertiary" /> : <ChevronDown className="h-5 w-5 text-content-tertiary" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-md pb-md">
              <div className="p-4 bg-surface-secondary/50 rounded-medium space-y-4">
                <p className="text-body text-content">
                  A <strong>Wraparound Mortgage (Wrap)</strong> is when you buy a property subject-to the existing loan, 
                  then sell it with seller financing at a higher rate. Your note "wraps around" the underlying debt.
                </p>
                
                {/* Visual Diagram */}
                <div className="space-y-3 p-4 bg-white rounded-medium border border-border-subtle">
                  <h4 className="text-small font-medium text-content text-center">Wrap Structure</h4>
                  
                  {/* Your Buyer */}
                  <div className="p-3 bg-info/10 border border-info/30 rounded-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-small font-medium text-info">Your Buyer</span>
                      <span className="text-small text-info">Pays you ${wrapMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo @ {inputs.wrapRate}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 text-content-tertiary rotate-90" />
                  </div>
                  
                  {/* You */}
                  <div className="p-3 bg-success/10 border-2 border-success rounded-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-small font-medium text-success">YOU (The Spread)</span>
                      <span className="text-h3 font-bold text-success">${monthlySpread.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 text-content-tertiary rotate-90" />
                  </div>
                  
                  {/* Underlying Lender */}
                  <div className="p-3 bg-surface-secondary border border-border-subtle rounded-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-small font-medium text-content">Underlying Lender</span>
                      <span className="text-small text-content-secondary">You pay ${inputs.underlyingPayment.toLocaleString()}/mo @ {inputs.underlyingRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg">
        {/* Inputs */}
        <div className="lg:col-span-3 space-y-lg">
          {/* Underlying Loan */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-h3 font-medium text-content">Underlying Loan (Subject-To)</h3>
              <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={handleReset}>
                Reset All
              </Button>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Current Balance"
                  value={inputs.underlyingBalance}
                  onChange={(v) => updateInput("underlyingBalance", v)}
                  type="currency"
                />
                <CalculatorSlider
                  label="Interest Rate"
                  value={inputs.underlyingRate}
                  onChange={(v) => updateInput("underlyingRate", v)}
                  min={2}
                  max={8}
                  step={0.125}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Monthly Payment"
                  value={inputs.underlyingPayment}
                  onChange={(v) => updateInput("underlyingPayment", v)}
                  type="currency"
                />
                <CalculatorSlider
                  label="Years Remaining"
                  value={inputs.underlyingYearsRemaining}
                  onChange={(v) => updateInput("underlyingYearsRemaining", v)}
                  min={5}
                  max={30}
                  step={1}
                  suffix=" yrs"
                  formatValue={(v) => `${v} years`}
                />
              </div>
            </div>
          </Card>

          {/* Your Acquisition */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Your Acquisition</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <CalculatorInput
                  label="Purchase Price"
                  value={inputs.purchasePrice}
                  onChange={(v) => updateInput("purchasePrice", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Cash to Seller"
                  value={inputs.cashToSeller}
                  onChange={(v) => updateInput("cashToSeller", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Closing Costs"
                  value={inputs.closingCosts}
                  onChange={(v) => updateInput("closingCosts", v)}
                  type="currency"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-small">
                <span className="text-small text-content-secondary">Your Total Basis</span>
                <span className="text-h3 font-semibold text-content tabular-nums">${totalBasis.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Wrap Note */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Wrap Note (Your Seller Financing)</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Sale Price to Buyer"
                  value={inputs.wrapSalePrice}
                  onChange={(v) => updateInput("wrapSalePrice", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Down Payment from Buyer"
                  value={inputs.wrapDownPayment}
                  onChange={(v) => updateInput("wrapDownPayment", v)}
                  type="currency"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-brand-accent/10 rounded-small">
                <span className="text-small text-brand-accent">Wrap Loan Amount</span>
                <span className="text-h3 font-semibold text-brand-accent tabular-nums">${wrapLoanAmount.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorSlider
                  label="Your Wrap Rate"
                  value={inputs.wrapRate}
                  onChange={(v) => updateInput("wrapRate", v)}
                  min={4}
                  max={12}
                  step={0.25}
                />
                <CalculatorSlider
                  label="Amortization"
                  value={inputs.wrapAmortizationYears}
                  onChange={(v) => updateInput("wrapAmortizationYears", v)}
                  min={15}
                  max={30}
                  step={5}
                  suffix=" yrs"
                  formatValue={(v) => `${v} years`}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-small">
                <span className="text-small text-success">Buyer's Monthly Payment to You</span>
                <span className="text-h3 font-semibold text-success tabular-nums">${wrapMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </Card>

          {/* Interest Rate Arbitrage */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Interest Rate Arbitrage</h3>
            </div>
            <div className="p-md">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-surface-secondary rounded-medium text-center">
                  <p className="text-tiny uppercase text-content-tertiary mb-1">Underlying Rate</p>
                  <p className="text-h2 font-bold text-content">{inputs.underlyingRate}%</p>
                </div>
                <div className="p-4 bg-brand-accent/10 rounded-medium text-center">
                  <p className="text-tiny uppercase text-brand-accent mb-1">Your Wrap Rate</p>
                  <p className="text-h2 font-bold text-brand-accent">{inputs.wrapRate}%</p>
                </div>
                <div className="p-4 bg-success/10 rounded-medium text-center">
                  <p className="text-tiny uppercase text-success mb-1">Rate Spread</p>
                  <p className="text-h2 font-bold text-success">{rateSpread.toFixed(2)}%</p>
                </div>
              </div>
              <div className="p-3 bg-info/10 border border-info/20 rounded-small">
                <p className="text-small text-info">
                  <strong>Annual Arbitrage Profit:</strong> {rateSpread.toFixed(2)}% × ${inputs.underlyingBalance.toLocaleString()} = <strong>${annualArbitrageProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}/year</strong>
                </p>
              </div>
            </div>
          </Card>

          {/* Early Payoff Scenarios */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Early Payoff Scenarios</h3>
              <p className="text-small text-content-secondary mt-1">If buyer refinances early</p>
            </div>
            <div className="p-md">
              <div className="overflow-x-auto">
                <table className="w-full text-small">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="py-3 text-left font-medium text-content-secondary">If Refi in Year...</th>
                      {earlyPayoffScenarios.map(s => (
                        <th key={s.year} className="py-3 text-center font-medium text-content">Year {s.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    <tr>
                      <td className="py-3 text-content-secondary">Wrap Balance Received</td>
                      {earlyPayoffScenarios.map(s => (
                        <td key={s.year} className="py-3 text-center font-medium tabular-nums">${s.wrapBalance.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 text-content-secondary">Underlying Payoff</td>
                      {earlyPayoffScenarios.map(s => (
                        <td key={s.year} className="py-3 text-center tabular-nums text-destructive">-${s.underlyingPayoff.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 text-content-secondary">Cash Flow Collected</td>
                      {earlyPayoffScenarios.map(s => (
                        <td key={s.year} className="py-3 text-center tabular-nums text-success">+${s.cashFlowCollected.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="bg-success/5">
                      <td className="py-3 font-medium text-success">Total Profit</td>
                      {earlyPayoffScenarios.map(s => (
                        <td key={s.year} className="py-3 text-center font-bold text-success tabular-nums">${s.totalProfit.toLocaleString()}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Risk Warning */}
          <Card variant="default" padding="none" className="border-warning/30">
            <div className="px-md py-4 border-b border-warning/20 bg-warning/5">
              <h3 className="text-h3 font-medium text-warning flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Considerations
              </h3>
            </div>
            <div className="p-md space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-small font-medium text-content">Due-on-Sale Clause</p>
                    <p className="text-tiny text-content-secondary">The underlying lender could call the loan due. Mitigate with proper entity structure and land trusts.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-small font-medium text-content">Legal Documentation</p>
                    <p className="text-tiny text-content-secondary">Work with a real estate attorney experienced in wraps. Use proper promissory notes and deed of trust.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-small font-medium text-content">Third-Party Servicing</p>
                    <p className="text-tiny text-content-secondary">Use a licensed loan servicer to collect payments and distribute to underlying lender. This protects both parties.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-lg">
          <ResultsCard
            title="Wrap Analysis"
            keyResult={{
              label: "Monthly Spread",
              value: monthlySpread,
              format: "currency",
              trend: monthlySpread > 0 ? "positive" : "negative",
            }}
            dealScore={dealScore}
          >
            <div className="space-y-md">
              {/* Monthly Spread Breakdown */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">Monthly Cash Flow</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Payment from Buyer</span>
                    <span className="font-medium text-success tabular-nums">+${wrapMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Payment to Underlying</span>
                    <span className="font-medium text-destructive tabular-nums">-${inputs.underlyingPayment.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border-subtle" />
                  <div className="flex justify-between">
                    <span className="font-medium text-content">Monthly Spread</span>
                    <span className="text-h3 font-bold text-success tabular-nums">${monthlySpread.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              {/* Key Metrics */}
              <MetricGrid columns={2}>
                <KeyMetric 
                  label="Annual Spread" 
                  value={annualSpread} 
                  format="currency"
                  trend="positive"
                />
                <KeyMetric 
                  label="Down Payment In" 
                  value={inputs.wrapDownPayment} 
                  format="currency"
                  trend="positive"
                />
                <KeyMetric 
                  label="Rate Arbitrage" 
                  value={rateSpread} 
                  format="percentage"
                  trend="positive"
                />
                <KeyMetric 
                  label="Front-End Profit" 
                  value={frontEndProfit} 
                  format="currency"
                  trend={frontEndProfit > 0 ? "positive" : "neutral"}
                />
              </MetricGrid>

              <div className="h-px bg-border-subtle" />

              {/* Full Term Projection */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">If Held to Maturity</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Total Interest Collected</span>
                    <span className="font-medium text-success tabular-nums">${totalInterestCollected.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Total Interest Paid</span>
                    <span className="font-medium text-destructive tabular-nums">-${underlyingInterestPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-content-secondary">Net Interest Profit</span>
                    <span className="font-medium text-success tabular-nums">${netInterestProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              {/* Principal Position Visual */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">Principal Position Growth</h4>
                <div className="space-y-2">
                  {[1, 3, 5].map(year => {
                    const balances = calculateBalances(year);
                    const equityGrowth = wrapLoanAmount - inputs.underlyingBalance;
                    const currentEquity = balances.wrap - balances.underlying;
                    return (
                      <div key={year} className="flex items-center gap-2">
                        <span className="text-tiny text-content-tertiary w-10">Yr {year}</span>
                        <div className="flex-1 h-3 bg-surface-tertiary rounded-full overflow-hidden relative">
                          <div 
                            className="absolute inset-y-0 left-0 bg-surface-secondary"
                            style={{ width: `${(balances.underlying / inputs.underlyingBalance) * 100}%` }}
                          />
                          <div 
                            className="absolute inset-y-0 right-0 bg-success"
                            style={{ width: `${Math.min(100, (currentEquity / wrapLoanAmount) * 100)}%` }}
                          />
                        </div>
                        <span className="text-tiny font-medium text-success tabular-nums w-16 text-right">
                          ${(currentEquity / 1000).toFixed(0)}K eq
                        </span>
                      </div>
                    );
                  })}
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
        {activeStrategy === "seller-finance" && <SellerFinanceCalculator />}
        {activeStrategy === "lease-option" && <LeaseOptionCalculator />}
        {activeStrategy === "wrap" && <WrapCalculator />}
      </div>
    </div>
  );
}
