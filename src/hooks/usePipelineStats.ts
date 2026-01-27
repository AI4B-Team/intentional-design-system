import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PipelineStage {
  status: string;
  label: string;
  count: number;
  color: string;
}

export function usePipelineStats() {
  return useQuery({
    queryKey: ["pipeline-stats"],
    queryFn: async (): Promise<PipelineStage[]> => {
      const statuses = [
        { status: "new", label: "New Leads", color: "bg-muted" },
        { status: "contacted", label: "Contacted", color: "bg-info" },
        { status: "appointment", label: "Appointments", color: "bg-warning" },
        { status: "offer_made", label: "Offers Made", color: "bg-accent" },
        { status: "under_contract", label: "Under Contract", color: "bg-chart-4" },
        { status: "closed", label: "Closed", color: "bg-success" },
      ];

      const results = await Promise.all(
        statuses.map(async ({ status, label, color }) => {
          const { count } = await supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("status", status);

          return {
            status,
            label,
            count: count || 0,
            color,
          };
        })
      );

      return results;
    },
    refetchInterval: 30000,
  });
}
