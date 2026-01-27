import React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Banknote,
  Plus,
  Clock,
  CheckCircle2,
  DollarSign,
  FileText,
  ArrowRight,
  Building2,
  TrendingUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useFundingRequests, useCapitalStats, useMarketplaceLenders } from "@/hooks/useCapital";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-info/10 text-info",
  reviewing: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  funded: "bg-brand/10 text-brand",
  declined: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const requestTypeLabels: Record<string, string> = {
  purchase: "Purchase",
  refinance: "Refinance",
  bridge: "Bridge Loan",
  emd: "EMD",
  transactional: "Transactional",
};

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Capital() {
  const navigate = useNavigate();
  const { data: requests, isLoading: requestsLoading } = useFundingRequests();
  const { data: stats, isLoading: statsLoading } = useCapitalStats();
  const { data: lenders } = useMarketplaceLenders();

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h1 className="text-h1 font-bold text-content">Instant Capital</h1>
          <p className="text-body text-content-secondary mt-1">
            Access our network of {lenders?.length || 50}+ private lenders competing for your deals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate("/capital/lenders")}>
            Browse Lenders
          </Button>
          <Button variant="primary" icon={<Plus />} onClick={() => navigate("/capital/request/new")}>
            New Funding Request
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-lg">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <Card variant="default" padding="md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <p className="text-tiny text-content-tertiary uppercase tracking-wide">Total Requests</p>
                  <p className="text-h3 font-semibold tabular-nums">{stats?.total || 0}</p>
                </div>
              </div>
            </Card>
            <Card variant="default" padding="md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-medium bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-tiny text-content-tertiary uppercase tracking-wide">Pending</p>
                  <p className="text-h3 font-semibold tabular-nums">{stats?.pending || 0}</p>
                </div>
              </div>
            </Card>
            <Card variant="default" padding="md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-tiny text-content-tertiary uppercase tracking-wide">Approved</p>
                  <p className="text-h3 font-semibold tabular-nums">{stats?.approved || 0}</p>
                </div>
              </div>
            </Card>
            <Card variant="default" padding="md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-medium bg-brand-accent/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-brand-accent" />
                </div>
                <div>
                  <p className="text-tiny text-content-tertiary uppercase tracking-wide">Total Requested</p>
                  <p className="text-h3 font-semibold tabular-nums">
                    {formatCurrency(stats?.totalRequested || 0)}
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-lg">
        <Card
          variant="interactive"
          padding="md"
          className="cursor-pointer group"
          onClick={() => navigate("/capital/request/new?type=purchase")}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-medium bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-body font-medium text-content group-hover:text-brand transition-colors">
                Purchase Financing
              </h3>
              <p className="text-small text-content-secondary">Fund your next acquisition</p>
            </div>
            <ArrowRight className="h-5 w-5 text-content-tertiary group-hover:text-brand transition-colors" />
          </div>
        </Card>
        <Card
          variant="interactive"
          padding="md"
          className="cursor-pointer group"
          onClick={() => navigate("/capital/request/new?type=bridge")}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-medium bg-gradient-to-br from-warning to-warning/70 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-body font-medium text-content group-hover:text-brand transition-colors">
                Bridge Loan
              </h3>
              <p className="text-small text-content-secondary">Short-term capital for deals</p>
            </div>
            <ArrowRight className="h-5 w-5 text-content-tertiary group-hover:text-brand transition-colors" />
          </div>
        </Card>
        <Card
          variant="interactive"
          padding="md"
          className="cursor-pointer group"
          onClick={() => navigate("/capital/request/new?type=emd")}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-medium bg-gradient-to-br from-success to-success/70 flex items-center justify-center">
              <Banknote className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-body font-medium text-content group-hover:text-brand transition-colors">
                EMD Funding
              </h3>
              <p className="text-small text-content-secondary">Earnest money deposits</p>
            </div>
            <ArrowRight className="h-5 w-5 text-content-tertiary group-hover:text-brand transition-colors" />
          </div>
        </Card>
      </div>

      {/* Requests List */}
      <Card variant="default" padding="none">
        <div className="p-4 border-b border-border-subtle">
          <h2 className="text-h3 font-medium text-content">Your Funding Requests</h2>
        </div>

        {requestsLoading ? (
          <div className="p-lg">
            <Skeleton className="h-64" />
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="p-lg">
            <EmptyState
              icon={<Banknote className="h-10 w-10 text-content-tertiary" />}
              title="No funding requests yet"
              description="Create your first funding request to start receiving offers from our lender network."
              action={{
                label: "Create Request",
                onClick: () => navigate("/capital/request/new"),
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Timeline
                  </th>
                  <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Created
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-surface-secondary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/capital/request/${request.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center">
                          <Banknote className="h-4 w-4 text-brand" />
                        </div>
                        <div>
                          <p className="text-body font-medium text-content">
                            {requestTypeLabels[request.request_type] || request.request_type}
                          </p>
                          {request.purpose && (
                            <p className="text-small text-content-secondary line-clamp-1">{request.purpose}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-body font-medium tabular-nums">
                        {formatCurrency(request.loan_amount_requested)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={cn("capitalize", statusColors[request.status])} size="sm">
                        {request.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-small text-content-secondary capitalize">
                        {request.timeline_needed?.replace("_", " ") || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-small text-content-secondary">
                        {format(parseISO(request.created_at), "MMM d, yyyy")}
                      </span>
                    </td>
                    <td className="px-2">
                      <ArrowRight className="h-4 w-4 text-content-tertiary" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageLayout>
  );
}
