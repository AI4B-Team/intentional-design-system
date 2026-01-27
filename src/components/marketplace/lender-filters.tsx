import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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
import { ChevronDown, X } from "lucide-react";

export interface LenderFilters {
  loanTypes: string[];
  minAmount: number;
  maxAmount: number;
  maxLTV: number;
  state: string;
  fundingSpeed: string[];
}

interface LenderFiltersProps {
  filters: LenderFilters;
  onChange: (filters: LenderFilters) => void;
  onApply: () => void;
  onClear: () => void;
  className?: string;
}

const loanTypeOptions = [
  { id: "fix-flip", label: "Fix & Flip" },
  { id: "dscr", label: "DSCR" },
  { id: "bridge", label: "Bridge" },
  { id: "construction", label: "Construction" },
  { id: "emd", label: "EMD" },
  { id: "transactional", label: "Transactional" },
];

const fundingSpeedOptions = [
  { id: "same-day", label: "Same Day" },
  { id: "1-3-days", label: "1-3 Days" },
  { id: "1-week", label: "1 Week" },
  { id: "2-weeks", label: "2 Weeks" },
];

const states = [
  "All States", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
  "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
  "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
  "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-body font-medium text-content hover:text-brand-accent transition-colors">
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-content-tertiary transition-transform",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function LenderFiltersPanel({
  filters,
  onChange,
  onApply,
  onClear,
  className,
}: LenderFiltersProps) {
  const updateFilter = <K extends keyof LenderFilters>(
    key: K,
    value: LenderFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (key: "loanTypes" | "fundingSpeed", item: string) => {
    const current = filters[key];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateFilter(key, updated);
  };

  const hasFilters =
    filters.loanTypes.length > 0 ||
    filters.fundingSpeed.length > 0 ||
    filters.state !== "All States" ||
    filters.minAmount > 10000 ||
    filters.maxAmount < 10000000 ||
    filters.maxLTV > 0;

  return (
    <Card variant="default" padding="md" className={cn("sticky top-24", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 font-medium text-content">Filters</h3>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-small text-brand-accent hover:underline flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </div>

      <div className="divide-y divide-border-subtle">
        {/* Loan Type */}
        <FilterSection title="Loan Type">
          <div className="space-y-2">
            {loanTypeOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={filters.loanTypes.includes(option.id)}
                  onCheckedChange={() => toggleArrayItem("loanTypes", option.id)}
                />
                <Label htmlFor={option.id} className="text-small text-content cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Loan Amount */}
        <FilterSection title="Loan Amount">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-small text-content-secondary">
              <span>${(filters.minAmount / 1000).toFixed(0)}K</span>
              <span>${(filters.maxAmount / 1000000).toFixed(1)}M</span>
            </div>
            <Slider
              value={[filters.minAmount, filters.maxAmount]}
              min={10000}
              max={10000000}
              step={10000}
              onValueChange={([min, max]) => {
                updateFilter("minAmount", min);
                updateFilter("maxAmount", max);
              }}
              className="[&_[role=slider]]:border-brand-accent [&_[role=slider]]:bg-white [&>span:first-child]:bg-surface-tertiary [&>span:first-child>span]:bg-brand-accent"
            />
          </div>
        </FilterSection>

        {/* Max LTV */}
        <FilterSection title="Max LTV">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-small">
              <span className="text-content-secondary">Up to</span>
              <span className="font-semibold text-brand-accent">{filters.maxLTV || 100}%</span>
            </div>
            <Slider
              value={[filters.maxLTV || 100]}
              min={50}
              max={100}
              step={5}
              onValueChange={([v]) => updateFilter("maxLTV", v)}
              className="[&_[role=slider]]:border-brand-accent [&_[role=slider]]:bg-white [&>span:first-child]:bg-surface-tertiary [&>span:first-child>span]:bg-brand-accent"
            />
          </div>
        </FilterSection>

        {/* State */}
        <FilterSection title="State">
          <Select value={filters.state} onValueChange={(v) => updateFilter("state", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-white">
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        {/* Funding Speed */}
        <FilterSection title="Funding Speed">
          <div className="space-y-2">
            {fundingSpeedOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`speed-${option.id}`}
                  checked={filters.fundingSpeed.includes(option.id)}
                  onCheckedChange={() => toggleArrayItem("fundingSpeed", option.id)}
                />
                <Label htmlFor={`speed-${option.id}`} className="text-small text-content cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Apply Button */}
      <div className="pt-4 mt-4 border-t border-border-subtle">
        <Button variant="primary" fullWidth onClick={onApply}>
          Apply Filters
        </Button>
      </div>
    </Card>
  );
}
