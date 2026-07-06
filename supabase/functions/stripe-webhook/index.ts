// Stripe webhook. Verifies signature and syncs the `subscriptions` table.
// verify_jwt = false (see supabase/config.toml). Auth is via Stripe signature.
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe not configured", { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("Webhook signature verification failed", e);
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.organization_id;
        if (!orgId || !session.subscription) break;
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertSub(admin, orgId, sub, session.metadata?.plan);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.organization_id ?? (await lookupOrgByCustomer(admin, sub.customer as string));
        if (!orgId) break;
        await upsertSub(admin, orgId, sub, sub.metadata?.plan);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const orgId = await lookupOrgByCustomer(admin, customerId);
        if (!orgId) break;
        await admin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("organization_id", orgId);
        break;
      }
    }
  } catch (e) {
    await reportError(e, { functionName: "stripe-webhook", extra: { eventType: event.type } });
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function upsertSub(
  admin: ReturnType<typeof createClient>,
  orgId: string,
  sub: Stripe.Subscription,
  planHint?: string
) {
  const priceId = sub.items.data[0]?.price?.id;
  const plan =
    planHint ||
    (priceId === Deno.env.get("STRIPE_PRICE_ELITE")
      ? "elite"
      : priceId === Deno.env.get("STRIPE_PRICE_PRO")
      ? "pro"
      : null);

  await admin.from("subscriptions").upsert(
    {
      organization_id: orgId,
      stripe_customer_id: sub.customer as string,
      stripe_subscription_id: sub.id,
      plan,
      status: sub.status,
      trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: !!sub.cancel_at_period_end,
    },
    { onConflict: "organization_id" }
  );
}

async function lookupOrgByCustomer(
  admin: ReturnType<typeof createClient>,
  customerId: string
): Promise<string | null> {
  const { data } = await admin
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return (data?.organization_id as string) ?? null;
}
