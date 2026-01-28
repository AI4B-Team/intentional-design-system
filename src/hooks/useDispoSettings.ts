import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DispoSettings {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  default_theme: string | null;
  primary_color: string | null;
  accent_color: string | null;
  default_earnest_money: number | null;
  default_closing_timeline: string | null;
  default_financing_allowed: string[] | null;
  default_visibility: string | null;
  buyer_slug: string | null;
  require_email_verification: boolean | null;
  require_proof_of_funds: boolean | null;
  auto_approve_buyers: boolean | null;
  registration_fields: string[] | null;
  email_from_name: string | null;
  email_reply_to: string | null;
  email_signature: string | null;
  email_footer_text: string | null;
  email_unsubscribe_text: string | null;
  notify_new_buyer: boolean | null;
  notify_deal_view: boolean | null;
  notify_interest: boolean | null;
  notify_offer: boolean | null;
  notification_email: string | null;
  notification_phone: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useDispoSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dispo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dispo_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as DispoSettings | null;
    },
    enabled: !!user,
  });
}

export function useCreateDispoSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (settings: Partial<DispoSettings>) => {
      if (!user) throw new Error('Not authenticated');

      // Generate a unique buyer slug based on company name or user email
      const slugBase = settings.company_name || user.email?.split('@')[0] || 'buyer';
      const slug = slugBase
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const { data, error } = await supabase
        .from('dispo_settings')
        .insert({
          user_id: user.id,
          buyer_slug: slug,
          ...settings,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DispoSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispo-settings'] });
      toast.success('Settings created');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create settings');
    },
  });
}

export function useUpdateDispoSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (settings: Partial<DispoSettings>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('dispo_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as DispoSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispo-settings'] });
      toast.success('Settings saved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save settings');
    },
  });
}

export function useEnsureDispoSettings() {
  const { user } = useAuth();
  const { data: settings, isLoading } = useDispoSettings();
  const createSettings = useCreateDispoSettings();

  const ensureSettings = async (): Promise<DispoSettings | null> => {
    if (isLoading) return null;
    
    if (!settings && user) {
      const result = await createSettings.mutateAsync({
        company_name: null,
        default_theme: 'modern',
        default_earnest_money: 5000,
        default_closing_timeline: '7-14 days',
        default_financing_allowed: ['cash', 'hard_money'],
        default_visibility: 'public',
        auto_approve_buyers: true,
        registration_fields: ['company_name', 'markets', 'property_types', 'price_range', 'proof_of_funds'],
        email_from_name: user.email?.split('@')[0] || 'Deals',
        notify_new_buyer: true,
        notify_interest: true,
        notify_offer: true,
      });
      return result;
    }
    
    return settings || null;
  };

  return { settings, isLoading, ensureSettings };
}
