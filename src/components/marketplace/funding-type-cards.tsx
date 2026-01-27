import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ArrowRight, Hammer, Building, Wallet, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FundingType {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const fundingTypes: FundingType[] = [
  {
    id: "fix-flip",
    icon: Hammer,
    iconBg: "bg-brand-accent/10",
    iconColor: "text-brand-accent",
    title: "Fix & Flip",
    description: "Short-term loans for purchase and renovation. Typically 12-18 months with interest-only payments.",
  },
  {
    id: "dscr",
    icon: Building,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    title: "DSCR Loans",
    description: "Debt Service Coverage Ratio loans for rental properties. No income verification required.",
  },
  {
    id: "emd",
    icon: Wallet,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    title: "EMD Funding",
    description: "Earnest Money Deposit funding for quick contract execution. 24-48 hour funding available.",
  },
  {
    id: "transactional",
    icon: RefreshCw,
    iconBg: "bg-info/10",
    iconColor: "text-info",
    title: "Transactional",
    description: "Same-day double close funding. Perfect for wholesale deals and assignment closings.",
  },
];

interface FundingTypeCardsProps {
  className?: string;
}

export function FundingTypeCards({ className }: FundingTypeCardsProps) {
  const navigate = useNavigate();

  return (
    <section className={cn("py-16", className)}>
      <div className="container mx-auto px-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-h1 font-bold text-content mb-4">
            Funding for Every Strategy
          </h2>
          <p className="text-body text-content-secondary max-w-2xl mx-auto">
            Whether you're flipping, holding, or wholesaling, we have the right capital solution for your deal.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {fundingTypes.map((type, index) => {
            const Icon = type.icon;

            return (
              <Card
                key={type.id}
                variant="interactive"
                padding="lg"
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center mb-4",
                    type.iconBg
                  )}
                >
                  <Icon className={cn("h-7 w-7", type.iconColor)} />
                </div>

                {/* Title */}
                <h3 className="text-h3 font-semibold text-content mb-2">
                  {type.title}
                </h3>

                {/* Description */}
                <p className="text-small text-content-secondary mb-4">
                  {type.description}
                </p>

                {/* Link */}
                <button
                  onClick={() => navigate(`/marketplace/request?type=${type.id}`)}
                  className="inline-flex items-center gap-1 text-small font-medium text-brand-accent hover:gap-2 transition-all group"
                >
                  Get Quote
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
