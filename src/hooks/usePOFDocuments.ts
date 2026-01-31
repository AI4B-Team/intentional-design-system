import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface POFDocument {
  id: string;
  user_id: string;
  organization_id: string | null;
  file_name: string;
  file_url: string;
  file_size: number | null;
  expiration_date: string;
  amount: number;
  lender_name: string | null;
  lender_contact: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function usePOFDocuments() {
  const { user } = useAuth();
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['pof-documents', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proof_of_funds')
        .select('*')
        .eq('organization_id', organization!.id)
        .eq('is_active', true)
        .order('expiration_date', { ascending: true });

      if (error) throw error;
      return data as POFDocument[];
    },
    enabled: !!user && !!organization,
  });
}

export function useActivePOFDocuments() {
  const { user } = useAuth();
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['pof-documents-active', organization?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('proof_of_funds')
        .select('*')
        .eq('organization_id', organization!.id)
        .eq('is_active', true)
        .gte('expiration_date', today)
        .order('amount', { ascending: false });

      if (error) throw error;
      return data as POFDocument[];
    },
    enabled: !!user && !!organization,
  });
}
