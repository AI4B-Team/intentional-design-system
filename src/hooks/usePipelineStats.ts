import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PIPELINE_COLORS, PIPELINE_LABELS, type PipelineStageId } from "@/lib/pipeline-colors";

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
      // Use centralized color config for consistency with dashboard tiles
      // Note: "closed" = Purchased (deals we bought), "sold" = Sold (deals we flipped/sold)
      const statuses: { status: PipelineStageId; label: string; color: string; dbStatus?: string }[] = [
        { status: "new", label: PIPELINE_LABELS.new, color: PIPELINE_COLORS.new.bg },
        { status: "contacted", label: PIPELINE_LABELS.contacted, color: PIPELINE_COLORS.contacted.bg },
        { status: "appointment", label: PIPELINE_LABELS.appointment, color: PIPELINE_COLORS.appointment.bg },
        { status: "offer_made", label: PIPELINE_LABELS.offer_made, color: PIPELINE_COLORS.offer_made.bg },
        { status: "under_contract", label: PIPELINE_LABELS.under_contract, color: PIPELINE_COLORS.under_contract.bg },
        { status: "closed", label: PIPELINE_LABELS.closed, color: PIPELINE_COLORS.closed.bg },
        { status: "sold", label: PIPELINE_LABELS.sold, color: PIPELINE_COLORS.sold.bg },
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
