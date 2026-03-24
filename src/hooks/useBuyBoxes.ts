import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

export interface BuyBoxCriteria {
  price_min?: number;
  price_max?: number;
  property_types?: string[];
  markets?: string[];
  min_beds?: number;
  max_beds?: number;
  min_sqft?: number;
  max_sqft?: number;
  offer_pct?: number;
  conditions?: string[];
}

export interface BuyBox {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  is_active: boolean;
  criteria: BuyBoxCriteria;
  offer_formula: string;
  offer_percentage: number;
  max_daily_offers: number;
  total_offers_sent: number;
  total_deals_closed: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useBuyBoxes() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["buy-boxes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buy_boxes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BuyBox[];
    },
    enabled: !!user?.id,
  });

  const createBuyBox = useMutation({
    mutationFn: async (buyBox: Partial<BuyBox>) => {
      const { data, error } = await supabase
        .from("buy_boxes")
        .insert({
          user_id: user!.id,
          organization_id: organization?.id,
          name: buyBox.name || "New Buy Box",
          criteria: buyBox.criteria as any || {},
          offer_formula: buyBox.offer_formula || "pct_arv",
          offer_percentage: buyBox.offer_percentage || 0.70,
          max_daily_offers: buyBox.max_daily_offers || 10,
          is_active: buyBox.is_active ?? true,
        })
        .select()
        .single();
      if (error) throw error;
      return data as BuyBox;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buy-boxes"] });
      toast.success("Buy box created");
    },
    onError: (e) => toast.error("Failed to create buy box: " + e.message),
  });

  const updateBuyBox = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BuyBox> & { id: string }) => {
      const { error } = await supabase
        .from("buy_boxes")
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buy-boxes"] });
      toast.success("Buy box updated");
    },
    onError: (e) => toast.error("Failed to update buy box: " + e.message),
  });

  const deleteBuyBox = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("buy_boxes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buy-boxes"] });
      toast.success("Buy box deleted");
    },
    onError: (e) => toast.error("Failed to delete buy box: " + e.message),
  });

  const runEngine = useMutation({
    mutationFn: async (buyBoxId?: string) => {
      const { data, error } = await supabase.functions.invoke("auto-offer-engine", {
        body: buyBoxId ? { buy_box_id: buyBoxId } : {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["buy-boxes"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success(`Engine complete — ${data?.queued || 0} offers queued`);
    },
    onError: (e) => toast.error("Engine failed: " + e.message),
  });

  return { ...query, createBuyBox, updateBuyBox, deleteBuyBox, runEngine };
}
