import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationContext } from '@/hooks/useOrganizationId';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type D4DArea = Database['public']['Tables']['d4d_areas']['Row'];
type D4DAreaInsert = Database['public']['Tables']['d4d_areas']['Insert'];
type D4DAreaUpdate = Database['public']['Tables']['d4d_areas']['Update'];

export function useD4DAreas() {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();

  // Fetch all areas
  const { data: areas = [], isLoading, refetch } = useQuery({
    queryKey: ['d4d-areas', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('d4d_areas')
        .select('*')
        .eq('organization_id', organizationId)
        .order('is_favorite', { ascending: false })
        .order('last_driven_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as D4DArea[];
    },
    enabled: !!organizationId,
  });

  // Fetch single area with stats
  const useArea = (areaId: string | undefined) => {
    return useQuery({
      queryKey: ['d4d-area', areaId],
      queryFn: async () => {
        if (!areaId) return null;

        const { data, error } = await supabase
          .from('d4d_areas')
          .select('*')
          .eq('id', areaId)
          .single();

        if (error) throw error;
        return data as D4DArea;
      },
      enabled: !!areaId,
    });
  };

  // Create area
  const createArea = useMutation({
    mutationFn: async (area: Omit<D4DAreaInsert, 'user_id' | 'organization_id'>) => {
      if (!user || !organizationId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('d4d_areas')
        .insert({
          ...area,
          user_id: user.id,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d4d-areas'] });
      toast.success('Area saved!');
    },
    onError: () => {
      toast.error('Failed to save area');
    },
  });

  // Update area
  const updateArea = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: D4DAreaUpdate }) => {
      const { data, error } = await supabase
        .from('d4d_areas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['d4d-areas'] });
      queryClient.invalidateQueries({ queryKey: ['d4d-area', data.id] });
      toast.success('Area updated');
    },
    onError: () => {
      toast.error('Failed to update area');
    },
  });

  // Delete area
  const deleteArea = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('d4d_areas').delete().eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d4d-areas'] });
      toast.success('Area deleted');
    },
    onError: () => {
      toast.error('Failed to delete area');
    },
  });

  // Toggle favorite
  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('d4d_areas')
        .update({ is_favorite: isFavorite })
        .eq('id', id);

      if (error) throw error;
      return { id, isFavorite };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d4d-areas'] });
    },
  });

  // Update area stats after a session
  const updateAreaStats = useMutation({
    mutationFn: async ({
      id,
      additionalMiles,
      additionalProperties,
    }: {
      id: string;
      additionalMiles: number;
      additionalProperties: number;
    }) => {
      const { data: area } = await supabase
        .from('d4d_areas')
        .select('times_driven, total_miles_driven, properties_tagged')
        .eq('id', id)
        .single();

      if (!area) throw new Error('Area not found');

      const { error } = await supabase
        .from('d4d_areas')
        .update({
          times_driven: (area.times_driven || 0) + 1,
          total_miles_driven: (area.total_miles_driven || 0) + additionalMiles,
          properties_tagged: (area.properties_tagged || 0) + additionalProperties,
          last_driven_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d4d-areas'] });
    },
  });

  return {
    areas,
    isLoading,
    refetch,
    useArea,
    createArea,
    updateArea,
    deleteArea,
    toggleFavorite,
    updateAreaStats,
  };
}
