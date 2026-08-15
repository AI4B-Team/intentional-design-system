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

export function SellerFinanceCalculator() {
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
                    className="flex h-10 w-full rounded-small border border-border bg-card px-3 text-body focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/10"
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
                    className="flex h-10 w-full rounded-small border border-border bg-card px-3 text-body focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/10"
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
                            index % 2 === 0 ? "bg-card" : "bg-surface-secondary/30",
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
                            className="h-8 px-2 rounded border border-border bg-card text-small text-center"
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
