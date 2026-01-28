import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, TrendingUp } from "lucide-react";
import type { RentalData } from "./types";

interface RentalMarketTableProps {
  data: RentalData[];
  vacancyRate: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function RentalMarketTable({ data, vacancyRate }: RentalMarketTableProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Rental Analysis</h4>
        </div>
        <Badge variant="secondary">
          Vacancy: {vacancyRate}%
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-small">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium text-muted-foreground">Beds</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Rent</th>
              <th className="text-right py-2 font-medium text-muted-foreground">$/SqFt</th>
              <th className="text-right py-2 font-medium text-muted-foreground">YoY</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.beds} className="border-b last:border-0 border-border-subtle">
                <td className="py-2 font-medium">{row.beds}</td>
                <td className="py-2 text-right tabular-nums">{formatCurrency(row.rent)}</td>
                <td className="py-2 text-right tabular-nums">${row.pricePerSqft.toFixed(2)}</td>
                <td className="py-2 text-right">
                  <span className="inline-flex items-center gap-1 text-success">
                    <TrendingUp className="h-3 w-3" />
                    +{row.yoyChange}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
