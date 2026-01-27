import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type DealSource = Tables<"deal_sources">;
export type OutreachLog = Tables<"outreach_log">;

export function useDealSource(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["deal-source", id],
    queryFn: async () => {
      if (!id || !user?.id) return null;

      const { data, error } = await supabase
        .from("deal_sources")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as DealSource;
    },
    enabled: !!id && !!user?.id,
  });
}

export function useDealSourceDeals(sourceId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["deal-source-deals", sourceId],
    queryFn: async () => {
      if (!sourceId || !user?.id) return [];

      const { data, error } = await supabase
        .from("properties")
        .select("id, address, city, state, status, arv, created_at")
        .eq("source_id", sourceId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!sourceId && !!user?.id,
  });
}

export function useDealSourceOutreach(sourceId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["deal-source-outreach", sourceId],
    queryFn: async () => {
      if (!sourceId || !user?.id) return [];

      const { data, error } = await supabase
        .from("outreach_log")
        .select("*")
        .eq("target_type", "deal_source")
        .eq("target_id", sourceId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OutreachLog[];
    },
    enabled: !!sourceId && !!user?.id,
  });
}

export function useUpdateDealSourceField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"deal_sources"> }) => {
      const { data, error } = await supabase
        .from("deal_sources")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["deal-source", data.id] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
    },
    onError: (error) => {
      console.error("Error updating deal source:", error);
      toast.error("Failed to update");
    },
  });
}

export function useLogDealSourceContact() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      sourceId, 
      channel, 
      content,
      direction = "outbound"
    }: { 
      sourceId: string; 
      channel: string; 
      content?: string;
      direction?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Create outreach log entry
      const { error: logError } = await supabase
        .from("outreach_log")
        .insert({
          user_id: user.id,
          target_type: "deal_source",
          target_id: sourceId,
          channel,
          content,
          direction,
          status: "sent",
        });

      if (logError) throw logError;

      // Update last contact date
      const { data, error } = await supabase
        .from("deal_sources")
        .update({ last_contact_date: new Date().toISOString().split("T")[0] })
        .eq("id", sourceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["deal-source", data.id] });
      queryClient.invalidateQueries({ queryKey: ["deal-source-outreach", data.id] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      toast.success("Contact logged");
    },
    onError: (error) => {
      console.error("Error logging contact:", error);
      toast.error("Failed to log contact");
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
      toast.success("Deal source deleted");
    },
    onError: (error) => {
      console.error("Error deleting deal source:", error);
      toast.error("Failed to delete deal source");
    },
  });
}
