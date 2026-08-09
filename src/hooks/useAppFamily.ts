import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrganizationId } from "@/hooks/useOrganizationId";

export interface FamilyApp {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  base_url: string;
  enabled: boolean;
}

export interface OrgAppLink {
  id: string;
  app_slug: string;
  remote_org_id: string | null;
  linked_at: string | null;
  last_event_at: string | null;
}

export interface FamilyEvent {
  id: string;
  app_slug: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
  direction: "inbound" | "outbound";
  delivery: { target: string; status: number }[] | null;
}


export interface OrgWebhook {
  id: string;
  url: string;
  secret: string;
  enabled: boolean;
  last_delivery_at: string | null;
  last_delivery_status: number | null;
}

export function useFamilyApps() {
  return useQuery({
    queryKey: ["app_family_apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_family_apps" as any)
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []) as unknown as FamilyApp[];
    },
  });
}

export function useOrgAppLinks() {
  const organizationId = useCurrentOrganizationId();
  return useQuery({
    queryKey: ["org_app_links", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_app_links" as any)
        .select("*")
        .eq("organization_id", organizationId);
      if (error) throw error;
      return (data ?? []) as unknown as OrgAppLink[];
    },
  });
}

export function useFamilyEvents(limit = 50) {
  const organizationId = useCurrentOrganizationId();
  const qc = useQueryClient();

  useEffect(() => {
    if (!organizationId) return;
    const channel = supabase
      .channel(`app_family_events_${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "app_family_events",
          filter: `organization_id=eq.${organizationId}`,
        },
        () => qc.invalidateQueries({ queryKey: ["app_family_events"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, qc]);

  return useQuery({
    queryKey: ["app_family_events", organizationId, limit],
    enabled: !!organizationId,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_family_events" as any)
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as FamilyEvent[];
    },
  });
}


export function useOrgWebhooks() {
  const organizationId = useCurrentOrganizationId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["org_webhooks", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_webhooks" as any)
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrgWebhook[];
    },
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["org_webhooks", organizationId] });

  const addWebhook = useMutation({
    mutationFn: async (url: string) => {
      const { error } = await supabase
        .from("org_webhooks" as any)
        .insert({ organization_id: organizationId, url });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggleWebhook = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("org_webhooks" as any)
        .update({ enabled })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeWebhook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("org_webhooks" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { ...query, addWebhook, toggleWebhook, removeWebhook };
}

/** Mints a 60s handoff token and returns the satellite launch URL. */
export function useLaunchFamilyApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appSlug: string) => {
      const { data, error } = await supabase.functions.invoke("hub-sso-token", {
        body: { app_slug: appSlug },
      });
      if (error) throw error;
      if (!data?.url) throw new Error(data?.error || "Could not create handoff link");
      return data.url as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org_app_links"] }),
  });
}

/** Admin-only registry management for satellite apps. */
export function useManageFamilyApps() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["app_family_apps"] });

  const saveApp = useMutation({
    mutationFn: async (app: Partial<FamilyApp> & { slug: string; name: string; base_url: string }) => {
      const { error } = await supabase
        .from("app_family_apps" as any)
        .upsert(
          {
            slug: app.slug,
            name: app.name,
            base_url: app.base_url.replace(/\/+$/, ""),
            description: app.description ?? null,
            enabled: app.enabled ?? true,
          },
          { onConflict: "slug" },
        );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggleApp = useMutation({
    mutationFn: async ({ slug, enabled }: { slug: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("app_family_apps" as any)
        .update({ enabled })
        .eq("slug", slug);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeApp = useMutation({
    mutationFn: async (slug: string) => {
      const { error } = await supabase.from("app_family_apps" as any).delete().eq("slug", slug);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { saveApp, toggleApp, removeApp };
}

/** Publishes a hub event out to enabled satellite apps + org webhooks. */
export function useEmitFamilyEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventType,
      payload = {},
      appSlugs,
    }: {
      eventType: string;
      payload?: Record<string, unknown>;
      appSlugs?: string[];
    }) => {
      const { data, error } = await supabase.functions.invoke("hub-emit-event", {
        body: { event_type: eventType, payload, app_slugs: appSlugs },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data?.delivered ?? []) as { target: string; status: number }[];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app_family_events"] });
      qc.invalidateQueries({ queryKey: ["org_webhooks"] });
    },
  });
}

/** Re-delivers a stored outbound event to the targets that previously failed. */
export function useRetryFamilyEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data, error } = await supabase.functions.invoke("hub-retry-event", {
        body: { event_id: eventId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data?.delivered ?? []) as { target: string; status: number }[];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app_family_events"] });
      qc.invalidateQueries({ queryKey: ["org_webhooks"] });
    },
  });
}



export interface FamilyActionResult {
  target: string;
  status: number;
  ok: boolean;
  data: unknown;
}

/** Calls a satellite app's authenticated action endpoint through the signed hub proxy. */
export function useCallFamilyAppAction() {
  return useMutation({
    mutationFn: async ({
      appSlug,
      action,
      params = {},
      method = "POST",
    }: {
      appSlug: string;
      action: string;
      params?: Record<string, unknown>;
      method?: "GET" | "POST";
    }) => {
      const { data, error } = await supabase.functions.invoke("hub-app-action", {
        body: { app_slug: appSlug, action, params, method },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as FamilyActionResult;
    },
  });
}

export interface IntegrationCheck {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

export interface IntegrationCheckResult {
  app_slug: string;
  base_url: string;
  passed: number;
  total: number;
  checks: IntegrationCheck[];
}

/** Runs the App Family acceptance checks against a satellite app. */
export function useIntegrationCheck() {
  return useMutation({
    mutationFn: async (appSlug: string) => {
      const { data, error } = await supabase.functions.invoke("hub-integration-check", {
        body: { app_slug: appSlug },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as IntegrationCheckResult;
    },
  });
}
