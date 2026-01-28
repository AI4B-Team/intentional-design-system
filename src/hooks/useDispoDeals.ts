import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface DispoPhoto {
  url: string;
  caption?: string;
  is_primary?: boolean;
  order?: number;
}

export interface DispoDocument {
  name: string;
  url: string;
  type: string;
  requires_verification?: boolean;
}

export interface DispoDeal {
  id: string;
  user_id: string;
  organization_id: string | null;
  property_id: string | null;
  title: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  county: string | null;
  neighborhood: string | null;
  property_type: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lot_sqft: number | null;
  year_built: number | null;
  stories: number | null;
  garage: string | null;
  pool: boolean | null;
  asking_price: number;
  arv: number | null;
  repair_estimate: number | null;
  equity_amount: number | null;
  equity_percentage: number | null;
  price_per_sqft: number | null;
  assignment_fee: number | null;
  show_assignment_fee: boolean | null;
  contract_price: number | null;
  description: string | null;
  investment_highlights: string[] | null;
  repair_details: string | null;
  comps_summary: string | null;
  comps_data: Json;
  photos: DispoPhoto[];
  video_url: string | null;
  virtual_tour_url: string | null;
  documents: DispoDocument[];
  earnest_money_required: number | null;
  closing_timeline: string | null;
  financing_allowed: string[] | null;
  assignment_or_double: boolean | null;
  status: string | null;
  visibility: string | null;
  password_protected: boolean | null;
  access_password: string | null;
  published_at: string | null;
  expires_at: string | null;
  under_contract_at: string | null;
  sold_at: string | null;
  sold_to_buyer_id: string | null;
  final_sale_price: number | null;
  view_count: number | null;
  unique_views: number | null;
  interest_count: number | null;
  inquiry_count: number | null;
  notify_on_view: boolean | null;
  notify_on_interest: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DispoStats {
  activeDeals: number;
  totalViews: number;
  totalInterests: number;
  underContract: number;
  soldLast30Days: number;
}

export interface DealInterest {
  id: string;
  deal_id: string;
  buyer_id: string | null;
  interest_type: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  offer_amount: number | null;
  offer_notes: string | null;
  message: string | null;
  follow_up_status: string | null;
  follow_up_notes: string | null;
  last_contacted_at: string | null;
  source: string | null;
  created_at: string | null;
}

export interface DealView {
  id: string;
  deal_id: string;
  buyer_id: string | null;
  visitor_id: string | null;
  referrer: string | null;
  utm_source: string | null;
  time_on_page_seconds: number | null;
  viewed_at: string | null;
}

function parseJsonArray<T>(json: Json | null): T[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as T[];
  return [];
}

export function useDispoDeals(filters?: {
  status?: string;
  search?: string;
  sort?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dispo-deals', filters],
    queryFn: async () => {
      let query = supabase
        .from('dispo_deals')
        .select('*')
        .eq('user_id', user!.id);

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(
          `address.ilike.%${filters.search}%,title.ilike.%${filters.search}%,city.ilike.%${filters.search}%`
        );
      }

      switch (filters?.sort) {
        case 'views':
          query = query.order('view_count', { ascending: false, nullsFirst: false });
          break;
        case 'interests':
          query = query.order('interest_count', { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((d) => ({
        ...d,
        photos: parseJsonArray<DispoPhoto>(d.photos),
        documents: parseJsonArray<DispoDocument>(d.documents),
      })) as DispoDeal[];
    },
    enabled: !!user,
  });
}

export function useDispoDeal(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dispo-deal', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('dispo_deals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        photos: parseJsonArray<DispoPhoto>(data.photos),
        documents: parseJsonArray<DispoDocument>(data.documents),
      } as DispoDeal;
    },
    enabled: !!user && !!id,
  });
}

