import React from "react";
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
  ExternalLink,
  Heart,
  Home,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
}

function DealRiskMeter({ arvPercent }: { arvPercent: number }) {
  // Calculate position on the meter (50% to 100% scale)
  const position = ((arvPercent - 50) / 50) * 100;
  
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">Deal Risk</span>
        <span className="font-semibold text-primary">{arvPercent}% ARV</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-success" />
          <div className="flex-1 bg-warning" />
          <div className="flex-1 bg-destructive" />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-foreground rounded-full shadow"
          style={{ left: `${Math.min(Math.max(position, 0), 100)}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>50%</span>
        <span>70%</span>
        <span>85%</span>
        <span>100%</span>
      </div>
    </div>
  );
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
  const tagColors: Record<string, string> = {
    "Single Family": "bg-primary text-primary-foreground",
    "Condo": "bg-info text-white",
    "Townhouse": "bg-purple-500 text-white",
    "Duplex": "bg-indigo-500 text-white",
    "Mobile Home": "bg-orange-500 text-white",
    "High Equity": "bg-slate-700 text-white",
    "Cash Buyer": "bg-slate-700 text-white",
    "Motivated Seller": "bg-slate-700 text-white",
    "Divorce": "bg-warning text-white",
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative aspect-[16/10]">
        <img
          src={deal.imageUrl}
          alt={deal.address}
          className="w-full h-full object-cover"
        />
        
        {/* Top Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="bg-white/80 border-white"
            />
            {deal.isNew && (
              <Badge className="bg-primary text-primary-foreground">New</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white/80 hover:bg-white"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 bg-white/80 hover:bg-white",
                deal.isFavorite && "text-destructive"
              )}
            >
              <Heart className={cn("h-4 w-4", deal.isFavorite && "fill-current")} />
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          {deal.tags.slice(0, 3).map((tag, i) => (
            <Badge
              key={i}
              className={cn(
                "text-xs font-medium",
                tagColors[tag] || "bg-slate-700 text-white"
              )}
            >
              {i === 0 && <Home className="h-3 w-3 mr-1" />}
              {tag}
            </Badge>
          ))}
          {deal.tags.length > 3 && (
            <Badge className="bg-slate-700 text-white text-xs">
              +{deal.tags.length - 3}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-muted-foreground">{deal.county}</p>
        <p className="font-semibold text-primary">
          {deal.address}, {deal.city}, {deal.state} {deal.zip}
        </p>

        <DealRiskMeter arvPercent={deal.arvPercent} />
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-white">
        <h2 className="text-xl font-bold text-foreground mb-4">Find Your Next Deal</h2>
        
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
            />
            <span className="text-sm font-medium">{totalCount} Results Found</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Results Per Page:</span>
              <Select
                value={resultsPerPage.toString()}
                onValueChange={(v) => onResultsPerPageChange(parseInt(v))}
              >
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">| {startIndex}-{endIndex} of {totalCount}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort:</span>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="price_low">Price: Low</SelectItem>
                  <SelectItem value="price_high">Price: High</SelectItem>
                  <SelectItem value="arv">Best ARV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-none",
                  viewMode === "list" && "bg-muted"
                )}
                onClick={() => onViewModeChange("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-none",
                  viewMode === "grid" && "bg-muted"
                )}
                onClick={() => onViewModeChange("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
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
              className="w-12 h-8 text-center border rounded text-sm"
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
