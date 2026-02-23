import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────
export type ActionType = "call" | "sms" | "email" | "voicemail" | "follow_up" | "appointment" | "deadline" | "doc" | "payment" | "task" | "inspection";
export type EntityType = "lead" | "deal" | "transaction" | "contact" | "property";
export type ActionStatus = "pending" | "completed" | "overdue" | "cancelled" | "snoozed" | "scheduled" | "blocked";
export type ActionPriority = "low" | "medium" | "high" | "critical";
export type ActionSource = "ai" | "user" | "automation" | "system" | "pipeline" | "transactions" | "calendar" | "communications";
export type OwnerMode = "human" | "ai_agent" | "hybrid";
export type ActionChannel = "call" | "sms" | "email" | "voicemail" | null;

export interface UnifiedAction {
  id: string;
  organization_id: string | null;
  user_id: string;
  type: ActionType;
  entity_type: EntityType;
  entity_id: string | null;
  title: string;
  description: string | null;
  status: ActionStatus;
  priority: ActionPriority;
  due_at: string | null;
  completed_at: string | null;
  snoozed_until: string | null;
  source: ActionSource;
  source_ref: string | null;
  property_id: string | null;
  property_address: string | null;
  contact_name: string | null;
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
  owner_mode: OwnerMode;
  channel: ActionChannel;
  contact_id: string | null;
  deal_id: string | null;
}

export interface CreateActionInput {
  type: ActionType;
  entity_type: EntityType;
  entity_id?: string;
  title: string;
  description?: string;
  status?: ActionStatus;
  priority?: ActionPriority;
  due_at?: string;
  source?: ActionSource;
  source_ref?: string;
  property_id?: string;
  property_address?: string;
  contact_name?: string;
  meta?: Record<string, any>;
  owner_mode?: OwnerMode;
  channel?: ActionChannel;
  contact_id?: string;
  deal_id?: string;
}

export interface UpdateActionInput {
  id: string;
  status?: ActionStatus;
  priority?: ActionPriority;
  title?: string;
  description?: string;
  due_at?: string | null;
  completed_at?: string | null;
  snoozed_until?: string | null;
  meta?: Record<string, any>;
  owner_mode?: OwnerMode;
  channel?: ActionChannel;
}

// ─── Query keys ─────────────────────────────────────────────
export const UNIFIED_ACTIONS_KEY = "unified-actions";

// ─── Filters ────────────────────────────────────────────────
export interface ActionFilters {
  status?: ActionStatus | ActionStatus[];
  type?: ActionType | ActionType[];
  entity_type?: EntityType | EntityType[];
  priority?: ActionPriority | ActionPriority[];
  property_id?: string;
  due_before?: string;
  due_after?: string;
  limit?: number;
  owner_mode?: OwnerMode | OwnerMode[];
  channel?: ActionChannel;
  source?: ActionSource | ActionSource[];
  deal_id?: string;
  contact_id?: string;
}

function buildQuery(filters: ActionFilters) {
  let query = supabase
    .from("unified_actions")
    .select("*")
    .order("due_at", { ascending: true, nullsFirst: false }) as any;

  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    query = query.in("status", statuses);
  }
  if (filters.type) {
    const types = Array.isArray(filters.type) ? filters.type : [filters.type];
    query = query.in("type", types);
  }
  if (filters.entity_type) {
    const entities = Array.isArray(filters.entity_type) ? filters.entity_type : [filters.entity_type];
    query = query.in("entity_type", entities);
  }
  if (filters.priority) {
    const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
    query = query.in("priority", priorities);
  }
  if (filters.property_id) {
    query = query.eq("property_id", filters.property_id);
  }
  if (filters.due_before) {
    query = query.lte("due_at", filters.due_before);
  }
  if (filters.due_after) {
    query = query.gte("due_at", filters.due_after);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.owner_mode) {
    const modes = Array.isArray(filters.owner_mode) ? filters.owner_mode : [filters.owner_mode];
    query = query.in("owner_mode", modes);
  }
  if (filters.channel) {
    query = query.eq("channel", filters.channel);
  }
  if (filters.source) {
    const sources = Array.isArray(filters.source) ? filters.source : [filters.source];
    query = query.in("source", sources);
  }
  if (filters.deal_id) {
    query = query.eq("deal_id", filters.deal_id);
  }
  if (filters.contact_id) {
    query = query.eq("contact_id", filters.contact_id);
  }

  return query;
}

