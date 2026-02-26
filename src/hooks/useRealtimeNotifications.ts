import { useEffect, useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentOrganizationId } from "@/hooks/useOrganizationId";

export type RealtimeNotificationType =
  | "new_message"
  | "property_update"
  | "buyer_activity"
  | "new_appointment";

export interface RealtimeNotification {
  id: string;
  title: string;
  description: string;
  type: RealtimeNotificationType;
  href: string;
  timestamp: Date;
  read: boolean;
}

const MAX_NOTIFICATIONS = 50;

/** Play a short 440 Hz beep via Web Audio API */
function playBeep() {
  if (document.visibilityState !== "visible") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 440;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // silently fail if AudioContext is blocked
  }
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const organizationId = useCurrentOrganizationId();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const counterRef = useRef(0);

  const addNotification = useCallback((n: Omit<RealtimeNotification, "id" | "timestamp" | "read">) => {
    counterRef.current += 1;
    const notification: RealtimeNotification = {
      ...n,
      id: `rt-${Date.now()}-${counterRef.current}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
    playBeep();
  }, []);

  useEffect(() => {
    if (!user || !organizationId) return;

    const channel = supabase
      .channel("realtime-notifications")
      // Inbound messages
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "inbox_messages",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row.direction !== "inbound") return;
          addNotification({
            type: "new_message",
            title: `New message from ${row.contact_name || row.contact_phone || row.contact_email || "Unknown"}`,
            description: row.subject || row.body?.slice(0, 80) || "New inbound message",
            href: "/inbox",
          });
        }
      )
      // Property status changes
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "properties",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          const newRow = payload.new as any;
          const oldRow = payload.old as any;
          if (oldRow.status === newRow.status) return;
          addNotification({
            type: "property_update",
            title: `Property status changed`,
            description: `${newRow.address || "Property"} moved to ${newRow.status?.replace(/_/g, " ") || "new stage"}`,
            href: `/properties/${newRow.id}`,
          });
        }
      )
      // Dispo deal activity (views / offers via view_count or interest_count changes)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "dispo_deals",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          const newRow = payload.new as any;
          const oldRow = payload.old as any;
          if ((newRow.view_count ?? 0) > (oldRow.view_count ?? 0)) {
            addNotification({
              type: "buyer_activity",
              title: `Buyer viewed your deal`,
              description: `${newRow.title || newRow.address} — ${newRow.view_count} total views`,
              href: `/dispositions/${newRow.id}`,
            });
          } else if ((newRow.interest_count ?? 0) > (oldRow.interest_count ?? 0)) {
            addNotification({
              type: "buyer_activity",
              title: `Buyer interested in your deal`,
              description: `${newRow.title || newRow.address} — new interest submitted`,
              href: `/dispositions/${newRow.id}`,
            });
          }
        }
      )
      // New appointments
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appointments",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          const row = payload.new as any;
          addNotification({
            type: "new_appointment",
            title: `New appointment booked`,
            description: `${row.appointment_type || "Appointment"} scheduled`,
            href: `/properties/${row.property_id}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, organizationId, addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead, clearAll };
}
