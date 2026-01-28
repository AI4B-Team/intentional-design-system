import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  MapPin,
  Home,
  Calendar,
  Ruler,
  DollarSign,
  Navigation,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CompResult {
  id: string;
  address: string;
  city: string;
  state: string;
  salePrice: number;
  saleDate: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  distance: number;
  pricePerSqft: number;
  condition: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function CompSearchTab() {
  const [isSearching, setIsSearching] = React.useState(false);
  const [results, setResults] = React.useState<CompResult[]>([]);
  const [hasSearched, setHasSearched] = React.useState(false);

  const [filters, setFilters] = React.useState({
    address: "",
    radius: "1",
    beds: "",
    baths: "",
    sqftMin: "",
    sqftMax: "",
    soldWithin: "6",
    propertyType: "sfh",
  });

  const handleSearch = async () => {
    if (!filters.address) return;
    
    setIsSearching(true);
    setHasSearched(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock results
    const mockResults: CompResult[] = [
      {
        id: "1",
        address: "125 Oak Lane",
        city: "Austin",
        state: "TX",
        salePrice: 285000,
        saleDate: "2024-01-15",
        beds: 3,
        baths: 2,
        sqft: 1850,
        yearBuilt: 1998,
        distance: 0.3,
        pricePerSqft: 154,
        condition: "Good",
      },
      {
        id: "2",
        address: "89 Maple Drive",
        city: "Austin",
        state: "TX",
        salePrice: 275000,
        saleDate: "2024-01-08",
        beds: 3,
        baths: 2,
        sqft: 1780,
        yearBuilt: 2001,
        distance: 0.5,
        pricePerSqft: 155,
        condition: "Good",
      },
      {
        id: "3",
        address: "342 Elm Street",
        city: "Austin",
        state: "TX",
        salePrice: 295000,
        saleDate: "2023-12-20",
        beds: 4,
        baths: 2,
        sqft: 2000,
        yearBuilt: 1995,
        distance: 0.7,
        pricePerSqft: 148,
        condition: "Excellent",
      },
      {
        id: "4",
        address: "201 Pine Court",
        city: "Austin",
        state: "TX",
        salePrice: 265000,
        saleDate: "2023-12-05",
        beds: 3,
        baths: 2,
        sqft: 1720,
        yearBuilt: 2003,
        distance: 0.8,
        pricePerSqft: 154,
        condition: "Fair",
      },
      {
        id: "5",
        address: "567 Cedar Ave",
        city: "Austin",
        state: "TX",
        salePrice: 280000,
        saleDate: "2023-11-28",
        beds: 3,
        baths: 2.5,
        sqft: 1880,
        yearBuilt: 2005,
        distance: 1.1,
        pricePerSqft: 149,
        condition: "Good",
      },
    ];

    setResults(mockResults);
    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label htmlFor="comp-address">Subject Property Address</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="comp-address"
                className="pl-9"
                placeholder="Enter property address..."
                value={filters.address}
                onChange={(e) => setFilters((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="radius">Radius (miles)</Label>
            <Select value={filters.radius} onValueChange={(v) => setFilters((prev) => ({ ...prev, radius: v }))}>
              <SelectTrigger id="radius" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5 miles</SelectItem>
                <SelectItem value="1">1 mile</SelectItem>
                <SelectItem value="2">2 miles</SelectItem>
                <SelectItem value="3">3 miles</SelectItem>
                <SelectItem value="5">5 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sold-within">Sold Within</Label>
            <Select value={filters.soldWithin} onValueChange={(v) => setFilters((prev) => ({ ...prev, soldWithin: v }))}>
              <SelectTrigger id="sold-within" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-6 mt-4">
          <div>
            <Label>Beds</Label>
            <Input
              type="number"
              placeholder="Any"
              className="mt-1"
              value={filters.beds}
              onChange={(e) => setFilters((prev) => ({ ...prev, beds: e.target.value }))}
            />
          </div>
          <div>
            <Label>Baths</Label>
            <Input
              type="number"
              step="0.5"
              placeholder="Any"
              className="mt-1"
              value={filters.baths}
              onChange={(e) => setFilters((prev) => ({ ...prev, baths: e.target.value }))}
            />
          </div>
          <div>
            <Label>Min SqFt</Label>
            <Input
              type="number"
              placeholder="Any"
              className="mt-1"
              value={filters.sqftMin}
              onChange={(e) => setFilters((prev) => ({ ...prev, sqftMin: e.target.value }))}
            />
          </div>
          <div>
            <Label>Max SqFt</Label>
            <Input
              type="number"
              placeholder="Any"
              className="mt-1"
              value={filters.sqftMax}
              onChange={(e) => setFilters((prev) => ({ ...prev, sqftMax: e.target.value }))}
            />
          </div>
          <div>
            <Label>Property Type</Label>
            <Select value={filters.propertyType} onValueChange={(v) => setFilters((prev) => ({ ...prev, propertyType: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sfh">Single Family</SelectItem>
                <SelectItem value="condo">Condo/Townhouse</SelectItem>
                <SelectItem value="multi">Multi-Family</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch} disabled={!filters.address || isSearching} className="w-full">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Search</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {!hasSearched && (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-h3 font-semibold text-foreground mb-2">
            Search for Comparable Sales
          </h3>
          <p className="text-body text-muted-foreground max-w-md">
            Enter a property address to find recent sales in the area.
          </p>
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

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-h3 font-semibold">{results.length} Comparable Sales Found</h3>
            <div className="text-small text-muted-foreground">
              Avg: {formatCurrency(results.reduce((sum, r) => sum + r.salePrice, 0) / results.length)} | 
              ${Math.round(results.reduce((sum, r) => sum + r.pricePerSqft, 0) / results.length)}/sqft
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {results.map((comp) => (
              <Card key={comp.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" />
                      <span className="font-medium">{comp.address}</span>
                    </div>
                    <div className="text-small text-muted-foreground">
                      {comp.city}, {comp.state}
                    </div>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {comp.condition}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-small mb-3">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold text-primary">{formatCurrency(comp.salePrice)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{new Date(comp.saleDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{comp.distance} mi</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-small text-muted-foreground">
                  <span>{comp.beds}bd / {comp.baths}ba</span>
                  <span>{comp.sqft.toLocaleString()} sqft</span>
                  <span>Built {comp.yearBuilt}</span>
                  <span className="ml-auto font-medium">${comp.pricePerSqft}/sqft</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
