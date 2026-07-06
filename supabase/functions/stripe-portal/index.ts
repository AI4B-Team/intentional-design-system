// Opens the Stripe Customer Portal for the current org's billing owner.
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const APP_URL = Deno.env.get("APP_URL") ?? "http://localhost:8080";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!STRIPE_SECRET_KEY) return json({ error: "Stripe not configured" }, 503);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: member } = await admin
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    if (!member) return json({ error: "No organization" }, 400);
    if (!["owner", "admin"].includes(member.role)) return json({ error: "Forbidden" }, 403);

    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", member.organization_id)
      .maybeSingle();
    if (!sub?.stripe_customer_id) return json({ error: "No Stripe customer for this org" }, 400);

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${APP_URL}/settings/billing`,
    });
    return json({ url: portal.url });
  } catch (e) {
    console.error("stripe-portal error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
