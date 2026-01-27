import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Banknote,
  Percent,
  Calendar,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useFundingRequest,
  useFundingSubmissions,
  useMarketplaceLenders,
  useSubmitToLenders,
  useUpdateFundingRequest,
} from "@/hooks/useCapital";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-info/10 text-info",
  under_review: "bg-warning/10 text-warning",
  reviewing: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  funded: "bg-brand/10 text-brand",
  declined: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
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

export default function CapitalRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: request, isLoading } = useFundingRequest(id);
  const { data: submissions } = useFundingSubmissions(id);
  const { data: allLenders } = useMarketplaceLenders();
  const submitToLenders = useSubmitToLenders();
  const updateRequest = useUpdateFundingRequest();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLenders, setSelectedLenders] = useState<string[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const submittedLenderIds = submissions?.map((s) => s.lender_id) || [];
  const availableLenders = allLenders?.filter((l) => !submittedLenderIds.includes(l.id)) || [];

  const handleSubmitToLenders = async () => {
    if (!id || selectedLenders.length === 0) return;
    await submitToLenders.mutateAsync({ requestId: id, lenderIds: selectedLenders });
    setSelectedLenders([]);
  };

  const handleCancel = async () => {
    if (!id) return;
    await updateRequest.mutateAsync({ id, updates: { status: "cancelled" } });
    setShowCancelDialog(false);
  };

  const toggleLender = (lenderId: string) => {
    setSelectedLenders((prev) =>
      prev.includes(lenderId) ? prev.filter((id) => id !== lenderId) : [...prev, lenderId]
    );
  };

  if (isLoading) {
    return (
      <PageLayout>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-32 mb-6" />
        <Skeleton className="h-96" />
      </PageLayout>
    );
  }

  if (!request) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-h2 font-medium text-content">Request not found</h2>
          <Button variant="secondary" className="mt-4" onClick={() => navigate("/capital")}>
            Back to Capital
          </Button>
        </div>
      </PageLayout>
    );
  }

  const approvedOffers = submissions?.filter((s) => s.status === "approved") || [];

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

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-h1 font-bold text-content">
                {requestTypeLabels[request.request_type] || request.request_type} Request
              </h1>
              <Badge className={cn("capitalize", statusColors[request.status])}>{request.status}</Badge>
            </div>
            <p className="text-body text-content-secondary">
              {formatCurrency(request.loan_amount_requested)} requested •{" "}
              {format(parseISO(request.created_at), "MMM d, yyyy")}
            </p>
          </div>

          {request.status === "draft" && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setShowCancelDialog(true)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setActiveTab("lenders")}>
                Submit to Lenders
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-lg">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Requested</p>
              <p className="text-h3 font-semibold tabular-nums">{formatCurrency(request.loan_amount_requested)}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-info/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Submitted To</p>
              <p className="text-h3 font-semibold tabular-nums">{submissions?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Reviewing</p>
              <p className="text-h3 font-semibold tabular-nums">
                {submissions?.filter((s) => s.status === "under_review").length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Offers</p>
              <p className="text-h3 font-semibold tabular-nums">{approvedOffers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="offers">Offers ({approvedOffers.length})</TabsTrigger>
          <TabsTrigger value="lenders">Find Lenders</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <Card variant="default" padding="md">
              <h3 className="text-h3 font-medium text-content mb-4">Loan Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border-subtle">
                  <span className="text-small text-content-secondary">Type</span>
                  <span className="text-small font-medium text-content capitalize">
                    {request.request_type.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-subtle">
                  <span className="text-small text-content-secondary">Amount Requested</span>
                  <span className="text-small font-medium text-content">
                    {formatCurrency(request.loan_amount_requested)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-subtle">
                  <span className="text-small text-content-secondary">Property Value</span>
                  <span className="text-small font-medium text-content">
                    {formatCurrency(request.property_value)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-subtle">
                  <span className="text-small text-content-secondary">ARV</span>
                  <span className="text-small font-medium text-content">{formatCurrency(request.arv)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-subtle">
                  <span className="text-small text-content-secondary">Purchase Price</span>
                  <span className="text-small font-medium text-content">
                    {formatCurrency(request.purchase_price)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-small text-content-secondary">Rehab Budget</span>
                  <span className="text-small font-medium text-content">
                    {formatCurrency(request.rehab_budget)}
                  </span>
                </div>
              </div>
            </Card>

            <Card variant="default" padding="md">
              <h3 className="text-h3 font-medium text-content mb-4">Borrower Profile</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border-subtle">
                  <span className="text-small text-content-secondary">Timeline</span>
                  <span className="text-small font-medium text-content capitalize">
                    {request.timeline_needed?.replace("_", " ") || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-subtle">
                  <span className="text-small text-content-secondary">Credit Score</span>
                  <span className="text-small font-medium text-content capitalize">
                    {request.credit_score_range || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-subtle">
                  <span className="text-small text-content-secondary">Experience</span>
                  <span className="text-small font-medium text-content capitalize">
                    {request.experience_level?.replace("_", " ") || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-small text-content-secondary">Exit Strategy</span>
                  <span className="text-small font-medium text-content capitalize">
                    {request.exit_strategy?.replace("_", " ") || "—"}
                  </span>
                </div>
              </div>
              {request.purpose && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p className="text-small text-content-secondary mb-1">Purpose</p>
                  <p className="text-small text-content">{request.purpose}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Submission Timeline */}
          {submissions && submissions.length > 0 && (
            <Card variant="default" padding="md" className="mt-lg">
              <h3 className="text-h3 font-medium text-content mb-4">Submission Timeline</h3>
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                        <Banknote className="h-5 w-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-body font-medium text-content">{sub.lender?.name || "Unknown Lender"}</p>
                        <p className="text-small text-content-secondary">
                          Submitted {format(parseISO(sub.submitted_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn("capitalize", statusColors[sub.status])} size="sm">
                      {sub.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers" className="mt-lg">
          {approvedOffers.length === 0 ? (
            <Card variant="default" padding="lg">
              <EmptyState
                icon={<DollarSign className="h-10 w-10 text-content-tertiary" />}
                title="No offers yet"
                description="Once lenders review your request and make offers, they will appear here."
              />
            </Card>
          ) : (
            <div className="grid gap-4">
              {approvedOffers.map((offer) => (
                <Card key={offer.id} variant="default" padding="md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-medium bg-brand/10 flex items-center justify-center">
                        <Banknote className="h-7 w-7 text-brand" />
                      </div>
                      <div>
                        <h3 className="text-body font-semibold text-content">{offer.lender?.name}</h3>
                        <p className="text-small text-content-secondary">{offer.lender?.company}</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success">Approved</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border-subtle">
                    <div className="text-center">
                      <p className="text-tiny text-content-tertiary">Amount</p>
                      <p className="text-body font-semibold text-content">{formatCurrency(offer.offered_amount)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-tiny text-content-tertiary">Rate</p>
                      <p className="text-body font-semibold text-content">{offer.offered_rate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-tiny text-content-tertiary">Points</p>
                      <p className="text-body font-semibold text-content">{offer.offered_points}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-tiny text-content-tertiary">Term</p>
                      <p className="text-body font-semibold text-content">{offer.offered_term} mo</p>
                    </div>
                  </div>

                  {offer.conditions && (
                    <div className="mt-4 p-3 bg-surface-secondary rounded-medium">
                      <p className="text-small text-content">{offer.conditions}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button variant="primary" size="sm" className="flex-1">
                      Accept Offer
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1">
                      Contact Lender
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Find Lenders Tab */}
        <TabsContent value="lenders" className="mt-lg">
          <Card variant="default" padding="none">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-h3 font-medium text-content">Available Lenders</h3>
                <p className="text-small text-content-secondary">
                  Select lenders to submit your request to ({selectedLenders.length} selected)
                </p>
              </div>
              {selectedLenders.length > 0 && (
                <Button
                  variant="primary"
                  onClick={handleSubmitToLenders}
                  loading={submitToLenders.isPending}
                >
                  Submit to {selectedLenders.length} Lenders
                </Button>
              )}
            </div>

            {availableLenders.length === 0 ? (
              <div className="p-lg">
                <EmptyState
                  icon={<Building2 className="h-10 w-10 text-content-tertiary" />}
                  title="No additional lenders available"
                  description="You've submitted to all available lenders."
                />
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {availableLenders.map((lender) => (
                  <div
                    key={lender.id}
                    className="flex items-center gap-4 p-4 hover:bg-surface-secondary/50 transition-colors cursor-pointer"
                    onClick={() => toggleLender(lender.id)}
                  >
                    <Checkbox
                      checked={selectedLenders.includes(lender.id)}
                      onCheckedChange={() => toggleLender(lender.id)}
                    />
                    <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                      <Banknote className="h-5 w-5 text-brand" />
                    </div>
                    <div className="flex-1">
                      <p className="text-body font-medium text-content">{lender.name}</p>
                      <p className="text-small text-content-secondary">
                        {lender.rate_range_min}% - {lender.rate_range_max}% • Up to {lender.max_ltv}% LTV
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-small font-medium text-content">
                        {formatCurrency(lender.min_loan_amount)} - {formatCurrency(lender.max_loan_amount)}
                      </p>
                      <p className="text-tiny text-content-secondary">{lender.typical_funding_days}d funding</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this funding request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
              Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
