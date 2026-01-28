import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationContext } from '@/hooks/useOrganizationId';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type DrivingSession = Database['public']['Tables']['driving_sessions']['Row'];
type DrivingSessionUpdate = Database['public']['Tables']['driving_sessions']['Update'];

export interface SessionFilters {
  dateRange?: 'week' | 'month' | 'year' | 'all';
  status?: 'active' | 'paused' | 'completed' | 'all';
}

export function useDrivingSessions(filters: SessionFilters = {}) {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();

  // Fetch all sessions
  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['driving-sessions', organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from('driving_sessions')
        .select('*')
        .eq('organization_id', organizationId)
        .order('started_at', { ascending: false });

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.dateRange) {
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('started_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch sessions:', error);
        throw error;
      }

      return data as DrivingSession[];
    },
    enabled: !!organizationId,
  });

  // Fetch single session with route points and properties
  const useSession = (sessionId: string | undefined) => {
    return useQuery({
      queryKey: ['driving-session', sessionId],
      queryFn: async () => {
        if (!sessionId) return null;

        const [sessionResult, routePointsResult, propertiesResult] = await Promise.all([
          supabase
            .from('driving_sessions')
            .select('*')
            .eq('id', sessionId)
            .single(),
          supabase
            .from('d4d_route_points')
            .select('*')
            .eq('session_id', sessionId)
            .order('recorded_at', { ascending: true }),
          supabase
            .from('d4d_properties')
            .select('*')
            .eq('session_id', sessionId)
            .order('tagged_at', { ascending: true }),
        ]);

        if (sessionResult.error) throw sessionResult.error;

        return {
          session: sessionResult.data as DrivingSession,
          routePoints: routePointsResult.data || [],
          properties: propertiesResult.data || [],
        };
      },
      enabled: !!sessionId,
    });
  };

  // Check for incomplete sessions
  const useIncompleteSession = () => {
    return useQuery({
      queryKey: ['incomplete-session', user?.id],
      queryFn: async () => {
        if (!user) return null;

        const { data, error } = await supabase
          .from('driving_sessions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'paused'])
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        return data as DrivingSession | null;
      },
      enabled: !!user,
    });
  };

  // Update session
  const updateSession = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DrivingSessionUpdate }) => {
      const { data, error } = await supabase
        .from('driving_sessions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['driving-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['driving-session', data.id] });
      toast.success('Session updated');
    },
    onError: () => {
      toast.error('Failed to update session');
    },
  });

  // Delete session
  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      // Delete related data first
      await Promise.all([
        supabase.from('d4d_route_points').delete().eq('session_id', id),
        supabase.from('d4d_properties').delete().eq('session_id', id),
        supabase.from('d4d_mileage_log').delete().eq('session_id', id),
      ]);

      const { error } = await supabase
        .from('driving_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driving-sessions'] });
      toast.success('Session deleted');
    },
    onError: () => {
      toast.error('Failed to delete session');
    },
  });

  // End incomplete session
  const endIncompleteSession = useMutation({
    mutationFn: async (session: DrivingSession) => {
      const { error } = await supabase
        .from('driving_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (error) throw error;
      return session.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driving-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['incomplete-session'] });
      toast.success('Session ended');
    },
  });

  // Calculate stats
  const stats = {
    totalMiles: sessions.reduce((sum, s) => sum + (s.total_miles || 0), 0),
    totalSessions: sessions.length,
    totalProperties: sessions.reduce((sum, s) => sum + (s.properties_tagged || 0), 0),
    totalPhotos: sessions.reduce((sum, s) => sum + (s.photos_taken || 0), 0),
    totalDuration: sessions.reduce((sum, s) => sum + (s.total_duration_seconds || 0), 0),
    // 2024 IRS mileage rate: $0.67/mile
    estimatedDeduction: sessions.reduce((sum, s) => sum + (s.total_miles || 0) * 0.67, 0),
  };

  return {
    sessions,
    isLoading,
    refetch,
    stats,
    useSession,
    useIncompleteSession,
    updateSession,
    deleteSession,
    endIncompleteSession,
  };
}
