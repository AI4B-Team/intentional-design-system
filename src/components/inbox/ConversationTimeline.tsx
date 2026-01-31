import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { InboxMessage } from "@/hooks/useAcquireFlow";

interface ConversationTimelineProps {
  messages: InboxMessage[];
  currentMessageId: string;
  open: boolean;
  onClose: () => void;
  onSelectMessage: (id: string) => void;
}

function getChannelIcon(channel: string) {
  switch (channel) {
    case "email": return Mail;
    case "sms": return MessageSquare;
    case "phone": return Phone;
    case "mail": return FileText;
    default: return Mail;
  }
}

function getChannelColor(channel: string) {
  switch (channel) {
    case "email": return "border-info bg-info/10";
    case "sms": return "border-success bg-success/10";
    case "phone": return "border-warning bg-warning/10";
    case "mail": return "border-brand bg-brand/10";
    default: return "border-border bg-muted";
  }
}

export function ConversationTimeline({
  messages,
  currentMessageId,
  open,
  onClose,
  onSelectMessage,
}: ConversationTimelineProps) {
  // Sort messages by date
  const sortedMessages = React.useMemo(() => {
    return [...messages].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [messages]);

  // Group by date
  const groupedMessages = React.useMemo(() => {
    const groups: Record<string, InboxMessage[]> = {};
    sortedMessages.forEach((msg) => {
      const date = format(new Date(msg.created_at), "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  }, [sortedMessages]);

  const dates = Object.keys(groupedMessages).sort();

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand" />
            Conversation Timeline
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-96">
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border-subtle" />

            {dates.map((date, dateIndex) => (
              <div key={date} className="mb-6">
                {/* Date header */}
                <div className="flex items-center gap-2 mb-3 -ml-6">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center z-10">
                    <Calendar className="h-3 w-3 text-content-tertiary" />
                  </div>
                  <span className="text-small font-medium text-content-secondary">
                    {format(new Date(date), "MMMM d, yyyy")}
                  </span>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {groupedMessages[date].map((msg) => {
                    const ChannelIcon = getChannelIcon(msg.channel);
                    const channelStyle = getChannelColor(msg.channel);
                    const isCurrentMessage = msg.id === currentMessageId;
                    const isInbound = msg.direction === 'inbound';

                    return (
                      <button
                        key={msg.id}
                        onClick={() => {
                          onSelectMessage(msg.id);
                          onClose();
                        }}
                        className={cn(
                          "w-full text-left relative",
                          "transition-all duration-200 hover:translate-x-1"
                        )}
                      >
                        {/* Timeline dot */}
                        <div className={cn(
                          "absolute -left-6 top-3 h-3 w-3 rounded-full border-2 z-10",
                          isCurrentMessage 
                            ? "bg-brand border-brand" 
                            : "bg-background border-border-subtle"
                        )} />

                        {/* Message card */}
                        <div className={cn(
                          "p-3 rounded-lg border transition-colors",
                          isCurrentMessage 
                            ? "border-brand bg-brand/5" 
                            : "border-border-subtle hover:border-brand/30"
                        )}>
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn(
                              "h-6 w-6 rounded-full border flex items-center justify-center",
                              channelStyle
                            )}>
                              <ChannelIcon className="h-3 w-3" />
                            </div>
                            
                            <div className="flex items-center gap-1 flex-1">
                              {isInbound ? (
                                <ArrowDownLeft className="h-3 w-3 text-info" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3 text-success" />
                              )}
                              <span className="text-tiny text-content-tertiary">
                                {isInbound ? 'Received' : 'Sent'}
                              </span>
                            </div>

                            <span className="text-tiny text-content-tertiary">
                              {format(new Date(msg.created_at), "h:mm a")}
                            </span>
                          </div>

                          {/* Contact */}
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3 text-content-tertiary" />
                            <span className="text-small font-medium">
                              {msg.contact_name || msg.contact_email || "Unknown"}
                            </span>
                            {msg.contact_type && (
                              <Badge variant="secondary" size="sm" className="text-tiny">
                                {msg.contact_type}
                              </Badge>
                            )}
                          </div>

                          {/* Subject/Preview */}
                          {msg.subject && (
                            <p className="text-small font-medium truncate">
                              {msg.subject}
                            </p>
                          )}
                          {msg.body && (
                            <p className="text-tiny text-content-tertiary line-clamp-2 mt-1">
                              {msg.body}
                            </p>
                          )}

                          {/* Property */}
                          {msg.properties && (
                            <div className="flex items-center gap-1 mt-2 text-tiny text-content-tertiary">
                              <Building2 className="h-3 w-3" />
                              <span>{msg.properties.address}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
