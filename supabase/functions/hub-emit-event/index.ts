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
import { corsHeaders } from "../_shared/hub.ts";
import { emitHubEvent } from "../_shared/hub-emit.ts";
import { requestedOrgId, resolveActiveMembership } from "../_shared/org.ts";


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

    const membership = await resolveActiveMembership(admin, user.id, requestedOrgId(body));

    const orgId = membership?.organization_id as string | undefined;
    if (!orgId) return json({ error: "No active organization for this user" }, 400);

    const delivered = await emitHubEvent(admin, orgId, eventType, payload, only ?? undefined);


    return json({ event_type: eventType, delivered });
  } catch (e) {
    console.error("[hub-emit-event]", e);
    return json({ error: "Failed to emit event" }, 500);
  }
});



function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
