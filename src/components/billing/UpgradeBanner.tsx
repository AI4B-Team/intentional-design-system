import * as React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

interface Props {
  feature?: string;
  className?: string;
}

/**
 * Shown when a user tries to use an AI feature after their trial has ended.
 * Renders nothing when the user still has access.
 */
export function UpgradeBanner({ feature = "This feature", className }: Props) {
  const { hasAccess, status, loading } = useSubscription();
  if (loading || hasAccess) return null;

  const message =
    status === "past_due"
      ? "Your subscription is past due. Update your payment method to continue."
      : status === "canceled"
      ? "Your subscription has been canceled. Reactivate to continue using AI features."
      : "Your free trial has ended. Upgrade to keep using AI features.";

  return (
    <div
      className={
        "rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3 " +
        (className ?? "")
      }
    >
      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-content">
          {feature} requires an active subscription
        </p>
        <p className="text-xs text-content-secondary mt-1">{message}</p>
      </div>
      <Button asChild variant="primary" size="sm" className="flex-shrink-0">
        <Link to="/settings/billing">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Upgrade
        </Link>
      </Button>
    </div>
  );
}

/**
 * Wraps a feature. If the user has access, renders children.
 * Otherwise renders the upgrade banner.
 */
export function AIFeatureGate({
  feature,
  children,
}: {
  feature?: string;
  children: React.ReactNode;
}) {
  const { hasAccess, loading } = useSubscription();
  if (loading) return <>{children}</>;
  if (hasAccess) return <>{children}</>;
  return (
    <div className="p-6">
      <UpgradeBanner feature={feature} />
    </div>
  );
}
