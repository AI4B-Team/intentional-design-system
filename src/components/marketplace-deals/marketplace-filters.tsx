import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  SlidersHorizontal,
  Bookmark,
  ChevronDown,
  Target,
  List,
  LayoutGrid,
  Map,
  Columns,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MoreFiltersDialog, AdvancedFilters, defaultFilters } from "./more-filters-dialog";
import { SaveSearchDialog } from "./save-search-dialog";

export type LayoutMode = "cards" | "split" | "map";

interface MarketplaceFiltersProps {
  filters: {
    address: string;
    listingStatus: string;
    leadType: string;
    homeTypes: string[];
    priceRange: string;
    bedsMin: string;
    bathsMin: string;
    exactMatch: boolean;
  };
  onFiltersChange: (filters: any) => void;
  advancedFilters?: AdvancedFilters;
  onAdvancedFiltersChange?: (filters: AdvancedFilters) => void;
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
  layoutMode?: LayoutMode;
  onLayoutModeChange?: (mode: LayoutMode) => void;
  showSavedOnly?: boolean;
  onShowSavedOnlyChange?: (show: boolean) => void;
  savedCount?: number;
  totalCount?: number;
}

const leadTypeOptions = [
  "All Lead Types",
  "High Equity",
  "Cash Buyer",
  "Absentee Owner",
  "Distressed",
  "Foreclosure",
  "Pre-Foreclosure",
  "Vacant",
  "Tax Lien",
  "Probate",
  "Divorce",
  "Motivated Seller",
];

const homeTypeOptions = [
  { id: "houses", label: "Houses" },
  { id: "townhomes", label: "Townhomes" },
  { id: "multi-family", label: "Multi-family" },
  { id: "condos", label: "Condos/Co-ops" },
  { id: "lots-land", label: "Lots/Land" },
  { id: "apartments", label: "Apartments" },
  { id: "manufactured", label: "Manufactured" },
];

const priceRangeOptions = [
  { value: "any", label: "Any" },
  { value: "0-50000", label: "Under $50K" },
  { value: "50000-100000", label: "$50K - $100K" },
  { value: "100000-200000", label: "$100K - $200K" },
  { value: "200000-500000", label: "$200K - $500K" },
  { value: "500000-1000000", label: "$500K - $1M" },
  { value: "1000000+", label: "$1M+" },
];

const bedsOptions = ["Any", "1+", "2+", "3+", "4+", "5+"];
const bathsOptions = ["Any", "1+", "1.5+", "2+", "3+", "4+"];

