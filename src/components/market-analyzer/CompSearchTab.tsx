import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Map as MapIcon,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Loader2,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CompSearchFilters,
  CompCard,
  CompDetailModal,
  CompAdjustmentsPanel,
  CompMap,
  type CompResult,
  type CompFilters,
  type CompAdjustment,
  type SubjectProperty,
  defaultFilters,
  defaultAdjustmentRates,
} from "./comp-search";

type SortOption = "distance" | "price" | "date" | "pricePerSqft";

interface CompSearchTabProps {
  initialAddress?: string;
  onARVCalculated?: (arv: number, low: number, high: number) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Mock data generator
function generateMockComps(filters: CompFilters): CompResult[] {
  const baseAddress = filters.address || `${filters.city}, ${filters.state}`;
  const mockComps: CompResult[] = [
    {
      id: "1",
      address: "125 Oak Lane",
      city: filters.city || "Austin",
      state: filters.state || "TX",
      zip: "78701",
      latitude: 30.2672 + 0.005,
      longitude: -97.7431 + 0.003,
      salePrice: 285000,
      listPrice: 289000,
      saleDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      beds: 3,
      baths: 2,
      sqft: 1850,
      lotSqft: 7500,
      yearBuilt: 1998,
      distance: 0.3,
      pricePerSqft: 154,
      condition: "Good",
      saleType: "standard",
      daysOnMarket: 12,
      garage: 2,
      pool: false,
    },
    {
      id: "2",
      address: "89 Maple Drive",
      city: filters.city || "Austin",
      state: filters.state || "TX",
      zip: "78701",
      latitude: 30.2672 - 0.004,
      longitude: -97.7431 + 0.006,
      salePrice: 275000,
      listPrice: 279000,
      saleDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
      beds: 3,
      baths: 2,
      sqft: 1780,
      lotSqft: 6800,
      yearBuilt: 2001,
      distance: 0.5,
      pricePerSqft: 155,
      condition: "Good",
      saleType: "standard",
      daysOnMarket: 18,
      garage: 2,
      pool: false,
    },
    {
      id: "3",
      address: "342 Elm Street",
      city: filters.city || "Austin",
      state: filters.state || "TX",
      zip: "78702",
      latitude: 30.2672 + 0.008,
      longitude: -97.7431 - 0.004,
      salePrice: 295000,
      listPrice: 299000,
      saleDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      beds: 4,
      baths: 2,
      sqft: 2000,
      lotSqft: 8200,
      yearBuilt: 1995,
      distance: 0.7,
      pricePerSqft: 148,
      condition: "Excellent",
      saleType: "standard",
      daysOnMarket: 8,
      garage: 2,
      pool: true,
    },
    {
      id: "4",
      address: "201 Pine Court",
      city: filters.city || "Austin",
      state: filters.state || "TX",
      zip: "78701",
      latitude: 30.2672 - 0.006,
      longitude: -97.7431 - 0.007,
      salePrice: 265000,
      listPrice: 275000,
      saleDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      beds: 3,
      baths: 2,
      sqft: 1720,
      lotSqft: 6500,
      yearBuilt: 2003,
      distance: 0.8,
      pricePerSqft: 154,
      condition: "Fair",
      saleType: "standard",
      daysOnMarket: 35,
      garage: 1,
      pool: false,
    },
    {
      id: "5",
      address: "567 Cedar Ave",
      city: filters.city || "Austin",
      state: filters.state || "TX",
      zip: "78702",
      latitude: 30.2672 + 0.01,
      longitude: -97.7431 + 0.008,
      salePrice: 280000,
      listPrice: 285000,
      saleDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
      beds: 3,
      baths: 2.5,
      sqft: 1880,
      lotSqft: 7200,
      yearBuilt: 2005,
      distance: 1.1,
      pricePerSqft: 149,
      condition: "Good",
      saleType: "standard",
      daysOnMarket: 21,
      garage: 2,
      pool: false,
    },
    {
      id: "6",
      address: "890 Birch Road",
      city: filters.city || "Austin",
      state: filters.state || "TX",
      zip: "78703",
      latitude: 30.2672 - 0.009,
      longitude: -97.7431 + 0.01,
      salePrice: 258000,
      listPrice: 265000,
      saleDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      beds: 3,
      baths: 2,
      sqft: 1650,
      lotSqft: 6200,
      yearBuilt: 1992,
      distance: 1.3,
      pricePerSqft: 156,
      condition: "Fair",
      saleType: "reo",
      daysOnMarket: 45,
      garage: 2,
      pool: false,
    },
  ];

  return mockComps;
}

export function CompSearchTab({ initialAddress, onARVCalculated }: CompSearchTabProps) {
  const [filters, setFilters] = React.useState<CompFilters>({
    ...defaultFilters,
    address: initialAddress || "",
  });
  const [isSearching, setIsSearching] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [results, setResults] = React.useState<CompResult[]>([]);
  const [sortBy, setSortBy] = React.useState<SortOption>("distance");
  const [viewMode, setViewMode] = React.useState<"split" | "list" | "map">("split");

  // Selection & adjustments
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [adjustments, setAdjustments] = React.useState<Record<string, CompAdjustment>>({});

  // Detail modal
  const [detailComp, setDetailComp] = React.useState<CompResult | null>(null);

  // Subject property (mock)
  const [subject, setSubject] = React.useState<SubjectProperty | null>(null);

  // Handle search
  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const mockComps = generateMockComps(filters);
    setResults(mockComps);

    // Mock subject from address
    if (filters.address) {
      setSubject({
        address: filters.address,
        city: filters.city || "Austin",
        state: filters.state || "TX",
        zip: filters.zip || "78701",
        latitude: 30.2672,
        longitude: -97.7431,
        beds: 3,
        baths: 2,
        sqft: 1850,
        yearBuilt: 1985,
        condition: "Fair",
      });
    }

    setIsSearching(false);
  };

