import React from 'react';
import { TrendingUp, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DispoDeal } from '@/hooks/usePublicDeal';

interface DealInvestmentAnalysisProps {
  deal: DispoDeal;
}

export function DealInvestmentAnalysis({ deal }: DealInvestmentAnalysisProps) {
  if (!deal.arv || !deal.asking_price) return null;

  // Flip Analysis Calculations
  const repairs = deal.repair_estimate || 0;
  const holdingMonths = 4;
  const holdingCostsMonthly = 2000; // Estimated
  const holdingCosts = holdingMonths * holdingCostsMonthly;
  const sellingCostsPct = 0.06;
  const sellingCosts = deal.arv * sellingCostsPct;
  const totalInvestment = deal.asking_price + repairs + holdingCosts + sellingCosts;
  const grossProfit = deal.arv - totalInvestment;
  const roi = ((grossProfit / (deal.asking_price + repairs)) * 100);

  // Rental Analysis Calculations
  const totalAcquisition = deal.asking_price + repairs;
  const estimatedRent = deal.sqft ? Math.round(deal.sqft * 0.9) : 1500; // Rough estimate
  const monthlyExpenses = estimatedRent * 0.4; // 40% for taxes, insurance, maintenance
  const monthlyCashFlow = estimatedRent - monthlyExpenses;
  const annualNOI = monthlyCashFlow * 12;
  const capRate = (annualNOI / totalAcquisition) * 100;
  const downPayment = totalAcquisition * 0.25;
  const annualDebtService = (totalAcquisition * 0.75) * 0.08; // 8% interest approx
  const cashOnCash = ((annualNOI - annualDebtService) / downPayment) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flip" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="flip" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Flip Scenario
            </TabsTrigger>
            <TabsTrigger value="rental" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Rental Scenario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flip" className="space-y-4">
            <div className="bg-surface-secondary/50 rounded-lg p-4">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 text-muted-foreground">Purchase Price</td>
                    <td className="py-2 text-right font-medium">${deal.asking_price.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-muted-foreground">Repairs</td>
                    <td className="py-2 text-right font-medium">${repairs.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-muted-foreground">Holding Costs ({holdingMonths} mo)</td>
                    <td className="py-2 text-right font-medium">${holdingCosts.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-muted-foreground">Selling Costs (6%)</td>
                    <td className="py-2 text-right font-medium">${sellingCosts.toLocaleString()}</td>
                  </tr>
                  <tr className="font-medium">
                    <td className="py-2 text-foreground">Total Investment</td>
                    <td className="py-2 text-right">${totalInvestment.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-muted-foreground">ARV (Sale Price)</td>
                    <td className="py-2 text-right font-medium">${deal.arv.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Gross Profit</p>
                <p className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${grossProfit.toLocaleString()}
                </p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">ROI</p>
                <p className={`text-2xl font-bold ${roi >= 0 ? 'text-primary' : 'text-red-600'}`}>
                  {roi.toFixed(1)}%
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rental" className="space-y-4">
            <div className="bg-surface-secondary/50 rounded-lg p-4">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 text-muted-foreground">Purchase + Repairs</td>
                    <td className="py-2 text-right font-medium">${totalAcquisition.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-muted-foreground">Est. Monthly Rent</td>
                    <td className="py-2 text-right font-medium">${estimatedRent.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-muted-foreground">Est. Monthly Cash Flow</td>
                    <td className="py-2 text-right font-medium">${monthlyCashFlow.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Cap Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {capRate.toFixed(1)}%
                </p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Cash-on-Cash (25% down)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {cashOnCash.toFixed(1)}%
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              * Estimates only. Actual returns may vary. Verify all numbers independently.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
