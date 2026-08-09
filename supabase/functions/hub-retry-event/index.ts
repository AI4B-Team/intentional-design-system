/**
 * hub-retry-event — re-delivers a stored outbound hub event to the targets
 * that previously failed, using the same signed envelope + HMAC signature.
 *
 * POST { event_id } -> { delivered: [{ target, status }] }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, hmacSignature } from "../_shared/hub.ts";
import { post } from "../_shared/hub-emit.ts";

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
    const eventId = String(body.event_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(eventId)) return json({ error: "Valid event_id is required" }, 400);

    const { data: event } = await admin
      .from("app_family_events")
      .select("id, organization_id, event_type, payload, created_at, direction, delivery")
      .eq("id", eventId)
      .maybeSingle();
    if (!event) return json({ error: "Event not found" }, 404);
    if (event.direction !== "outbound") return json({ error: "Only outbound events can be retried" }, 400);

    // Caller must be an active member of the event's organization.
    const { data: membership } = await admin
      .from("organization_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", event.organization_id)
      .eq("status", "active")
      .maybeSingle();
    if (!membership) return json({ error: "Forbidden" }, 403);

    const envelope = JSON.stringify({
      id: event.id,
      source: "real-elite",
      real_elite_org_id: event.organization_id,
      event_type: event.event_type,
      payload: event.payload ?? {},
      created_at: event.created_at,
      retry: true,
    });

    const previous = (event.delivery ?? []) as { target: string; status: number }[];
    const failedTargets = previous
      .filter((d) => !(d.status >= 200 && d.status < 300))
      .map((d) => d.target);
    if (failedTargets.length === 0) return json({ error: "Nothing to retry" }, 400);

    const results: { target: string; status: number }[] = [];

    const { data: apps } = await admin
      .from("app_family_apps")
      .select("slug, base_url")
      .eq("enabled", true);

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

    // Merge retry outcomes back into the stored delivery record.
    const merged = previous.map((d) => results.find((r) => r.target === d.target) ?? d);
    for (const r of results) {
      if (!merged.some((m) => m.target === r.target)) merged.push(r);
    }
    const allOk = merged.every((d) => d.status >= 200 && d.status < 300);
    await admin
      .from("app_family_events")
      .update({ delivery: merged, ...(allOk ? { dead_lettered_at: null } : {}) })
      .eq("id", event.id);

    return json({ event_id: event.id, delivered: results });
  } catch (e) {
    console.error("[hub-retry-event]", e);
    return json({ error: "Failed to retry event" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
