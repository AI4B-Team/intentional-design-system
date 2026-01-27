import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface MailTemplate {
  id: string;
  user_id: string;
  name: string;
  type: string;
  description: string | null;
  front_html: string | null;
  back_html: string | null;
  thumbnail_url: string | null;
  merge_fields: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface MailCampaign {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  template_id: string | null;
  list_type: string | null;
  list_filters: Record<string, any>;
  uploaded_list_id: string | null;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_returned: number;
  total_responses: number;
  total_cost: number;
  cost_per_piece: number | null;
  scheduled_date: string | null;
  send_time: string | null;
  is_drip: boolean;
  drip_settings: Record<string, any>;
  tracking_phone: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
  mail_templates?: MailTemplate;
}

export interface MailList {
  id: string;
  user_id: string;
  name: string;
  file_name: string | null;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  duplicate_records: number;
  status: string;
  column_mapping: Record<string, any>;
  created_at: string;
}

export interface MailPiece {
  id: string;
  campaign_id: string;
  property_id: string | null;
  list_record_id: string | null;
  recipient_name: string | null;
  recipient_address: string | null;
  recipient_city: string | null;
  recipient_state: string | null;
  recipient_zip: string | null;
  lob_id: string | null;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  returned_at: string | null;
  return_reason: string | null;
  cost: number | null;
  response_received: boolean;
  response_date: string | null;
  created_at: string;
}

export interface LobConnection {
  id: string;
  user_id: string;
  api_key_encrypted: string | null;
  is_active: boolean;
  account_name: string | null;
  return_name: string | null;
  return_address_line1: string | null;
  return_address_line2: string | null;
  return_city: string | null;
  return_state: string | null;
  return_zip: string | null;
  default_mail_class: string;
  default_postcard_size: string;
  created_at: string;
  updated_at: string;
}

// Mail Templates
export function useMailTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["mail-templates", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mail_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MailTemplate[];
    },
    enabled: !!user,
  });
}

export function useMailTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ["mail-template", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("mail_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as MailTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateMailTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: { name: string } & Omit<Partial<MailTemplate>, "user_id" | "id">) => {
      const { data, error } = await supabase
        .from("mail_templates")
        .insert([{ ...template, user_id: user!.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail-templates"] });
      toast.success("Template created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create template");
      console.error(error);
    },
  });
}

export function useUpdateMailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MailTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("mail_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mail-templates"] });
      queryClient.invalidateQueries({ queryKey: ["mail-template", data.id] });
      toast.success("Template updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update template");
      console.error(error);
    },
  });
}

export function useDeleteMailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mail_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail-templates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete template");
      console.error(error);
    },
  });
}

// Mail Campaigns
export function useMailCampaigns() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["mail-campaigns", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mail_campaigns")
        .select("*, mail_templates(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MailCampaign[];
    },
    enabled: !!user,
  });
}

export function useMailCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ["mail-campaign", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("mail_campaigns")
        .select("*, mail_templates(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as MailCampaign;
    },
    enabled: !!id,
  });
}

export function useCreateMailCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (campaign: { name: string } & Omit<Partial<MailCampaign>, "user_id" | "id">) => {
      const { data, error } = await supabase
        .from("mail_campaigns")
        .insert([{ ...campaign, user_id: user!.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail-campaigns"] });
      toast.success("Campaign created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create campaign");
      console.error(error);
    },
  });
}

export function useUpdateMailCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MailCampaign> & { id: string }) => {
      const { data, error } = await supabase
        .from("mail_campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mail-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["mail-campaign", data.id] });
      toast.success("Campaign updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update campaign");
      console.error(error);
    },
  });
}

export function useDeleteMailCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mail_campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail-campaigns"] });
      toast.success("Campaign deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete campaign");
      console.error(error);
    },
  });
}

// Mail Pieces
export function useMailPieces(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["mail-pieces", campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await supabase
        .from("mail_pieces")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MailPiece[];
    },
    enabled: !!campaignId,
  });
}

// Lob Connection
export function useLobConnection() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lob-connection", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lob_connections")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as LobConnection | null;
    },
    enabled: !!user,
  });
}

export function useUpdateLobConnection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (connection: Partial<LobConnection>) => {
      const { data: existing } = await supabase
        .from("lob_connections")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("lob_connections")
          .update(connection)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("lob_connections")
          .insert({ ...connection, user_id: user!.id })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lob-connection"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

// Mail Lists
export function useMailLists() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["mail-lists", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mail_lists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MailList[];
    },
    enabled: !!user,
  });
}

// Suppression List
export function useSuppressionList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["suppression-list", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mail_suppression_list")
        .select("*")
        .order("added_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddToSuppressionList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entry: { address: string; reason: string; source: string }) => {
      const { data, error } = await supabase
        .from("mail_suppression_list")
        .insert({ ...entry, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppression-list"] });
      toast.success("Address added to suppression list");
    },
    onError: (error) => {
      toast.error("Failed to add address");
      console.error(error);
    },
  });
}

export function useRemoveFromSuppressionList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mail_suppression_list").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppression-list"] });
      toast.success("Address removed from suppression list");
    },
    onError: (error) => {
      toast.error("Failed to remove address");
      console.error(error);
    },
  });
}

// Lob API calls
export async function testLobConnection(apiKey: string) {
  const { data, error } = await supabase.functions.invoke("lob-api", {
    body: { action: "test_connection", apiKey },
  });

  if (error) throw error;
  return data;
}

export async function verifyAddress(address: {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}) {
  const { data, error } = await supabase.functions.invoke("lob-api", {
    body: { action: "verify_address", address },
  });

  if (error) throw error;
  return data;
}

export async function sendPostcard(params: {
  to: { name: string; address_line1: string; address_city: string; address_state: string; address_zip: string };
  from: { name: string; address_line1: string; address_city: string; address_state: string; address_zip: string };
  front_html: string;
  back_html: string;
  size?: "4x6" | "6x9" | "6x11";
  mail_type?: "usps_first_class" | "usps_standard";
  merge_variables?: Record<string, string>;
}) {
  const { data, error } = await supabase.functions.invoke("lob-api", {
    body: { action: "send_postcard", ...params },
  });

  if (error) throw error;
  return data;
}

export async function sendLetter(params: {
  to: { name: string; address_line1: string; address_city: string; address_state: string; address_zip: string };
  from: { name: string; address_line1: string; address_city: string; address_state: string; address_zip: string };
  file: string;
  color?: boolean;
  mail_type?: "usps_first_class" | "usps_standard";
  merge_variables?: Record<string, string>;
}) {
  const { data, error } = await supabase.functions.invoke("lob-api", {
    body: { action: "send_letter", ...params },
  });

  if (error) throw error;
  return data;
}

export async function getMailPieceStatus(id: string, type: "postcard" | "letter") {
  const { data, error } = await supabase.functions.invoke("lob-api", {
    body: { action: "get_status", id, type },
  });

  if (error) throw error;
  return data;
}
