import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  X, 
  Zap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Rocket
} from "lucide-react";

const WELCOME_DISMISSED_KEY = "realelite_welcome_dismissed";

export function WelcomeSection() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = React.useState(() => {
    return localStorage.getItem(WELCOME_DISMISSED_KEY) === "true";
  });
  const scrollRef = React.useRef<HTMLDivElement>(null);

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
    setDismissed(true);
  };

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Trial Banner */}
      <Card className="p-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm">Start Your 14-Day Free Trial Of Our PRO Plan!</h3>
              <p className="text-xs text-muted-foreground truncate">
                Access AI voice agents, automated offers, lead generation, and 50+ powerful tools.
              </p>
            </div>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="shrink-0"
            onClick={() => navigate("/settings/billing")}
          >
            Start Trial
          </Button>
        </div>
      </Card>

      {/* Welcome Cards Carousel */}
      <div className="relative group">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 h-8 w-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 h-8 w-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors"
          title="Dismiss welcome section"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Meet AIVA Card */}
          <Card className="min-w-[280px] max-w-[320px] p-5 snap-start flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Meet AIVA</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4 flex-1">
              Got questions? AIVA knows the platform inside and out. Ask anything to get started.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => navigate("/aiva")}
            >
              Chat With AIVA
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>

          {/* Quick Start Guide */}
          <Card className="min-w-[280px] max-w-[320px] p-5 snap-start flex flex-col shrink-0">
            <h3 className="font-semibold text-foreground mb-1">Quick Start Guide</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get up and running in under 5 minutes with this step-by-step walkthrough.
            </p>
            <div className="flex-1 rounded-lg bg-muted/50 flex items-center justify-center aspect-video mb-3 cursor-pointer group/play hover:bg-muted transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover/play:bg-primary/20 transition-colors">
                <Play className="h-5 w-5 text-primary ml-0.5" />
              </div>
            </div>
          </Card>

          {/* Platform Tutorial */}
          <Card className="min-w-[280px] max-w-[320px] p-5 snap-start flex flex-col shrink-0">
            <h3 className="font-semibold text-foreground mb-1">Platform Tutorial</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Learn how to maximize productivity with AI-powered automation tools.
            </p>
            <div className="flex-1 rounded-lg bg-muted/50 flex items-center justify-center aspect-video mb-3 cursor-pointer group/play hover:bg-muted transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover/play:bg-primary/20 transition-colors">
                <Play className="h-5 w-5 text-primary ml-0.5" />
              </div>
            </div>
          </Card>

          {/* Complete Your Setup */}
          <Card className="min-w-[280px] max-w-[320px] p-5 snap-start flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
                <Rocket className="h-4.5 w-4.5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Complete Your Setup</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4 flex-1">
              Finish onboarding to unlock rewards and get the most out of RealElite.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => navigate("/onboarding")}
            >
              Continue Setup
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>

          {/* Knowledge Base */}
          <Card className="min-w-[280px] max-w-[320px] p-5 snap-start flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-xl bg-info/10 flex items-center justify-center">
                <BookOpen className="h-4.5 w-4.5 text-info" />
              </div>
              <h3 className="font-semibold text-foreground">Knowledge Base</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4 flex-1">
              Browse guides, FAQs, and best practices for every feature in the platform.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => navigate("/help")}
            >
              Browse Guides
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
