import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { scopeToWorkspace } from "@/lib/workspaceScope";
import { getActiveOrganizationId } from "@/lib/activeOrganization";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";

interface DashboardStats {
  activeLeads: { count: number; trend: number };
  appointmentsThisWeek: { count: number; trend: number };
  offersPending: { count: number; trend: number };
  closedThisMonth: { count: number; trend: number };
}

export function useDashboardStats() {
  const { user } = useAuth();
  const organizationId = getActiveOrganizationId();

  return useQuery({
    queryKey: ["dashboard-stats", organizationId, user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      type CountQuery = {
        in: (column: string, values: string[]) => CountQuery;
        eq: (column: string, value: string) => CountQuery;
        gte: (column: string, value: string) => CountQuery;
        lte: (column: string, value: string) => CountQuery;
        lt: (column: string, value: string) => CountQuery;
        then: Promise<{ count: number | null }>["then"];
      };
      const scopedCount = (table: "properties" | "appointments" | "offers"): CountQuery =>
        scopeToWorkspace(
          (supabase.from(table) as ReturnType<typeof supabase.from>).select("id", { count: "exact", head: true }),
          organizationId,
          user!.id,
        ) as unknown as CountQuery;

      const now = new Date();
      
      // Date ranges
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Fetch all data in parallel
      const [
        activeLeadsResult,
        lastWeekActiveLeadsResult,
        appointmentsResult,
        lastWeekAppointmentsResult,
        pendingOffersResult,
        lastWeekPendingOffersResult,
        closedThisMonthResult,
        closedLastMonthResult,
      ] = await Promise.all([
        // Active leads (new or contacted)
        scopedCount("properties")
          .in("status", ["new", "contacted"]),
        
        // Last week active leads (approximate - properties created last week)
        scopedCount("properties")
          .in("status", ["new", "contacted"])
          .lt("created_at", weekStart.toISOString()),
        
        // Appointments this week
        scopedCount("appointments")
          .gte("scheduled_time", weekStart.toISOString())
          .lte("scheduled_time", weekEnd.toISOString()),
        
        // Appointments last week
        scopedCount("appointments")
          .gte("scheduled_time", lastWeekStart.toISOString())
          .lte("scheduled_time", lastWeekEnd.toISOString()),
        
        // Pending offers
        scopedCount("offers")
          .eq("response", "pending"),
        
        // Last week pending offers (approximate)
        scopedCount("offers")
          .eq("response", "pending")
          .lt("created_at", weekStart.toISOString()),
        
        // Closed this month
        scopedCount("properties")
          .eq("status", "closed")
          .gte("updated_at", monthStart.toISOString())
          .lte("updated_at", monthEnd.toISOString()),
        
        // Closed last month
        scopedCount("properties")
          .eq("status", "closed")
          .gte("updated_at", lastMonthStart.toISOString())
          .lte("updated_at", lastMonthEnd.toISOString()),
      ]);

      const calculateTrend = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      const activeLeads = activeLeadsResult.count || 0;
      const lastWeekActiveLeads = lastWeekActiveLeadsResult.count || 0;
      
      const appointments = appointmentsResult.count || 0;
      const lastWeekAppointments = lastWeekAppointmentsResult.count || 0;
      
      const pendingOffers = pendingOffersResult.count || 0;
      const lastWeekPendingOffers = lastWeekPendingOffersResult.count || 0;
      
      const closedThisMonth = closedThisMonthResult.count || 0;
      const closedLastMonth = closedLastMonthResult.count || 0;

      return {
        activeLeads: {
          count: activeLeads,
          trend: calculateTrend(activeLeads, lastWeekActiveLeads),
        },
        appointmentsThisWeek: {
          count: appointments,
          trend: calculateTrend(appointments, lastWeekAppointments),
        },
        offersPending: {
          count: pendingOffers,
          trend: calculateTrend(pendingOffers, lastWeekPendingOffers),
        },
        closedThisMonth: {
          count: closedThisMonth,
          trend: calculateTrend(closedThisMonth, closedLastMonth),
        },
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

