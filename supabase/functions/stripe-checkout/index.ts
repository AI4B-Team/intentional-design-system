// Creates a Stripe Checkout Session for a subscription with a trial period.
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const APP_URL = Deno.env.get("APP_URL") ?? "http://localhost:8080";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!STRIPE_SECRET_KEY) {
      return json({ error: "Stripe not configured" }, 503);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: cErr } = await supabase.auth.getClaims(token);
    if (cErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;
    const email = (claims.claims.email as string | undefined) ?? undefined;

    const body = await req.json().catch(() => ({}));
    const { priceId, plan, trialDays = 14 } = body ?? {};
    if (!priceId || typeof priceId !== "string") return json({ error: "priceId required" }, 400);

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
    if (!member) return json({ error: "No active organization" }, 400);
    if (!["owner", "admin"].includes(member.role)) return json({ error: "Forbidden" }, 403);
    const orgId = member.organization_id as string;

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

    // Reuse existing customer if we have one.
    const { data: existing } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", orgId)
      .maybeSingle();

    let customerId = existing?.stripe_customer_id ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { organization_id: orgId, user_id: userId },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: Number(trialDays) || 14,
        metadata: { organization_id: orgId, plan: plan ?? "" },
      },
      metadata: { organization_id: orgId, plan: plan ?? "" },
      success_url: `${APP_URL}/settings/billing?checkout=success`,
      cancel_url: `${APP_URL}/settings/billing?checkout=cancel`,
      allow_promotion_codes: true,
    });

    return json({ url: session.url });
  } catch (e) {
    console.error("stripe-checkout error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
