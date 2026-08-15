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
import { calculateMonthlyPayment, getDueSaleRisk } from "./creative-shared";

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

export function WrapCalculator() {
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
                <div className="space-y-3 p-4 bg-card rounded-medium border border-border-subtle">
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
