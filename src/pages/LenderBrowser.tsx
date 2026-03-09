import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout, PageHeader } from "@/components/layout";
import {
  LenderFiltersPanel,
  LenderCard,
  type LenderFilters,
  type Lender,
} from "@/components/marketplace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Sample lender data
const sampleLenders: Lender[] = [
  {
    id: "1",
    name: "Capital Partners Fund",
    type: "Fix & Flip",
    rating: 4.9,
    reviewCount: 127,
    rateRange: { min: 9.5, max: 12.5 },
    maxLTV: 90,
    fundingTime: "3-5 days",
    minLoan: 50000,
    maxLoan: 5000000,
    states: ["TX", "FL", "GA", "NC"],
    featured: true,
  },
  {
    id: "2",
    name: "Bridge Funding LLC",
    type: "Bridge",
    rating: 4.7,
    reviewCount: 89,
    rateRange: { min: 10.0, max: 14.0 },
    maxLTV: 85,
    fundingTime: "24-48 hrs",
    minLoan: 25000,
    maxLoan: 2000000,
    states: ["TX", "CA", "AZ"],
  },
  {
    id: "3",
    name: "DSCR Capital",
    type: "DSCR",
    rating: 4.8,
    reviewCount: 156,
    rateRange: { min: 7.5, max: 9.5 },
    maxLTV: 80,
    fundingTime: "2 weeks",
    minLoan: 100000,
    maxLoan: 3000000,
    states: ["TX", "FL", "GA"],
  },
  {
    id: "4",
    name: "Quick Close Capital",
    type: "Transactional",
    rating: 4.6,
    reviewCount: 67,
    rateRange: { min: 2.0, max: 3.5 },
    maxLTV: 100,
    fundingTime: "Same day",
    minLoan: 10000,
    maxLoan: 1000000,
    states: ["TX", "FL", "CA", "NY"],
    featured: true,
  },
  {
    id: "5",
    name: "Rehab Finance Corp",
    type: "Fix & Flip",
    rating: 4.5,
    reviewCount: 203,
    rateRange: { min: 10.5, max: 13.0 },
    maxLTV: 85,
    fundingTime: "5-7 days",
    minLoan: 75000,
    maxLoan: 4000000,
    states: ["TX", "CA", "FL"],
  },
  {
    id: "6",
    name: "EMD Pro Funding",
    type: "EMD",
    rating: 4.8,
    reviewCount: 45,
    rateRange: { min: 1.5, max: 2.5 },
    maxLTV: 100,
    fundingTime: "24 hrs",
    minLoan: 5000,
    maxLoan: 100000,
    states: ["TX", "FL", "GA", "NC", "SC"],
  },
];

const defaultFilters: LenderFilters = {
  loanTypes: [],
  minAmount: 10000,
  maxAmount: 10000000,
  maxLTV: 100,
  state: "All States",
  fundingSpeed: [],
};

export default function LenderBrowser() {
  const navigate = useNavigate();
  const [filters, setFilters] = React.useState<LenderFilters>(defaultFilters);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("featured");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const filteredLenders = React.useMemo(() => {
    return sampleLenders
      .filter((lender) => {
        // Search
        if (searchQuery && !lender.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        // Loan type
        if (filters.loanTypes.length > 0) {
          const lenderType = lender.type.toLowerCase().replace(/\s+/g, "-");
          if (!filters.loanTypes.some((t) => lenderType.includes(t))) {
            return false;
          }
        }
        // Amount range
        if (lender.maxLoan < filters.minAmount || lender.minLoan > filters.maxAmount) {
          return false;
        }
        // Max LTV
        if (filters.maxLTV < 100 && lender.maxLTV < filters.maxLTV) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "featured") {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
        }
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
        return 0;
      });
  }, [filters, searchQuery, sortBy]);

  const handleViewDetails = (id: string) => {
    navigate(`/capital/lenders?lender=${id}`);
  };

  const handleRequestQuote = (id: string) => {
    navigate(`/marketplace/request?lender=${id}`);
  };

  const handleApplyFilters = () => {
    // Filters are already applied reactively
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "Lenders" }]}>
      <div className="flex flex-col lg:flex-row gap-lg">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <LenderFiltersPanel
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-lg">
            <div>
              <h1 className="text-h1 font-semibold text-content">Browse Lenders</h1>
              <p className="text-body text-content-secondary">
                {filteredLenders.length} lenders available
              </p>
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-4">
                  <LenderFiltersPanel
                    filters={filters}
                    onChange={setFilters}
                    onApply={handleApplyFilters}
                    onClear={handleClearFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
              <Input
                placeholder="Search lenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border border-border rounded-small">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 ${viewMode === "grid" ? "bg-surface-secondary" : ""}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 ${viewMode === "list" ? "bg-surface-secondary" : ""}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.loanTypes.length > 0 || filters.fundingSpeed.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-md">
              {filters.loanTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {type}
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        loanTypes: filters.loanTypes.filter((t) => t !== type),
                      })
                    }
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {filters.fundingSpeed.map((speed) => (
                <Badge key={speed} variant="secondary" className="gap-1">
                  {speed}
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        fundingSpeed: filters.fundingSpeed.filter((s) => s !== speed),
                      })
                    }
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Lender Grid */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md"
                : "space-y-md"
            }
          >
            {filteredLenders.map((lender, index) => (
              <LenderCard
                key={lender.id}
                lender={lender}
                onViewDetails={handleViewDetails}
                onRequestQuote={handleRequestQuote}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredLenders.length === 0 && (
            <div className="text-center py-16">
              <p className="text-body text-content-secondary mb-4">
                No lenders match your criteria
              </p>
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
