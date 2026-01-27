import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { useOrganization } from "@/contexts/OrganizationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { 
  CreditCard, 
  Users, 
  Home,
  Calendar,
  ExternalLink,
  Check,
  Zap,
  AlertCircle
} from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    maxUsers: 3,
    maxProperties: 500,
    features: [
      "Up to 3 team members",
      "500 properties",
      "Basic analytics",
      "Email support"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    maxUsers: 10,
    maxProperties: 2500,
    features: [
      "Up to 10 team members",
      "2,500 properties",
      "Advanced analytics",
      "Priority support",
      "API access"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 249,
    maxUsers: 50,
    maxProperties: 10000,
    features: [
      "Up to 50 team members",
      "10,000 properties",
      "Custom integrations",
      "Dedicated support",
      "SSO & advanced security"
    ]
  }
];

export default function BillingSettings() {
  const navigate = useNavigate();
  const { organization, members, canManageBilling } = useOrganization();
  const { canManageBilling: hasBillingPermission } = usePermissions();

  // Redirect if no permission
  React.useEffect(() => {
    if (!hasBillingPermission && organization) {
      navigate("/dashboard");
    }
  }, [hasBillingPermission, organization, navigate]);

  if (!organization || !canManageBilling) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const activeMembers = members.filter((m) => m.status === "active");
  const seatsUsed = activeMembers.length;
  const seatsPercent = (seatsUsed / organization.max_users) * 100;
  
  // Mock properties count - would come from actual data
  const propertiesUsed = 127;
  const propertiesPercent = (propertiesUsed / organization.max_properties) * 100;

  const currentPlan = PLANS.find((p) => p.id === organization.subscription_tier) || PLANS[0];
  const isFreePlan = organization.subscription_tier === "free";

  const handleManageSubscription = () => {
    // Would open Stripe portal
    window.open("https://billing.stripe.com/session/test", "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-lg max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-h1 font-semibold text-content">Billing & Subscription</h1>
          <p className="text-body text-content-secondary mt-1">
            Manage your plan and billing details
          </p>
        </div>

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
                    {isFreePlan ? "Free" : currentPlan.name} Plan
                  </h2>
                  {organization.subscription_status === "active" ? (
                    <Badge variant="success">Active</Badge>
                  ) : organization.subscription_status === "past_due" ? (
                    <Badge variant="destructive">Past Due</Badge>
                  ) : (
                    <Badge variant="secondary">{organization.subscription_status}</Badge>
                  )}
                </div>
                {!isFreePlan && (
                  <p className="text-body text-content-secondary mt-1">
                    ${currentPlan.price}/month • Next billing: March 15, 2024
                  </p>
                )}
                {isFreePlan && (
                  <p className="text-body text-content-secondary mt-1">
                    Limited features • Upgrade to unlock more
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              {!isFreePlan && (
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  icon={<ExternalLink className="h-4 w-4" />}
                  iconPosition="right"
                >
                  Manage Subscription
                </Button>
              )}
              <Button variant="primary" icon={<Zap className="h-4 w-4" />}>
                {isFreePlan ? "Upgrade Plan" : "Change Plan"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Usage Stats */}
        <div className="grid gap-lg md:grid-cols-2">
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-small font-medium text-content">Team Seats</p>
                <p className="text-tiny text-content-secondary">
                  {seatsUsed} of {organization.max_users} used
                </p>
              </div>
            </div>
            <Progress value={seatsPercent} className="h-2" />
            {seatsPercent >= 90 && (
              <div className="flex items-center gap-2 mt-3 text-tiny text-amber-600">
                <AlertCircle className="h-3 w-3" />
                You're approaching your seat limit
              </div>
            )}
          </Card>

          <Card variant="default" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-small font-medium text-content">Properties</p>
                <p className="text-tiny text-content-secondary">
                  {propertiesUsed} of {organization.max_properties} used
                </p>
              </div>
            </div>
            <Progress value={propertiesPercent} className="h-2" />
          </Card>
        </div>

        {/* Plan Comparison */}
        {isFreePlan && (
          <div className="space-y-4">
            <h2 className="text-h3 font-semibold text-content">Choose a Plan</h2>
            <div className="grid gap-lg md:grid-cols-3">
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
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-content">${plan.price}</span>
                      <span className="text-content-secondary">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-small text-content-secondary">
                        <Check className="h-4 w-4 text-status-success flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={plan.popular ? "primary" : "outline"} 
                    fullWidth
                  >
                    Get Started
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Billing Info */}
        {!isFreePlan && (
          <Card variant="default" padding="lg">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Your payment method and billing address
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="flex items-center justify-between p-4 rounded-medium bg-surface-secondary">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-content/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-content" />
                  </div>
                  <div>
                    <p className="text-small font-medium text-content">•••• •••• •••• 4242</p>
                    <p className="text-tiny text-content-secondary">Expires 12/2025</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Update
                </Button>
              </div>

              <div className="mt-4 p-4 rounded-medium bg-surface-secondary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-small font-medium text-content">Billing Email</p>
                    <p className="text-tiny text-content-secondary">
                      {organization.billing_email || "Not set"}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/settings/organization")}>
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice History */}
        {!isFreePlan && (
          <Card variant="default" padding="lg">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>
                Download past invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="space-y-2">
                {[
                  { date: "Feb 15, 2024", amount: "$99.00", status: "Paid" },
                  { date: "Jan 15, 2024", amount: "$99.00", status: "Paid" },
                  { date: "Dec 15, 2023", amount: "$99.00", status: "Paid" },
                ].map((invoice, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-medium hover:bg-surface-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-content-tertiary" />
                      <span className="text-small text-content">{invoice.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-small font-medium text-content">{invoice.amount}</span>
                      <Badge variant="success" size="sm">{invoice.status}</Badge>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
