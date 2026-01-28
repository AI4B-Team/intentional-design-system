import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Home,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompResult, SubjectProperty } from "./types";

interface CompDetailModalProps {
  comp: CompResult | null;
  subject?: SubjectProperty | null;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onOpenChange: (open: boolean) => void;
}

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
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CompDetailModal({
  comp,
  subject,
  isSelected,
  onSelect,
  onOpenChange,
}: CompDetailModalProps) {
  const [photoIndex, setPhotoIndex] = React.useState(0);

  if (!comp) return null;

  const photos = comp.photos || [];
  const listPriceDiff = comp.listPrice
    ? ((comp.salePrice - comp.listPrice) / comp.listPrice) * 100
    : null;

  const comparisonRows = [
    {
      label: "Beds",
      subject: subject?.beds,
      comp: comp.beds,
      diff: subject ? comp.beds - subject.beds : null,
    },
    {
      label: "Baths",
      subject: subject?.baths,
      comp: comp.baths,
      diff: subject ? comp.baths - subject.baths : null,
    },
    {
      label: "SqFt",
      subject: subject?.sqft,
      comp: comp.sqft,
      diff: subject ? comp.sqft - subject.sqft : null,
    },
    {
      label: "Year Built",
      subject: subject?.yearBuilt,
      comp: comp.yearBuilt,
      diff: subject ? comp.yearBuilt - subject.yearBuilt : null,
    },
    {
      label: "Condition",
      subject: subject?.condition,
      comp: comp.condition,
      diff: null,
    },
  ];

  return (
    <Dialog open={!!comp} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {comp.address}, {comp.city}, {comp.state}
            </DialogTitle>
            <Button
              variant={isSelected ? "secondary" : "default"}
              size="sm"
              onClick={() => onSelect(comp.id, !isSelected)}
            >
              {isSelected ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Selected for ARV
                </>
              ) : (
                "Select for ARV"
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Photo carousel */}
        {photos.length > 0 ? (
          <div className="relative h-48 bg-surface-secondary rounded-lg overflow-hidden">
            <img
              src={photos[photoIndex]}
              alt={`${comp.address} - ${photoIndex + 1}`}
              className="h-full w-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {photos.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 w-2 rounded-full transition-colors",
                        i === photoIndex ? "bg-white" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-32 bg-surface-secondary rounded-lg flex items-center justify-center">
            <Home className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Details grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              Property Details
            </h4>
            <div className="space-y-2 text-small">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>Single Family</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Beds / Baths</span>
                <span>{comp.beds} / {comp.baths}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SqFt</span>
                <span>{comp.sqft.toLocaleString()}</span>
              </div>
              {comp.lotSqft && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lot</span>
                  <span>{comp.lotSqft.toLocaleString()} sqft</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year Built</span>
                <span>{comp.yearBuilt}</span>
              </div>
              {comp.garage !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Garage</span>
                  <span>{comp.garage} car</span>
                </div>
              )}
              {comp.pool && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pool</span>
                  <span>Yes</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Sale Info
            </h4>
            <div className="space-y-2 text-small">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sale Price</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(comp.salePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sale Date</span>
                <span>{formatDate(comp.saleDate)}</span>
              </div>
              {comp.listPrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">List Price</span>
                  <span>
                    {formatCurrency(comp.listPrice)}
                    {listPriceDiff !== null && (
                      <span className={listPriceDiff < 0 ? "text-red-600" : "text-green-600"}>
                        {" "}({listPriceDiff > 0 ? "+" : ""}{listPriceDiff.toFixed(1)}%)
                      </span>
                    )}
                  </span>
                </div>
              )}
              {comp.daysOnMarket !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days on Market</span>
                  <span>{comp.daysOnMarket}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">$/SqFt</span>
                <span>${comp.pricePerSqft}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance</span>
                <span>{comp.distance.toFixed(2)} miles</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Comparison table */}
        {subject && (
          <Card className="p-4">
            <h4 className="font-medium mb-3">Comparison to Subject</h4>
            <table className="w-full text-small">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Subject</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Comp</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Diff</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="py-2">{row.label}</td>
                    <td className="py-2 text-center">{row.subject ?? "—"}</td>
                    <td className="py-2 text-center">{row.comp}</td>
                    <td
                      className={cn(
                        "py-2 text-right",
                        row.diff && row.diff > 0 && "text-green-600",
                        row.diff && row.diff < 0 && "text-red-600"
                      )}
                    >
                      {row.diff !== null
                        ? row.diff === 0
                          ? "—"
                          : `${row.diff > 0 ? "+" : ""}${row.diff}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn(
              comp.condition === "Excellent" && "bg-green-100 text-green-700",
              comp.condition === "Good" && "bg-blue-100 text-blue-700",
              comp.condition === "Fair" && "bg-amber-100 text-amber-700",
              comp.condition === "Poor" && "bg-red-100 text-red-700"
            )}
          >
            {comp.condition} Condition
          </Badge>
          <Badge variant="secondary">
            {comp.saleType === "standard" ? "Standard Sale" : comp.saleType.toUpperCase()}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}
