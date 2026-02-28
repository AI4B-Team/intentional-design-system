import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Volume2,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useRealtimeNotifications, type RealtimeNotificationType } from "@/hooks/useRealtimeNotifications";

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


// Hook to fetch real notifications from database
function useRealNotifications() {
  return useQuery({
    queryKey: ["notifications-real"],
    queryFn: async (): Promise<Notification[]> => {
      const notifications: Notification[] = [];
      const now = new Date();

      // Fetch data in parallel
      const [
        hotLeadsResult,
        tasksResult,
        offersResult,
        appointmentsResult,
        recentPropertiesResult,
      ] = await Promise.all([
        // Hot leads (high motivation score)
        supabase
          .from("properties")
          .select("id, address, city, state, motivation_score, status, created_at, owner_name")
          .gte("motivation_score", 700)
          .order("created_at", { ascending: false })
          .limit(5),

        // Today's appointments and follow-ups
        supabase
          .from("appointments")
          .select(`
            id,
            scheduled_time,
            appointment_type,
            status,
            property_id,
            properties!inner(address)
          `)
          .gte("scheduled_time", new Date().toISOString())
          .order("scheduled_time", { ascending: true })
          .limit(10),

        // Pending offers
        supabase
          .from("offers")
          .select(`
            id,
            offer_amount,
            response,
            created_at,
            property_id,
            properties!inner(address)
          `)
          .eq("response", "pending")
          .order("created_at", { ascending: false })
          .limit(5),

        // Upcoming appointments
        supabase
          .from("appointments")
          .select(`
            id,
            scheduled_time,
            appointment_type,
            property_id,
            properties!inner(address)
          `)
          .gte("scheduled_time", now.toISOString())
          .lte("scheduled_time", new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString())
          .order("scheduled_time", { ascending: true })
          .limit(5),

        // Recent new properties (last 24 hours)
        supabase
          .from("properties")
          .select("id, address, city, state, created_at, owner_name")
          .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      // Process hot leads
      hotLeadsResult.data?.forEach((lead) => {
        notifications.push({
          id: `lead-hot-${lead.id}`,
          type: "lead_hot",
          title: "🔥 Hot Lead Alert",
          message: `${lead.owner_name || "New seller"} - ${lead.address}. Motivation score: ${lead.motivation_score}`,
          timestamp: new Date(lead.created_at || now),
          read: false,
          priority: "urgent",
          category: "leads",
          actionUrl: `/properties/${lead.id}`,
          actionLabel: "View Lead",
          metadata: { 
            propertyAddress: lead.address, 
            contactName: lead.owner_name || undefined 
          },
        });
      });

      // Process upcoming appointments as tasks
      appointmentsResult.data?.forEach((apt) => {
        const property = apt.properties as unknown as { address: string };
        const scheduledTime = new Date(apt.scheduled_time);
        const hoursUntil = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        notifications.push({
          id: `apt-${apt.id}`,
          type: "appointment",
          title: hoursUntil <= 1 ? "Appointment Soon!" : "Upcoming Appointment",
          message: `${apt.appointment_type || "Appointment"} at ${property.address} - ${format(scheduledTime, "h:mm a")}`,
          timestamp: new Date(apt.scheduled_time),
          read: hoursUntil > 2,
          priority: hoursUntil <= 1 ? "high" : "medium",
          category: "tasks",
          actionUrl: `/properties/${apt.property_id}`,
          actionLabel: "View Details",
          metadata: { propertyAddress: property.address },
        });
      });

      // Process pending offers
      offersResult.data?.forEach((offer) => {
        const property = offer.properties as unknown as { address: string };
        const formattedAmount = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(offer.offer_amount);

        notifications.push({
          id: `offer-pending-${offer.id}`,
          type: "offer_received",
          title: "Pending Offer",
          message: `${formattedAmount} offer on ${property.address} awaiting response`,
          timestamp: new Date(offer.created_at || now),
          read: false,
          priority: "high",
          category: "deals",
          actionUrl: `/properties/${offer.property_id}`,
          actionLabel: "Review Offer",
          metadata: { 
            propertyAddress: property.address, 
            amount: offer.offer_amount 
          },
        });
      });

      // Process new properties
      recentPropertiesResult.data?.forEach((prop) => {
        notifications.push({
          id: `prop-new-${prop.id}`,
          type: "lead_new",
          title: "New Property Added",
          message: `${prop.address}, ${prop.city || ""} ${prop.state || ""}`,
          timestamp: new Date(prop.created_at || now),
          read: true,
          priority: "low",
          category: "leads",
          actionUrl: `/properties/${prop.id}`,
          actionLabel: "View Property",
          metadata: { 
            propertyAddress: prop.address,
            contactName: prop.owner_name || undefined
          },
        });
      });

      // Sort by timestamp, unread first
      return notifications.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

const getNotificationIcon = (type: NotificationType) => {
  const iconMap: Record<NotificationType, { icon: React.ReactNode; bg: string }> = {
    lead_new: { icon: <Home className="h-5 w-5 text-white" />, bg: "bg-emerald-500" },
    lead_response: { icon: <MessageSquare className="h-5 w-5 text-white" />, bg: "bg-blue-500" },
    lead_hot: { icon: <TrendingUp className="h-5 w-5 text-white" />, bg: "bg-red-500" },
    offer_received: { icon: <DollarSign className="h-5 w-5 text-white" />, bg: "bg-red-400" },
    offer_accepted: { icon: <CheckCircle2 className="h-5 w-5 text-white" />, bg: "bg-emerald-500" },
    offer_rejected: { icon: <X className="h-5 w-5 text-white" />, bg: "bg-red-500" },
    offer_counter: { icon: <DollarSign className="h-5 w-5 text-white" />, bg: "bg-amber-500" },
    deal_stage: { icon: <TrendingUp className="h-5 w-5 text-white" />, bg: "bg-emerald-500" },
    deal_closed: { icon: <Star className="h-5 w-5 text-white" />, bg: "bg-amber-500" },
    appointment: { icon: <Calendar className="h-5 w-5 text-white" />, bg: "bg-blue-500" },
    task_due: { icon: <Clock className="h-5 w-5 text-white" />, bg: "bg-amber-500" },
    document_signed: { icon: <FileText className="h-5 w-5 text-white" />, bg: "bg-red-400" },
    document_uploaded: { icon: <FileText className="h-5 w-5 text-white" />, bg: "bg-slate-500" },
    call_missed: { icon: <Phone className="h-5 w-5 text-white" />, bg: "bg-red-500" },
    call_voicemail: { icon: <Volume2 className="h-5 w-5 text-white" />, bg: "bg-slate-500" },
    sms_received: { icon: <MessageSquare className="h-5 w-5 text-white" />, bg: "bg-blue-500" },
    email_opened: { icon: <Eye className="h-5 w-5 text-white" />, bg: "bg-slate-500" },
    buyer_interest: { icon: <Users className="h-5 w-5 text-white" />, bg: "bg-purple-500" },
    price_drop: { icon: <TrendingUp className="h-5 w-5 text-white" />, bg: "bg-emerald-500" },
    market_alert: { icon: <MapPin className="h-5 w-5 text-white" />, bg: "bg-emerald-500" },
    contract_expiring: { icon: <AlertTriangle className="h-5 w-5 text-white" />, bg: "bg-amber-500" },
    inspection_scheduled: { icon: <Calendar className="h-5 w-5 text-white" />, bg: "bg-blue-500" },
    closing_reminder: { icon: <Clock className="h-5 w-5 text-white" />, bg: "bg-blue-500" },
  };
  return iconMap[type] || { icon: <Bell className="h-5 w-5 text-white" />, bg: "bg-slate-500" };
};


interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onAction: (url: string) => void;
}

function NotificationItem({ notification, onMarkRead, onDismiss, onAction }: NotificationItemProps) {

  const iconData = getNotificationIcon(notification.type);

  return (
    <div
      className="relative px-4 py-4 bg-background hover:bg-muted/30 transition-colors cursor-pointer group border-b last:border-b-0"
      onClick={() => {
        onMarkRead(notification.id);
        if (notification.actionUrl) {
          onAction(notification.actionUrl);
        }
      }}
    >
      <div className="flex gap-3.5">
        {/* Colored icon circle */}
        <div className={cn("flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center", iconData.bg)}>
          {iconData.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-[15px] font-semibold leading-tight text-foreground")}>
              {notification.title}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(notification.timestamp, { addSuffix: false })}
              </span>
              <span className={cn(
                "h-2.5 w-2.5 rounded-full flex-shrink-0",
                notification.read ? "bg-emerald-500" : "bg-red-500"
              )} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">
            {notification.message}
          </p>
          
          {/* CTA Button */}
          {notification.actionLabel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
                if (notification.actionUrl) {
                  onAction(notification.actionUrl);
                }
              }}
              className="mt-2.5 inline-flex items-center gap-1 px-3.5 py-1.5 text-sm font-semibold text-primary border border-primary/30 rounded-md hover:bg-primary/5 transition-colors"
            >
              {notification.actionLabel} <span aria-hidden>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationsDropdown() {
  const navigate = useNavigate();
  const { data: realNotifications = [], isLoading } = useRealNotifications();
  const { notifications: realtimeNotifs, unreadCount: rtUnread, markAsRead: rtMarkRead, markAllAsRead: rtMarkAllRead } = useRealtimeNotifications();
  const [localNotifications, setLocalNotifications] = React.useState<Notification[]>([]);
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = React.useState(false);

  // Map realtime notification types to existing categories
  const realtimeTypeMap: Record<RealtimeNotificationType, { notifType: NotificationType; category: NotificationCategory }> = {
    new_message: { notifType: "sms_received", category: "messages" },
    property_update: { notifType: "deal_stage", category: "deals" },
    buyer_activity: { notifType: "buyer_interest", category: "deals" },
    new_appointment: { notifType: "appointment", category: "tasks" },
  };

  // Merge real notifications + realtime notifications with local read/dismissed state
  const notifications = React.useMemo(() => {
    const mapped = realtimeNotifs.map((rt) => {
      const mapping = realtimeTypeMap[rt.type];
      return {
        id: rt.id,
        type: mapping.notifType,
        title: rt.title,
        message: rt.description,
        timestamp: rt.timestamp,
        read: rt.read,
        priority: "high" as NotificationPriority,
        category: mapping.category,
        actionUrl: rt.href,
        actionLabel: "View",
      } satisfies Notification;
    });

    return [...mapped, ...realNotifications]
      .filter((n) => !dismissedIds.has(n.id))
      .map((n) => ({
        ...n,
        read: n.read || readIds.has(n.id),
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [realNotifications, realtimeNotifs, readIds, dismissedIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;


  const handleMarkRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
    if (id.startsWith("rt-")) rtMarkRead(id);
  };

  const handleMarkAllRead = () => {
    setReadIds((prev) => new Set([...prev, ...notifications.map((n) => n.id)]));
    rtMarkAllRead();
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleAction = (url: string) => {
    setIsOpen(false);
    navigate(url);
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
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-lg tracking-tight">Notifications</h3>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-bold text-white bg-primary rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              Mark All Read
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        {notifications.length > 0 ? (
          <ScrollArea className="max-h-[480px]">
            <div className="pb-1">
              {notifications.map((notification) => (
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

        {/* Footer */}
        <div className="border-t py-3 text-center">
          <button
            onClick={() => {
              setIsOpen(false);
              navigate("/notifications");
            }}
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View All Notifications →
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
