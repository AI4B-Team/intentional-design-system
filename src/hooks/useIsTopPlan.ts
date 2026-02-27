import { useOrganization } from "@/contexts/OrganizationContext";

const TOP_TIERS = ["enterprise", "pro"];

export function useIsTopPlan() {
  const { organization } = useOrganization();
  const tier = organization?.subscription_tier ?? "free";
  const isTopPlan = TOP_TIERS.includes(tier);
  return { isTopPlan, tier, planName: tier.charAt(0).toUpperCase() + tier.slice(1) };
}
