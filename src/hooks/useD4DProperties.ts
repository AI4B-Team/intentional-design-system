import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationContext } from '@/hooks/useOrganizationId';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type D4DProperty = Database['public']['Tables']['d4d_properties']['Row'];
type D4DPropertyUpdate = Database['public']['Tables']['d4d_properties']['Update'];

export interface D4DPropertyFilters {
  sessionId?: string;
  status?: 'all' | 'pending' | 'synced' | 'skipped';
  condition?: string;
  minPriority?: number;
  maxPriority?: number;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  hasPhoto?: boolean | null;
  search?: string;
}

export interface D4DPropertySort {
  field: 'tagged_at' | 'priority' | 'created_at';
  direction: 'asc' | 'desc';
}

export function useD4DProperties(
  filters: D4DPropertyFilters = {},
  sort: D4DPropertySort = { field: 'tagged_at', direction: 'desc' }
) {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading, refetch } = useQuery({
    queryKey: ['d4d-properties', organizationId, filters, sort],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from('d4d_properties')
        .select('*, driving_sessions(name)')
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters.sessionId) {
        query = query.eq('session_id', filters.sessionId);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('sync_status', filters.status);
      }

      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }

      if (filters.minPriority) {
        query = query.gte('priority', filters.minPriority);
      }

      if (filters.maxPriority) {
        query = query.lte('priority', filters.maxPriority);
      }

      if (filters.hasPhoto === true) {
        query = query.not('photos', 'is', null);
      } else if (filters.hasPhoto === false) {
        query = query.is('photos', null);
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('tagged_at', startDate.toISOString());
      }

      if (filters.search) {
        query = query.or(`formatted_address.ilike.%${filters.search}%,written_notes.ilike.%${filters.search}%`);
      }

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch D4D properties:', error);
        throw error;
      }

      return data as (D4DProperty & { driving_sessions: { name: string } | null })[];
    },
    enabled: !!organizationId,
  });

  // Get single property
  const useProperty = (propertyId: string) => {
    return useQuery({
      queryKey: ['d4d-property', propertyId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('d4d_properties')
          .select('*, driving_sessions(name)')
          .eq('id', propertyId)
          .single();

        if (error) throw error;
        return data as D4DProperty & { driving_sessions: { name: string } | null };
      },
      enabled: !!propertyId,
    });
  };

  // Update property
  const updateProperty = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: D4DPropertyUpdate }) => {
      const { data, error } = await supabase
        .from('d4d_properties')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['d4d-properties'] });
      queryClient.invalidateQueries({ queryKey: ['d4d-property', data.id] });
      toast.success('Property updated');
    },
    onError: () => {
      toast.error('Failed to update property');
    },
  });

  // Delete property
  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('d4d_properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d4d-properties'] });
      toast.success('Property deleted');
    },
    onError: () => {
      toast.error('Failed to delete property');
    },
  });

  // Sync property to main properties table
  const syncProperty = useMutation({
    mutationFn: async (d4dProperty: D4DProperty) => {
      if (!user || !organizationId) throw new Error('Not authenticated');

      // Check for duplicate
      const { data: existing } = await supabase
        .from('properties')
        .select('id')
        .eq('organization_id', organizationId)
        .ilike('address', d4dProperty.formatted_address || '')
        .maybeSingle();

      if (existing) {
        throw new Error('DUPLICATE');
      }

      // Create property
      const { data: newProperty, error: insertError } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          address: d4dProperty.formatted_address || `${d4dProperty.street_number} ${d4dProperty.street_name}`,
          city: d4dProperty.city,
          state: d4dProperty.state,
          zip: d4dProperty.zip,
          latitude: d4dProperty.latitude,
          longitude: d4dProperty.longitude,
          property_condition: d4dProperty.condition,
          source: 'Driving for Dollars',
          notes: d4dProperty.written_notes,
          stage: 'lead',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update D4D property with sync status
      await supabase
        .from('d4d_properties')
        .update({
          sync_status: 'synced',
          synced_to_property_id: newProperty.id,
          synced_at: new Date().toISOString(),
        })
        .eq('id', d4dProperty.id);

      return newProperty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d4d-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property synced to pipeline!');
    },
    onError: (error: Error) => {
      if (error.message === 'DUPLICATE') {
        toast.error('Property already exists in pipeline');
      } else {
        toast.error('Failed to sync property');
      }
    },
  });

  // Bulk sync properties
  const bulkSyncProperties = useMutation({
    mutationFn: async (propertyIds: string[]) => {
      if (!user || !organizationId) throw new Error('Not authenticated');

      const results = { synced: 0, skipped: 0, errors: 0 };

      for (const id of propertyIds) {
        const { data: d4dProp } = await supabase
          .from('d4d_properties')
          .select('*')
          .eq('id', id)
          .single();

        if (!d4dProp) {
          results.errors++;
          continue;
        }

        try {
          // Check for duplicate
          const { data: existing } = await supabase
            .from('properties')
            .select('id')
            .eq('organization_id', organizationId)
            .ilike('address', d4dProp.formatted_address || '')
            .maybeSingle();

          if (existing) {
            results.skipped++;
            await supabase
              .from('d4d_properties')
              .update({ sync_status: 'skipped' })
              .eq('id', id);
            continue;
          }

          // Create property
          const { data: newProperty, error: insertError } = await supabase
            .from('properties')
            .insert({
              user_id: user.id,
              organization_id: organizationId,
              address: d4dProp.formatted_address || `${d4dProp.street_number} ${d4dProp.street_name}`,
              city: d4dProp.city,
              state: d4dProp.state,
              zip: d4dProp.zip,
              latitude: d4dProp.latitude,
              longitude: d4dProp.longitude,
              property_condition: d4dProp.condition,
              source: 'Driving for Dollars',
              notes: d4dProp.written_notes,
              stage: 'lead',
            })
            .select()
            .single();

          if (insertError) throw insertError;

          await supabase
            .from('d4d_properties')
            .update({
              sync_status: 'synced',
              synced_to_property_id: newProperty.id,
              synced_at: new Date().toISOString(),
            })
            .eq('id', id);

          results.synced++;
        } catch {
          results.errors++;
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['d4d-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(`${results.synced} synced, ${results.skipped} skipped (duplicates)`);
    },
    onError: () => {
      toast.error('Bulk sync failed');
    },
  });

  // Bulk delete
  const bulkDeleteProperties = useMutation({
    mutationFn: async (propertyIds: string[]) => {
      const { error } = await supabase
        .from('d4d_properties')
        .delete()
        .in('id', propertyIds);

      if (error) throw error;
      return propertyIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['d4d-properties'] });
      toast.success(`${count} properties deleted`);
    },
    onError: () => {
      toast.error('Failed to delete properties');
    },
  });

  return {
    properties,
    isLoading,
    refetch,
    useProperty,
    updateProperty,
    deleteProperty,
    syncProperty,
    bulkSyncProperties,
    bulkDeleteProperties,
  };
}
