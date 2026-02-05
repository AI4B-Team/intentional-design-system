import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Check,
  BookOpen,
  Upload,
  Plus,
  ExternalLink,
  SkipForward,
  Home,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  skippable: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to RealElite",
    description: "Your all-in-one real estate investment platform",
    icon: Rocket,
    skippable: false,
  },
  {
    id: "integrations",
    title: "Connect Your Tools",
    description: "Link GoHighLevel and Closebot for automation",
    icon: Zap,
    skippable: true,
  },
  {
    id: "first-property",
    title: "Add Your First Property",
    description: "Start tracking deals in your pipeline",
    icon: Building2,
    skippable: true,
  },
  {
    id: "tour",
    title: "Quick Tour",
    description: "Learn the key features in 60 seconds",
    icon: BookOpen,
    skippable: true,
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Start closing more deals today",
    icon: Check,
    skippable: false,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = React.useState(0);
  
  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      // Mark onboarding complete
      localStorage.setItem("realelite_onboarding_complete", "true");
      navigate("/dashboard");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkipAll = () => {
    localStorage.setItem("realelite_onboarding_complete", "true");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/5 via-background to-brand/10 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-tiny text-content-secondary">
            <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
            {!isLastStep && (
              <button
                onClick={handleSkipAll}
                className="text-content-tertiary hover:text-content transition-colors"
              >
                Skip setup
              </button>
            )}
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Step Content */}
        <Card className="border-brand/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center shadow-lg">
              <step.icon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-h2">{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Welcome Step */}
            {step.id === "welcome" && (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {[
                    { icon: Building2, label: "Track Properties", desc: "Manage your entire deal pipeline" },
                    { icon: Sparkles, label: "AI-Powered Analysis", desc: "Get instant property insights" },
                    { icon: Zap, label: "Automation Ready", desc: "Connect with GHL & Closebot" },
                  ].map((feature) => (
                    <div key={feature.label} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                        <feature.icon className="h-5 w-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-small font-medium text-content">{feature.label}</p>
                        <p className="text-tiny text-content-secondary">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations Step */}
            {step.id === "integrations" && (
              <div className="space-y-3">
                <Button variant="secondary" className="w-full justify-between" asChild>
                  <a href="/settings/integrations">
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Connect GoHighLevel
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="secondary" className="w-full justify-between" asChild>
                  <a href="/settings/integrations">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Connect Closebot
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <p className="text-center text-tiny text-content-tertiary">
                  You can always set these up later in Settings
                </p>
              </div>
            )}

            {/* First Property Step */}
            {step.id === "first-property" && (
              <div className="space-y-4">
                <div className="grid gap-3">
                  <Button variant="primary" className="w-full justify-center gap-2" asChild>
                    <a href="/properties">
                      <Plus className="h-4 w-4" />
                      Add Property Manually
                    </a>
                  </Button>
                  <Button variant="secondary" className="w-full justify-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import from CSV
                  </Button>
                </div>
                <p className="text-center text-tiny text-content-tertiary">
                  Start with one property to see how RealElite works
                </p>
              </div>
            )}

            {/* Tour Step */}
            {step.id === "tour" && (
              <div className="space-y-4">
                <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center border border-border-subtle">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 text-content-tertiary" />
                    <p className="text-small text-content-secondary">Video tour coming soon</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://docs.lovable.dev" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Read Docs
                    </a>
                  </Button>
                  <Button variant="outline" size="sm">
                    <BookOpen className="h-4 w-4 mr-1" />
                    View FAQ
                  </Button>
                </div>
              </div>
            )}

            {/* Complete Step */}
            {step.id === "complete" && (
              <div className="space-y-4 text-center">
                <div className="py-4">
                  <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="h-10 w-10 text-success" />
                  </div>
                  <p className="text-body text-content">
                    You're ready to start closing more deals!
                  </p>
                </div>
                <div className="grid gap-2">
                  <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation */}
            {step.id !== "complete" && (
              <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  disabled={isFirstStep}
                  className={cn(isFirstStep && "invisible")}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  {step.skippable && (
                    <Button variant="ghost" size="sm" onClick={handleSkip}>
                      <SkipForward className="h-4 w-4 mr-1" />
                      Skip
                    </Button>
                  )}
                  <Button variant="primary" size="sm" onClick={handleNext}>
                    {isLastStep ? "Finish" : "Continue"}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step indicators */}
        <div className="flex justify-center gap-2">
          {ONBOARDING_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === currentStep
                  ? "w-6 bg-brand"
                  : i < currentStep
                  ? "w-2 bg-brand/50"
                  : "w-2 bg-border"
              )}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
