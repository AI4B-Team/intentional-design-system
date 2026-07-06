// Single source of truth for subscription plans.
// Change prices/names/price IDs here. Stripe Price IDs are read from env
// (VITE_STRIPE_PRICE_PRO / VITE_STRIPE_PRICE_ELITE) so you can rotate them
// without a code change.

export type PlanId = "pro" | "elite";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number; // USD
  trialDays: number;
  stripePriceId?: string;
  popular?: boolean;
  tagline: string;
  features: string[];
}

export const TRIAL_DAYS = 14;

export const PLANS: Plan[] = [
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 97,
    trialDays: TRIAL_DAYS,
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_PRO,
    tagline: "For solo operators and small teams",
    features: [
      "Full CRM & pipeline",
      "AIVA AI assistant",
      "Deal analyzer AI",
      "Skip tracing (usage-based)",
      "Up to 5 team members",
    ],
    popular: true,
  },
  {
    id: "elite",
    name: "Elite",
    priceMonthly: 297,
    trialDays: TRIAL_DAYS,
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ELITE,
    tagline: "For growing acquisition teams",
    features: [
      "Everything in Pro",
      "AI voice acquisition agent",
      "Dialer + AI co-pilot",
      "Priority support",
      "Unlimited team members",
    ],
  },
];

export function getPlan(id?: string | null): Plan | undefined {
  if (!id) return undefined;
  return PLANS.find((p) => p.id === id);
}
