/**
 * Server-side hub event emitter.
 *
 * Fans a Real Elite event out to every enabled satellite app
 * ({base_url}/api/hub/events) and to the org's own webhooks, signed with
 * HMAC-SHA256. Safe to call fire-and-forget: it never throws.
 */
import { hmacSignature } from "./hub.ts";

// deno-lint-ignore no-explicit-any
type Admin = any;

export async function emitHubEvent(
  admin: Admin,
  orgId: string | null | undefined,
  eventType: string,
  payload: Record<string, unknown> = {},
  onlySlugs?: string[],
): Promise<{ target: string; status: number }[]> {
  const delivered: { target: string; status: number }[] = [];
  try {
    const secret = Deno.env.get("HUB_SIGNING_SECRET");
    if (!secret || !orgId || !eventType) return delivered;

    const { data: stored } = await admin
      .from("app_family_events")
      .insert({
        organization_id: orgId,
        app_slug: "real-elite",
        event_type: eventType.slice(0, 60),
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

    const { data: apps } = await admin
      .from("app_family_apps")
      .select("slug, base_url")
      .eq("enabled", true);

    for (const app of apps ?? []) {
      if (onlySlugs && !onlySlugs.includes(app.slug)) continue;
      const url = `${String(app.base_url).replace(/\/+$/, "")}/api/hub/events`;
      const status = await post(url, envelope, hubSig);
      delivered.push({ target: app.slug, status });
      if (status >= 200 && status < 300) {
        await admin.from("org_app_links").upsert(
          {
            organization_id: orgId,
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
      .eq("organization_id", orgId)
      .eq("enabled", true);

    for (const hook of hooks ?? []) {
      const sig = await hmacSignature(envelope, hook.secret);
      const status = await post(hook.url, envelope, sig);
      delivered.push({ target: hook.url, status });
      await admin
        .from("org_webhooks")
        .update({
          last_delivery_at: new Date().toISOString(),
          last_delivery_status: status,
        })
        .eq("id", hook.id);
    }
  } catch (e) {
    console.error("[emitHubEvent]", eventType, e);
  }
  return delivered;
}

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
    console.error("[emitHubEvent] delivery failed", url, e);
    return 0;
  }
}
