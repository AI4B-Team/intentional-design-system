import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { scopeToWorkspace } from "@/lib/workspaceScope";
import { getActiveOrganizationId } from "@/lib/activeOrganization";
import { startOfDay, endOfDay, format } from "date-fns";

export interface TodayTask {
  id: string;
  type: "appointment" | "followup";
  title: string;
  time: string | null;
  propertyId: string;
  propertyAddress: string;
  completed: boolean;
}

export function useTodaysTasks() {
  const { user } = useAuth();
  const organizationId = getActiveOrganizationId();

  return useQuery({
    queryKey: ["todays-tasks", organizationId, user?.id],
    queryFn: async (): Promise<TodayTask[]> => {
      const now = new Date();
      const dayStart = startOfDay(now);
      const dayEnd = endOfDay(now);

      // Fetch today's appointments
      const { data: appointments, error: appointmentsError } = await scopeToWorkspace(
        supabase.from("appointments").select(`
          id,
          scheduled_time,
          appointment_type,
          status,
          property_id,
          properties!inner(address)
        `),
        organizationId,
        user!.id,
      )
        .gte("scheduled_time", dayStart.toISOString())
        .lte("scheduled_time", dayEnd.toISOString())
        .order("scheduled_time", { ascending: true });

      if (appointmentsError) throw appointmentsError;

      // Fetch properties needing follow-up (contacted but not updated in 3+ days)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: followups, error: followupsError } = await scopeToWorkspace(
        supabase.from("properties").select("id, address, updated_at"),
        organizationId,
        user!.id,
      )
        .eq("status", "contacted")
        .lt("updated_at", threeDaysAgo.toISOString())
        .limit(5);

      if (followupsError) throw followupsError;

      const tasks: TodayTask[] = [];

      // Add appointments
      appointments?.forEach((apt) => {
        const property = apt.properties as unknown as { address: string };
        tasks.push({
          id: apt.id,
          type: "appointment",
          title: `${apt.appointment_type || "Appointment"} - ${property.address}`,
          time: apt.scheduled_time ? format(new Date(apt.scheduled_time), "h:mm a") : null,
          propertyId: apt.property_id,
          propertyAddress: property.address,
          completed: apt.status === "completed",
        });
      });

      // Add follow-ups
      followups?.forEach((prop) => {
        tasks.push({
          id: `followup-${prop.id}`,
          type: "followup",
          title: `Follow up on ${prop.address}`,
          time: null,
          propertyId: prop.id,
          propertyAddress: prop.address,
          completed: false,
        });
      });

      return tasks;
    },
    enabled: !!user?.id,
    refetchInterval: 60000,
  });
}
