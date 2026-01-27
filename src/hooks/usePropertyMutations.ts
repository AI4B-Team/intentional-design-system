import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Offers
export function useAddOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offer: TablesInsert<"offers">) => {
      const { data, error } = await supabase
        .from("offers")
        .insert(offer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-offers", data.property_id] });
      toast.success("Offer added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add offer");
    },
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"offers"> }) => {
      const { data, error } = await supabase
        .from("offers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-offers", data.property_id] });
      toast.success("Offer updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update offer");
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, propertyId }: { id: string; propertyId: string }) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;
      return { id, propertyId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-offers", data.propertyId] });
      toast.success("Offer deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete offer");
    },
  });
}

// Outreach
export function useAddOutreach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (outreach: TablesInsert<"outreach_log">) => {
      const { data, error } = await supabase
        .from("outreach_log")
        .insert(outreach)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-outreach", data.target_id] });
      toast.success("Contact logged successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to log contact");
    },
  });
}

export function useDeleteOutreach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, propertyId }: { id: string; propertyId: string }) => {
      const { error } = await supabase.from("outreach_log").delete().eq("id", id);
      if (error) throw error;
      return { id, propertyId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-outreach", data.propertyId] });
      toast.success("Outreach deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete outreach");
    },
  });
}

// Appointments
export function useAddAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: TablesInsert<"appointments">) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert(appointment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-appointments", data.property_id] });
      toast.success("Appointment scheduled");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to schedule appointment");
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"appointments"> }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-appointments", data.property_id] });
      toast.success("Appointment updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update appointment");
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, propertyId }: { id: string; propertyId: string }) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
      return { id, propertyId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-appointments", data.propertyId] });
      toast.success("Appointment deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete appointment");
    },
  });
}
