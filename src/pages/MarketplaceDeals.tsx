import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MarketplaceFilters } from "@/components/marketplace-deals/marketplace-filters";
import { MarketplaceMap } from "@/components/marketplace-deals/marketplace-map";
import { MarketplaceListings } from "@/components/marketplace-deals/marketplace-listings";
import { LeadTypeBadges } from "@/components/marketplace-deals/lead-type-badges";
import { useMockDeals } from "@/hooks/useMockDeals";
import { useSavedDeals } from "@/hooks/useSavedDeals";
import { AdvancedFilters, defaultFilters } from "@/components/marketplace-deals/more-filters-dialog";
import { cn } from "@/lib/utils";

export type LayoutMode = "cards" | "split" | "map";
type CardViewMode = "flip" | "hold";

// Session storage key for global view mode
const GLOBAL_VIEW_MODE_KEY = "marketplace-global-card-view-mode";

function getStoredGlobalViewMode(): CardViewMode {
  if (typeof window === "undefined") return "flip";
  const stored = sessionStorage.getItem(GLOBAL_VIEW_MODE_KEY);
  if (stored === "flip" || stored === "hold") return stored;
  return "flip";
}

function setStoredGlobalViewMode(mode: CardViewMode) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(GLOBAL_VIEW_MODE_KEY, mode);
  }
}

export default function MarketplaceDeals() {
  const [searchParams] = useSearchParams();
  const zipsFromIntel = searchParams.get("zips");
  const addressFromSearch = searchParams.get("address");
  const leadTypeFromIntel = searchParams.get("leadType");

  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("map");
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Global card view mode state
  const [globalCardViewMode, setGlobalCardViewMode] = useState<CardViewMode>(() => getStoredGlobalViewMode());
  
  const handleGlobalCardViewModeChange = (mode: CardViewMode) => {
    setGlobalCardViewMode(mode);
    setStoredGlobalViewMode(mode);
  };
  
  // Saved/favorited deals state - shared across pages via localStorage
  const { savedDealIds, toggleSave, savedCount } = useSavedDeals();
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  
  // Filters state
  // All home types selected by default
  const allHomeTypes = ["houses", "townhomes", "multi-family", "condos", "lots-land", "apartments", "manufactured"];
  
  const [filters, setFilters] = useState(() => ({
    address: zipsFromIntel ? zipsFromIntel.split(",").join(", ") : (addressFromSearch || ""),
    listingStatus: "all",
    leadType: leadTypeFromIntel || "all",
    homeTypes: allHomeTypes,
    priceRange: "any",
    bedsMin: "",
    bathsMin: "",
    exactMatch: false,
  }));

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(defaultFilters);

  // Convert filters to format expected by useMockDeals
  const mockDealFilters = {
    address: filters.address,
    leadType: filters.leadType,
    homeTypes: filters.homeTypes,
    priceMin: filters.priceRange !== "any" ? filters.priceRange.split("-")[0] : "",
    priceMax: filters.priceRange !== "any" && !filters.priceRange.includes("+") 
      ? filters.priceRange.split("-")[1] 
      : "",
    bedsMin: filters.bedsMin,
    bathsMin: filters.bathsMin,
  };

  const { deals: allDeals, totalCount: allTotalCount, isLoading } = useMockDeals({
    filters: mockDealFilters,
    sortBy,
    page: currentPage,
    perPage: resultsPerPage,
  });

  // Filter to saved only if toggle is active
  const deals = useMemo(() => {
    if (!showSavedOnly) return allDeals;
    return allDeals.filter(deal => savedDealIds.includes(deal.id));
  }, [allDeals, showSavedOnly, savedDealIds]);

  const totalCount = showSavedOnly ? deals.length : allTotalCount;

  // Compute lead type counts from all filtered deals (before pagination)
  const leadTypeCounts = useMemo(() => {
    if (!filters.address || filters.address.trim().length < 2) return [];
    
    // Premium lead types in priority order - exclude generic tags
    const premiumOrder = [
      "Pre-Foreclosure", "Foreclosure", "Bank Owned", "Tax Lien",
      "Vacant", "Probate", "High Equity", "Divorce",
      "Distressed", "Fixer Upper", "Cash Buyer",
    ];
    
    const tagCounts: Record<string, number> = {};
    allDeals.forEach((deal) => {
      deal.tags.forEach((tag) => {
        if (premiumOrder.includes(tag)) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    });

    // Sort by premium priority order
    return premiumOrder
      .filter((label) => tagCounts[label])
      .map((label) => ({ label, count: tagCounts[label] }));
  }, [allDeals, filters.address]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDeals(deals.map((d) => d.id));
    } else {
      setSelectedDeals([]);
    }
  };

  const handleSelectDeal = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedDeals([...selectedDeals, id]);
    } else {
      setSelectedDeals(selectedDeals.filter((d) => d !== id));
    }
  };

  return (
    <AppLayout fullWidth>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Filters Bar - Full width with view toggles */}
        <MarketplaceFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={setAdvancedFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
          showSavedOnly={showSavedOnly}
          onShowSavedOnlyChange={setShowSavedOnly}
          savedCount={savedCount}
          totalCount={totalCount}
        />

        {/* Lead Type Badges - shown when location is searched */}
        <LeadTypeBadges counts={leadTypeCounts} />

        {/* Main Content - fills remaining height */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map Section */}
          {(layoutMode === "map" || layoutMode === "split") && (
            <div className={cn(
              "h-full",
              layoutMode === "map" ? "w-full" : "w-1/2 hidden lg:block"
            )}>
              <MarketplaceMap deals={deals} />
            </div>
          )}

          {/* Listings Section */}
          {(layoutMode === "cards" || layoutMode === "split") && (
            <div className={cn(
              "h-full overflow-y-auto",
              layoutMode === "cards" ? "w-full" : "w-full lg:w-1/2"
            )}>
              <MarketplaceListings
                deals={deals}
                totalCount={totalCount}
                isLoading={isLoading}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedDeals={selectedDeals}
                onSelectAll={handleSelectAll}
                onSelectDeal={handleSelectDeal}
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultsPerPage={resultsPerPage}
                onResultsPerPageChange={setResultsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                isSplitView={layoutMode === "split"}
                savedDealIds={savedDealIds}
                onToggleSave={toggleSave}
                globalCardViewMode={globalCardViewMode}
                onGlobalCardViewModeChange={handleGlobalCardViewModeChange}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
