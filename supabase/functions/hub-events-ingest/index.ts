/**
 * hub-events-ingest — public endpoint satellite apps POST their events to.
 *
 * Auth: x-hub-signature = hex HMAC-SHA256(rawBody, HUB_SIGNING_SECRET)
 * Body: { app_slug, real_elite_org_id, events: [{ event_type, payload, id?, created_at? }] }
 *       (a single { event_type, payload } object is also accepted)
 *
 * Stores events, stamps the org link, then fans out to enabled org webhooks.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import {
  corsHeaders,
  hmacSignature,
  safeEqual,
  HUB_EVENT_TYPES,
} from "../_shared/hub.ts";
import { applyIncomingEvents } from "../_shared/hub-handlers.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = Deno.env.get("HUB_SIGNING_SECRET");
  if (!secret) return json({ error: "Hub signing secret not configured" }, 503);

  const raw = await req.text();
  const provided =
    req.headers.get("x-webhook-signature") ?? req.headers.get("x-hub-signature") ?? "";
  const expected = await hmacSignature(raw, secret);
  if (!provided || !safeEqual(provided.toLowerCase(), expected)) {
    return json({ error: "Invalid signature" }, 401);
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const appSlug = String(body.app_slug ?? "").slice(0, 60);
  const orgId = body.real_elite_org_id ?? body.reo_org_id;
  if (!appSlug || !orgId) {
    return json({ error: "app_slug and real_elite_org_id are required" }, 400);
  }

  const incoming = Array.isArray(body.events)
    ? body.events
    : body.event_type
      ? [{ event_type: body.event_type, payload: body.payload, id: body.id }]
      : [];
  if (incoming.length === 0) return json({ error: "No events provided" }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // The org must exist in the hub before we accept events for it.
  const { data: org } = await admin
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .maybeSingle();
  if (!org) return json({ error: "Unknown organization" }, 404);

  const allRows = incoming
    .filter((e: any) => typeof e?.event_type === "string")
    .slice(0, 200)
    .map((e: any) => ({
      organization_id: orgId,
      app_slug: appSlug,
      event_type: HUB_EVENT_TYPES.includes(e.event_type) ? e.event_type : e.event_type.slice(0, 60),
      payload: e.payload ?? {},
      remote_event_id: e.id ? String(e.id).slice(0, 120) : null,
      created_at: e.created_at ?? new Date().toISOString(),
    }));

  // Idempotency: skip events whose remote id we already stored for this app/org.
  const remoteIds = allRows.map((r) => r.remote_event_id).filter(Boolean) as string[];
  let seen = new Set<string>();
  if (remoteIds.length > 0) {
    const { data: existing } = await admin
      .from("app_family_events")
      .select("remote_event_id")
      .eq("organization_id", orgId)
      .eq("app_slug", appSlug)
      .in("remote_event_id", remoteIds);
    seen = new Set((existing ?? []).map((r: any) => r.remote_event_id));
  }

  // Dedupe within the batch too.
  const batchSeen = new Set<string>();
  const rows = allRows.filter((r) => {
    if (!r.remote_event_id) return true;
    if (seen.has(r.remote_event_id) || batchSeen.has(r.remote_event_id)) return false;
    batchSeen.add(r.remote_event_id);
    return true;
  });
  const duplicates = allRows.length - rows.length;

  if (rows.length === 0) {
    return json({ received: 0, duplicates, applied: [] });
  }

  const { data: inserted, error } = await admin
    .from("app_family_events")
    .insert(rows)
    .select("id, app_slug, event_type, payload, created_at");

  if (error) {
    console.error("[hub-events-ingest] insert failed", error.message);
    return json({ error: "Failed to store events" }, 500);
  }

  // Project meaningful events onto real hub records (leads, suppression, inbox).
  const applied = await applyIncomingEvents(admin, orgId, appSlug, rows.map((r, i) => ({
    id: r.remote_event_id ?? inserted?.[i]?.id,
    event_type: r.event_type,
    payload: r.payload,
  })));

  await admin.from("org_app_links").upsert(
    {
      organization_id: orgId,
      app_slug: appSlug,
      remote_org_id: body.remote_org_id ?? null,
      linked_at: new Date().toISOString(),
      last_event_at: new Date().toISOString(),
    },
    { onConflict: "organization_id,app_slug" },
  );

  // Fan out to org webhooks (best-effort, signed with each webhook's own secret).
  const { data: hooks } = await admin
    .from("org_webhooks")
    .select("id, url, secret")
    .eq("organization_id", orgId)
    .eq("enabled", true);

  for (const hook of hooks ?? []) {
    for (const evt of inserted ?? []) {
      const payload = JSON.stringify({ ...evt, real_elite_org_id: orgId });
      try {
        const sig = await hmacSignature(payload, hook.secret);
        const res = await fetch(hook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-webhook-signature": sig,
            "x-hub-signature": sig,
          },
          body: payload,
        });
        await admin
          .from("org_webhooks")
          .update({ last_delivery_at: new Date().toISOString(), last_delivery_status: res.status })
          .eq("id", hook.id);
      } catch (e) {
        console.error("[hub-events-ingest] webhook delivery failed", e);
        await admin
          .from("org_webhooks")
          .update({ last_delivery_at: new Date().toISOString(), last_delivery_status: 0 })
          .eq("id", hook.id);
      }
    }
  }

  return json({ received: rows.length, applied });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
