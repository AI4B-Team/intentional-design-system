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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ExternalLink,
  Heart,
  Home,
  List,
  LayoutGrid,
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
} from "lucide-react";
import { MarketplaceDeal } from "@/hooks/useMockDeals";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
}

function DealRiskMeter({ arvPercent }: { arvPercent: number }) {
  // Calculate position on the meter (50% to 100% scale)
  const position = ((arvPercent - 50) / 50) * 100;
  
  // Determine color based on ARV percentage
  const getBadgeColor = () => {
    if (arvPercent <= 70) {
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    } else if (arvPercent <= 85) {
      return "bg-amber-100 text-amber-700 border-amber-300";
    } else {
      return "bg-red-100 text-red-700 border-red-300";
    }
  };
  
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
      <div className="relative h-2.5 rounded-full overflow-hidden bg-muted">
        <div className="absolute inset-0 flex">
          <div className="w-[40%] bg-emerald-500" />
          <div className="w-[30%] bg-amber-400" />
          <div className="w-[30%] bg-red-500" />
        </div>
        <div
          className="absolute top-1/2 w-4 h-4 bg-white border-2 border-slate-700 rounded-full shadow-md"
          style={{ 
            left: `${Math.min(Math.max(position, 2), 98)}%`, 
            transform: "translate(-50%, -50%)" 
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
        <span>50%</span>
        <span>70%</span>
        <span>85%</span>
        <span>100%</span>
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

function DealCard({
  deal,
  isSelected,
  onSelect,
  viewMode,
}: {
  deal: MarketplaceDeal;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  viewMode: "list" | "grid";
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
  
  // Year built (mock - random between 1970-2020)
  const yearBuilt = 1970 + Math.floor(Math.random() * 50);
  
  // Calculate days since listing
  const getDaysListed = () => {
    const createdDate = new Date(deal.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysListed = getDaysListed();
  
  // Get badge text and style based on days listed
  const getListingBadge = () => {
    if (daysListed < 1) {
      return { text: "New", className: "bg-amber-400 text-slate-900" };
    } else if (daysListed <= 5) {
      return { text: `New ${daysListed} Day${daysListed > 1 ? 's' : ''} Ago`, className: "bg-amber-400 text-slate-900" };
    } else {
      return { text: "For Sale", className: "bg-primary text-primary-foreground" };
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
        
        {/* Top Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded shadow-sm h-6 w-6 flex items-center justify-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="h-3.5 w-3.5"
              />
            </div>
            <Badge className={cn("text-xs font-medium px-2 py-0.5 rounded", listingBadge.className)}>
              {listingBadge.text}
            </Badge>
          </div>
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-slate-800/60 hover:bg-slate-800/80 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = `${window.location.origin}/marketplace/deal/${deal.id}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Link copied to clipboard!");
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Copy link</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 bg-slate-800/60 hover:bg-slate-800/80 rounded-full",
                      deal.isFavorite && "text-destructive"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success(deal.isFavorite ? "Removed from favorites" : "Added to favorites");
                    }}
                  >
                    <Heart className={cn("h-3.5 w-3.5", deal.isFavorite ? "fill-current text-destructive" : "text-white")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{deal.isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Tags at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          {deal.tags.slice(0, 3).map((tag, i) => (
            <Badge
              key={i}
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-md",
                i === 0 ? "bg-primary text-primary-foreground" : "bg-slate-700/90 text-white"
              )}
            >
              {i === 0 && <Home className="h-3 w-3 mr-1" />}
              {tag}
            </Badge>
          ))}
          {deal.tags.length > 3 && (
            <Badge className="bg-slate-700/90 text-white text-xs px-2.5 py-1 rounded-md">
              +{deal.tags.length - 3}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <p className="text-sm text-muted-foreground">{deal.county}</p>
        <p className="font-semibold text-primary text-base">
          {deal.address}, {deal.city}, {deal.state} {deal.zip}
        </p>

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
              <CircleDollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">Profit Potential:</span>
            </div>
            <span className={cn(
              "font-bold",
              profitPotential >= 0 ? "text-primary" : "text-destructive"
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
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex flex-col items-center text-center flex-1">
            <Bed className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-sm font-medium whitespace-nowrap">{deal.beds} Beds</span>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex flex-col items-center text-center flex-1">
            <Bath className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-sm font-medium whitespace-nowrap">{deal.baths} Baths</span>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex flex-col items-center text-center flex-1">
            <Tag className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-sm font-medium whitespace-nowrap">{deal.sqft.toLocaleString()} SqFt</span>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex flex-col items-center text-center flex-1">
            <Calendar className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-sm font-medium whitespace-nowrap">Built {yearBuilt}</span>
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
}: MarketplaceListingsProps) {
  const totalPages = Math.ceil(totalCount / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage + 1;
  const endIndex = Math.min(currentPage * resultsPerPage, totalCount);
  const allSelected = deals.length > 0 && selectedDeals.length === deals.length;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="p-4 border-b border-border bg-white">
        {/* Row 1: Title and View Toggle */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-foreground">Find Your Next Deal</h2>
          
          {/* View Mode Toggle */}
          <div className="flex border border-border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-none border-0",
                viewMode === "list" ? "bg-muted" : "bg-background"
              )}
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-none border-0",
                viewMode === "grid" ? "bg-primary text-white" : "bg-background"
              )}
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
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
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">Results Per Page:</span>
              <Select
                value={resultsPerPage.toString()}
                onValueChange={(v) => onResultsPerPageChange(parseInt(v))}
              >
                <SelectTrigger className="w-[60px] h-8 bg-background">
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
            <p className="font-medium">No deals found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}>
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                isSelected={selectedDeals.includes(deal.id)}
                onSelect={(checked) => onSelectDeal(deal.id, checked)}
                viewMode={viewMode}
              />
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
