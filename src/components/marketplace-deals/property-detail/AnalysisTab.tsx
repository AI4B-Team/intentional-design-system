import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Zap,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DealRiskBar } from "@/components/marketplace-deals/DealRiskBar";
import { PropertySummaryHeader } from "./PropertySummaryHeader";
import { calculateEstimatedRent } from "@/lib/rent-calculations";
import type { MarketplaceDeal } from "@/hooks/useMockDeals";

interface AnalysisTabProps {
  deal: MarketplaceDeal;
  viewMode: "flip" | "hold";
}

// MAO Calculator Component
function MaoCalculatorCard({ arv, defaultRepairs }: { arv: number; defaultRepairs: number }) {
  const [arvPercent, setArvPercent] = useState(70);
  const [repairs, setRepairs] = useState(defaultRepairs);
  const [holdingCosts, setHoldingCosts] = useState(5000);
  const [closingCostPercent, setClosingCostPercent] = useState(6);
  const [assignmentFee, setAssignmentFee] = useState(10000);
  const [showWmao, setShowWmao] = useState(false);

  const closingCosts = Math.round(arv * (closingCostPercent / 100));
  const mao = Math.round(arv * (arvPercent / 100) - repairs - holdingCosts - closingCosts);
  const wmao = Math.round(mao - assignmentFee);

  const presets = [
    { label: "Conservative", percent: 60, color: "text-success" },
    { label: "Moderate", percent: 65, color: "text-muted-foreground" },
    { label: "Standard", percent: 70, color: "text-primary" },
    { label: "Aggressive", percent: 75, color: "text-warning" },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">MAO Calculator</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={!showWmao ? "default" : "outline"}
            size="sm"
            onClick={() => setShowWmao(false)}
            className="text-xs"
          >
            Flipper
          </Button>
          <Button
            variant={showWmao ? "default" : "outline"}
            size="sm"
            onClick={() => setShowWmao(true)}
            className="text-xs"
          >
            Wholesaler
          </Button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <Button
            key={preset.percent}
            variant={arvPercent === preset.percent ? "default" : "outline"}
            size="sm"
            onClick={() => setArvPercent(preset.percent)}
            className="text-xs"
          >
            {preset.label} ({preset.percent}%)
          </Button>
        ))}
      </div>

      {/* Controls */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-muted-foreground">ARV Percentage</Label>
            <span className="text-sm font-semibold">{arvPercent}%</span>
          </div>
          <Slider
            value={[arvPercent]}
            onValueChange={([val]) => setArvPercent(val)}
            min={50}
            max={85}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-muted-foreground">Est. Repairs</Label>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">$</span>
              <Input
                type="number"
                value={repairs}
                onChange={(e) => setRepairs(Number(e.target.value))}
                className="w-24 h-8 text-sm text-right"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-muted-foreground">Holding Costs</Label>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">$</span>
              <Input
                type="number"
                value={holdingCosts}
                onChange={(e) => setHoldingCosts(Number(e.target.value))}
                className="w-24 h-8 text-sm text-right"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-muted-foreground">Closing Costs</Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={closingCostPercent}
                onChange={(e) => setClosingCostPercent(Number(e.target.value))}
                className="w-16 h-8 text-sm text-right"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        {showWmao && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-muted-foreground">Desired Assignment Fee (Your Profit)</Label>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={assignmentFee}
                  onChange={(e) => setAssignmentFee(Number(e.target.value))}
                  className="w-24 h-8 text-sm text-right"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {showWmao ? (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-success/10 to-success/5 rounded-lg p-4 border border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Max Offer to Seller (WMAO)</p>
                <p className="text-3xl font-bold text-success">
                  ${wmao.toLocaleString()}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>MAO: ${mao.toLocaleString()}</p>
                <p>− Assignment Fee: ${assignmentFee.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-secondary/50 rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Buyer's MAO (Your Ask Price)</p>
                <p className="text-lg font-semibold text-primary">
                  ${mao.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Your Profit</p>
                <p className="text-lg font-semibold text-success">
                  ${assignmentFee.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Maximum Allowable Offer</p>
              <p className="text-3xl font-bold text-primary">
                ${mao.toLocaleString()}
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>ARV × {arvPercent}% = ${Math.round(arv * (arvPercent / 100)).toLocaleString()}</p>
              <p>− Repairs: ${repairs.toLocaleString()}</p>
              <p>− Holding: ${holdingCosts.toLocaleString()}</p>
              <p>− Closing: ${closingCosts.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Compare Grid */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {[60, 65, 70, 75].map((pct) => {
          const pctMao = Math.round(arv * (pct / 100) - repairs - holdingCosts - closingCosts);
          const value = showWmao ? pctMao - assignmentFee : pctMao;
          return (
            <div 
              key={pct}
              className={cn(
                "text-center p-2 rounded-lg border cursor-pointer transition-all",
                arvPercent === pct 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => setArvPercent(pct)}
            >
              <p className="text-xs text-muted-foreground">{pct}%</p>
              <p className={cn(
                "text-sm font-bold",
                pct === 60 ? "text-success" : 
                pct === 65 ? "text-muted-foreground" :
                pct === 70 ? "text-primary" : "text-warning"
              )}>
                ${(value / 1000).toFixed(0)}K
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function AnalysisTab({ deal, viewMode }: AnalysisTabProps) {
  // Fix & Flip calculations
  const estRepairs = 20000;
  const holdingCosts = 8000;
  const closingCosts = Math.round(deal.arv * 0.06);
  const agentCommission = Math.round(deal.arv * 0.05);
  const totalCosts = deal.price + estRepairs + holdingCosts + closingCosts + agentCommission;
  const profit = deal.arv - totalCosts;
  const roi = Math.round((profit / (deal.price + estRepairs)) * 100);

  // Rental calculations - use consistent rent estimate
  const estRent = calculateEstimatedRent(deal.sqft).monthlyRent;
  const propertyTax = Math.round((deal.price * 0.012) / 12);
  const insurance = Math.round((deal.price * 0.005) / 12);
  const mortgage = Math.round((deal.price * 0.8) * (0.07 / 12) / (1 - Math.pow(1 + 0.07 / 12, -360)));
  const estPiti = mortgage + propertyTax + insurance;
  const vacancy = Math.round(estRent * 0.05);
  const maintenance = Math.round(estRent * 0.08);
  const propertyMgmt = Math.round(estRent * 0.10);
  const netCashflow = estRent - estPiti - vacancy - maintenance - propertyMgmt;
  const noi = (estRent - vacancy - maintenance - propertyMgmt) * 12;
  const capRate = (noi / deal.price) * 100;
  const cashOnCash = ((netCashflow * 12) / (deal.price * 0.25)) * 100;
  const grm = deal.price / (estRent * 12);

  return (
    <div className="space-y-6">
      {/* Property Summary Header */}
      <PropertySummaryHeader deal={deal} viewMode={viewMode} />
      
      {/* Deal Risk Bar */}
      <Card className="p-4">
        <DealRiskBar arvPercent={deal.arvPercent} />
      </Card>

      {/* MAO Calculator */}
      <MaoCalculatorCard arv={deal.arv} defaultRepairs={estRepairs} />

      {viewMode === "flip" ? (
        <>
          {/* Fix & Flip Analysis */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Fix & Flip Analysis</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Purchase Price</span>
                  <span className="font-medium">${deal.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">After Repair Value (ARV)</span>
                  <span className="font-medium text-primary">${deal.arv.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Est. Repairs</span>
                  <span className="font-medium text-destructive">-${estRepairs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Holding Costs</span>
                  <span className="font-medium text-destructive">-${holdingCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Closing Costs (6%)</span>
                  <span className="font-medium text-destructive">-${closingCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Agent Commission (5%)</span>
                  <span className="font-medium text-destructive">-${agentCommission.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Potential Profit</span>
                  <span className={cn(
                    "text-xl font-bold",
                    profit > 0 ? "text-success" : "text-destructive"
                  )}>
                    ${profit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ROI</span>
                  <span className={cn(
                    "font-semibold",
                    roi >= 20 ? "text-success" : roi >= 10 ? "text-warning" : "text-destructive"
                  )}>
                    {roi}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ARV Ratio</span>
                  <span className="font-semibold">{deal.arvPercent}%</span>
                </div>
              </div>

              {/* AI Insights */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium">AI Insights</span>
                </div>
                <div className="space-y-2">
                  {profit > 30000 ? (
                    <div className="flex items-start gap-2 p-2.5 rounded-md bg-success/10 border border-success/20">
                      <TrendingUp className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground">
                        <span className="font-medium text-success">Strong deal potential.</span> Profit margin exceeds $30K with a healthy {roi}% ROI.
                      </p>
                    </div>
                  ) : profit > 15000 ? (
                    <div className="flex items-start gap-2 p-2.5 rounded-md bg-warning/10 border border-warning/20">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground">
                        <span className="font-medium text-warning">Tight Margins:</span> ${profit.toLocaleString()} profit leaves little room for error.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-2.5 rounded-md bg-warning/10 border border-warning/20">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground">
                        <span className="font-medium text-warning">Thin margins.</span> Consider negotiating a lower purchase price.
                      </p>
                    </div>
                  )}
                  {deal.arvPercent < 70 && (
                    <div className="flex items-start gap-2 p-2.5 rounded-md bg-success/10 border border-success/20">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground">
                        <span className="font-medium text-success">Below 70% ARV.</span> Good equity buffer for unexpected costs.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Rental Analysis */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Home className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Rental Cashflow Analysis</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Purchase Price</span>
                  <span className="font-medium">${deal.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Est. Monthly Rent</span>
                  <span className="font-medium text-success">${estRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mortgage (P&I)</span>
                  <span className="font-medium">-${mortgage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Property Tax</span>
                  <span className="font-medium">-${propertyTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Insurance</span>
                  <span className="font-medium">-${insurance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">PITI Total</span>
                  <span className="font-medium text-destructive">-${estPiti.toLocaleString()}/mo</span>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Vacancy (5%)</span>
                  <span>-${vacancy}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Maintenance (8%)</span>
                  <span>-${maintenance}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Property Mgmt (10%)</span>
                  <span>-${propertyMgmt}</span>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Net Cashflow</span>
                  <span className={cn(
                    "text-xl font-bold",
                    netCashflow >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {netCashflow >= 0 ? "+" : ""}${netCashflow.toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Annual Cashflow</span>
                  <span className={cn(
                    "font-semibold",
                    netCashflow >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {netCashflow >= 0 ? "+" : ""}${(netCashflow * 12).toLocaleString()}/yr
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Cap Rate</p>
                    <p className={cn(
                      "text-xl font-bold",
                      capRate >= 8 ? "text-success" : capRate >= 5 ? "text-warning" : "text-muted-foreground"
                    )}>
                      {capRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {capRate >= 8 ? "Excellent" : capRate >= 6 ? "Good" : capRate >= 4 ? "Fair" : "Below Avg"}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Cash-on-Cash</p>
                    <p className={cn(
                      "text-xl font-bold",
                      cashOnCash >= 10 ? "text-success" : cashOnCash >= 6 ? "text-warning" : "text-muted-foreground"
                    )}>
                      {cashOnCash.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cashOnCash >= 12 ? "Excellent" : cashOnCash >= 8 ? "Good" : cashOnCash >= 5 ? "Fair" : "Below Avg"}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">GRM</p>
                    <p className="text-xl font-bold">{grm.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {grm <= 10 ? "Excellent" : grm <= 15 ? "Good" : "High"}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">1% Rule</p>
                    <p className={cn(
                      "text-xl font-bold",
                      (estRent / deal.price * 100) >= 1 ? "text-success" : "text-warning"
                    )}>
                      {(estRent / deal.price * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(estRent / deal.price * 100) >= 1 ? "Passes ✓" : "Below 1%"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Insight */}
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI Insight</span>
              </div>
            </div>
            <p className="text-sm text-foreground">
              Strong rental demand in {deal.zip}. Similar properties rent within 12 days.
              {capRate >= 7 ? " Cap rate exceeds market average." : ""}
              {netCashflow >= 300 ? " Excellent monthly cash flow potential." : ""}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
