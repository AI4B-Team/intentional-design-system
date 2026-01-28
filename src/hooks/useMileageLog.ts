import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationContext } from '@/hooks/useOrganizationId';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type MileageEntry = Database['public']['Tables']['d4d_mileage_log']['Row'];
type MileageInsert = Database['public']['Tables']['d4d_mileage_log']['Insert'];
type MileageUpdate = Database['public']['Tables']['d4d_mileage_log']['Update'];

// IRS mileage rates by year
export const IRS_MILEAGE_RATES: Record<number, { business: number; charity: number; medical: number }> = {
  2024: { business: 0.67, charity: 0.14, medical: 0.21 },
  2025: { business: 0.70, charity: 0.14, medical: 0.21 }, // Estimated
};

export type MileagePurpose = 'business' | 'charity' | 'medical';

export interface MileageStats {
  totalMiles: number;
  businessMiles: number;
  totalDeduction: number;
  sessionCount: number;
}

export interface MonthlyMileage {
  month: string; // YYYY-MM
  entries: MileageEntry[];
  totalMiles: number;
  totalDeduction: number;
}

export function useMileageLog(year?: number) {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();
  const selectedYear = year || new Date().getFullYear();

  // Fetch mileage entries for a year
  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ['mileage-log', organizationId, selectedYear],
    queryFn: async () => {
      if (!organizationId) return [];

      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      const { data, error } = await supabase
        .from('d4d_mileage_log')
        .select('*, driving_sessions(name)')
        .eq('organization_id', organizationId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as (MileageEntry & { driving_sessions: { name: string } | null })[];
    },
    enabled: !!organizationId,
  });

  // Calculate stats
  const stats: MileageStats = entries.reduce(
    (acc, entry) => ({
      totalMiles: acc.totalMiles + (entry.final_miles || entry.calculated_miles || 0),
      businessMiles: acc.businessMiles + (entry.purpose === 'business' || !entry.purpose ? (entry.final_miles || entry.calculated_miles || 0) : 0),
      totalDeduction: acc.totalDeduction + (entry.deduction_amount || 0),
      sessionCount: acc.sessionCount + (entry.session_id ? 1 : 0),
    }),
    { totalMiles: 0, businessMiles: 0, totalDeduction: 0, sessionCount: 0 }
  );

  // Group by month
  const monthlyData: MonthlyMileage[] = entries.reduce((acc, entry) => {
    const month = entry.date.substring(0, 7); // YYYY-MM
    const existing = acc.find((m) => m.month === month);
    
    if (existing) {
      existing.entries.push(entry);
      existing.totalMiles += entry.final_miles || entry.calculated_miles || 0;
      existing.totalDeduction += entry.deduction_amount || 0;
    } else {
      acc.push({
        month,
        entries: [entry],
        totalMiles: entry.final_miles || entry.calculated_miles || 0,
        totalDeduction: entry.deduction_amount || 0,
      });
    }
    return acc;
  }, [] as MonthlyMileage[]);

  // Add mileage entry
  const addEntry = useMutation({
    mutationFn: async (entry: Omit<MileageInsert, 'user_id' | 'organization_id'>) => {
      if (!user || !organizationId) throw new Error('Not authenticated');

      const rate = IRS_MILEAGE_RATES[selectedYear] || IRS_MILEAGE_RATES[2024];
      const miles = entry.final_miles || entry.calculated_miles || 0;
      const purpose = (entry.purpose as MileagePurpose) || 'business';
      const mileageRate = rate[purpose];
      const deduction = miles * mileageRate;

      const { data, error } = await supabase
        .from('d4d_mileage_log')
        .insert({
          ...entry,
          user_id: user.id,
          organization_id: organizationId,
          mileage_rate: mileageRate,
          deduction_amount: deduction,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mileage-log'] });
      toast.success('Mileage entry added');
    },
    onError: () => {
      toast.error('Failed to add mileage entry');
    },
  });

  // Update mileage entry
  const updateEntry = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: MileageUpdate }) => {
      const rate = IRS_MILEAGE_RATES[selectedYear] || IRS_MILEAGE_RATES[2024];
      const miles = updates.final_miles || updates.calculated_miles;
      const purpose = (updates.purpose as MileagePurpose) || 'business';
      
      let updateData = { ...updates };
      if (miles !== undefined) {
        const mileageRate = rate[purpose];
        updateData.mileage_rate = mileageRate;
        updateData.deduction_amount = miles * mileageRate;
      }

      const { data, error } = await supabase
        .from('d4d_mileage_log')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mileage-log'] });
      toast.success('Mileage entry updated');
    },
    onError: () => {
      toast.error('Failed to update mileage entry');
    },
  });

  // Delete mileage entry
  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('d4d_mileage_log')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mileage-log'] });
      toast.success('Mileage entry deleted');
    },
    onError: () => {
      toast.error('Failed to delete mileage entry');
    },
  });

  // Add entry from D4D session
  const addFromSession = useMutation({
    mutationFn: async (session: {
      id: string;
      name: string | null;
      total_miles: number | null;
      started_at: string | null;
    }) => {
      if (!user || !organizationId) throw new Error('Not authenticated');

      const rate = IRS_MILEAGE_RATES[selectedYear] || IRS_MILEAGE_RATES[2024];
      const miles = session.total_miles || 0;
      const deduction = miles * rate.business;

      const { data, error } = await supabase
        .from('d4d_mileage_log')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          session_id: session.id,
          date: session.started_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          description: session.name || 'D4D Session',
          calculated_miles: miles,
          final_miles: miles,
          purpose: 'business',
          mileage_rate: rate.business,
          deduction_amount: deduction,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mileage-log'] });
    },
  });

  // Check if session already has mileage entry
  const checkSessionHasEntry = async (sessionId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('d4d_mileage_log')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();
    return !!data;
  };

  return {
    entries,
    isLoading,
    refetch,
    stats,
    monthlyData,
    addEntry,
    updateEntry,
    deleteEntry,
    addFromSession,
    checkSessionHasEntry,
    currentRates: IRS_MILEAGE_RATES[selectedYear] || IRS_MILEAGE_RATES[2024],
  };
}
