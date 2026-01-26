import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalculatorInput, CalculatorSlider, InputGroup } from "./calculator-input";
import { ResultsCard, KeyMetric, MetricGrid } from "./results-card";
import { DealRating } from "./deal-rating";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RefreshCw, ChevronDown, ChevronUp, ArrowRight, DollarSign, TrendingUp, Home, User } from "lucide-react";

interface SubToInputs {
  purchasePrice: number;
  existingLoanBalance: number;
  existingRate: number;
  existingPayment: number;
  remainingYears: number;
  monthlyRent: number;
  repairs: number;
  closingCosts: number;
  cashToSeller: number;
}

const defaultSubToInputs: SubToInputs = {
  purchasePrice: 280000,
  existingLoanBalance: 195000,
  existingRate: 3.5,
  existingPayment: 1250,
  remainingYears: 22,
  monthlyRent: 2200,
  repairs: 5000,
  closingCosts: 3000,
  cashToSeller: 5000,
};

interface WrapInputs {
  purchasePrice: number;
  existingLoanBalance: number;
  existingRate: number;
  existingPayment: number;
  wrapSalePrice: number;
  wrapRate: number;
  wrapDownPayment: number;
  wrapTermYears: number;
}

const defaultWrapInputs: WrapInputs = {
  purchasePrice: 280000,
  existingLoanBalance: 195000,
  existingRate: 3.5,
  existingPayment: 1250,
  wrapSalePrice: 320000,
  wrapRate: 7.5,
  wrapDownPayment: 25000,
  wrapTermYears: 30,
};

