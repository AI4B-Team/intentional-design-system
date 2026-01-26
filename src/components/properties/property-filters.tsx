import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LayoutGrid, List } from "lucide-react";

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
}

interface PropertyFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "cards" | "table";
  onViewModeChange: (mode: "cards" | "table") => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  activeFilters: ActiveFilter[];
  onRemoveFilter: (id: string) => void;
  onClearFilters: () => void;
  onOpenFilters?: () => void;
  className?: string;
}

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "score-high", label: "Highest Score" },
  { value: "score-low", label: "Lowest Score" },
  { value: "price-high", label: "Highest Price" },
  { value: "price-low", label: "Lowest Price" },
];

export function PropertyFilters({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  activeFilters,
  onRemoveFilter,
  onClearFilters,
  onOpenFilters,
  className,
}: PropertyFiltersProps) {
  const currentSort = sortOptions.find((s) => s.value === sortBy);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-tertiary" />
          <input
            type="search"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex h-9 w-full rounded-small border-0 bg-surface-secondary pl-10 pr-3 text-body transition-all duration-150 placeholder:text-content-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/20 focus-visible:bg-white"
          />
        </div>

        {/* Filter Button */}
        <Button
          variant="secondary"
          size="sm"
          icon={<Filter />}
          onClick={onOpenFilters}
          className="border-0 bg-surface-secondary hover:bg-surface-tertiary"
        >
          Filters
          {activeFilters.length > 0 && (
            <Badge variant="default" size="sm" className="ml-1 bg-brand-accent text-white">
              {activeFilters.length}
            </Badge>
          )}
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-content-secondary"
            >
              Sort: {currentSort?.label}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={cn(
                  sortBy === option.value && "bg-surface-secondary font-medium"
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <SegmentedControl
          value={viewMode}
          onChange={(v) => onViewModeChange(v as "cards" | "table")}
          options={[
            { value: "cards", label: "", icon: <LayoutGrid className="h-4 w-4" /> },
            { value: "table", label: "", icon: <List className="h-4 w-4" /> },
          ]}
        />
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-small text-content-secondary">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              size="sm"
              className="gap-1 pr-1"
            >
              <span className="text-content-tertiary">{filter.label}:</span>
              <span>{filter.value}</span>
              <button
                onClick={() => onRemoveFilter(filter.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-surface-tertiary transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={onClearFilters}
            className="text-small text-brand-accent hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
