import * as React from "react";
import { DashboardLayout } from "@/components/layout";
import {
  MarketplaceHero,
  StatsCounter,
  FundingTypeCards,
  HowItWorks,
} from "@/components/marketplace";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  { value: 487, suffix: "M", prefix: "$", label: "Total Funded" },
  { value: 2847, label: "Deals Closed" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
];

export default function Marketplace() {
  const navigate = useNavigate();

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Marketplace" }]}
      fullWidth
    >
      <MarketplaceHero />
      <StatsCounter stats={stats} />
      <FundingTypeCards />
      <HowItWorks />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brand-accent to-brand">
        <div className="container mx-auto px-md text-center">
          <h2 className="text-h1 font-bold text-white mb-4">
            Ready to Get Funded?
          </h2>
          <p className="text-body text-white/80 mb-8 max-w-xl mx-auto">
            Submit your request in under 2 minutes and start receiving offers
            from our network of trusted lenders.
          </p>
          <Button
            variant="secondary"
            size="lg"
            icon={<ArrowRight />}
            iconPosition="right"
            onClick={() => navigate("/marketplace/request")}
            className="bg-white text-brand-accent hover:bg-white/90"
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </DashboardLayout>
  );
}
