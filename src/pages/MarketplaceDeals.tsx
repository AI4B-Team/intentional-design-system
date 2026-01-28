import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MarketplaceFilters } from "@/components/marketplace-deals/marketplace-filters";
import { MarketplaceMap } from "@/components/marketplace-deals/marketplace-map";
import { MarketplaceListings } from "@/components/marketplace-deals/marketplace-listings";
import { useMockDeals } from "@/hooks/useMockDeals";
import { AdvancedFilters, defaultFilters } from "@/components/marketplace-deals/more-filters-dialog";

export default function MarketplaceDeals() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters state
  // All home types selected by default
  const allHomeTypes = ["houses", "townhomes", "multi-family", "condos", "lots-land", "apartments", "manufactured"];
  
  const [filters, setFilters] = useState({
    address: "",
    listingStatus: "all",
    leadType: "all",
    homeTypes: allHomeTypes,
    priceRange: "any",
    bedsMin: "",
    bathsMin: "",
    exactMatch: false,
  });

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(defaultFilters);

  // Convert filters to format expected by useMockDeals
  const mockDealFilters = {
    address: filters.address,
    leadType: filters.leadType,
    homeType: filters.homeTypes.length > 0 
      ? (filters.homeTypes.length === 1 ? filters.homeTypes[0] : "all")
      : "all",
    priceMin: filters.priceRange !== "any" ? filters.priceRange.split("-")[0] : "",
    priceMax: filters.priceRange !== "any" && !filters.priceRange.includes("+") 
      ? filters.priceRange.split("-")[1] 
      : "",
    bedsMin: filters.bedsMin,
    bathsMin: filters.bathsMin,
  };

  const { deals, totalCount, isLoading } = useMockDeals({
    filters: mockDealFilters,
    sortBy,
    page: currentPage,
    perPage: resultsPerPage,
  });

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
        {/* Filters Bar - Full width */}
        <MarketplaceFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={setAdvancedFilters}
        />

        {/* Main Content - Split view - fills remaining height */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map Section - 50% width */}
          <div className="hidden lg:block w-1/2 h-full">
            <MarketplaceMap deals={deals} />
          </div>

          {/* Listings Section - 50% width */}
          <div className="flex-1 lg:flex-none lg:w-1/2 h-full overflow-y-auto">
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
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
