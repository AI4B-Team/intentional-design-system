import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorInput, CalculatorSlider, InputGroup } from "./calculator-input";
import { ResultsCard, KeyMetric, MetricGrid, ComparisonBar } from "./results-card";
import { ProfitBreakdown } from "./deal-rating";
import { ScenarioComparison } from "./scenario-comparison";
import { RefreshCw, Download, Share } from "lucide-react";

interface WholesaleInputs {
  arv: number;
  repairCosts: number;
  arvPercentage: number;
  wholesaleFee: number;
  closingCosts: number;
  holdingCosts: number;
}

const defaultInputs: WholesaleInputs = {
  arv: 350000,
  repairCosts: 35000,
  arvPercentage: 70,
  wholesaleFee: 15000,
  closingCosts: 5000,
  holdingCosts: 3000,
};

export function WholesaleCalculator() {
  const [inputs, setInputs] = React.useState<WholesaleInputs>(defaultInputs);
  const [showScenarios, setShowScenarios] = React.useState(false);

  const updateInput = (key: keyof WholesaleInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Calculations
  const mao = (inputs.arv * (inputs.arvPercentage / 100)) - inputs.repairCosts;
  const maxOfferToSeller = mao - inputs.wholesaleFee;
  const buyerPrice = maxOfferToSeller + inputs.wholesaleFee;
  const buyerProfit = inputs.arv - buyerPrice - inputs.repairCosts - inputs.closingCosts - inputs.holdingCosts;
  const buyerROI = ((buyerProfit / (buyerPrice + inputs.repairCosts)) * 100);
  
  // Deal score (simplified)
  const dealScore = Math.min(100, Math.max(0,
    (inputs.wholesaleFee >= 10000 ? 30 : inputs.wholesaleFee / 333) +
    (buyerROI >= 15 ? 40 : buyerROI * 2.67) +
    (mao > 0 ? 30 : 0)
  ));

  const profitTrend = inputs.wholesaleFee >= 15000 ? "positive" as const : 
                      inputs.wholesaleFee >= 10000 ? "neutral" as const : "negative" as const;

  // Scenarios
  const [scenarios, setScenarios] = React.useState([
    { id: "conservative", name: "Conservative", inputs: { arvPercentage: 65, wholesaleFee: 10000 }, results: { profit: 0, roi: 0, cashOnCash: 0 } },
    { id: "standard", name: "Standard", inputs: { arvPercentage: 70, wholesaleFee: 15000 }, results: { profit: 0, roi: 0, cashOnCash: 0 } },
    { id: "aggressive", name: "Aggressive", inputs: { arvPercentage: 75, wholesaleFee: 20000 }, results: { profit: 0, roi: 0, cashOnCash: 0 } },
  ]);

  // Update scenario results
  React.useEffect(() => {
    setScenarios(prev => prev.map(scenario => {
      const scenarioMao = (inputs.arv * (scenario.inputs.arvPercentage / 100)) - inputs.repairCosts;
      const scenarioMaxOffer = scenarioMao - scenario.inputs.wholesaleFee;
      const scenarioBuyerPrice = scenarioMaxOffer + scenario.inputs.wholesaleFee;
      const scenarioBuyerProfit = inputs.arv - scenarioBuyerPrice - inputs.repairCosts - inputs.closingCosts - inputs.holdingCosts;
      const scenarioBuyerROI = ((scenarioBuyerProfit / (scenarioBuyerPrice + inputs.repairCosts)) * 100);
      
      return {
        ...scenario,
        results: {
          profit: scenario.inputs.wholesaleFee,
          roi: scenarioBuyerROI,
          cashOnCash: scenarioBuyerROI * 0.8,
        }
      };
    }));
  }, [inputs]);

  const bestScenarioId = scenarios.reduce((best, current) => 
    current.results.profit > (scenarios.find(s => s.id === best)?.results.profit || 0) ? current.id : best
  , scenarios[0].id);

  return (
    <div className="space-y-lg">
      {/* Main Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg">
        {/* Inputs - Left Column */}
        <div className="lg:col-span-3">
          <Card variant="default" padding="none">
            <div className="px-md py-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-h3 font-medium text-content">Deal Inputs</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={() => setInputs(defaultInputs)}>
                  Reset
                </Button>
              </div>
            </div>

            <div className="p-md space-y-lg">
              {/* Property Values */}
              <InputGroup title="Property Values">
                <CalculatorInput
                  label="After Repair Value (ARV)"
                  value={inputs.arv}
                  onChange={(v) => updateInput("arv", v)}
                  type="currency"
                  tooltip="The estimated market value after all repairs are completed"
                />
                <CalculatorInput
                  label="Repair Costs"
                  value={inputs.repairCosts}
                  onChange={(v) => updateInput("repairCosts", v)}
                  type="currency"
                  tooltip="Total estimated cost of repairs and renovations"
                />
              </InputGroup>

              {/* Divider */}
              <div className="h-px bg-border-subtle" />

              {/* Deal Structure */}
              <InputGroup title="Deal Structure">
                <CalculatorSlider
                  label="ARV Percentage"
                  value={inputs.arvPercentage}
                  onChange={(v) => updateInput("arvPercentage", v)}
                  min={50}
                  max={85}
                  step={1}
                  tooltip="Maximum percentage of ARV for the deal (typically 65-75% for flips)"
                />
                <CalculatorInput
                  label="Wholesale Fee (Your Profit)"
                  value={inputs.wholesaleFee}
                  onChange={(v) => updateInput("wholesaleFee", v)}
                  type="currency"
                  tooltip="The assignment fee you'll earn from this deal"
                />
              </InputGroup>

              {/* Divider */}
              <div className="h-px bg-border-subtle" />

              {/* Buyer Costs */}
              <InputGroup title="Buyer Costs (For ROI Calculation)">
                <div className="grid grid-cols-2 gap-4">
                  <CalculatorInput
                    label="Closing Costs"
                    value={inputs.closingCosts}
                    onChange={(v) => updateInput("closingCosts", v)}
                    type="currency"
                  />
                  <CalculatorInput
                    label="Holding Costs"
                    value={inputs.holdingCosts}
                    onChange={(v) => updateInput("holdingCosts", v)}
                    type="currency"
                  />
                </div>
              </InputGroup>
            </div>
          </Card>
        </div>

        {/* Results - Right Column */}
        <div className="lg:col-span-2">
          <ResultsCard
            title="Deal Analysis"
            keyResult={{
              label: "Your Wholesale Fee",
              value: inputs.wholesaleFee,
              format: "currency",
              trend: profitTrend,
            }}
            dealScore={dealScore}
          >
            <div className="space-y-md">
              {/* Key Metrics */}
              <MetricGrid columns={2}>
                <KeyMetric label="Max Offer to Seller" value={maxOfferToSeller} format="currency" />
                <KeyMetric label="MAO (70% Rule)" value={mao} format="currency" />
                <KeyMetric label="Buyer's Purchase Price" value={buyerPrice} format="currency" />
                <KeyMetric 
                  label="Buyer's ROI" 
                  value={buyerROI} 
                  format="percentage" 
                  trend={buyerROI >= 15 ? "positive" : buyerROI >= 10 ? "neutral" : "negative"}
                />
              </MetricGrid>

              {/* Divider */}
              <div className="h-px bg-border-subtle" />

              {/* Profit Breakdown */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">Buyer's Deal Breakdown</h4>
                <ProfitBreakdown
                  total={inputs.arv}
                  items={[
                    { label: "Purchase", value: maxOfferToSeller, color: "bg-brand-accent" },
                    { label: "Wholesale Fee", value: inputs.wholesaleFee, color: "bg-success" },
                    { label: "Repairs", value: inputs.repairCosts, color: "bg-warning" },
                    { label: "Buyer Profit", value: buyerProfit, color: "bg-info" },
                  ]}
                />
              </div>

              {/* Divider */}
              <div className="h-px bg-border-subtle" />

              {/* ROI Comparison */}
              <div className="space-y-3">
                <h4 className="text-small font-medium text-content">ROI Analysis</h4>
                <ComparisonBar label="Buyer ROI" value={buyerROI} maxValue={30} format="percentage" color="bg-brand-accent" />
                <ComparisonBar label="Target ROI (15%)" value={15} maxValue={30} format="percentage" color="bg-surface-tertiary" />
              </div>

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

      {/* Scenario Comparison */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-md">
          <Button
            variant={showScenarios ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowScenarios(!showScenarios)}
          >
            {showScenarios ? "Hide Scenarios" : "Compare Scenarios"}
          </Button>
        </div>

        {showScenarios && (
          <ScenarioComparison
            scenarios={scenarios}
            inputFields={[
              { key: "arvPercentage", label: "ARV %", type: "percentage" },
              { key: "wholesaleFee", label: "Fee", type: "currency" },
            ]}
            onScenarioChange={(id, key, value) => {
              setScenarios(prev => prev.map(s => 
                s.id === id ? { ...s, inputs: { ...s.inputs, [key]: value } } : s
              ));
            }}
            onApplyScenario={(id) => {
              const scenario = scenarios.find(s => s.id === id);
              if (scenario) {
                updateInput("arvPercentage", scenario.inputs.arvPercentage);
                updateInput("wholesaleFee", scenario.inputs.wholesaleFee);
              }
            }}
            bestScenarioId={bestScenarioId}
          />
        )}
      </Card>
    </div>
  );
}
