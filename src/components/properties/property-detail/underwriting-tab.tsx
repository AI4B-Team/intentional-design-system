import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Plus,
  Edit,
  Star,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

interface UnderwritingTabProps {
  property: {
    arv?: number;
    repairs?: number;
  };
}

const comps = [
  { id: 1, address: "1245 Oak Street", distance: "0.3 mi", soldPrice: 425000, sqft: 1850, pricePerSqft: 230, rating: 5, adjustments: [{ reason: "Pool", amount: -15000 }, { reason: "Extra Bed", amount: 10000 }] },
  { id: 2, address: "1389 Maple Ave", distance: "0.4 mi", soldPrice: 415000, sqft: 1780, pricePerSqft: 233, rating: 4, adjustments: [{ reason: "Larger Lot", amount: 8000 }] },
  { id: 3, address: "1567 Pine Road", distance: "0.5 mi", soldPrice: 398000, sqft: 1720, pricePerSqft: 231, rating: 4, adjustments: [] },
  { id: 4, address: "1423 Cedar Lane", distance: "0.6 mi", soldPrice: 445000, sqft: 2100, pricePerSqft: 212, rating: 3, adjustments: [{ reason: "Newer Build", amount: -25000 }] },
];

const repairCategories = [
  { name: "Roof", amount: 8500, percentage: 28 },
  { name: "Kitchen", amount: 12000, percentage: 40 },
  { name: "Bathrooms", amount: 5500, percentage: 18 },
  { name: "Flooring", amount: 2500, percentage: 8 },
  { name: "Paint/Misc", amount: 1500, percentage: 5 },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < rating ? "fill-warning text-warning" : "text-surface-tertiary"
          )}
        />
      ))}
    </div>
  );
}

export function UnderwritingTab({ property }: UnderwritingTabProps) {
  const [expandedComp, setExpandedComp] = React.useState<number | null>(null);
  const [arvPercentage, setArvPercentage] = React.useState(70);
  
  const arv = property.arv || 425000;
  const repairs = property.repairs || 30000;
  
  const offerLevels = [
    { level: "Conservative", percentage: 65, amount: arv * 0.65 - repairs, spread: arv - (arv * 0.65), recommended: false },
    { level: "Standard", percentage: 70, amount: arv * 0.70 - repairs, spread: arv - (arv * 0.70), recommended: true },
    { level: "Aggressive", percentage: 75, amount: arv * 0.75 - repairs, spread: arv - (arv * 0.75), recommended: false },
  ];

  const totalRepairs = repairCategories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className="p-lg space-y-lg">
      {/* ARV Section */}
      <Card variant="default" padding="none">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
          <CardTitle className="text-h3 font-medium">After Repair Value (ARV)</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-display font-semibold text-content tabular-nums">
              {formatCurrency(arv)}
            </span>
            <Button variant="ghost" size="sm" icon={<Edit />}>
              Adjust
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Comps Table */}
          <div className="rounded-medium border border-border-subtle overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">
                    Address
                  </th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">
                    Sold Price
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">
                    $/SqFt
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">
                    Distance
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {comps.map((comp, index) => (
                  <React.Fragment key={comp.id}>
                    <tr
                      className={cn(
                        "h-12 cursor-pointer transition-colors",
                        index % 2 === 0 ? "bg-white" : "bg-surface-secondary/30",
                        "hover:bg-brand-accent/5"
                      )}
                      onClick={() => setExpandedComp(expandedComp === comp.id ? null : comp.id)}
                    >
                      <td className="px-4 text-body font-medium text-content">
                        {comp.address}
                      </td>
                      <td className="px-4 text-center">
                        <RatingStars rating={comp.rating} />
                      </td>
                      <td className="px-4 text-right text-body tabular-nums">
                        {formatCurrency(comp.soldPrice)}
                      </td>
                      <td className="px-4 text-right text-body tabular-nums text-content-secondary">
                        ${comp.pricePerSqft}
                      </td>
                      <td className="px-4 text-right text-small text-content-secondary">
                        {comp.distance}
                      </td>
                      <td className="px-2">
                        {comp.adjustments.length > 0 && (
                          expandedComp === comp.id ? (
                            <ChevronUp className="h-4 w-4 text-content-tertiary" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-content-tertiary" />
                          )
                        )}
                      </td>
                    </tr>
                    {/* Adjustments Row */}
                    {expandedComp === comp.id && comp.adjustments.length > 0 && (
                      <tr className="bg-surface-secondary/50">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="flex items-center gap-4 text-small">
                            <span className="text-content-secondary">Adjustments:</span>
                            {comp.adjustments.map((adj, i) => (
                              <span key={i} className={cn(
                                "font-medium",
                                adj.amount > 0 ? "text-success" : "text-destructive"
                              )}>
                                {adj.reason}: {adj.amount > 0 ? "+" : ""}{formatCurrency(adj.amount)}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <Button variant="ghost" size="sm" icon={<Plus />} className="mt-3">
            Add Comp
          </Button>
        </CardContent>
      </Card>

      {/* Repairs Section */}
      <Card variant="default" padding="none">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
          <CardTitle className="text-h3 font-medium">Repair Estimate</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-display font-semibold text-content tabular-nums">
              {formatCurrency(totalRepairs)}
            </span>
            <Button variant="ghost" size="sm" icon={<Edit />}>
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Category Bars */}
          <div className="space-y-3 mb-4">
            {repairCategories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-small">
                  <span className="text-content">{cat.name}</span>
                  <span className="text-content-secondary tabular-nums">{formatCurrency(cat.amount)}</span>
                </div>
                <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-accent rounded-full transition-all duration-300"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" size="sm" icon={<Plus />}>
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* MAO Calculator */}
      <Card variant="default" padding="none">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-h3 font-medium">Maximum Allowable Offer (MAO)</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* ARV Percentage Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-small text-content-secondary">ARV Percentage</span>
              <span className="text-body font-medium text-content tabular-nums">{arvPercentage}%</span>
            </div>
            <Slider
              value={[arvPercentage]}
              onValueChange={([v]) => setArvPercentage(v)}
              min={50}
              max={85}
              step={5}
            />
          </div>

          {/* Offer Level Cards */}
          <div className="space-y-3">
            {offerLevels.map((offer) => (
              <div
                key={offer.level}
                className={cn(
                  "flex items-center justify-between p-4 rounded-medium border transition-all",
                  offer.recommended
                    ? "border-brand-accent bg-brand-accent/5"
                    : "border-border-subtle bg-white hover:border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  {offer.recommended && (
                    <CheckCircle2 className="h-5 w-5 text-brand-accent" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-body font-medium text-content">{offer.level}</span>
                      {offer.recommended && (
                        <Badge variant="default" size="sm">Recommended</Badge>
                      )}
                    </div>
                    <span className="text-small text-content-secondary">{offer.percentage}% of ARV</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-h2 font-semibold text-content tabular-nums">
                      {formatCurrency(offer.amount)}
                    </div>
                    <div className="text-small text-success tabular-nums">
                      Spread: {formatCurrency(offer.spread)}
                    </div>
                  </div>
                  <Button
                    variant={offer.recommended ? "primary" : "secondary"}
                    size="sm"
                  >
                    Use This
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
