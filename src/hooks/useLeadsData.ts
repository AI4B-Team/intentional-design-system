import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationId } from "@/hooks/useOrganizationId";

/**
 * Phase 3 hooks for the unified Leads engine.
 * Each hook reads from the new `leads_*` tables. UI components should
 * gracefully fall back to existing harvest mock data when arrays are empty.
 */

export function useLeadsProperties(filters?: { minScore?: number; status?: string }) {
  const { organizationId } = useOrganizationId();

  return useQuery({
    queryKey: ["leads_properties", organizationId, filters],
    enabled: !!organizationId,
    queryFn: async () => {
      let q = supabase
        .from("leads_properties" as any)
        .select("*, leads_scores(score, tier), leads_signals(signal_type, severity, detected_at)")
        .eq("org_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (filters?.status) q = q.eq("status", filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useLeadsToday() {
  const { organizationId } = useOrganizationId();
  return useQuery({
    queryKey: ["leads_today", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from("leads_signals" as any)
        .select("*, leads_properties(*)")
        .eq("org_id", organizationId)
        .gte("detected_at", since.toISOString())
        .order("detected_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useLeadsScores(propertyId?: string) {
  const { organizationId } = useOrganizationId();
  return useQuery({
    queryKey: ["leads_scores", organizationId, propertyId],
    enabled: !!organizationId,
    queryFn: async () => {
      let q = supabase
        .from("leads_scores" as any)
        .select("*")
        .eq("org_id", organizationId);
      if (propertyId) q = q.eq("property_id", propertyId);
      const { data, error } = await q.order("scored_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useLeadOutreach(propertyId?: string) {
  const { organizationId } = useOrganizationId();
  return useQuery({
    queryKey: ["leads_outreach", organizationId, propertyId],
    enabled: !!organizationId,
    queryFn: async () => {
      let q = supabase
        .from("leads_outreach_log" as any)
        .select("*")
        .eq("org_id", organizationId);
      if (propertyId) q = q.eq("property_id", propertyId);
      const { data, error } = await q.order("sent_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useScanJobs() {
  const { organizationId } = useOrganizationId();
  return useQuery({
    queryKey: ["leads_scan_jobs", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads_scan_jobs" as any)
        .select("*")
        .eq("org_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useScraperHealth() {
  const { organizationId } = useOrganizationId();
  return useQuery({
    queryKey: ["leads_scraper_health", organizationId],
    enabled: !!organizationId,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads_scraper_health" as any)
        .select("*")
        .eq("org_id", organizationId)
        .order("checked_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useAutomationSettings() {
  const { organizationId } = useOrganizationId();
  return useQuery({
    queryKey: ["automation_settings", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_settings" as any)
        .select("*")
        .eq("org_id", organizationId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
}
