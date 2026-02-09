import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bed,
  Bath,
  Ruler,
  Calendar,
  Car,
  LandPlot,
  DollarSign,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DealScoreCompact } from "@/components/marketplace-deals/DealScore";
import { DealRiskBar } from "@/components/marketplace-deals/DealRiskBar";
import { calculateEstimatedRent, formatRent } from "@/lib/rent-calculations";
import type { MarketplaceDeal } from "@/hooks/useMockDeals";

interface OverviewTabProps {
  deal: MarketplaceDeal;
  viewMode: "flip" | "hold";
  layoutMode: "detail" | "split";
}

export function OverviewTab({ deal, viewMode, layoutMode }: OverviewTabProps) {
  // Mock last sold data
  const lastSoldPrice = 200000;
  const lastSoldDate = "May 2025";
  const priceChange = deal.price - lastSoldPrice;
  
  // Mock additional data
  const yearBuilt = 2006;
  const lotSize = 0.06;
  const pricePerSqft = Math.round(deal.price / deal.sqft);
  
  // Calculate ROI for deal score
  const estRepairs = 20000;
  const holdingCosts = 8000;
  const closingCosts = Math.round(deal.arv * 0.06);
  const agentCommission = Math.round(deal.arv * 0.05);
  const totalCosts = deal.price + estRepairs + holdingCosts + closingCosts + agentCommission;
  const profit = deal.arv - totalCosts;
  const roi = Math.round((profit / (deal.price + estRepairs)) * 100);

  return (
    <div className="space-y-6">
      {/* Price, ARV, Deal Score & Address */}
      <div>
      {/* Row 1: Price, ARV, Est. Rent (Hold only), Deal Score */}
        <div className="flex items-center gap-4 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Price</span>
            <span className="text-3xl font-bold">${deal.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">ARV</span>
            <span className="text-3xl font-bold text-success">${deal.arv.toLocaleString()}</span>
          </div>
          {viewMode === "hold" && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Est. Rent</span>
              <span className="text-3xl font-bold text-primary">{formatRent(calculateEstimatedRent(deal.sqft).monthlyRent)}</span>
            </div>
          )}
          {/* Deal Score - Far Right */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Score</span>
            <DealScoreCompact score={Math.min(Math.round(roi * 3 + 20), 100)} />
          </div>
        </div>

        {/* Row 2: Last Sold info + Property Labels */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Last Sold ${lastSoldPrice.toLocaleString()} ({lastSoldDate})
            </span>
            <span className={cn(
              "flex items-center gap-0.5 text-sm font-semibold",
              priceChange >= 0 ? "text-success" : "text-destructive"
            )}>
              {priceChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {priceChange >= 0 ? "+" : ""}${Math.abs(priceChange).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === "flip" ? (
              <>
                <Badge variant="outline" className="border-success text-success bg-success/10 rounded-lg px-3 py-1 text-xs font-medium">
                  5 Buyers Match
                </Badge>
                <Badge variant="outline" className="border-success text-success bg-success/10 rounded-lg px-3 py-1 text-xs font-medium">
                  A Location
                </Badge>
                <Badge variant="outline" className="border-warning text-warning bg-warning/10 rounded-lg px-3 py-1 text-xs font-medium">
                  Hot Market
                </Badge>
              </>
            ) : (
              <>
                <Badge variant="outline" className="border-success text-success bg-success/10 rounded-lg px-3 py-1 text-xs font-medium">
                  3 Buyers Match
                </Badge>
                <Badge variant="outline" className="border-success text-success bg-success/10 rounded-lg px-3 py-1 text-xs font-medium">
                  A+ Location
                </Badge>
                <Badge variant="outline" className="border-success text-success bg-success/10 rounded-lg px-3 py-1 text-xs font-medium">
                  9.2% Cap
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Row 3: Address */}
        <p className="flex items-center gap-2 text-lg text-muted-foreground">
          <MapPin className="h-5 w-5" />
          {deal.address}, {deal.city}, {deal.state} {deal.zip}
        </p>
      </div>

      {/* Property Details Grid - 4 per row */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1: Beds, Baths, Half Bath, SqFt */}
        <Card className="p-4 flex items-center gap-3">
          <Bed className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">{deal.beds} Beds</span>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Bath className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">{deal.baths} Baths</span>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Bath className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">0 Half Bath</span>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Ruler className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">{deal.sqft.toLocaleString()} SqFt</span>
        </Card>
        {/* Row 2: Year Built, Parking, Lot Size, Price/SqFt */}
        <Card className="p-4 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Built {yearBuilt}</span>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Car className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">2 Car Garage</span>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <LandPlot className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">{lotSize} Acres</span>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">${pricePerSqft}/SqFt</span>
        </Card>
      </div>

      {/* Deal Risk Bar */}
      <Card className="p-4">
        <DealRiskBar arvPercent={deal.arvPercent} />
      </Card>

      {/* Lead Types */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">Lead Types</p>
        <div className="flex flex-wrap gap-2">
          {deal.tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="bg-muted-foreground text-background hover:bg-muted-foreground/90">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* About This Home */}
      <div>
        <h2 className="text-xl font-semibold mb-4">About This Home</h2>
        <p className="text-muted-foreground leading-relaxed">
          Welcome to this beautifully upgraded single-story home in the heart of {deal.city}! 
          This {deal.beds}-bedroom, {deal.baths}-bathroom gem features an open floor plan that's 
          perfect for entertaining. The spacious kitchen boasts an oversized island, stainless 
          steel appliances, and plenty of cabinet space—ideal for any home chef. Enjoy cozy evenings 
          by the fireplace in the inviting family room. You'll love the upgraded flooring throughout, 
          as well as the modern finishes in all bathrooms. The large backyard is a private oasis with 
          stylish pavers and room to relax or entertain. Plus, a 2-car garage adds convenience and extra storage.
        </p>
      </div>
    </div>
  );
}
