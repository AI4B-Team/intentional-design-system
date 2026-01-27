import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export type Property = Tables<"properties">;

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async (): Promise<Property | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Property> }) => {
      const { data, error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property", data.id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update property");
    },
  });
}

export function usePropertyOffers(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["property-offers", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
  });
}

export function usePropertyAppointments(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["property-appointments", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("property_id", propertyId)
        .order("scheduled_time", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
  });
}

export function usePropertyOutreach(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["property-outreach", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      
      const { data, error } = await supabase
        .from("outreach_log")
        .select("*")
        .eq("target_id", propertyId)
        .eq("target_type", "property")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
  });
}
