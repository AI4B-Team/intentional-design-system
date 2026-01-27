import * as React from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  MessageSquare,
  Mail,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronUp,
  Send,
  Voicemail,
  CheckCircle,
  Info,
} from "lucide-react";
import { usePropertyOutreach } from "@/hooks/useProperty";
import { AddOutreachModal } from "./add-outreach-modal";
import { AIConversationsSection } from "./ai-conversations-section";
import { format, formatDistanceToNow } from "date-fns";

type Channel = "sms" | "email" | "call" | "dm" | "mail" | "voicemail";

function getTypeIcon(channel: string | null) {
  switch (channel) {
    case "sms":
      return MessageSquare;
    case "email":
      return Mail;
    case "call":
      return Phone;
    case "dm":
      return Send;
    case "mail":
      return Mail;
    case "voicemail":
      return Voicemail;
    default:
      return Phone;
  }
}

function getTypeColor(channel: string | null) {
  switch (channel) {
    case "sms":
      return "bg-info/10 text-info";
    case "email":
      return "bg-purple-100 text-purple-600";
    case "call":
      return "bg-success/10 text-success";
    case "dm":
      return "bg-accent/10 text-accent";
    case "mail":
      return "bg-warning/10 text-warning";
    case "voicemail":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusVariant(status: string | null): "success" | "warning" | "info" | "secondary" | "error" {
  switch (status) {
    case "responded":
      return "success";
    case "opened":
      return "info";
    case "delivered":
      return "secondary";
    case "failed":
      return "error";
    default:
      return "secondary";
  }
}

const channelFilters = ["all", "sms", "email", "call", "dm", "mail"] as const;

interface OutreachTabProps {
  ownerPhone?: string | null;
}

export function OutreachTab({ ownerPhone }: OutreachTabProps) {
  const { id } = useParams();
  const { data: outreach, isLoading } = usePropertyOutreach(id);
  
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [filter, setFilter] = React.useState<typeof channelFilters[number]>("all");

  // Check if any outreach has opted_in
  const hasOptedIn = outreach?.some((o) => o.opted_in);

  const filteredOutreach = React.useMemo(() => {
    if (!outreach) return [];
    if (filter === "all") return outreach;
    return outreach.filter((o) => o.channel === filter);
  }, [outreach, filter]);

  // Group by date
  const groupedOutreach = React.useMemo(() => {
    return filteredOutreach.reduce((groups, activity) => {
      const date = activity.created_at
        ? format(new Date(activity.created_at), "MMM d, yyyy")
        : "Unknown";
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    }, {} as Record<string, typeof filteredOutreach>);
  }, [filteredOutreach]);

  if (isLoading) {
    return (
      <div className="p-lg space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-lg space-y-lg">
      {/* AI Conversations Section */}
      {id && <AIConversationsSection propertyId={id} ownerPhone={ownerPhone} />}

      {/* Manual Outreach Section */}
      <div>
      {/* Opt-in Banner */}
      {hasOptedIn ? (
        <div className="flex items-center gap-2 p-3 mb-lg bg-success/10 border border-success/20 rounded-medium">
          <CheckCircle className="h-5 w-5 text-success" />
          <span className="text-small font-medium text-success">
            Seller has opted in - eligible for AI calling
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 mb-lg bg-info/10 border border-info/20 rounded-medium">
          <Info className="h-5 w-5 text-info" />
          <span className="text-small font-medium text-info">
            Seller has not opted in yet
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-lg flex-wrap gap-3">
        <div>
          <h3 className="text-h3 font-medium text-foreground">Outreach History</h3>
          <p className="text-small text-muted-foreground">{outreach?.length || 0} interactions</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-1 bg-background-secondary rounded-medium p-1 overflow-x-auto">
            {channelFilters.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={cn(
                  "px-3 py-1.5 text-small font-medium rounded-small transition-colors capitalize whitespace-nowrap",
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
            Log Contact
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {filteredOutreach.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h4 className="text-h3 font-medium text-foreground mb-2">No outreach yet</h4>
          <p className="text-small text-muted-foreground mb-4">
            Log your first contact with the seller.
          </p>
          <Button variant="secondary" size="sm" icon={<Plus />} onClick={() => setShowAddModal(true)}>
            Log Contact
          </Button>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {/* Grouped Activities */}
          <div className="space-y-6">
            {Object.entries(groupedOutreach).map(([date, dateActivities]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="relative flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-background-tertiary flex items-center justify-center z-10">
                    <span className="text-tiny font-medium text-muted-foreground">
                      {date.slice(0, 3)}
                    </span>
                  </div>
                  <span className="text-small font-medium text-foreground">{date}</span>
                </div>

                {/* Activities for this date */}
                <div className="ml-14 space-y-3">
                  {dateActivities.map((activity) => {
                    const Icon = getTypeIcon(activity.channel);
                    const colorClass = getTypeColor(activity.channel);
                    const isExpanded = expandedId === activity.id;
                    const hasFullContent = activity.content && activity.content.length > 100;

                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          "relative bg-white border border-border-subtle rounded-medium p-4 transition-all",
                          hasFullContent && "cursor-pointer hover:border-border"
                        )}
                        onClick={() => hasFullContent && setExpandedId(isExpanded ? null : activity.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
                            <Icon className="h-4 w-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-body font-medium text-foreground capitalize">
                                {activity.channel}
                              </span>
                              {activity.direction === "outbound" ? (
                                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : (
                                <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
                              )}
                              {activity.status && (
                                <Badge variant={getStatusVariant(activity.status)} size="sm">
                                  {activity.status}
                                </Badge>
                              )}
                              {activity.opted_in && (
                                <Badge variant="success" size="sm">
                                  Opted In
                                </Badge>
                              )}
                            </div>

                            {activity.content && (
                              <p className={cn(
                                "text-small text-muted-foreground whitespace-pre-wrap",
                                !isExpanded && "line-clamp-2"
                              )}>
                                {activity.content}
                              </p>
                            )}

                            {activity.response_content && (
                              <div className="mt-2 p-2 bg-success/5 border-l-2 border-success rounded-r-small">
                                <p className="text-small text-foreground">
                                  <span className="font-medium">Response:</span> {activity.response_content}
                                </p>
                              </div>
                            )}

                            {hasFullContent && (
                              <button className="flex items-center gap-1 text-tiny text-accent mt-2 hover:underline">
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-3 w-3" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3" />
                                    Show more
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Time */}
                          <span className="text-tiny text-muted-foreground flex-shrink-0">
                            {activity.created_at
                              ? format(new Date(activity.created_at), "h:mm a")
                              : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <AddOutreachModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        propertyId={id || ""}
      />
      </div>
    </div>
  );
}
