import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Send,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MoreFiltersDialog, AdvancedFilters, defaultFilters } from "./more-filters-dialog";

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
}: MarketplaceFiltersProps) {
  const navigate = useNavigate();
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [bedsPopoverOpen, setBedsPopoverOpen] = useState(false);
  const [homeTypePopoverOpen, setHomeTypePopoverOpen] = useState(false);

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
      <div className="relative z-50 flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-border flex-shrink-0 overflow-x-auto">
        {/* Left aligned filters - uniform gap-3 for equal spacing */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Address Search */}
          <div className="relative flex-shrink-0">
            <Input
              type="text"
              placeholder="Address, City, County, State, or Zip"
              value={filters.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="h-10 w-[280px] bg-background text-sm pr-10 rounded-full border-border"
            />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

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
              <Button variant="outline" className={cn(filterButtonClass, "gap-1 justify-between font-normal")}>
                <span className="truncate">{getHomeTypeLabel()}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 bg-background">
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
              <Button variant="outline" className={cn(filterButtonClass, "gap-1 justify-between font-normal")}>
                Beds & Baths
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-background">
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
          >
            <Bookmark className="h-4 w-4" />
            Save Search
          </Button>
        </div>

        {/* Right aligned actions – Post Deal & Buy Box */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="outline"
            className="h-10 gap-2 px-4 text-sm whitespace-nowrap border-primary"
            onClick={() => navigate("/submit-deal")}
          >
            <Send className="h-4 w-4" />
            Post Deal
          </Button>
          <Button
            variant="outline"
            className="h-10 gap-2 px-4 text-sm whitespace-nowrap"
            onClick={() => navigate("/marketplace/buy-box")}
          >
            <Target className="h-4 w-4" />
            Buy Box
          </Button>
        </div>
      </div>

      {/* More Filters Dialog */}
      <MoreFiltersDialog
        open={moreFiltersOpen}
        onOpenChange={setMoreFiltersOpen}
        filters={advancedFilters}
        onFiltersChange={onAdvancedFiltersChange || (() => {})}
      />
    </>
  );
}
