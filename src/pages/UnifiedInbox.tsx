import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Inbox,
  Star,
  Archive,
  Search,
  RefreshCw,
  ArrowLeft,
  Send,
  Brain,
  Sparkles,
  Clock,
  Zap,
  History,
  Building2,
  ChevronRight,
  Mail,
  MessageSquare,
  Phone,
  FileText,
  StarOff,
  Trash2,
  MailOpen,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useInboxMessages,
  useInboxStats,
  useUpdateInboxMessage,
  useMarkMessagesRead,
  type InboxMessage,
} from "@/hooks/useAcquireFlow";
import {
  useAnalyzeMessages,
  cacheMessageAnalysis,
  type MessageAnalysis,
} from "@/hooks/useInboxAI";
import { EnhancedMessageRow, MessageRowSkeleton } from "@/components/inbox/EnhancedMessageRow";
import { MessageAnalysisPanel } from "@/components/inbox/MessageAnalysisPanel";
import { QuickTemplatesPanel } from "@/components/inbox/QuickTemplatesPanel";
import { BulkActionsBar } from "@/components/inbox/BulkActionsBar";
import { RealTimeIndicators } from "@/components/inbox/RealTimeIndicators";
import { ConversationTimeline } from "@/components/inbox/ConversationTimeline";

type FilterTab = "inbox" | "starred" | "archived";

// Mock data for demonstration
const MOCK_MESSAGES: InboxMessage[] = [
  {
    id: "1",
    user_id: "user1",
    organization_id: null,
    property_id: "prop1",
    offer_id: null,
    campaign_id: null,
    campaign_property_id: null,
    contact_name: "John Smith",
    contact_email: "john.smith@email.com",
    contact_phone: "(512) 555-0123",
    contact_type: "Seller",
    direction: "inbound",
    channel: "email",
    subject: "Re: Cash Offer for 123 Main St",
    body: "Thank you for your offer. I've reviewed the terms and I'm interested in discussing further. When would be a good time for a call? I'm available most afternoons this week.",
    body_html: "<p>Thank you for your offer. I've reviewed the terms and I'm interested in discussing further. When would be a good time for a call? I'm available most afternoons this week.</p>",
    is_read: false,
    is_starred: true,
    is_archived: false,
    external_id: null,
    thread_id: null,
    in_reply_to: null,
    metadata: {},
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    properties: { address: "123 Main St", city: "Austin", state: "TX" },
  },
  {
    id: "2",
    user_id: "user1",
    organization_id: null,
    property_id: "prop2",
    offer_id: "offer1",
    campaign_id: null,
    campaign_property_id: null,
    contact_name: "Sarah Johnson",
    contact_email: "sarah.j@realty.com",
    contact_phone: "(512) 555-0456",
    contact_type: "Agent",
    direction: "inbound",
    channel: "sms",
    subject: null,
    body: "Hi, my client received your offer and wants to counter at $285k. Let me know if you're interested.",
    body_html: null,
    is_read: false,
    is_starred: false,
    is_archived: false,
    external_id: null,
    thread_id: null,
    in_reply_to: null,
    metadata: {},
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    properties: { address: "456 Oak Ave", city: "Round Rock", state: "TX" },
    offers: { offer_amount: 265000 },
  },
  {
    id: "3",
    user_id: "user1",
    organization_id: null,
    property_id: "prop3",
    offer_id: null,
    campaign_id: null,
    campaign_property_id: null,
    contact_name: "Mike Williams",
    contact_email: "mike.w@gmail.com",
    contact_phone: null,
    contact_type: "Seller",
    direction: "inbound",
    channel: "email",
    subject: "Question about closing timeline",
    body: "I saw you mentioned a 14-day close. Is there any flexibility on that? I need at least 30 days to find a new place.",
    body_html: null,
    is_read: true,
    is_starred: false,
    is_archived: false,
    external_id: null,
    thread_id: null,
    in_reply_to: null,
    metadata: {},
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    properties: { address: "789 Elm Blvd", city: "Cedar Park", state: "TX" },
  },
  {
    id: "4",
    user_id: "user1",
    organization_id: null,
    property_id: "prop4",
    offer_id: null,
    campaign_id: null,
    campaign_property_id: null,
    contact_name: "Lisa Chen",
    contact_email: "lisa.chen@realty.com",
    contact_phone: "(512) 555-0789",
    contact_type: "Agent",
    direction: "inbound",
    channel: "phone",
    subject: "Voicemail - Interested in offer",
    body: "Left voicemail at 2:30pm. Client is very motivated and wants to discuss the offer ASAP. Please call back.",
    body_html: null,
    is_read: true,
    is_starred: true,
    is_archived: false,
    external_id: null,
    thread_id: null,
    in_reply_to: null,
    metadata: {},
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    properties: { address: "321 Pine Dr", city: "Georgetown", state: "TX" },
  },
  {
    id: "5",
    user_id: "user1",
    organization_id: null,
    property_id: "prop5",
    offer_id: null,
    campaign_id: null,
    campaign_property_id: null,
    contact_name: "Robert Davis",
    contact_email: null,
    contact_phone: "(512) 555-0321",
    contact_type: "Seller",
    direction: "inbound",
    channel: "mail",
    subject: "Response to Direct Mail - 555 Maple Ct",
    body: "Received physical mail response. Seller is interested but has questions about the as-is condition clause.",
    body_html: null,
    is_read: true,
    is_starred: false,
    is_archived: false,
    external_id: null,
    thread_id: null,
    in_reply_to: null,
    metadata: {},
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    properties: { address: "555 Maple Ct", city: "Pflugerville", state: "TX" },
  },
];

