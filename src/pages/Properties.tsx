import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyPropertiesState, NoResultsState } from "@/components/ui/empty-state";
import { SkeletonPropertyCard, SkeletonTable } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type PropertyStatus = "new" | "contacted" | "appointment" | "offer_made" | "under_contract" | "closed" | "dead";

interface Property {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  arv: number | null;
  motivation_score: number | null;
  status: string | null;
  source: string | null;
  created_at: string | null;
}

function getScoreColor(score: number): { bg: string; text: string } {
  if (score >= 800) return { bg: "bg-score-hot/15", text: "text-score-hot" };
  if (score >= 600) return { bg: "bg-score-warm/15", text: "text-score-warm" };
  if (score >= 400) return { bg: "bg-score-moderate/15", text: "text-score-moderate" };
  if (score >= 200) return { bg: "bg-score-cool/15", text: "text-score-cool" };
  return { bg: "bg-score-cold/15", text: "text-score-cold" };
}

function getStatusVariant(status: string | null) {
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

function PropertyCard({ property, onClick }: { property: Property; onClick: () => void }) {
  const score = property.motivation_score || 0;
  const scoreColors = getScoreColor(score);
  const isHot = score >= 800;

  return (
    <Card
      variant="interactive"
      padding="none"
      className="overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Image Placeholder */}
      <div className="relative h-32 bg-gradient-to-br from-surface-secondary to-surface-tertiary">
        <div className="flex h-full items-center justify-center">
          <Building2 className="h-10 w-10 text-content-tertiary/50" />
        </div>
        {property.source && (
          <div className="absolute left-2 top-2">
            <Badge variant="secondary" size="sm" className="bg-white/90 backdrop-blur-sm">
              {property.source}
            </Badge>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge variant={getStatusVariant(property.status) as any} size="sm">
            {formatStatus(property.status)}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-body font-semibold text-content truncate">
          {property.address}
        </h3>
        {(property.city || property.state) && (
          <div className="flex items-center gap-1 text-small text-content-secondary mt-0.5">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {[property.city, property.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        <div className="h-px bg-border-subtle my-3" />

        <div className="flex items-center gap-4 text-small text-content-secondary">
          {property.beds && (
            <div className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              <span>{property.beds}</span>
            </div>
          )}
          {property.baths && (
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              <span>{property.baths}</span>
            </div>
          )}
          {property.sqft && (
            <div className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              <span>{property.sqft.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="h-px bg-border-subtle my-3" />

        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-small font-medium ${scoreColors.bg} ${scoreColors.text}`}>
            {isHot && <Flame className="h-3 w-3" />}
            <span>{score}</span>
          </div>
          {property.arv && (
            <div className="text-right text-small">
              <span className="text-content-secondary">ARV: </span>
              <span className="font-medium text-content">{formatCurrency(property.arv)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Properties() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");
  const [sortBy, setSortBy] = React.useState("newest");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, address, city, state, beds, baths, sqft, arv, motivation_score, status, source, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
  });

  const filteredProperties = React.useMemo(() => {
    let result = [...properties];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.address.toLowerCase().includes(query) ||
          p.city?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case "score-high":
        result.sort((a, b) => (b.motivation_score || 0) - (a.motivation_score || 0));
        break;
      case "score-low":
        result.sort((a, b) => (a.motivation_score || 0) - (b.motivation_score || 0));
        break;
      case "arv-high":
        result.sort((a, b) => (b.arv || 0) - (a.arv || 0));
        break;
      case "arv-low":
        result.sort((a, b) => (a.arv || 0) - (b.arv || 0));
        break;
      default:
        break;
    }

    return result;
  }, [properties, searchQuery, sortBy, statusFilter]);

  const isEmpty = !isLoading && properties.length === 0;
  const hasNoResults = !isLoading && properties.length > 0 && filteredProperties.length === 0;

  return (
    <AppLayout breadcrumbs={[{ label: "Properties" }]}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h1 font-bold text-content">Properties</h1>
          <p className="text-body text-content-secondary">
            {filteredProperties.length} properties in your pipeline
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
            onClick={() => navigate("/properties/new")}
          >
            Add Property
          </Button>
        </div>
      </div>

      {/* Filters */}
      {!isEmpty && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
            <Input
              placeholder="Search by address, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="offer_made">Offer Made</SelectItem>
                <SelectItem value="under_contract">Under Contract</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="dead">Dead</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="score-high">Score: High</SelectItem>
                <SelectItem value="score-low">Score: Low</SelectItem>
                <SelectItem value="arv-high">ARV: High</SelectItem>
                <SelectItem value="arv-low">ARV: Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border border-border rounded-small">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-2 ${viewMode === "cards" ? "bg-surface-secondary" : ""}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 ${viewMode === "table" ? "bg-surface-secondary" : ""}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
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
        <EmptyPropertiesState onAdd={() => navigate("/properties/new")} />
      ) : hasNoResults ? (
        <NoResultsState
          query={searchQuery}
          onClear={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
        />
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => navigate(`/properties/${property.id}`)}
            />
          ))}
        </div>
      ) : (
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-secondary">
                  <th className="text-left p-4 text-small font-medium text-content-secondary">Address</th>
                  <th className="text-left p-4 text-small font-medium text-content-secondary">Status</th>
                  <th className="text-left p-4 text-small font-medium text-content-secondary">Score</th>
                  <th className="text-left p-4 text-small font-medium text-content-secondary">ARV</th>
                  <th className="text-left p-4 text-small font-medium text-content-secondary">Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => (
                  <tr
                    key={property.id}
                    className="border-b border-border-subtle hover:bg-surface-secondary cursor-pointer transition-colors"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <td className="p-4">
                      <div className="font-medium text-content">{property.address}</div>
                      <div className="text-small text-content-secondary">
                        {[property.city, property.state].filter(Boolean).join(", ")}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusVariant(property.status) as any} size="sm">
                        {formatStatus(property.status)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-small font-medium ${getScoreColor(property.motivation_score || 0).bg} ${getScoreColor(property.motivation_score || 0).text}`}>
                        {(property.motivation_score || 0) >= 800 && <Flame className="h-3 w-3" />}
                        {property.motivation_score || 0}
                      </div>
                    </td>
                    <td className="p-4 tabular-nums">
                      {property.arv ? formatCurrency(property.arv) : "—"}
                    </td>
                    <td className="p-4 text-content-secondary">
                      {property.source || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppLayout>
  );
}
