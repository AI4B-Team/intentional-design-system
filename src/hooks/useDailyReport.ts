import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfDay, endOfDay, subDays, differenceInDays, format } from "date-fns";

export interface TodayPriority {
  id: string;
  type: "velocity" | "appointment" | "followup" | "offer_response";
  title: string;
  description: string;
  urgency: "critical" | "high" | "medium";
  action: string;
  link?: string;
}

export interface OvernightActivity {
  id: string;
  type: "new_lead" | "response" | "status_change" | "closed";
  title: string;
  description: string;
  time: string;
}

export interface HotOpportunity {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  motivationScore: number;
  addedDaysAgo: number;
  movement: "up" | "stable" | "new";
}

export interface NeedsAttention {
  id: string;
  type: "stale" | "overdue_followup" | "no_show" | "no_response";
  address: string;
  issue: string;
  daysSince: number;
  action: string;
}

export interface PerformanceSnapshot {
  metric: string;
  thisWeek: number;
  lastWeek: number;
  change: number;
}

export interface DailyReportData {
  generatedAt: string;
  priorities: TodayPriority[];
  overnightActivity: OvernightActivity[];
  hotOpportunities: HotOpportunity[];
  needsAttention: NeedsAttention[];
  performance: PerformanceSnapshot[];
  pipelineValue: number;
  projectedClosings: number;
}

