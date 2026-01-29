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
  Filter,
  RefreshCw,
  ChevronRight,
  Building2,
  User,
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
}: {
  message: InboxMessage;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
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
          <Input placeholder="Write a reply..." className="flex-1" />
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

  const { data: stats } = useInboxStats();
  const { data: messages, isLoading, refetch } = useInboxMessages({
    isArchived: activeTab === "archived",
    isStarred: activeTab === "starred" ? true : undefined,
  });
  const updateMessage = useUpdateInboxMessage();
  const markRead = useMarkMessagesRead();

  const filteredMessages = React.useMemo(() => {
    if (!messages) return [];
    if (!search) return messages;
    const q = search.toLowerCase();
    return messages.filter(
      (m) =>
        m.subject?.toLowerCase().includes(q) ||
        m.contact_name?.toLowerCase().includes(q) ||
        m.contact_email?.toLowerCase().includes(q) ||
        m.body?.toLowerCase().includes(q)
    );
  }, [messages, search]);

  const activeMessage = React.useMemo(() => {
    if (!activeMessageId || !messages) return null;
    return messages.find((m) => m.id === activeMessageId) || null;
  }, [activeMessageId, messages]);

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
      await updateMessage.mutateAsync({ id: message.id, updates: { is_read: true } });
    }
  };

  const handleStar = async () => {
    if (!activeMessage) return;
    await updateMessage.mutateAsync({
      id: activeMessage.id,
      updates: { is_starred: !activeMessage.is_starred },
    });
  };

  const handleArchive = async () => {
    if (!activeMessage) return;
    await updateMessage.mutateAsync({
      id: activeMessage.id,
      updates: { is_archived: !activeMessage.is_archived },
    });
    setActiveMessageId(null);
  };

  const handleMarkSelectedRead = async () => {
    if (selectedIds.size === 0) return;
    await markRead.mutateAsync(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <PageLayout fullWidth>
      <PageHeader
        title="Unified Inbox"
        description="Manage all offer conversations in one place"
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw />} onClick={() => refetch()}>
            Refresh
          </Button>
        }
      />

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <Card variant="default" padding="none" className="w-64 flex-shrink-0">
          <div className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab("inbox"); setActiveMessageId(null); }}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-medium text-left transition-colors",
                activeTab === "inbox" ? "bg-brand/10 text-brand" : "hover:bg-surface-secondary"
              )}
            >
              <Inbox className="h-4 w-4" />
              <span className="flex-1 font-medium">Inbox</span>
              {stats?.unread ? (
                <Badge variant="primary" size="sm">{stats.unread}</Badge>
              ) : null}
            </button>
            <button
              onClick={() => { setActiveTab("starred"); setActiveMessageId(null); }}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-medium text-left transition-colors",
                activeTab === "starred" ? "bg-brand/10 text-brand" : "hover:bg-surface-secondary"
              )}
            >
              <Star className="h-4 w-4" />
              <span className="flex-1 font-medium">Starred</span>
              {stats?.starred ? (
                <Badge variant="secondary" size="sm">{stats.starred}</Badge>
              ) : null}
            </button>
            <button
              onClick={() => { setActiveTab("archived"); setActiveMessageId(null); }}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-medium text-left transition-colors",
                activeTab === "archived" ? "bg-brand/10 text-brand" : "hover:bg-surface-secondary"
              )}
            >
              <Archive className="h-4 w-4" />
              <span className="flex-1 font-medium">Archived</span>
            </button>
          </div>
        </Card>

        {/* Message List / Detail */}
        <Card variant="default" padding="none" className="flex-1 flex overflow-hidden">
          {activeMessage ? (
            <MessageDetail
              message={activeMessage}
              onBack={() => setActiveMessageId(null)}
              onStar={handleStar}
              onArchive={handleArchive}
            />
          ) : (
            <div className="flex flex-col w-full">
              {/* Toolbar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
                <Checkbox
                  checked={selectedIds.size === filteredMessages.length && filteredMessages.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                  <Input
                    placeholder="Search messages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Badge variant="secondary">{selectedIds.size} selected</Badge>
                    <Button variant="ghost" size="sm" icon={<MailOpen />} onClick={handleMarkSelectedRead}>
                      Mark Read
                    </Button>
                    <Button variant="ghost" size="sm" icon={<Archive />}>
                      Archive
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
                    />
                  ))
                )}
              </ScrollArea>
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}
