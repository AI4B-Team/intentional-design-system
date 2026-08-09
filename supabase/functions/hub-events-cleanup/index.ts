/**
 * hub-events-cleanup — deletes stored App Family activity older than a retention
 * window for the caller's organization. Keeps the feed and table small.
 *
 * POST { days?: number } -> { deleted: number, days: number }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/hub.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );

    const body = await req.json().catch(() => ({}));
    const days = Math.min(365, Math.max(1, Number(body.days ?? 30) || 30));
    const cronSecret = Deno.env.get("HUB_CRON_SECRET");
    const isCron = !!cronSecret && req.headers.get("x-hub-cron-secret") === cronSecret;

    // Scheduled run: prune every organization at once.
    if (isCron) {
      const cutoffAll = new Date(Date.now() - days * 86400_000).toISOString();
      const { data, error } = await admin
        .from("app_family_events")
        .delete()
        .lt("created_at", cutoffAll)
        .select("id");
      if (error) return json({ error: error.message }, 500);
      return json({ deleted: (data ?? []).length, days, scope: "all_organizations" });
    }

    const { data: userData } = await anon.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { data: membership } = await admin
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!membership) return json({ error: "No organization" }, 403);
    if (!["owner", "admin"].includes(String(membership.role))) {
      return json({ error: "Forbidden" }, 403);
    }

    const cutoff = new Date(Date.now() - days * 86400_000).toISOString();
    const { data, error } = await admin
      .from("app_family_events")
      .delete()
      .eq("organization_id", membership.organization_id)
      .lt("created_at", cutoff)
      .select("id");
    if (error) return json({ error: error.message }, 500);

    return json({ deleted: (data ?? []).length, days });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
