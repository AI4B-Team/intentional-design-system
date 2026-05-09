import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrganizationId } from "@/hooks/useOrganizationId";
import { useHarvestLeads, useFocusList, useEngineHealth } from "./useHarvestStats";
import type { HarvestLead } from "@/types/harvest";

/**
 * Phase 3 hooks for the unified Leads engine.
 * Each hook reads real `leads_*` tables and gracefully falls back to the
 * existing harvest mock so the UI never looks dead before agents run.
 */

async function safeFetch<T>(promise: any): Promise<T[]> {
  try {
    const { data, error } = await promise;
    if (error) {
      console.warn("[leads] query failed, falling back:", error.message);
      return [];
    }
    return (data ?? []) as T[];
  } catch (e: any) {
    console.warn("[leads] query threw, falling back:", e?.message);
    return [];
  }
}

export function useLeadsProperties(filters?: { minScore?: number; status?: string }) {
  const organizationId = useCurrentOrganizationId();
  const { leads: mockLeads } = useHarvestLeads();

  return useQuery({
    queryKey: ["leads_properties", organizationId, filters],
    enabled: !!organizationId,
    queryFn: async () => {
      let q = supabase
        .from("leads_properties" as any)
        .select("*, leads_scores(score, tier), leads_signals(signal_type, severity, detected_at)")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (filters?.status) q = q.eq("status", filters.status);
      const rows = await safeFetch<any>(q);
      if (rows.length > 0) return { rows, source: "live" as const };
      // Fall back to mock leads, optionally filtering by score
      const mocked = filters?.minScore
        ? mockLeads.filter((l) => l.opportunityScore >= filters.minScore!)
        : mockLeads;
      return { rows: mocked, source: "mock" as const };
    },
  });
}

export function useLeadsToday() {
  const organizationId = useCurrentOrganizationId();
  const { leads: mockLeads } = useHarvestLeads();

  return useQuery({
    queryKey: ["leads_today", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      const rows = await safeFetch<any>(
        supabase
          .from("leads_signals" as any)
          .select("*, leads_properties(*)")
          .eq("organization_id", organizationId)
          .gte("detected_at", since.toISOString())
          .order("detected_at", { ascending: false })
          .limit(100)
      );
      if (rows.length > 0) return { rows, source: "live" as const };
      const mocked = mockLeads
        .filter((l) => new Date(l.capturedAt).toDateString() === new Date().toDateString())
        .slice(0, 20);
      return { rows: mocked, source: "mock" as const };
    },
  });
}

export function useLeadsFocus() {
  const organizationId = useCurrentOrganizationId();
  const { leads: mockFocus } = useFocusList();

  return useQuery({
    queryKey: ["leads_focus", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const rows = await safeFetch<any>(
        supabase
          .from("leads_properties" as any)
          .select("*, leads_scores!inner(score, tier)")
          .eq("organization_id", organizationId)
          .gte("leads_scores.score", 80)
          .order("created_at", { ascending: false })
          .limit(50)
      );
      if (rows.length > 0) return { rows, source: "live" as const };
      return { rows: mockFocus as HarvestLead[], source: "mock" as const };
    },
  });
}

export function useLeadsScores(propertyId?: string) {
  const organizationId = useCurrentOrganizationId();
  return useQuery({
    queryKey: ["leads_scores", organizationId, propertyId],
    enabled: !!organizationId,
    queryFn: async () => {
      let q = supabase
        .from("leads_scores" as any)
        .select("*")
        .eq("organization_id", organizationId);
      if (propertyId) q = q.eq("lead_property_id", propertyId);
      return safeFetch<any>(q.order("scored_at", { ascending: false }));
    },
  });
}

export function useLeadOutreach(propertyId?: string) {
  const organizationId = useCurrentOrganizationId();
  return useQuery({
    queryKey: ["leads_outreach", organizationId, propertyId],
    enabled: !!organizationId,
    queryFn: async () => {
      let q = supabase
        .from("leads_outreach_log" as any)
        .select("*")
        .eq("organization_id", organizationId);
      if (propertyId) q = q.eq("lead_property_id", propertyId);
      return safeFetch<any>(q.order("sent_at", { ascending: false }).limit(100));
    },
  });
}

export function useScanJobs() {
  const organizationId = useCurrentOrganizationId();
  return useQuery({
    queryKey: ["leads_scan_jobs", organizationId],
    enabled: !!organizationId,
    queryFn: async () =>
      safeFetch<any>(
        supabase
          .from("leads_scan_jobs" as any)
          .select("*")
          .eq("organization_id", organizationId)
          .order("created_at", { ascending: false })
          .limit(50)
      ),
  });
}

export function useScraperHealth() {
  const organizationId = useCurrentOrganizationId();
  const { feedHealth } = useEngineHealth();

  return useQuery({
    queryKey: ["leads_scraper_health", organizationId],
    enabled: !!organizationId,
    refetchInterval: 60_000,
    queryFn: async () => {
      const rows = await safeFetch<any>(
        supabase
          .from("leads_scraper_health" as any)
          .select("*")
          .eq("organization_id", organizationId)
          .order("checked_at", { ascending: false })
      );
      if (rows.length > 0) return { rows, source: "live" as const };
      return { rows: feedHealth, source: "mock" as const };
    },
  });
}

export function useAutomationSettings() {
  const organizationId = useCurrentOrganizationId();
  return useQuery({
    queryKey: ["automation_settings", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("automation_settings" as any)
          .select("*")
          .eq("organization_id", organizationId)
          .maybeSingle();
        if (error) return null;
        return data as any;
      } catch {
        return null;
      }
    },
  });
}
