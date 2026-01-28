import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, MapPin } from "lucide-react";
import type { RecentSale } from "./types";

interface RecentSalesTableProps {
  sales: RecentSale[];
  onViewMap?: () => void;
  onExport?: () => void;
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function RecentSalesTable({ sales, onViewMap, onExport }: RecentSalesTableProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">Recent Sales</h4>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onViewMap}>
            <MapPin className="h-4 w-4 mr-1" />
            View Map
          </Button>
          <Button variant="ghost" size="sm" onClick={onExport}>
            <FileDown className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-small">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium text-muted-foreground">Address</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Price</th>
              <th className="text-center py-2 font-medium text-muted-foreground">Beds</th>
              <th className="text-right py-2 font-medium text-muted-foreground">SqFt</th>
              <th className="text-right py-2 font-medium text-muted-foreground">$/SqFt</th>
              <th className="text-right py-2 font-medium text-muted-foreground">DOM</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b last:border-0 border-border-subtle hover:bg-surface-secondary/50 transition-colors">
                <td className="py-2 font-medium">{sale.address}</td>
                <td className="py-2 text-right tabular-nums">{formatCurrency(sale.price)}</td>
                <td className="py-2 text-center tabular-nums">{sale.beds}/{sale.baths}</td>
                <td className="py-2 text-right tabular-nums">{sale.sqft.toLocaleString()}</td>
                <td className="py-2 text-right tabular-nums">${sale.pricePerSqft}</td>
                <td className="py-2 text-right tabular-nums">{sale.dom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
