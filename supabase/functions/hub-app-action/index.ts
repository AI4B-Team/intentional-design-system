/**
 * hub-app-action — API-first side of the App Family contract (standards §4).
 *
 * Real Elite calls a satellite app's authenticated action endpoint instead of
 * rebuilding the app's UI. The request is signed with the shared
 * HUB_SIGNING_SECRET so the satellite can verify authenticity.
 *
 * POST { app_slug, action, params?, method? }
 *   -> { status, ok, data, target }
 *
 * Satellite receiver: {base_url}/api/hub/actions/{action}
 *   headers: x-webhook-signature (hex HMAC-SHA256 of the raw body),
 *            x-hub-signature (same value, legacy), x-real-elite-org-id
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, hmacSignature } from "../_shared/hub.ts";
import { requestedOrgId, resolveActiveMembership } from "../_shared/org.ts";

const ACTION_RE = /^[a-z0-9][a-z0-9._/-]{0,80}$/i;

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
    const action = String(body.action ?? "").trim();
    const method = String(body.method ?? "POST").toUpperCase() === "GET" ? "GET" : "POST";
    const params = (body.params ?? {}) as Record<string, unknown>;

    if (!appSlug) return json({ error: "app_slug is required" }, 400);
    if (!ACTION_RE.test(action)) return json({ error: "Invalid action name" }, 400);

    const membership = await resolveActiveMembership(admin, user.id, requestedOrgId(body));

    const orgId = membership?.organization_id as string | undefined;
    if (!orgId) return json({ error: "No active organization for this user" }, 400);

    const { data: app } = await admin
      .from("app_family_apps")
      .select("slug, base_url, enabled")
      .eq("slug", appSlug)
      .maybeSingle();

    if (!app || !app.enabled) return json({ error: "App not found or disabled" }, 404);

    const { data: link } = await admin
      .from("org_app_links")
      .select("remote_org_id")
      .eq("organization_id", orgId)
      .eq("app_slug", appSlug)
      .maybeSingle();

    const base = String(app.base_url).replace(/\/+$/, "");
    let target = `${base}/api/hub/actions/${action.replace(/^\/+/, "")}`;

    const envelope = JSON.stringify({
      source: "real-elite",
      real_elite_org_id: orgId,
      real_elite_user_id: user.id,
      remote_org_id: link?.remote_org_id ?? null,
      action,
      params,
      requested_at: new Date().toISOString(),
    });
    const sig = await hmacSignature(envelope, secret);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-webhook-signature": sig,
      "x-hub-signature": sig,
      "x-real-elite-org-id": orgId,
    };

    if (method === "GET") {
      const qs = new URLSearchParams({ real_elite_org_id: orgId });
      for (const [k, v] of Object.entries(params)) {
        if (v !== null && v !== undefined && typeof v !== "object") qs.set(k, String(v));
      }
      target = `${target}?${qs.toString()}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    let status = 0;
    let data: unknown = null;
    try {
      const res = await fetch(target, {
        method,
        headers,
        body: method === "POST" ? envelope : undefined,
        signal: controller.signal,
      });
      status = res.status;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text.slice(0, 2000);
      }
    } catch (err) {
      clearTimeout(timer);
      console.error("[hub-app-action] request failed", appSlug, action, err);
      return json({ error: "Satellite app did not respond", target }, 502);
    }
    clearTimeout(timer);

    return json({ target, status, ok: status >= 200 && status < 300, data });
  } catch (e) {
    console.error("[hub-app-action]", e);
    return json({ error: "Failed to call app action" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
