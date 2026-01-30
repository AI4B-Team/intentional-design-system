import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { ContactFilters, ContactStatus } from "@/hooks/useContacts";

interface ContactFiltersBarProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
}

export function ContactFiltersBar({ filters, onFiltersChange }: ContactFiltersBarProps) {
  const handleChange = <K extends keyof ContactFilters>(key: K, value: ContactFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex items-center gap-3 flex-nowrap">
      {/* Search */}
      <div className="relative w-[280px] flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
        <Input
          placeholder="Search name, company, email..."
          value={filters.search || ""}
          onChange={(e) => handleChange("search", e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={(v) => handleChange("status", v as ContactStatus | "all")}
      >
        <SelectTrigger className="w-[140px] flex-shrink-0">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="cold">Cold</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="responded">Responded</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Performance Filter */}
      <Select
        value={filters.performance || "all"}
        onValueChange={(v) => handleChange("performance", v as "all" | "top" | "new" | "verified")}
      >
        <SelectTrigger className="w-[160px] flex-shrink-0">
          <SelectValue placeholder="Performance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Performance</SelectItem>
          <SelectItem value="top">Top Performers (5+)</SelectItem>
          <SelectItem value="new">New (0 deals)</SelectItem>
          <SelectItem value="verified">Verified</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={filters.sortBy || "newest"}
        onValueChange={(v) => handleChange("sortBy", v as ContactFilters["sortBy"])}
      >
        <SelectTrigger className="w-[150px] flex-shrink-0">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="deals">Most Deals</SelectItem>
          <SelectItem value="profit">Highest Profit</SelectItem>
          <SelectItem value="last_contact">Last Contact</SelectItem>
          <SelectItem value="rating">Highest Rating</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
