import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Users, MapPin, DollarSign, CheckCircle, Phone, Mail, Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface BuyerData {
  id: string;
  name: string;
  company?: string;
  buyerType: "flipper" | "landlord";
  preferredAreas?: string[];
  maxPrice?: number;
  isVerified?: boolean;
  dealsCompleted?: number;
  phone?: string;
  email?: string;
}

interface BuyersSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  buyers: BuyerData[];
  onBuyerClick?: (buyer: BuyerData) => void;
}

export function BuyersSlidePanel({ isOpen, onClose, buyers, onBuyerClick }: BuyersSlidePanelProps) {
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
          <Users className="h-5 w-5 text-success" />
          <h3 className="font-semibold text-success">{buyers.length} Buyers Near Property</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Buyers List */}
      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="p-3 space-y-3">
          {buyers.map((buyer) => (
            <div
              key={buyer.id}
              onClick={() => onBuyerClick?.(buyer)}
              className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{buyer.name}</p>
                    {buyer.isVerified && (
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                    )}
                  </div>
                  {buyer.company && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Building className="h-3 w-3" />
                      {buyer.company}
                    </div>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] shrink-0",
                    buyer.buyerType === "flipper"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-warning/10 text-warning border-warning/30"
                  )}
                >
                  {buyer.buyerType === "flipper" ? "Flipper" : "Landlord"}
                </Badge>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 mb-2 text-xs">
                {buyer.maxPrice && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>Up to ${(buyer.maxPrice / 1000).toFixed(0)}K</span>
                  </div>
                )}
                {buyer.dealsCompleted !== undefined && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="font-medium text-foreground">{buyer.dealsCompleted}</span>
                    <span>deals closed</span>
                  </div>
                )}
              </div>

              {/* Preferred Areas */}
              {buyer.preferredAreas && buyer.preferredAreas.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{buyer.preferredAreas.slice(0, 2).join(", ")}</span>
                </div>
              )}

              {/* Contact Actions */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1 gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle call
                  }}
                >
                  <Phone className="h-3 w-3" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1 gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle email
                  }}
                >
                  <Mail className="h-3 w-3" />
                  Email
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
