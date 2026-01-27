import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Search,
  Building2,
  Clock,
  Percent,
  TrendingUp,
  MapPin,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Star,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketplaceLenders, type MarketplaceLender } from "@/hooks/useCapital";

const lenderTypeLabels: Record<string, string> = {
  hard_money: "Hard Money",
  dscr: "DSCR",
  private: "Private",
  transactional: "Transactional",
  emd: "EMD",
};

const lenderTypeColors: Record<string, string> = {
  hard_money: "bg-warning/10 text-warning",
  dscr: "bg-info/10 text-info",
  private: "bg-brand/10 text-brand",
  transactional: "bg-success/10 text-success",
  emd: "bg-brand-accent/10 text-brand-accent",
};

const propertyTypes = ["SFH", "Multi", "Commercial", "Land"];
const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function LenderCard({ lender, onViewDetails }: { lender: MarketplaceLender; onViewDetails: () => void }) {
  const navigate = useNavigate();

  return (
    <Card variant="interactive" padding="md" className="group">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-14 w-14 rounded-medium bg-gradient-to-br from-brand/20 to-brand-accent/20 flex items-center justify-center flex-shrink-0">
          {lender.logo_url ? (
            <img src={lender.logo_url} alt={lender.name} className="h-10 w-10 object-contain" />
          ) : (
            <span className="text-h2 font-bold text-brand">{lender.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-body font-semibold text-content truncate">{lender.name}</h3>
            <Badge className={cn("capitalize", lenderTypeColors[lender.lender_type])} size="sm">
              {lenderTypeLabels[lender.lender_type] || lender.lender_type}
            </Badge>
          </div>
          {lender.company && <p className="text-small text-content-secondary">{lender.company}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 border-y border-border-subtle mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-tiny text-content-tertiary mb-1">
            <Percent className="h-3 w-3" />
            Rate
          </div>
          <p className="text-small font-semibold text-content">
            {lender.rate_range_min && lender.rate_range_max
              ? `${lender.rate_range_min}% - ${lender.rate_range_max}%`
              : "—"}
          </p>
        </div>
        <div className="text-center border-x border-border-subtle">
          <div className="flex items-center justify-center gap-1 text-tiny text-content-tertiary mb-1">
            <TrendingUp className="h-3 w-3" />
            Max LTV
          </div>
          <p className="text-small font-semibold text-content">{lender.max_ltv ? `${lender.max_ltv}%` : "—"}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-tiny text-content-tertiary mb-1">
            <Clock className="h-3 w-3" />
            Funding
          </div>
          <p className="text-small font-semibold text-content">
            {lender.typical_funding_days ? `${lender.typical_funding_days}d` : "—"}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-small">
          <span className="text-content-tertiary">Loan Range</span>
          <span className="font-medium text-content">
            {formatCurrency(lender.min_loan_amount)} - {formatCurrency(lender.max_loan_amount)}
          </span>
        </div>
        {lender.states_served && lender.states_served.length > 0 && (
          <div className="flex items-center gap-2 text-small">
            <MapPin className="h-3.5 w-3.5 text-content-tertiary" />
            <span className="text-content-secondary truncate">
              {lender.states_served.includes("nationwide")
                ? "Nationwide"
                : lender.states_served.slice(0, 5).join(", ") +
                  (lender.states_served.length > 5 ? ` +${lender.states_served.length - 5}` : "")}
            </span>
          </div>
        )}
      </div>

      {lender.description && (
        <p className="text-small text-content-secondary line-clamp-2 mb-4">{lender.description}</p>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={onViewDetails}>
          View Details
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          icon={<ExternalLink />}
          iconPosition="right"
          onClick={() => navigate("/capital/request/new")}
        >
          Request Quote
        </Button>
      </div>
    </Card>
  );
}

function LenderDetailModal({ lender, open, onOpenChange }: { lender: MarketplaceLender | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();

  if (!lender) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-medium bg-gradient-to-br from-brand/20 to-brand-accent/20 flex items-center justify-center flex-shrink-0">
              {lender.logo_url ? (
                <img src={lender.logo_url} alt={lender.name} className="h-12 w-12 object-contain" />
              ) : (
                <span className="text-h1 font-bold text-brand">{lender.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <DialogTitle className="text-h2 font-bold">{lender.name}</DialogTitle>
              {lender.company && <p className="text-body text-content-secondary">{lender.company}</p>}
              <Badge className={cn("capitalize mt-2", lenderTypeColors[lender.lender_type])}>
                {lenderTypeLabels[lender.lender_type] || lender.lender_type}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Key Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-surface-secondary rounded-medium">
              <p className="text-h3 font-bold text-brand tabular-nums">
                {lender.rate_range_min}% - {lender.rate_range_max}%
              </p>
              <p className="text-tiny text-content-tertiary">Interest Rate</p>
            </div>
            <div className="text-center p-3 bg-surface-secondary rounded-medium">
              <p className="text-h3 font-bold text-success tabular-nums">{lender.max_ltv}%</p>
              <p className="text-tiny text-content-tertiary">Max LTV</p>
            </div>
            <div className="text-center p-3 bg-surface-secondary rounded-medium">
              <p className="text-h3 font-bold text-warning tabular-nums">
                {lender.points_range_min} - {lender.points_range_max}
              </p>
              <p className="text-tiny text-content-tertiary">Points</p>
            </div>
            <div className="text-center p-3 bg-surface-secondary rounded-medium">
              <p className="text-h3 font-bold text-info tabular-nums">{lender.typical_funding_days}d</p>
              <p className="text-tiny text-content-tertiary">Funding Time</p>
            </div>
          </div>

          {/* Loan Details */}
          <Card variant="default" padding="md">
            <h3 className="text-body font-semibold text-content mb-4">Loan Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-small text-content-secondary">Loan Amount</span>
                  <span className="text-small font-medium text-content">
                    {formatCurrency(lender.min_loan_amount)} - {formatCurrency(lender.max_loan_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-small text-content-secondary">Max LTV</span>
                  <span className="text-small font-medium text-content">{lender.max_ltv}%</span>
                </div>
                {lender.max_arv_ltv && (
                  <div className="flex justify-between">
                    <span className="text-small text-content-secondary">Max ARV LTV</span>
                    <span className="text-small font-medium text-content">{lender.max_arv_ltv}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-small text-content-secondary">Min Credit Score</span>
                  <span className="text-small font-medium text-content">{lender.min_credit_score || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-small text-content-secondary">Points</span>
                  <span className="text-small font-medium text-content">
                    {lender.points_range_min} - {lender.points_range_max}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-small text-content-secondary">Prepayment Penalty</span>
                  {lender.prepayment_penalty ? (
                    <Badge variant="secondary" size="sm" className="bg-warning/10 text-warning">Yes</Badge>
                  ) : (
                    <Badge variant="secondary" size="sm" className="bg-success/10 text-success">No</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Coverage */}
          <Card variant="default" padding="md">
            <h3 className="text-body font-semibold text-content mb-4">Coverage</h3>
            <div className="space-y-4">
              <div>
                <p className="text-small text-content-secondary mb-2">Property Types</p>
                <div className="flex flex-wrap gap-2">
                  {lender.property_types.map((type) => (
                    <Badge key={type} variant="secondary" size="sm">{type}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-small text-content-secondary mb-2">Loan Purposes</p>
                <div className="flex flex-wrap gap-2">
                  {lender.loan_purposes.map((purpose) => (
                    <Badge key={purpose} variant="secondary" size="sm" className="capitalize">
                      {purpose.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-small text-content-secondary mb-2">States Served</p>
                <p className="text-small text-content">
                  {lender.states_served.includes("nationwide")
                    ? "Nationwide (All 50 States)"
                    : lender.states_served.join(", ")}
                </p>
              </div>
            </div>
          </Card>

          {/* Description */}
          {lender.description && (
            <Card variant="default" padding="md">
              <h3 className="text-body font-semibold text-content mb-2">About</h3>
              <p className="text-small text-content-secondary">{lender.description}</p>
            </Card>
          )}

          {/* Contact */}
          <Card variant="default" padding="md">
            <h3 className="text-body font-semibold text-content mb-4">Contact</h3>
            <div className="space-y-3">
              {lender.contact_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-content-tertiary" />
                  <a href={`mailto:${lender.contact_email}`} className="text-small text-brand hover:underline">
                    {lender.contact_email}
                  </a>
                </div>
              )}
              {lender.contact_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-content-tertiary" />
                  <a href={`tel:${lender.contact_phone}`} className="text-small text-brand hover:underline">
                    {lender.contact_phone}
                  </a>
                </div>
              )}
              {lender.application_url && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-content-tertiary" />
                  <a href={lender.application_url} target="_blank" rel="noopener noreferrer" className="text-small text-brand hover:underline">
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                navigate("/capital/request/new");
              }}
            >
              Submit Request to This Lender
            </Button>
            {lender.application_url && (
              <Button
                variant="secondary"
                icon={<ExternalLink />}
                onClick={() => window.open(lender.application_url!, "_blank")}
              >
                Apply Direct
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CapitalLenders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [maxLtv, setMaxLtv] = useState([100]);
  const [selectedLender, setSelectedLender] = useState<MarketplaceLender | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: lenders, isLoading } = useMarketplaceLenders(
    typeFilter !== "all" ? { lenderType: typeFilter } : undefined
  );

  const filteredLenders = lenders?.filter((lender) => {
    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        lender.name.toLowerCase().includes(searchLower) ||
        lender.company?.toLowerCase().includes(searchLower) ||
        lender.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Property type
    if (propertyTypeFilter !== "all") {
      if (!lender.property_types.includes(propertyTypeFilter)) return false;
    }

    // State
    if (stateFilter !== "all") {
      if (!lender.states_served.includes("nationwide") && !lender.states_served.includes(stateFilter)) return false;
    }

    // Max LTV
    if (lender.max_ltv && lender.max_ltv < maxLtv[0]) return false;

    return true;
  });

  const handleViewDetails = (lender: MarketplaceLender) => {
    setSelectedLender(lender);
    setDetailOpen(true);
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-lg">
        <button
          onClick={() => navigate("/capital")}
          className="flex items-center gap-2 text-content-secondary hover:text-content mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Capital
        </button>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-h1 font-bold text-content">Lender Directory</h1>
            <p className="text-body text-content-secondary mt-1">
              Browse our network of {lenders?.length || 0} verified lenders
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate("/capital/request/new")}>
            Request Funding
          </Button>
        </div>
      </div>

      <div className="flex gap-lg">
        {/* Filter Sidebar */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <Card variant="default" padding="md" className="sticky top-4">
            <h3 className="text-body font-semibold text-content mb-4">Filters</h3>
            
            <div className="space-y-5">
              {/* Search */}
              <div>
                <Label className="mb-2">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                  <Input
                    placeholder="Search lenders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Loan Type */}
              <div>
                <Label className="mb-2">Loan Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hard_money">Hard Money</SelectItem>
                    <SelectItem value="dscr">DSCR</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="emd">EMD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type */}
              <div>
                <Label className="mb-2">Property Type</Label>
                <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State */}
              <div>
                <Label className="mb-2">State</Label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max LTV */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Max LTV</Label>
                  <span className="text-small font-medium text-content">{maxLtv[0]}%+</span>
                </div>
                <Slider
                  value={maxLtv}
                  onValueChange={setMaxLtv}
                  max={100}
                  min={50}
                  step={5}
                />
              </div>

              {/* Clear Filters */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setPropertyTypeFilter("all");
                  setStateFilter("all");
                  setMaxLtv([100]);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </Card>
        </div>

        {/* Lenders Grid */}
        <div className="flex-1">
          {/* Mobile Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6 lg:hidden">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
              <Input
                placeholder="Search lenders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Lender Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hard_money">Hard Money</SelectItem>
                <SelectItem value="dscr">DSCR</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="transactional">Transactional</SelectItem>
                <SelectItem value="emd">EMD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-small text-content-secondary">
              Showing {filteredLenders?.length || 0} lenders
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72" />
              ))}
            </div>
          ) : !filteredLenders || filteredLenders.length === 0 ? (
            <Card variant="default" padding="lg">
              <EmptyState
                icon={<Building2 className="h-10 w-10 text-content-tertiary" />}
                title="No lenders found"
                description="Try adjusting your search or filters to find lenders."
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredLenders.map((lender) => (
                <LenderCard
                  key={lender.id}
                  lender={lender}
                  onViewDetails={() => handleViewDetails(lender)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lender Detail Modal */}
      <LenderDetailModal
        lender={selectedLender}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </PageLayout>
  );
}
