import * as React from "react";
import { Home } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export interface SubjectPropertySummaryCardProps {
  imageUrl: string;
  address: string;
  locationLine: string;
  askingPrice: number;
  arv: number;
  offerAmount: number;
  className?: string;
}

export function SubjectPropertySummaryCard({
  imageUrl,
  address,
  locationLine,
  askingPrice,
  arv,
  offerAmount,
  className,
}: SubjectPropertySummaryCardProps) {
  return (
    <Card className={cn("p-4", className)}>
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <Home className="h-4 w-4" />
        Subject Property
      </h4>
      <div className="flex gap-4">
        <div className="w-20 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
          <img
            src={imageUrl}
            alt={`Subject property at ${address}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-medium">{address}</h5>
          <p className="text-sm text-muted-foreground">{locationLine}</p>
          <div className="flex items-center gap-4 mt-1 text-sm">
            <span>
              Asking: <span className="font-medium">{formatCurrency(askingPrice)}</span>
            </span>
            <span className="text-primary">
              ARV: <span className="font-medium">{formatCurrency(arv)}</span>
            </span>
            <span className="text-success">
              Offer: <span className="font-medium">{formatCurrency(offerAmount)}</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
