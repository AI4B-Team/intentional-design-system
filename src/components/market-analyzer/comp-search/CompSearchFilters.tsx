import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MapPin, Search, ChevronDown, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompFilters } from "./types";
import { defaultFilters } from "./types";

interface CompSearchFiltersProps {
  filters: CompFilters;
  onFiltersChange: (filters: CompFilters) => void;
  onSearch: () => void;
  isSearching: boolean;
}

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const propertyTypeOptions = [
  { value: "sfh", label: "Single Family" },
  { value: "condo", label: "Condo/Townhouse" },
  { value: "multi", label: "Multi-Family" },
];

const saleTypeOptions = [
  { value: "standard", label: "Standard" },
  { value: "reo", label: "REO/Bank Owned" },
  { value: "short_sale", label: "Short Sale" },
  { value: "auction", label: "Auction" },
];

export function CompSearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  isSearching,
}: CompSearchFiltersProps) {
  const [criteriaOpen, setCriteriaOpen] = React.useState(true);

  const updateFilter = <K extends keyof CompFilters>(
    key: K,
    value: CompFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (key: "propertyTypes" | "saleTypes", value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const resetFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const canSearch = filters.address.trim() || (filters.city && filters.state);

  return (
    <Card className="p-4 space-y-4">
      {/* Subject Property */}
      <div>
        <Label className="text-small font-medium">Subject Property</Label>
        <div className="relative mt-1.5">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Enter property address..."
            value={filters.address}
            onChange={(e) => updateFilter("address", e.target.value)}
          />
        </div>
      </div>

      {/* OR search by area */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-2 text-tiny text-muted-foreground">
            OR search area
          </span>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-3">
        <div>
          <Label className="text-tiny">City</Label>
          <Input
            className="mt-1"
            placeholder="City"
            value={filters.city}
            onChange={(e) => updateFilter("city", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-tiny">State</Label>
          <Select
            value={filters.state}
            onValueChange={(v) => updateFilter("state", v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-tiny">Zip</Label>
          <Input
            className="mt-1"
            placeholder="Zip"
            value={filters.zip}
            onChange={(e) => updateFilter("zip", e.target.value)}
          />
        </div>
      </div>

      {/* Criteria */}
      <Collapsible open={criteriaOpen} onOpenChange={setCriteriaOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <span className="text-small font-medium">Search Criteria</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              criteriaOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          {/* Radius slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-tiny">Distance</Label>
              <span className="text-small font-medium">{filters.radius} mi</span>
            </div>
            <Slider
              value={[filters.radius]}
              onValueChange={([v]) => updateFilter("radius", v)}
              min={0.25}
              max={5}
              step={0.25}
              className="w-full"
            />
            <div className="flex justify-between text-tiny text-muted-foreground mt-1">
              <span>0.25 mi</span>
              <span>5 mi</span>
            </div>
          </div>

          {/* Property types */}
          <div>
            <Label className="text-tiny">Property Type</Label>
            <div className="space-y-2 mt-2">
              {propertyTypeOptions.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`prop-${opt.value}`}
                    checked={filters.propertyTypes.includes(opt.value)}
                    onCheckedChange={() => toggleArrayValue("propertyTypes", opt.value)}
                  />
                  <label htmlFor={`prop-${opt.value}`} className="text-small cursor-pointer">
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Beds/Baths */}
          <div className="grid gap-3 grid-cols-2">
            <div>
              <Label className="text-tiny">Beds Min</Label>
              <Input
                type="number"
                className="mt-1"
                placeholder="Any"
                value={filters.bedsMin ?? ""}
                onChange={(e) =>
                  updateFilter("bedsMin", e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </div>
            <div>
              <Label className="text-tiny">Beds Max</Label>
              <Input
                type="number"
                className="mt-1"
                placeholder="Any"
                value={filters.bedsMax ?? ""}
                onChange={(e) =>
                  updateFilter("bedsMax", e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </div>
          </div>
          <div className="grid gap-3 grid-cols-2">
            <div>
              <Label className="text-tiny">Baths Min</Label>
              <Input
                type="number"
                step="0.5"
                className="mt-1"
                placeholder="Any"
                value={filters.bathsMin ?? ""}
                onChange={(e) =>
                  updateFilter("bathsMin", e.target.value ? parseFloat(e.target.value) : null)
                }
              />
            </div>
            <div>
              <Label className="text-tiny">Baths Max</Label>
              <Input
                type="number"
                step="0.5"
                className="mt-1"
                placeholder="Any"
                value={filters.bathsMax ?? ""}
                onChange={(e) =>
                  updateFilter("bathsMax", e.target.value ? parseFloat(e.target.value) : null)
                }
              />
            </div>
          </div>

          {/* SqFt */}
          <div className="grid gap-3 grid-cols-2">
            <div>
              <Label className="text-tiny">SqFt Min</Label>
              <Input
                type="number"
                className="mt-1"
                placeholder="Any"
                value={filters.sqftMin ?? ""}
                onChange={(e) =>
                  updateFilter("sqftMin", e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </div>
            <div>
              <Label className="text-tiny">SqFt Max</Label>
              <Input
                type="number"
                className="mt-1"
                placeholder="Any"
                value={filters.sqftMax ?? ""}
                onChange={(e) =>
                  updateFilter("sqftMax", e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </div>
          </div>

          {/* Year Built */}
          <div className="grid gap-3 grid-cols-2">
            <div>
              <Label className="text-tiny">Year Min</Label>
              <Input
                type="number"
                className="mt-1"
                placeholder="Any"
                value={filters.yearBuiltMin ?? ""}
                onChange={(e) =>
                  updateFilter("yearBuiltMin", e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </div>
            <div>
              <Label className="text-tiny">Year Max</Label>
              <Input
                type="number"
                className="mt-1"
                placeholder="Any"
                value={filters.yearBuiltMax ?? ""}
                onChange={(e) =>
                  updateFilter("yearBuiltMax", e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </div>
          </div>

          {/* Sold within */}
          <div>
            <Label className="text-tiny">Sold Within</Label>
            <Select
              value={String(filters.soldWithinMonths)}
              onValueChange={(v) => updateFilter("soldWithinMonths", parseInt(v))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sale types */}
          <div>
            <Label className="text-tiny">Sale Type</Label>
            <div className="space-y-2 mt-2">
              {saleTypeOptions.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`sale-${opt.value}`}
                    checked={filters.saleTypes.includes(opt.value)}
                    onCheckedChange={() => toggleArrayValue("saleTypes", opt.value)}
                  />
                  <label htmlFor={`sale-${opt.value}`} className="text-small cursor-pointer">
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={resetFilters}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Reset
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={onSearch}
          disabled={!canSearch || isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-1.5" />
          )}
          Search
        </Button>
      </div>
    </Card>
  );
}
