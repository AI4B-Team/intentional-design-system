/**
 * hub-integration-check — App Family acceptance checks (standards §6).
 *
 * For one satellite app, verifies the integration contract from the hub side:
 *   1. base_url is configured and reachable (not a stale preview)
 *   2. /auth/hub route exists (SSO handoff landing)
 *   3. /api/hub/events accepts a signed test event (and rejects a bad signature)
 *   4. /api/hub/actions/ping responds
 *
 * POST { app_slug } -> { app_slug, base_url, checks: [{ id, label, ok, detail }] }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/hub.ts";
import { runIntegrationChecks, type Check } from "../_shared/hub-checks.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const secret = Deno.env.get("HUB_SIGNING_SECRET");
    if (!secret) return json({ error: "Hub signing secret not configured" }, 503);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );

    const { data: userData } = await anon.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const appSlug = String(body.app_slug ?? "").trim().slice(0, 60);
    if (!appSlug) return json({ error: "app_slug is required" }, 400);

    const { data: membership } = await admin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const orgId = membership?.organization_id;
    if (!orgId) return json({ error: "No active organization for this user" }, 400);

    const { data: app } = await admin
      .from("app_family_apps")
      .select("slug, name, base_url, enabled")
      .eq("slug", appSlug)
      .maybeSingle();
    if (!app) return json({ error: "App not found" }, 404);

    const base = String(app.base_url ?? "").replace(/\/+$/, "");
    const checks = await runIntegrationChecks(base, orgId, secret);
    const passed = checks.filter((c) => c.ok).length;
    await persist(admin, orgId, appSlug, passed, checks);

    return json({
      app_slug: appSlug,
      base_url: base,
      enabled: !!app.enabled,
      passed,
      total: checks.length,
      checks,
    });
  } catch (e) {
    console.error("[hub-integration-check]", e);
    return json({ error: "Integration check failed" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Remembers the latest acceptance-check outcome on the org's app link row. */
async function persist(
  admin: ReturnType<typeof createClient>,
  orgId: string,
  appSlug: string,
  passed: number,
  checks: Check[],
) {
  try {
    await admin
      .from("org_app_links")
      .upsert(
        {
          organization_id: orgId,
          app_slug: appSlug,
          last_check_at: new Date().toISOString(),
          last_check_passed: passed,
          last_check_total: checks.length,
          last_check_details: checks,
        },
        { onConflict: "organization_id,app_slug" },
      );
  } catch (e) {
    console.error("[hub-integration-check] persist failed", e);
  }
}
