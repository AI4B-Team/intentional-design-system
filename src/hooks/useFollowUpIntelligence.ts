import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationContext } from "@/hooks/useOrganizationId";

export interface StaleLeadRow {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  owner_name: string | null;
  motivation_score: number | null;
  updated_at: string | null;
  owner_phone: string | null;
  owner_email: string | null;
}

export function useFollowUpIntelligence() {
  const { organizationId } = useOrganizationContext();

  return useQuery({
    queryKey: ["follow-up-intelligence", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

      const { data, error } = await supabase
        .from("properties")
        .select("id, address, city, state, owner_name, motivation_score, updated_at, owner_phone, owner_email")
        .eq("organization_id", organizationId)
        .in("status", ["active", "nurture", "contacted", "follow_up"])
        .or(`updated_at.lt.${fourteenDaysAgo},updated_at.is.null`)
        .order("motivation_score", { ascending: false, nullsFirst: false })
        .limit(5);

      if (error) throw error;
      return (data as StaleLeadRow[]) || [];
    },
    enabled: !!organizationId,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}
