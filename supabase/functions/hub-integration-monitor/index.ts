/**
 * hub-integration-monitor — scheduled acceptance checks for every connected app.
 *
 * Runs the same contract checks as hub-integration-check across all orgs that
 * have app links, persists the outcome, and notifies org owners/admins when an
 * app regresses (previously fully passing, now failing) — throttled to once
 * every 12 hours per app.
 *
 * Auth: service-role bearer token or x-hub-cron-secret header.
 * POST {} -> { checked, failing }
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

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const cronSecret = Deno.env.get("HUB_CRON_SECRET");
    const isCron = !!cronSecret && req.headers.get("x-hub-cron-secret") === cronSecret;
    if (!isCron && token !== serviceKey) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

    const { data: apps } = await admin
      .from("app_family_apps")
      .select("slug, name, base_url")
      .eq("enabled", true);

    const { data: links } = await admin
      .from("org_app_links")
      .select("organization_id, app_slug, last_check_passed, last_check_total")
      .limit(500);

    let checked = 0;
    let failing = 0;

    for (const link of links ?? []) {
      const app = (apps ?? []).find((a) => a.slug === link.app_slug);
      if (!app) continue;

      const checks = await runIntegrationChecks(
        String(app.base_url ?? ""),
        link.organization_id as string,
        secret,
      );
      const passed = checks.filter((c) => c.ok).length;
      checked++;

      await admin.from("org_app_links").upsert(
        {
          organization_id: link.organization_id,
          app_slug: link.app_slug,
          last_check_at: new Date().toISOString(),
          last_check_passed: passed,
          last_check_total: checks.length,
          last_check_details: checks,
        },
        { onConflict: "organization_id,app_slug" },
      );

      if (passed < checks.length) {
        failing++;
        const wasHealthy =
          link.last_check_total == null ||
          link.last_check_passed === link.last_check_total;
        if (wasHealthy) {
          await notify(
            admin,
            link.organization_id as string,
            String(app.name ?? app.slug),
            String(app.slug),
            checks,
          );
        }
      }
    }

    return json({ checked, failing });
  } catch (e) {
    console.error("[hub-integration-monitor]", e);
    return json({ error: "Monitor run failed" }, 500);
  }
});

async function notify(
  admin: ReturnType<typeof createClient>,
  orgId: string,
  appName: string,
  appSlug: string,
  checks: Check[],
) {
  try {
    const since = new Date(Date.now() - 12 * 3600_000).toISOString();
    const { data: recent } = await admin
      .from("notifications")
      .select("id")
      .eq("organization_id", orgId)
      .eq("type", "hub_integration_failing")
      .gte("created_at", since)
      .limit(1);
    if (recent && recent.length > 0) return;

    const { data: admins } = await admin
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", orgId)
      .eq("status", "active")
      .in("role", ["owner", "admin"]);
    if (!admins || admins.length === 0) return;

    const failed = checks.filter((c) => !c.ok).map((c) => c.label).join(", ");
    await admin.from("notifications").insert(
      admins.map((m: { user_id: string }) => ({
        user_id: m.user_id,
        organization_id: orgId,
        type: "hub_integration_failing",
        title: `${appName} Integration Check Failing`,
        message: `Failing checks: ${failed || "unknown"} (app: ${appSlug}).`,
        link: "/settings/app-family",
      })),
    );
  } catch (e) {
    console.error("[hub-integration-monitor] notify failed", e);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
