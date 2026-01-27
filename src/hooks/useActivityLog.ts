import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";

export interface ActivityLogEntry {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  changes: Record<string, { old: unknown; new: unknown }>;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: {
    email?: string;
    full_name?: string;
  };
}

export type ActivityAction = 
  | "created" 
  | "updated" 
  | "deleted" 
  | "assigned" 
  | "unassigned"
  | "status_changed" 
  | "offer_made" 
  | "appointment_scheduled"
  | "call_logged"
  | "note_added"
  | "document_uploaded";

export type EntityType = 
  | "property" 
  | "offer" 
  | "appointment" 
  | "outreach" 
  | "buyer" 
  | "note"
  | "document";

interface LogActivityParams {
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
}

export function useLogActivity() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: LogActivityParams) => {
      if (!user || !organization) {
        throw new Error("User or organization not found");
      }

      const insertData = {
        organization_id: organization.id,
        user_id: user.id,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        entity_name: params.entityName || null,
        changes: params.changes || {},
        metadata: params.metadata || {},
      };

      const { data, error } = await supabase
        .from("activity_log")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-log"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
    },
  });
}

export function useActivityLog(options?: {
  entityType?: EntityType;
  entityId?: string;
  userId?: string;
  limit?: number;
}) {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ["activity-log", organization?.id, options],
    queryFn: async () => {
      if (!organization) return [];

      let query = supabase
        .from("activity_log")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false });

      if (options?.entityType) {
        query = query.eq("entity_type", options.entityType);
      }

      if (options?.entityId) {
        query = query.eq("entity_id", options.entityId);
      }

      if (options?.userId) {
        query = query.eq("user_id", options.userId);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      } else {
        query = query.limit(50);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityLogEntry[];
    },
    enabled: !!organization,
  });
}

export function usePropertyActivity(propertyId: string | undefined) {
  return useActivityLog({
    entityType: "property",
    entityId: propertyId,
    limit: 20,
  });
}

export function useTeamActivity(limit = 20) {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ["team-activity", organization?.id, limit],
    queryFn: async () => {
      if (!organization) return [];

      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ActivityLogEntry[];
    },
    enabled: !!organization,
    refetchInterval: 30000,
  });
}

// Helper to format activity for display
export function formatActivityMessage(activity: ActivityLogEntry): string {
  const entityName = activity.entity_name || "Unknown";
  
  switch (activity.action) {
    case "created":
      return `Created ${activity.entity_type}: ${entityName}`;
    case "updated":
      const changedFields = Object.keys(activity.changes || {});
      if (changedFields.length === 1) {
        const field = changedFields[0];
        const change = activity.changes[field];
        return `Updated ${field}: ${change.old} → ${change.new}`;
      }
      return `Updated ${changedFields.length} fields on ${entityName}`;
    case "assigned":
      return `Assigned to ${entityName}`;
    case "unassigned":
      return `Unassigned from ${entityName}`;
    case "status_changed":
      const statusChange = activity.changes?.status;
      return statusChange 
        ? `Changed status: ${statusChange.old} → ${statusChange.new}`
        : `Changed status on ${entityName}`;
    case "offer_made":
      const amount = activity.metadata?.amount;
      return amount 
        ? `Made offer: $${Number(amount).toLocaleString()}`
        : `Made offer on ${entityName}`;
    case "appointment_scheduled":
      return `Scheduled appointment for ${entityName}`;
    case "call_logged":
      return `Logged call on ${entityName}`;
    case "note_added":
      return `Added note to ${entityName}`;
    case "document_uploaded":
      return `Uploaded document to ${entityName}`;
    default:
      return `${activity.action} on ${entityName}`;
  }
}
