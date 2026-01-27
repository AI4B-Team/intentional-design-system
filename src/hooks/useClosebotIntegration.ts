import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

// Types
export interface ClosebotConnection {
  id: string;
  user_id: string;
  api_key: string | null;
  account_id: string | null;
  account_name: string | null;
  is_active: boolean | null;
  webhook_secret: string | null;
  bot_mappings: BotMappings;
  field_mappings: Record<string, string>;
  trigger_settings: TriggerSettings;
  created_at: string | null;
  updated_at: string | null;
}

export interface BotMappings {
  seller_qualification?: string;
  buyer_qualification?: string;
  followup?: string;
}

export interface TriggerSettings {
  on_new_lead: boolean;
  on_status_change: boolean;
  manual_only: boolean;
}

export interface ClosebotConversation {
  id: string;
  user_id: string;
  property_id: string | null;
  bot_id: string | null;
  bot_name: string | null;
  started_at: string | null;
  completed_at: string | null;
  status: string | null;
  outcome: string | null;
  collected_data: Json;
  transcript: string | null;
  appointment_set: boolean | null;
  appointment_time: string | null;
  created_at: string | null;
}

export interface ClosebotBot {
  id: string;
  name: string;
  type: string;
}

// Default field mappings
export const DEFAULT_FIELD_MAPPINGS: Record<string, string> = {
  motivation_level: "motivation_score",
  property_address: "address",
  seller_timeline: "notes",
  mortgage_balance: "mortgage_balance",
  mortgage_payment: "mortgage_payment",
  appointment_time: "appointment",
};

// Hooks
export function useClosebotConnection() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["closebot-connection", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("closebot_connections")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          bot_mappings: (data.bot_mappings as unknown as BotMappings) || {},
          field_mappings: (data.field_mappings as unknown as Record<string, string>) || DEFAULT_FIELD_MAPPINGS,
          trigger_settings: (data.trigger_settings as unknown as TriggerSettings) || {
            on_new_lead: false,
            on_status_change: false,
            manual_only: true,
          },
        } as ClosebotConnection;
      }
      return null;
    },
    enabled: !!user?.id,
  });
}

export function useConnectClosebot() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ apiKey, accountId }: { apiKey: string; accountId?: string }) => {
      // Test connection first (would call Closebot API in production)
      // For now, we'll simulate a successful test
      
      // Create or update connection
      const { data: existing } = await supabase
        .from("closebot_connections")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("closebot_connections")
          .update({
            api_key: apiKey,
            account_id: accountId || null,
            account_name: "Closebot Account", // Would come from API
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("closebot_connections").insert({
          user_id: user?.id,
          api_key: apiKey,
          account_id: accountId || null,
          account_name: "Closebot Account",
          is_active: true,
          field_mappings: DEFAULT_FIELD_MAPPINGS,
        });

        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      toast.success("Connected to Closebot.ai");
      queryClient.invalidateQueries({ queryKey: ["closebot-connection"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to connect", { description: error.message });
    },
  });
}

export function useDisconnectClosebot() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("closebot_connections")
        .update({ is_active: false, api_key: null })
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Disconnected from Closebot.ai");
      queryClient.invalidateQueries({ queryKey: ["closebot-connection"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to disconnect", { description: error.message });
    },
  });
}

export function useUpdateClosebotSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<{
      bot_mappings: BotMappings;
      field_mappings: Record<string, string>;
      trigger_settings: TriggerSettings;
    }>) => {
      // Convert to JSON-compatible format
      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.bot_mappings) {
        dbUpdates.bot_mappings = updates.bot_mappings as unknown as Json;
      }
      if (updates.field_mappings) {
        dbUpdates.field_mappings = updates.field_mappings as unknown as Json;
      }
      if (updates.trigger_settings) {
        dbUpdates.trigger_settings = updates.trigger_settings as unknown as Json;
      }

      const { error } = await supabase
        .from("closebot_connections")
        .update(dbUpdates)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings updated");
      queryClient.invalidateQueries({ queryKey: ["closebot-connection"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to update settings", { description: error.message });
    },
  });
}

export function useClosebotConversations(propertyId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["closebot-conversations", user?.id, propertyId],
    queryFn: async () => {
      let query = supabase
        .from("closebot_conversations")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (propertyId) {
        query = query.eq("property_id", propertyId);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as ClosebotConversation[];
    },
    enabled: !!user?.id,
  });
}

export function useTriggerClosebotConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      botType,
      phoneNumber,
    }: {
      propertyId: string;
      botType: "seller_qualification" | "buyer_qualification" | "followup";
      phoneNumber: string;
    }) => {
      // Get connection and bot mapping
      const { data: connection } = await supabase
        .from("closebot_connections")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true)
        .single();

      if (!connection) {
        throw new Error("Closebot not connected");
      }

      const botMappings = connection.bot_mappings as BotMappings;
      const botId = botMappings[botType];

      if (!botId) {
        throw new Error(`No bot configured for ${botType}`);
      }

      // In production, this would call Closebot API to start conversation
      // For now, create a pending conversation record
      const { data: conversation, error } = await supabase
        .from("closebot_conversations")
        .insert({
          user_id: user?.id,
          property_id: propertyId,
          bot_id: botId,
          bot_name: `${botType.replace(/_/g, " ")} Bot`,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return conversation;
    },
    onSuccess: () => {
      toast.success("Closebot conversation started");
      queryClient.invalidateQueries({ queryKey: ["closebot-conversations"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to start conversation", { description: error.message });
    },
  });
}

// Mock bots (would come from Closebot API)
export const MOCK_CLOSEBOT_BOTS: ClosebotBot[] = [
  { id: "bot_seller_1", name: "Seller Qualification Pro", type: "seller" },
  { id: "bot_seller_2", name: "Motivated Seller Screener", type: "seller" },
  { id: "bot_buyer_1", name: "Cash Buyer Qualifier", type: "buyer" },
  { id: "bot_followup_1", name: "Follow-up Nurture", type: "followup" },
  { id: "bot_followup_2", name: "Appointment Setter", type: "followup" },
];
