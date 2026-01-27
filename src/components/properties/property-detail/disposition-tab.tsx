import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  Send,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Zap,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  useMatchingBuyers,
  usePropertyBuyerResponses,
  usePropertyDealsSent,
  useUpdateBuyerResponse,
  type PropertyForMatching,
  type BuyerMatch,
} from "@/hooks/useBuyerMatching";
import { SendDealModal } from "./send-deal-modal";
import { DispositionPipeline } from "./disposition-pipeline";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface DispositionTabProps {
  property: PropertyForMatching;
}

function getMatchScoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-muted-foreground";
}

function getMatchScoreBadge(score: number) {
  if (score >= 80) return <Badge variant="success" size="sm">{score}</Badge>;
  if (score >= 60) return <Badge variant="warning" size="sm">{score}</Badge>;
  return <Badge variant="secondary" size="sm">{score}</Badge>;
}

function BuyBoxFitBadge({ match }: { match: BuyerMatch }) {
  const details = match.matchDetails;
  const matchCount = [
    details.propertyTypeMatch,
    details.priceMatch,
    details.areaMatch,
    details.conditionMatch,
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-1">
      {details.propertyTypeMatch && (
        <span className="text-tiny text-success">Type</span>
      )}
      {details.priceMatch && (
        <span className="text-tiny text-success">Price</span>
      )}
      {details.areaMatch && (
        <span className="text-tiny text-success">Area</span>
      )}
      {!details.propertyTypeMatch && !details.priceMatch && !details.areaMatch && (
        <span className="text-tiny text-muted-foreground">Partial</span>
      )}
    </div>
  );
}

