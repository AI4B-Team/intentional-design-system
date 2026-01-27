import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Phone,
  Mail,
  Star,
  MapPin,
  Shield,
  FileCheck,
  Pencil,
  Trash2,
  Building2,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { useContractor, useContractorBids, useDeleteContractor, type Contractor } from "@/hooks/useContractors";
import { EditContractorModal } from "@/components/contractors/edit-contractor-modal";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function StarRating({ rating, label }: { rating: number | null; label: string }) {
  const stars = rating || 0;
  return (
    <div>
      <p className="text-tiny text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i <= stars ? "fill-warning text-warning" : "text-muted-foreground/30"
            )}
          />
        ))}
        <span className="text-body font-semibold ml-2">{stars.toFixed(1)}</span>
      </div>
    </div>
  );
}

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

function getBidStatusBadge(status: string) {
  switch (status) {
    case "accepted":
      return <Badge variant="success" size="sm">Accepted</Badge>;
    case "declined":
      return <Badge variant="error" size="sm">Declined</Badge>;
    case "received":
      return <Badge variant="info" size="sm">Received</Badge>;
    case "requested":
      return <Badge variant="warning" size="sm">Requested</Badge>;
    case "expired":
      return <Badge variant="secondary" size="sm">Expired</Badge>;
    default:
      return <Badge variant="secondary" size="sm">{status}</Badge>;
  }
}

export default function ContractorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: contractor, isLoading } = useContractor(id);
  const { data: bids } = useContractorBids(id);
  const deleteContractor = useDeleteContractor();
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const handleDelete = async () => {
    if (!id) return;
    await deleteContractor.mutateAsync(id);
    navigate("/contractors");
  };

  if (isLoading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Contractors", href: "/contractors" },
          { label: "Loading..." },
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contractor) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Contractors", href: "/contractors" },
          { label: "Not Found" },
        ]}
      >
        <Card variant="default" padding="lg" className="text-center">
          <p className="text-muted-foreground mb-4">Contractor not found</p>
          <Button variant="secondary" onClick={() => navigate("/contractors")}>
            Back to Contractors
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Contractors", href: "/contractors" },
        { label: contractor.name },
      ]}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => navigate("/contractors")}
            icon={<ArrowLeft />}
          >
            Contractors
          </Button>
          <h1 className="text-h1 font-bold text-foreground">{contractor.name}</h1>
          {contractor.company && (
            <p className="text-body text-muted-foreground">{contractor.company}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              contractor.status === "active"
                ? "success"
                : contractor.status === "blacklisted"
                ? "error"
                : "secondary"
            }
            size="md"
          >
            {contractor.status}
          </Badge>
          <Button variant="secondary" size="sm" icon={<Pencil />} onClick={() => setIsEditOpen(true)}>
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" icon={<Trash2 />}>
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Contractor</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {contractor.name}? This will also delete all associated bid records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Info */}
        <div className="space-y-4">
          <Card variant="default" padding="md">
            <h3 className="text-body font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              {contractor.phone && (
                <a
                  href={`tel:${contractor.phone}`}
                  className="flex items-center gap-3 text-small hover:text-brand transition-colors"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {contractor.phone}
                </a>
              )}
              {contractor.email && (
                <a
                  href={`mailto:${contractor.email}`}
                  className="flex items-center gap-3 text-small hover:text-brand transition-colors"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {contractor.email}
                </a>
              )}
              {contractor.service_areas && contractor.service_areas.length > 0 && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {contractor.service_areas.map((area) => (
                      <Badge key={area} variant="secondary" size="sm">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card variant="default" padding="md">
            <h3 className="text-body font-semibold mb-4">Specialties</h3>
            <div className="flex flex-wrap gap-1.5">
              {contractor.specialties?.map((spec) => (
                <Badge key={spec} variant="secondary" size="sm" className="capitalize">
                  {spec}
                </Badge>
              ))}
            </div>
          </Card>

          <Card variant="default" padding="md">
            <h3 className="text-body font-semibold mb-4">Verification</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {contractor.license_verified ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-small">
                  License: {contractor.license_number || "Not provided"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {contractor.insurance_verified ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-small">
                  Insurance {contractor.insurance_verified ? "Verified" : "Not verified"}
                </span>
              </div>
            </div>
          </Card>

          {contractor.notes && (
            <Card variant="default" padding="md">
              <h3 className="text-body font-semibold mb-2">Notes</h3>
              <p className="text-small text-muted-foreground whitespace-pre-wrap">
                {contractor.notes}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column - Ratings & Bids */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ratings */}
          <Card variant="default" padding="md">
            <h3 className="text-body font-semibold mb-4">Ratings & Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <StarRating rating={contractor.overall_rating} label="Overall" />
              <StarRating rating={contractor.quality_rating} label="Quality" />
              <StarRating rating={contractor.reliability_rating} label="Reliability" />
              <StarRating rating={contractor.communication_rating} label="Communication" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border-subtle">
              <div>
                <p className="text-tiny text-muted-foreground">Jobs Completed</p>
                <p className="text-h3 font-semibold">{contractor.jobs_completed}</p>
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">On-Time %</p>
                <p className="text-h3 font-semibold">
                  {contractor.on_time_percentage ? `${contractor.on_time_percentage}%` : "—"}
                </p>
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">Bid Accuracy</p>
                <p className="text-h3 font-semibold">
                  {contractor.avg_bid_accuracy ? `${contractor.avg_bid_accuracy}%` : "—"}
                </p>
              </div>
            </div>
          </Card>

          {/* Bids History */}
          <Card variant="default" padding="none">
            <div className="p-4 border-b border-border-subtle">
              <h3 className="text-body font-semibold">Bid History</h3>
            </div>
            {bids && bids.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.map((bid: any) => (
                    <TableRow
                      key={bid.id}
                      className="cursor-pointer hover:bg-background-secondary/50"
                      onClick={() => navigate(`/properties/${bid.property_id}`)}
                    >
                      <TableCell>
                        <div className="font-medium">{bid.properties?.address}</div>
                        <div className="text-tiny text-muted-foreground">
                          {[bid.properties?.city, bid.properties?.state].filter(Boolean).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(bid.bid_amount)}
                      </TableCell>
                      <TableCell>
                        {bid.timeline_days ? `${bid.timeline_days} days` : "—"}
                      </TableCell>
                      <TableCell>{getBidStatusBadge(bid.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(bid.created_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-small">No bids yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <EditContractorModal
        contractor={contractor}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </DashboardLayout>
  );
}
