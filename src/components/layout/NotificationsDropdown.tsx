import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Home,
  DollarSign,
  Phone,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  Calendar,
  TrendingUp,
  MapPin,
  Star,
  Check,
  X,
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  Loader2,
  Zap,
  Target,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Notification types specific to real estate
type NotificationType =
  | "lead_new"
  | "lead_response"
  | "lead_hot"
  | "offer_received"
  | "offer_accepted"
  | "offer_rejected"
  | "offer_counter"
  | "deal_stage"
  | "deal_closed"
  | "appointment"
  | "task_due"
  | "document_signed"
  | "document_uploaded"
  | "call_missed"
  | "call_voicemail"
  | "sms_received"
  | "email_opened"
  | "buyer_interest"
  | "price_drop"
  | "market_alert"
  | "contract_expiring"
  | "inspection_scheduled"
  | "closing_reminder";

type NotificationPriority = "low" | "medium" | "high" | "urgent";
type NotificationCategory = "all" | "leads" | "deals" | "tasks" | "messages";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: NotificationPriority;
  category: NotificationCategory;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    propertyAddress?: string;
    contactName?: string;
    amount?: number;
    stage?: string;
  };
}

interface AISuggestion {
  text: string;
  type: "response" | "offer" | "action" | "tactic";
  priority: "high" | "medium" | "low";
}

// Mock notifications for demonstration
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "lead_hot",
    title: "🔥 Hot Lead Alert",
    message: "John Smith just submitted a property at 1234 Oak Street. High motivation score detected!",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    priority: "urgent",
    category: "leads",
    actionUrl: "/properties",
    actionLabel: "View Lead",
    metadata: { propertyAddress: "1234 Oak Street", contactName: "John Smith" },
  },
  {
    id: "2",
    type: "offer_received",
    title: "New Offer Received",
    message: "Cash buyer Mike Johnson submitted an offer of $185,000 for 456 Pine Ave",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    priority: "high",
    category: "deals",
    actionUrl: "/marketplace",
    actionLabel: "Review Offer",
    metadata: { propertyAddress: "456 Pine Ave", contactName: "Mike Johnson", amount: 185000 },
  },
  {
    id: "3",
    type: "call_missed",
    title: "Missed Call",
    message: "You missed a call from Sarah Williams (555-123-4567). Callback requested.",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    read: false,
    priority: "medium",
    category: "messages",
    actionUrl: "/dialer",
    actionLabel: "Call Back",
    metadata: { contactName: "Sarah Williams" },
  },
  {
    id: "4",
    type: "appointment",
    title: "Appointment in 1 Hour",
    message: "Property walkthrough scheduled at 789 Elm St with homeowner",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    priority: "high",
    category: "tasks",
    actionUrl: "/dashboard",
    actionLabel: "View Details",
    metadata: { propertyAddress: "789 Elm St" },
  },
  {
    id: "5",
    type: "document_signed",
    title: "Contract Signed",
    message: "Purchase agreement for 321 Maple Dr has been signed by all parties",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    priority: "medium",
    category: "deals",
    actionUrl: "/properties",
    actionLabel: "View Contract",
    metadata: { propertyAddress: "321 Maple Dr" },
  },
  {
    id: "6",
    type: "buyer_interest",
    title: "Buyer Showed Interest",
    message: "3 buyers from your list match the new deal at 555 Cedar Lane",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
    priority: "medium",
    category: "deals",
    actionUrl: "/deal-sources",
    actionLabel: "Match Buyers",
    metadata: { propertyAddress: "555 Cedar Lane" },
  },
  {
    id: "7",
    type: "task_due",
    title: "Task Due Today",
    message: "Follow up with seller at 888 Birch Blvd - negotiation pending",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
    priority: "medium",
    category: "tasks",
    actionUrl: "/dashboard",
    actionLabel: "Complete Task",
    metadata: { propertyAddress: "888 Birch Blvd" },
  },
  {
    id: "8",
    type: "price_drop",
    title: "Price Reduction Alert",
    message: "Property at 999 Willow Way dropped $25,000 - now at $150,000",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    priority: "low",
    category: "leads",
    actionUrl: "/marketplace",
    actionLabel: "View Property",
    metadata: { propertyAddress: "999 Willow Way", amount: 150000 },
  },
  {
    id: "9",
    type: "deal_closed",
    title: "🎉 Deal Closed!",
    message: "Congratulations! 123 Victory Lane closed for $210,000. Assignment fee: $15,000",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    priority: "low",
    category: "deals",
    actionUrl: "/analytics",
    actionLabel: "View Stats",
    metadata: { propertyAddress: "123 Victory Lane", amount: 15000 },
  },
  {
    id: "10",
    type: "sms_received",
    title: "New SMS Message",
    message: "Response from lead: 'Yes, I'm interested in selling. When can we talk?'",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    read: false,
    priority: "high",
    category: "messages",
    actionUrl: "/inbox",
    actionLabel: "Reply",
    metadata: { contactName: "Unknown Seller" },
  },
];