export function DispositionTab({ property }: DispositionTabProps) {
  const navigate = useNavigate();
  const [selectedBuyers, setSelectedBuyers] = React.useState<Set<string>>(new Set());
  const [showSendModal, setShowSendModal] = React.useState(false);
  const [sendToBuyers, setSendToBuyers] = React.useState<BuyerMatch[]>([]);
  const [showPipeline, setShowPipeline] = React.useState(false);

  const { data: matches, isLoading, refetch } = useMatchingBuyers(property);
  const { data: responses } = usePropertyBuyerResponses(property.id);
  const { data: dealsSent } = usePropertyDealsSent(property.id);
  const updateResponse = useUpdateBuyerResponse();

  const toggleBuyer = (buyerId: string) => {
    const next = new Set(selectedBuyers);
    if (next.has(buyerId)) {
      next.delete(buyerId);
    } else {
      next.add(buyerId);
    }
    setSelectedBuyers(next);
  };

  const selectAll = () => {
    if (matches) {
      setSelectedBuyers(new Set(matches.map((m) => m.buyer.id)));
    }
  };

  const clearSelection = () => {
    setSelectedBuyers(new Set());
  };

  const handleSendToSelected = () => {
    if (matches) {
      const selected = matches.filter((m) => selectedBuyers.has(m.buyer.id));
      setSendToBuyers(selected);
      setShowSendModal(true);
    }
  };

  const handleSendToSingle = (match: BuyerMatch) => {
    setSendToBuyers([match]);
    setShowSendModal(true);
  };

  const handleBlastAll = () => {
    if (matches) {
      setSendToBuyers(matches.filter((m) => m.matchScore >= 60));
      setShowSendModal(true);
    }
  };

  const handleResponse = (
    buyerId: string,
    response: "interested" | "passed" | "no_response"
  ) => {
    updateResponse.mutate({
      propertyId: property.id,
      buyerId,
      response,
    });
  };

  // Count interested buyers
  const interestedCount = Object.values(responses || {}).filter(
    (r) => r.response === "interested"
  ).length;

  // Get buyers who were sent this deal
  const sentBuyerIds = new Set(
    dealsSent?.map((d) => d.target_id) || []
  );

  // Sort matches - interested first, then by match score
  const sortedMatches = React.useMemo(() => {
    if (!matches) return [];
    return [...matches].sort((a, b) => {
      const aInterested = responses?.[a.buyer.id]?.response === "interested" ? 1 : 0;
      const bInterested = responses?.[b.buyer.id]?.response === "interested" ? 1 : 0;
      if (aInterested !== bInterested) return bInterested - aInterested;
      return b.matchScore - a.matchScore;
    });
  }, [matches, responses]);

  return (
    <div className="p-lg space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-brand" />
            </div>
            <div>
              <div className="text-h3 font-bold">{matches?.length || 0}</div>
              <div className="text-small text-muted-foreground">Matching Buyers</div>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-info" />
            </div>
            <div>
              <div className="text-h3 font-bold">{sentBuyerIds.size}</div>
              <div className="text-small text-muted-foreground">Buyers Contacted</div>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <ThumbsUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-h3 font-bold">{interestedCount}</div>
              <div className="text-small text-muted-foreground">Interested</div>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <div className="text-h3 font-bold">
                {matches?.length ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length) : 0}
              </div>
              <div className="text-small text-muted-foreground">Avg Match Score</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            icon={<Search />}
            onClick={() => refetch()}
          >
            Find Matching Buyers
          </Button>
          {matches && matches.length > 0 && (
            <Button
              variant="secondary"
              icon={<Zap />}
              onClick={handleBlastAll}
            >
              Blast to All Matching
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPipeline(!showPipeline)}
          >
            {showPipeline ? "Hide Pipeline" : "Show Pipeline"}
          </Button>
          <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Pipeline View */}
      {showPipeline && (
        <DispositionPipeline
          propertyId={property.id}
          matches={matches || []}
          responses={responses || {}}
        />
      )}

      {/* Selection Actions */}
      {selectedBuyers.size > 0 && (
        <Card variant="elevated" padding="sm" className="sticky top-0 z-10 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-small font-medium">
              {selectedBuyers.size} buyer{selectedBuyers.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
              <Button variant="primary" size="sm" icon={<Send />} onClick={handleSendToSelected}>
                Send Deal to Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Matched Buyers Table */}
      <Card variant="default" padding="none">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-body font-semibold">Matched Buyers</h2>
          {matches && matches.length > 0 && (
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Select All
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : sortedMatches.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-h3 font-semibold mb-2">No matching buyers</h3>
            <p className="text-muted-foreground mb-4">
              Add buyers with matching buy box criteria to see them here
            </p>
            <Button variant="secondary" onClick={() => navigate("/buyers")}>
              Manage Buyers
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-center">Match Score</TableHead>
                <TableHead>Buy Box Fit</TableHead>
                <TableHead className="text-center">Reliability</TableHead>
                <TableHead className="text-center">Deals Closed</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatches.map((match) => {
                const response = responses?.[match.buyer.id];
                const wasSent = sentBuyerIds.has(match.buyer.id);

                return (
                  <TableRow
                    key={match.buyer.id}
                    className={cn(
                      response?.response === "interested" && "bg-success/5"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedBuyers.has(match.buyer.id)}
                        onCheckedChange={() => toggleBuyer(match.buyer.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{match.buyer.name}</span>
                        {match.buyer.company && (
                          <span className="text-muted-foreground ml-1">
                            ({match.buyer.company})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "text-h3 font-bold",
                          getMatchScoreColor(match.matchScore)
                        )}
                      >
                        {match.matchScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      <BuyBoxFitBadge match={match} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          match.buyer.reliability_score >= 80
                            ? "success"
                            : match.buyer.reliability_score >= 50
                            ? "warning"
                            : "error"
                        }
                        size="sm"
                      >
                        {match.buyer.reliability_score}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {match.buyer.deals_closed}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {match.buyer.last_activity
                        ? formatDistanceToNow(new Date(match.buyer.last_activity), {
                            addSuffix: true,
                          })
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {response?.response === "interested" ? (
                        <Badge variant="success" size="sm">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Interested
                        </Badge>
                      ) : response?.response === "passed" ? (
                        <Badge variant="error" size="sm">
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          Passed
                        </Badge>
                      ) : wasSent ? (
                        <Badge variant="info" size="sm">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">
                          Not Sent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem onClick={() => handleSendToSingle(match)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Deal
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/buyers/${match.buyer.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Buyer
                          </DropdownMenuItem>
                          {wasSent && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleResponse(match.buyer.id, "interested")}
                                className="text-success"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark Interested
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResponse(match.buyer.id, "passed")}
                                className="text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Mark Passed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResponse(match.buyer.id, "no_response")}
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                No Response
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Send Deal Modal */}
      <SendDealModal
        open={showSendModal}
        onOpenChange={setShowSendModal}
        property={property}
        buyers={sendToBuyers}
      />
    </div>
  );
}
