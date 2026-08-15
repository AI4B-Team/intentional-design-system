import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalculatorInput, CalculatorSlider, InputGroup } from "./calculator-input";
import { ResultsCard, KeyMetric, MetricGrid } from "./results-card";
import { 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Share, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  TrendingUp,
  ArrowRight,
  Shield,
  Clock,
  DollarSign,
  Home,
  FileText,
  Sparkles
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Sub-navigation tabs for creative strategies
const creativeStrategies = [
  { id: "subto", label: "Subject-To", icon: FileText },
  { id: "seller-finance", label: "Seller Finance", icon: DollarSign },
  { id: "lease-option", label: "Lease Option", icon: Home },
  { id: "wrap", label: "Wraparound", icon: Sparkles },
];

import { SubToCalculator } from "./creative-subto";
import { SellerFinanceCalculator } from "./creative-seller-finance";
import { LeaseOptionCalculator } from "./creative-lease-option";
import { WrapCalculator } from "./creative-wrap";
function PlaceholderCalculator({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-surface-secondary/50 rounded-medium border border-border-subtle">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-content-tertiary" />
        </div>
        <h3 className="text-h3 font-medium text-content mb-2">
          {title} Calculator
        </h3>
        <p className="text-body text-content-secondary max-w-md">
          This calculator is under development.
        </p>
      </div>
    </div>
  );
}

export function CreativeCalculator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const subParam = searchParams.get("sub") || "subto";
  const [activeStrategy, setActiveStrategy] = React.useState(subParam);
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  React.useEffect(() => {
    if (subParam && creativeStrategies.some(s => s.id === subParam)) {
      setActiveStrategy(subParam);
    }
  }, [subParam]);

  React.useEffect(() => {
    const activeElement = tabRefs.current.get(activeStrategy);
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeStrategy]);

  const handleStrategyChange = (strategyId: string) => {
    setActiveStrategy(strategyId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sub", strategyId);
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="space-y-lg">
      {/* Sub-Navigation */}
      <div className="relative border-b border-border-subtle">
        <div className="flex items-center gap-1">
          {creativeStrategies.map((strategy) => {
            const Icon = strategy.icon;
            return (
              <button
                key={strategy.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(strategy.id, el);
                }}
                onClick={() => handleStrategyChange(strategy.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-small transition-colors whitespace-nowrap",
                  activeStrategy === strategy.id
                    ? "text-content font-medium"
                    : "text-content-secondary hover:text-content"
                )}
              >
                <Icon className="h-4 w-4" />
                {strategy.label}
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

      {/* Calculator Content */}
      <div className="animate-fade-in">
        {activeStrategy === "subto" && <SubToCalculator />}
        {activeStrategy === "seller-finance" && <SellerFinanceCalculator />}
        {activeStrategy === "lease-option" && <LeaseOptionCalculator />}
        {activeStrategy === "wrap" && <WrapCalculator />}
      </div>
    </div>
  );
}
