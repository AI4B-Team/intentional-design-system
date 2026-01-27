import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  CheckCircle2,
  Star,
  DollarSign,
  Calendar,
  AlertTriangle,
  Send,
  Edit,
  TrendingDown,
  Zap,
} from "lucide-react";
import { usePropertyBids, useUpdateBid, useAcceptBid, type Bid, type Contractor } from "@/hooks/useContractors";
import { BidRequestWizard } from "./bid-request-wizard";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface BidsSectionProps {
  propertyId: string;
  propertyAddress: string;
  repairDetails?: any[];
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

function StarRating({ rating }: { rating: number | null }) {
  const stars = rating || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i <= stars ? "fill-warning text-warning" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

interface EnterBidModalProps {
  bid: Bid & { contractor: Contractor };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EnterBidModal({ bid, open, onOpenChange }: EnterBidModalProps) {
  const updateBid = useUpdateBid();
  const [amount, setAmount] = React.useState(bid.bid_amount?.toString() || "");
  const [timeline, setTimeline] = React.useState(bid.timeline_days?.toString() || "");
  const [validUntil, setValidUntil] = React.useState(
    bid.valid_until || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  );
  const [notes, setNotes] = React.useState(bid.notes || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateBid.mutateAsync({
      id: bid.id,
      updates: {
        bid_amount: parseFloat(amount),
        timeline_days: parseInt(timeline),
        valid_until: validUntil,
        notes: notes || null,
        status: "received",
        received_at: new Date().toISOString(),
      },
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white">
        <DialogHeader>
          <DialogTitle>Enter Bid from {bid.contractor.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Bid Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="pl-9"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline (days)</Label>
            <Input
              id="timeline"
              type="number"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="e.g., 14"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Conditions</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={updateBid.isPending}>
              {updateBid.isPending ? "Saving..." : "Save Bid"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BidsSection({ propertyId, propertyAddress, repairDetails }: BidsSectionProps) {
  const { data: bids, isLoading } = usePropertyBids(propertyId);
  const acceptBid = useAcceptBid();
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [editingBid, setEditingBid] = React.useState<(Bid & { contractor: Contractor }) | null>(null);

  const requestedBids = bids?.filter(b => b.status === "requested") || [];
  const receivedBids = bids?.filter(b => b.status === "received") || [];
  const acceptedBid = bids?.find(b => b.status === "accepted");

  const lowestBid = receivedBids.length > 0
    ? receivedBids.reduce((min, b) => (b.bid_amount || Infinity) < (min.bid_amount || Infinity) ? b : min)
    : null;
  const fastestBid = receivedBids.length > 0
    ? receivedBids.reduce((min, b) => (b.timeline_days || Infinity) < (min.timeline_days || Infinity) ? b : min)
    : null;

  const handleAcceptBid = (bid: Bid & { contractor: Contractor }) => {
    if (!bid.bid_amount) return;
    acceptBid.mutate({
      bidId: bid.id,
      propertyId,
      amount: bid.bid_amount,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-body font-semibold">Contractor Bids</h3>
        <Button
          variant="secondary"
          size="sm"
          icon={<Send />}
          onClick={() => setIsWizardOpen(true)}
        >
          Request Bids
        </Button>
      </div>

      {isLoading ? (
        <Card variant="default" padding="md" className="animate-pulse">
          <div className="h-20 bg-muted rounded" />
        </Card>
      ) : bids && bids.length > 0 ? (
        <div className="space-y-4">
          {/* Pending Requests */}
          {requestedBids.length > 0 && (
            <Card variant="default" padding="md" className="bg-warning/5 border-warning/20">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-small font-medium">
                  Waiting for {requestedBids.length} bid(s)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {requestedBids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-small border border-border-subtle"
                  >
                    <span className="text-small">{bid.contractor.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setEditingBid(bid)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Bid Comparison Cards */}
          {receivedBids.length > 0 && !acceptedBid && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {receivedBids.map((bid) => (
                <Card
                  key={bid.id}
                  variant="default"
                  padding="md"
                  className={cn(
                    bid.id === lowestBid?.id && "ring-2 ring-success"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{bid.contractor.name}</h4>
                      <StarRating rating={bid.contractor.overall_rating} />
                    </div>
                    {bid.id === lowestBid?.id && (
                      <Badge variant="success" size="sm">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Lowest
                      </Badge>
                    )}
                    {bid.id === fastestBid?.id && bid.id !== lowestBid?.id && (
                      <Badge variant="info" size="sm">
                        <Zap className="h-3 w-3 mr-1" />
                        Fastest
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-small text-muted-foreground">Bid Amount</span>
                      <span className="text-body font-bold">{formatCurrency(bid.bid_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-small text-muted-foreground">Timeline</span>
                      <span className="text-small font-medium">{bid.timeline_days} days</span>
                    </div>
                    {bid.contractor.avg_bid_accuracy && (
                      <div className="flex justify-between">
                        <span className="text-small text-muted-foreground">Bid Accuracy</span>
                        <span className="text-small font-medium">{bid.contractor.avg_bid_accuracy}%</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAcceptBid(bid)}
                    disabled={acceptBid.isPending}
                  >
                    Accept Bid
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {/* Accepted Bid */}
          {acceptedBid && (
            <Card variant="default" padding="md" className="bg-success/5 border-success/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-body font-semibold">Accepted Bid</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-tiny text-muted-foreground">Contractor</p>
                  <p className="font-medium">{acceptedBid.contractor.name}</p>
                </div>
                <div>
                  <p className="text-tiny text-muted-foreground">Amount</p>
                  <p className="font-bold text-success">{formatCurrency(acceptedBid.bid_amount)}</p>
                </div>
                <div>
                  <p className="text-tiny text-muted-foreground">Timeline</p>
                  <p className="font-medium">{acceptedBid.timeline_days} days</p>
                </div>
              </div>
            </Card>
          )}

          {/* All Bids Table */}
          <Card variant="default" padding="none">
            <div className="p-3 border-b border-border-subtle">
              <h4 className="text-small font-medium">All Bids</h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bid.contractor.name}</div>
                        <StarRating rating={bid.contractor.overall_rating} />
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
                      {bid.received_at ? format(new Date(bid.received_at), "MMM d") : "—"}
                    </TableCell>
                    <TableCell>
                      {bid.status === "requested" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingBid(bid)}
                        >
                          Enter Bid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      ) : (
        <Card variant="default" padding="md" className="text-center">
          <p className="text-muted-foreground mb-3">No bids requested yet</p>
          <Button
            variant="primary"
            size="sm"
            icon={<Send />}
            onClick={() => setIsWizardOpen(true)}
          >
            Get Contractor Bids
          </Button>
        </Card>
      )}

      <BidRequestWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        propertyId={propertyId}
        propertyAddress={propertyAddress}
        repairDetails={repairDetails}
      />

      {editingBid && (
        <EnterBidModal
          bid={editingBid}
          open={!!editingBid}
          onOpenChange={() => setEditingBid(null)}
        />
      )}
    </div>
  );
}
