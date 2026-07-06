import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";
import { TRIAL_DAYS } from "@/lib/plans";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid"
  | "none";

export interface SubscriptionState {
  loading: boolean;
  status: SubscriptionStatus;
  plan: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  /** True if AI/premium features should be usable right now. */
  hasAccess: boolean;
  /** True when Stripe is not yet configured — everyone treated as trialing. */
  billingLive: boolean;
  refresh: () => Promise<void>;
}

const BILLING_LIVE = Boolean(import.meta.env.VITE_BILLING_LIVE);

export function useSubscription(): SubscriptionState {
  const { organization } = useOrganization();
  const [state, setState] = React.useState({
    loading: true,
    status: "none" as SubscriptionStatus,
    plan: null as string | null,
    trialEndsAt: null as string | null,
    currentPeriodEnd: null as string | null,
    cancelAtPeriodEnd: false,
    stripeCustomerId: null as string | null,
  });

  const fetchSub = React.useCallback(async () => {
    if (!organization) return;
    const { data } = await supabase
      .from("subscriptions" as any)
      .select("*")
      .eq("organization_id", organization.id)
      .maybeSingle();

    const row = data as any;
    if (!row) {
      // Fallback: give a 14-day trial from org creation date.
      const created = new Date(organization.created_at);
      const trialEnd = new Date(created.getTime() + TRIAL_DAYS * 86400_000);
      const stillInTrial = trialEnd.getTime() > Date.now();
      setState({
        loading: false,
        status: stillInTrial ? "trialing" : "none",
        plan: null,
        trialEndsAt: trialEnd.toISOString(),
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
      });
      return;
    }
    setState({
      loading: false,
      status: (row.status ?? "none") as SubscriptionStatus,
      plan: row.plan,
      trialEndsAt: row.trial_ends_at,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: !!row.cancel_at_period_end,
      stripeCustomerId: row.stripe_customer_id,
    });
  }, [organization]);

  React.useEffect(() => {
    if (!organization) return;
    setState((s) => ({ ...s, loading: true }));
    fetchSub();
  }, [organization, fetchSub]);

  const hasAccess = React.useMemo(() => {
    if (!BILLING_LIVE) return true; // Stripe not configured yet.
    return state.status === "trialing" || state.status === "active";
  }, [state.status]);

  return {
    ...state,
    hasAccess,
    billingLive: BILLING_LIVE,
    refresh: fetchSub,
  };
}
