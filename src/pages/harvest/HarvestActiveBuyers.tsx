import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

const BUYERS = [
  { name: "Apex Capital Holdings", market: "Dallas–Fort Worth, TX", strategy: "Flip", boughtLast30: 8, avgPrice: 285000 },
  { name: "Lone Star Property Group", market: "Houston, TX", strategy: "Buy & Hold", boughtLast30: 12, avgPrice: 195000 },
  { name: "Magnolia REI", market: "Atlanta, GA", strategy: "BRRRR", boughtLast30: 5, avgPrice: 165000 },
  { name: "Sunshine State Investors", market: "Tampa, FL", strategy: "Flip", boughtLast30: 6, avgPrice: 240000 },
  { name: "Phoenix Cash Buyers LLC", market: "Phoenix, AZ", strategy: "Buy & Hold", boughtLast30: 9, avgPrice: 310000 },
];

export default function HarvestActiveBuyers() {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        Active Buyers — investors transacting in your markets right now. Useful for matching disposition targets.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {BUYERS.map((b) => (
          <Card key={b.name} className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-foreground">{b.name}</div>
                  <Badge variant="outline" className="text-[10px]">{b.strategy}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{b.market}</div>
                <div className="mt-2 flex gap-4 text-xs">
                  <Stat label="30d Acquired" value={b.boughtLast30.toString()} />
                  <Stat label="Avg Price" value={`$${b.avgPrice.toLocaleString()}`} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
