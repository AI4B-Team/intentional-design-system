import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Bot,
  Play,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  Calendar,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  useClosebotConnection,
  useClosebotConversations,
  useTriggerClosebotConversation,
  MOCK_CLOSEBOT_BOTS,
  type ClosebotConversation,
} from "@/hooks/useClosebotIntegration";

interface AIConversationsSectionProps {
  propertyId: string;
  ownerPhone?: string | null;
}

function getOutcomeConfig(outcome: string | null) {
  switch (outcome) {
    case "qualified":
      return { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Qualified" };
    case "appointment_set":
      return { icon: Calendar, color: "text-info", bg: "bg-info/10", label: "Appointment Set" };
    case "not_qualified":
      return { icon: XCircle, color: "text-warning", bg: "bg-warning/10", label: "Not Qualified" };
    case "no_response":
      return { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: "No Response" };
    default:
      return { icon: MessageSquare, color: "text-content-secondary", bg: "bg-muted", label: outcome || "Unknown" };
  }
}

function getStatusConfig(status: string | null) {
  switch (status) {
    case "active":
      return { color: "text-info", label: "In Progress", animate: true };
    case "completed":
      return { color: "text-success", label: "Completed", animate: false };
    case "failed":
      return { color: "text-destructive", label: "Failed", animate: false };
    default:
      return { color: "text-muted-foreground", label: status || "Unknown", animate: false };
  }
}

function ConversationCard({ conversation }: { conversation: ClosebotConversation }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const outcomeConfig = getOutcomeConfig(conversation.outcome);
  const statusConfig = getStatusConfig(conversation.status);
  const OutcomeIcon = outcomeConfig.icon;

  const collectedData = conversation.collected_data as Record<string, unknown> | null;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border border-border-subtle rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", outcomeConfig.bg)}>
                <OutcomeIcon className={cn("h-5 w-5", outcomeConfig.color)} />
              </div>
              <div className="text-left">
                <p className="text-small font-medium text-content">
                  {conversation.bot_name || "AI Bot"}
                </p>
                <p className="text-tiny text-content-tertiary">
                  {conversation.started_at &&
                    formatDistanceToNow(new Date(conversation.started_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {statusConfig.animate && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-info"></span>
                  </span>
                )}
                <span className={cn("text-tiny font-medium", statusConfig.color)}>
                  {statusConfig.label}
                </span>
              </div>

              {conversation.status === "completed" && (
                <Badge variant={
                  conversation.outcome === "qualified" || conversation.outcome === "appointment_set"
                    ? "success"
                    : conversation.outcome === "not_qualified"
                    ? "warning"
                    : "secondary"
                } size="sm">
                  {outcomeConfig.label}
                </Badge>
              )}

              {conversation.appointment_set && (
                <Badge variant="info" size="sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  Appt
                </Badge>
              )}

              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-content-tertiary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-content-tertiary" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border-subtle pt-4">
            {/* Data Captured */}
            {collectedData && Object.keys(collectedData).length > 0 && (
              <div>
                <p className="text-tiny font-medium text-content-secondary mb-2">Data Captured</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(collectedData).map(([key, value]) => (
                    <div key={key} className="p-2 bg-muted/30 rounded-md">
                      <p className="text-tiny text-content-tertiary capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-small font-medium text-content">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript */}
            {conversation.transcript && (
              <div>
                <p className="text-tiny font-medium text-content-secondary mb-2">Conversation Transcript</p>
                <div className="p-3 bg-muted/30 rounded-lg max-h-48 overflow-y-auto">
                  <pre className="text-tiny text-content-secondary whitespace-pre-wrap font-sans">
                    {conversation.transcript}
                  </pre>
                </div>
              </div>
            )}

            {/* Appointment Info */}
            {conversation.appointment_set && conversation.appointment_time && (
              <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-info" />
                  <p className="text-small font-medium text-info">
                    Appointment: {format(new Date(conversation.appointment_time), "PPp")}
                  </p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center justify-between text-tiny text-content-tertiary">
              <span>
                Started: {conversation.started_at && format(new Date(conversation.started_at), "PPp")}
              </span>
              {conversation.completed_at && (
                <span>
                  Completed: {format(new Date(conversation.completed_at), "PPp")}
                </span>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function AIConversationsSection({ propertyId, ownerPhone }: AIConversationsSectionProps) {
  const { data: connection, isLoading: connectionLoading } = useClosebotConnection();
  const { data: conversations, isLoading: conversationsLoading, refetch } = useClosebotConversations(propertyId);
  const triggerConversation = useTriggerClosebotConversation();

  const isConnected = connection?.is_active;
  const hasPhone = !!ownerPhone;
  const activeConversation = conversations?.find((c) => c.status === "active");

  // Auto-refresh when there's an active conversation
  React.useEffect(() => {
    if (activeConversation) {
      const interval = setInterval(() => {
        refetch();
      }, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [activeConversation, refetch]);

  const handleStartConversation = (botType: "seller_qualification" | "buyer_qualification" | "followup") => {
    if (!ownerPhone) return;
    triggerConversation.mutate({
      propertyId,
      botType,
      phoneNumber: ownerPhone,
    });
  };

  if (connectionLoading) {
    return null;
  }

  if (!isConnected) {
    return (
      <Card variant="default" padding="md" className="border-dashed">
        <CardContent className="py-8 text-center">
          <Bot className="h-10 w-10 mx-auto mb-3 text-content-tertiary opacity-50" />
          <p className="text-small text-content-secondary mb-2">
            AI Conversations not configured
          </p>
          <p className="text-tiny text-content-tertiary mb-4">
            Connect Closebot.ai to enable AI-powered lead qualification
          </p>
          <Button variant="secondary" size="sm" asChild>
            <a href="/settings/integrations">Configure Integration</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="none">
      <CardHeader className="border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-brand" />
            </div>
            <div>
              <CardTitle className="text-h4">AI Conversations</CardTitle>
              <CardDescription>Closebot.ai powered qualification</CardDescription>
            </div>
          </div>

          {hasPhone ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={triggerConversation.isPending || !!activeConversation}
                >
                  {triggerConversation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Start AI Conversation
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStartConversation("seller_qualification")}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Seller Qualification Bot
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStartConversation("followup")}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Follow-up Bot
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStartConversation("buyer_qualification")}>
                  <Bot className="h-4 w-4 mr-2" />
                  Buyer Qualification Bot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge variant="warning" size="sm">
              <AlertCircle className="h-3 w-3 mr-1" />
              No phone number
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Active Conversation Banner */}
        {activeConversation && (
          <div className="mb-4 p-4 bg-info/10 border border-info/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-info"></span>
                </span>
                <div>
                  <p className="text-small font-medium text-info">
                    AI Conversation in Progress
                  </p>
                  <p className="text-tiny text-info/80">
                    {activeConversation.bot_name} is currently talking to this lead
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Conversations List */}
        {conversationsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 text-content-tertiary opacity-50" />
            <p className="text-small text-content-secondary">No AI conversations yet</p>
            <p className="text-tiny text-content-tertiary mt-1">
              Start an AI conversation to qualify this lead
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
