import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  FileText,
  Star,
  StarOff,
  Archive,
  Trash2,
  MailOpen,
  Search,
  RefreshCw,
  ChevronRight,
  Building2,
  Clock,
  ArrowLeft,
  Send,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useInboxMessages,
  useInboxStats,
  useUpdateInboxMessage,
  useMarkMessagesRead,
  type InboxMessage,
} from "@/hooks/useAcquireFlow";

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
    offer_id: null,
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
  {
    id: "6",
    user_id: "user1",
    organization_id: null,
    property_id: null,
    offer_id: null,
    campaign_id: null,
    campaign_property_id: null,
    contact_name: "James Wilson",
    contact_email: "jwilson@email.com",
    contact_phone: null,
    contact_type: "Seller",
    direction: "outbound",
    channel: "email",
    subject: "Cash Offer - 888 Birch Lane",
    body: "Dear Mr. Wilson, I hope this email finds you well. I'm reaching out regarding your property at 888 Birch Lane...",
    body_html: null,
    is_read: true,
    is_starred: false,
    is_archived: true,
    external_id: null,
    thread_id: null,
    in_reply_to: null,
    metadata: {},
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

function getChannelIcon(channel: string) {
  switch (channel) {
    case "email":
      return Mail;
    case "sms":
      return MessageSquare;
    case "phone":
      return Phone;
    case "mail":
      return FileText;
    default:
      return Mail;
  }
}

function MessageRow({
  message,
  selected,
  onSelect,
  onClick,
  onToggleStar,
}: {
  message: InboxMessage;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
  onToggleStar: () => void;
}) {
  const ChannelIcon = getChannelIcon(message.channel);
  const isUnread = !message.is_read;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b border-border-subtle cursor-pointer transition-colors",
        isUnread ? "bg-brand/5" : "bg-white",
        selected && "bg-brand/10"
      )}
    >
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
      <div className="flex-1 min-w-0" onClick={onClick}>
        <div className="flex items-center gap-2 mb-1">
          <ChannelIcon className="h-4 w-4 text-content-tertiary flex-shrink-0" />
          <span className={cn("text-small truncate", isUnread ? "font-semibold text-content" : "text-content-secondary")}>
            {message.contact_name || message.contact_email || "Unknown"}
          </span>
          {message.contact_type && (
            <Badge variant="secondary" size="sm" className="text-tiny">
              {message.contact_type}
            </Badge>
          )}
          <span className="text-tiny text-content-tertiary ml-auto flex-shrink-0">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
        <div className={cn("text-body truncate", isUnread ? "font-medium" : "text-content-secondary")}>
          {message.subject || "(No subject)"}
        </div>
        {message.body && (
          <p className="text-small text-content-tertiary truncate mt-0.5">
            {message.body.slice(0, 100)}
          </p>
        )}
        {message.properties && (
          <div className="flex items-center gap-1 mt-1 text-tiny text-content-tertiary">
            <Building2 className="h-3 w-3" />
            <span className="truncate">{message.properties.address}</span>
          </div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-content-tertiary flex-shrink-0" />
    </div>
  );
}

function MessageDetail({
  message,
  onBack,
  onStar,
  onArchive,
}: {
  message: InboxMessage;
  onBack: () => void;
  onStar: () => void;
  onArchive: () => void;
}) {
  const navigate = useNavigate();
  const ChannelIcon = getChannelIcon(message.channel);
  const [replyText, setReplyText] = React.useState("");

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
          <ChevronRight className="h-4 w-4 text-content-tertiary ml-auto" />
        </button>
      )}

      {/* Content */}
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

      {/* Reply */}
      <div className="p-4 border-t border-border-subtle">
        <div className="flex gap-2">
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
      </div>
    </div>
  );
}