function LoanComparisonVisual({ 
  existingBalance, 
  existingRate, 
  newRate, 
  savings 
}: { 
  existingBalance: number; 
  existingRate: number; 
  newRate?: number; 
  savings: number;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-small font-medium text-content">Loan Position Comparison</h4>
      
      <div className="relative">
        {/* Existing Loan Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-small">
            <span className="text-content-secondary">Existing Loan</span>
            <span className="font-medium text-content">${existingBalance.toLocaleString()}</span>
          </div>
          <div className="h-8 bg-surface-tertiary rounded-medium overflow-hidden relative">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-accent to-brand-accent/70 rounded-medium flex items-center justify-end pr-3"
              style={{ width: '100%' }}
            >
              <span className="text-tiny font-medium text-white">{existingRate}% APR</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 text-success">
            <ArrowRight className="h-4 w-4" />
            <span className="text-small font-medium">You assume at same rate</span>
          </div>
        </div>

        {/* Your Position */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-small">
            <span className="text-content-secondary">Your Position</span>
            <span className="font-medium text-success">${existingBalance.toLocaleString()}</span>
          </div>
          <div className="h-8 bg-success/10 border-2 border-success rounded-medium flex items-center justify-end pr-3">
            <span className="text-tiny font-medium text-success">{existingRate}% APR ✓</span>
          </div>
        </div>
      </div>

      {/* Savings Highlight */}
      <div className="bg-success/5 border border-success/20 rounded-medium p-4 text-center">
        <div className="text-tiny uppercase tracking-wide text-success mb-1">Monthly Cash Flow</div>
        <div className="text-h2 font-bold text-success">${savings.toLocaleString()}/mo</div>
      </div>
    </div>
  );
}

function WrapSandwichVisual({
  underlying,
  yourPosition,
  endBuyer,
  monthlySpread,
}: {
  underlying: { label: string; payment: number; rate: number };
  yourPosition: { equity: number };
  endBuyer: { payment: number; rate: number };
  monthlySpread: number;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-small font-medium text-content">Deal Structure</h4>

      <div className="relative space-y-2">
        {/* End Buyer Layer */}
        <div className="bg-info/10 border border-info/30 rounded-medium p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-info/20 flex items-center justify-center">
                <User className="h-4 w-4 text-info" />
              </div>
              <div>
                <div className="text-small font-medium text-content">End Buyer</div>
                <div className="text-tiny text-content-secondary">{endBuyer.rate}% APR</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-small text-content-secondary">Pays You</div>
              <div className="text-body font-semibold text-info">${endBuyer.payment.toLocaleString()}/mo</div>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <div className="h-6 w-0.5 bg-border" />
        </div>

        {/* Your Position Layer */}
        <div className="bg-success/10 border-2 border-success rounded-medium p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                <Home className="h-4 w-4 text-success" />
              </div>
              <div>
                <div className="text-small font-medium text-success">Your Position</div>
                <div className="text-tiny text-content-secondary">Monthly Spread</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-small text-content-secondary">You Keep</div>
              <div className="text-h3 font-bold text-success">${monthlySpread.toLocaleString()}/mo</div>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <div className="h-6 w-0.5 bg-border" />
        </div>

        {/* Underlying Loan Layer */}
        <div className="bg-surface-secondary border border-border-subtle rounded-medium p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-surface-tertiary flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-content-secondary" />
              </div>
              <div>
                <div className="text-small font-medium text-content">{underlying.label}</div>
                <div className="text-tiny text-content-secondary">{underlying.rate}% APR</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-small text-content-secondary">You Pay</div>
              <div className="text-body font-medium text-content">${underlying.payment.toLocaleString()}/mo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SellerBenefitCard({
  monthlyIncome,
  totalPayout,
  cashSaleAmount,
  duration,
}: {
  monthlyIncome: number;
  totalPayout: number;
  cashSaleAmount: number;
  duration: number;
}) {
  const advantage = totalPayout - cashSaleAmount;

  return (
    <Card variant="default" padding="md" className="bg-gradient-to-br from-brand-accent/5 to-transparent border-brand-accent/20">
      <h4 className="text-body font-medium text-content mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-brand-accent" />
        Seller Benefits (for negotiations)
      </h4>

      <div className="space-y-4">
        {/* Monthly Income Stream */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-small">
            <span className="text-content-secondary">Monthly Income for {duration} years</span>
            <span className="font-semibold text-success">${monthlyIncome.toLocaleString()}/mo</span>
          </div>
          <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-success to-success/70 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-surface-secondary rounded-medium p-3 text-center">
            <div className="text-tiny uppercase tracking-wide text-content-tertiary mb-1">Cash Sale Today</div>
            <div className="text-h3 font-semibold text-content">${cashSaleAmount.toLocaleString()}</div>
          </div>
          <div className="bg-success/10 rounded-medium p-3 text-center">
            <div className="text-tiny uppercase tracking-wide text-success mb-1">Total with Terms</div>
            <div className="text-h3 font-semibold text-success">${totalPayout.toLocaleString()}</div>
          </div>
        </div>

        {advantage > 0 && (
          <div className="text-center pt-2">
            <Badge variant="success" size="md">
              Seller gets ${advantage.toLocaleString()} more with terms!
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

function AmortizationTable({ 
  principal, 
  rate, 
  years, 
  payment 
}: { 
  principal: number; 
  rate: number; 
  years: number; 
  payment: number;
}) {
  const [expanded, setExpanded] = React.useState(false);

  // Generate simplified schedule (yearly)
  const schedule = React.useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    let balance = principal;
    const yearlyData = [];

    for (let year = 1; year <= years; year++) {
      let yearInterest = 0;
      let yearPrincipal = 0;

      for (let month = 1; month <= 12; month++) {
        const interest = balance * monthlyRate;
        const principalPayment = payment - interest;
        yearInterest += interest;
        yearPrincipal += principalPayment;
        balance -= principalPayment;
        if (balance < 0) balance = 0;
      }

      yearlyData.push({
        year,
        principal: yearPrincipal,
        interest: yearInterest,
        balance: Math.max(0, balance),
      });

      if (balance <= 0) break;
    }

    return yearlyData;
  }, [principal, rate, years, payment]);

  const displaySchedule = expanded ? schedule : schedule.slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-small font-medium text-content">Amortization Schedule</h4>
        <Badge variant="secondary" size="sm">
          {years} Year Term
        </Badge>
      </div>

      {/* Summary Row */}
      <div className="bg-surface-secondary rounded-medium p-3 grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-tiny text-content-tertiary">Principal</div>
          <div className="text-small font-medium text-content">${principal.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-tiny text-content-tertiary">Rate</div>
          <div className="text-small font-medium text-content">{rate}%</div>
        </div>
        <div>
          <div className="text-tiny text-content-tertiary">Payment</div>
          <div className="text-small font-medium text-content">${payment.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-tiny text-content-tertiary">Total Interest</div>
          <div className="text-small font-medium text-destructive">
            ${schedule.reduce((sum, y) => sum + y.interest, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-medium border border-border-subtle overflow-hidden">
        <table className="w-full text-small">
          <thead className="bg-surface-secondary">
            <tr>
              <th className="px-3 py-2 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">Year</th>
              <th className="px-3 py-2 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">Principal</th>
              <th className="px-3 py-2 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">Interest</th>
              <th className="px-3 py-2 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">Balance</th>
            </tr>
          </thead>
          <tbody>
            {displaySchedule.map((row, index) => (
              <tr 
                key={row.year} 
                className={cn(
                  "h-9",
                  index % 2 === 0 ? "bg-white" : "bg-surface-secondary/30",
                  row.year % 5 === 0 && "border-t border-border-subtle font-medium"
                )}
              >
                <td className="px-3">{row.year}</td>
                <td className="px-3 text-right tabular-nums text-success">${row.principal.toLocaleString()}</td>
                <td className="px-3 text-right tabular-nums text-content-secondary">${row.interest.toLocaleString()}</td>
                <td className="px-3 text-right tabular-nums">${row.balance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {schedule.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show All {schedule.length} Years
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function CreativeCalculator() {
  const [dealType, setDealType] = React.useState<"subto" | "wrap">("subto");
  const [subToInputs, setSubToInputs] = React.useState<SubToInputs>(defaultSubToInputs);
  const [wrapInputs, setWrapInputs] = React.useState<WrapInputs>(defaultWrapInputs);

  const updateSubTo = (key: keyof SubToInputs, value: number) => {
    setSubToInputs((prev) => ({ ...prev, [key]: value }));
  };

  const updateWrap = (key: keyof WrapInputs, value: number) => {
    setWrapInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Sub-To Calculations
  const subToEquity = subToInputs.purchasePrice - subToInputs.existingLoanBalance;
  const subToCashNeeded = subToInputs.repairs + subToInputs.closingCosts + subToInputs.cashToSeller;
  const subToMonthlyCashFlow = subToInputs.monthlyRent - subToInputs.existingPayment;
  const subToAnnualCashFlow = subToMonthlyCashFlow * 12;
  const subToCashOnCash = (subToAnnualCashFlow / subToCashNeeded) * 100;
  const subToDealScore = Math.min(100, Math.max(0,
    (subToMonthlyCashFlow >= 500 ? 40 : subToMonthlyCashFlow / 12.5) +
    (subToCashOnCash >= 15 ? 30 : subToCashOnCash * 2) +
    (subToInputs.existingRate <= 4 ? 30 : 30 - (subToInputs.existingRate - 4) * 10)
  ));

  // Wrap Calculations
  const wrapLoanAmount = wrapInputs.wrapSalePrice - wrapInputs.wrapDownPayment;
  const wrapMonthlyRate = wrapInputs.wrapRate / 100 / 12;
  const wrapMonths = wrapInputs.wrapTermYears * 12;
  const wrapPayment = Math.round(wrapLoanAmount * (wrapMonthlyRate * Math.pow(1 + wrapMonthlyRate, wrapMonths)) / (Math.pow(1 + wrapMonthlyRate, wrapMonths) - 1));
  const wrapMonthlySpread = wrapPayment - wrapInputs.existingPayment;
  const wrapFrontEndProfit = wrapInputs.wrapDownPayment;
  const wrapTotalSpread = wrapMonthlySpread * wrapMonths;
  const wrapDealScore = Math.min(100, Math.max(0,
    (wrapMonthlySpread >= 400 ? 40 : wrapMonthlySpread / 10) +
    (wrapFrontEndProfit >= 20000 ? 30 : wrapFrontEndProfit / 667) +
    30 // Base score for creative deal
  ));

  return (
    <div className="space-y-lg">
      {/* Deal Type Tabs */}
      <Tabs value={dealType} onValueChange={(v) => setDealType(v as "subto" | "wrap")}>
        <TabsList className="bg-surface-secondary">
          <TabsTrigger value="subto">Subject-To</TabsTrigger>
          <TabsTrigger value="wrap">Wrap / Seller Finance</TabsTrigger>
        </TabsList>

        {/* Sub-To Calculator */}
        <TabsContent value="subto" className="mt-lg">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg">
            {/* Inputs */}
            <div className="lg:col-span-3 space-y-lg">
              <Card variant="default" padding="none">
                <div className="px-md py-4 border-b border-border-subtle flex items-center justify-between">
                  <h3 className="text-h3 font-medium text-content">Sub-To Deal Inputs</h3>
                  <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={() => setSubToInputs(defaultSubToInputs)}>
                    Reset
                  </Button>
                </div>

                <div className="p-md space-y-lg">
                  <InputGroup title="Property & Purchase">
                    <CalculatorInput
                      label="Purchase Price"
                      value={subToInputs.purchasePrice}
                      onChange={(v) => updateSubTo("purchasePrice", v)}
                      type="currency"
                    />
                    <CalculatorInput
                      label="Cash to Seller"
                      value={subToInputs.cashToSeller}
                      onChange={(v) => updateSubTo("cashToSeller", v)}
                      type="currency"
                      tooltip="Any cash you're paying the seller at closing"
                    />
                  </InputGroup>

                  <div className="h-px bg-border-subtle" />

                  <InputGroup title="Existing Loan Details">
                    <div className="grid grid-cols-2 gap-4">
                      <CalculatorInput
                        label="Loan Balance"
                        value={subToInputs.existingLoanBalance}
                        onChange={(v) => updateSubTo("existingLoanBalance", v)}
                        type="currency"
                      />
                      <CalculatorInput
                        label="Interest Rate"
                        value={subToInputs.existingRate}
                        onChange={(v) => updateSubTo("existingRate", v)}
                        type="percentage"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <CalculatorInput
                        label="Monthly Payment (PITI)"
                        value={subToInputs.existingPayment}
                        onChange={(v) => updateSubTo("existingPayment", v)}
                        type="currency"
                      />
                      <CalculatorInput
                        label="Years Remaining"
                        value={subToInputs.remainingYears}
                        onChange={(v) => updateSubTo("remainingYears", v)}
                        type="years"
                      />
                    </div>
                  </InputGroup>

                  <div className="h-px bg-border-subtle" />

                  <InputGroup title="Rental Income & Costs">
                    <CalculatorInput
                      label="Expected Monthly Rent"
                      value={subToInputs.monthlyRent}
                      onChange={(v) => updateSubTo("monthlyRent", v)}
                      type="currency"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <CalculatorInput
                        label="Repairs"
                        value={subToInputs.repairs}
                        onChange={(v) => updateSubTo("repairs", v)}
                        type="currency"
                      />
                      <CalculatorInput
                        label="Closing Costs"
                        value={subToInputs.closingCosts}
                        onChange={(v) => updateSubTo("closingCosts", v)}
                        type="currency"
                      />
                    </div>
                  </InputGroup>
                </div>
              </Card>

              {/* Seller Benefit Card */}
              <SellerBenefitCard
                monthlyIncome={0}
                totalPayout={subToInputs.cashToSeller + subToInputs.existingLoanBalance}
                cashSaleAmount={subToInputs.purchasePrice - 20000} // Assuming 20k less on cash sale
                duration={subToInputs.remainingYears}
              />
            </div>

            {/* Results */}
            <div className="lg:col-span-2 space-y-lg">
              <ResultsCard
                title="Sub-To Analysis"
                keyResult={{
                  label: "Monthly Cash Flow",
                  value: subToMonthlyCashFlow,
                  format: "currency",
                  trend: subToMonthlyCashFlow >= 300 ? "positive" : subToMonthlyCashFlow >= 0 ? "neutral" : "negative",
                }}
                dealScore={subToDealScore}
              >
                <div className="space-y-md">
                  <MetricGrid columns={2}>
                    <KeyMetric label="Equity Captured" value={subToEquity} format="currency" />
                    <KeyMetric label="Cash Needed" value={subToCashNeeded} format="currency" />
                    <KeyMetric label="Annual Cash Flow" value={subToAnnualCashFlow} format="currency" trend={subToAnnualCashFlow > 0 ? "positive" : "negative"} />
                    <KeyMetric label="Cash on Cash ROI" value={subToCashOnCash} format="percentage" trend={subToCashOnCash >= 12 ? "positive" : "neutral"} />
                  </MetricGrid>

                  <div className="h-px bg-border-subtle" />

                  <LoanComparisonVisual
                    existingBalance={subToInputs.existingLoanBalance}
                    existingRate={subToInputs.existingRate}
                    savings={subToMonthlyCashFlow}
                  />
                </div>
              </ResultsCard>

              {/* Rate Badge */}
              {subToInputs.existingRate < 5 && (
                <div className="bg-success/10 border border-success/20 rounded-medium p-4 text-center">
                  <Badge variant="success" size="md">
                    🎯 Great Rate Lock: {subToInputs.existingRate}% vs Today's 7%+
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Wrap Calculator */}
        <TabsContent value="wrap" className="mt-lg">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg">
            {/* Inputs */}
            <div className="lg:col-span-3 space-y-lg">
              <Card variant="default" padding="none">
                <div className="px-md py-4 border-b border-border-subtle flex items-center justify-between">
                  <h3 className="text-h3 font-medium text-content">Wrap Deal Inputs</h3>
                  <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={() => setWrapInputs(defaultWrapInputs)}>
                    Reset
                  </Button>
                </div>

                <div className="p-md space-y-lg">
                  <InputGroup title="Underlying Loan">
                    <div className="grid grid-cols-2 gap-4">
                      <CalculatorInput
                        label="Loan Balance"
                        value={wrapInputs.existingLoanBalance}
                        onChange={(v) => updateWrap("existingLoanBalance", v)}
                        type="currency"
                      />
                      <CalculatorInput
                        label="Interest Rate"
                        value={wrapInputs.existingRate}
                        onChange={(v) => updateWrap("existingRate", v)}
                        type="percentage"
                      />
                    </div>
                    <CalculatorInput
                      label="Monthly Payment"
                      value={wrapInputs.existingPayment}
                      onChange={(v) => updateWrap("existingPayment", v)}
                      type="currency"
                    />
                  </InputGroup>

                  <div className="h-px bg-border-subtle" />

                  <InputGroup title="Wrap Terms (to End Buyer)">
                    <div className="grid grid-cols-2 gap-4">
                      <CalculatorInput
                        label="Sale Price"
                        value={wrapInputs.wrapSalePrice}
                        onChange={(v) => updateWrap("wrapSalePrice", v)}
                        type="currency"
                      />
                      <CalculatorInput
                        label="Down Payment"
                        value={wrapInputs.wrapDownPayment}
                        onChange={(v) => updateWrap("wrapDownPayment", v)}
                        type="currency"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <CalculatorSlider
                        label="Interest Rate"
                        value={wrapInputs.wrapRate}
                        onChange={(v) => updateWrap("wrapRate", v)}
                        min={5}
                        max={12}
                        step={0.25}
                      />
                      <CalculatorInput
                        label="Term"
                        value={wrapInputs.wrapTermYears}
                        onChange={(v) => updateWrap("wrapTermYears", v)}
                        type="years"
                      />
                    </div>
                  </InputGroup>
                </div>
              </Card>

              {/* Amortization Table */}
              <Card variant="default" padding="md">
                <AmortizationTable
                  principal={wrapLoanAmount}
                  rate={wrapInputs.wrapRate}
                  years={wrapInputs.wrapTermYears}
                  payment={wrapPayment}
                />
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 space-y-lg">
              <ResultsCard
                title="Wrap Analysis"
                keyResult={{
                  label: "Monthly Spread",
                  value: wrapMonthlySpread,
                  format: "currency",
                  trend: wrapMonthlySpread >= 300 ? "positive" : "neutral",
                }}
                dealScore={wrapDealScore}
              >
                <div className="space-y-md">
                  <MetricGrid columns={2}>
                    <KeyMetric label="Front End Profit" value={wrapFrontEndProfit} format="currency" trend="positive" />
                    <KeyMetric label="Total Spread" value={wrapTotalSpread} format="currency" />
                    <KeyMetric label="Wrap Payment" value={wrapPayment} format="currency" />
                    <KeyMetric label="You Pay" value={wrapInputs.existingPayment} format="currency" />
                  </MetricGrid>

                  <div className="h-px bg-border-subtle" />

                  <WrapSandwichVisual
                    underlying={{
                      label: "Existing Mortgage",
                      payment: wrapInputs.existingPayment,
                      rate: wrapInputs.existingRate,
                    }}
                    yourPosition={{ equity: wrapInputs.wrapSalePrice - wrapInputs.existingLoanBalance }}
                    endBuyer={{
                      payment: wrapPayment,
                      rate: wrapInputs.wrapRate,
                    }}
                    monthlySpread={wrapMonthlySpread}
                  />
                </div>
              </ResultsCard>

              {/* Seller Benefit */}
              <SellerBenefitCard
                monthlyIncome={wrapInputs.existingPayment}
                totalPayout={wrapInputs.wrapDownPayment + (wrapInputs.existingPayment * wrapInputs.wrapTermYears * 12)}
                cashSaleAmount={wrapInputs.purchasePrice - 25000}
                duration={wrapInputs.wrapTermYears}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
