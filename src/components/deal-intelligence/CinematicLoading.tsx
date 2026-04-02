import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Search, Home, BarChart3, Brain, Sparkles, CheckCircle2, Shield } from "lucide-react";

const steps = [
  { id: 1, label: "Searching public records...", sublabel: "County tax & deed records", icon: Search, duration: 2200 },
  { id: 2, label: "Pulling property profile...", sublabel: "Beds, baths, sqft, year built", icon: Home, duration: 1800 },
  { id: 3, label: "Running comparable sales analysis...", sublabel: "Finding 5-6 recent sales within 1 mile", icon: BarChart3, duration: 2500 },
  { id: 4, label: "Estimating mortgage balance...", sublabel: "Calculating remaining principal", icon: Shield, duration: 1500 },
  { id: 5, label: "Scoring 6 exit strategies...", sublabel: "Novation, Sub-To, Hybrid, Seller Finance, Wholesale, Flip", icon: Brain, duration: 2800 },
  { id: 6, label: "Generating seller pitch scripts...", sublabel: "Custom scripts with real dollar amounts", icon: Sparkles, duration: 1200 },
];

interface CinematicLoadingProps {
  address: string;
}

export function CinematicLoading({ address }: CinematicLoadingProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let stepIndex = 0;
    const advanceStep = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        stepIndex++;
        setTimeout(advanceStep, steps[stepIndex - 1]?.duration || 2000);
      }
    };
    advanceStep();
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 0.8, 95));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center py-12 animate-fade-in">
      {/* Pulsing orb */}
      <div className="relative mb-8">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-tiny font-bold text-primary-foreground shadow-lg">
          {currentStep + 1}
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-1">Analyzing Deal</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">{address}</p>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-tiny text-muted-foreground">{Math.round(progress)}%</span>
          <span className="text-tiny text-muted-foreground">~15 seconds</span>
        </div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-2">
        {steps.map((step, idx) => {
          const isActive = currentStep === idx;
          const isComplete = currentStep > idx;
          const isPending = currentStep < idx;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500",
                isActive && "bg-primary/10 scale-[1.02]",
                isComplete && "opacity-50",
                isPending && "opacity-30"
              )}
            >
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                isComplete && "bg-emerald-500",
                isActive && "bg-primary",
                isPending && "bg-muted"
              )}>
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : isActive ? (
                  <Loader2 className="h-3.5 w-3.5 text-primary-foreground animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-small block",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
                {isActive && (
                  <span className="text-tiny text-muted-foreground animate-fade-in">
                    {step.sublabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
