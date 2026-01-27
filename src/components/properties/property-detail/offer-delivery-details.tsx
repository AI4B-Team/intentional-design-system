import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Eye,
  ExternalLink,
  XCircle,
  Calendar,
  Send,
  X,
} from "lucide-react";
import { useOfferDeliveries, useOfferFollowups, useCancelFollowups, useSendFollowupNow } from "@/hooks/useOfferTracking";
import { format, formatDistanceToNow } from "date-fns";

interface OfferDeliveryDetailsProps {
  offerId: string;
  className?: string;
}

function getChannelIcon(channel: string) {
  switch (channel) {
    case "email":
      return Mail;
    case "sms":
      return MessageSquare;
    case "mail":
      return FileText;
    default:
      return Mail;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "delivered":
      return <Badge variant="success" size="sm">Delivered</Badge>;
    case "opened":
      return <Badge variant="info" size="sm">Opened</Badge>;
    case "clicked":
      return <Badge variant="default" size="sm">Clicked</Badge>;
    case "bounced":
      return <Badge variant="error" size="sm">Bounced</Badge>;
    case "failed":
      return <Badge variant="error" size="sm">Failed</Badge>;
    case "sent":
      return <Badge variant="secondary" size="sm">Sent</Badge>;
    case "queued":
      return <Badge variant="secondary" size="sm">Queued</Badge>;
    default:
      return <Badge variant="secondary" size="sm">{status}</Badge>;
  }
}

function getFollowupStatusBadge(status: string) {
  switch (status) {
    case "sent":
      return <Badge variant="success" size="sm">Sent</Badge>;
    case "scheduled":
      return <Badge variant="info" size="sm">Scheduled</Badge>;
    case "cancelled":
      return <Badge variant="secondary" size="sm">Cancelled</Badge>;
    default:
      return <Badge variant="secondary" size="sm">{status}</Badge>;
  }
}

