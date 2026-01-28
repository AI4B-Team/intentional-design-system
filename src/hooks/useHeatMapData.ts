import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationContext } from '@/hooks/useOrganizationId';
import { generateHeatMapData, calculateCoverageArea, HeatPoint } from '@/lib/heatmap';

export type DateRange = '7d' | '30d' | '90d' | 'all';

export interface AreaCoverage {
  name: string;
  drives: number;
  miles: number;
  properties: number;
  lastDriven: string | null;
}

export function useHeatMapData(dateRange: DateRange = 'all') {
  const { organizationId } = useOrganizationContext();

  const { data, isLoading } = useQuery({
    queryKey: ['heatmap-data', organizationId, dateRange],
    queryFn: async () => {
      if (!organizationId) return null;

      // Calculate date filter
      let dateFilter: Date | null = null;
      const now = new Date();

      switch (dateRange) {
        case '7d':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      // Fetch route points
      let routeQuery = supabase
        .from('d4d_route_points')
        .select('latitude, longitude, recorded_at, session_id')
        .order('recorded_at', { ascending: false })
        .limit(5000); // Limit for performance

      if (dateFilter) {
        routeQuery = routeQuery.gte('recorded_at', dateFilter.toISOString());
      }

      // Fetch tagged properties
      let propsQuery = supabase
        .from('d4d_properties')
        .select('latitude, longitude, tagged_at')
        .eq('organization_id', organizationId);

      if (dateFilter) {
        propsQuery = propsQuery.gte('tagged_at', dateFilter.toISOString());
      }

      // Fetch saved areas
      const areasQuery = supabase
        .from('d4d_areas')
        .select('*')
        .eq('organization_id', organizationId);

      // Fetch sessions for stats
      let sessionsQuery = supabase
        .from('driving_sessions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'completed');

      if (dateFilter) {
        sessionsQuery = sessionsQuery.gte('started_at', dateFilter.toISOString());
      }

      const [routeResult, propsResult, areasResult, sessionsResult] = await Promise.all([
        routeQuery,
        propsQuery,
        areasQuery,
        sessionsQuery,
      ]);

      const routePoints = routeResult.data || [];
      const properties = propsResult.data || [];
      const areas = areasResult.data || [];
      const sessions = sessionsResult.data || [];

      // Generate heat map points
      const heatPoints = generateHeatMapData(
        routePoints.map((p) => ({
          latitude: p.latitude,
          longitude: p.longitude,
          recorded_at: p.recorded_at || new Date().toISOString(),
        })),
        properties.map((p) => ({
          latitude: p.latitude,
          longitude: p.longitude,
          tagged_at: p.tagged_at,
        }))
      );

      // Calculate coverage stats
      const coverageAreaSqMi = calculateCoverageArea(heatPoints);
      const totalMiles = sessions.reduce((sum, s) => sum + (s.total_miles || 0), 0);
      const totalProperties = properties.length;

      // Area coverage breakdown
      const areaCoverage: AreaCoverage[] = areas.map((area) => ({
        name: area.name,
        drives: area.times_driven || 0,
        miles: area.total_miles_driven || 0,
        properties: area.properties_tagged || 0,
        lastDriven: area.last_driven_at,
      }));

      // Find most driven area
      const mostDrivenArea = areaCoverage.reduce(
        (max, area) => (area.drives > (max?.drives || 0) ? area : max),
        null as AreaCoverage | null
      );

      // Generate suggestions
      const suggestions: string[] = [];

      // Areas not driven recently
      areas.forEach((area) => {
        if (area.last_driven_at) {
          const daysSinceDriven =
            (Date.now() - new Date(area.last_driven_at).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceDriven > 14) {
            suggestions.push(`Haven't driven ${area.name} in ${Math.floor(daysSinceDriven)} days`);
          }
        }
      });

      // Coverage percentage (rough estimate based on areas)
      const coveredAreas = areas.filter((a) => (a.times_driven || 0) > 0).length;
      const coveragePercentage = areas.length > 0 ? (coveredAreas / areas.length) * 100 : 0;

      if (coveragePercentage < 80 && areas.length > 0) {
        suggestions.push(
          `You've covered ${Math.round(coveragePercentage)}% of your saved areas this month`
        );
      }

      return {
        heatPoints,
        routePoints,
        properties,
        areas,
        sessions,
        stats: {
          coverageAreaSqMi,
          totalMiles,
          totalProperties,
          totalSessions: sessions.length,
          mostDrivenArea: mostDrivenArea?.name || null,
          coveragePercentage,
        },
        areaCoverage,
        suggestions,
      };
    },
    enabled: !!organizationId,
  });

  return {
    data,
    isLoading,
    heatPoints: data?.heatPoints || [],
    stats: data?.stats,
    areaCoverage: data?.areaCoverage || [],
    suggestions: data?.suggestions || [],
  };
}
