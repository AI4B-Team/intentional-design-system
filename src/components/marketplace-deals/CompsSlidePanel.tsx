import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Scale, MapPin, Bed, Bath, Ruler, Calendar, DollarSign, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompData {
  id: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  salePrice: number;
  pricePerSqft: number;
  distanceMiles: number;
  similarity: number;
  saleDate: string;
  quality: "excellent" | "good";
  saleType: string;
}

interface CompsSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  comps: CompData[];
  onCompClick?: (comp: CompData) => void;
}

export function CompsSlidePanel({ isOpen, onClose, comps, onCompClick }: CompsSlidePanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute top-0 right-0 h-full w-80 bg-background border-l shadow-xl z-[1100] transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-success/10">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-success" />
          <h3 className="font-semibold text-success">{comps.length} Comps Found</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Comps List */}
      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="p-3 space-y-3">
          {comps.map((comp) => (
            <div
              key={comp.id}
              onClick={() => onCompClick?.(comp)}
              className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{comp.address}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {comp.distanceMiles} mi away
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] shrink-0",
                    comp.quality === "excellent"
                      ? "bg-success/10 text-success border-success/30"
                      : "bg-warning/10 text-warning border-warning/30"
                  )}
                >
                  {comp.similarity}% Match
                </Badge>
              </div>

              {/* Price & Stats */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">${comp.salePrice.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">${comp.pricePerSqft}/sqft</span>
              </div>

              {/* Property Details */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  {comp.beds}
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  {comp.baths}
                </div>
                <div className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  {comp.sqft.toLocaleString()}
                </div>
              </div>

              {/* Sale Info */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(comp.saleDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {comp.saleType}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
