import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  return useQuery({
    queryKey: ["hot-opportunities", limit],
    queryFn: async (): Promise<HotOpportunity[]> => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, address, city, state, motivation_score, status, updated_at, owner_phone, owner_email")
        .order("motivation_score", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });
}