  // Sort results
  const sortedResults = React.useMemo(() => {
    const sorted = [...results];
    switch (sortBy) {
      case "distance":
        sorted.sort((a, b) => a.distance - b.distance);
        break;
      case "price":
        sorted.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case "date":
        sorted.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
        break;
      case "pricePerSqft":
        sorted.sort((a, b) => b.pricePerSqft - a.pricePerSqft);
        break;
    }
    return sorted;
  }, [results, sortBy]);

  // Selected comps
  const selectedComps = React.useMemo(
    () => results.filter((c) => selectedIds.includes(c.id)),
    [results, selectedIds]
  );

  // Handle selection
  const handleSelectComp = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
      // Auto-calculate adjustments
      const comp = results.find((c) => c.id === id);
      if (comp && subject) {
        const sqftDiff = comp.sqft - subject.sqft;
        const sqftAdj = sqftDiff * defaultAdjustmentRates.sqftPerUnit * -1; // negative if comp is larger
        const bedsDiff = comp.beds - subject.beds;
        const bedsAdj = bedsDiff * defaultAdjustmentRates.bedsPerUnit * -1;
        const bathsDiff = comp.baths - subject.baths;
        const bathsAdj = bathsDiff * defaultAdjustmentRates.bathsPerUnit * -1;
        
        let conditionAdj = 0;
        if (comp.condition === "Excellent" && subject.condition !== "Excellent") {
          conditionAdj = -defaultAdjustmentRates.conditionExcellentToGood;
        } else if (comp.condition === "Fair" && subject.condition !== "Fair") {
          conditionAdj = defaultAdjustmentRates.conditionGoodToFair * -1;
        }

        const poolAdj = comp.pool && !subject ? -defaultAdjustmentRates.poolValue : 0;

        const totalAdj = sqftAdj + bedsAdj + bathsAdj + conditionAdj + poolAdj;

        setAdjustments((prev) => ({
          ...prev,
          [id]: {
            compId: id,
            sqftAdj,
            bedsAdj,
            bathsAdj,
            conditionAdj,
            poolAdj,
            garageAdj: 0,
            customAdj: 0,
            totalAdj,
            adjustedPrice: comp.salePrice + totalAdj,
            weight: 1,
          },
        }));
      }
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      setAdjustments((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  // Handle adjustment change
  const handleAdjustmentChange = (compId: string, updates: Partial<CompAdjustment>) => {
    const comp = results.find((c) => c.id === compId);
    if (!comp) return;

    setAdjustments((prev) => {
      const current = prev[compId] || {
        compId,
        sqftAdj: 0,
        bedsAdj: 0,
        bathsAdj: 0,
        conditionAdj: 0,
        poolAdj: 0,
        garageAdj: 0,
        customAdj: 0,
        totalAdj: 0,
        adjustedPrice: comp.salePrice,
        weight: 1,
      };

      const updated = { ...current, ...updates };
      updated.totalAdj =
        updated.sqftAdj +
        updated.bedsAdj +
        updated.bathsAdj +
        updated.conditionAdj +
        updated.poolAdj +
        updated.garageAdj +
        updated.customAdj;
      updated.adjustedPrice = comp.salePrice + updated.totalAdj;

      return { ...prev, [compId]: updated };
    });
  };

  // Calculate ARV and pass to parent
  const handleCalculateARV = () => {
    if (selectedComps.length === 0) return;

    let totalWeight = 0;
    let weightedSum = 0;
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    selectedComps.forEach((comp) => {
      const adj = adjustments[comp.id];
      const adjustedPrice = adj?.adjustedPrice || comp.salePrice;
      const weight = adj?.weight || 1;

      totalWeight += weight;
      weightedSum += adjustedPrice * weight;
      minPrice = Math.min(minPrice, adjustedPrice);
      maxPrice = Math.max(maxPrice, adjustedPrice);
    });

    const arv = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    onARVCalculated?.(arv, Math.round(minPrice), Math.round(maxPrice));
  };

  // Clear all
  const handleClearAll = () => {
    setSelectedIds([]);
    setAdjustments({});
  };

  // Stats
  const avgPrice = results.length > 0
    ? results.reduce((sum, r) => sum + r.salePrice, 0) / results.length
    : 0;
  const avgPricePerSqft = results.length > 0
    ? results.reduce((sum, r) => sum + r.pricePerSqft, 0) / results.length
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left sidebar - Filters */}
        <div className="lg:col-span-3">
          <CompSearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            isSearching={isSearching}
          />
        </div>

        {/* Main content */}
        <div className="lg:col-span-9 space-y-4">
          {/* Results header */}
          {hasSearched && !isSearching && results.length > 0 && (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-h3 font-semibold">
                  {results.length} Comparable Sales Found
                </h3>
                <p className="text-small text-muted-foreground">
                  Avg: {formatCurrency(avgPrice)} | ${Math.round(avgPricePerSqft)}/sqft
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[140px]">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="pricePerSqft">$/SqFt</SelectItem>
                  </SelectContent>
                </Select>

                {/* View mode */}
                <div className="flex border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("rounded-r-none", viewMode === "split" && "bg-surface-secondary")}
                    onClick={() => setViewMode("split")}
                  >
                    <MapIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("rounded-none border-x", viewMode === "list" && "bg-surface-secondary")}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("rounded-l-none", viewMode === "map" && "bg-surface-secondary")}
                    onClick={() => setViewMode("map")}
                  >
                    <MapIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Content area */}
          {!hasSearched && (
            <Card className="p-12 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-h3 font-semibold text-foreground mb-2">
                Search for Comparable Sales
              </h3>
              <p className="text-body text-muted-foreground max-w-md">
                Enter a property address or search by area to find recent sales.
              </p>
            </Card>
          )}

