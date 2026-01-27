import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Inbox,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useDealSubmissions,
  useMarkSubmissionReviewed,
  usePendingSubmissionsCount,
} from "@/hooks/useDealSubmissions";

type FilterType = "all" | "pending" | "reviewed";

export default function Submissions() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("pending");
  const { data: submissions, isLoading } = useDealSubmissions(filter);
  const { data: pendingCount } = usePendingSubmissionsCount();
  const markReviewed = useMarkSubmissionReviewed();

  const filterOptions = [
    { value: "pending", label: `Pending${pendingCount ? ` (${pendingCount})` : ""}` },
    { value: "reviewed", label: "Reviewed" },
    { value: "all", label: "All" },
  ];

  const handleReview = (submission: { property_id: string | null; id: string }) => {
    if (submission.property_id) {
      navigate(`/properties/${submission.property_id}`);
    }
    markReviewed.mutate(submission.id);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Deal Submissions"
        description="Review submitted deals from agents and wholesalers"
      />

      {/* Filter */}
      <div className="mb-lg">
        <SegmentedControl
          value={filter}
          onChange={(v) => setFilter(v as FilterType)}
          options={filterOptions}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-lg">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-warning/10 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Pending Review</p>
              <p className="text-h3 font-semibold tabular-nums">{pendingCount || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Reviewed Today</p>
              <p className="text-h3 font-semibold tabular-nums">
                {submissions?.filter(
                  (s) =>
                    s.reviewed &&
                    s.reviewed_at &&
                    new Date(s.reviewed_at).toDateString() === new Date().toDateString()
                ).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Total Submissions</p>
              <p className="text-h3 font-semibold tabular-nums">{submissions?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !submissions || submissions.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <Inbox className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
          <h3 className="text-h3 font-medium text-content mb-2">
            {filter === "pending" ? "No pending submissions" : "No submissions found"}
          </h3>
          <p className="text-small text-content-secondary">
            {filter === "pending"
              ? "All submissions have been reviewed!"
              : "Deal submissions will appear here when received."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card
              key={submission.id}
              variant="default"
              padding="md"
              className={cn(
                "hover:shadow-md transition-shadow",
                !submission.reviewed && "border-l-4 border-l-warning"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-body font-semibold text-brand">
                        {submission.submitter_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-body font-semibold text-content">
                          {submission.submitter_name}
                        </h4>
                        {submission.submitter_company && (
                          <span className="text-small text-content-secondary">
                            @ {submission.submitter_company}
                          </span>
                        )}
                        {submission.submitter_type && (
                          <Badge variant="secondary" size="sm">
                            {submission.submitter_type}
                          </Badge>
                        )}
                        <Badge
                          variant={submission.reviewed ? "success" : "warning"}
                          size="sm"
                        >
                          {submission.reviewed ? "Reviewed" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-small text-content-secondary">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {submission.submitter_phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {submission.submitter_email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Property Info */}
                  {submission.property && (
                    <div className="p-3 bg-surface-secondary rounded-medium mb-3">
                      <div className="flex items-center gap-2 text-body font-medium text-content">
                        <MapPin className="h-4 w-4 text-content-tertiary" />
                        {submission.property.address}
                      </div>
                      {(submission.property.city || submission.property.state) && (
                        <p className="text-small text-content-secondary mt-1 ml-6">
                          {submission.property.city}, {submission.property.state}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-4 text-tiny text-content-tertiary">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Submitted {formatDistanceToNow(parseISO(submission.submitted_at), { addSuffix: true })}
                    </span>
                    {submission.reviewed_at && (
                      <span>
                        Reviewed {format(parseISO(submission.reviewed_at), "MMM d, yyyy")}
                      </span>
                    )}
                    {submission.referral_source && (
                      <span>Source: {submission.referral_source}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {submission.property_id && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Eye />}
                      onClick={() => handleReview(submission)}
                    >
                      Review
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-surface-tertiary rounded-small transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-content-tertiary" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white">
                      {submission.property_id && (
                        <DropdownMenuItem onClick={() => navigate(`/properties/${submission.property_id}`)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Property
                        </DropdownMenuItem>
                      )}
                      {!submission.reviewed && (
                        <DropdownMenuItem onClick={() => markReviewed.mutate(submission.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Reviewed
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => window.location.href = `mailto:${submission.submitter_email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = `tel:${submission.submitter_phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
