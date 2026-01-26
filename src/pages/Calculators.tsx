import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { WholesaleCalculator, CreativeCalculator } from "@/components/calculators";
import { Calculator, Home, TrendingUp, Building, Bed, Sparkles } from "lucide-react";

const calculatorTypes = [
  { 
    id: "wholesale", 
    label: "Wholesale", 
    icon: Calculator,
    description: "Calculate your assignment fee, MAO, and buyer ROI for wholesale deals." 
  },
  { 
    id: "flip", 
    label: "Flip", 
    icon: Home,
    description: "Analyze fix-and-flip deals with repair estimates, holding costs, and profit projections." 
  },
  { 
    id: "rental", 
    label: "Rental", 
    icon: Building,
    description: "Evaluate buy-and-hold investments with cash flow, cap rate, and ROI analysis." 
  },
  { 
    id: "brrrr", 
    label: "BRRRR", 
    icon: TrendingUp,
    description: "Plan your Buy, Rehab, Rent, Refinance, Repeat strategy with detailed projections." 
  },
  { 
    id: "str", 
    label: "STR", 
    icon: Bed,
    description: "Short-term rental analysis with seasonal occupancy and revenue projections." 
  },
  { 
    id: "creative", 
    label: "Creative", 
    icon: Sparkles,
    description: "Subject-To, Wraps, Seller Finance, and other creative deal structures." 
  },
];

export default function Calculators() {
  const [activeCalculator, setActiveCalculator] = React.useState("wholesale");
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  React.useEffect(() => {
    const activeElement = tabRefs.current.get(activeCalculator);
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeCalculator]);

  const activeType = calculatorTypes.find((t) => t.id === activeCalculator);

  return (
    <DashboardLayout breadcrumbs={[{ label: "Calculators" }]}>
      <PageHeader
        title="Deal Calculators"
        description="Analyze potential deals with our suite of investment calculators"
      />

      {/* Premium Tab Navigation */}
      <div className="relative border-b border-border-subtle mb-lg -mx-md px-md lg:-mx-lg lg:px-lg overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {calculatorTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(type.id, el);
                }}
                onClick={() => setActiveCalculator(type.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-body transition-colors whitespace-nowrap",
                  activeCalculator === type.id
                    ? "text-content font-medium"
                    : "text-content-secondary hover:text-content"
                )}
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Animated Underline */}
        <div
          className="absolute bottom-0 h-0.5 bg-brand-accent transition-all duration-200 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      </div>

      {/* Description */}
      {activeType && (
        <p className="text-small text-content-secondary mb-lg animate-fade-in">
          {activeType.description}
        </p>
      )}

      {/* Calculator Content */}
      <div className="animate-fade-in">
        {activeCalculator === "wholesale" && <WholesaleCalculator />}
        {activeCalculator === "creative" && <CreativeCalculator />}
        
        {/* Placeholder for other calculators */}
        {!["wholesale", "creative"].includes(activeCalculator) && (
          <div className="flex items-center justify-center min-h-[400px] bg-surface-secondary/50 rounded-medium border border-border-subtle">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
                {activeType && <activeType.icon className="h-8 w-8 text-content-tertiary" />}
              </div>
              <h3 className="text-h3 font-medium text-content mb-2">
                {activeType?.label} Calculator
              </h3>
              <p className="text-body text-content-secondary max-w-md">
                This calculator is coming soon. For now, try the Wholesale or Creative Finance calculators.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