const getNotificationIcon = (type: NotificationType) => {
  const iconMap: Record<NotificationType, React.ReactNode> = {
    lead_new: <Home className="h-4 w-4" />,
    lead_response: <MessageSquare className="h-4 w-4" />,
    lead_hot: <TrendingUp className="h-4 w-4 text-orange-500" />,
    offer_received: <DollarSign className="h-4 w-4 text-green-500" />,
    offer_accepted: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    offer_rejected: <X className="h-4 w-4 text-red-500" />,
    offer_counter: <DollarSign className="h-4 w-4 text-yellow-500" />,
    deal_stage: <TrendingUp className="h-4 w-4" />,
    deal_closed: <Star className="h-4 w-4 text-yellow-500" />,
    appointment: <Calendar className="h-4 w-4 text-blue-500" />,
    task_due: <Clock className="h-4 w-4 text-orange-500" />,
    document_signed: <FileText className="h-4 w-4 text-green-500" />,
    document_uploaded: <FileText className="h-4 w-4" />,
    call_missed: <Phone className="h-4 w-4 text-red-500" />,
    call_voicemail: <Volume2 className="h-4 w-4" />,
    sms_received: <MessageSquare className="h-4 w-4 text-blue-500" />,
    email_opened: <Eye className="h-4 w-4" />,
    buyer_interest: <Users className="h-4 w-4 text-purple-500" />,
    price_drop: <TrendingUp className="h-4 w-4 text-green-500" />,
    market_alert: <MapPin className="h-4 w-4" />,
    contract_expiring: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    inspection_scheduled: <Calendar className="h-4 w-4" />,
    closing_reminder: <Clock className="h-4 w-4 text-blue-500" />,
  };
  return iconMap[type] || <Bell className="h-4 w-4" />;
};

const getPriorityStyles = (priority: NotificationPriority) => {
  const styles: Record<NotificationPriority, string> = {
    urgent: "border-l-4 border-l-destructive bg-destructive/5",
    high: "border-l-4 border-l-orange-500 bg-orange-50/30",
    medium: "border-l-4 border-l-primary",
    low: "border-l-4 border-l-muted-foreground/30",
  };
  return styles[priority];
};

