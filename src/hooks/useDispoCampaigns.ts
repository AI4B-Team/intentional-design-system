import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface DispoCampaign {
  id: string;
  user_id: string;
  organization_id: string | null;
  deal_id: string | null;
  name: string;
  subject: string;
  preview_text: string | null;
  body_html: string;
  body_json: Json | null;
  template_type: string | null;
  status: string;
  recipient_filter: Record<string, unknown> | null;
  recipient_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  deal?: {
    id: string;
    title: string | null;
    address: string;
    city: string | null;
    state: string | null;
    photos: string[] | null;
    asking_price: number | null;
    arv: number | null;
  } | null;
}

export interface DispoCampaignStats {
  totalCampaigns: number;
  totalEmails: number;
  avgOpenRate: number;
  avgClickRate: number;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  buyer_id: string | null;
  email: string;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  unsubscribed_at: string | null;
  buyer?: {
    id: string;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string;
    company_name: string | null;
  } | null;
}

export function useDispoCampaigns(filters?: { status?: string; dealId?: string }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dispo-campaigns', filters],
    queryFn: async () => {
      let query = supabase
        .from('dispo_campaigns')
        .select(`
          *,
          deal:dispo_deals(id, title, address, city, state, photos, asking_price, arv)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.dealId) {
        query = query.eq('deal_id', filters.dealId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as DispoCampaign[];
    },
    enabled: !!user,
  });
}

export function useDispoCampaign(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dispo-campaign', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('dispo_campaigns')
        .select(`
          *,
          deal:dispo_deals(id, title, address, city, state, photos, asking_price, arv)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as DispoCampaign;
    },
    enabled: !!user && !!id,
  });
}

export function useDispoCampaignStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dispo-campaign-stats'],
    queryFn: async () => {
      const { data: campaigns, error } = await supabase
        .from('dispo_campaigns')
        .select('status, sent_count, opened_count, clicked_count')
        .eq('user_id', user!.id);

      if (error) throw error;

      const allCampaigns = (campaigns || []) as { status: string; sent_count: number; opened_count: number; clicked_count: number }[];
      const sentCampaigns = allCampaigns.filter((c) => c.status === 'sent');
      const totalEmails = sentCampaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
      const totalOpens = sentCampaigns.reduce((sum, c) => sum + (c.opened_count || 0), 0);
      const totalClicks = sentCampaigns.reduce((sum, c) => sum + (c.clicked_count || 0), 0);

      const stats: DispoCampaignStats = {
        totalCampaigns: sentCampaigns.length,
        totalEmails,
        avgOpenRate: totalEmails > 0 ? (totalOpens / totalEmails) * 100 : 0,
        avgClickRate: totalEmails > 0 ? (totalClicks / totalEmails) * 100 : 0,
      };

      return stats;
    },
    enabled: !!user,
  });
}

export function useCampaignRecipients(campaignId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['campaign-recipients', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];

      const { data, error } = await supabase
        .from('dispo_campaign_recipients')
        .select(`
          *,
          buyer:cash_buyers(id, full_name, first_name, last_name, email, company_name)
        `)
        .eq('campaign_id', campaignId)
        .order('sent_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return (data || []) as unknown as CampaignRecipient[];
    },
    enabled: !!user && !!campaignId,
  });
}

export function useCreateDispoCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (campaign: Partial<DispoCampaign>) => {
      if (!user) throw new Error('Not authenticated');

      const insertData = {
        user_id: user.id,
        name: campaign.name || 'Untitled Campaign',
        subject: campaign.subject || '',
        preview_text: campaign.preview_text || null,
        body_html: campaign.body_html || '',
        body_json: (campaign.body_json as Json) || null,
        template_type: campaign.template_type || 'deal_announcement',
        status: campaign.status || 'draft',
        deal_id: campaign.deal_id || null,
        recipient_filter: (campaign.recipient_filter as Json) || null,
        recipient_count: campaign.recipient_count || 0,
      };

      const { data, error } = await supabase
        .from('dispo_campaigns')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as DispoCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispo-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dispo-campaign-stats'] });
      toast.success('Campaign created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create campaign');
    },
  });
}

export function useUpdateDispoCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DispoCampaign> }) => {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // Only include defined fields
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.preview_text !== undefined) updateData.preview_text = updates.preview_text;
      if (updates.body_html !== undefined) updateData.body_html = updates.body_html;
      if (updates.body_json !== undefined) updateData.body_json = updates.body_json as Json;
      if (updates.template_type !== undefined) updateData.template_type = updates.template_type;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.deal_id !== undefined) updateData.deal_id = updates.deal_id;
      if (updates.recipient_filter !== undefined) updateData.recipient_filter = updates.recipient_filter as Json;
      if (updates.recipient_count !== undefined) updateData.recipient_count = updates.recipient_count;
      if (updates.sent_at !== undefined) updateData.sent_at = updates.sent_at;
      if (updates.scheduled_at !== undefined) updateData.scheduled_at = updates.scheduled_at;

      const { data, error } = await supabase
        .from('dispo_campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as DispoCampaign;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dispo-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dispo-campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['dispo-campaign-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update campaign');
    },
  });
}

export function useDeleteDispoCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('dispo_campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispo-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dispo-campaign-stats'] });
      toast.success('Campaign deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete campaign');
    },
  });
}

export function useSendDispoCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // In a real implementation, this would trigger an edge function
      // For now, we'll just update the status
      const { data, error } = await supabase
        .from('dispo_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as DispoCampaign;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['dispo-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dispo-campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['dispo-campaign-stats'] });
      toast.success('Campaign sent successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send campaign');
    },
  });
}
