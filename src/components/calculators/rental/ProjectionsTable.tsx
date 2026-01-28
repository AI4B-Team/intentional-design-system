import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrendingUp } from "lucide-react";
import type { ProjectionYear, RentalResults, RentalInputs, RentalMode } from "./types";
import { calculateProjections } from "./useRentalCalculations";

interface ProjectionsTableProps {
  inputs: RentalInputs;
  results: RentalResults;
  mode: RentalMode;
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function ProjectionsTable({ inputs, results, mode }: ProjectionsTableProps) {
  const [appreciationRate, setAppreciationRate] = React.useState(3);
  const [rentGrowthRate, setRentGrowthRate] = React.useState(2);

  const { projections, breakEvenYear } = React.useMemo(
    () => calculateProjections(inputs, results, mode, 5, appreciationRate, rentGrowthRate),
    [inputs, results, mode, appreciationRate, rentGrowthRate]
  );

  const fiveYearReturn = projections[4]?.totalReturn ?? 0;
  const effectiveCashInvested = mode === "brrrr" 
    ? Math.max(0, results.cashLeftInDeal) 
    : results.totalCashInvested;
  const fiveYearROI = effectiveCashInvested > 0 ? (fiveYearReturn / effectiveCashInvested) * 100 : 0;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">5-Year Projection</h4>
        </div>
        {breakEvenYear && breakEvenYear > 1 && (
          <Badge variant="info">Break-even: Year {breakEvenYear}</Badge>
        )}
      </div>

      {/* Assumptions */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-surface-secondary rounded-md">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-tiny">Appreciation</Label>
            <span className="text-tiny font-medium">{appreciationRate}%/yr</span>
          </div>
          <Slider
            value={[appreciationRate]}
            onValueChange={([v]) => setAppreciationRate(v)}
            min={0}
            max={10}
            step={0.5}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-tiny">Rent Growth</Label>
            <span className="text-tiny font-medium">{rentGrowthRate}%/yr</span>
          </div>
          <Slider
            value={[rentGrowthRate]}
            onValueChange={([v]) => setRentGrowthRate(v)}
            min={0}
            max={10}
            step={0.5}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-small">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium text-muted-foreground">Year</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Value</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Rent</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Cash Flow</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Equity</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Return</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((p) => (
              <tr key={p.year} className="border-b last:border-0">
                <td className="py-2 font-medium">{p.year}</td>
                <td className="py-2 text-right tabular-nums">{formatCurrency(p.propertyValue)}</td>
                <td className="py-2 text-right tabular-nums">${p.monthlyRent.toLocaleString()}</td>
                <td className={`py-2 text-right tabular-nums ${p.annualCashFlow >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatCurrency(p.annualCashFlow)}
                </td>
                <td className="py-2 text-right tabular-nums">{formatCurrency(p.equity)}</td>
                <td className="py-2 text-right tabular-nums">{formatCurrency(p.totalReturn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <span className="text-small text-muted-foreground">5yr Return:</span>
        <span className="font-semibold">
          {formatCurrency(fiveYearReturn)} ({fiveYearROI.toFixed(0)}% on {formatCurrency(effectiveCashInvested)})
        </span>
      </div>
    </Card>
  );
}
