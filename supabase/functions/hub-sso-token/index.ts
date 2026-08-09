/**
 * hub-sso-token — mints a 60s handoff token so a Real Elite user can jump
 * straight into a satellite app (/auth/hub?token=...).
 *
 * POST { app_slug }  ->  { url, expires_in }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { mintHubToken, corsHeaders } from "../_shared/hub.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const secret = Deno.env.get("HUB_SIGNING_SECRET");
    if (!secret) {
      return json({ error: "Hub signing secret not configured" }, 503);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData } = await anon.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const app_slug = body?.app_slug;
    // Optional deep link inside the satellite, e.g. "/leads?address=123+Main+St".
    const rawNext = String(body?.next ?? "").trim().slice(0, 500);
    const next = /^\/[^\s]*$/.test(rawNext) ? rawNext : "";
    if (!app_slug) return json({ error: "app_slug is required" }, 400);

    const { data: app } = await admin
      .from("app_family_apps")
      .select("slug, name, base_url, enabled")
      .eq("slug", app_slug)
      .maybeSingle();
    if (!app || !app.enabled) return json({ error: "Unknown or disabled app" }, 404);

    const { data: membership } = await admin
      .from("organization_members")
      .select("organization_id, role, organizations(name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!membership?.organization_id) {
      return json({ error: "No active organization for this user" }, 400);
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const token = await mintHubToken(
      {
        reo_org_id: membership.organization_id,
        reo_user_id: user.id,
        email: user.email ?? "",
        name: profile?.full_name ?? user.email ?? "",
        org_name: (membership as any).organizations?.name ?? "Real Elite Organization",
        role: (membership as any).role ?? "member",
      },
      secret,
    );

    // Record intent to link so the hub can show link state immediately.
    await admin.from("org_app_links").upsert(
      {
        organization_id: membership.organization_id,
        app_slug: app.slug,
        linked_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,app_slug" },
    );

    const base = app.base_url.replace(/\/+$/, "");
    const url =
      `${base}/auth/hub?token=${token}` + (next ? `&next=${encodeURIComponent(next)}` : "");
    return json({ url, expires_in: 60 });
  } catch (e) {
    console.error("[hub-sso-token]", e);
    return json({ error: "Failed to mint handoff token" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
