import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorInput, CalculatorSlider, InputGroup } from "./calculator-input";
import {
  Building,
  RefreshCw,
  Download,
  Share,
  Save,
  Home,
  TrendingUp,
} from "lucide-react";
import {
  type RentalInputs,
  type RentalMode,
  DEFAULT_RENTAL_INPUTS,
  useRentalCalculations,
  CashFlowCard,
  KeyMetricsTable,
  DealVerdict,
  RulesOfThumb,
  ProjectionsTable,
  ScenarioComparison,
  BRRRRSection,
} from "./rental";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RentalCalculatorProps {
  propertyId?: string;
  initialValues?: Partial<RentalInputs>;
}

export function RentalCalculator({ propertyId, initialValues }: RentalCalculatorProps) {
  const [mode, setMode] = React.useState<RentalMode>("standard");
  const [inputs, setInputs] = React.useState<RentalInputs>({
    ...DEFAULT_RENTAL_INPUTS,
    ...initialValues,
  });

  const updateInput = <K extends keyof RentalInputs>(key: K, value: RentalInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const results = useRentalCalculations(inputs, mode);
  const handleReset = () => setInputs(DEFAULT_RENTAL_INPUTS);

  // Calculate totals for display
  const totalAcquisitionCost = inputs.purchasePrice + inputs.closingCosts + inputs.rehabCosts;

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Building className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-h3 font-bold text-foreground">Rental Property Calculator</h2>
            <p className="text-small text-muted-foreground">
              Analyze cash flow and returns
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as RentalMode)}>
          <TabsList>
            <TabsTrigger value="standard" className="gap-2">
              <Home className="h-4 w-4" />
              Buy & Hold
            </TabsTrigger>
            <TabsTrigger value="brrrr" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              BRRRR
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Inputs - Left Column */}
        <div className="lg:col-span-5 space-y-4">
          <Accordion
            type="multiple"
            defaultValue={["property", "acquisition", "financing", "income", "expenses"]}
            className="space-y-3"
          >
            {/* Property */}
            <AccordionItem value="property" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-surface-secondary/50">
                <span className="font-medium">Property</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label htmlFor="address" className="text-small">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, Austin, TX"
                    value={inputs.address}
                    onChange={(e) => updateInput("address", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-small">Type</Label>
                    <Select
                      value={inputs.propertyType}
                      onValueChange={(v) => updateInput("propertyType", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sfh">SFH</SelectItem>
                        <SelectItem value="condo">Condo/Townhouse</SelectItem>
                        <SelectItem value="duplex">Duplex</SelectItem>
                        <SelectItem value="triplex">Triplex</SelectItem>
                        <SelectItem value="fourplex">Fourplex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <CalculatorInput
                    label="Units"
                    value={inputs.units}
                    onChange={(v) => updateInput("units", v)}
                    type="number"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <CalculatorInput
                    label="Beds"
                    value={inputs.beds}
                    onChange={(v) => updateInput("beds", v)}
                    type="number"
                  />
                  <CalculatorInput
                    label="Baths"
                    value={inputs.baths}
                    onChange={(v) => updateInput("baths", v)}
                    type="number"
                  />
                  <CalculatorInput
                    label="SqFt"
                    value={inputs.sqft}
                    onChange={(v) => updateInput("sqft", v)}
                    type="number"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Acquisition */}
            <AccordionItem value="acquisition" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-surface-secondary/50">
                <div className="flex items-center justify-between flex-1 pr-4">
                  <span className="font-medium">Acquisition</span>
                  <span className="text-small text-muted-foreground tabular-nums">
                    ${totalAcquisitionCost.toLocaleString()}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <CalculatorInput
                  label="Purchase Price"
                  value={inputs.purchasePrice}
                  onChange={(v) => updateInput("purchasePrice", v)}
                  type="currency"
                />
                <div className="grid grid-cols-2 gap-3">
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
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-md">
                  <span className="text-small text-muted-foreground">Total</span>
                  <span className="font-semibold tabular-nums">
                    ${totalAcquisitionCost.toLocaleString()}
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Financing */}
            <AccordionItem value="financing" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-surface-secondary/50">
                <div className="flex items-center justify-between flex-1 pr-4">
                  <span className="font-medium">Financing</span>
                  <span className="text-small text-muted-foreground tabular-nums">
                    ${results.monthlyPI.toFixed(0)}/mo
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label className="text-small">Loan Type</Label>
                  <Select
                    value={inputs.financingType}
                    onValueChange={(v) => updateInput("financingType", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conventional">Conventional</SelectItem>
                      <SelectItem value="fha">FHA</SelectItem>
                      <SelectItem value="va">VA</SelectItem>
                      <SelectItem value="hard_money">Hard Money</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CalculatorSlider
                  label="Down Payment"
                  value={inputs.downPaymentPercent}
                  onChange={(v) => updateInput("downPaymentPercent", v)}
                  min={0}
                  max={100}
                  step={5}
                  formatValue={(v) => `${v}% = $${results.downPayment.toLocaleString()}`}
                />
                <div className="flex items-center justify-between p-3 bg-info/10 rounded-md">
                  <span className="text-small text-info">Loan Amount</span>
                  <span className="font-semibold text-info tabular-nums">
                    ${results.loanAmount.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CalculatorSlider
                    label="Interest Rate"
                    value={inputs.interestRate}
                    onChange={(v) => updateInput("interestRate", v)}
                    min={3}
                    max={15}
                    step={0.125}
                  />
                  <CalculatorSlider
                    label="Term"
                    value={inputs.loanTermYears}
                    onChange={(v) => updateInput("loanTermYears", v)}
                    min={10}
                    max={30}
                    step={5}
                    suffix=" yrs"
                  />
                </div>
                <CalculatorInput
                  label="PMI (monthly)"
                  value={inputs.pmi}
                  onChange={(v) => updateInput("pmi", v)}
                  type="currency"
                />
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-md">
                  <span className="text-small text-muted-foreground">Monthly P&I</span>
                  <span className="font-semibold tabular-nums">
                    ${results.monthlyPI.toFixed(2)}
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* BRRRR Section - Only shown in BRRRR mode */}
            {mode === "brrrr" && (
              <BRRRRSection
                inputs={inputs}
                results={results}
                onUpdate={updateInput}
              />
            )}

            {/* Income */}
            <AccordionItem value="income" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-surface-secondary/50">
                <div className="flex items-center justify-between flex-1 pr-4">
                  <span className="font-medium">Income</span>
                  <span className="text-small text-success tabular-nums">
                    ${results.effectiveGrossIncome.toFixed(0)}/mo
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-3">
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
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-md">
                  <span className="text-small text-muted-foreground">Gross</span>
                  <span className="font-medium tabular-nums">
                    ${results.grossMonthlyIncome.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CalculatorSlider
                    label="Vacancy"
                    value={inputs.vacancyRate}
                    onChange={(v) => updateInput("vacancyRate", v)}
                    min={0}
                    max={20}
                    step={1}
                  />
                  <CalculatorSlider
                    label="Credit Loss"
                    value={inputs.creditLossRate}
                    onChange={(v) => updateInput("creditLossRate", v)}
                    min={0}
                    max={10}
                    step={1}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-md">
                  <span className="text-small text-success">Effective Income</span>
                  <span className="font-semibold text-success tabular-nums">
                    ${results.effectiveGrossIncome.toFixed(0)}/mo
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Expenses */}
            <AccordionItem value="expenses" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-surface-secondary/50">
                <div className="flex items-center justify-between flex-1 pr-4">
                  <span className="font-medium">Expenses</span>
                  <span className="text-small text-destructive tabular-nums">
                    ${results.totalMonthlyExpenses.toFixed(0)}/mo
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <CalculatorInput
                    label="Taxes (monthly)"
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
                <CalculatorInput
                  label="HOA (monthly)"
                  value={inputs.hoaMonthly}
                  onChange={(v) => updateInput("hoaMonthly", v)}
                  type="currency"
                />
                <div className="grid grid-cols-3 gap-3">
                  <CalculatorSlider
                    label="Management"
                    value={inputs.propertyManagementPercent}
                    onChange={(v) => updateInput("propertyManagementPercent", v)}
                    min={0}
                    max={15}
                    step={1}
                    formatValue={(v) => `${v}% = $${results.propertyManagement.toFixed(0)}`}
                  />
                  <CalculatorSlider
                    label="Maintenance"
                    value={inputs.maintenancePercent}
                    onChange={(v) => updateInput("maintenancePercent", v)}
                    min={0}
                    max={15}
                    step={1}
                    formatValue={(v) => `${v}% = $${results.maintenance.toFixed(0)}`}
                  />
                  <CalculatorSlider
                    label="CapEx"
                    value={inputs.capexPercent}
                    onChange={(v) => updateInput("capexPercent", v)}
                    min={0}
                    max={15}
                    step={1}
                    formatValue={(v) => `${v}% = $${results.capex.toFixed(0)}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-md">
                  <span className="text-small text-destructive">Total Expenses</span>
                  <span className="font-semibold text-destructive tabular-nums">
                    ${results.totalMonthlyExpenses.toFixed(0)}/mo
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>

        {/* Results - Right Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Cash Flow */}
          <CashFlowCard results={results} />

          {/* Key Metrics & Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KeyMetricsTable results={results} inputs={inputs} />
            <RulesOfThumb results={results} inputs={inputs} />
          </div>

          {/* Deal Verdict */}
          <DealVerdict results={results} inputs={inputs} />

          {/* Projections */}
          <ProjectionsTable inputs={inputs} results={results} mode={mode} />

          {/* Scenario Comparison */}
          <ScenarioComparison
            inputs={inputs}
            mode={mode}
            currentDownPayment={inputs.downPaymentPercent}
          />

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button icon={<Save />}>Save Analysis</Button>
            <Button variant="secondary" icon={<Download />}>PDF</Button>
            <Button variant="secondary" icon={<Share />}>Share</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
