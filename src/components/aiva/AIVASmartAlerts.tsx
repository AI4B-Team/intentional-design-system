import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Flame,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  TrendingUp,
  Eye,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentOrganizationId } from "@/hooks/useOrganizationId";
import { formatDistanceToNow } from "date-fns";

type AlertPriority = "urgent" | "this_week" | "fyi";
type AlertType = "overdue_followup" | "hot_lead_cold" | "stale_deal" | "today_appointment";

interface SmartAlert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  count: number;
  actionLabel: string;
  actionHref: string;
  /** For single-item alerts, optional pre-fill data */
  prefill?: {
    contactName?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

const priorityConfig: Record<AlertPriority, { label: string; className: string }> = {
  urgent: { label: "URGENT", className: "bg-destructive text-destructive-foreground" },
  this_week: { label: "THIS WEEK", className: "bg-warning text-warning-foreground" },
  fyi: { label: "FYI", className: "bg-info text-info-foreground" },
};

const alertIcons: Record<AlertType, React.ReactNode> = {
  overdue_followup: <Clock className="h-4 w-4 text-destructive" />,
  hot_lead_cold: <Flame className="h-4 w-4 text-warning" />,
  stale_deal: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
  today_appointment: <Calendar className="h-4 w-4 text-info" />,
};

export function AIVASmartAlerts() {
  const { user } = useAuth();
  const organizationId = useCurrentOrganizationId();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    if (!user || !organizationId) return;
    setLoading(true);

    try {
      const now = new Date();
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

      const [overdueRes, hotColdRes, staleDealsRes, todayAptsRes] = await Promise.all([
        // Sellers overdue for follow-up (active, not updated in 14+ days)
        supabase
          .from("properties")
          .select("id, address, owner_name, owner_phone, owner_email, updated_at", { count: "exact", head: false })
          .eq("organization_id", organizationId)
          .in("status", ["active", "new", "contacted", "follow_up"])
          .lt("updated_at", fourteenDaysAgo)
          .order("updated_at", { ascending: true })
          .limit(5),

        // Hot leads going cold (high motivation, not updated in 7 days)
        supabase
          .from("properties")
          .select("id, address, owner_name, motivation_score, updated_at", { count: "exact", head: false })
          .eq("organization_id", organizationId)
          .gt("motivation_score", 700)
          .lt("updated_at", sevenDaysAgo)
          .limit(5),

        // Dispo deals sitting too long
        supabase
          .from("dispo_deals")
          .select("id, title, address, created_at", { count: "exact", head: false })
          .eq("organization_id", organizationId)
          .eq("status", "active")
          .lt("created_at", thirtyDaysAgo)
          .limit(5),

        // Today's appointments
        supabase
          .from("appointments")
          .select("id, scheduled_time, appointment_type, property_id", { count: "exact", head: false })
          .eq("organization_id", organizationId)
          .gte("scheduled_time", todayStart)
          .lt("scheduled_time", todayEnd)
          .order("scheduled_time", { ascending: true })
          .limit(10),
      ]);

      const newAlerts: SmartAlert[] = [];

      // Overdue follow-ups
      const overdueCount = overdueRes.count ?? overdueRes.data?.length ?? 0;
      if (overdueCount > 0) {
        newAlerts.push({
          id: "overdue-followup",
          type: "overdue_followup",
          priority: "urgent",
          title: `${overdueCount} seller${overdueCount > 1 ? "s" : ""} overdue for follow-up`,
          description: "Haven't heard from you in 2+ weeks",
          count: overdueCount,
          actionLabel: "Send Follow-Up",
          actionHref: "/communications",
          prefill: overdueRes.data?.[0]
            ? {
                contactName: overdueRes.data[0].owner_name ?? undefined,
                address: overdueRes.data[0].address,
                phone: overdueRes.data[0].owner_phone ?? undefined,
                email: overdueRes.data[0].owner_email ?? undefined,
              }
            : undefined,
        });
      }

      // Hot leads going cold
      const hotCount = hotColdRes.count ?? hotColdRes.data?.length ?? 0;
      if (hotCount > 0) {
        newAlerts.push({
          id: "hot-leads-cold",
          type: "hot_lead_cold",
          priority: "urgent",
          title: `${hotCount} hot lead${hotCount > 1 ? "s" : ""} going cold`,
          description: "Motivation 700+ but no contact in 7 days",
          count: hotCount,
          actionLabel: "View Leads",
          actionHref: "/properties?status=active&sort=motivation_score",
        });
      }

      // Stale deals
      const staleCount = staleDealsRes.count ?? staleDealsRes.data?.length ?? 0;
      if (staleCount > 0) {
        newAlerts.push({
          id: "stale-deals",
          type: "stale_deal",
          priority: "this_week",
          title: `${staleCount} deal${staleCount > 1 ? "s" : ""} sitting 30+ days`,
          description: "Consider price adjustment or re-marketing",
          count: staleCount,
          actionLabel: "View Deals",
          actionHref: "/dispositions",
        });
      }

      // Today's appointments
      const aptCount = todayAptsRes.count ?? todayAptsRes.data?.length ?? 0;
      if (aptCount > 0) {
        newAlerts.push({
          id: "today-appointments",
          type: "today_appointment",
          priority: "fyi",
          title: `${aptCount} appointment${aptCount > 1 ? "s" : ""} today`,
          description: "Check your calendar for upcoming meetings",
          count: aptCount,
          actionLabel: "View Calendar",
          actionHref: "/calendar",
        });
      }

      setAlerts(newAlerts);
    } catch (err) {
      console.error("Smart alerts fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, organizationId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "me";

  const handleAction = (alert: SmartAlert) => {
    if (alert.type === "overdue_followup" && alert.prefill) {
      const { contactName, address, phone } = alert.prefill;
      const msg = encodeURIComponent(
        `Hi ${contactName || "there"}, just checking in on ${address || "your property"}. Still interested in making you a cash offer if the timing works. Give me a call when you can — ${userName}`
      );
      if (phone) {
        navigate(`/communications?tab=sms&to=${encodeURIComponent(phone)}&message=${msg}`);
      } else {
        navigate(`/communications?message=${msg}`);
      }
    } else {
      navigate(alert.actionHref);
    }
  };

  return (
    <Card className="p-4 border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Smart Alerts</h3>
          {alerts.length > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {alerts.length}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={fetchAlerts}
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading && alerts.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">All clear — no alerts right now 🎉</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[320px]">
          <div className="space-y-2">
            {alerts.map((alert) => {
              const priority = priorityConfig[alert.priority];
              return (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0">{alertIcons[alert.type]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[9px] px-1.5 py-0 h-4 ${priority.className}`}>
                          {priority.label}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium leading-tight">{alert.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{alert.description}</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1.5 text-[11px] text-primary"
                        onClick={() => handleAction(alert)}
                      >
                        {alert.type === "overdue_followup" ? (
                          <Send className="h-3 w-3 mr-1" />
                        ) : (
                          <Eye className="h-3 w-3 mr-1" />
                        )}
                        {alert.actionLabel}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
