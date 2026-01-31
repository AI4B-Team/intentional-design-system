import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ExternalLink,
  Home,
  List,
  LayoutGrid,
  Map,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  DollarSign,
  Wrench,
  CircleDollarSign,
  Bed,
  Bath,
  Tag,
  Calendar,
  Circle,
  Heart,
  Share2,
} from "lucide-react";
import { MarketplaceDeal } from "@/hooks/useMockDeals";
import { cn } from "@/lib/utils";

interface MarketplaceListingsProps {
  deals: MarketplaceDeal[];
  totalCount: number;
  isLoading: boolean;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  selectedDeals: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectDeal: (id: string, checked: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  resultsPerPage: number;
  onResultsPerPageChange: (count: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  isSplitView?: boolean;
  savedDealIds?: string[];
  onToggleSave?: (dealId: string) => void;
}

function DealRiskMeter({ arvPercent }: { arvPercent: number }) {
  // The meter shows 50% to 100% ARV range
  // Clamp arvPercent to the visible range
  const clampedPercent = Math.min(Math.max(arvPercent, 50), 100);
  
  // Calculate position on the meter (50% to 100% scale maps to 0% to 100% of bar width)
  const position = ((clampedPercent - 50) / 50) * 100;
  
  // Determine color based on ARV percentage
  // Lower ARV% = better deal (green), Higher ARV% = riskier (red)
  const getBadgeColor = () => {
    if (arvPercent <= 70) {
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    } else if (arvPercent <= 85) {
      return "bg-amber-100 text-amber-700 border-amber-300";
    } else {
      return "bg-red-100 text-red-700 border-red-300";
    }
  };
  
  // Segment widths based on the percentage ranges:
  // 50%-70% = 20 points out of 50 total = 40%
  // 70%-85% = 15 points out of 50 total = 30%
  // 85%-100% = 15 points out of 50 total = 30%
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">Deal Risk</span>
        <Badge 
          variant="outline" 
          className={cn("text-xs font-semibold px-2 py-0", getBadgeColor())}
        >
          {arvPercent}% ARV
        </Badge>
      </div>
      <div className="relative h-4 flex items-center">
        <div className="absolute inset-x-0 h-2.5 rounded-full overflow-hidden bg-muted">
          <div className="absolute inset-0 flex">
            {/* Green: 50%-70% = 40% of bar width */}
            <div className="w-[40%] bg-emerald-500" />
            {/* Yellow: 70%-85% = 30% of bar width */}
            <div className="w-[30%] bg-amber-400" />
            {/* Red: 85%-100% = 30% of bar width */}
            <div className="w-[30%] bg-red-500" />
          </div>
        </div>
        <div
          className="absolute w-4 h-4 bg-white border-2 border-slate-700 rounded-full shadow-md z-10"
          style={{ 
            left: `${Math.min(Math.max(position, 0), 100)}%`, 
            transform: "translateX(-50%)" 
          }}
        />
      </div>
      {/* Labels positioned to align with segment boundaries */}
      <div className="relative flex text-xs text-muted-foreground mt-1.5 h-4">
        <span className="absolute left-0">50%</span>
        <span className="absolute left-[40%] -translate-x-1/2">70%</span>
        <span className="absolute left-[70%] -translate-x-1/2">85%</span>
        <span className="absolute right-0">100%</span>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function DealListItem({
  deal,
  isSelected,
  onSelect,
  isSaved = false,
  onToggleSave,
}: {
  deal: MarketplaceDeal;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  isSaved?: boolean;
  onToggleSave?: (dealId: string) => void;
}) {
  const navigate = useNavigate();
  
  // Calculate financial details
  const askingPrice = deal.price;
  const arvValue = deal.arv;
  const estRepairs = Math.round(arvValue * 0.1);
  const profitPotential = arvValue - askingPrice - estRepairs;
  
  // Estimated rent and PITI (mock calculations)
  const monthlyRent = Math.round((arvValue * 0.008)); // ~0.8% of ARV
  const piti = Math.round(askingPrice * 0.007); // ~0.7% of asking price
  const monthlyCashflow = monthlyRent - piti;
  
  // Year built (mock - random between 1970-2020)
  const yearBuilt = 1970 + Math.floor(Math.random() * 50);
  
  // Get hours and days since listing
  const getTimeSinceListing = () => {
    const createdDate = new Date(deal.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return { hours: diffHours, days: diffDays };
  };
  
  const { hours: hoursListed, days: daysListed } = getTimeSinceListing();
  
  const getListingBadge = () => {
    if (hoursListed < 24) {
      return { text: "New", className: "bg-amber-400 text-slate-900" };
    } else if (daysListed <= 5) {
      return { text: `${daysListed} day${daysListed > 1 ? 's' : ''} ago`, className: "bg-amber-400 text-slate-900" };
    } else {
      return { text: "For Sale", className: "bg-emerald-500 text-white" };
    }
  };
  
  const listingBadge = getListingBadge();

  const handleClick = () => {
    navigate(`/marketplace/deal/${deal.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={handleClick}
    >
      <div className="flex">
        {/* Thumbnail - larger for more details */}
        <div className="relative w-48 h-auto min-h-[160px] flex-shrink-0">
          <img
            src={deal.imageUrl}
            alt={deal.address}
            className="w-full h-full object-cover"
          />
          {/* Selection button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(!isSelected);
            }}
            className={cn(
              "absolute top-2 left-2 flex items-center justify-center h-5 w-5 rounded-full border-2 transition-all",
              isSelected 
                ? "bg-primary border-primary" 
                : "border-white/70 hover:border-white"
            )}
            style={{ backgroundColor: isSelected ? undefined : 'transparent' }}
          >
            {isSelected && (
              <Circle className="h-2 w-2 fill-white text-white" />
            )}
          </button>
          {/* Badge on image */}
          <Badge className={cn("absolute top-2 right-2 text-xs font-medium px-1.5 py-0 rounded", listingBadge.className)}>
            {listingBadge.text}
          </Badge>
          {/* Tags at bottom */}
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
            {deal.tags.slice(0, 2).map((tag, i) => (
              <Badge
                key={i}
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded",
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-slate-700/90 text-white"
                )}
              >
                {tag}
              </Badge>
            ))}
            {deal.tags.length > 2 && (
              <Popover>
                <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Badge className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700/90 text-white cursor-pointer hover:bg-slate-600/90">
                    +{deal.tags.length - 2}
                  </Badge>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-2 z-[100]" 
                  side="bottom" 
                  align="center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {deal.tags.slice(2).map((tag, i) => (
                      <Badge
                        key={i}
                        className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col min-w-0">
          {/* Top row: Price + Actions */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <span className="text-xl font-bold text-success">
                {formatCurrency(askingPrice)}
              </span>
              <p className="text-sm font-medium text-foreground truncate">{deal.address}</p>
              <p className="text-xs text-muted-foreground truncate">
                {deal.city}, {deal.state} {deal.zip}
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave?.(deal.id);
                }}
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-full transition-all",
                  isSaved 
                    ? "bg-red-100 text-red-500" 
                    : "hover:bg-slate-100 text-muted-foreground"
                )}
              >
                <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="flex items-center justify-center h-7 w-7 rounded-full hover:bg-slate-100 text-muted-foreground"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Property Specs Row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground py-2 border-b border-border">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {deal.beds} Beds
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {deal.baths} Baths
            </span>
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {deal.sqft.toLocaleString()} sqft
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {yearBuilt}
            </span>
          </div>

          {/* Financial metrics */}
          <div className="grid grid-cols-4 gap-2 py-2 text-xs">
            <div>
              <span className="text-muted-foreground block">ARV</span>
              <span className="font-semibold">{formatCurrency(arvValue)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Est. Repairs</span>
              <span className="font-semibold">{formatCurrency(estRepairs)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Rent</span>
              <span className="font-semibold">{formatCurrency(monthlyRent)}/mo</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Cashflow</span>
              <span className={cn("font-semibold", monthlyCashflow >= 0 ? "text-success" : "text-destructive")}>
                {monthlyCashflow >= 0 ? "+" : ""}{formatCurrency(monthlyCashflow)}/mo
              </span>
            </div>
          </div>

          {/* ARV Progress Bar */}
          <DealRiskMeter arvPercent={deal.arvPercent} />

          {/* Bottom row: Profit */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <div className={cn(
              "text-sm font-bold",
              profitPotential >= 0 ? "text-success" : "text-destructive"
            )}>
              {profitPotential >= 0 ? "+" : ""}{formatCurrency(profitPotential)} profit
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function DealCard({
  deal,
  isSelected,
  onSelect,
  isSaved = false,
  onToggleSave,
}: {
  deal: MarketplaceDeal;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  isSaved?: boolean;
  onToggleSave?: (dealId: string) => void;
}) {
  const navigate = useNavigate();
  
  // Calculate financial details
  const askingPrice = deal.price;
  const arvValue = deal.arv;
  const estRepairs = Math.round(arvValue * 0.1); // Estimate 10% of ARV for repairs
  const profitPotential = arvValue - askingPrice - estRepairs;
  
  // Estimated rent and PITI (mock calculations)
  const monthlyRent = Math.round((arvValue * 0.008)); // ~0.8% of ARV
  const piti = Math.round(askingPrice * 0.007); // ~0.7% of asking price
  
  // Calculate cashflow and cap rate
  const annualRent = monthlyRent * 12;
  const annualExpenses = piti * 12; // Using PITI as proxy for annual expenses
  const monthlyCashflow = monthlyRent - piti;
  const annualNOI = annualRent - (annualExpenses * 0.4); // Assume 40% expense ratio
  const capRate = askingPrice > 0 ? (annualNOI / askingPrice) * 100 : 0;
  
  // Year built (mock - random between 1970-2020)
  const yearBuilt = 1970 + Math.floor(Math.random() * 50);
  
  // Get hours and days since listing
  const getTimeSinceListing = () => {
    const createdDate = new Date(deal.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return { hours: diffHours, days: diffDays };
  };
  
  const { hours: hoursListed, days: daysListed } = getTimeSinceListing();
  
  // Get badge text and style based on time listed
  const getListingBadge = () => {
    if (hoursListed < 24) {
      return { text: "New", className: "bg-amber-400 text-slate-900" };
    } else if (daysListed <= 5) {
      return { text: `${daysListed} day${daysListed > 1 ? 's' : ''} ago`, className: "bg-amber-400 text-slate-900" };
    } else {
      return { text: "For Sale", className: "bg-emerald-500 text-white" };
    }
  };
  
  const listingBadge = getListingBadge();

  const tagColors: Record<string, string> = {
    "Single Family": "bg-primary text-primary-foreground",
    "Condo": "bg-primary text-primary-foreground",
    "Townhouse": "bg-primary text-primary-foreground",
    "Duplex": "bg-primary text-primary-foreground",
    "Mobile Home": "bg-primary text-primary-foreground",
    "High Equity": "bg-slate-700 text-white",
    "Cash Buyer": "bg-slate-700 text-white",
    "Motivated Seller": "bg-slate-700 text-white",
    "Divorce": "bg-amber-500 text-white",
    "Probate": "bg-slate-700 text-white",
    "Pre-Foreclosure": "bg-destructive text-white",
    "Vacant": "bg-slate-700 text-white",
    "Tax Lien": "bg-slate-700 text-white",
    "Fixer Upper": "bg-slate-700 text-white",
    "Estate Sale": "bg-slate-700 text-white",
    "Bank Owned": "bg-slate-700 text-white",
    "Quick Close": "bg-slate-700 text-white",
    "Inherited": "bg-slate-700 text-white",
    "Short Sale": "bg-slate-700 text-white",
    "Rental Income": "bg-slate-700 text-white",
    "Cash Flow": "bg-slate-700 text-white",
  };

  const handleCardClick = () => {
    navigate(`/marketplace/deal/${deal.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white" onClick={handleCardClick}>
      {/* Image */}
      <div className="relative aspect-[16/10]">
        <img
          src={deal.imageUrl}
          alt={deal.address}
          className="w-full h-full object-cover"
        />
        
        {/* Top Left: Radio button + Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(!isSelected);
            }}
            className={cn(
              "flex items-center justify-center h-6 w-6 rounded-full border-2 transition-all",
              isSelected 
                ? "bg-primary border-primary" 
                : "border-white/70 hover:border-white hover:scale-105"
            )}
            style={{ backgroundColor: isSelected ? undefined : 'transparent' }}
          >
            {isSelected && (
              <Circle className="h-2.5 w-2.5 fill-white text-white" />
            )}
          </button>
          <Badge className={cn("text-xs font-medium px-2 py-0.5 rounded", listingBadge.className)}>
            {listingBadge.text}
          </Badge>
        </div>

        {/* Top Right: Share + Heart buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Share functionality
            }}
            className="flex items-center justify-center h-7 w-7 rounded-full text-white/90 hover:text-white hover:scale-105 transition-all"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.(deal.id);
            }}
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-full transition-all hover:scale-105",
              isSaved 
                ? "bg-red-500 text-white" 
                : "text-white/90 hover:text-white"
            )}
            style={{ backgroundColor: isSaved ? undefined : 'rgba(0,0,0,0.3)' }}
          >
            <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
          </button>
        </div>

        {/* Tags at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          {deal.tags.slice(0, 2).map((tag, i) => (
            <Badge
              key={i}
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-md",
                i === 0 ? "bg-primary text-primary-foreground" : "bg-slate-700/90 text-white"
              )}
            >
              {tag}
            </Badge>
          ))}
          {deal.tags.length > 2 && (
            <Popover>
              <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Badge className="bg-slate-700/90 text-white text-xs px-2.5 py-1 rounded-md cursor-pointer hover:bg-slate-600/90">
                  +{deal.tags.length - 2}
                </Badge>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-2 z-[100]" 
                side="bottom" 
                align="center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                  {deal.tags.slice(2).map((tag, i) => (
                    <Badge
                      key={i}
                      className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <p className="text-sm text-muted-foreground">{deal.county}</p>
        <p className="font-semibold text-primary text-base">{deal.address}</p>
        <p className="text-sm text-muted-foreground">{deal.city}, {deal.state} {deal.zip}</p>

        {/* Deal Risk Meter */}
        <DealRiskMeter arvPercent={deal.arvPercent} />

        {/* Financial Breakdown */}
        <div className="mt-4 space-y-2.5 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span><span className="font-medium text-foreground">ARV</span> (After Repair Value)</span>
            </div>
            <span className="font-semibold text-foreground">{formatCurrency(arvValue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium text-foreground">Asking Price:</span>
            </div>
            <span className="font-medium text-foreground">- {formatCurrency(askingPrice)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wrench className="h-4 w-4" />
              <span className="font-medium text-foreground">Est. Repairs:</span>
            </div>
            <span className="font-medium text-foreground">- {formatCurrency(estRepairs)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2.5">
            <div className="flex items-center gap-2 text-sm">
              <CircleDollarSign className={cn("h-4 w-4", profitPotential >= 0 ? "text-success" : "text-destructive")} />
              <span className={cn("font-semibold", profitPotential >= 0 ? "text-success" : "text-destructive")}>Profit Potential:</span>
            </div>
            <span className={cn(
              "font-bold",
              profitPotential >= 0 ? "text-success" : "text-destructive"
            )}>
              {profitPotential >= 0 ? "+" : ""}{formatCurrency(profitPotential)}
            </span>
          </div>
        </div>

        {/* Rent & PITI Row */}
        <div className="mt-4 flex items-center border-t border-border pt-4">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rent</span>
            <span className="font-semibold text-foreground">{formatCurrency(monthlyRent)}/mo</span>
          </div>
          <div className="w-px h-6 bg-border mx-4" />
          <div className="flex-1 flex items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground">PITI</span>
            <span className="font-semibold text-foreground">{formatCurrency(piti)}/mo</span>
          </div>
        </div>


        {/* Property Specs */}
        <div className="mt-4 flex items-center justify-around border-t border-border pt-4 px-2">
          <div className="flex flex-col items-center text-center min-w-[60px]">
            <Bed className="h-5 w-5 text-muted-foreground mb-1.5" />
            <span className="text-sm font-medium">{deal.beds} Beds</span>
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex flex-col items-center text-center min-w-[60px]">
            <Bath className="h-5 w-5 text-muted-foreground mb-1.5" />
            <span className="text-sm font-medium">{deal.baths} Baths</span>
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex flex-col items-center text-center min-w-[70px]">
            <Tag className="h-5 w-5 text-muted-foreground mb-1.5" />
            <span className="text-sm font-medium">{deal.sqft.toLocaleString()} SqFt</span>
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex flex-col items-center text-center min-w-[70px]">
            <Calendar className="h-5 w-5 text-muted-foreground mb-1.5" />
            <span className="text-sm font-medium">Built {yearBuilt}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function MarketplaceListings({
  deals,
  totalCount,
  isLoading,
  viewMode,
  onViewModeChange,
  selectedDeals,
  onSelectAll,
  onSelectDeal,
  sortBy,
  onSortChange,
  resultsPerPage,
  onResultsPerPageChange,
  currentPage,
  onPageChange,
  isSplitView = false,
  savedDealIds = [],
  onToggleSave,
}: MarketplaceListingsProps) {
  const totalPages = Math.ceil(totalCount / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage + 1;
  const endIndex = Math.min(currentPage * resultsPerPage, totalCount);
  const allSelected = deals.length > 0 && selectedDeals.length === deals.length;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="p-4 border-b border-border bg-white">
        {/* Row 1: Title */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-foreground">Find Your Next Deal</h2>
        </div>
        
        {/* Row 2: Toolbar */}
        <div className="flex items-center justify-between">
          {/* Left side: Select checkbox + Results count */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 px-2 gap-1 border-border bg-background">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => {
                      onSelectAll(!!checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1 bg-background z-[100]" align="start">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-sm"
                  onClick={() => onSelectAll(true)}
                >
                  Select Page ({deals.length})
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-sm"
                  onClick={() => onSelectAll(true)}
                >
                  Select All ({totalCount})
                </button>
              </PopoverContent>
            </Popover>
            <span className="text-sm font-medium">{totalCount} Results Found</span>
          </div>

          {/* Right side: Per page, pagination info, sort */}
          <div className="flex items-center gap-3">
            {/* Results per page */}
            <div className="flex items-center gap-1.5 text-sm flex-shrink-0">
              <span className="text-muted-foreground whitespace-nowrap">Results Per Page:</span>
              <Select
                value={resultsPerPage.toString()}
                onValueChange={(v) => onResultsPerPageChange(parseInt(v))}
              >
                <SelectTrigger className="w-auto min-w-[65px] h-8 bg-background px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-[100]" align="end">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pagination info */}
            <span className="text-sm text-muted-foreground">| {startIndex}-{endIndex} of {totalCount}</span>

            {/* Sort */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">Sort:</span>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-[110px] h-8 bg-background text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-[100]" align="end">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="most_viewed">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[16/10]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Home className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">No Deals Found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            viewMode === "grid" 
              ? isSplitView 
                ? "grid-cols-1 md:grid-cols-2" 
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          )}>
            {deals.map((deal) => (
              viewMode === "list" ? (
                <DealListItem
                  key={deal.id}
                  deal={deal}
                  isSelected={selectedDeals.includes(deal.id)}
                  onSelect={(checked) => onSelectDeal(deal.id, checked)}
                  isSaved={savedDealIds.includes(deal.id)}
                  onToggleSave={onToggleSave}
                />
              ) : (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  isSelected={selectedDeals.includes(deal.id)}
                  onSelect={(checked) => onSelectDeal(deal.id, checked)}
                  isSaved={savedDealIds.includes(deal.id)}
                  onToggleSave={onToggleSave}
                />
              )
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border bg-white flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2 mx-2">
            <span className="text-sm text-muted-foreground">Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  onPageChange(page);
                }
              }}
              className="w-12 h-8 text-center border rounded text-sm bg-background"
            />
            <span className="text-sm text-muted-foreground">of {totalPages}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
