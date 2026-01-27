import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Clock, Banknote, Shield, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MarketplaceHeroProps {
  className?: string;
}

const trustBadges = [
  { icon: Users, label: "50+ Lenders", sublabel: "In our network" },
  { icon: Clock, label: "24hr Response", sublabel: "Average time" },
  { icon: Banknote, label: "$10K - $10M", sublabel: "Funding range" },
];

export function MarketplaceHero({ className }: MarketplaceHeroProps) {
  const navigate = useNavigate();

  return (
    <section
      className={cn(
        "relative overflow-hidden py-16 lg:py-24",
        className
      )}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-brand/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-accent/10 via-transparent to-transparent" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-brand-accent/5 blur-3xl" />
      <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-brand/5 blur-3xl" />

      <div className="relative container mx-auto px-md">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 gap-2 px-4 py-2">
            <Shield className="h-4 w-4 text-brand-accent" />
            Trusted by 500+ investors nationwide
          </Badge>

          {/* Headline */}
          <h1 className="text-display font-bold text-content mb-6 leading-tight">
            Instant Capital{" "}
            <span className="text-brand-accent">Marketplace</span>
          </h1>

          {/* Subhead */}
          <p className="text-h3 text-content-secondary font-normal mb-8 max-w-xl mx-auto">
            Get funded in hours, not weeks. Access our network of 50+ private lenders
            competing for your deal.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight />}
              iconPosition="right"
              onClick={() => navigate("/marketplace/request")}
              className="min-w-[200px]"
            >
              Get Funded Now
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/marketplace/lenders")}
              className="min-w-[200px]"
            >
              Browse Lenders
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 lg:gap-10">
            {trustBadges.map((badge, index) => (
              <div
                key={badge.label}
                className="flex items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-full bg-brand-accent/10 flex items-center justify-center">
                  <badge.icon className="h-6 w-6 text-brand-accent" />
                </div>
                <div className="text-left">
                  <div className="text-h3 font-semibold text-content">{badge.label}</div>
                  <div className="text-small text-content-secondary">{badge.sublabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