export function MarketplaceFilters({ 
  filters, 
  onFiltersChange,
  advancedFilters = defaultFilters,
  onAdvancedFiltersChange,
  viewMode = "grid",
  onViewModeChange,
  layoutMode = "cards",
  onLayoutModeChange,
  showSavedOnly = false,
  onShowSavedOnlyChange,
  savedCount = 0,
  totalCount = 0,
}: MarketplaceFiltersProps) {
  const navigate = useNavigate();
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [bedsPopoverOpen, setBedsPopoverOpen] = useState(false);
  const [homeTypePopoverOpen, setHomeTypePopoverOpen] = useState(false);
  const [saveSearchOpen, setSaveSearchOpen] = useState(false);
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);

  const handleChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleHomeType = (typeId: string) => {
    const currentTypes = filters.homeTypes || [];
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter((t: string) => t !== typeId)
      : [...currentTypes, typeId];
    handleChange("homeTypes", newTypes);
  };

  const selectAllHomeTypes = () => {
    handleChange("homeTypes", homeTypeOptions.map(t => t.id));
  };

  const deselectAllHomeTypes = () => {
    handleChange("homeTypes", []);
  };

  const allHomeTypesSelected = filters.homeTypes?.length === homeTypeOptions.length;

  const getHomeTypeLabel = () => {
    if (!filters.homeTypes || filters.homeTypes.length === 0) {
      return "Home Type";
    }
    if (filters.homeTypes.length === homeTypeOptions.length) {
      return "Home Type";
    }
    if (filters.homeTypes.length === 1) {
      return homeTypeOptions.find(t => t.id === filters.homeTypes[0])?.label || "Home Type";
    }
    return `${filters.homeTypes.length} Types`;
  };

  const getLeadTypeLabel = () => {
    if (!filters.leadType || filters.leadType === "all") {
      return "Lead Type";
    }
    const found = leadTypeOptions.find(
      (t) => t.toLowerCase().replace(/ /g, "-") === filters.leadType
    );
    return found || "Lead Type";
  };

  const getPriceLabel = () => {
    if (!filters.priceRange || filters.priceRange === "any") {
      return "Price";
    }
    const found = priceRangeOptions.find((o) => o.value === filters.priceRange);
    return found?.label || "Price";
  };

  // Standardized button size for filter bar consistency – uniform h-10 and whitespace-nowrap
  const filterButtonClass = "h-10 px-4 bg-background text-sm flex-shrink-0 whitespace-nowrap";

  return (
    <>
      <div className="relative flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-border flex-shrink-0 overflow-x-auto">
        {/* Left aligned filters - uniform gap-3 for equal spacing */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Address Search with Dropdown */}
          <Popover open={addressDropdownOpen} onOpenChange={setAddressDropdownOpen}>
            <div className="relative flex-shrink-0">
              <Input
                type="text"
                placeholder="Address, City, County, State, or Zip"
                value={filters.address}
                onChange={(e) => handleChange("address", e.target.value)}
                onFocus={() => setAddressDropdownOpen(true)}
                className="h-10 w-[320px] bg-background text-sm pr-10 rounded-full border-border"
              />
              <PopoverTrigger asChild>
                <button 
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                  <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", addressDropdownOpen && "rotate-180")} />
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[320px] p-0 bg-white border border-border shadow-lg z-50" 
                align="start" 
                sideOffset={4}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Popular Markets</div>
                  {[
                    { label: "Tampa, FL", value: "Tampa" },
                    { label: "Houston, TX", value: "Houston" },
                    { label: "Atlanta, GA", value: "Atlanta" },
                    { label: "Phoenix, AZ", value: "Phoenix" },
                    { label: "Jacksonville, FL", value: "Jacksonville" },
                    { label: "Dallas, TX", value: "Dallas" },
                    { label: "Orlando, FL", value: "Orlando" },
                    { label: "Charlotte, NC", value: "Charlotte" },
                  ].map((market) => (
                    <button
                      key={market.value}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => {
                        handleChange("address", market.value);
                        setAddressDropdownOpen(false);
                      }}
                    >
                      {market.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </div>
          </Popover>

          {/* All Listings */}
          <Select 
            value={filters.listingStatus || "all"} 
            onValueChange={(v) => handleChange("listingStatus", v)}
          >
            <SelectTrigger className={filterButtonClass}>
              <SelectValue placeholder="All Listings" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">All Listings</SelectItem>
              <SelectItem value="on-market">On-Market</SelectItem>
              <SelectItem value="off-market">Off-Market</SelectItem>
            </SelectContent>
          </Select>

          {/* Lead Type */}
          <Select 
            value={filters.leadType || "all"} 
            onValueChange={(v) => handleChange("leadType", v)}
          >
            <SelectTrigger className={filterButtonClass}>
              <span className="truncate">{getLeadTypeLabel()}</span>
            </SelectTrigger>
            <SelectContent className="bg-background">
              {leadTypeOptions.map((type) => (
                <SelectItem 
                  key={type} 
                  value={type === "All Lead Types" ? "all" : type.toLowerCase().replace(/ /g, "-")}
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Home Type */}
          <Popover open={homeTypePopoverOpen} onOpenChange={setHomeTypePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(filterButtonClass, "gap-2 font-normal")}>
                <span className="truncate">{getHomeTypeLabel()}</span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4" align="start">
              <div className="space-y-3">
                <div className="font-semibold">Home Type</div>
                <button
                  type="button"
                  onClick={allHomeTypesSelected ? deselectAllHomeTypes : selectAllHomeTypes}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Checkbox checked={allHomeTypesSelected} />
                  {allHomeTypesSelected ? "Deselect All" : "Select All"}
                </button>
                <div className="space-y-2">
                  {homeTypeOptions.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`home-${type.id}`}
                        checked={filters.homeTypes?.includes(type.id)}
                        onCheckedChange={() => toggleHomeType(type.id)}
                      />
                      <Label htmlFor={`home-${type.id}`} className="cursor-pointer text-sm">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={() => setHomeTypePopoverOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Price */}
          <Select 
            value={filters.priceRange || "any"} 
            onValueChange={(v) => handleChange("priceRange", v)}
          >
            <SelectTrigger className={filterButtonClass}>
              <span className="truncate">{getPriceLabel()}</span>
            </SelectTrigger>
            <SelectContent className="bg-background">
              {priceRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Beds & Baths */}
          <Popover open={bedsPopoverOpen} onOpenChange={setBedsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(filterButtonClass, "gap-2 font-normal")}>
                Beds & Baths
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="space-y-4">
                {/* Bedrooms */}
                <div className="space-y-2">
                  <Label className="font-semibold">Bedrooms</Label>
                  <div className="flex gap-1">
                    {bedsOptions.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={filters.bedsMin === (option === "Any" ? "" : option.replace("+", "")) ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "flex-1 h-9",
                          filters.bedsMin === (option === "Any" ? "" : option.replace("+", ""))
                            ? "bg-primary text-white hover:bg-primary/90"
                            : "bg-background"
                        )}
                        onClick={() => handleChange("bedsMin", option === "Any" ? "" : option.replace("+", ""))}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="exact-match"
                      checked={filters.exactMatch}
                      onCheckedChange={(checked) => handleChange("exactMatch", checked)}
                    />
                    <Label htmlFor="exact-match" className="text-sm cursor-pointer">
                      Use Exact Match
                    </Label>
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="space-y-2">
                  <Label className="font-semibold">Bathrooms</Label>
                  <div className="flex gap-1">
                    {bathsOptions.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={filters.bathsMin === (option === "Any" ? "" : option.replace("+", "")) ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "flex-1 h-9",
                          filters.bathsMin === (option === "Any" ? "" : option.replace("+", ""))
                            ? "bg-primary text-white hover:bg-primary/90"
                            : "bg-background"
                        )}
                        onClick={() => handleChange("bathsMin", option === "Any" ? "" : option.replace("+", ""))}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={() => setBedsPopoverOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* More Filters */}
          <Button 
            variant="outline" 
            className={cn(filterButtonClass, "gap-2 font-normal")}
            onClick={() => setMoreFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>

          {/* Save Search */}
          <Button 
            variant="default" 
            className="h-10 gap-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-sm flex-shrink-0 whitespace-nowrap"
            onClick={() => setSaveSearchOpen(true)}
          >
            <Bookmark className="h-4 w-4" />
            Save Search
          </Button>
        </div>

        {/* Right aligned actions – Buy Box, View Toggles */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Saved Button */}
          <Button
            variant={showSavedOnly ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-10 gap-1.5",
              showSavedOnly && "bg-brand hover:bg-brand/90"
            )}
            onClick={() => onShowSavedOnlyChange?.(!showSavedOnly)}
          >
            <Heart className={cn("h-4 w-4", showSavedOnly && "fill-current")} />
            Saved
            {savedCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {savedCount}
              </Badge>
            )}
          </Button>

          {/* View Mode Toggle */}
          {onViewModeChange && onLayoutModeChange && (
            <div className="flex border border-border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-none border-0",
                  viewMode === "list" && layoutMode === "split" ? "bg-primary text-white" : "bg-background"
                )}
                onClick={() => {
                  onViewModeChange("list");
                  onLayoutModeChange("split");
                }}
                title="List view with map"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-none border-0",
                  viewMode === "grid" && layoutMode === "cards" ? "bg-primary text-white" : "bg-background"
                )}
                onClick={() => {
                  onViewModeChange("grid");
                  onLayoutModeChange("cards");
                }}
                title="Grid view (full width)"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-none border-0",
                  viewMode === "grid" && layoutMode === "split" ? "bg-primary text-white" : "bg-background"
                )}
                onClick={() => {
                  onViewModeChange("grid");
                  onLayoutModeChange("split");
                }}
                title="Split view (Grid + Map)"
              >
                <Columns className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-none border-0",
                  layoutMode === "map" ? "bg-primary text-white" : "bg-background"
                )}
                onClick={() => onLayoutModeChange("map")}
                title="Map view"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* More Filters Dialog */}
      <MoreFiltersDialog
        open={moreFiltersOpen}
        onOpenChange={setMoreFiltersOpen}
        filters={advancedFilters}
        onFiltersChange={onAdvancedFiltersChange || (() => {})}
      />

      {/* Save Search Dialog */}
      <SaveSearchDialog
        open={saveSearchOpen}
        onOpenChange={setSaveSearchOpen}
        filters={filters}
        resultCount={totalCount}
      />
    </>
  );
}
