import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  campaign_type: string;
  status: string;
  target_criteria: Record<string, unknown> | null;
  offer_formula_type: string;
  offer_percentage: number;
  offer_fixed_discount: number | null;
  earnest_money: number;
  include_earnest_money: boolean;
  closing_timeline: string;
  email_subject: string | null;
  email_body: string | null;
  properties_count: number;
  sent_count: number;
  opened_count: number;
  responded_count: number;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  followup_enabled: boolean | null;
  followup_sequences: Array<{ days_after: number; subject: string; body: string }> | null;
  batch_size_per_day: number | null;
  scheduled_start: string | null;
}

export interface CampaignProperty {
  id: string;
  campaign_id: string;
  user_id: string;
  property_id: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  list_price: number | null;
  days_on_market: number | null;
  agent_name: string | null;
  agent_email: string | null;
  agent_phone: string | null;
  brokerage: string | null;
  offer_amount: number | null;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  responded_at: string | null;
  response_type: string | null;
  response_notes: string | null;
  response_status: string | null;
  response_content: string | null;
  followup_count: number | null;
  last_followup_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignInsert {
  name: string;
  description?: string;
  campaign_type?: string;
  offer_formula_type?: string;
  offer_percentage?: number;
  offer_fixed_discount?: number;
  earnest_money?: number;
  include_earnest_money?: boolean;
  closing_timeline?: string;
  email_subject?: string;
  email_body?: string;
}

export interface CampaignPropertyInsert {
  campaign_id: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  list_price?: number;
  days_on_market?: number;
  agent_name?: string;
  agent_email?: string;
  agent_phone?: string;
  brokerage?: string;
  offer_amount?: number;
}

export function useCampaigns() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user?.id,
  });
}

export function useCampaign(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id!)
        .eq("user_id", user!.id)
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    enabled: !!id && !!user?.id,
  });
}

export function useCampaignProperties(campaignId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["campaign-properties", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_properties")
        .select("*")
        .eq("campaign_id", campaignId!)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CampaignProperty[];
    },
    enabled: !!campaignId && !!user?.id,
  });
}

export function useCampaignStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["campaign-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("status, properties_count, sent_count, opened_count, responded_count")
        .eq("user_id", user!.id);

      if (error) throw error;

      const activeCampaigns = data.filter((c) => c.status === "active").length;
      const totalProperties = data.reduce((sum, c) => sum + (c.properties_count || 0), 0);
      const totalResponses = data.reduce((sum, c) => sum + (c.responded_count || 0), 0);
      const totalSent = data.reduce((sum, c) => sum + (c.sent_count || 0), 0);
      const avgResponseRate = totalSent > 0 ? (totalResponses / totalSent) * 100 : 0;

      return {
        activeCampaigns,
        totalProperties,
        totalResponses,
        avgResponseRate,
      };
    },
    enabled: !!user?.id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CampaignInsert) => {
      const { data: result, error } = await supabase
        .from("campaigns")
        .insert({ ...data, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return result as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campaign created");
    },
    onError: (error) => {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<Campaign, 'target_criteria'>> }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", data.id] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campaign updated");
    },
    onError: (error) => {
      console.error("Error updating campaign:", error);
      toast.error("Failed to update campaign");
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campaign deleted");
    },
    onError: (error) => {
      console.error("Error deleting campaign:", error);
      toast.error("Failed to delete campaign");
    },
  });
}

export function useAddCampaignProperties() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      campaignId,
      properties,
      offerPercentage,
    }: {
      campaignId: string;
      properties: Omit<CampaignPropertyInsert, "campaign_id">[];
      offerPercentage?: number;
    }) => {
      const propertiesWithOffers = properties.map((p) => ({
        ...p,
        campaign_id: campaignId,
        user_id: user!.id,
        offer_amount:
          p.offer_amount ||
          (p.list_price && offerPercentage ? Math.round(p.list_price * (offerPercentage / 100)) : null),
      }));

      const { data, error } = await supabase
        .from("campaign_properties")
        .insert(propertiesWithOffers)
        .select();

      if (error) throw error;

      // Update campaign properties count
      await supabase
        .from("campaigns")
        .update({ properties_count: propertiesWithOffers.length })
        .eq("id", campaignId);

      return data as CampaignProperty[];
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-properties", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Properties added to campaign");
    },
    onError: (error) => {
      console.error("Error adding properties:", error);
      toast.error("Failed to add properties");
    },
  });
}

export function useUpdateCampaignProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CampaignProperty> }) => {
      const { data, error } = await supabase
        .from("campaign_properties")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as CampaignProperty;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-properties", data.campaign_id] });
    },
    onError: (error) => {
      console.error("Error updating property:", error);
      toast.error("Failed to update property");
    },
  });
}

export const defaultEmailTemplate = {
  subject: "Cash Offer for {property_address}",
  body: `Hi {agent_name},

I hope this message finds you well. I noticed your listing at {property_address} has been on the market for {days_on_market} days and wanted to reach out with a cash offer.

I'm prepared to offer {offer_amount} with a quick close in {closing_timeline}. This is a cash offer with no financing contingencies, and I can close on your timeline.

Property: {property_address}
Listed at: {list_price}
My Offer: {offer_amount}

I work with investors and can move quickly. If your seller is motivated, I'd love to discuss this further.

Best regards,
{your_name}
{your_company}
{your_phone}
{your_email}`,
};