function TimelineNode({ status, isLast }: { status: string; isLast: boolean }) {
  const getNodeStyles = () => {
    switch (status) {
      case "delivered":
      case "opened":
      case "clicked":
        return "bg-success border-success";
      case "bounced":
      case "failed":
        return "bg-destructive border-destructive";
      case "sent":
        return "bg-info border-info";
      default:
        return "bg-muted border-border";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className={cn("h-3 w-3 rounded-full border-2", getNodeStyles())} />
      {!isLast && <div className="w-0.5 h-full min-h-[20px] bg-border" />}
    </div>
  );
}

export function OfferDeliveryDetails({ offerId, className }: OfferDeliveryDetailsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: deliveries } = useOfferDeliveries(offerId);
  const { data: followups } = useOfferFollowups(offerId);
  const cancelFollowups = useCancelFollowups();
  const sendNow = useSendFollowupNow();

  // Get delivery channel icons for summary
  const channelIcons = React.useMemo(() => {
    if (!deliveries) return [];
    const channels = [...new Set(deliveries.map(d => d.channel))];
    return channels.map(channel => {
      const Icon = getChannelIcon(channel);
      const delivery = deliveries.find(d => d.channel === channel);
      const status = delivery?.status || "queued";
      return { channel, Icon, status, opened: !!delivery?.opened_at, clicked: !!delivery?.clicked_at };
    });
  }, [deliveries]);

  // Get latest activity timestamp
  const lastActivity = React.useMemo(() => {
    if (!deliveries || deliveries.length === 0) return null;
    const timestamps = deliveries
      .flatMap(d => [d.opened_at, d.clicked_at, d.delivered_at, d.sent_at])
      .filter(Boolean) as string[];
    if (timestamps.length === 0) return null;
    return timestamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  }, [deliveries]);

  const hasDeliveries = deliveries && deliveries.length > 0;
  const hasFollowups = followups && followups.length > 0;
  const scheduledFollowups = followups?.filter(f => f.status === "scheduled") || [];
  const nextFollowup = scheduledFollowups[0];

  if (!hasDeliveries && !hasFollowups) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      {/* Summary Row */}
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between p-3 bg-background-secondary/50 rounded-small hover:bg-background-secondary transition-colors">
          <div className="flex items-center gap-4">
            {/* Channel Icons with Status */}
            <div className="flex items-center gap-2">
              {channelIcons.map(({ channel, Icon, status, opened, clicked }) => (
                <div key={channel} className="relative">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      status === "delivered" || status === "sent" ? "text-success" :
                      status === "bounced" || status === "failed" ? "text-destructive" :
                      "text-muted-foreground"
                    )}
                  />
                  {(opened || clicked) && (
                    <div className="absolute -top-1 -right-1">
                      {clicked ? (
                        <ExternalLink className="h-2.5 w-2.5 text-brand" />
                      ) : (
                        <Eye className="h-2.5 w-2.5 text-info" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Last Activity */}
            {lastActivity && (
              <span className="text-tiny text-muted-foreground">
                Last activity: {formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-tiny text-muted-foreground">View Delivery Details</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="pt-3 space-y-4">
          {/* Deliveries Table */}
          {hasDeliveries && (
            <div className="border border-border-subtle rounded-small overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Clicked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries?.map((delivery) => {
                    const Icon = getChannelIcon(delivery.channel);
                    return (
                      <TableRow key={delivery.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{delivery.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {delivery.sent_at
                            ? format(new Date(delivery.sent_at), "MMM d, h:mm a")
                            : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                        <TableCell>
                          {delivery.opened_at ? (
                            <div className="flex items-center gap-1 text-success">
                              <Eye className="h-3.5 w-3.5" />
                              <span className="text-tiny">
                                {format(new Date(delivery.opened_at), "MMM d, h:mm a")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {delivery.clicked_at ? (
                            <div className="flex items-center gap-1 text-brand">
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span className="text-tiny">
                                {format(new Date(delivery.clicked_at), "MMM d, h:mm a")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Follow-ups */}
          {hasFollowups && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-small font-medium">Follow-up Sequence</h4>
                {scheduledFollowups.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelFollowups.mutate(offerId)}
                    disabled={cancelFollowups.isPending}
                    className="text-destructive hover:text-destructive"
                    icon={<X className="h-4 w-4" />}
                  >
                    Cancel Remaining
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {followups?.map((followup, index) => {
                  const Icon = getChannelIcon(followup.channel);
                  const isScheduled = followup.status === "scheduled";
                  const isNext = nextFollowup?.id === followup.id;
                  
                  return (
                    <div
                      key={followup.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-small border",
                        isNext ? "border-info bg-info/5" : "border-border-subtle"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          followup.status === "sent" ? "bg-success/10" :
                          followup.status === "cancelled" ? "bg-muted" :
                          "bg-info/10"
                        )}>
                          <Icon className={cn(
                            "h-4 w-4",
                            followup.status === "sent" ? "text-success" :
                            followup.status === "cancelled" ? "text-muted-foreground" :
                            "text-info"
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-small font-medium">
                              Follow-up {followup.sequence_number}
                            </span>
                            {getFollowupStatusBadge(followup.status)}
                            {isNext && <Badge variant="info" size="sm">Next</Badge>}
                          </div>
                          <div className="flex items-center gap-1 text-tiny text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {followup.status === "sent" && followup.sent_at
                              ? `Sent ${format(new Date(followup.sent_at), "MMM d, yyyy")}`
                              : followup.status === "scheduled"
                              ? `Scheduled for ${format(new Date(followup.scheduled_for), "MMM d, yyyy")}`
                              : `Was scheduled for ${format(new Date(followup.scheduled_for), "MMM d, yyyy")}`
                            }
                          </div>
                        </div>
                      </div>
                      
                      {isScheduled && isNext && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => sendNow.mutate(followup.id)}
                          disabled={sendNow.isPending}
                          icon={<Send className="h-4 w-4" />}
                        >
                          Send Now
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
