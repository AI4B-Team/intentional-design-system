import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export interface BuyBox {
  property_types?: string[];
  price_min?: number;
  price_max?: number;
  target_areas?: string[];
  condition_preferences?: string[];
  min_roi?: number;
  closing_timeline?: string;
}

export interface Buyer {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  preferred_contact: string | null;
  buy_box: BuyBox;
  pof_verified: boolean;
  reliability_score: number;
  deals_viewed: number;
  deals_closed: number;
  total_volume: number;
  avg_close_days: number | null;
  last_activity: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useBuyers(filters?: {
  status?: string;
  pofVerified?: string;
  activity?: string;
  sort?: string;
  search?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["buyers", filters],
    queryFn: async () => {
      let query = supabase.from("buyers").select("*");

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      if (filters?.pofVerified === "verified") {
        query = query.eq("pof_verified", true);
      } else if (filters?.pofVerified === "not_verified") {
        query = query.eq("pof_verified", false);
      }

      if (filters?.activity === "active") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte("last_activity", thirtyDaysAgo.toISOString());
      } else if (filters?.activity === "dormant") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.or(`last_activity.lt.${thirtyDaysAgo.toISOString()},last_activity.is.null`);
      }

      switch (filters?.sort) {
        case "most_active":
          query = query.order("last_activity", { ascending: false, nullsFirst: false });
          break;
        case "highest_volume":
          query = query.order("total_volume", { ascending: false });
          break;
        case "best_reliability":
          query = query.order("reliability_score", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map((b) => ({
        ...b,
        buy_box: (b.buy_box as BuyBox) || {},
      })) as Buyer[];
    },
    enabled: !!user,
  });
}

export function useBuyer(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["buyer", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("buyers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return {
        ...data,
        buy_box: (data.buy_box as BuyBox) || {},
      } as Buyer;
    },
    enabled: !!user && !!id,
  });
}

export function useBuyerStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["buyer-stats"],
    queryFn: async () => {
      const { data: buyers, error } = await supabase.from("buyers").select("*");

      if (error) throw error;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return {
        total: buyers?.length || 0,
        verified: buyers?.filter((b) => b.pof_verified).length || 0,
        activeThisMonth:
          buyers?.filter(
            (b) => b.last_activity && new Date(b.last_activity) >= thirtyDaysAgo
          ).length || 0,
        totalDealsClosed: buyers?.reduce((sum, b) => sum + (b.deals_closed || 0), 0) || 0,
      };
    },
    enabled: !!user,
  });
}

export function useCreateBuyer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      buyer: Omit<Partial<Buyer>, "user_id" | "id" | "created_at" | "updated_at">
    ) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("buyers")
        .insert({
          name: buyer.name!,
          user_id: user.id,
          company: buyer.company,
          phone: buyer.phone,
          email: buyer.email,
          preferred_contact: buyer.preferred_contact,
          buy_box: buyer.buy_box as Json,
          pof_verified: buyer.pof_verified || false,
          notes: buyer.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      queryClient.invalidateQueries({ queryKey: ["buyer-stats"] });
      toast.success("Buyer added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add buyer");
    },
  });
}

export function useUpdateBuyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Buyer, "id" | "user_id" | "created_at">>;
    }) => {
      const { data, error } = await supabase
        .from("buyers")
        .update({
          ...updates,
          buy_box: updates.buy_box as Json,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      queryClient.invalidateQueries({ queryKey: ["buyer", id] });
      queryClient.invalidateQueries({ queryKey: ["buyer-stats"] });
      toast.success("Buyer updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update buyer");
    },
  });
}

export function useDeleteBuyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("buyers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      queryClient.invalidateQueries({ queryKey: ["buyer-stats"] });
      toast.success("Buyer deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete buyer");
    },
  });
}
