import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home,
  MapPin,
  Calendar,
  Ruler,
  Bed,
  Bath,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CompProperty {
  id: string;
  address: string;
  city: string;
  salePrice: number;
  saleDate: string;
  sqft: number;
  beds: number;
  baths: number;
  pricePerSqft: number;
  distanceMiles: number;
  similarity: number;
}

interface RecentCompsProps {
  comps?: CompProperty[];
  subjectAddress?: string;
  onViewAllComps?: () => void;
}

// Mock data for demonstration
const mockComps: CompProperty[] = [
  {
    id: "1",
    address: "1423 Oak Street",
    city: "Austin, TX",
    salePrice: 485000,
    saleDate: "2025-12-15",
    sqft: 1850,
    beds: 3,
    baths: 2,
    pricePerSqft: 262,
    distanceMiles: 0.3,
    similarity: 94,
  },
  {
    id: "2",
    address: "789 Maple Avenue",
    city: "Austin, TX",
    salePrice: 465000,
    saleDate: "2025-11-28",
    sqft: 1780,
    beds: 3,
    baths: 2,
    pricePerSqft: 261,
    distanceMiles: 0.5,
    similarity: 89,
  },
  {
    id: "3",
    address: "2156 Pine Road",
    city: "Austin, TX",
    salePrice: 498000,
    saleDate: "2025-10-10",
    sqft: 1920,
    beds: 4,
    baths: 2.5,
    pricePerSqft: 259,
    distanceMiles: 0.7,
    similarity: 85,
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RecentComps({ comps = mockComps, subjectAddress, onViewAllComps }: RecentCompsProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Home className="h-4 w-4 text-primary" />
          Recent Comparable Sales
        </h3>
        <Badge variant="secondary" size="sm">
          {comps.length} Found
        </Badge>
      </div>

      <div className="space-y-3">
        {comps.map((comp, idx) => (
          <div
            key={comp.id}
            className={cn(
              "p-3 rounded-lg border border-border-subtle hover:bg-surface-secondary/50 transition-colors",
              idx === 0 && "ring-1 ring-primary/20 bg-primary/5"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground truncate">
                    {comp.address}
                  </span>
                  {idx === 0 && (
                    <Badge variant="success" size="sm">Best Match</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-tiny text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {comp.distanceMiles} mi
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(comp.saleDate)}
                  </span>
                  <span>{comp.similarity}% match</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-bold text-foreground">
                  {formatCurrency(comp.salePrice)}
                </div>
                <div className="text-tiny text-muted-foreground">
                  ${comp.pricePerSqft}/sqft
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 text-tiny text-muted-foreground">
              <span className="flex items-center gap-1">
                <Bed className="h-3 w-3" />
                {comp.beds} beds
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-3 w-3" />
                {comp.baths} baths
              </span>
              <span className="flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                {comp.sqft.toLocaleString()} sqft
              </span>
            </div>
          </div>
        ))}
      </div>

      {onViewAllComps && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3"
          onClick={onViewAllComps}
        >
          View All Comps
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}

      <div className="mt-4 pt-4 border-t border-border-subtle">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-tiny text-muted-foreground">Avg Sale Price</div>
            <div className="font-semibold text-foreground">
              {formatCurrency(comps.reduce((a, b) => a + b.salePrice, 0) / comps.length)}
            </div>
          </div>
          <div>
            <div className="text-tiny text-muted-foreground">Avg $/SqFt</div>
            <div className="font-semibold text-foreground">
              ${Math.round(comps.reduce((a, b) => a + b.pricePerSqft, 0) / comps.length)}
            </div>
          </div>
          <div>
            <div className="text-tiny text-muted-foreground">Avg Distance</div>
            <div className="font-semibold text-foreground">
              {(comps.reduce((a, b) => a + b.distanceMiles, 0) / comps.length).toFixed(1)} mi
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
