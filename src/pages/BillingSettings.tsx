import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { useOrganization } from "@/contexts/OrganizationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useSubscription } from "@/hooks/useSubscription";
import { PLANS, getPlan } from "@/lib/plans";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
import { getActiveOrganizationId } from "@/lib/activeOrganization";
  CreditCard,
  ExternalLink,
  Check,
  Zap,
  AlertCircle,
  Sparkles,
} from "lucide-react";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BillingSettings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { organization } = useOrganization();
  const { canManageBilling } = usePermissions();
  const sub = useSubscription();
  const [busy, setBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("Subscription started — welcome aboard!");
      sub.refresh();
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
    } else if (searchParams.get("checkout") === "cancel") {
      toast.info("Checkout canceled.");
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, sub]);

  React.useEffect(() => {
    if (!canManageBilling && organization) navigate("/dashboard");
  }, [canManageBilling, organization, navigate]);

  if (!organization) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const handleStartCheckout = async (planId: string, priceId?: string, trialDays?: number) => {
    if (!priceId) {
      toast.error("This plan is not yet configured. Ask admin to set the Stripe price ID.");
      return;
    }
    try {
      setBusy(planId);
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: { priceId, plan: planId, trialDays, organization_id: getActiveOrganizationId() },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e?.message ?? "Could not start checkout");
    } finally {
      setBusy(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setBusy("portal");
      const { data, error } = await supabase.functions.invoke("stripe-portal", {
        body: { organization_id: getActiveOrganizationId() },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not open billing portal");
    } finally {
      setBusy(null);
    }
  };

  const currentPlan = getPlan(sub.plan);
  const activeSubscription = sub.status === "active" || sub.status === "trialing";

  return (
    <DashboardLayout>
      <div className="space-y-lg max-w-4xl">
        <div>
          <h1 className="text-h1 font-semibold text-content">Billing & Subscription</h1>
          <p className="text-body text-content-secondary mt-1">
            Manage your plan and billing details
          </p>
        </div>

        {!sub.billingLive && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-content-secondary">
              Billing is not yet live. All accounts have full access while Stripe is being
              configured. Add <code className="text-content">STRIPE_SECRET_KEY</code>,{" "}
              <code className="text-content">STRIPE_WEBHOOK_SECRET</code>, and the plan price
              IDs, then set <code className="text-content">VITE_BILLING_LIVE=true</code>.
            </div>
          </div>
        )}

        {/* Current Plan */}
        <Card variant="default" padding="lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-brand-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-h3 font-semibold text-content">
                    {currentPlan?.name ?? (sub.status === "trialing" ? "Free Trial" : "No Plan")}
                  </h2>
                  {sub.status === "trialing" && <Badge variant="secondary">Trial</Badge>}
                  {sub.status === "active" && <Badge variant="success">Active</Badge>}
                  {sub.status === "past_due" && <Badge variant="destructive">Past Due</Badge>}
                  {sub.status === "canceled" && <Badge variant="destructive">Canceled</Badge>}
                  {sub.status === "none" && <Badge variant="secondary">Inactive</Badge>}
                </div>
                <p className="text-body text-content-secondary mt-1">
                  {sub.status === "trialing" && (
                    <>Trial ends {formatDate(sub.trialEndsAt)}</>
                  )}
                  {sub.status === "active" && currentPlan && (
                    <>
                      ${currentPlan.priceMonthly}/mo • Renews {formatDate(sub.currentPeriodEnd)}
                      {sub.cancelAtPeriodEnd && " (cancels at period end)"}
                    </>
                  )}
                  {sub.status === "past_due" && "Payment failed — update your card to continue."}
                  {sub.status === "canceled" && "Your subscription has ended."}
                  {sub.status === "none" && "Choose a plan below to get started."}
                </p>
              </div>
            </div>

            {activeSubscription && sub.stripeCustomerId && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleManageBilling}
                  disabled={busy === "portal"}
                  icon={<ExternalLink className="h-4 w-4" />}
                  iconPosition="right"
                >
                  {busy === "portal" ? "Opening…" : "Manage Billing"}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Plan Comparison */}
        {(!activeSubscription || sub.status === "trialing") && (
          <div className="space-y-4">
            <h2 className="text-h3 font-semibold text-content">
              {sub.status === "trialing" ? "Upgrade to keep going" : "Choose a Plan"}
            </h2>
            <div className="grid gap-lg md:grid-cols-2">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  variant="default"
                  padding="lg"
                  className={plan.popular ? "ring-2 ring-brand-accent relative" : ""}
                >
                  {plan.popular && (
                    <Badge
                      variant="default"
                      className="absolute -top-2 left-1/2 -translate-x-1/2"
                    >
                      Most Popular
                    </Badge>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-h4 font-semibold text-content">{plan.name}</h3>
                    <p className="text-tiny text-content-secondary mt-1">{plan.tagline}</p>
                    <div className="mt-3">
                      <span className="text-3xl font-bold text-content">
                        ${plan.priceMonthly}
                      </span>
                      <span className="text-content-secondary">/month</span>
                    </div>
                    <p className="text-tiny text-content-secondary mt-1">
                      {plan.trialDays}-day free trial • No card required to start
                    </p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-small text-content-secondary"
                      >
                        <Check className="h-4 w-4 text-status-success flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    fullWidth
                    disabled={busy === plan.id}
                    onClick={() =>
                      handleStartCheckout(plan.id, plan.stripePriceId, plan.trialDays)
                    }
                    icon={<Sparkles className="h-4 w-4" />}
                  >
                    {busy === plan.id
                      ? "Redirecting…"
                      : sub.status === "trialing"
                      ? `Upgrade to ${plan.name}`
                      : `Start ${plan.trialDays}-Day Trial`}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSubscription && (
          <Card variant="default" padding="lg">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Change Plan</CardTitle>
              <CardDescription>
                Switch plans or manage payment methods from the Stripe billing portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Button
                variant="primary"
                onClick={handleManageBilling}
                disabled={busy === "portal"}
                icon={<Zap className="h-4 w-4" />}
              >
                Open Billing Portal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
