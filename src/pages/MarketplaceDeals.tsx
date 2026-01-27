import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MarketplaceFilters } from "@/components/marketplace-deals/marketplace-filters";
import { MarketplaceMap } from "@/components/marketplace-deals/marketplace-map";
import { MarketplaceListings } from "@/components/marketplace-deals/marketplace-listings";
import { useMockDeals } from "@/hooks/useMockDeals";

export default function MarketplaceDeals() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters state
  const [filters, setFilters] = useState({
    address: "",
    leadType: "all",
    homeType: "all",
    priceMin: "",
    priceMax: "",
    bedsMin: "",
    bathsMin: "",
  });

  const { deals, totalCount, isLoading } = useMockDeals({
    filters,
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
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 lg:-m-6">
        {/* Filters Bar */}
        <MarketplaceFilters filters={filters} onFiltersChange={setFilters} />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map Section */}
          <div className="hidden lg:block w-1/2 border-r border-border">
            <MarketplaceMap deals={deals} />
          </div>

          {/* Listings Section */}
          <div className="flex-1 lg:w-1/2 overflow-hidden">
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
