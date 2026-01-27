import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type DealSource = Tables<"deal_sources">;
export type DealSourceInsert = TablesInsert<"deal_sources">;
export type DealSourceUpdate = TablesUpdate<"deal_sources">;

export type DealSourceType = "agent" | "wholesaler" | "lender";
export type DealSourceStatus = "cold" | "contacted" | "responded" | "active" | "inactive";

export interface DealSourceFilters {
  type?: DealSourceType | "all";
  status?: DealSourceStatus | "all";
  performance?: "all" | "top" | "new";
  search?: string;
  sortBy?: "newest" | "deals" | "profit" | "last_contact";
}

export function useDealSources(filters: DealSourceFilters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["deal-sources", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("deal_sources")
        .select("*")
        .eq("user_id", user.id);

      // Filter by type
      if (filters.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }

      // Filter by status
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // Filter by performance
      if (filters.performance === "top") {
        query = query.gte("deals_closed", 5);
      } else if (filters.performance === "new") {
        query = query.eq("deals_closed", 0);
      }

      // Search
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(`name.ilike.${searchTerm},company.ilike.${searchTerm},email.ilike.${searchTerm}`);
      }

      // Sorting
      switch (filters.sortBy) {
        case "deals":
          query = query.order("deals_closed", { ascending: false });
          break;
        case "profit":
          query = query.order("total_profit", { ascending: false });
          break;
        case "last_contact":
          query = query.order("last_contact_date", { ascending: false, nullsFirst: false });
          break;
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DealSource[];
    },
    enabled: !!user?.id,
  });
}

export function useDealSourceStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["deal-sources-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("deal_sources")
        .select("status, deals_closed, total_profit")
        .eq("user_id", user.id);

      if (error) throw error;

      const total = data.length;
      const active = data.filter((d) => d.status === "active").length;
      const totalDeals = data.reduce((sum, d) => sum + (d.deals_closed || 0), 0);
      const totalProfit = data.reduce((sum, d) => sum + Number(d.total_profit || 0), 0);

      return {
        total,
        active,
        dealsThisMonth: totalDeals, // Simplified - would need date filtering for real "this month"
        totalProfit,
      };
    },
    enabled: !!user?.id,
  });
}

export function useCreateDealSource() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<DealSourceInsert, "user_id">) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: result, error } = await supabase
        .from("deal_sources")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources-stats"] });
      toast.success("Deal source added successfully");
    },
    onError: (error) => {
      console.error("Error creating deal source:", error);
      toast.error("Failed to add deal source");
    },
  });
}

export function useUpdateDealSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DealSourceUpdate }) => {
      const { data, error } = await supabase
        .from("deal_sources")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources-stats"] });
      toast.success("Deal source updated successfully");
    },
    onError: (error) => {
      console.error("Error updating deal source:", error);
      toast.error("Failed to update deal source");
    },
  });
}

export function useDeleteDealSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("deal_sources")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources-stats"] });
      toast.success("Deal source deleted");
    },
    onError: (error) => {
      console.error("Error deleting deal source:", error);
      toast.error("Failed to delete deal source");
    },
  });
}

export function useLogContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("deal_sources")
        .update({ last_contact_date: new Date().toISOString().split("T")[0] })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      toast.success("Contact logged");
    },
    onError: (error) => {
      console.error("Error logging contact:", error);
      toast.error("Failed to log contact");
    },
  });
}