function getChannelIcon(channel: string) {
  switch (channel) {
    case "email": return Mail;
    case "sms": return MessageSquare;
    case "phone": return Phone;
    case "mail": return FileText;
    default: return Mail;
  }
}

function MessageDetail({
  message,
  analysis,
  onBack,
  onStar,
  onArchive,
  onAnalyze,
  isAnalyzing,
  allMessages,
}: {
  message: InboxMessage;
  analysis: MessageAnalysis | null;
  onBack: () => void;
  onStar: () => void;
  onArchive: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  allMessages: InboxMessage[];
}) {
  const navigate = useNavigate();
  const ChannelIcon = getChannelIcon(message.channel);
  const [replyText, setReplyText] = React.useState("");
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [showTimeline, setShowTimeline] = React.useState(false);

  // Get related messages for timeline
  const relatedMessages = React.useMemo(() => {
    if (!message.properties?.address) return [message];
    return allMessages.filter(
      m => m.properties?.address === message.properties?.address ||
           m.contact_email === message.contact_email ||
           m.contact_phone === message.contact_phone
    );
  }, [message, allMessages]);

  const handleTemplateSelect = (text: string) => {
    setReplyText(text);
    setShowTemplates(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border-subtle">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-h3 font-semibold truncate">{message.subject || "(No subject)"}</h2>
          <div className="flex items-center gap-2 text-small text-content-secondary">
            <ChannelIcon className="h-4 w-4" />
            <span>{message.contact_name || message.contact_email}</span>
            {message.contact_type && (
              <Badge variant="secondary" size="sm">{message.contact_type}</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {relatedMessages.length > 1 && (
            <Button variant="ghost" size="sm" onClick={() => setShowTimeline(true)}>
              <History className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onStar}>
            {message.is_starred ? (
              <Star className="h-4 w-4 fill-warning text-warning" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onArchive}>
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Property link */}
      {message.properties && (
        <button
          onClick={() => message.property_id && navigate(`/properties/${message.property_id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-surface-secondary border-b border-border-subtle hover:bg-surface-tertiary transition-colors"
        >
          <Building2 className="h-4 w-4 text-brand" />
          <span className="text-small font-medium">{message.properties.address}</span>
          <span className="text-small text-content-secondary">
            {[message.properties.city, message.properties.state].filter(Boolean).join(", ")}
          </span>
          {message.offers && (
            <Badge variant="success" size="sm" className="ml-2">
              ${message.offers.offer_amount.toLocaleString()}
            </Badge>
          )}
          <ChevronRight className="h-4 w-4 text-content-tertiary ml-auto" />
        </button>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Main Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-4 text-small text-content-secondary">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(message.created_at), "MMMM d, yyyy 'at' h:mm a")}</span>
            <Badge variant={message.direction === "inbound" ? "default" : "secondary"} size="sm" className="ml-2">
              {message.direction === "inbound" ? "Received" : "Sent"}
            </Badge>
          </div>

          {message.body_html ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: message.body_html }}
            />
          ) : (
            <div className="whitespace-pre-wrap text-body">{message.body}</div>
          )}
        </ScrollArea>

        {/* AI Analysis Panel */}
        <div className="w-72 border-l border-border-subtle p-4 hidden lg:block">
          <MessageAnalysisPanel
            analysis={analysis}
            isLoading={isAnalyzing}
            onAnalyze={onAnalyze}
          />
        </div>
      </div>

      {/* Reply */}
      <div className="p-4 border-t border-border-subtle">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTemplates(true)}
            className="flex-shrink-0"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Input 
            placeholder="Write a reply..." 
            className="flex-1" 
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <Button variant="primary" icon={<Send />}>
            Reply
          </Button>
        </div>
        
        {/* Mobile AI button */}
        <div className="mt-2 lg:hidden">
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            <Brain className="h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
          </Button>
        </div>
      </div>

      {/* Quick Templates Panel */}
      <QuickTemplatesPanel
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
        context={{
          contactName: message.contact_name || undefined,
          propertyAddress: message.properties?.address,
          offerAmount: message.offers?.offer_amount,
        }}
      />

      {/* Conversation Timeline */}
      <ConversationTimeline
        messages={relatedMessages}
        currentMessageId={message.id}
        open={showTimeline}
        onClose={() => setShowTimeline(false)}
        onSelectMessage={(id) => {
          // Would navigate to that message
        }}
      />
    </div>
  );
}

export default function UnifiedInbox() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<FilterTab>("inbox");
  const [search, setSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [activeMessageId, setActiveMessageId] = React.useState<string | null>(null);
  const [analyses, setAnalyses] = React.useState<Record<string, MessageAnalysis>>({});
  const [lastSync, setLastSync] = React.useState<Date | null>(new Date());
  
  // Hooks
  const { data: realMessages, isLoading, refetch, isFetching } = useInboxMessages({
    isArchived: activeTab === "archived",
    isStarred: activeTab === "starred" ? true : undefined,
  });
  const { data: stats } = useInboxStats();
  const updateMessage = useUpdateInboxMessage();
  const markRead = useMarkMessagesRead();
  const analyzeMessages = useAnalyzeMessages();

  // Local state for mock data
  const [localMessages, setLocalMessages] = React.useState(MOCK_MESSAGES);
  const messages = realMessages && realMessages.length > 0 ? realMessages : localMessages;

  // Filter messages
  const filteredMessages = React.useMemo(() => {
    if (!messages) return [];
    
    let filtered = messages;
    
    if (activeTab === "starred") {
      filtered = filtered.filter(m => m.is_starred);
    } else if (activeTab === "archived") {
      filtered = filtered.filter(m => m.is_archived);
    } else {
      filtered = filtered.filter(m => !m.is_archived);
    }
    
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.subject?.toLowerCase().includes(q) ||
          m.contact_name?.toLowerCase().includes(q) ||
          m.contact_email?.toLowerCase().includes(q) ||
          m.body?.toLowerCase().includes(q)
      );
    }
    
    // Sort by priority if analyses available
    return filtered.sort((a, b) => {
      const priorityA = analyses[a.id]?.priority.score || 50;
      const priorityB = analyses[b.id]?.priority.score || 50;
      return priorityB - priorityA;
    });
  }, [messages, search, activeTab, analyses]);

  const activeMessage = React.useMemo(() => {
    if (!activeMessageId || !messages) return null;
    return messages.find((m) => m.id === activeMessageId) || null;
  }, [activeMessageId, messages]);

  const displayStats = React.useMemo(() => {
    const unread = messages.filter(m => !m.is_read && !m.is_archived).length;
    const starred = messages.filter(m => m.is_starred).length;
    const archived = messages.filter(m => m.is_archived).length;
    return { unread, starred, archived };
  }, [messages]);

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleOpenMessage = async (message: InboxMessage) => {
    setActiveMessageId(message.id);
    if (!message.is_read) {
      setLocalMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, is_read: true } : m)
      );
      if (realMessages && realMessages.length > 0) {
        await updateMessage.mutateAsync({ id: message.id, updates: { is_read: true } });
      }
    }
  };

  const handleToggleStar = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    setLocalMessages(prev => 
      prev.map(m => m.id === messageId ? { ...m, is_starred: !m.is_starred } : m)
    );
    
    if (realMessages && realMessages.length > 0) {
      await updateMessage.mutateAsync({
        id: messageId,
        updates: { is_starred: !message.is_starred },
      });
    }
  };

  const handleAnalyzeAll = async () => {
    const unanalyzed = filteredMessages.filter(m => !analyses[m.id]);
    if (unanalyzed.length === 0) {
      toast.info("All messages already analyzed");
      return;
    }
    
    try {
      const results = await analyzeMessages.mutateAsync(unanalyzed);
      setAnalyses(prev => ({ ...prev, ...results }));
      
      // Cache results
      Object.entries(results).forEach(([id, analysis]) => {
        cacheMessageAnalysis(id, analysis);
      });
      
      toast.success(`Analyzed ${Object.keys(results).length} messages`);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleAnalyzeMessage = async (message: InboxMessage) => {
    try {
      const results = await analyzeMessages.mutateAsync([message]);
      if (results[message.id]) {
        setAnalyses(prev => ({ ...prev, [message.id]: results[message.id] }));
        cacheMessageAnalysis(message.id, results[message.id]);
      }
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleRefresh = async () => {
    await refetch();
    setLastSync(new Date());
    toast.success("Inbox refreshed");
  };

  // Bulk actions
  const handleBulkMarkRead = async () => {
    setLocalMessages(prev => 
      prev.map(m => selectedIds.has(m.id) ? { ...m, is_read: true } : m)
    );
    if (realMessages && realMessages.length > 0) {
      await markRead.mutateAsync(Array.from(selectedIds));
    }
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} messages marked as read`);
  };

  const handleBulkArchive = async () => {
    setLocalMessages(prev => 
      prev.map(m => selectedIds.has(m.id) ? { ...m, is_archived: true } : m)
    );
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} messages archived`);
  };

  const handleBulkStar = async () => {
    setLocalMessages(prev => 
      prev.map(m => selectedIds.has(m.id) ? { ...m, is_starred: true } : m)
    );
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} messages starred`);
  };

  const handleBulkDelete = async () => {
    toast.success(`${selectedIds.size} messages deleted`);
    setSelectedIds(new Set());
  };

  const handleSnooze = (duration: string) => {
    toast.success(`${selectedIds.size} messages snoozed for ${duration}`);
    setSelectedIds(new Set());
  };

  return (
    <TooltipProvider>
      <PageLayout>
        <PageHeader
          title="Inbox"
          description="AI-powered communication hub for winning deals"
          actions={
            <div className="flex items-center gap-2">
              <RealTimeIndicators
                isConnected={true}
                lastSync={lastSync}
                isSyncing={isFetching}
                unreadCount={displayStats.unread}
                pendingActions={0}
              />
              <Button
                variant="secondary"
                size="sm"
                icon={<Brain />}
                onClick={handleAnalyzeAll}
                disabled={analyzeMessages.isPending}
              >
                {analyzeMessages.isPending ? "Analyzing..." : "Analyze All"}
              </Button>
              <Button variant="secondary" size="sm" icon={<RefreshCw />} onClick={handleRefresh}>
                Refresh
              </Button>
            </div>
          }
        />

        <Card variant="default" padding="none" className="flex-1 flex flex-col overflow-hidden">
          {activeMessage ? (
            <MessageDetail
              message={activeMessage}
              analysis={analyses[activeMessage.id] || null}
              onBack={() => setActiveMessageId(null)}
              onStar={() => handleToggleStar(activeMessage.id)}
              onArchive={async () => {
                setLocalMessages(prev => 
                  prev.map(m => m.id === activeMessage.id ? { ...m, is_archived: !m.is_archived } : m)
                );
                setActiveMessageId(null);
              }}
              onAnalyze={() => handleAnalyzeMessage(activeMessage)}
              isAnalyzing={analyzeMessages.isPending}
              allMessages={messages}
            />
          ) : (
            <>
              {/* Toolbar with Tabs */}
              <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as FilterTab); setActiveMessageId(null); }}>
                  <TabsList className="bg-transparent gap-2 p-0">
                    <TabsTrigger value="inbox" className="gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                      <Inbox className="h-4 w-4" />
                      Inbox
                      {displayStats.unread > 0 && (
                        <Badge variant="default" size="sm">{displayStats.unread}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="starred" className="gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                      <Star className="h-4 w-4" />
                      Starred
                      {displayStats.starred > 0 && (
                        <Badge variant="secondary" size="sm">{displayStats.starred}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                      <Archive className="h-4 w-4" />
                      Archived
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex-1" />
                
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                  <Input
                    placeholder="Search messages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedIds.size > 0 ? (
                <BulkActionsBar
                  selectedCount={selectedIds.size}
                  onMarkRead={handleBulkMarkRead}
                  onMarkUnread={() => {}}
                  onArchive={handleBulkArchive}
                  onDelete={handleBulkDelete}
                  onStar={handleBulkStar}
                  onSnooze={handleSnooze}
                  onClearSelection={() => setSelectedIds(new Set())}
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-2 border-b border-border-subtle bg-surface-secondary">
                  <Checkbox
                    checked={selectedIds.size === filteredMessages.length && filteredMessages.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-small text-content-secondary">Select all</span>
                  <div className="flex-1" />
                  {Object.keys(analyses).length > 0 && (
                    <Badge variant="secondary" size="sm" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      {Object.keys(analyses).length} analyzed
                    </Badge>
                  )}
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <MessageRowSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Inbox className="h-12 w-12 text-content-tertiary mb-3" />
                    <h3 className="text-h3 font-medium text-content mb-1">No messages</h3>
                    <p className="text-small text-content-secondary">
                      {activeTab === "inbox"
                        ? "Your inbox is empty"
                        : activeTab === "starred"
                        ? "No starred messages"
                        : "No archived messages"}
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <EnhancedMessageRow
                      key={message.id}
                      message={message}
                      analysis={analyses[message.id]}
                      selected={selectedIds.has(message.id)}
                      onSelect={(checked) => handleSelect(message.id, checked)}
                      onClick={() => handleOpenMessage(message)}
                      onToggleStar={() => handleToggleStar(message.id)}
                    />
                  ))
                )}
              </ScrollArea>
            </>
          )}
        </Card>
      </PageLayout>
    </TooltipProvider>
  );
}
