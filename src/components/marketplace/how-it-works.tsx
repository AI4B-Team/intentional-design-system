import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, Send, CheckCircle } from "lucide-react";
import { useInView } from "react-intersection-observer";

interface Step {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: FileText,
    title: "Submit Your Request",
    description: "Fill out a simple form with your deal details. Takes less than 2 minutes.",
  },
  {
    number: 2,
    icon: Send,
    title: "Lenders Compete",
    description: "Your request is sent to our network of 50+ lenders who compete for your deal.",
  },
  {
    number: 3,
    icon: CheckCircle,
    title: "Get Funded",
    description: "Review offers, choose the best terms, and close in as little as 7 days.",
  },
];

interface HowItWorksProps {
  className?: string;
}

export function HowItWorks({ className }: HowItWorksProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className={cn("py-16 bg-white", className)}>
      <div className="container mx-auto px-md">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-h1 font-bold text-content mb-4">
            How It Works
          </h2>
          <p className="text-body text-content-secondary max-w-2xl mx-auto">
            Get funded in three simple steps. No bank bureaucracy, no endless paperwork.
          </p>
        </div>

        {/* Steps */}
        <div ref={ref} className="relative max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-0.5 bg-border-subtle" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className={cn(
                    "relative text-center transition-all duration-500",
                    inView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  )}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  {/* Number Badge */}
                  <div className="relative inline-flex mb-6">
                    <div className="h-14 w-14 rounded-full bg-brand-accent flex items-center justify-center text-white text-h2 font-bold shadow-lg">
                      {step.number}
                    </div>
                    {/* Icon in corner */}
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white border-2 border-brand-accent flex items-center justify-center">
                      <Icon className="h-4 w-4 text-brand-accent" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-h3 font-semibold text-content mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-small text-content-secondary max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
