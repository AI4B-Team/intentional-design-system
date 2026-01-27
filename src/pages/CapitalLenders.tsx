import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Building2,
  Clock,
  Percent,
  TrendingUp,
  MapPin,
  ExternalLink,
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

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function LenderCard({ lender }: { lender: MarketplaceLender }) {
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
        {lender.application_url && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            icon={<ExternalLink />}
            iconPosition="right"
            onClick={() => window.open(lender.application_url!, "_blank")}
          >
            Apply Now
          </Button>
        )}
        {lender.contact_email && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => (window.location.href = `mailto:${lender.contact_email}`)}
          >
            Contact
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function CapitalLenders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: lenders, isLoading } = useMarketplaceLenders(
    typeFilter !== "all" ? { lenderType: typeFilter } : undefined
  );

  const filteredLenders = lenders?.filter((lender) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      lender.name.toLowerCase().includes(searchLower) ||
      lender.company?.toLowerCase().includes(searchLower) ||
      lender.description?.toLowerCase().includes(searchLower)
    );
  });

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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-lg">
        <div className="relative flex-1 min-w-[200px] max-w-md">
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

      {/* Lenders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLenders.map((lender) => (
            <LenderCard key={lender.id} lender={lender} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
