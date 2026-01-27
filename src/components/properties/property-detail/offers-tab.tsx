import * as React from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  MessageSquare,
  Send,
  User,
  FileCheck,
} from "lucide-react";
import { usePropertyOffers } from "@/hooks/useProperty";
import { useDeleteOffer } from "@/hooks/usePropertyMutations";
import { AddOfferModal } from "./add-offer-modal";
import { format } from "date-fns";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

type OfferStatus = "pending" | "accepted" | "rejected" | "countered" | "expired";

function getStatusConfig(status: string | null): { label: string; variant: "success" | "error" | "warning" | "secondary" | "info"; icon: React.ElementType } {
  switch (status) {
    case "accepted":
      return { label: "Accepted", variant: "success", icon: CheckCircle2 };
    case "rejected":
      return { label: "Rejected", variant: "error", icon: XCircle };
    case "countered":
      return { label: "Countered", variant: "warning", icon: AlertCircle };
    case "expired":
      return { label: "Expired", variant: "secondary", icon: Clock };
    default:
      return { label: "Pending", variant: "info", icon: Clock };
  }
}

function getOfferTypeConfig(type: string | null): { label: string; variant: "default" | "secondary" | "warning" } {
  switch (type) {
    case "counter":
      return { label: "Counter", variant: "warning" };
    case "final":
      return { label: "Final", variant: "secondary" };
    default:
      return { label: "Opening", variant: "default" };
  }
}

function getSentViaIcon(sentVia: string | null) {
  switch (sentVia) {
    case "email":
      return Mail;
    case "sms":
      return MessageSquare;
    case "mail":
      return Send;
    case "in_person":
      return User;
    default:
      return FileCheck;
  }
}

const filterOptions = ["all", "pending", "accepted", "rejected", "countered"] as const;

export function OffersTab() {
  const { id } = useParams();
  const { data: offers, isLoading } = usePropertyOffers(id);
  const deleteOffer = useDeleteOffer();
  
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [filter, setFilter] = React.useState<typeof filterOptions[number]>("all");

  const filteredOffers = React.useMemo(() => {
    if (!offers) return [];
    if (filter === "all") return offers;
    return offers.filter((o) => o.response === filter);
  }, [offers, filter]);

  const handleDelete = (offerId: string) => {
    if (!id) return;
    deleteOffer.mutate({ id: offerId, propertyId: id });
  };

  if (isLoading) {
    return (
      <div className="p-lg space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg flex-wrap gap-3">
        <div>
          <h3 className="text-h3 font-medium text-foreground">Offer History</h3>
          <p className="text-small text-muted-foreground">{offers?.length || 0} offers made</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-1 bg-background-secondary rounded-medium p-1">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={cn(
                  "px-3 py-1.5 text-small font-medium rounded-small transition-colors capitalize",
                  filter === opt
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={() => setShowAddModal(true)}>
            New Offer
          </Button>
        </div>
      </div>

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h4 className="text-h3 font-medium text-foreground mb-2">
            {filter === "all" ? "No offers made yet" : `No ${filter} offers`}
          </h4>
          <p className="text-small text-muted-foreground mb-4">
            Make your first offer to start negotiating!
          </p>
          <Button variant="secondary" size="sm" icon={<Plus />} onClick={() => setShowAddModal(true)}>
            New Offer
          </Button>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          {/* Offer Cards */}
          <div className="space-y-4">
            {filteredOffers.map((offer, index) => {
              const statusConfig = getStatusConfig(offer.response);
              const typeConfig = getOfferTypeConfig(offer.offer_type);
              const StatusIcon = statusConfig.icon;
              const SentViaIcon = getSentViaIcon(offer.sent_via);

              return (
                <div key={offer.id} className="relative flex gap-4">
                  {/* Timeline Node */}
                  <div
                    className={cn(
                      "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white flex-shrink-0",
                      offer.response === "accepted" && "border-success",
                      offer.response === "rejected" && "border-destructive",
                      offer.response === "countered" && "border-warning",
                      offer.response === "expired" && "border-border",
                      (!offer.response || offer.response === "pending") && "border-info"
                    )}
                  >
                    <StatusIcon
                      className={cn(
                        "h-5 w-5",
                        offer.response === "accepted" && "text-success",
                        offer.response === "rejected" && "text-destructive",
                        offer.response === "countered" && "text-warning",
                        offer.response === "expired" && "text-muted-foreground",
                        (!offer.response || offer.response === "pending") && "text-info"
                      )}
                    />
                  </div>

                  {/* Offer Card */}
                  <Card
                    variant="default"
                    padding="md"
                    className={cn(
                      "flex-1 transition-all",
                      index === 0 && "ring-1 ring-accent/20"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-h2 font-semibold text-foreground tabular-nums">
                            {formatCurrency(Number(offer.offer_amount))}
                          </span>
                          <Badge variant={typeConfig.variant} size="sm">
                            {typeConfig.label}
                          </Badge>
                          <Badge variant={statusConfig.variant} size="sm">
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-small text-muted-foreground">
                          <span>
                            {offer.sent_date
                              ? format(new Date(offer.sent_date), "MMM d, yyyy")
                              : offer.created_at
                              ? format(new Date(offer.created_at), "MMM d, yyyy")
                              : "Draft"}
                          </span>
                          {offer.sent_via && (
                            <span className="flex items-center gap-1">
                              <SentViaIcon className="h-3.5 w-3.5" />
                              <span className="capitalize">{offer.sent_via.replace("_", " ")}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {offer.response === "countered" && offer.counter_amount && (
                          <div className="text-right mr-4">
                            <div className="text-tiny uppercase tracking-wide text-muted-foreground mb-0.5">
                              Counter
                            </div>
                            <div className="text-h3 font-semibold text-warning tabular-nums">
                              {formatCurrency(Number(offer.counter_amount))}
                            </div>
                          </div>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 hover:bg-background-secondary rounded-small transition-colors">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 bg-white">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(offer.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {offer.notes && (
                      <p className="text-small text-muted-foreground bg-background-secondary/50 rounded-small p-3 line-clamp-2">
                        {offer.notes}
                      </p>
                    )}

                    {offer.response === "countered" && (
                      <div className="flex gap-2 mt-4">
                        <Button variant="primary" size="sm">Accept Counter</Button>
                        <Button variant="secondary" size="sm">Counter Back</Button>
                        <Button variant="ghost" size="sm">Decline</Button>
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      <AddOfferModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        propertyId={id || ""}
      />
    </div>
  );
}
