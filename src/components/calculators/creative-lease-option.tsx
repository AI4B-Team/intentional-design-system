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

export function LeaseOptionCalculator() {
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
