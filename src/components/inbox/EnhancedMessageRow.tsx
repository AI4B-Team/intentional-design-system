import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Mail,
  MessageSquare,
  Phone,
  FileText,
  Star,
  StarOff,
  ChevronRight,
  Building2,
  TrendingUp,
  Clock,
  Eye,
  CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { InboxMessage } from "@/hooks/useAcquireFlow";
import type { MessageAnalysis } from "@/hooks/useInboxAI";
import { getPriorityColor } from "@/hooks/useInboxAI";

interface EnhancedMessageRowProps {
  message: InboxMessage;
  analysis?: MessageAnalysis | null;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
  onToggleStar: () => void;
  showRichPreview?: boolean;
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
    case "email": return "text-info";
    case "sms": return "text-success";
    case "phone": return "text-warning";
    case "mail": return "text-brand";
    default: return "text-content-tertiary";
  }
}

export function EnhancedMessageRow({
  message,
  analysis,
  selected,
  onSelect,
  onClick,
  onToggleStar,
  showRichPreview = true,
}: EnhancedMessageRowProps) {
  const ChannelIcon = getChannelIcon(message.channel);
  const isUnread = !message.is_read;
  const channelColor = getChannelColor(message.channel);

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 border-b border-border-subtle cursor-pointer transition-all duration-200",
        isUnread ? "bg-brand/5" : "bg-white dark:bg-background",
        selected && "bg-brand/10",
        "hover:bg-muted/50"
      )}
    >
      {/* Checkbox & Star */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          className="text-content-tertiary hover:text-warning transition-colors"
        >
          {message.is_starred ? (
            <Star className="h-4 w-4 fill-warning text-warning" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0" onClick={onClick}>
        {/* Top Row: Channel, Name, Priority, Time */}
        <div className="flex items-center gap-2 mb-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("flex items-center gap-1", channelColor)}>
                <ChannelIcon className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>{message.channel.charAt(0).toUpperCase() + message.channel.slice(1)}</TooltipContent>
          </Tooltip>

          <span className={cn(
            "text-small truncate",
            isUnread ? "font-semibold text-content" : "text-content-secondary"
          )}>
            {message.contact_name || message.contact_email || "Unknown"}
          </span>

          {message.contact_type && (
            <Badge variant="secondary" size="sm" className="text-tiny flex-shrink-0">
              {message.contact_type}
            </Badge>
          )}

          {/* Priority Badge from AI */}
          {analysis && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded text-tiny font-medium",
                  analysis.priority.level === 'urgent' && "bg-destructive/10 text-destructive",
                  analysis.priority.level === 'high' && "bg-warning/10 text-warning",
                  analysis.priority.level === 'medium' && "bg-info/10 text-info",
                  analysis.priority.level === 'low' && "bg-muted text-muted-foreground"
                )}>
                  <TrendingUp className="h-3 w-3" />
                  {analysis.priority.score}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-tiny">
                  <div className="font-medium">{analysis.priority.level.toUpperCase()} Priority</div>
                  <div className="text-muted-foreground">{analysis.priority.reason}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Time */}
          <span className="text-tiny text-content-tertiary ml-auto flex-shrink-0">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Subject Line */}
        <div className={cn(
          "text-body truncate",
          isUnread ? "font-medium" : "text-content-secondary"
        )}>
          {message.subject || "(No subject)"}
        </div>

        {/* AI Summary or Body Preview */}
        {analysis ? (
          <p className="text-small text-brand/80 truncate mt-0.5 italic">
            ✨ {analysis.summary}
          </p>
        ) : message.body && (
          <p className="text-small text-content-tertiary truncate mt-0.5">
            {message.body.slice(0, 100)}
          </p>
        )}

        {/* Rich Preview Row */}
        {showRichPreview && (
          <div className="flex items-center gap-3 mt-2">
            {/* Property */}
            {message.properties && (
              <div className="flex items-center gap-1 text-tiny text-content-tertiary">
                <Building2 className="h-3 w-3" />
                <span className="truncate max-w-32">{message.properties.address}</span>
              </div>
            )}

            {/* Offer Amount */}
            {message.offers && (
              <Badge variant="success" size="sm" className="text-tiny">
                ${message.offers.offer_amount.toLocaleString()}
              </Badge>
            )}

            {/* Sentiment */}
            {analysis && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm">
                    {analysis.sentiment.type === 'positive' && '😊'}
                    {analysis.sentiment.type === 'eager' && '🔥'}
                    {analysis.sentiment.type === 'negative' && '😟'}
                    {analysis.sentiment.type === 'frustrated' && '😤'}
                    {analysis.sentiment.type === 'skeptical' && '🤔'}
                    {analysis.sentiment.type === 'neutral' && '😐'}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {analysis.sentiment.type.charAt(0).toUpperCase() + analysis.sentiment.type.slice(1)} sentiment
                </TooltipContent>
              </Tooltip>
            )}

            {/* Response Alert */}
            {analysis?.responseTimeAlert.shouldAlert && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Clock className="h-3 w-3 text-warning animate-pulse" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48">
                  {analysis.responseTimeAlert.message}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      {/* Direction Indicator */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <Tooltip>
          <TooltipTrigger asChild>
            {message.direction === 'inbound' ? (
              <Eye className="h-4 w-4 text-info" />
            ) : (
              <CheckCheck className="h-4 w-4 text-success" />
            )}
          </TooltipTrigger>
          <TooltipContent>
            {message.direction === 'inbound' ? 'Received' : 'Sent'}
          </TooltipContent>
        </Tooltip>
        <ChevronRight className="h-4 w-4 text-content-tertiary" />
      </div>
    </div>
  );
}

export function MessageRowSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-border-subtle">
      <div className="flex flex-col items-center gap-2 pt-1">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
