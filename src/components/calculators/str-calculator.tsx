import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorInput, CalculatorSlider } from "./calculator-input";
import { Badge } from "@/components/ui/badge";
import { Bed, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface STRInputs {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  arv: number;
  nightlyRate: number;
  occupancyRate: number;
  annualNightsAvailable: number;
  platformFeePercent: number;
  propertyManagement: number;
  annualInsurance: number;
  annualPropertyTaxes: number;
  monthlyHOA: number;
  utilitiesMonth: number;
  suppliesMaintenanceMonth: number;
  furnishingCost: number;
}

const DEFAULT_STR_INPUTS: STRInputs = {
  purchasePrice: 300000,
  downPaymentPercent: 20,
  interestRate: 7,
  loanTermYears: 30,
  arv: 320000,
  nightlyRate: 200,
  occupancyRate: 65,
  annualNightsAvailable: 365,
  platformFeePercent: 15,
  propertyManagement: 0,
  annualInsurance: 2400,
  annualPropertyTaxes: 3600,
  monthlyHOA: 0,
  utilitiesMonth: 250,
  suppliesMaintenanceMonth: 200,
  furnishingCost: 15000,
};

function useSTRCalculations(inputs: STRInputs) {
  return React.useMemo(() => {
    const downPayment = inputs.purchasePrice * (inputs.downPaymentPercent / 100);
    const loanAmount = inputs.purchasePrice - downPayment;
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.loanTermYears * 12;
    const monthlyPI =
      loanAmount > 0 && monthlyRate > 0
        ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
          (Math.pow(1 + monthlyRate, numPayments) - 1)
        : 0;

    const grossAnnualRevenue =
      inputs.nightlyRate * (inputs.occupancyRate / 100) * inputs.annualNightsAvailable;
    const annualPlatformFees = grossAnnualRevenue * (inputs.platformFeePercent / 100);
    const netRevenue = grossAnnualRevenue - annualPlatformFees;

    const annualExpenses =
      inputs.annualInsurance +
      inputs.annualPropertyTaxes +
      inputs.monthlyHOA * 12 +
      inputs.utilitiesMonth * 12 +
      inputs.suppliesMaintenanceMonth * 12 +
      inputs.propertyManagement * 12;

    const noi = netRevenue - annualExpenses;
    const annualDebtService = monthlyPI * 12;
    const annualCashFlow = noi - annualDebtService;
    const monthlyCashFlow = annualCashFlow / 12;

    const totalCashInvested = downPayment + inputs.furnishingCost;
    const cashOnCash = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;
    const capRate = inputs.purchasePrice > 0 ? (noi / inputs.purchasePrice) * 100 : 0;
    const grm = grossAnnualRevenue > 0 ? inputs.purchasePrice / grossAnnualRevenue : 0;
    const revPAN = inputs.annualNightsAvailable > 0 ? grossAnnualRevenue / inputs.annualNightsAvailable : 0;

    // Break-even occupancy: find occupancy where cash flow = 0
    // 0 = (rate * occ * nights * (1 - platformFee)) - expenses - debtService
    const revenuePerNightNet = inputs.nightlyRate * (1 - inputs.platformFeePercent / 100);
    const totalFixed = annualExpenses + annualDebtService;
    const breakEvenOccupancy =
      revenuePerNightNet * inputs.annualNightsAvailable > 0
        ? (totalFixed / (revenuePerNightNet * inputs.annualNightsAvailable)) * 100
        : 100;

    return {
      downPayment,
      loanAmount,
      monthlyPI,
      grossAnnualRevenue,
      annualPlatformFees,
      netRevenue,
      annualExpenses,
      noi,
      annualDebtService,
      annualCashFlow,
      monthlyCashFlow,
      totalCashInvested,
      cashOnCash,
      capRate,
      grm,
      revPAN,
      breakEvenOccupancy: Math.min(breakEvenOccupancy, 100),
    };
  }, [inputs]);
}

function getVerdict(monthlyCashFlow: number, cashOnCash: number) {
  if (monthlyCashFlow > 500 && cashOnCash > 8)
    return { label: "Strong Deal", variant: "success" as const };
  if (monthlyCashFlow > 0 && cashOnCash > 5)
    return { label: "Moderate Deal", variant: "warning" as const };
  return { label: "Negative Cash Flow", variant: "error" as const };
}

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <TrendingUp className="h-4 w-4 text-success" />;
  if (value < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export function STRCalculator() {
  const [inputs, setInputs] = React.useState<STRInputs>(DEFAULT_STR_INPUTS);
  const update = <K extends keyof STRInputs>(key: K, value: STRInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const r = useSTRCalculations(inputs);
  const verdict = getVerdict(r.monthlyCashFlow, r.cashOnCash);

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Bed className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-h3 font-bold text-foreground">Short-Term Rental Calculator</h2>
          <p className="text-small text-muted-foreground">Airbnb / VRBO revenue & cash flow analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <Accordion
            type="multiple"
            defaultValue={["acquisition", "financing", "revenue", "expenses"]}
            className="space-y-3"
          >
            {/* Acquisition */}
            <AccordionItem value="acquisition" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-surface-secondary/50">
                <div className="flex items-center justify-between flex-1 pr-4">
                  <span className="font-medium">Acquisition</span>
                  <span className="text-small text-muted-foreground tabular-nums">
                    ${(inputs.purchasePrice + inputs.furnishingCost).toLocaleString()}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <CalculatorInput label="Purchase Price" value={inputs.purchasePrice} onChange={(v) => update("purchasePrice", v)} type="currency" />
                <CalculatorInput label="ARV / Appraised Value" value={inputs.arv} onChange={(v) => update("arv", v)} type="currency" />
                <CalculatorInput label="Furnishing / Setup Cost" value={inputs.furnishingCost} onChange={(v) => update("furnishingCost", v)} type="currency" tooltip="One-time cost to furnish and prepare the property" />
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-md">
                  <span className="text-small text-muted-foreground">Total Cash Needed</span>
                  <span className="font-semibold tabular-nums">${r.totalCashInvested.toLocaleString()}</span>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Financing */}
            <AccordionItem value="financing" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-surface-secondary/50">
                <div className="flex items-center justify-between flex-1 pr-4">
                  <span className="font-medium">Financing</span>
                  <span className="text-small text-muted-foreground tabular-nums">${r.monthlyPI.toFixed(0)}/mo</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <CalculatorSlider
                  label="Down Payment"
                  value={inputs.downPaymentPercent}
                  onChange={(v) => update("downPaymentPercent", v)}
                  min={0} max={100} step={5}
                  formatValue={(v) => `${v}% = $${r.downPayment.toLocaleString()}`}
                />
                <div className="flex items-center justify-between p-3 bg-info/10 rounded-md">
                  <span className="text-small text-info">Loan Amount</span>
                  <span className="font-semibold text-info tabular-nums">${r.loanAmount.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CalculatorSlider label="Interest Rate" value={inputs.interestRate} onChange={(v) => update("interestRate", v)} min={3} max={15} step={0.125} />
                  <CalculatorSlider label="Term" value={inputs.loanTermYears} onChange={(v) => update("loanTermYears", v)} min={10} max={30} step={5} suffix=" yrs" />
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-md">
                  <span className="text-small text-muted-foreground">Monthly P&I</span>
                  <span className="font-semibold tabular-nums">${r.monthlyPI.toFixed(2)}</span>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Revenue */}
            <AccordionItem value="revenue" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-surface-secondary/50">
                <div className="flex items-center justify-between flex-1 pr-4">
                  <span className="font-medium">Revenue</span>
                  <span className="text-small text-success tabular-nums">${(r.grossAnnualRevenue / 12).toFixed(0)}/mo</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <CalculatorInput label="Nightly Rate" value={inputs.nightlyRate} onChange={(v) => update("nightlyRate", v)} type="currency" />
                <CalculatorSlider label="Occupancy Rate" value={inputs.occupancyRate} onChange={(v) => update("occupancyRate", v)} min={0} max={100} step={1} />
                <CalculatorInput label="Annual Nights Available" value={inputs.annualNightsAvailable} onChange={(v) => update("annualNightsAvailable", v)} type="number" />
                <CalculatorSlider
                  label="Platform Fees"
                  value={inputs.platformFeePercent}
                  onChange={(v) => update("platformFeePercent", v)}
                  min={0} max={30} step={1}
                  tooltip="Airbnb ~15%, VRBO ~8%, Direct ~3%"
                  formatValue={(v) => `${v}% = $${(r.annualPlatformFees / 12).toFixed(0)}/mo`}
                />
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-md">
                  <span className="text-small text-success">Gross Annual Revenue</span>
                  <span className="font-semibold text-success tabular-nums">${r.grossAnnualRevenue.toLocaleString()}</span>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Expenses */}
            <AccordionItem value="expenses" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-surface-secondary/50">
                <div className="flex items-center justify-between flex-1 pr-4">
                  <span className="font-medium">Expenses</span>
                  <span className="text-small text-destructive tabular-nums">${(r.annualExpenses / 12).toFixed(0)}/mo</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <CalculatorInput label="Annual Insurance" value={inputs.annualInsurance} onChange={(v) => update("annualInsurance", v)} type="currency" />
                  <CalculatorInput label="Annual Property Taxes" value={inputs.annualPropertyTaxes} onChange={(v) => update("annualPropertyTaxes", v)} type="currency" />
                </div>
                <CalculatorInput label="Monthly HOA" value={inputs.monthlyHOA} onChange={(v) => update("monthlyHOA", v)} type="currency" />
                <CalculatorInput label="Property Management ($/mo)" value={inputs.propertyManagement} onChange={(v) => update("propertyManagement", v)} type="currency" />
                <div className="grid grid-cols-2 gap-3">
                  <CalculatorInput label="Utilities/Month" value={inputs.utilitiesMonth} onChange={(v) => update("utilitiesMonth", v)} type="currency" />
                  <CalculatorInput label="Supplies & Maint./Month" value={inputs.suppliesMaintenanceMonth} onChange={(v) => update("suppliesMaintenanceMonth", v)} type="currency" />
                </div>
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-md">
                  <span className="text-small text-destructive">Total Expenses</span>
                  <span className="font-semibold text-destructive tabular-nums">${(r.annualExpenses / 12).toFixed(0)}/mo</span>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={() => setInputs(DEFAULT_STR_INPUTS)}>
              Reset
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-4">
          {/* Cash Flow Card */}
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="px-md py-4 border-b border-border-subtle bg-surface-secondary/50 flex items-center justify-between">
              <h3 className="text-h3 font-medium text-content">Cash Flow</h3>
              <Badge variant={verdict.variant} size="md">{verdict.label}</Badge>
            </div>
            <div className="p-md">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-display font-bold tabular-nums ${r.monthlyCashFlow >= 0 ? "text-success" : "text-destructive"}`}>
                  ${r.monthlyCashFlow.toFixed(0)}
                </span>
                <span className="text-small text-muted-foreground">/month</span>
                <TrendIcon value={r.monthlyCashFlow} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-tiny uppercase tracking-wide text-content-secondary">Annual Cash Flow</div>
                  <div className={`text-h2 font-semibold tabular-nums ${r.annualCashFlow >= 0 ? "text-success" : "text-destructive"}`}>
                    ${r.annualCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-tiny uppercase tracking-wide text-content-secondary">NOI</div>
                  <div className="text-h2 font-semibold tabular-nums text-content">${r.noi.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-tiny uppercase tracking-wide text-content-secondary">Debt Service</div>
                  <div className="text-h2 font-semibold tabular-nums text-content">${r.annualDebtService.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Metrics */}
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="px-md py-4 border-b border-border-subtle bg-surface-secondary/50">
              <h3 className="text-h3 font-medium text-content">Key Metrics</h3>
            </div>
            <div className="divide-y divide-border-subtle">
              {[
                { label: "Cash-on-Cash Return", value: `${r.cashOnCash.toFixed(1)}%`, good: r.cashOnCash > 8 },
                { label: "Cap Rate", value: `${r.capRate.toFixed(1)}%`, good: r.capRate > 6 },
                { label: "Gross Rent Multiplier", value: r.grm.toFixed(2), good: r.grm < 10 },
                { label: "RevPAN", value: `$${r.revPAN.toFixed(0)}`, good: r.revPAN > 150 },
                { label: "Break-Even Occupancy", value: `${r.breakEvenOccupancy.toFixed(1)}%`, good: r.breakEvenOccupancy < inputs.occupancyRate },
                { label: "Platform Fees (Annual)", value: `$${r.annualPlatformFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                { label: "Gross Annual Revenue", value: `$${r.grossAnnualRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between px-md py-3">
                  <span className="text-small text-content-secondary">{m.label}</span>
                  <span className={`font-semibold tabular-nums ${m.good === true ? "text-success" : m.good === false ? "text-destructive" : "text-content"}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Revenue Breakdown */}
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="px-md py-4 border-b border-border-subtle bg-surface-secondary/50">
              <h3 className="text-h3 font-medium text-content">Revenue Breakdown</h3>
            </div>
            <div className="p-md space-y-3">
              {[
                { label: "Gross Revenue", amount: r.grossAnnualRevenue, color: "bg-success" },
                { label: "Platform Fees", amount: -r.annualPlatformFees, color: "bg-warning" },
                { label: "Operating Expenses", amount: -r.annualExpenses, color: "bg-destructive" },
                { label: "Debt Service", amount: -r.annualDebtService, color: "bg-info" },
              ].map((item) => {
                const pct = r.grossAnnualRevenue > 0 ? (Math.abs(item.amount) / r.grossAnnualRevenue) * 100 : 0;
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-small">
                      <span className="text-content-secondary">{item.label}</span>
                      <span className="font-medium text-content tabular-nums">
                        ${Math.abs(item.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-3 bg-surface-tertiary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${item.color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
