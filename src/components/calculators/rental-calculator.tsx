import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalculatorInput, CalculatorSlider, InputGroup } from "./calculator-input";
import { ResultsCard, KeyMetric, MetricGrid } from "./results-card";
import { DealRating } from "./deal-rating";
import { RefreshCw, Download, Share, CheckCircle2, XCircle, PieChart } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { chartColorArray } from "@/lib/chart-theme";

interface RentalInputs {
  // Purchase
  purchasePrice: number;
  downPaymentPercent: number;
  closingCosts: number;
  rehabCosts: number;
  
  // Financing
  interestRate: number;
  loanTermYears: number;
  
  // Income
  monthlyRent: number;
  otherIncome: number;
  vacancyRate: number;
  
  // Expenses
  propertyTaxesMonthly: number;
  insuranceMonthly: number;
  propertyManagementPercent: number;
  maintenanceReservePercent: number;
  capexReservePercent: number;
  hoaMonthly: number;
  utilitiesMonthly: number;
  otherExpenses: number;
}

const defaultInputs: RentalInputs = {
  purchasePrice: 200000,
  downPaymentPercent: 25,
  closingCosts: 5000,
  rehabCosts: 0,
  
  interestRate: 7,
  loanTermYears: 30,
  
  monthlyRent: 1800,
  otherIncome: 0,
  vacancyRate: 8,
  
  propertyTaxesMonthly: 250,
  insuranceMonthly: 100,
  propertyManagementPercent: 10,
  maintenanceReservePercent: 5,
  capexReservePercent: 5,
  hoaMonthly: 0,
  utilitiesMonthly: 0,
  otherExpenses: 0,
};

function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
}

interface RentalCalculatorProps {
  propertyId?: string;
  initialValues?: Partial<RentalInputs>;
}

