import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CashBuyer {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  company_name: string | null;
  email: string;
  phone: string | null;
  markets: string[] | null;
  zip_codes: string[] | null;
  property_types: string[] | null;
  min_price: number | null;
  max_price: number | null;
  min_arv: number | null;
  max_arv: number | null;
  min_equity_pct: number | null;
  buying_strategy: string[] | null;
  condition_preference: string[] | null;
  can_close_days: number | null;
  funding_type: string | null;
  is_verified: boolean | null;
  proof_of_funds_url: string | null;
  proof_of_funds_verified: boolean | null;
  proof_of_funds_amount: number | null;
  verified_at: string | null;
  verified_by: string | null;
  deals_viewed: number | null;
  deals_interested: number | null;
  deals_purchased: number | null;
  total_purchase_volume: number | null;
  last_active_at: string | null;
  email_opt_in: boolean | null;
  sms_opt_in: boolean | null;
  buyer_rating: number | null;
  rating_notes: string | null;
  tags: string[] | null;
  status: string | null;
  source: string | null;
  source_detail: string | null;
  referred_by: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CashBuyerStats {
  total: number;
  active: number;
  verified: number;
  vip: number;
  avgRating: number;
}

export function useCashBuyers(filters?: {
  status?: string;
  verified?: string;
  tags?: string[];
  markets?: string[];
  rating?: string;
  search?: string;
  sort?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cash-buyers', filters],
    queryFn: async () => {
      let query = supabase
        .from('cash_buyers')
        .select('*')
        .eq('user_id', user!.id);

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.verified === 'verified') {
        query = query.eq('is_verified', true);
      } else if (filters?.verified === 'unverified') {
        query = query.eq('is_verified', false);
      }

      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
        );
      }

      if (filters?.rating) {
        const minRating = parseInt(filters.rating);
        query = query.gte('buyer_rating', minRating);
      }

      switch (filters?.sort) {
        case 'name':
          query = query.order('full_name', { ascending: true, nullsFirst: false });
          break;
        case 'last_active':
          query = query.order('last_active_at', { ascending: false, nullsFirst: false });
          break;
        case 'deals':
          query = query.order('deals_purchased', { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Client-side filtering for array fields
      let result = data || [];

      if (filters?.tags?.length) {
        result = result.filter((b) =>
          filters.tags!.some((tag) => b.tags?.includes(tag))
        );
      }

      if (filters?.markets?.length) {
        result = result.filter((b) =>
          filters.markets!.some((market) => b.markets?.includes(market))
        );
      }

      return result as CashBuyer[];
    },
    enabled: !!user,
  });
}

export function useCashBuyer(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cash-buyer', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('cash_buyers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as CashBuyer;
    },
    enabled: !!user && !!id,
  });
}

export function useCashBuyerStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cash-buyer-stats'],
    queryFn: async () => {
      const { data: buyers, error } = await supabase
        .from('cash_buyers')
        .select('status, is_verified, tags, buyer_rating')
        .eq('user_id', user!.id);

      if (error) throw error;

      const stats: CashBuyerStats = {
        total: buyers?.length || 0,
        active: buyers?.filter((b) => b.status === 'active').length || 0,
        verified: buyers?.filter((b) => b.is_verified).length || 0,
        vip: buyers?.filter((b) => b.tags?.includes('vip')).length || 0,
        avgRating:
          buyers?.filter((b) => b.buyer_rating).reduce((sum, b) => sum + (b.buyer_rating || 0), 0) /
            (buyers?.filter((b) => b.buyer_rating).length || 1) || 0,
      };

      return stats;
    },
    enabled: !!user,
  });
}

export function useCreateCashBuyer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (buyer: Partial<CashBuyer>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('cash_buyers')
        .insert({
          user_id: user.id,
          email: buyer.email!,
          first_name: buyer.first_name,
          last_name: buyer.last_name,
          full_name: buyer.full_name || `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim() || null,
          company_name: buyer.company_name,
          phone: buyer.phone,
          markets: buyer.markets,
          zip_codes: buyer.zip_codes,
          property_types: buyer.property_types,
          min_price: buyer.min_price,
          max_price: buyer.max_price,
          buying_strategy: buyer.buying_strategy,
          condition_preference: buyer.condition_preference,
          can_close_days: buyer.can_close_days,
          funding_type: buyer.funding_type,
          is_verified: buyer.is_verified,
          proof_of_funds_url: buyer.proof_of_funds_url,
          proof_of_funds_amount: buyer.proof_of_funds_amount,
          email_opt_in: buyer.email_opt_in ?? true,
          sms_opt_in: buyer.sms_opt_in,
          tags: buyer.tags,
          status: buyer.status || 'active',
          source: buyer.source || 'manual',
          notes: buyer.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-buyers'] });
      queryClient.invalidateQueries({ queryKey: ['cash-buyer-stats'] });
      toast.success('Buyer added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add buyer');
    },
  });
}

export function useUpdateCashBuyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CashBuyer> }) => {
      const { data, error } = await supabase
        .from('cash_buyers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cash-buyers'] });
      queryClient.invalidateQueries({ queryKey: ['cash-buyer', id] });
      queryClient.invalidateQueries({ queryKey: ['cash-buyer-stats'] });
      toast.success('Buyer updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update buyer');
    },
  });
}

export function useDeleteCashBuyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cash_buyers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-buyers'] });
      queryClient.invalidateQueries({ queryKey: ['cash-buyer-stats'] });
      toast.success('Buyer deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete buyer');
    },
  });
}

export function useDeleteCashBuyers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('cash_buyers').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-buyers'] });
      queryClient.invalidateQueries({ queryKey: ['cash-buyer-stats'] });
      toast.success('Buyers deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete buyers');
    },
  });
}
