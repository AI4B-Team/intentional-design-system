import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

export interface BuyerProfile {
  id: string;
  user_id: string;
  organization_id: string | null;
  profile_name: string;
  buyer_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  pof_id: string | null;
  is_default: boolean;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  pof?: {
    id: string;
    file_name: string;
    amount: number;
    expiration_date: string;
    lender_name: string | null;
  } | null;
}

export function useBuyerProfiles() {
  const { user } = useAuth();
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['buyer-profiles', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_profiles')
        .select(`
          *,
          pof:proof_of_funds(id, file_name, amount, expiration_date, lender_name)
        `)
        .eq('organization_id', organization!.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BuyerProfile[];
    },
    enabled: !!user && !!organization,
  });
}

export function useBuyerProfile(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['buyer-profile', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('buyer_profiles')
        .select(`
          *,
          pof:proof_of_funds(id, file_name, amount, expiration_date, lender_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as BuyerProfile;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateBuyerProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (profile: Partial<BuyerProfile>) => {
      if (!user || !organization) throw new Error('Not authenticated');

      // If this is set as default, unset other defaults first
      if (profile.is_default) {
        await supabase
          .from('buyer_profiles')
          .update({ is_default: false })
          .eq('organization_id', organization.id);
      }

      const { data, error } = await supabase
        .from('buyer_profiles')
        .insert({
          user_id: user.id,
          organization_id: organization.id,
          profile_name: profile.profile_name,
          buyer_name: profile.buyer_name,
          company_name: profile.company_name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zip: profile.zip,
          pof_id: profile.pof_id,
          is_default: profile.is_default ?? false,
          is_active: profile.is_active ?? true,
          notes: profile.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-profiles'] });
      toast.success('Buyer profile created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create buyer profile');
    },
  });
}

export function useUpdateBuyerProfile() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BuyerProfile> & { id: string }) => {
      // If setting as default, unset other defaults first
      if (updates.is_default && organization) {
        await supabase
          .from('buyer_profiles')
          .update({ is_default: false })
          .eq('organization_id', organization.id)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('buyer_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-profiles'] });
      toast.success('Buyer profile updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update buyer profile');
    },
  });
}

export function useDeleteBuyerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('buyer_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-profiles'] });
      toast.success('Buyer profile deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete buyer profile');
    },
  });
}