export function useDispoStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dispo-stats'],
    queryFn: async () => {
      const { data: deals, error } = await supabase
        .from('dispo_deals')
        .select('status, view_count, interest_count, sold_at')
        .eq('user_id', user!.id);

      if (error) throw error;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const stats: DispoStats = {
        activeDeals: deals?.filter((d) => d.status === 'active').length || 0,
        totalViews: deals?.reduce((sum, d) => sum + (d.view_count || 0), 0) || 0,
        totalInterests: deals?.reduce((sum, d) => sum + (d.interest_count || 0), 0) || 0,
        underContract: deals?.filter((d) => d.status === 'under_contract').length || 0,
        soldLast30Days:
          deals?.filter(
            (d) => d.status === 'sold' && d.sold_at && new Date(d.sold_at) >= thirtyDaysAgo
          ).length || 0,
      };

      return stats;
    },
    enabled: !!user,
  });
}

export function useDealInterests(dealId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['deal-interests', dealId],
    queryFn: async () => {
      if (!dealId) return [];

      const { data, error } = await supabase
        .from('deal_interests')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DealInterest[];
    },
    enabled: !!user && !!dealId,
  });
}

export function useDealViews(dealId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['deal-views', dealId],
    queryFn: async () => {
      if (!dealId) return [];

      const { data, error } = await supabase
        .from('deal_views')
        .select('*')
        .eq('deal_id', dealId)
        .order('viewed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as DealView[];
    },
    enabled: !!user && !!dealId,
  });
}

export function useCreateDispoDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (deal: Partial<DispoDeal>) => {
      if (!user) throw new Error('Not authenticated');

      const insertData: Record<string, any> = {
        user_id: user.id,
        title: deal.title!,
        address: deal.address!,
        city: deal.city!,
        state: deal.state!,
        zip: deal.zip,
        county: deal.county,
        neighborhood: deal.neighborhood,
        property_type: deal.property_type,
        beds: deal.beds,
        baths: deal.baths,
        sqft: deal.sqft,
        lot_sqft: deal.lot_sqft,
        year_built: deal.year_built,
        stories: deal.stories,
        garage: deal.garage,
        pool: deal.pool,
        asking_price: deal.asking_price!,
        arv: deal.arv,
        repair_estimate: deal.repair_estimate,
        contract_price: deal.contract_price,
        assignment_fee: deal.assignment_fee,
        show_assignment_fee: deal.show_assignment_fee,
        description: deal.description,
        investment_highlights: deal.investment_highlights,
        repair_details: deal.repair_details,
        photos: deal.photos as unknown as Json,
        video_url: deal.video_url,
        virtual_tour_url: deal.virtual_tour_url,
        documents: deal.documents as unknown as Json,
        earnest_money_required: deal.earnest_money_required,
        closing_timeline: deal.closing_timeline,
        financing_allowed: deal.financing_allowed,
        assignment_or_double: deal.assignment_or_double,
        status: deal.status || 'draft',
        visibility: deal.visibility || 'public',
        password_protected: deal.password_protected,
        access_password: deal.access_password,
        expires_at: deal.expires_at,
        notify_on_view: deal.notify_on_view,
        notify_on_interest: deal.notify_on_interest,
        property_id: deal.property_id,
      };

      const { data, error } = await supabase
        .from('dispo_deals')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispo-deals'] });
      queryClient.invalidateQueries({ queryKey: ['dispo-stats'] });
      toast.success('Deal created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create deal');
    },
  });
}

export function useUpdateDispoDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DispoDeal> }) => {
      const updateData: Record<string, any> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Handle JSON fields explicitly
      if (updates.photos) {
        updateData.photos = updates.photos as unknown as Json;
      }
      if (updates.documents) {
        updateData.documents = updates.documents as unknown as Json;
      }

      const { data, error } = await supabase
        .from('dispo_deals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dispo-deals'] });
      queryClient.invalidateQueries({ queryKey: ['dispo-deal', id] });
      queryClient.invalidateQueries({ queryKey: ['dispo-stats'] });
      toast.success('Deal updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update deal');
    },
  });
}

export function useDeleteDispoDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('dispo_deals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispo-deals'] });
      queryClient.invalidateQueries({ queryKey: ['dispo-stats'] });
      toast.success('Deal deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete deal');
    },
  });
}

export function useUpdateInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DealInterest> }) => {
      const { error } = await supabase
        .from('deal_interests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deal-interests'] });
      toast.success('Interest updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update interest');
    },
  });
}
