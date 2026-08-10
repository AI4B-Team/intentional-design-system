import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { scopeToWorkspace } from "@/lib/workspaceScope";
import { getActiveOrganizationId } from "@/lib/activeOrganization";

export interface HotOpportunity {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  motivation_score: number | null;
  status: string | null;
  updated_at: string | null;
  owner_phone: string | null;
  owner_email: string | null;
}

export function useHotOpportunities(limit = 15) {
  const { user } = useAuth();
  const organizationId = getActiveOrganizationId();

  return useQuery({
    queryKey: ["hot-opportunities", limit, organizationId, user?.id],
    queryFn: async (): Promise<HotOpportunity[]> => {
      const { data, error } = await scopeToWorkspace(
        supabase
          .from("properties")
          .select(
            "id, address, city, state, motivation_score, status, updated_at, owner_phone, owner_email",
          ),
        organizationId,
        user!.id,
      )
        .order("motivation_score", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });
}
