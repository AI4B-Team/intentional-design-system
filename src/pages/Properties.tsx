import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyPropertiesState, NoResultsState } from "@/components/ui/empty-state";
import { SkeletonPropertyCard } from "@/components/ui/skeleton";
import { AddPropertyModal } from "@/components/properties/AddPropertyModal";
import { BulkOfferModal } from "@/components/properties/bulk-offer-modal";
import { BulkAIOutreachModal } from "@/components/properties/bulk-ai-outreach-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Upload,
  Search,
  Grid3X3,
  List,
  Building2,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Flame,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Megaphone,
  X,
  Send,
  Bot,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

interface Property {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  arv: number | null;
  mao_standard: number | null;
  motivation_score: number | null;
  status: string | null;
  source: string | null;
  property_type: string | null;
  owner_name: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "appointment", label: "Appointment" },
  { value: "offer_made", label: "Offer Made" },
  { value: "under_contract", label: "Under Contract" },
  { value: "closed", label: "Closed" },
  { value: "dead", label: "Dead" },
];

const propertyTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "sfh", label: "SFH" },
  { value: "duplex", label: "Duplex" },
  { value: "triplex", label: "Triplex" },
  { value: "quadplex", label: "Quadplex" },
  { value: "multi", label: "Multi-Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

const sourceOptions = [
  { value: "all", label: "All Sources" },
  { value: "d4d", label: "Driving for Dollars" },
  { value: "direct_mail", label: "Direct Mail" },
  { value: "cold_call", label: "Cold Call" },
  { value: "agent", label: "Agent" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "marketing", label: "Marketing" },
  { value: "referral", label: "Referral" },
];

const motivationOptions = [
  { value: "all", label: "All Scores" },
  { value: "hot", label: "Hot (800+)" },
  { value: "warm", label: "Warm (500-799)" },
  { value: "cold", label: "Cold (<500)" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "motivation_high", label: "Highest Motivation" },
  { value: "arv_high", label: "Highest ARV" },
  { value: "updated", label: "Recently Updated" },
];

function getScoreColor(score: number): { bg: string; text: string } {
  if (score >= 800) return { bg: "bg-destructive/15", text: "text-destructive" };
  if (score >= 500) return { bg: "bg-warning/15", text: "text-warning" };
  return { bg: "bg-muted", text: "text-muted-foreground" };
}

function getStatusVariant(status: string | null): "success" | "warning" | "info" | "error" | "secondary" {
  switch (status) {
    case "under_contract":
    case "closed":
      return "success";
    case "appointment":
    case "offer_made":
      return "warning";
    case "contacted":
      return "info";
    case "dead":
      return "error";
    default:
      return "secondary";
  }
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

function formatStatus(status: string | null): string {
  if (!status) return "New";
  return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function formatPropertyType(type: string | null): string {
  if (!type) return "";
  const typeMap: Record<string, string> = {
    sfh: "SFH",
    duplex: "Duplex",
    triplex: "Triplex",
    quadplex: "Quadplex",
    multi: "Multi",
    condo: "Condo",
    townhouse: "TH",
    land: "Land",
    commercial: "Comm",
  };
  return typeMap[type] || type;
}

function PropertyCard({ 
  property, 
  isSelected,
  onSelect,
  onClick,
  onView,
  onEdit,
  onArchive,
}: { 
  property: Property; 
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
  onView: () => void;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const score = property.motivation_score || 0;
  const scoreColors = getScoreColor(score);
  const isHot = score >= 800;
  const daysInPipeline = property.created_at
    ? differenceInDays(new Date(), new Date(property.created_at))
    : 0;
  const spread = property.arv && property.mao_standard 
    ? property.arv - property.mao_standard 
    : null;

  return (
    <Card
      variant="default"
      padding="none"
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        isSelected && "ring-2 ring-accent"
      )}
    >
      {/* Image Placeholder */}
      <div className="relative h-32 bg-gradient-to-br from-background-secondary to-background-tertiary cursor-pointer" onClick={onClick}>
        <div className="flex h-full items-center justify-center">
          <Building2 className="h-10 w-10 text-muted-foreground/30" />
        </div>
        
        {/* Checkbox */}
        <div 
          className="absolute left-2 top-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="h-5 w-5 bg-white border-2"
          />
        </div>

        {/* Source Badge */}
        {property.source && (
          <div className="absolute left-9 top-2">
            <Badge variant="secondary" size="sm" className="bg-white/90 backdrop-blur-sm text-tiny">
              {property.source}
            </Badge>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute right-2 top-2">
          <Badge variant={getStatusVariant(property.status)} size="sm">
            {formatStatus(property.status)}
          </Badge>
        </div>
        
        {/* Days in Pipeline */}
        <div className="absolute right-2 bottom-2">
          <span className="text-tiny bg-black/60 text-white px-2 py-0.5 rounded-full">
            {daysInPipeline}d
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
            <h3 className="text-body font-semibold text-foreground truncate">
              {property.address}
            </h3>
            {(property.city || property.state || property.zip) && (
              <div className="flex items-center gap-1 text-small text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {[property.city, property.state, property.zip].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
          
          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-background-secondary rounded-small transition-colors">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onArchive} className="text-destructive">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Property Type Badge */}
        {property.property_type && (
          <Badge variant="secondary" size="sm" className="mt-2">
            {formatPropertyType(property.property_type)}
          </Badge>
        )}

        <div className="h-px bg-border-subtle my-3" />

        {/* Beds/Baths/SqFt */}
        <div className="flex items-center gap-4 text-small text-muted-foreground">
          {property.beds !== null && (
            <div className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              <span>{property.beds}</span>
            </div>
          )}
          {property.baths !== null && (
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              <span>{property.baths}</span>
            </div>
          )}
          {property.sqft !== null && (
            <div className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              <span>{property.sqft.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="h-px bg-border-subtle my-3" />

        {/* Score and ARV */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-small font-medium",
            scoreColors.bg, scoreColors.text
          )}>
            {isHot && <Flame className="h-3 w-3" />}
            <span>{score}</span>
          </div>
          <div className="text-right text-small">
            {property.arv && (
              <div>
                <span className="text-muted-foreground">ARV: </span>
                <span className="font-medium text-foreground">{formatCurrency(property.arv)}</span>
              </div>
            )}
            {spread !== null && spread > 0 && (
              <div className="text-success text-tiny">
                Spread: {formatCurrency(spread)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="secondary"
        size="sm"
        icon={<ChevronLeft />}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      <span className="text-small text-muted-foreground px-3">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        icon={<ChevronRight />}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    </div>
  );
}

export default function Properties() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");
  const [sortBy, setSortBy] = React.useState("newest");
  const [statusFilter, setStatusFilter] = React.useState(searchParams.get("status") || "all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [sourceFilter, setSourceFilter] = React.useState("all");
  const [motivationFilter, setMotivationFilter] = React.useState("all");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isBulkOfferOpen, setIsBulkOfferOpen] = React.useState(false);
  const [isBulkAIOpen, setIsBulkAIOpen] = React.useState(false);
  const itemsPerPage = 25;

  // Fetch properties
  const { data: properties = [], isLoading, refetch } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, address, city, state, zip, beds, baths, sqft, arv, mao_standard, mao_aggressive, mao_conservative, motivation_score, status, source, property_type, owner_name, owner_email, owner_phone, owner_mailing_address, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Property & { mao_aggressive: number | null; mao_conservative: number | null; owner_email: string | null; owner_phone: string | null; owner_mailing_address: string | null })[];
    },
  });

  // Filter and sort
  const filteredProperties = React.useMemo(() => {
    let result = [...properties];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.address.toLowerCase().includes(query) ||
          p.city?.toLowerCase().includes(query) ||
          p.owner_name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((p) => p.property_type === typeFilter);
    }

    // Source filter
    if (sourceFilter !== "all") {
      result = result.filter((p) => p.source === sourceFilter);
    }

    // Motivation filter
    if (motivationFilter !== "all") {
      result = result.filter((p) => {
        const score = p.motivation_score || 0;
        switch (motivationFilter) {
          case "hot": return score >= 800;
          case "warm": return score >= 500 && score < 800;
          case "cold": return score < 500;
          default: return true;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case "motivation_high":
        result.sort((a, b) => (b.motivation_score || 0) - (a.motivation_score || 0));
        break;
      case "arv_high":
        result.sort((a, b) => (b.arv || 0) - (a.arv || 0));
        break;
      case "updated":
        result.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
        break;
      default:
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    return result;
  }, [properties, searchQuery, sortBy, statusFilter, typeFilter, sourceFilter, motivationFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection handlers
  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAllSelection = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedProperties.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSourceFilter("all");
    setMotivationFilter("all");
    setSearchParams({});
  };

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all" || sourceFilter !== "all" || motivationFilter !== "all" || searchQuery;

  const isEmpty = !isLoading && properties.length === 0;
  const hasNoResults = !isLoading && properties.length > 0 && filteredProperties.length === 0;
  const allSelected = paginatedProperties.length > 0 && paginatedProperties.every(p => selectedIds.has(p.id));

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h1 font-bold text-foreground">Properties</h1>
          <p className="text-body text-muted-foreground">
            {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} in your pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Upload />}>
            Import
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Property
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {!isEmpty && (
        <div className="space-y-3 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address, city, owner name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {propertyTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {sourceOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={motivationFilter} onValueChange={setMotivationFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Motivation" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {motivationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex border border-border rounded-small overflow-hidden">
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "px-3 py-2 transition-colors",
                  viewMode === "cards" ? "bg-background-secondary" : "hover:bg-background-secondary"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-3 py-2 transition-colors",
                  viewMode === "table" ? "bg-background-secondary" : "hover:bg-background-secondary"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} icon={<X className="h-4 w-4" />}>
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-accent/10 border border-accent/20 rounded-medium mb-4">
          <span className="text-small font-medium text-foreground">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Send className="h-4 w-4" />}
              onClick={() => setIsBulkOfferOpen(true)}
            >
              Send Offers
            </Button>
            <Button variant="secondary" size="sm">
              Change Status
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              icon={<Bot className="h-4 w-4" />}
              onClick={() => setIsBulkAIOpen(true)}
            >
              AI Outreach
            </Button>
            <Button variant="secondary" size="sm" icon={<Megaphone className="h-4 w-4" />}>
              Add to Campaign
            </Button>
            <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button variant="destructive" size="sm" icon={<Trash2 className="h-4 w-4" />}>
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPropertyCard key={i} />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyPropertiesState onAdd={() => setIsAddModalOpen(true)} />
      ) : hasNoResults ? (
        <NoResultsState query={searchQuery} onClear={clearFilters} />
      ) : viewMode === "cards" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isSelected={selectedIds.has(property.id)}
                onSelect={(checked) => toggleSelection(property.id, checked)}
                onClick={() => navigate(`/properties/${property.id}`)}
                onView={() => navigate(`/properties/${property.id}`)}
                onEdit={() => navigate(`/properties/${property.id}/edit`)}
                onArchive={() => {}}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <>
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle bg-background-secondary">
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleAllSelection}
                      />
                    </th>
                    <th className="text-left p-4 text-small font-medium text-muted-foreground">Address</th>
                    <th className="text-left p-4 text-small font-medium text-muted-foreground">City</th>
                    <th className="text-left p-4 text-small font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-small font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-small font-medium text-muted-foreground">Motivation</th>
                    <th className="text-left p-4 text-small font-medium text-muted-foreground">ARV</th>
                    <th className="text-left p-4 text-small font-medium text-muted-foreground">Spread</th>
                    <th className="text-left p-4 text-small font-medium text-muted-foreground">Source</th>
                    <th className="text-left p-4 text-small font-medium text-muted-foreground">Days</th>
                    <th className="text-left p-4 text-small font-medium text-muted-foreground w-12">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProperties.map((property) => {
                    const score = property.motivation_score || 0;
                    const scoreColors = getScoreColor(score);
                    const daysInPipeline = property.created_at
                      ? differenceInDays(new Date(), new Date(property.created_at))
                      : 0;
                    const spread = property.arv && property.mao_standard 
                      ? property.arv - property.mao_standard 
                      : null;

                    return (
                      <tr
                        key={property.id}
                        className={cn(
                          "border-b border-border-subtle hover:bg-background-secondary transition-colors",
                          selectedIds.has(property.id) && "bg-accent/5"
                        )}
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedIds.has(property.id)}
                            onCheckedChange={(checked) => toggleSelection(property.id, !!checked)}
                          />
                        </td>
                        <td 
                          className="p-4 cursor-pointer"
                          onClick={() => navigate(`/properties/${property.id}`)}
                        >
                          <span className="font-medium text-foreground">{property.address}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {[property.city, property.state].filter(Boolean).join(", ") || "—"}
                        </td>
                        <td className="p-4">
                          {property.property_type ? (
                            <Badge variant="secondary" size="sm">
                              {formatPropertyType(property.property_type)}
                            </Badge>
                          ) : "—"}
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusVariant(property.status)} size="sm">
                            {formatStatus(property.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-small font-medium",
                            scoreColors.bg, scoreColors.text
                          )}>
                            {score >= 800 && <Flame className="h-3 w-3" />}
                            {score}
                          </div>
                        </td>
                        <td className="p-4 tabular-nums">
                          {property.arv ? formatCurrency(property.arv) : "—"}
                        </td>
                        <td className="p-4 tabular-nums">
                          {spread !== null ? (
                            <span className={spread > 0 ? "text-success" : "text-muted-foreground"}>
                              {formatCurrency(spread)}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {property.source || "—"}
                        </td>
                        <td className="p-4 tabular-nums text-muted-foreground">
                          {daysInPipeline}d
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-background-tertiary rounded-small transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 bg-white">
                              <DropdownMenuItem onClick={() => navigate(`/properties/${property.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/properties/${property.id}/edit`)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Bulk Offer Modal */}
      <BulkOfferModal
        open={isBulkOfferOpen}
        onOpenChange={setIsBulkOfferOpen}
        properties={properties.filter(p => selectedIds.has(p.id)) as any}
        onComplete={() => {
          setSelectedIds(new Set());
          refetch();
        }}
      />
      <BulkAIOutreachModal
        open={isBulkAIOpen}
        onOpenChange={setIsBulkAIOpen}
        selectedPropertyIds={Array.from(selectedIds)}
      />
    </AppLayout>
  );
}