// ─── Main hook ──────────────────────────────────────────────
export function useUnifiedActions(filters: ActionFilters = {}) {
  const queryClient = useQueryClient();

  // Realtime subscription for instant cross-surface sync
  useEffect(() => {
    const channel = supabase
      .channel("unified-actions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "unified_actions" },
        () => {
          queryClient.invalidateQueries({ queryKey: [UNIFIED_ACTIONS_KEY] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: [UNIFIED_ACTIONS_KEY, filters],
    queryFn: async (): Promise<UnifiedAction[]> => {
      const { data, error } = await buildQuery(filters);
      if (error) throw error;
      return (data || []) as UnifiedAction[];
    },
    refetchInterval: 30000,
  });

  return query;
}

// ─── Mutation hooks ─────────────────────────────────────────

export function useCreateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateActionInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get org id
      const { data: orgData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .single();

      const { data, error } = await supabase
        .from("unified_actions")
        .insert({
          ...input,
          user_id: user.id,
          organization_id: orgData?.organization_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UNIFIED_ACTIONS_KEY] });
    },
  });
}

export function useUpdateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateActionInput) => {
      const { data, error } = await supabase
        .from("unified_actions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UNIFIED_ACTIONS_KEY] });
    },
  });
}

export function useCompleteAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actionId: string) => {
      const { data, error } = await supabase
        .from("unified_actions")
        .update({
          status: "completed" as ActionStatus,
          completed_at: new Date().toISOString(),
        })
        .eq("id", actionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UNIFIED_ACTIONS_KEY] });
    },
  });
}

export function useDeleteAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from("unified_actions")
        .delete()
        .eq("id", actionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UNIFIED_ACTIONS_KEY] });
    },
  });
}

// ─── Convenience hooks (surface-specific lenses) ────────────

/** Dashboard: urgent + high-impact actions */
export function useDashboardActions() {
  return useUnifiedActions({
    status: ["pending", "overdue"],
    priority: ["high", "critical"],
    limit: 10,
  });
}

/** Calendar: all actions with due dates in a range */
export function useCalendarActions(startDate: string, endDate: string) {
  return useUnifiedActions({
    status: ["pending", "overdue", "completed"],
    due_after: startDate,
    due_before: endDate,
  });
}

/** Pipeline: actions grouped by entity (deal/lead/property) */
export function usePipelineActions(entityId?: string) {
  return useUnifiedActions({
    status: ["pending", "overdue"],
    ...(entityId ? { property_id: entityId } : {}),
  });
}

/** Today's actions for focus view */
export function useTodayActions() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  return useUnifiedActions({
    status: ["pending", "overdue"],
    due_after: todayStart.toISOString(),
    due_before: todayEnd.toISOString(),
  });
}

/** Communications: actions needing comms attention */
export function useCommsActions() {
  return useUnifiedActions({
    status: ["pending", "overdue"],
    type: ["call", "sms", "email", "voicemail", "follow_up"],
  });
}

/** Actions by deal */
export function useDealActions(dealId: string) {
  return useUnifiedActions({
    deal_id: dealId,
    status: ["pending", "overdue", "scheduled"],
  });
}

/** AI-executed actions (for AI Command Center) */
export function useAIActions(limit = 20) {
  return useUnifiedActions({
    source: ["ai", "automation"],
    limit,
  });
}
