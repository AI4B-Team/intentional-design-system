import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Comp = Tables<"comps">;
export type CompInsert = TablesInsert<"comps">;

export function usePropertyComps(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["property-comps", propertyId],
    queryFn: async (): Promise<Comp[]> => {
      if (!propertyId) return [];
      
      const { data, error } = await supabase
        .from("comps")
        .select("*")
        .eq("subject_property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!propertyId,
  });
}

export function useAddComp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comp: CompInsert) => {
      const { data, error } = await supabase
        .from("comps")
        .insert(comp)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-comps", data.subject_property_id] });
      toast.success("Comp added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add comp");
    },
  });
}

export function useUpdateComp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Comp> }) => {
      const { data, error } = await supabase
        .from("comps")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-comps", data.subject_property_id] });
      toast.success("Comp updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update comp");
    },
  });
}

export function useDeleteComp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, propertyId }: { id: string; propertyId: string }) => {
      const { error } = await supabase
        .from("comps")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, propertyId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-comps", data.propertyId] });
      toast.success("Comp deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete comp");
    },
  });
}