export default function UnifiedInbox() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<FilterTab>("inbox");
  const [search, setSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [activeMessageId, setActiveMessageId] = React.useState<string | null>(null);
  
  // Use mock data for now, real data when available
  const { data: realMessages, isLoading, refetch } = useInboxMessages({
    isArchived: activeTab === "archived",
    isStarred: activeTab === "starred" ? true : undefined,
  });
  const { data: stats } = useInboxStats();
  const updateMessage = useUpdateInboxMessage();
  const markRead = useMarkMessagesRead();

  // Local state for mock data interactions
  const [localMessages, setLocalMessages] = React.useState(MOCK_MESSAGES);

  // Use real messages if available, otherwise use mock
  const messages = realMessages && realMessages.length > 0 ? realMessages : localMessages;

  const filteredMessages = React.useMemo(() => {
    if (!messages) return [];
    
    let filtered = messages;
    
    // Filter by tab
    if (activeTab === "starred") {
      filtered = filtered.filter(m => m.is_starred);
    } else if (activeTab === "archived") {
      filtered = filtered.filter(m => m.is_archived);
    } else {
      filtered = filtered.filter(m => !m.is_archived);
    }
    
    // Filter by search
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
    
    return filtered;
  }, [messages, search, activeTab]);

  const activeMessage = React.useMemo(() => {
    if (!activeMessageId || !messages) return null;
    return messages.find((m) => m.id === activeMessageId) || null;
  }, [activeMessageId, messages]);

  // Calculate stats from local data
  const displayStats = React.useMemo(() => {
    const unread = messages.filter(m => !m.is_read && !m.is_archived).length;
    const starred = messages.filter(m => m.is_starred).length;
    const archived = messages.filter(m => m.is_archived).length;
    return { unread, starred, archived };
  }, [messages]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleOpenMessage = async (message: InboxMessage) => {
    setActiveMessageId(message.id);
    if (!message.is_read) {
      // Update local state
      setLocalMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, is_read: true } : m)
      );
      // Try to update real data if available
      if (realMessages && realMessages.length > 0) {
        await updateMessage.mutateAsync({ id: message.id, updates: { is_read: true } });
      }
    }
  };

  const handleToggleStar = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    // Update local state
    setLocalMessages(prev => 
      prev.map(m => m.id === messageId ? { ...m, is_starred: !m.is_starred } : m)
    );
    
    // Try to update real data if available
    if (realMessages && realMessages.length > 0) {
      await updateMessage.mutateAsync({
        id: messageId,
        updates: { is_starred: !message.is_starred },
      });
    }
  };

  const handleStar = async () => {
    if (!activeMessage) return;
    await handleToggleStar(activeMessage.id);
  };

  const handleArchive = async () => {
    if (!activeMessage) return;
    
    // Update local state
    setLocalMessages(prev => 
      prev.map(m => m.id === activeMessage.id ? { ...m, is_archived: !m.is_archived } : m)
    );
    
    // Try to update real data if available
    if (realMessages && realMessages.length > 0) {
      await updateMessage.mutateAsync({
        id: activeMessage.id,
        updates: { is_archived: !activeMessage.is_archived },
      });
    }
    setActiveMessageId(null);
  };

  const handleMarkSelectedRead = async () => {
    if (selectedIds.size === 0) return;
    
    // Update local state
    setLocalMessages(prev => 
      prev.map(m => selectedIds.has(m.id) ? { ...m, is_read: true } : m)
    );
    
    // Try to update real data if available
    if (realMessages && realMessages.length > 0) {
      await markRead.mutateAsync(Array.from(selectedIds));
    }
    setSelectedIds(new Set());
  };

  const handleArchiveSelected = async () => {
    if (selectedIds.size === 0) return;
    
    // Update local state
    setLocalMessages(prev => 
      prev.map(m => selectedIds.has(m.id) ? { ...m, is_archived: true } : m)
    );
    
    setSelectedIds(new Set());
  };

  return (
    <PageLayout>
      <PageHeader
        title="Unified Inbox"
        description="Manage all offer conversations in one place"
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw />} onClick={() => refetch()}>
            Refresh
          </Button>
        }
      />

      <Card variant="default" padding="none" className="flex-1 flex flex-col overflow-hidden">
        {activeMessage ? (
          <MessageDetail
            message={activeMessage}
            onBack={() => setActiveMessageId(null)}
            onStar={handleStar}
            onArchive={handleArchive}
          />
        ) : (
          <>
            {/* Toolbar with Tabs */}
            <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as FilterTab); setActiveMessageId(null); }}>
                <TabsList>
                  <TabsTrigger value="inbox" className="gap-2">
                    <Inbox className="h-4 w-4" />
                    Inbox
                    {displayStats.unread > 0 && (
                      <Badge variant="default" size="sm">{displayStats.unread}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="starred" className="gap-2">
                    <Star className="h-4 w-4" />
                    Starred
                    {displayStats.starred > 0 && (
                      <Badge variant="secondary" size="sm">{displayStats.starred}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="gap-2">
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
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border-subtle bg-surface-secondary">
              <Checkbox
                checked={selectedIds.size === filteredMessages.length && filteredMessages.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-small text-content-secondary">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
              </span>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="sm" icon={<MailOpen />} onClick={handleMarkSelectedRead}>
                    Mark Read
                  </Button>
                  <Button variant="ghost" size="sm" icon={<Archive />} onClick={handleArchiveSelected}>
                    Archive
                  </Button>
                  <Button variant="ghost" size="sm" icon={<Trash2 />}>
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-4" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
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
                  <MessageRow
                    key={message.id}
                    message={message}
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
  );
}
