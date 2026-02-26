import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { WholesaleCalculator, FixFlipCalculator, RentalCalculator, BRRRRCalculator, CreativeCalculator, STRCalculator } from "@/components/calculators";
import { useProperty } from "@/hooks/useProperty";
import { Calculator, Home, TrendingUp, Building, Bed, Sparkles, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const calculatorTypes = [
  { 
    id: "wholesale", 
    label: "Wholesale", 
    icon: Calculator,
    description: "Calculate your assignment fee, MAO, and buyer ROI for wholesale deals." 
  },
  { 
    id: "flip", 
    label: "Fix & Flip", 
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
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const propertyId = searchParams.get("property_id");
  
  const [activeCalculator, setActiveCalculator] = React.useState(tabParam || "wholesale");
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  // Load property data if property_id is present
  const { data: property } = useProperty(propertyId || undefined);

  React.useEffect(() => {
    if (tabParam && calculatorTypes.some(t => t.id === tabParam)) {
      setActiveCalculator(tabParam);
    }
  }, [tabParam]);

  React.useEffect(() => {
    const activeElement = tabRefs.current.get(activeCalculator);
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeCalculator]);

  const handleTabChange = (tabId: string) => {
    setActiveCalculator(tabId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tabId);
    setSearchParams(newParams, { replace: true });
  };

  const activeType = calculatorTypes.find((t) => t.id === activeCalculator);

  // Build initial values from property data if available
  const propertyInitialValues = property ? {
    arv: property.arv ? Number(property.arv) : undefined,
    repairCosts: property.repair_estimate ? Number(property.repair_estimate) : undefined,
    purchasePrice: property.mao_standard ? Number(property.mao_standard) : undefined,
  } : undefined;

  return (
    <DashboardLayout breadcrumbs={[{ label: "Calculators" }]}>
      <PageHeader
        title="Deal Calculators"
        description="Analyze potential deals with our suite of investment calculators"
      />

      {/* Property Data Banner */}
      {property && (
        <div className="flex items-center gap-3 p-3 mb-lg bg-info/10 border border-info/20 rounded-medium">
          <Info className="h-5 w-5 text-info flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-small text-info">
              Pre-filled with data from: <span className="font-medium">{property.address}</span>
            </span>
          </div>
          <Badge variant="info" size="sm">Property Data Loaded</Badge>
        </div>
      )}

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
                onClick={() => handleTabChange(type.id)}
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
        {activeCalculator === "wholesale" && (
          <WholesaleCalculator />
        )}
        {activeCalculator === "flip" && (
          <FixFlipCalculator 
            propertyId={propertyId || undefined}
            initialValues={propertyInitialValues}
          />
        )}
        {activeCalculator === "rental" && (
          <RentalCalculator 
            propertyId={propertyId || undefined}
            initialValues={propertyInitialValues ? {
              purchasePrice: propertyInitialValues.purchasePrice,
              rehabCosts: propertyInitialValues.repairCosts,
            } : undefined}
          />
        )}
        {activeCalculator === "brrrr" && (
          <BRRRRCalculator 
            propertyId={propertyId || undefined}
            initialValues={propertyInitialValues ? {
              purchasePrice: propertyInitialValues.purchasePrice,
              rehabBudget: propertyInitialValues.repairCosts,
              arv: propertyInitialValues.arv,
            } : undefined}
          />
        )}
        {activeCalculator === "creative" && <CreativeCalculator />}
        {activeCalculator === "str" && <STRCalculator />}
      </div>
    </DashboardLayout>
  );
}
