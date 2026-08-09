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
        direction: "outbound",
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
      .select("id, url, secret, event_types")
      .eq("organization_id", orgId)
      .eq("enabled", true);

    for (const hook of hooks ?? []) {
      const filters: string[] = Array.isArray(hook.event_types) ? hook.event_types : [];
      if (filters.length && !filters.includes(eventType)) continue;
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

    if (stored?.id) {
      await admin
        .from("app_family_events")
        .update({ delivery: delivered })
        .eq("id", stored.id);
    }

    await notifyDeliveryFailures(admin, orgId, eventType, delivered);



  } catch (e) {
    console.error("[emitHubEvent]", eventType, e);
  }
  return delivered;
}

/**
 * POSTs a signed envelope with retry + exponential backoff.
 * Retries transient failures only (network error or 5xx), up to 3 attempts.
 */
export async function post(url: string, body: string, signature: string): Promise<number> {
  const delays = [300, 900];
  let status = 0;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
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
      status = res.status;
    } catch (e) {
      console.error("[emitHubEvent] delivery failed", url, e);
      status = 0;
    }
    const transient = status === 0 || status >= 500 || status === 429;
    if (!transient) return status;
    if (attempt < delays.length) await new Promise((r) => setTimeout(r, delays[attempt]));
  }
  return status;
}

/**
 * Notifies org owners/admins when an outbound event failed to reach one or more
 * targets. Throttled to one notification per org per hour to avoid noise.
 */
async function notifyDeliveryFailures(
  admin: Admin,
  orgId: string,
  eventType: string,
  delivered: { target: string; status: number }[],
) {
  try {
    const failed = delivered.filter((d) => !(d.status >= 200 && d.status < 300));
    if (failed.length === 0) return;

    const since = new Date(Date.now() - 3600_000).toISOString();
    const { data: recent } = await admin
      .from("notifications")
      .select("id")
      .eq("organization_id", orgId)
      .eq("type", "hub_delivery_failed")
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

    const targets = failed.map((f) => `${f.target} (${f.status || "no response"})`).join(", ");
    await admin.from("notifications").insert(
      admins.map((m: { user_id: string }) => ({
        user_id: m.user_id,
        organization_id: orgId,
        type: "hub_delivery_failed",
        title: "App Family Delivery Failed",
        message: `${eventType} could not be delivered to: ${targets}`,
        link: "/settings/app-family",
      })),
    );
  } catch (e) {
    console.error("[emitHubEvent] failure notification error", e);
  }
}