          {isSearching && (
            <Card className="p-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-body text-muted-foreground">Searching for comparable sales...</p>
            </Card>
          )}

          {hasSearched && !isSearching && results.length === 0 && (
            <Card className="p-12 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-h3 font-semibold text-foreground mb-2">
                No Comps Found
              </h3>
              <p className="text-body text-muted-foreground max-w-md">
                Try expanding the search radius or adjusting your filters.
              </p>
            </Card>
          )}

          {hasSearched && !isSearching && results.length > 0 && (
            <>
              {/* Split view: Map + List */}
              {viewMode === "split" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="h-[400px] lg:h-[500px]">
                    <CompMap
                      subject={subject}
                      comps={sortedResults}
                      selectedIds={selectedIds}
                      radiusMiles={filters.radius}
                      onSelectComp={handleSelectComp}
                      onViewDetails={setDetailComp}
                    />
                  </div>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {sortedResults.map((comp) => (
                      <CompCard
                        key={comp.id}
                        comp={comp}
                        isSelected={selectedIds.includes(comp.id)}
                        onSelect={handleSelectComp}
                        onViewDetails={setDetailComp}
                        subjectSqft={subject?.sqft}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* List view */}
              {viewMode === "list" && (
                <div className="grid gap-3 lg:grid-cols-2">
                  {sortedResults.map((comp) => (
                    <CompCard
                      key={comp.id}
                      comp={comp}
                      isSelected={selectedIds.includes(comp.id)}
                      onSelect={handleSelectComp}
                      onViewDetails={setDetailComp}
                      subjectSqft={subject?.sqft}
                    />
                  ))}
                </div>
              )}

              {/* Map view */}
              {viewMode === "map" && (
                <div className="h-[500px]">
                  <CompMap
                    subject={subject}
                    comps={sortedResults}
                    selectedIds={selectedIds}
                    radiusMiles={filters.radius}
                    onSelectComp={handleSelectComp}
                    onViewDetails={setDetailComp}
                  />
                </div>
              )}
            </>
          )}

          {/* Selected comps panel */}
          {selectedIds.length > 0 && (
            <CompAdjustmentsPanel
              selectedComps={selectedComps}
              adjustments={adjustments}
              subject={subject}
              onAdjustmentChange={handleAdjustmentChange}
              onRemoveComp={(id) => handleSelectComp(id, false)}
              onClearAll={handleClearAll}
              onCalculateARV={handleCalculateARV}
            />
          )}
        </div>
      </div>

      {/* Detail modal */}
      <CompDetailModal
        comp={detailComp}
        subject={subject}
        isSelected={detailComp ? selectedIds.includes(detailComp.id) : false}
        onSelect={handleSelectComp}
        onOpenChange={(open) => !open && setDetailComp(null)}
      />
    </div>
  );
}
