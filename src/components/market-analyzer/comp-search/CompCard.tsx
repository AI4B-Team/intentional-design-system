import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Home,
  DollarSign,
  Calendar,
  Navigation,
  Bed,
  Bath,
  Ruler,
  Eye,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompResult } from "./types";

interface CompCardProps {
  comp: CompResult;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onViewDetails: (comp: CompResult) => void;
  subjectSqft?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getConditionColor(condition: string): string {
  switch (condition.toLowerCase()) {
    case "excellent":
      return "bg-green-100 text-green-700";
    case "good":
      return "bg-blue-100 text-blue-700";
    case "fair":
      return "bg-amber-100 text-amber-700";
    case "poor":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getSaleTypeLabel(saleType: string): string {
  switch (saleType) {
    case "reo":
      return "REO";
    case "short_sale":
      return "Short Sale";
    case "auction":
      return "Auction";
    default:
      return "Standard";
  }
}

function getRecencyLabel(dateStr: string): string {
  const saleDate = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - saleDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return "This week";
  if (diffDays <= 14) return "2 weeks ago";
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays <= 60) return "1 month ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function CompCard({
  comp,
  isSelected,
  onSelect,
  onViewDetails,
  subjectSqft,
}: CompCardProps) {
  const isRecent = new Date(comp.saleDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sqftDiff = subjectSqft ? comp.sqft - subjectSqft : 0;

  return (
    <Card
      className={cn(
        "p-4 transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
    >
      <div className="flex gap-3">
        {/* Checkbox */}
        <div className="flex items-start pt-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(comp.id, checked as boolean)}
          />
        </div>

        {/* Photo placeholder */}
        <div className="h-20 w-24 rounded-md bg-surface-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
          {comp.photos && comp.photos.length > 0 ? (
            <img
              src={comp.photos[0]}
              alt={comp.address}
              className="h-full w-full object-cover"
            />
          ) : (
            <Home className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{comp.address}</span>
                {isRecent && (
                  <span className="h-2 w-2 rounded-full bg-green-500" title="Recent sale" />
                )}
              </div>
              <div className="text-small text-muted-foreground">
                {comp.city}, {comp.state} {comp.zip}
              </div>
            </div>
            <div className="flex items-center gap-1 text-small text-muted-foreground">
              <Navigation className="h-3.5 w-3.5" />
              <span>{comp.distance.toFixed(1)} mi</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-2 text-small">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold text-primary">
                {formatCurrency(comp.salePrice)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Ruler className="h-3.5 w-3.5" />
              <span>${comp.pricePerSqft}/sqft</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{getRecencyLabel(comp.saleDate)}</span>
            </div>
          </div>

          {/* Property details */}
          <div className="flex items-center gap-3 mt-2 text-small text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {comp.beds} bd
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {comp.baths} ba
            </span>
            <span>
              {comp.sqft.toLocaleString()} sqft
              {sqftDiff !== 0 && (
                <span className={sqftDiff > 0 ? "text-green-600" : "text-red-600"}>
                  {" "}({sqftDiff > 0 ? "+" : ""}{sqftDiff})
                </span>
              )}
            </span>
            <span>Built {comp.yearBuilt}</span>
          </div>

          {/* Badges & actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm" className={getConditionColor(comp.condition)}>
                {comp.condition}
              </Badge>
              {comp.saleType !== "standard" && (
                <Badge variant="secondary" size="sm">
                  {getSaleTypeLabel(comp.saleType)}
                </Badge>
              )}
              {comp.pool && (
                <Badge variant="secondary" size="sm">Pool</Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onViewDetails(comp)}>
                <Eye className="h-3.5 w-3.5 mr-1" />
                Details
              </Button>
              <Button
                variant={isSelected ? "secondary" : "default"}
                size="sm"
                onClick={() => onSelect(comp.id, !isSelected)}
              >
                {isSelected ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Selected
                  </>
                ) : (
                  "Select"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
