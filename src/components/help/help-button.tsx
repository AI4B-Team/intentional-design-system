import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  ExternalLink,
  Lightbulb,
  Rocket,
  Keyboard,
  FileQuestion,
} from "lucide-react";
import { Link } from "react-router-dom";

interface HelpButtonProps {
  variant?: "icon" | "text";
  className?: string;
}

export function HelpButton({ variant = "icon", className }: HelpButtonProps) {
  const [showGuide, setShowGuide] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {variant === "icon" ? (
            <Button variant="ghost" size="icon" className={className}>
              <HelpCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className={className}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowGuide(true)}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/onboarding">
              <Rocket className="h-4 w-4 mr-2" />
              Tour
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings?tab=faq">
              <BookOpen className="h-4 w-4 mr-2" />
              Tutorial
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Getting Started Guide Modal */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-brand" />
              Getting Started with RealElite
            </DialogTitle>
            <DialogDescription>
              Follow these steps to get the most out of your investment platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {[
              {
                step: 1,
                title: "Add Your First Property",
                desc: "Click 'Add Property' on the Properties page to start tracking a deal",
                link: "/properties",
              },
              {
                step: 2,
                title: "Connect Your Integrations",
                desc: "Link GoHighLevel and Closebot for automated follow-ups",
                link: "/settings/integrations",
              },
              {
                step: 3,
                title: "Set Up Deal Sources",
                desc: "Add your wholesalers, agents, and other lead sources",
                link: "/contacts",
              },
              {
                step: 4,
                title: "Configure AI Analysis",
                desc: "Customize how AI analyzes your deals",
                link: "/settings?tab=ai",
              },
              {
                step: 5,
                title: "Explore Calculators",
                desc: "Use our calculators to analyze wholesale, flip, and rental deals",
                link: "/calculators",
              },
            ].map((item) => (
              <Link
                key={item.step}
                to={item.link}
                onClick={() => setShowGuide(false)}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-small font-semibold text-brand shrink-0 group-hover:bg-brand group-hover:text-white transition-colors">
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="text-small font-medium text-content group-hover:text-brand transition-colors">
                    {item.title}
                  </p>
                  <p className="text-tiny text-content-secondary">{item.desc}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-content-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
            <Button variant="ghost" size="sm" onClick={() => setShowGuide(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link to="/onboarding" onClick={() => setShowGuide(false)}>
                Take Full Tour
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Contextual help tooltip component
interface HelpTooltipProps {
  content: string;
  learnMoreLink?: string;
}

export function HelpTooltip({ content, learnMoreLink }: HelpTooltipProps) {
  return (
    <div className="inline-flex items-center">
      <button
        className="text-content-tertiary hover:text-content-secondary transition-colors"
        title={content}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
    </div>
  );
}
