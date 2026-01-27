import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
} from "lucide-react";
import { useDealSourceOutreach, useLogDealSourceContact } from "@/hooks/useDealSourceDetail";
import { format, formatDistanceToNow, parseISO } from "date-fns";

interface OutreachTabProps {
  sourceId: string;
}

type Channel = "sms" | "email" | "call" | "dm" | "voicemail";

const channelFilters = ["all", "sms", "email", "call", "dm", "voicemail"] as const;

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
      return "bg-pink-100 text-pink-600";
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

export function DealSourceOutreachTab({ sourceId }: OutreachTabProps) {
  const { data: outreach, isLoading } = useDealSourceOutreach(sourceId);
  const logContact = useLogDealSourceContact();

  const [filter, setFilter] = useState<typeof channelFilters[number]>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logChannel, setLogChannel] = useState<Channel>("call");
  const [logContent, setLogContent] = useState("");

  const filteredOutreach = React.useMemo(() => {
    if (!outreach) return [];
    if (filter === "all") return outreach;
    return outreach.filter((o) => o.channel === filter);
  }, [outreach, filter]);

  const groupedOutreach = React.useMemo(() => {
    return filteredOutreach.reduce((groups, activity) => {
      const date = activity.created_at
        ? format(parseISO(activity.created_at), "MMM d, yyyy")
        : "Unknown";
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    }, {} as Record<string, typeof filteredOutreach>);
  }, [filteredOutreach]);

  const handleLogContact = async () => {
    await logContact.mutateAsync({
      sourceId,
      channel: logChannel,
      content: logContent || undefined,
    });
    setShowLogModal(false);
    setLogContent("");
  };

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
    <div className="p-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg flex-wrap gap-3">
        <div>
          <h3 className="text-h3 font-medium text-content">Outreach History</h3>
          <p className="text-small text-content-secondary">{outreach?.length || 0} interactions</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-1 bg-surface-secondary rounded-medium p-1 overflow-x-auto">
            {channelFilters.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={cn(
                  "px-3 py-1.5 text-small font-medium rounded-small transition-colors capitalize whitespace-nowrap",
                  filter === opt
                    ? "bg-white text-content shadow-sm"
                    : "text-content-tertiary hover:text-content"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={() => setShowLogModal(true)}>
            Log Contact
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {filteredOutreach.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <MessageSquare className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
          <h4 className="text-h3 font-medium text-content mb-2">No outreach yet</h4>
          <p className="text-small text-content-secondary mb-4">
            Log your first contact with this source.
          </p>
          <Button variant="secondary" size="sm" icon={<Plus />} onClick={() => setShowLogModal(true)}>
            Log Contact
          </Button>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border-subtle" />

          <div className="space-y-6">
            {Object.entries(groupedOutreach).map(([date, dateActivities]) => (
              <div key={date}>
                <div className="relative flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-surface-tertiary flex items-center justify-center z-10">
                    <span className="text-tiny font-medium text-content-tertiary">
                      {date.slice(0, 3)}
                    </span>
                  </div>
                  <span className="text-small font-medium text-content">{date}</span>
                </div>

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
                          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-body font-medium text-content capitalize">
                                {activity.channel}
                              </span>
                              {activity.direction === "outbound" ? (
                                <ArrowUpRight className="h-3.5 w-3.5 text-content-tertiary" />
                              ) : (
                                <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
                              )}
                              {activity.status && (
                                <Badge variant={getStatusVariant(activity.status)} size="sm">
                                  {activity.status}
                                </Badge>
                              )}
                            </div>

                            {activity.content && (
                              <p className={cn(
                                "text-small text-content-secondary whitespace-pre-wrap",
                                !isExpanded && "line-clamp-2"
                              )}>
                                {activity.content}
                              </p>
                            )}

                            {activity.response_content && (
                              <div className="mt-2 p-2 bg-success/5 border-l-2 border-success rounded-r-small">
                                <p className="text-small text-content">
                                  <span className="font-medium">Response:</span> {activity.response_content}
                                </p>
                              </div>
                            )}

                            {hasFullContent && (
                              <button className="flex items-center gap-1 text-tiny text-brand mt-2 hover:underline">
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

                          <span className="text-tiny text-content-tertiary flex-shrink-0">
                            {activity.created_at
                              ? format(parseISO(activity.created_at), "h:mm a")
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

      {/* Log Contact Modal */}
      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Log Contact</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label className="text-small font-medium text-content mb-2 block">Channel</label>
              <Select value={logChannel} onValueChange={(v) => setLogChannel(v as Channel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="dm">DM</SelectItem>
                  <SelectItem value="voicemail">Voicemail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-small font-medium text-content mb-2 block">Notes (optional)</label>
              <Textarea
                value={logContent}
                onChange={(e) => setLogContent(e.target.value)}
                placeholder="What did you discuss?"
                rows={4}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowLogModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLogContact}
              disabled={logContact.isPending}
            >
              {logContact.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Log Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
