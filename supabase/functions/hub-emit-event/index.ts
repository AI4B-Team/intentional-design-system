/**
 * hub-emit-event — outbound side of the App Family contract.
 *
 * Real Elite (the hub) publishes an event to every enabled satellite app and
 * to the org's own webhook endpoints, signed with HMAC-SHA256.
 *
 * POST { event_type, payload?, app_slugs? } -> { delivered: [...] }
 * Satellite receiver: {base_url}/api/hub/events   header: x-webhook-signature
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, hmacSignature, HUB_EVENT_TYPES } from "../_shared/hub.ts";

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
    const eventType = String(body.event_type ?? "").slice(0, 60);
    if (!eventType) return json({ error: "event_type is required" }, 400);
    const payload = (body.payload ?? {}) as Record<string, unknown>;
    const only: string[] | null = Array.isArray(body.app_slugs) ? body.app_slugs : null;

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

    // Record the outbound event in the shared feed (app_slug = real-elite).
    const { data: stored } = await admin
      .from("app_family_events")
      .insert({
        organization_id: orgId,
        app_slug: "real-elite",
        event_type: HUB_EVENT_TYPES.includes(eventType as never)
          ? eventType
          : eventType.slice(0, 60),
        payload,
      })
      .select("id, created_at")
      .maybeSingle();

    const envelope = JSON.stringify({
      id: stored?.id ?? crypto.randomUUID(),
      source: "real-elite",
      real_elite_org_id: orgId,
      event_type: eventType,
      payload,
      created_at: stored?.created_at ?? new Date().toISOString(),
    });
    const hubSig = await hmacSignature(envelope, secret);

    const delivered: { target: string; status: number }[] = [];

    const { data: apps } = await admin
      .from("app_family_apps")
      .select("slug, base_url, enabled")
      .eq("enabled", true);

    for (const app of apps ?? []) {
      if (only && !only.includes(app.slug)) continue;
      const url = `${String(app.base_url).replace(/\/+$/, "")}/api/hub/events`;
      const status = await post(url, envelope, hubSig);
      delivered.push({ target: app.slug, status });
      if (status >= 200 && status < 300) {
        await admin
          .from("org_app_links")
          .upsert(
            { organization_id: orgId, app_slug: app.slug, last_event_at: new Date().toISOString() },
            { onConflict: "organization_id,app_slug" },
          );
      }
    }

    const { data: hooks } = await admin
      .from("org_webhooks")
      .select("id, url, secret")
      .eq("organization_id", orgId)
      .eq("enabled", true);

    for (const hook of hooks ?? []) {
      const sig = await hmacSignature(envelope, hook.secret);
      const status = await post(hook.url, envelope, sig);
      delivered.push({ target: hook.url, status });
      await admin
        .from("org_webhooks")
        .update({ last_delivery_at: new Date().toISOString(), last_delivery_status: status })
        .eq("id", hook.id);
    }

    return json({ event_type: eventType, delivered });
  } catch (e) {
    console.error("[hub-emit-event]", e);
    return json({ error: "Failed to emit event" }, 500);
  }
});

async function post(url: string, body: string, signature: string): Promise<number> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-signature": signature,
        "x-hub-signature": signature,
      },
      body,
    });
    return res.status;
  } catch (e) {
    console.error("[hub-emit-event] delivery failed", url, e);
    return 0;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
