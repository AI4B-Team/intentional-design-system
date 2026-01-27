import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
  MapPin,
  User,
  FileText,
  Download,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Shield,
  TrendingUp,
  AlertCircle,
  Zap,
  ArrowUpDown,
  PartyPopper,
  Edit,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useFundingRequest,
  useFundingSubmissions,
  useMarketplaceLenders,
  useSubmitToLenders,
  useUpdateFundingRequest,
  type FundingSubmission,
  type MarketplaceLender,
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

const submissionStatusColors: Record<string, string> = {
  submitted: "bg-info/10 text-info",
  under_review: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  declined: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
  conditional: "bg-warning/10 text-warning",
};

const requestTypeLabels: Record<string, string> = {
  purchase: "Purchase Loan",
  refinance: "Refinance",
  bridge: "Bridge Loan",
  emd: "EMD Funding",
  transactional: "Transactional",
};

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

type SortField = "rate" | "points" | "amount" | "funding_days";

interface ActivityEvent {
  id: string;
  type: "submitted" | "sent" | "response" | "selected" | "status_change";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

export default function CapitalRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: request, isLoading } = useFundingRequest(id);
  const { data: submissions } = useFundingSubmissions(id);
  const { data: allLenders } = useMarketplaceLenders();
  const submitToLenders = useSubmitToLenders();
  const updateRequest = useUpdateFundingRequest();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLenders, setSelectedLenders] = useState<string[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [showPofDialog, setShowPofDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<(FundingSubmission & { lender: MarketplaceLender }) | null>(null);
  const [selectionNotes, setSelectionNotes] = useState("");
  const [expandedOffers, setExpandedOffers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortField>("rate");
  const [isSelecting, setIsSelecting] = useState(false);

  const submittedLenderIds = submissions?.map((s) => s.lender_id) || [];
  const availableLenders = allLenders?.filter((l) => !submittedLenderIds.includes(l.id)) || [];

  // Compute stats
  const stats = useMemo(() => {
    if (!submissions) return { contacted: 0, responses: 0, bestRate: null };
    const responses = submissions.filter((s) => s.status === "approved" || s.status === "declined" || s.status === "conditional");
    const approvedOffers = submissions.filter((s) => s.status === "approved" && s.offered_rate);
    const bestRate = approvedOffers.length > 0
      ? Math.min(...approvedOffers.map((s) => s.offered_rate!))
      : null;
    return {
      contacted: submissions.length,
      responses: responses.length,
      bestRate,
    };
  }, [submissions]);

  // Get offers (approved submissions with terms)
  const offers = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((s) => s.status === "approved" || s.status === "conditional");
  }, [submissions]);

  // Sort offers
  const sortedOffers = useMemo(() => {
    if (!offers.length) return [];
    return [...offers].sort((a, b) => {
      switch (sortBy) {
        case "rate":
          return (a.offered_rate || 99) - (b.offered_rate || 99);
        case "points":
          return (a.offered_points || 99) - (b.offered_points || 99);
        case "amount":
          return (b.offered_amount || 0) - (a.offered_amount || 0);
        case "funding_days":
          return (a.lender?.typical_funding_days || 99) - (b.lender?.typical_funding_days || 99);
        default:
          return 0;
      }
    });
  }, [offers, sortBy]);

  // Build activity timeline
  const activityTimeline = useMemo((): ActivityEvent[] => {
    const events: ActivityEvent[] = [];

    if (request) {
      events.push({
        id: "created",
        type: "submitted",
        title: "Request Created",
        description: `${requestTypeLabels[request.request_type] || request.request_type} request for ${formatCurrency(request.loan_amount_requested)}`,
        timestamp: request.created_at,
        icon: <FileText className="h-4 w-4" />,
        color: "bg-brand/10 text-brand",
      });
    }

    if (submissions && submissions.length > 0) {
      // Group submissions by date
      const firstSubmission = submissions[submissions.length - 1];
      events.push({
        id: "sent",
        type: "sent",
        title: `Sent to ${submissions.length} Lenders`,
        description: "Request submitted to matched lenders",
        timestamp: firstSubmission.submitted_at,
        icon: <Send className="h-4 w-4" />,
        color: "bg-info/10 text-info",
      });

      // Add individual responses
      submissions.forEach((sub) => {
        if (sub.status === "approved") {
          events.push({
            id: `response-${sub.id}`,
            type: "response",
            title: `${sub.lender?.name} Approved`,
            description: sub.offered_rate ? `${sub.offered_rate}% at ${sub.offered_points} points` : "Terms available",
            timestamp: sub.response_at || sub.submitted_at,
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: "bg-success/10 text-success",
          });
        } else if (sub.status === "declined") {
          events.push({
            id: `response-${sub.id}`,
            type: "response",
            title: `${sub.lender?.name} Declined`,
            description: sub.notes || "Did not meet criteria",
            timestamp: sub.response_at || sub.submitted_at,
            icon: <XCircle className="h-4 w-4" />,
            color: "bg-destructive/10 text-destructive",
          });
        }

        if (sub.selected) {
          events.push({
            id: `selected-${sub.id}`,
            type: "selected",
            title: `Selected ${sub.lender?.name}`,
            description: `Accepted offer: ${formatCurrency(sub.offered_amount)} at ${sub.offered_rate}%`,
            timestamp: sub.updated_at,
            icon: <PartyPopper className="h-4 w-4" />,
            color: "bg-brand-accent/10 text-brand-accent",
          });
        }
      });
    }

    // Sort by timestamp descending
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [request, submissions]);

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
      prev.includes(lenderId) ? prev.filter((lid) => lid !== lenderId) : [...prev, lenderId]
    );
  };

  const toggleOfferExpanded = (offerId: string) => {
    setExpandedOffers((prev) =>
      prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId]
    );
  };

  const openSelectDialog = (offer: FundingSubmission & { lender: MarketplaceLender }) => {
    setSelectedOffer(offer);
    setSelectionNotes("");
    setShowSelectDialog(true);
  };

  const handleSelectLender = async () => {
    if (!selectedOffer || !id) return;
    setIsSelecting(true);
    try {
      // Mark submission as selected
      const { error: subError } = await supabase
        .from("funding_submissions")
        .update({ selected: true, notes: selectionNotes || null })
        .eq("id", selectedOffer.id);

      if (subError) throw subError;

      // Update request status to approved
      await updateRequest.mutateAsync({ id, updates: { status: "approved" } });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["funding-submissions", id] });
      
      toast.success("Lender selected successfully!");
      setShowSelectDialog(false);
    } catch (error) {
      console.error("Error selecting lender:", error);
      toast.error("Failed to select lender");
    } finally {
      setIsSelecting(false);
    }
  };

  // Find selected offer if any
  const selectedSubmission = submissions?.find((s) => s.selected);

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

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Badge className={cn("capitalize", statusColors[request.status])} size="md">
                {request.status}
              </Badge>
              <Badge variant="secondary" size="sm">
                {requestTypeLabels[request.request_type] || request.request_type}
              </Badge>
              <span className="text-small text-content-tertiary">
                ID: {request.id.slice(0, 8)}...
              </span>
            </div>
            <h1 className="text-h1 font-bold text-content mb-1">
              {formatCurrency(request.loan_amount_requested)} Funding Request
            </h1>
            <p className="text-body text-content-secondary">
              Created {format(parseISO(request.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {request.status === "draft" && (
              <Button variant="secondary" icon={<Edit />} size="sm">
                Edit Request
              </Button>
            )}
            {request.status !== "cancelled" && request.status !== "funded" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
              >
                Cancel Request
              </Button>
            )}
            <Button variant="secondary" icon={<Download />} size="sm">
              Download Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-lg">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Amount</p>
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
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Lenders Contacted</p>
              <p className="text-h3 font-semibold tabular-nums">{stats.contacted}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Responses</p>
              <p className="text-h3 font-semibold tabular-nums">{stats.responses}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand-accent/10 flex items-center justify-center">
              <Percent className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Best Rate</p>
              <p className="text-h3 font-semibold tabular-nums">
                {stats.bestRate ? `${stats.bestRate}%` : "—"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Selected Lender Banner */}
      {selectedSubmission && (
        <Card variant="default" className="mb-lg bg-gradient-to-r from-success/5 to-success/10 border-success/20">
          <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                <PartyPopper className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-body font-semibold text-content">Lender Selected!</p>
                <p className="text-small text-content-secondary">
                  {selectedSubmission.lender?.name} • {formatCurrency(selectedSubmission.offered_amount)} at {selectedSubmission.offered_rate}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" icon={<Phone />}>
                Contact Lender
              </Button>
              <Button variant="primary" size="sm" icon={<Shield />} onClick={() => setShowPofDialog(true)}>
                Generate POF Letter
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Lender Responses Section */}
          <Card variant="default" padding="none">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h2 className="text-h3 font-semibold text-content">Lender Responses</h2>
                <p className="text-small text-content-secondary">
                  {sortedOffers.length} offers received
                </p>
              </div>
              {sortedOffers.length > 0 && (
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
                  <SelectTrigger className="w-40">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rate">Best Rate</SelectItem>
                    <SelectItem value="points">Lowest Points</SelectItem>
                    <SelectItem value="amount">Highest Amount</SelectItem>
                    <SelectItem value="funding_days">Fastest Funding</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {sortedOffers.length === 0 ? (
              <div className="p-8 text-center">
                {stats.contacted > 0 ? (
                  <>
                    <div className="mb-4 relative">
                      <div className="h-16 w-16 rounded-full bg-info/10 flex items-center justify-center mx-auto">
                        <Clock className="h-8 w-8 text-info animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-h3 font-semibold text-content mb-2">Waiting for Lender Responses</h3>
                    <p className="text-body text-content-secondary mb-4">
                      Your request has been sent to {stats.contacted} lenders. Responses typically arrive within 24-48 hours.
                    </p>
                    <div className="flex justify-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-info animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 rounded-full bg-info animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 rounded-full bg-info animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={<Send className="h-10 w-10 text-content-tertiary" />}
                    title="No lenders contacted yet"
                    description="Submit your request to lenders to start receiving offers."
                    action={{
                      label: "Find Lenders",
                      onClick: () => setActiveTab("lenders"),
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {sortedOffers.map((offer, index) => {
                  const isExpanded = expandedOffers.includes(offer.id);
                  const isBestRate = index === 0 && sortBy === "rate";

                  return (
                    <Collapsible key={offer.id} open={isExpanded} onOpenChange={() => toggleOfferExpanded(offer.id)}>
                      <div className={cn("p-4", offer.selected && "bg-success/5")}>
                        <div className="flex items-center gap-4">
                          {/* Lender Info */}
                          <div className="h-12 w-12 rounded-medium bg-gradient-to-br from-brand/20 to-brand-accent/20 flex items-center justify-center flex-shrink-0">
                            {offer.lender?.logo_url ? (
                              <img src={offer.lender.logo_url} alt="" className="h-8 w-8 object-contain" />
                            ) : (
                              <span className="text-h3 font-bold text-brand">{offer.lender?.name?.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-body font-semibold text-content">{offer.lender?.name}</h3>
                              {isBestRate && <Badge size="sm" className="bg-brand-accent/10 text-brand-accent">Best Rate</Badge>}
                              {offer.selected && <Badge size="sm" className="bg-success/10 text-success">Selected</Badge>}
                            </div>
                            <p className="text-small text-content-secondary">{offer.lender?.company}</p>
                          </div>
                          <Badge className={cn("capitalize", submissionStatusColors[offer.status])} size="sm">
                            {offer.status === "approved" ? "Approved" : offer.status === "conditional" ? "Conditional" : offer.status}
                          </Badge>
                        </div>

                        {/* Offer Terms Grid */}
                        <div className="grid grid-cols-5 gap-3 mt-4 py-3 px-4 bg-surface-secondary rounded-medium">
                          <div className="text-center">
                            <p className="text-tiny text-content-tertiary mb-1">Amount</p>
                            <p className="text-body font-semibold text-content tabular-nums">{formatCurrency(offer.offered_amount)}</p>
                          </div>
                          <div className="text-center border-l border-border-subtle">
                            <p className="text-tiny text-content-tertiary mb-1">Rate</p>
                            <p className="text-body font-semibold text-content tabular-nums">{offer.offered_rate}%</p>
                          </div>
                          <div className="text-center border-l border-border-subtle">
                            <p className="text-tiny text-content-tertiary mb-1">Points</p>
                            <p className="text-body font-semibold text-content tabular-nums">{offer.offered_points}</p>
                          </div>
                          <div className="text-center border-l border-border-subtle">
                            <p className="text-tiny text-content-tertiary mb-1">Term</p>
                            <p className="text-body font-semibold text-content tabular-nums">{offer.offered_term} mo</p>
                          </div>
                          <div className="text-center border-l border-border-subtle">
                            <p className="text-tiny text-content-tertiary mb-1">Funding</p>
                            <p className="text-body font-semibold text-content tabular-nums">{offer.lender?.typical_funding_days}d</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {isExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                              View Full Terms
                            </Button>
                          </CollapsibleTrigger>
                          <div className="flex gap-2">
                            {!offer.selected && !selectedSubmission && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => openSelectDialog(offer as FundingSubmission & { lender: MarketplaceLender })}
                              >
                                Select This Lender
                              </Button>
                            )}
                            {offer.lender?.contact_email && (
                              <Button variant="secondary" size="sm" icon={<Mail />}>
                                Contact
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-4">
                          {offer.conditions && (
                            <div className="p-3 bg-warning/5 border border-warning/20 rounded-medium">
                              <p className="text-small font-medium text-warning mb-1">Conditions</p>
                              <p className="text-small text-content-secondary">{offer.conditions}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-tiny text-content-tertiary mb-1">Max LTV</p>
                              <p className="text-small font-medium text-content">{offer.lender?.max_ltv}%</p>
                            </div>
                            <div>
                              <p className="text-tiny text-content-tertiary mb-1">Min Credit Score</p>
                              <p className="text-small font-medium text-content">{offer.lender?.min_credit_score || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-tiny text-content-tertiary mb-1">Prepayment Penalty</p>
                              <p className="text-small font-medium text-content">{offer.lender?.prepayment_penalty ? "Yes" : "No"}</p>
                            </div>
                            {offer.expiration_date && (
                              <div>
                                <p className="text-tiny text-content-tertiary mb-1">Offer Expires</p>
                                <p className="text-small font-medium text-content">{format(parseISO(offer.expiration_date), "MMM d, yyyy")}</p>
                              </div>
                            )}
                          </div>

                          {/* Lender Contact */}
                          <div className="pt-3 border-t border-border-subtle">
                            <p className="text-tiny text-content-tertiary mb-2">Lender Contact</p>
                            <div className="flex flex-wrap gap-4">
                              {offer.lender?.contact_email && (
                                <a href={`mailto:${offer.lender.contact_email}`} className="flex items-center gap-2 text-small text-brand hover:underline">
                                  <Mail className="h-4 w-4" />
                                  {offer.lender.contact_email}
                                </a>
                              )}
                              {offer.lender?.contact_phone && (
                                <a href={`tel:${offer.lender.contact_phone}`} className="flex items-center gap-2 text-small text-brand hover:underline">
                                  <Phone className="h-4 w-4" />
                                  {offer.lender.contact_phone}
                                </a>
                              )}
                              {offer.lender?.application_url && (
                                <a href={offer.lender.application_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-small text-brand hover:underline">
                                  <ExternalLink className="h-4 w-4" />
                                  Website
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Request Details Section */}
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3 font-semibold text-content">Request Details</h2>
              {request.status === "draft" && (
                <Button variant="ghost" size="sm" icon={<Edit />}>
                  Edit Request
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Details */}
              <div>
                <h3 className="text-small font-medium text-content-tertiary uppercase tracking-wide mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Property
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Type</span>
                    <span className="text-small font-medium text-content">{requestTypeLabels[request.request_type]}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Property Value</span>
                    <span className="text-small font-medium text-content">{formatCurrency(request.property_value)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">ARV</span>
                    <span className="text-small font-medium text-content">{formatCurrency(request.arv)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Purchase Price</span>
                    <span className="text-small font-medium text-content">{formatCurrency(request.purchase_price)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-small text-content-secondary">Rehab Budget</span>
                    <span className="text-small font-medium text-content">{formatCurrency(request.rehab_budget)}</span>
                  </div>
                </div>
              </div>

              {/* Borrower Profile */}
              <div>
                <h3 className="text-small font-medium text-content-tertiary uppercase tracking-wide mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Borrower Profile
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Timeline</span>
                    <span className="text-small font-medium text-content capitalize">{request.timeline_needed?.replace(/_/g, " ") || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Credit Score</span>
                    <span className="text-small font-medium text-content capitalize">{request.credit_score_range?.replace(/_/g, " ") || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Experience</span>
                    <span className="text-small font-medium text-content capitalize">{request.experience_level?.replace(/_/g, " ") || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-small text-content-secondary">Exit Strategy</span>
                    <span className="text-small font-medium text-content capitalize">{request.exit_strategy?.replace(/_/g, " ") || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {request.notes && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <p className="text-small text-content-tertiary mb-1">Notes</p>
                <p className="text-small text-content">{request.notes}</p>
              </div>
            )}
          </Card>

          {/* Find More Lenders */}
          {request.status !== "cancelled" && request.status !== "funded" && !selectedSubmission && (
            <Card variant="default" padding="md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-h3 font-semibold text-content">Submit to More Lenders</h2>
                  <p className="text-small text-content-secondary">
                    {availableLenders.length} additional lenders available
                  </p>
                </div>
                {selectedLenders.length > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Send />}
                    onClick={handleSubmitToLenders}
                    disabled={submitToLenders.isPending}
                  >
                    Submit to {selectedLenders.length} Lenders
                  </Button>
                )}
              </div>

              {availableLenders.length === 0 ? (
                <p className="text-small text-content-tertiary text-center py-4">
                  Your request has been sent to all available lenders.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableLenders.slice(0, 10).map((lender) => (
                    <div
                      key={lender.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-medium border cursor-pointer transition-colors",
                        selectedLenders.includes(lender.id)
                          ? "border-brand bg-brand/5"
                          : "border-border-subtle hover:border-brand/50"
                      )}
                      onClick={() => toggleLender(lender.id)}
                    >
                      <Checkbox checked={selectedLenders.includes(lender.id)} />
                      <div className="h-8 w-8 rounded-small bg-brand/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-small font-bold text-brand">{lender.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-small font-medium text-content">{lender.name}</p>
                        <p className="text-tiny text-content-secondary">
                          {lender.rate_range_min}% - {lender.rate_range_max}% • Up to {lender.max_ltv}% LTV
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Activity & POF */}
        <div className="space-y-lg">
          {/* Activity Timeline */}
          <Card variant="default" padding="md">
            <h3 className="text-h3 font-semibold text-content mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              {activityTimeline.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", event.color)}>
                    {event.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-small font-medium text-content">{event.title}</p>
                    <p className="text-tiny text-content-secondary">{event.description}</p>
                    <p className="text-tiny text-content-tertiary mt-1">
                      {formatDistanceToNow(parseISO(event.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Proof of Funds */}
          {(request.status === "approved" || selectedSubmission) && (
            <Card variant="default" padding="md" className="bg-gradient-to-br from-brand/5 to-brand-accent/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <h3 className="text-body font-semibold text-content">Proof of Funds</h3>
                  <p className="text-small text-content-secondary">Generate a POF letter for sellers</p>
                </div>
              </div>
              <Button variant="primary" className="w-full" icon={<Download />} onClick={() => setShowPofDialog(true)}>
                Generate POF Letter
              </Button>
            </Card>
          )}

          {/* Quick Stats */}
          <Card variant="default" padding="md">
            <h3 className="text-h3 font-semibold text-content mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-small text-content-secondary">LTV Requested</span>
                <span className="text-small font-medium text-content">
                  {request.loan_amount_requested && request.property_value
                    ? `${Math.round((request.loan_amount_requested / request.property_value) * 100)}%`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-small text-content-secondary">Time Active</span>
                <span className="text-small font-medium text-content">
                  {formatDistanceToNow(parseISO(request.created_at))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-small text-content-secondary">Response Rate</span>
                <span className="text-small font-medium text-content">
                  {stats.contacted > 0 ? `${Math.round((stats.responses / stats.contacted) * 100)}%` : "—"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Funding Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your funding request and notify any lenders who have already received it.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Select Lender Dialog */}
      <Dialog open={showSelectDialog} onOpenChange={setShowSelectDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Lender Selection</DialogTitle>
            <DialogDescription>
              You're selecting this lender for your funding request. They will be notified to proceed with your application.
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-secondary rounded-medium">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
                    <span className="text-h3 font-bold text-brand">{selectedOffer.lender?.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-body font-semibold text-content">{selectedOffer.lender?.name}</p>
                    <p className="text-small text-content-secondary">{selectedOffer.lender?.company}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-tiny text-content-tertiary">Amount</p>
                    <p className="text-body font-semibold">{formatCurrency(selectedOffer.offered_amount)}</p>
                  </div>
                  <div>
                    <p className="text-tiny text-content-tertiary">Rate</p>
                    <p className="text-body font-semibold">{selectedOffer.offered_rate}%</p>
                  </div>
                  <div>
                    <p className="text-tiny text-content-tertiary">Points</p>
                    <p className="text-body font-semibold">{selectedOffer.offered_points}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Add Notes (Optional)</Label>
                <Textarea
                  placeholder="Any additional notes for the lender..."
                  value={selectionNotes}
                  onChange={(e) => setSelectionNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="p-3 bg-info/5 border border-info/20 rounded-medium">
                <h4 className="text-small font-medium text-content mb-2">What happens next?</h4>
                <ul className="space-y-1 text-small text-content-secondary">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    The lender will contact you within 24 hours
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    You'll receive document requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    Processing typically takes 5-10 business days
                  </li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSelectDialog(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSelectLender} disabled={isSelecting}>
              {isSelecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* POF Dialog */}
      <Dialog open={showPofDialog} onOpenChange={setShowPofDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Proof of Funds Letter</DialogTitle>
            <DialogDescription>
              Create a professional proof of funds letter to present to sellers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-surface-secondary rounded-medium space-y-3">
              <div className="flex justify-between">
                <span className="text-small text-content-secondary">Funding Amount</span>
                <span className="text-small font-medium text-content">{formatCurrency(request.loan_amount_requested)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-content-secondary">Lender</span>
                <span className="text-small font-medium text-content">{selectedSubmission?.lender?.name || "Pre-Approval"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-content-secondary">Date</span>
                <span className="text-small font-medium text-content">{format(new Date(), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-content-secondary">Valid For</span>
                <span className="text-small font-medium text-content">30 Days</span>
              </div>
            </div>

            <p className="text-small text-content-tertiary">
              This letter confirms your funding capability and can be used when making offers on properties.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPofDialog(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={<Download />}>
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
