/**
 * hub-events-sweep — bulk re-delivery of failed outbound hub events.
 *
 * Finds outbound events from the last 24h that still have failed targets and
 * fewer than MAX_ATTEMPTS retries, then re-signs and re-posts the envelope to
 * those targets only.
 *
 * Auth:
 *  - Org owner/admin JWT  -> sweeps that organization only
 *  - Service role bearer  -> sweeps every organization (for scheduled runs)
 *
 * POST {} -> { swept, retried, still_failing }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, hmacSignature } from "../_shared/hub.ts";
import { post } from "../_shared/hub-emit.ts";

const MAX_ATTEMPTS = 5;
const BATCH = 50;

type Delivery = { target: string; status: number };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const secret = Deno.env.get("HUB_SIGNING_SECRET");
    if (!secret) return json({ error: "Hub signing secret not configured" }, 503);

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const cronSecret = Deno.env.get("HUB_CRON_SECRET");
    const isCron = !!cronSecret && req.headers.get("x-hub-cron-secret") === cronSecret;
    let orgFilter: string | null = null;

    if (!isCron && token !== serviceKey) {

      const anon = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
      );
      const { data: userData } = await anon.auth.getUser();
      const user = userData?.user;
      if (!user) return json({ error: "Unauthorized" }, 401);

      const { data: membership } = await admin
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .eq("status", "active")
        .in("role", ["owner", "admin"])
        .maybeSingle();
      if (!membership) return json({ error: "Forbidden" }, 403);
      orgFilter = membership.organization_id as string;
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let query = admin
      .from("app_family_events")
      .select("id, organization_id, event_type, payload, created_at, delivery, retry_attempts")
      .eq("direction", "outbound")
      .gte("created_at", since)
      .lt("retry_attempts", MAX_ATTEMPTS)
      .is("dead_lettered_at", null)
      .order("created_at", { ascending: true })
      .limit(BATCH);
    if (orgFilter) query = query.eq("organization_id", orgFilter);

    const { data: events } = await query;

    const { data: apps } = await admin
      .from("app_family_apps")
      .select("slug, base_url")
      .eq("enabled", true);

    let retried = 0;
    let stillFailing = 0;
    let deadLettered = 0;

    for (const event of events ?? []) {
      const previous = (event.delivery ?? []) as Delivery[];
      const failedTargets = previous
        .filter((d) => !(d.status >= 200 && d.status < 300))
        .map((d) => d.target);
      if (failedTargets.length === 0) continue;

      const envelope = JSON.stringify({
        id: event.id,
        source: "real-elite",
        real_elite_org_id: event.organization_id,
        event_type: event.event_type,
        payload: event.payload ?? {},
        created_at: event.created_at,
        retry: true,
      });

      const results: Delivery[] = [];

      for (const app of apps ?? []) {
        if (!failedTargets.includes(app.slug)) continue;
        const url = `${String(app.base_url).replace(/\/+$/, "")}/api/hub/events`;
        const sig = await hmacSignature(envelope, secret);
        const status = await post(url, envelope, sig);
        results.push({ target: app.slug, status });
        if (status >= 200 && status < 300) {
          await admin.from("org_app_links").upsert(
            {
              organization_id: event.organization_id,
              app_slug: app.slug,
              last_event_at: new Date().toISOString(),
            },
            { onConflict: "organization_id,app_slug" },
          );
        }
      }

      const { data: hooks } = await admin
        .from("org_webhooks")
        .select("id, url, secret")
        .eq("organization_id", event.organization_id)
        .eq("enabled", true);

      for (const hook of hooks ?? []) {
        if (!failedTargets.includes(hook.url)) continue;
        const sig = await hmacSignature(envelope, hook.secret);
        const status = await post(hook.url, envelope, sig);
        results.push({ target: hook.url, status });
        await admin
          .from("org_webhooks")
          .update({
            last_delivery_at: new Date().toISOString(),
            last_delivery_status: status,
          })
          .eq("id", hook.id);
      }

      if (results.length === 0) continue;

      const merged = previous.map((d) => results.find((r) => r.target === d.target) ?? d);
      for (const r of results) {
        if (!merged.some((m) => m.target === r.target)) merged.push(r);
      }

      await admin
        .from("app_family_events")
        .update({
          delivery: merged,
          retry_attempts: (event.retry_attempts ?? 0) + 1,
          last_retry_at: new Date().toISOString(),
        })
        .eq("id", event.id);

      const attempts = (event.retry_attempts ?? 0) + 1;
      const failing = merged.some((d) => !(d.status >= 200 && d.status < 300));

      if (failing && attempts >= MAX_ATTEMPTS) {
        await admin
          .from("app_family_events")
          .update({ dead_lettered_at: new Date().toISOString() })
          .eq("id", event.id);
        deadLettered += 1;
        await notifyDeadLetter(admin, event.organization_id, event.event_type);
      }

      retried += 1;
      if (failing) stillFailing += 1;
    }

    return json({
      swept: (events ?? []).length,
      retried,
      still_failing: stillFailing,
      dead_lettered: deadLettered,
    });
  } catch (e) {
    console.error("[hub-events-sweep]", e);
    return json({ error: "Failed to sweep events" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Alerts org owners/admins once per hour when an event exhausts all retries.
 */
// deno-lint-ignore no-explicit-any
async function notifyDeadLetter(admin: any, orgId: string, eventType: string) {
  try {
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { data: recent } = await admin
      .from("notifications")
      .select("id")
      .eq("organization_id", orgId)
      .eq("type", "hub_event_dead_lettered")
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

    await admin.from("notifications").insert(
      admins.map((m: { user_id: string }) => ({
        user_id: m.user_id,
        organization_id: orgId,
        type: "hub_event_dead_lettered",
        title: "App Family Delivery Gave Up",
        message: `"${eventType}" failed ${MAX_ATTEMPTS} delivery attempts and was moved to the dead-letter list.`,
        link: "/settings/app-family",
      })),
    );
  } catch (e) {
    console.error("[hub-events-sweep] dead-letter notify failed", e);
  }
}