export function RentalCalculator({ propertyId, initialValues }: RentalCalculatorProps) {
  const [inputs, setInputs] = React.useState<RentalInputs>({
    ...defaultInputs,
    ...initialValues,
  });

  const updateInput = <K extends keyof RentalInputs>(key: K, value: RentalInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Purchase calculations
  const downPayment = inputs.purchasePrice * (inputs.downPaymentPercent / 100);
  const loanAmount = inputs.purchasePrice - downPayment;
  const totalCashInvested = downPayment + inputs.closingCosts + inputs.rehabCosts;
  
  // Mortgage calculation
  const monthlyPI = calculateMonthlyPayment(loanAmount, inputs.interestRate, inputs.loanTermYears);
  const annualDebtService = monthlyPI * 12;
  
  // Income calculations
  const grossMonthlyIncome = inputs.monthlyRent + inputs.otherIncome;
  const vacancyLoss = grossMonthlyIncome * (inputs.vacancyRate / 100);
  const effectiveGrossIncome = grossMonthlyIncome - vacancyLoss;
  const annualGrossRent = inputs.monthlyRent * 12;
  
  // Expense calculations
  const propertyManagement = inputs.monthlyRent * (inputs.propertyManagementPercent / 100);
  const maintenanceReserve = inputs.monthlyRent * (inputs.maintenanceReservePercent / 100);
  const capexReserve = inputs.monthlyRent * (inputs.capexReservePercent / 100);
  
  const totalMonthlyExpenses = 
    inputs.propertyTaxesMonthly +
    inputs.insuranceMonthly +
    propertyManagement +
    maintenanceReserve +
    capexReserve +
    inputs.hoaMonthly +
    inputs.utilitiesMonthly +
    inputs.otherExpenses;
  
  // NOI and Cash Flow
  const monthlyNOI = effectiveGrossIncome - totalMonthlyExpenses;
  const annualNOI = monthlyNOI * 12;
  const monthlyCashFlow = monthlyNOI - monthlyPI;
  const annualCashFlow = monthlyCashFlow * 12;
  
  // Key Metrics
  const capRate = (annualNOI / inputs.purchasePrice) * 100;
  const cashOnCash = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;
  const dscr = annualDebtService > 0 ? annualNOI / annualDebtService : 0;
  const grm = annualGrossRent > 0 ? inputs.purchasePrice / annualGrossRent : 0;
  
  // Rule checks
  const onePercentRule = inputs.monthlyRent >= inputs.purchasePrice * 0.01;
  const fiftyPercentRule = totalMonthlyExpenses <= grossMonthlyIncome * 0.5;
  
  // Deal score based on metrics
  const dealScore = (() => {
    let score = 50;
    if (cashOnCash >= 10) score += 20;
    else if (cashOnCash >= 8) score += 15;
    else if (cashOnCash >= 5) score += 10;
    if (capRate >= 8) score += 15;
    else if (capRate >= 6) score += 10;
    if (dscr >= 1.25) score += 10;
    if (onePercentRule) score += 5;
    return Math.min(100, score);
  })();

  // Expense breakdown for pie chart
  const expenseBreakdown = [
    { name: "Property Taxes", value: inputs.propertyTaxesMonthly },
    { name: "Insurance", value: inputs.insuranceMonthly },
    { name: "Management", value: propertyManagement },
    { name: "Maintenance", value: maintenanceReserve },
    { name: "CapEx", value: capexReserve },
    { name: "HOA", value: inputs.hoaMonthly },
    { name: "Utilities", value: inputs.utilitiesMonthly },
    { name: "Other", value: inputs.otherExpenses },
  ].filter(item => item.value > 0);

  const handleReset = () => setInputs(defaultInputs);

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg">
        {/* Inputs - Left Column */}
        <div className="lg:col-span-3 space-y-lg">
          {/* Purchase */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-h3 font-medium text-content">Purchase</h3>
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
              />
              <CalculatorSlider
                label="Down Payment"
                value={inputs.downPaymentPercent}
                onChange={(v) => updateInput("downPaymentPercent", v)}
                min={0}
                max={100}
                step={5}
                tooltip="Percentage of purchase price as down payment"
              />
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Closing Costs"
                  value={inputs.closingCosts}
                  onChange={(v) => updateInput("closingCosts", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Rehab Costs"
                  value={inputs.rehabCosts}
                  onChange={(v) => updateInput("rehabCosts", v)}
                  type="currency"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-small">
                <span className="text-small text-content-secondary">Total Cash Invested</span>
                <span className="text-h3 font-semibold text-content tabular-nums">
                  ${totalCashInvested.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Financing */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Financing</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="flex items-center justify-between p-3 bg-info/10 rounded-small">
                <span className="text-small text-info">Loan Amount</span>
                <span className="text-body font-semibold text-info tabular-nums">
                  ${loanAmount.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalculatorSlider
                  label="Interest Rate"
                  value={inputs.interestRate}
                  onChange={(v) => updateInput("interestRate", v)}
                  min={3}
                  max={12}
                  step={0.125}
                />
                <CalculatorSlider
                  label="Loan Term"
                  value={inputs.loanTermYears}
                  onChange={(v) => updateInput("loanTermYears", v)}
                  min={10}
                  max={30}
                  step={5}
                  suffix=" yrs"
                  formatValue={(v) => `${v} years`}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-small">
                <span className="text-small text-content-secondary">Monthly P&I</span>
                <span className="text-h3 font-semibold text-content tabular-nums">
                  ${monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </Card>

          {/* Income */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Income</h3>
            </div>
            <div className="p-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Monthly Rent"
                  value={inputs.monthlyRent}
                  onChange={(v) => updateInput("monthlyRent", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Other Income"
                  value={inputs.otherIncome}
                  onChange={(v) => updateInput("otherIncome", v)}
                  type="currency"
                  tooltip="Laundry, parking, storage, etc."
                />
              </div>
              <CalculatorSlider
                label="Vacancy Rate"
                value={inputs.vacancyRate}
                onChange={(v) => updateInput("vacancyRate", v)}
                min={0}
                max={20}
                step={1}
              />
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-small">
                <span className="text-small text-success">Effective Gross Income</span>
                <span className="text-body font-semibold text-success tabular-nums">
                  ${effectiveGrossIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                </span>
              </div>
            </div>
          </Card>

          {/* Expenses */}
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle">
              <h3 className="text-h3 font-medium text-content">Expenses</h3>
            </div>
            <div className="p-md space-y-4">
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
              </div>
              <div className="grid grid-cols-3 gap-4">
                <CalculatorSlider
                  label="Property Mgmt"
                  value={inputs.propertyManagementPercent}
                  onChange={(v) => updateInput("propertyManagementPercent", v)}
                  min={0}
                  max={15}
                  step={1}
                />
                <CalculatorSlider
                  label="Maintenance"
                  value={inputs.maintenanceReservePercent}
                  onChange={(v) => updateInput("maintenanceReservePercent", v)}
                  min={0}
                  max={15}
                  step={1}
                />
                <CalculatorSlider
                  label="CapEx"
                  value={inputs.capexReservePercent}
                  onChange={(v) => updateInput("capexReservePercent", v)}
                  min={0}
                  max={15}
                  step={1}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <CalculatorInput
                  label="HOA (monthly)"
                  value={inputs.hoaMonthly}
                  onChange={(v) => updateInput("hoaMonthly", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Utilities"
                  value={inputs.utilitiesMonthly}
                  onChange={(v) => updateInput("utilitiesMonthly", v)}
                  type="currency"
                />
                <CalculatorInput
                  label="Other"
                  value={inputs.otherExpenses}
                  onChange={(v) => updateInput("otherExpenses", v)}
                  type="currency"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-small">
                <span className="text-small text-destructive">Total Monthly Expenses</span>
                <span className="text-body font-semibold text-destructive tabular-nums">
                  ${totalMonthlyExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Results - Right Column */}
        <div className="lg:col-span-2 space-y-lg">
          <ResultsCard
            title="Cash Flow Analysis"
            keyResult={{
              label: "Monthly Cash Flow",
              value: monthlyCashFlow,
              format: "currency",
              trend: monthlyCashFlow > 0 ? "positive" : "negative",
            }}
            dealScore={dealScore}
          >
            <div className="space-y-md">
              {/* Key Metrics */}
              <MetricGrid columns={2}>
                <KeyMetric 
                  label="Annual Cash Flow" 
                  value={annualCashFlow} 
                  format="currency"
                  trend={annualCashFlow > 0 ? "positive" : "negative"}
                />
                <KeyMetric 
                  label="Cap Rate" 
                  value={capRate} 
                  format="percentage"
                  trend={capRate >= 6 ? "positive" : "neutral"}
                />
                <KeyMetric 
                  label="Cash-on-Cash" 
                  value={cashOnCash} 
                  format="percentage"
                  trend={cashOnCash >= 8 ? "positive" : cashOnCash >= 5 ? "neutral" : "negative"}
                />
                <KeyMetric 
                  label="DSCR" 
                  value={dscr.toFixed(2)} 
                  trend={dscr >= 1.25 ? "positive" : dscr >= 1 ? "neutral" : "negative"}
                />
              </MetricGrid>

              <div className="h-px bg-border-subtle" />

              {/* Additional Metrics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-small">
                  <span className="text-content-secondary">GRM</span>
                  <span className="font-medium text-content tabular-nums">{grm.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between text-small">
                  <span className="text-content-secondary">Monthly NOI</span>
                  <span className="font-medium text-content tabular-nums">${monthlyNOI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              {/* Rule Checks */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">Quick Rules</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-surface-secondary rounded-small">
                    <span className="text-small text-content-secondary">1% Rule</span>
                    <div className="flex items-center gap-2">
                      {onePercentRule ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <Badge variant="success" size="sm">Pass</Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-destructive" />
                          <Badge variant="error" size="sm">Fail</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-surface-secondary rounded-small">
                    <span className="text-small text-content-secondary">50% Rule</span>
                    <div className="flex items-center gap-2">
                      {fiftyPercentRule ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <Badge variant="success" size="sm">Pass</Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-destructive" />
                          <Badge variant="error" size="sm">Fail</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              {/* Expense Breakdown Pie Chart */}
              {expenseBreakdown.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-small font-medium text-content flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Expense Breakdown
                  </h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {expenseBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={chartColorArray[index % chartColorArray.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '12px' }}
                          iconSize={8}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </div>
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