const getSuggestionIcon = (type: string) => {
  switch (type) {
    case "response": return <MessageCircle className="h-3 w-3" />;
    case "offer": return <DollarSign className="h-3 w-3" />;
    case "action": return <Zap className="h-3 w-3" />;
    case "tactic": return <Target className="h-3 w-3" />;
    default: return <Sparkles className="h-3 w-3" />;
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onAction: (url: string) => void;
}

function NotificationItem({ notification, onMarkRead, onDismiss, onAction }: NotificationItemProps) {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<AISuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [hasLoadedSuggestions, setHasLoadedSuggestions] = React.useState(false);

  const loadSuggestions = async () => {
    if (hasLoadedSuggestions || isLoadingSuggestions) return;
    
    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-deal-suggestions', {
        body: { 
          notification: {
            type: notification.type,
            title: notification.title,
            message: notification.message,
            metadata: notification.metadata
          }
        }
      });

      if (error) {
        console.error('Error fetching suggestions:', error);
        toast.error('Failed to load AI suggestions');
        return;
      }

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setHasLoadedSuggestions(true);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleToggleSuggestions = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showSuggestions && !hasLoadedSuggestions) {
      loadSuggestions();
    }
    setShowSuggestions(!showSuggestions);
  };

  const handleSuggestionClick = (suggestion: AISuggestion, e: React.MouseEvent) => {
    e.stopPropagation();
    // Copy suggestion to clipboard
    navigator.clipboard.writeText(suggestion.text);
    toast.success('Suggestion copied to clipboard!');
  };

  return (
    <div
      className={cn(
        "relative p-3 hover:bg-muted/50 transition-colors cursor-pointer group",
        !notification.read && "bg-primary/5",
        getPriorityStyles(notification.priority)
      )}
      onClick={() => {
        onMarkRead(notification.id);
        if (notification.actionUrl) {
          onAction(notification.actionUrl);
        }
      }}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5 p-2 rounded-full bg-muted">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-sm font-medium leading-tight", !notification.read && "text-foreground")}>
              {notification.title}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notification.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          
          {/* AI Suggestions Toggle */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/70">
                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
              </span>
              <button
                onClick={handleToggleSuggestions}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors",
                  showSuggestions 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                {isLoadingSuggestions ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>AI Tips</span>
                {showSuggestions ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            </div>
            {notification.actionLabel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-primary hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(notification.id);
                  if (notification.actionUrl) {
                    onAction(notification.actionUrl);
                  }
                }}
              >
                {notification.actionLabel}
              </Button>
            )}
          </div>

          {/* AI Suggestions Panel */}
          {showSuggestions && (
            <div className="mt-2 p-2 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">AI Suggestions to Win</span>
              </div>
              {isLoadingSuggestions ? (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="ml-2 text-xs text-muted-foreground">Analyzing opportunity...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-1.5">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleSuggestionClick(suggestion, e)}
                      className={cn(
                        "w-full flex items-start gap-2 p-2 rounded-md text-left text-xs transition-colors",
                        "hover:bg-background/80 group/suggestion",
                        suggestion.priority === "high" && "bg-background/60"
                      )}
                    >
                      <span className={cn(
                        "flex-shrink-0 p-1 rounded",
                        suggestion.type === "response" && "bg-blue-100 text-blue-600",
                        suggestion.type === "offer" && "bg-green-100 text-green-600",
                        suggestion.type === "action" && "bg-orange-100 text-orange-600",
                        suggestion.type === "tactic" && "bg-purple-100 text-purple-600"
                      )}>
                        {getSuggestionIcon(suggestion.type)}
                      </span>
                      <span className="flex-1 text-foreground leading-snug">
                        {suggestion.text}
                      </span>
                      {suggestion.priority === "high" && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-destructive/10 text-destructive">
                          Priority
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  No suggestions available
                </p>
              )}
              <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
                Click a suggestion to copy
              </p>
            </div>
          )}
        </div>
        {!notification.read && (
          <div className="absolute top-3 right-10 h-2 w-2 bg-primary rounded-full" />
        )}
      </div>
    </div>
  );
}

export function NotificationsDropdown() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = React.useState<NotificationCategory>("all");
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = React.useMemo(() => {
    if (activeTab === "all") return notifications;
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    if (activeTab === "all") {
      setNotifications([]);
    } else {
      setNotifications((prev) => prev.filter((n) => n.category !== activeTab));
    }
  };

  const handleAction = (url: string) => {
    setIsOpen(false);
    navigate(url);
  };

  const getCategoryCount = (category: NotificationCategory) => {
    if (category === "all") return notifications.filter((n) => !n.read).length;
    return notifications.filter((n) => n.category === category && !n.read).length;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-content-secondary hover:text-content hover:bg-surface-secondary rounded-md transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-destructive rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[420px] p-0 bg-background shadow-xl border"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute notifications" : "Mute notifications"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate("/settings/notifications")}
              title="Notification settings"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* AI Feature Banner */}
        <div className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border-b flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs text-primary font-medium">AI-powered suggestions to help you win deals</span>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NotificationCategory)}>
          <div className="border-b px-2">
            <TabsList className="h-10 w-full bg-transparent gap-0">
              {(["all", "leads", "deals", "tasks", "messages"] as NotificationCategory[]).map((tab) => {
                const count = getCategoryCount(tab);
                return (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="flex-1 capitalize text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  >
                    {tab}
                    {count > 0 && (
                      <span className="ml-1 text-[10px] text-muted-foreground">({count})</span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Notification List */}
          <TabsContent value={activeTab} className="m-0">
            {filteredNotifications.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                      onDismiss={handleDismiss}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 rounded-full bg-muted mb-3">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  You're all caught up!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={handleMarkAllRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-muted-foreground hover:text-destructive"
              onClick={handleClearAll}
            >
              Clear {activeTab === "all" ? "all" : activeTab}
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