export function useDailyReport() {
  const { user } = useAuth();
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const yesterdayStart = startOfDay(subDays(today, 1));
  const weekAgo = subDays(today, 7);
  const twoWeeksAgo = subDays(today, 14);

  return useQuery({
    queryKey: ["daily-report", format(today, "yyyy-MM-dd"), user?.id],
    queryFn: async (): Promise<DailyReportData> => {
      // Fetch all needed data in parallel
      const [
        propertiesResult,
        appointmentsResult,
        offersResult,
        outreachResult,
      ] = await Promise.all([
        supabase
          .from("properties")
          .select("id, address, city, state, status, motivation_score, velocity_score, created_at, updated_at, owner_phone, owner_email"),
        supabase
          .from("appointments")
          .select("id, property_id, scheduled_time, status, outcome, notes")
          .gte("scheduled_time", format(yesterdayStart, "yyyy-MM-dd'T'HH:mm:ss"))
          .order("scheduled_time", { ascending: true }),
        supabase
          .from("offers")
          .select("id, property_id, created_at, response, offer_amount")
          .gte("created_at", format(weekAgo, "yyyy-MM-dd'T'HH:mm:ss")),
        supabase
          .from("outreach_log")
          .select("id, target_id, channel, status, created_at, response_content")
          .gte("created_at", format(weekAgo, "yyyy-MM-dd'T'HH:mm:ss")),
      ]);

      const properties = propertiesResult.data || [];
      const appointments = appointmentsResult.data || [];
      const offers = offersResult.data || [];
      const outreach = outreachResult.data || [];

      // ===== TODAY'S PRIORITIES =====
      const priorities: TodayPriority[] = [];

      // Critical velocity properties
      const criticalVelocity = properties.filter(
        (p) => p.velocity_score && p.velocity_score >= 80 && p.status !== "closed"
      );
      criticalVelocity.slice(0, 3).forEach((p) => {
        priorities.push({
          id: `velocity-${p.id}`,
          type: "velocity",
          title: p.address,
          description: `Velocity score: ${p.velocity_score}. High urgency property needs action.`,
          urgency: "critical",
          action: "Review and contact",
          link: `/properties/${p.id}`,
        });
      });

      // Today's appointments
      const todaysAppointments = appointments.filter((a) => {
        const apptDate = new Date(a.scheduled_time);
        return apptDate >= todayStart && apptDate <= todayEnd;
      });
      todaysAppointments.forEach((a) => {
        const prop = properties.find((p) => p.id === a.property_id);
        priorities.push({
          id: `appt-${a.id}`,
          type: "appointment",
          title: prop?.address || "Unknown Property",
          description: `Scheduled for ${format(new Date(a.scheduled_time), "h:mm a")}`,
          urgency: "high",
          action: "Prepare for appointment",
          link: prop ? `/properties/${prop.id}` : undefined,
        });
      });

      // Offers awaiting response
      const pendingOffers = offers.filter((o) => !o.response);
      pendingOffers.slice(0, 3).forEach((o) => {
        const prop = properties.find((p) => p.id === o.property_id);
        priorities.push({
          id: `offer-${o.id}`,
          type: "offer_response",
          title: prop?.address || "Unknown Property",
          description: `$${o.offer_amount.toLocaleString()} offer sent ${format(new Date(o.created_at!), "MMM d")}`,
          urgency: "medium",
          action: "Follow up on offer",
          link: prop ? `/properties/${prop.id}` : undefined,
        });
      });

      // ===== OVERNIGHT ACTIVITY =====
      const overnightActivity: OvernightActivity[] = [];

      // New leads (properties created since yesterday)
      const newLeads = properties.filter((p) => {
        const created = new Date(p.created_at!);
        return created >= yesterdayStart && created < todayStart;
      });
      newLeads.forEach((p) => {
        overnightActivity.push({
          id: `lead-${p.id}`,
          type: "new_lead",
          title: "New lead added",
          description: p.address,
          time: format(new Date(p.created_at!), "h:mm a"),
        });
      });

      // Responses received
      const newResponses = outreach.filter((o) => {
        const created = new Date(o.created_at!);
        return o.response_content && created >= yesterdayStart && created < todayStart;
      });
      newResponses.slice(0, 5).forEach((o) => {
        overnightActivity.push({
          id: `response-${o.id}`,
          type: "response",
          title: "Response received",
          description: o.response_content?.substring(0, 100) || "New response",
          time: format(new Date(o.created_at!), "h:mm a"),
        });
      });

      // Status changes (deals closed)
      const recentlyClosed = properties.filter((p) => {
        const updated = new Date(p.updated_at!);
        return p.status === "closed" && updated >= yesterdayStart && updated < todayStart;
      });
      recentlyClosed.forEach((p) => {
        overnightActivity.push({
          id: `closed-${p.id}`,
          type: "closed",
          title: "Deal closed!",
          description: p.address,
          time: format(new Date(p.updated_at!), "h:mm a"),
        });
      });

      // ===== HOT OPPORTUNITIES =====
      const hotOpportunities: HotOpportunity[] = properties
        .filter((p) => p.motivation_score && p.motivation_score >= 60 && p.status !== "closed")
        .sort((a, b) => (b.motivation_score || 0) - (a.motivation_score || 0))
        .slice(0, 10)
        .map((p) => {
          const daysAgo = differenceInDays(today, new Date(p.created_at!));
          return {
            id: p.id,
            address: p.address,
            city: p.city,
            state: p.state,
            motivationScore: p.motivation_score || 0,
            addedDaysAgo: daysAgo,
            movement: daysAgo <= 2 ? "new" : "stable",
          };
        });

      // ===== NEEDS ATTENTION =====
      const needsAttention: NeedsAttention[] = [];

      // Stale leads (no contact in 7+ days)
      properties
        .filter((p) => {
          const daysSinceUpdate = differenceInDays(today, new Date(p.updated_at!));
          return p.status === "new" && daysSinceUpdate >= 7;
        })
        .slice(0, 5)
        .forEach((p) => {
          needsAttention.push({
            id: `stale-${p.id}`,
            type: "stale",
            address: p.address,
            issue: "No contact since added",
            daysSince: differenceInDays(today, new Date(p.created_at!)),
            action: "Make initial contact",
          });
        });

      // No-show appointments
      const noShows = appointments.filter(
        (a) => a.status === "no_show" || a.outcome === "no_show"
      );
      noShows.slice(0, 3).forEach((a) => {
        const prop = properties.find((p) => p.id === a.property_id);
        needsAttention.push({
          id: `noshow-${a.id}`,
          type: "no_show",
          address: prop?.address || "Unknown",
          issue: "Appointment was a no-show",
          daysSince: differenceInDays(today, new Date(a.scheduled_time)),
          action: "Reschedule or follow up",
        });
      });

      // Offers with no response (5+ days)
      offers
        .filter((o) => {
          const daysSinceSent = differenceInDays(today, new Date(o.created_at!));
          return !o.response && daysSinceSent >= 5;
        })
        .slice(0, 5)
        .forEach((o) => {
          const prop = properties.find((p) => p.id === o.property_id);
          needsAttention.push({
            id: `no-response-${o.id}`,
            type: "no_response",
            address: prop?.address || "Unknown",
            issue: `No response to $${o.offer_amount.toLocaleString()} offer`,
            daysSince: differenceInDays(today, new Date(o.created_at!)),
            action: "Send follow-up",
          });
        });

      // ===== PERFORMANCE SNAPSHOT =====
      const thisWeekLeads = properties.filter(
        (p) => new Date(p.created_at!) >= weekAgo
      ).length;
      const lastWeekLeads = properties.filter(
        (p) => new Date(p.created_at!) >= twoWeeksAgo && new Date(p.created_at!) < weekAgo
      ).length;

      const thisWeekOffers = offers.filter(
        (o) => new Date(o.created_at!) >= weekAgo
      ).length;
      const lastWeekOffers = offers.filter(
        (o) => new Date(o.created_at!) >= twoWeeksAgo && new Date(o.created_at!) < weekAgo
      ).length;

      const thisWeekClosed = properties.filter(
        (p) => p.status === "closed" && new Date(p.updated_at!) >= weekAgo
      ).length;
      const lastWeekClosed = properties.filter(
        (p) => p.status === "closed" && new Date(p.updated_at!) >= twoWeeksAgo && new Date(p.updated_at!) < weekAgo
      ).length;

      const thisWeekAppts = appointments.filter(
        (a) => new Date(a.scheduled_time) >= weekAgo
      ).length;
      const lastWeekAppts = appointments.filter(
        (a) => new Date(a.scheduled_time) >= twoWeeksAgo && new Date(a.scheduled_time) < weekAgo
      ).length;

      const performance: PerformanceSnapshot[] = [
        {
          metric: "Leads",
          thisWeek: thisWeekLeads,
          lastWeek: lastWeekLeads,
          change: lastWeekLeads > 0 ? Math.round(((thisWeekLeads - lastWeekLeads) / lastWeekLeads) * 100) : 0,
        },
        {
          metric: "Appointments",
          thisWeek: thisWeekAppts,
          lastWeek: lastWeekAppts,
          change: lastWeekAppts > 0 ? Math.round(((thisWeekAppts - lastWeekAppts) / lastWeekAppts) * 100) : 0,
        },
        {
          metric: "Offers",
          thisWeek: thisWeekOffers,
          lastWeek: lastWeekOffers,
          change: lastWeekOffers > 0 ? Math.round(((thisWeekOffers - lastWeekOffers) / lastWeekOffers) * 100) : 0,
        },
        {
          metric: "Closed",
          thisWeek: thisWeekClosed,
          lastWeek: lastWeekClosed,
          change: lastWeekClosed > 0 ? Math.round(((thisWeekClosed - lastWeekClosed) / lastWeekClosed) * 100) : 0,
        },
      ];

      // Pipeline value
      const pipelineValue = properties
        .filter((p) => p.status === "under_contract" || p.status === "offer_made")
        .length * 15000; // Estimated profit per deal

      // Projected closings (contracts expected to close this month)
      const projectedClosings = properties.filter((p) => p.status === "under_contract").length;

      return {
        generatedAt: format(today, "EEEE, MMMM d, yyyy 'at' h:mm a"),
        priorities,
        overnightActivity,
        hotOpportunities,
        needsAttention,
        performance,
        pipelineValue,
        projectedClosings,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
