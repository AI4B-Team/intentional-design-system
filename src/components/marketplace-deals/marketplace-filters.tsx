import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  SlidersHorizontal,
  Bookmark,
  Plus,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MarketplaceFiltersProps {
  filters: {
    address: string;
    leadType: string;
    homeType: string;
    priceMin: string;
    priceMax: string;
    bedsMin: string;
    bathsMin: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function MarketplaceFilters({ filters, onFiltersChange }: MarketplaceFiltersProps) {
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white border-b border-border overflow-x-auto">
      {/* Address Search */}
      <div className="relative min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Address, City, County, State, or Zip"
          value={filters.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Lead Type */}
      <Select value={filters.leadType} onValueChange={(v) => handleChange("leadType", v)}>
        <SelectTrigger className="w-[130px] h-10">
          <SelectValue placeholder="Lead Type" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="all">All Leads</SelectItem>
          <SelectItem value="motivated">Motivated</SelectItem>
          <SelectItem value="distressed">Distressed</SelectItem>
          <SelectItem value="absentee">Absentee</SelectItem>
          <SelectItem value="pre-foreclosure">Pre-Foreclosure</SelectItem>
          <SelectItem value="probate">Probate</SelectItem>
        </SelectContent>
      </Select>

      {/* Home Type */}
      <Select value={filters.homeType} onValueChange={(v) => handleChange("homeType", v)}>
        <SelectTrigger className="w-[130px] h-10">
          <SelectValue placeholder="Home Type" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="single family">Single Family</SelectItem>
          <SelectItem value="condo">Condo</SelectItem>
          <SelectItem value="townhouse">Townhouse</SelectItem>
          <SelectItem value="duplex">Duplex</SelectItem>
          <SelectItem value="mobile home">Mobile Home</SelectItem>
        </SelectContent>
      </Select>

      {/* Price */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 gap-1">
            Price
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-background" align="start">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Min Price</label>
              <Input
                type="number"
                placeholder="$0"
                value={filters.priceMin}
                onChange={(e) => handleChange("priceMin", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Price</label>
              <Input
                type="number"
                placeholder="Any"
                value={filters.priceMax}
                onChange={(e) => handleChange("priceMax", e.target.value)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Beds & Baths */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 gap-1">
            Beds & Baths
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-background" align="start">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Min Beds</label>
              <Select value={filters.bedsMin} onValueChange={(v) => handleChange("bedsMin", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Min Baths</label>
              <Select value={filters.bathsMin} onValueChange={(v) => handleChange("bathsMin", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* More Filters */}
      <Button variant="outline" className="h-10 gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        Filter
      </Button>

      {/* Save Search */}
      <Button variant="secondary" className="h-10 gap-2 bg-slate-800 text-white hover:bg-slate-700">
        <Bookmark className="h-4 w-4" />
        Save Search
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Post A Deal */}
      <Button 
        variant="primary" 
        className="h-10 gap-2"
        onClick={() => navigate("/submit-deal")}
      >
        <Plus className="h-4 w-4" />
        Post A Deal
      </Button>

      {/* Buy Box */}
      <Button variant="outline" className="h-10 gap-2">
        <Sparkles className="h-4 w-4" />
        Buy Box
      </Button>
    </div>
  );
}
