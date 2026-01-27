import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ============ TYPES ============

export interface GHLSyncResult {
  success: boolean;
  ghl_id?: string;
  ghl_appointment_id?: string;
  error?: string;
}

export interface BulkSyncResult {
  success: boolean;
  synced: number;
  failed: number;
  total: number;
  errors: Array<{ property_id: string; error: string }>;
}

export interface GHLWorkflow {
  id: string;
  name: string;
}

// ============ API FUNCTIONS ============

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ghl-sync`;

async function callGHLSync(action: string, data: Record<string, unknown>): Promise<unknown> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, ...data }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Sync failed");
  }

  return result;
}

// Sync a single property to GHL
export async function syncPropertyToGHL(propertyId: string): Promise<GHLSyncResult> {
  try {
    const result = await callGHLSync("sync_property", { property_id: propertyId });
    return result as GHLSyncResult;
  } catch (error) {
    console.error("Sync property error:", error);
    throw error;
  }
}

// Sync an appointment to GHL
export async function syncAppointmentToGHL(appointmentId: string): Promise<GHLSyncResult> {
  try {
    const result = await callGHLSync("sync_appointment", { appointment_id: appointmentId });
    return result as GHLSyncResult;
  } catch (error) {
    console.error("Sync appointment error:", error);
    throw error;
  }
}

// Trigger a GHL workflow
export async function triggerGHLWorkflow(
  propertyId: string,
  workflowId: string
): Promise<{ success: boolean }> {
  try {
    const result = await callGHLSync("trigger_workflow", {
      property_id: propertyId,
      workflow_id: workflowId,
    });
    return result as { success: boolean };
  } catch (error) {
    console.error("Trigger workflow error:", error);
    throw error;
  }
}

// Bulk sync properties to GHL
export async function bulkSyncToGHL(
  propertyIds?: string[]
): Promise<BulkSyncResult> {
  try {
    const result = await callGHLSync("bulk_sync", {
      properties: propertyIds,
    });
    return result as BulkSyncResult;
  } catch (error) {
    console.error("Bulk sync error:", error);
    throw error;
  }
}

// ============ REACT HOOKS ============

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export function useSyncPropertyToGHL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncPropertyToGHL,
    onSuccess: (result, propertyId) => {
      toast.success("Property synced to GoHighLevel", {
        description: `Contact ID: ${result.ghl_id?.substring(0, 8)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["ghl-sync-logs"] });
    },
    onError: (error: Error) => {
      toast.error("Sync failed", {
        description: error.message,
      });
    },
  });
}

export function useSyncAppointmentToGHL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncAppointmentToGHL,
    onSuccess: () => {
      toast.success("Appointment synced to GoHighLevel");
      queryClient.invalidateQueries({ queryKey: ["ghl-sync-logs"] });
    },
    onError: (error: Error) => {
      toast.error("Sync failed", {
        description: error.message,
      });
    },
  });
}

export function useTriggerGHLWorkflow() {
  return useMutation({
    mutationFn: ({ propertyId, workflowId }: { propertyId: string; workflowId: string }) =>
      triggerGHLWorkflow(propertyId, workflowId),
    onSuccess: () => {
      toast.success("Workflow triggered in GoHighLevel");
    },
    onError: (error: Error) => {
      toast.error("Failed to trigger workflow", {
        description: error.message,
      });
    },
  });
}

export function useBulkSyncToGHL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkSyncToGHL,
    onSuccess: (result) => {
      if (result.failed === 0) {
        toast.success("Bulk sync completed", {
          description: `${result.synced} properties synced successfully`,
        });
      } else {
        toast.warning("Bulk sync completed with errors", {
          description: `${result.synced} synced, ${result.failed} failed`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["ghl-connection"] });
      queryClient.invalidateQueries({ queryKey: ["ghl-sync-logs"] });
    },
    onError: (error: Error) => {
      toast.error("Bulk sync failed", {
        description: error.message,
      });
    },
  });
}

export function useUnsyncedPropertiesCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unsynced-properties-count", user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .is("ghl_contact_id", null);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });
}

// Predefined workflows (would come from GHL API in real implementation)
export const GHL_WORKFLOWS: GHLWorkflow[] = [
  { id: "sms_sequence_1", name: "SMS Follow-up Sequence" },
  { id: "email_sequence_1", name: "Email Nurture Sequence" },
  { id: "offer_followup", name: "Offer Follow-up" },
  { id: "hot_lead", name: "Hot Lead Sequence" },
];
