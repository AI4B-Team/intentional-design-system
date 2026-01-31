import * as React from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Search, BarChart3, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Searching property data", icon: Search },
  { id: 2, label: "Finding comparable properties", icon: BarChart3 },
  { id: 3, label: "Calculating investment metrics", icon: BarChart3 },
  { id: 4, label: "Generating AI analysis", icon: CheckCircle2 },
];

interface AnalyzingStateProps {
  address: string;
}

export function AnalyzingState({ address }: AnalyzingStateProps) {
  const [currentStep, setCurrentStep] = React.useState(1);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-tiny font-bold text-primary-foreground">
          {currentStep}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        Analyzing Your Deal
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {address}
      </p>

      <div className="w-full max-w-xs space-y-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isComplete = currentStep > step.id;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-all",
                isActive && "bg-primary/10",
                isComplete && "opacity-60"
              )}
            >
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center",
                  isComplete && "bg-emerald-500",
                  isActive && "bg-primary",
                  !isActive && !isComplete && "bg-muted"
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : isActive ? (
                  <Loader2 className="h-3 w-3 text-primary-foreground animate-spin" />
                ) : (
                  <Icon className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <span
                className={cn(
                  "text-small",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
