import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import {
  Home,
  Building2,
  Building,
  Trees,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdvancedFilters {
  // Property Structure
  propertyTypes: string[];
  yearBuiltMin: string;
  yearBuiltMax: string;
  storiesMin: string;
  storiesMax: string;
  sqftMin: string;
  sqftMax: string;
  lotSizeMin: string;
  lotSizeMax: string;
  occupancyStatus: string;
  
  // Owner Filters
  absenteeOwner: string;
  absenteeLocation: string;
  ownerTypes: string[];
  cashBuyer: string;
  yearsOwnershipMin: string;
  yearsOwnershipMax: string;
  taxDelinquentYearMin: string;
  taxDelinquentYearMax: string;
  propertiesOwnedMin: string;
  propertiesOwnedMax: string;
  portfolioValueMin: string;
  portfolioValueMax: string;
  
  // Financial Filters
  estimatedEquityMin: string;
  estimatedEquityMax: string;
  estimatedValueMin: string;
  estimatedValueMax: string;
  
  // Foreclosure Filters
  foreclosureStatus: string;
  noticeType: string;
  auctionDateStart: string;
  auctionDateEnd: string;
  openingBidMin: string;
  openingBidMax: string;
  
  // MLS Filters
  mlsStatus: string;
  daysOnMarketMin: string;
  daysOnMarketMax: string;
  listingPriceMin: string;
  listingPriceMax: string;
  mlsKeywords: string[];
  customKeywords: string;
  // Status & Listing Type
  lastStatusUpdates: string[];
  listingTypes: string[];
  
  // Amenities
  amenities: string[];
}

const defaultFilters: AdvancedFilters = {
  propertyTypes: [],
  yearBuiltMin: "",
  yearBuiltMax: "",
  storiesMin: "",
  storiesMax: "",
  sqftMin: "",
  sqftMax: "",
  lotSizeMin: "",
  lotSizeMax: "",
  occupancyStatus: "any",
  absenteeOwner: "any",
  absenteeLocation: "any",
  ownerTypes: [],
  cashBuyer: "any",
  yearsOwnershipMin: "",
  yearsOwnershipMax: "",
  taxDelinquentYearMin: "",
  taxDelinquentYearMax: "",
  propertiesOwnedMin: "",
  propertiesOwnedMax: "",
  portfolioValueMin: "",
  portfolioValueMax: "",
  estimatedEquityMin: "",
  estimatedEquityMax: "",
  estimatedValueMin: "",
  estimatedValueMax: "",
  foreclosureStatus: "",
  noticeType: "",
  auctionDateStart: "",
  auctionDateEnd: "",
  openingBidMin: "",
  openingBidMax: "",
  mlsStatus: "",
  daysOnMarketMin: "",
  daysOnMarketMax: "",
  listingPriceMin: "",
  listingPriceMax: "",
  mlsKeywords: [],
  customKeywords: "",
  lastStatusUpdates: [],
  listingTypes: [],
  amenities: [],
};

interface MoreFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isActive?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = false, isActive = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-border">
      <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left">
        <span className={cn("font-semibold", isActive ? "text-primary" : "text-foreground")}>
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
        ) : (
          <ChevronDown className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function MoreFiltersDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: MoreFiltersDialogProps) {
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

  const handleReset = () => {
    setLocalFilters(defaultFilters);
  };

  const handleSave = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const updateFilter = <K extends keyof AdvancedFilters>(key: K, value: AdvancedFilters[K]) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: keyof AdvancedFilters, value: string) => {
    const currentArray = localFilters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as AdvancedFilters[typeof key]);
  };

  const propertyTypeOptions = [
    { id: "houses", label: "Houses", icon: Home },
    { id: "mobiles", label: "Mobiles", icon: Warehouse },
    { id: "condos", label: "Condos", icon: Building },
    { id: "multi", label: "Multi", icon: Building2 },
    { id: "land", label: "Land", icon: Trees },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[85vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold">More Filters</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6">
          {/* Property Structure */}
          <CollapsibleSection title="Property Structure" defaultOpen>
            <div className="space-y-6">
              {/* Property Type Icons */}
              <div className="grid grid-cols-5 gap-3">
                {propertyTypeOptions.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleArrayValue("propertyTypes", id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors",
                      localFilters.propertyTypes.includes(id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>

              {/* Year Built & Stories */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Year Built</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="1800"
                      value={localFilters.yearBuiltMin}
                      onChange={(e) => updateFilter("yearBuiltMin", e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      placeholder="2025"
                      value={localFilters.yearBuiltMax}
                      onChange={(e) => updateFilter("yearBuiltMax", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Stories</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Min"
                      value={localFilters.storiesMin}
                      onChange={(e) => updateFilter("storiesMin", e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      placeholder="Max"
                      value={localFilters.storiesMax}
                      onChange={(e) => updateFilter("storiesMax", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Building Size & Lot Size */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Building Size (Sq. Ft.)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Min"
                      value={localFilters.sqftMin}
                      onChange={(e) => updateFilter("sqftMin", e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      placeholder="Max"
                      value={localFilters.sqftMax}
                      onChange={(e) => updateFilter("sqftMax", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Lot Size (Sq. Ft.)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Min"
                      value={localFilters.lotSizeMin}
                      onChange={(e) => updateFilter("lotSizeMin", e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      placeholder="Max"
                      value={localFilters.lotSizeMax}
                      onChange={(e) => updateFilter("lotSizeMax", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Occupancy Status */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Occupancy Status</Label>
                <RadioGroup
                  value={localFilters.occupancyStatus}
                  onValueChange={(v) => updateFilter("occupancyStatus", v)}
                  className="flex gap-6"
                >
                  {["any", "occupied", "vacant"].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <RadioGroupItem value={status} id={`occupancy-${status}`} />
                      <Label htmlFor={`occupancy-${status}`} className="capitalize cursor-pointer">
                        {status}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </CollapsibleSection>

          {/* Owner Filters */}
          <CollapsibleSection title="Owner Filters">
            <div className="space-y-6">
              {/* Radio groups row */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Absentee Owner?</Label>
                  <RadioGroup
                    value={localFilters.absenteeOwner}
                    onValueChange={(v) => updateFilter("absenteeOwner", v)}
                    className="space-y-1"
                  >
                    {["any", "yes", "no"].map((val) => (
                      <div key={val} className="flex items-center space-x-2">
                        <RadioGroupItem value={val} id={`absentee-${val}`} />
                        <Label htmlFor={`absentee-${val}`} className="capitalize cursor-pointer text-sm">
                          {val === "yes" ? "Yes" : val === "no" ? "No" : "Any"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Absentee Location</Label>
                  <RadioGroup
                    value={localFilters.absenteeLocation}
                    onValueChange={(v) => updateFilter("absenteeLocation", v)}
                    className="space-y-1"
                  >
                    {[
                      { value: "any", label: "Any" },
                      { value: "in-state", label: "In-State" },
                      { value: "out-of-state", label: "Out-of-State" },
                    ].map(({ value, label }) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`location-${value}`} />
                        <Label htmlFor={`location-${value}`} className="cursor-pointer text-sm">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Owner Type</Label>
                  <div className="space-y-1">
                    {["Individual", "Business", "Bank or Trust"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`owner-${type}`}
                          checked={localFilters.ownerTypes.includes(type)}
                          onCheckedChange={() => toggleArrayValue("ownerTypes", type)}
                        />
                        <Label htmlFor={`owner-${type}`} className="cursor-pointer text-sm">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Cash Buyer?</Label>
                  <RadioGroup
                    value={localFilters.cashBuyer}
                    onValueChange={(v) => updateFilter("cashBuyer", v)}
                    className="space-y-1"
                  >
                    {["any", "yes", "no"].map((val) => (
                      <div key={val} className="flex items-center space-x-2">
                        <RadioGroupItem value={val} id={`cash-${val}`} />
                        <Label htmlFor={`cash-${val}`} className="capitalize cursor-pointer text-sm">
                          {val === "yes" ? "Yes" : val === "no" ? "No" : "Any"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Range inputs */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Years of Ownership</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Min"
                      value={localFilters.yearsOwnershipMin}
                      onChange={(e) => updateFilter("yearsOwnershipMin", e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      placeholder="Max"
                      value={localFilters.yearsOwnershipMax}
                      onChange={(e) => updateFilter("yearsOwnershipMax", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Tax Delinquent Year (YYYY)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Min"
                      value={localFilters.taxDelinquentYearMin}
                      onChange={(e) => updateFilter("taxDelinquentYearMin", e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      placeholder="Max"
                      value={localFilters.taxDelinquentYearMax}
                      onChange={(e) => updateFilter("taxDelinquentYearMax", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Properties Owned by Owner</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Min"
                      value={localFilters.propertiesOwnedMin}
                      onChange={(e) => updateFilter("propertiesOwnedMin", e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      placeholder="Max"
                      value={localFilters.propertiesOwnedMax}
                      onChange={(e) => updateFilter("propertiesOwnedMax", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Owner's Portfolio Value</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="$ Min"
                      value={localFilters.portfolioValueMin}
                      onChange={(e) => updateFilter("portfolioValueMin", e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      placeholder="$ Max"
                      value={localFilters.portfolioValueMax}
                      onChange={(e) => updateFilter("portfolioValueMax", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Financial Filters */}
          <CollapsibleSection title="Financial Filters">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Estimated Equity</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="$ Min"
                    value={localFilters.estimatedEquityMin}
                    onChange={(e) => updateFilter("estimatedEquityMin", e.target.value)}
                    className="bg-background"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    placeholder="$ Max"
                    value={localFilters.estimatedEquityMax}
                    onChange={(e) => updateFilter("estimatedEquityMax", e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Estimated Value</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="$ Min"
                    value={localFilters.estimatedValueMin}
                    onChange={(e) => updateFilter("estimatedValueMin", e.target.value)}
                    className="bg-background"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    placeholder="$ Max"
                    value={localFilters.estimatedValueMax}
                    onChange={(e) => updateFilter("estimatedValueMax", e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Foreclosure Filters */}
          <CollapsibleSection title="Foreclosure Filters">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Foreclosure Status</Label>
                  <Select
                    value={localFilters.foreclosureStatus}
                    onValueChange={(v) => updateFilter("foreclosureStatus", v)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="pre-foreclosure">Pre-Foreclosure</SelectItem>
                      <SelectItem value="auction">Auction</SelectItem>
                      <SelectItem value="bank-owned">Bank Owned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Notice Type</Label>
                  <Select
                    value={localFilters.noticeType}
                    onValueChange={(v) => updateFilter("noticeType", v)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="lis-pendens">Lis Pendens</SelectItem>
                      <SelectItem value="notice-of-default">Notice of Default</SelectItem>
                      <SelectItem value="notice-of-sale">Notice of Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Auction Date</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={localFilters.auctionDateStart}
                      onChange={(e) => updateFilter("auctionDateStart", e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="date"
                      value={localFilters.auctionDateEnd}
                      onChange={(e) => updateFilter("auctionDateEnd", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Opening Bid</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="$ Min"
                      value={localFilters.openingBidMin}
                      onChange={(e) => updateFilter("openingBidMin", e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      placeholder="$ Max"
                      value={localFilters.openingBidMax}
                      onChange={(e) => updateFilter("openingBidMax", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* MLS Filters */}
          <CollapsibleSection title="MLS Filters">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">MLS Status</Label>
                  <Select
                    value={localFilters.mlsStatus}
                    onValueChange={(v) => updateFilter("mlsStatus", v)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Days on Market</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Min"
                      value={localFilters.daysOnMarketMin}
                      onChange={(e) => updateFilter("daysOnMarketMin", e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      placeholder="Max"
                      value={localFilters.daysOnMarketMax}
                      onChange={(e) => updateFilter("daysOnMarketMax", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Listing Price</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="$ Min"
                    value={localFilters.listingPriceMin}
                    onChange={(e) => updateFilter("listingPriceMin", e.target.value)}
                    className="bg-background"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    placeholder="$ Max"
                    value={localFilters.listingPriceMax}
                    onChange={(e) => updateFilter("listingPriceMax", e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">MLS Keywords</Label>
                <div className="flex flex-wrap gap-4">
                  {["Investor-Owned", "Creative Financing", "Motivated Seller", "Fixer Upper"].map((keyword) => (
                    <div key={keyword} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mls-${keyword}`}
                        checked={localFilters.mlsKeywords.includes(keyword)}
                        onCheckedChange={() => toggleArrayValue("mlsKeywords", keyword)}
                      />
                      <Label htmlFor={`mls-${keyword}`} className="cursor-pointer text-sm">
                        {keyword}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <Input
                    placeholder="Add custom keywords (comma-separated)"
                    value={localFilters.customKeywords}
                    onChange={(e) => updateFilter("customKeywords", e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter additional keywords separated by commas (e.g., "distressed, rehab, flip")
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Status & Listing Type */}
          <CollapsibleSection title="Status & Listing Type">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Last Status Update</Label>
                <div className="space-y-2">
                  {["New Listing", "Back on Market", "Price Change"].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={localFilters.lastStatusUpdates.includes(status)}
                        onCheckedChange={() => toggleArrayValue("lastStatusUpdates", status)}
                      />
                      <Label htmlFor={`status-${status}`} className="cursor-pointer text-sm">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Listing Type</Label>
                <div className="space-y-2">
                  {["Standard", "Bank Owned", "Short Sale"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`listing-${type}`}
                        checked={localFilters.listingTypes.includes(type)}
                        onCheckedChange={() => toggleArrayValue("listingTypes", type)}
                      />
                      <Label htmlFor={`listing-${type}`} className="cursor-pointer text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Amenities */}
          <CollapsibleSection title="Amenities">
            <div className="grid grid-cols-3 gap-4">
              {[
                "Must have Garage",
                "Has Basement",
                "Single-story only",
                "Must have A/C",
                "Must have Pool",
                "Waterfront",
              ].map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={localFilters.amenities.includes(amenity)}
                    onCheckedChange={() => toggleArrayValue("amenities", amenity)}
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="cursor-pointer text-sm">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border flex justify-between">
          <Button variant="ghost" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset All Filters
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Save & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { defaultFilters };
