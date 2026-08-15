import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isSameDay, differenceInDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentOrganizationId } from "@/hooks/useOrganizationId";
import { scopeToWorkspace } from "@/lib/workspaceScope";
import type { CalendarEvent } from "@/components/calendar/types";
import { getUrgency } from "@/components/calendar/calendar-constants";

export function useCalendarEvents(currentDate: Date) {
  const { user } = useAuth();
  const organizationId = useCurrentOrganizationId();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const rangeStart = startOfWeek(subMonths(monthStart, 1));
  const rangeEnd = endOfWeek(addMonths(monthEnd, 1));

  return useQuery({
    queryKey: ["calendar-events", organizationId, user?.id, format(rangeStart, "yyyy-MM-dd"), format(rangeEnd, "yyyy-MM-dd")],
    enabled: !!user?.id,
    queryFn: async (): Promise<CalendarEvent[]> => {
      const userId = user!.id;
      const events: CalendarEvent[] = [];

      // 1. Fetch from unified_actions (canonical source)
      const { data: unifiedActions } = await scopeToWorkspace(
        supabase.from("unified_actions").select("*"),
        organizationId,
        userId,
      )
        .gte("due_at", rangeStart.toISOString())
        .lte("due_at", rangeEnd.toISOString())
        .in("status", ["pending", "overdue", "completed"])
        .order("due_at", { ascending: true });

      const unifiedIds = new Set<string>();

      unifiedActions?.forEach((action: any) => {
        const typeMap: Record<string, CalendarEvent["type"]> = {
          call: "followup",
          follow_up: "followup",
          appointment: "appointment",
          deadline: "offer_deadline",
          inspection: "inspection",
          task: "followup",
          doc: "offer_deadline",
          payment: "closing",
        };
        const dueDate = parseISO(action.due_at);
        const isOverdue = action.status === "overdue" || (action.status === "pending" && dueDate < new Date());

        events.push({
          id: `ua-${action.id}`,
          title: action.title,
          date: dueDate,
          time: action.due_at ? format(dueDate, "h:mm a") : null,
          type: typeMap[action.type] || "followup",
          status: action.status === "completed" ? "completed" : isOverdue ? "overdue" : "pending",
          propertyId: action.property_id || undefined,
          propertyAddress: action.property_address || undefined,
          contactName: action.contact_name || undefined,
          meta: action.meta || {},
          isOverdue,
          urgency: action.priority as CalendarEvent["urgency"],
        });

        // Track source refs to avoid duplicates from legacy queries
        if (action.source_ref) unifiedIds.add(action.source_ref);
      });

      // 2. Legacy: appointments (skip if already in unified_actions)
      const { data: appointments } = await scopeToWorkspace(
        supabase.from("appointments").select(`id, scheduled_time, appointment_type, status, notes, property_id, properties!inner(address, city, state)`),
        organizationId,
        userId,
        "created_by",
      )
        .gte("scheduled_time", rangeStart.toISOString())
        .lte("scheduled_time", rangeEnd.toISOString())
        .order("scheduled_time", { ascending: true });

      appointments?.forEach((apt) => {
        if (unifiedIds.has(apt.id)) return; // Already in unified_actions
        const prop = apt.properties as unknown as { address: string; city: string; state: string };
        events.push({
          id: apt.id,
          title: `${apt.appointment_type || "Appointment"} - ${prop.address}`,
          date: parseISO(apt.scheduled_time),
          time: format(parseISO(apt.scheduled_time), "h:mm a"),
          type: "appointment",
          status: apt.status || "scheduled",
          propertyId: apt.property_id,
          propertyAddress: `${prop.address}, ${prop.city}`,
        });
      });

      // 3. Legacy: follow-ups from calls (skip if already in unified_actions)
      const { data: followups } = await scopeToWorkspace(
        supabase.from("calls").select(`id, follow_up_date, follow_up_time, follow_up_notes, contact_name, property_id, properties(address, city), created_at`),
        organizationId,
        userId,
      )
        .not("follow_up_date", "is", null)
        .gte("follow_up_date", format(rangeStart, "yyyy-MM-dd"))
        .lte("follow_up_date", format(rangeEnd, "yyyy-MM-dd"));

      followups?.forEach((f) => {
        if (unifiedIds.has(f.id)) return;
        const prop = f.properties as unknown as { address: string; city: string } | null;
        const d = parseISO(f.follow_up_date!);
        const isOverdue = d < new Date() && !isSameDay(d, new Date());
        const lastContactDays = f.created_at ? differenceInDays(new Date(), parseISO(f.created_at)) : undefined;
        events.push({
          id: `followup-${f.id}`,
          title: `Follow up: ${f.contact_name || prop?.address || "Unknown"}`,
          date: d,
          time: f.follow_up_time || null,
          type: "followup",
          status: isOverdue ? "overdue" : "pending",
          propertyId: f.property_id || undefined,
          propertyAddress: prop ? `${prop.address}, ${prop.city}` : undefined,
          contactName: f.contact_name || undefined,
          meta: { notes: f.follow_up_notes },
          isOverdue,
          lastContactDays,
        });
      });

      // 4. Legacy: stale properties
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const { data: staleProps } = await scopeToWorkspace(
        supabase.from("properties").select("id, address, city, state, updated_at"),
        organizationId,
        userId,
      )
        .eq("status", "contacted")
        .lt("updated_at", threeDaysAgo.toISOString())
        .limit(10);

      staleProps?.forEach((prop) => {
        if (unifiedIds.has(prop.id)) return;
        const lastContactDays = differenceInDays(new Date(), parseISO(prop.updated_at));
        events.push({
          id: `stale-${prop.id}`,
          title: `Overdue: ${prop.address}`,
          date: new Date(),
          time: null,
          type: "followup",
          status: "overdue",
          propertyId: prop.id,
          propertyAddress: `${prop.address}, ${prop.city}`,
          isOverdue: true,
          lastContactDays,
        });
      });

      return events.map((e) => ({ ...e, urgency: e.urgency || getUrgency(e) })).sort((a, b) => a.date.getTime() - b.date.getTime());
    },
    refetchInterval: 60000,
  });
}
