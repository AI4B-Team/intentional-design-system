import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ============ TYPES ============

export interface GHLConnection {
  id: string;
  user_id: string;
  api_key: string | null;
  location_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
  account_name: string | null;
  is_active: boolean;
  sync_contacts_enabled: boolean;
  sync_pipeline_enabled: boolean;
  sync_appointments_enabled: boolean;
  two_way_sync_enabled: boolean;
  conflict_resolution: "dealflow_wins" | "ghl_wins" | "most_recent_wins";
  ghl_pipeline_id: string | null;
  ghl_calendar_id: string | null;
  field_mappings: Record<string, string>;
  stage_mappings: Record<string, string>;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GHLSyncLog {
  id: string;
  user_id: string;
  sync_type: "contact" | "pipeline" | "appointment" | "task";
  direction: "to_ghl" | "from_ghl";
  record_type: string;
  record_id: string | null;
  ghl_id: string | null;
  status: "success" | "failed" | "skipped";
  error_message: string | null;
  created_at: string;
}

export interface FieldMapping {
  dealflow_field: string;
  ghl_field: string;
  dealflow_label: string;
  ghl_label: string;
}

export interface StageMapping {
  dealflow_stage: string;
  ghl_stage: string;
  dealflow_label: string;
  ghl_label: string;
}

// Default field mappings
export const DEFAULT_FIELD_MAPPINGS: FieldMapping[] = [
  { dealflow_field: "owner_name", ghl_field: "contact_name", dealflow_label: "Owner Name", ghl_label: "Contact Name" },
  { dealflow_field: "owner_phone", ghl_field: "phone", dealflow_label: "Owner Phone", ghl_label: "Phone" },
  { dealflow_field: "owner_email", ghl_field: "email", dealflow_label: "Owner Email", ghl_label: "Email" },
  { dealflow_field: "address", ghl_field: "property_address", dealflow_label: "Address", ghl_label: "Property Address (Custom)" },
  { dealflow_field: "motivation_score", ghl_field: "motivation_score", dealflow_label: "Motivation Score", ghl_label: "Motivation Score (Custom)" },
  { dealflow_field: "status", ghl_field: "tags", dealflow_label: "Status", ghl_label: "Tags" },
];

// Default stage mappings
export const DEFAULT_STAGE_MAPPINGS: StageMapping[] = [
  { dealflow_stage: "new", ghl_stage: "new_lead", dealflow_label: "New", ghl_label: "New Lead" },
  { dealflow_stage: "contacted", ghl_stage: "contacted", dealflow_label: "Contacted", ghl_label: "Contacted" },
  { dealflow_stage: "appointment", ghl_stage: "appointment_set", dealflow_label: "Appointment", ghl_label: "Appointment Set" },
  { dealflow_stage: "offer_made", ghl_stage: "offer_made", dealflow_label: "Offer Made", ghl_label: "Offer Made" },
  { dealflow_stage: "under_contract", ghl_stage: "under_contract", dealflow_label: "Under Contract", ghl_label: "Under Contract" },
  { dealflow_stage: "closed", ghl_stage: "closed_won", dealflow_label: "Closed", ghl_label: "Closed Won" },
  { dealflow_stage: "dead", ghl_stage: "closed_lost", dealflow_label: "Dead", ghl_label: "Closed Lost" },
];

// ============ HOOKS ============

export function useGHLConnection() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ghl-connection", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("ghl_connections")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as GHLConnection | null;
    },
    enabled: !!user?.id,
  });
}

export function useGHLSyncLogs(limit = 50) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ghl-sync-logs", user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("ghl_sync_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as GHLSyncLog[];
    },
    enabled: !!user?.id,
  });
}

export function useConnectGHL() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      apiKey,
      locationId,
      accountName,
    }: {
      apiKey: string;
      locationId: string;
      accountName?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Check if connection already exists
      const { data: existing } = await supabase
        .from("ghl_connections")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("ghl_connections")
          .update({
            api_key: apiKey,
            location_id: locationId,
            account_name: accountName || `Location ${locationId.substring(0, 8)}`,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("ghl_connections")
          .insert({
            user_id: user.id,
            api_key: apiKey,
            location_id: locationId,
            account_name: accountName || `Location ${locationId.substring(0, 8)}`,
            is_active: true,
            field_mappings: Object.fromEntries(
              DEFAULT_FIELD_MAPPINGS.map((m) => [m.dealflow_field, m.ghl_field])
            ),
            stage_mappings: Object.fromEntries(
              DEFAULT_STAGE_MAPPINGS.map((m) => [m.dealflow_stage, m.ghl_stage])
            ),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ghl-connection"] });
      toast.success("GoHighLevel connected successfully!");
    },
    onError: (error) => {
      toast.error("Failed to connect GoHighLevel", {
        description: error.message,
      });
    },
  });
}

export function useDisconnectGHL() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("ghl_connections")
        .update({
          is_active: false,
          api_key: null,
          access_token: null,
          refresh_token: null,
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ghl-connection"] });
      toast.success("GoHighLevel disconnected");
    },
  });
}

export function useUpdateGHLSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<GHLConnection>) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("ghl_connections")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ghl-connection"] });
      toast.success("Settings saved");
    },
  });
}

export function useTestGHLConnection() {
  return useMutation({
    mutationFn: async ({
      apiKey,
      locationId,
    }: {
      apiKey: string;
      locationId: string;
    }) => {
      // In a real implementation, this would call an edge function
      // that makes a test API call to GHL
      // For now, simulate a test
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Validate format
      if (!apiKey || apiKey.length < 10) {
        throw new Error("Invalid API key format");
      }
      if (!locationId || locationId.length < 5) {
        throw new Error("Invalid Location ID format");
      }

      return { success: true, accountName: "Test Account" };
    },
  });
}

export function useTriggerGHLSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (syncType: "contacts" | "pipeline" | "appointments" | "all") => {
      if (!user?.id) throw new Error("Not authenticated");

      // In a real implementation, this would call an edge function
      // that performs the actual sync with GHL API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update last_sync_at
      await supabase
        .from("ghl_connections")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("user_id", user.id);

      return { synced: 0, syncType };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ghl-connection"] });
      queryClient.invalidateQueries({ queryKey: ["ghl-sync-logs"] });
      toast.success(`Sync completed`, {
        description: `${data.syncType} sync finished`,
      });
    },
  });
}
