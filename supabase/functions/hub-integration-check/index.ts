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
import { corsHeaders, hmacSignature } from "../_shared/hub.ts";

interface Check {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

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
    const checks: Check[] = [];

    // 1. Config
    const configured = /^https:\/\/\S+$/i.test(base);
    const stale = /lovableproject\.com|id-preview|localhost|127\.0\.0\.1/i.test(base);
    checks.push({
      id: "config",
      label: "Published URL Configured",
      ok: configured && !stale,
      detail: !configured
        ? "base_url must be a full https URL"
        : stale
          ? `Looks like a preview/local URL: ${base}`
          : base,
    });

    if (!configured) {
      await persist(admin, orgId, appSlug, 0, checks);
      return json({ app_slug: appSlug, base_url: base, passed: 0, total: checks.length, checks });
    }


    // 2. Reachable + /auth/hub route
    const root = await probe(base, "GET");
    checks.push({
      id: "reachable",
      label: "App Reachable",
      ok: root.status > 0 && root.status < 500,
      detail: root.status ? `HTTP ${root.status}` : root.error,
    });

    const authHub = await probe(`${base}/auth/hub`, "GET");
    checks.push({
      id: "auth_hub",
      label: "SSO Landing Route (/auth/hub)",
      ok: authHub.status > 0 && authHub.status !== 404 && authHub.status < 500,
      detail: authHub.status ? `HTTP ${authHub.status}` : authHub.error,
    });

    // 3. Signed event accepted, bad signature rejected
    const envelope = JSON.stringify({
      id: crypto.randomUUID(),
      source: "real-elite",
      real_elite_org_id: orgId,
      event_type: "hub.integration_check",
      payload: { check: true },
      created_at: new Date().toISOString(),
    });
    const sig = await hmacSignature(envelope, secret);
    const eventsUrl = `${base}/api/hub/events`;

    const good = await probe(eventsUrl, "POST", envelope, {
      "x-webhook-signature": sig,
      "x-hub-signature": sig,
    });
    checks.push({
      id: "events_signed",
      label: "Signed Event Accepted (/api/hub/events)",
      ok: good.status >= 200 && good.status < 300,
      detail: good.status ? `HTTP ${good.status}` : good.error,
    });

    const bad = await probe(eventsUrl, "POST", envelope, {
      "x-webhook-signature": "deadbeef",
      "x-hub-signature": "deadbeef",
    });
    checks.push({
      id: "events_signature_enforced",
      label: "Bad Signature Rejected",
      ok: bad.status === 401 || bad.status === 403,
      detail: bad.status ? `HTTP ${bad.status}` : bad.error,
    });

    // 4. Action endpoint
    const ping = await probe(`${base}/api/hub/actions/ping`, "POST", envelope, {
      "x-webhook-signature": sig,
      "x-hub-signature": sig,
      "x-real-elite-org-id": orgId,
    });
    checks.push({
      id: "actions",
      label: "Action Endpoint (/api/hub/actions/ping)",
      ok: ping.status > 0 && ping.status !== 404 && ping.status < 500,
      detail: ping.status ? `HTTP ${ping.status}` : ping.error,
    });

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

async function probe(
  url: string,
  method: string,
  body?: string,
  headers: Record<string, string> = {},
): Promise<{ status: number; error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json", ...headers } : headers,
      body,
      signal: controller.signal,
      redirect: "follow",
    });
    return { status: res.status, error: "" };
  } catch (e) {
    return { status: 0, error: e instanceof Error ? e.message : "Request failed" };
  } finally {
    clearTimeout(timer);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
