import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useCreateOrganization } from "@/hooks/useOrganizationManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RealEliteLogo } from "@/components/brand/RealEliteLogo";
import {
  Building2,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Pencil,
  Phone as PhoneIcon,
  Zap,
  Home,
  Target,
  TrendingUp,
  Users,
  BarChart3,
  Search,
  Rocket,
  X,
  MessageSquare,
  Calculator,
  Mail,
  FileText,
  Bot,
} from "lucide-react";

type Step = "organization" | "role" | "goals" | "features" | "launch";

const STEPS: { id: Step; label: string }[] = [
  { id: "organization", label: "Organization" },
  { id: "role", label: "Role" },
  { id: "goals", label: "Goals" },
  { id: "features", label: "Features" },
  { id: "launch", label: "Launch" },
];

const INVESTOR_ROLES = [
  { id: "wholesaler", label: "Wholesaler", description: "Finding & assigning deals" },
  { id: "flipper", label: "Fix & Flipper", description: "Renovating for profit" },
  { id: "buy_hold", label: "Buy & Hold", description: "Building rental portfolio" },
  { id: "creative", label: "Creative Finance", description: "Sub-to, seller finance" },
  { id: "land", label: "Land Investor", description: "Vacant land & lots" },
  { id: "commercial", label: "Commercial", description: "Multi-family & CRE" },
];

const GOALS = [
  { 
    id: "find_deals", 
    icon: Search, 
    label: "Find More Deals", 
    description: "Discover motivated sellers and off-market opportunities" 
  },
  { 
    id: "analyze_faster", 
    icon: Calculator, 
    label: "Analyze Deals Faster", 
    description: "AI-powered comps, ARV, and repair estimates in seconds" 
  },
  { 
    id: "automate_outreach", 
    icon: MessageSquare, 
    label: "Automate Outreach", 
    description: "SMS, email, and dialer campaigns that run themselves" 
  },
  { 
    id: "manage_buyers", 
    icon: Users, 
    label: "Build Buyer Network", 
    description: "Organize cash buyers and dispo your deals faster" 
  },
];

const FEATURES = [
  { 
    icon: Bot, 
    label: "AI Deal Analyst", 
    description: "Your AI assistant that analyzes properties and runs your system 24/7",
    color: "text-primary"
  },
  { 
    icon: PhoneIcon, 
    label: "Power Dialer", 
    description: "Call through lists with AI transcription and coaching",
    color: "text-success"
  },
  { 
    icon: TrendingUp, 
    label: "Property Scout", 
    description: "Find distressed properties with skip tracing built-in",
    color: "text-warning"
  },
  { 
    icon: BarChart3, 
    label: "Market Analytics", 
    description: "Real-time comps, trends, and neighborhood insights",
    color: "text-info"
  },
  { 
    icon: Mail, 
    label: "Campaign Engine", 
    description: "Automated direct mail, SMS, and email sequences",
    color: "text-destructive"
  },
  { 
    icon: FileText, 
    label: "Automated Offers", 
    description: "Send hundreds of offers in minutes with AI-powered automation",
    color: "text-brand"
  },
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

export default function SignupFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization, loading: orgLoading, refreshOrganization } = useOrganization();
  const createOrganization = useCreateOrganization();

  const [step, setStep] = React.useState<Step>("organization");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form data
  const [orgName, setOrgName] = React.useState("");
  const [selectedMarkets, setSelectedMarkets] = React.useState<string[]>([]);
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);
  const [phone, setPhone] = React.useState("");

  // Note: Removed auto-redirect so user can preview the flow even if they have an organization.
  // If you want to restore the original behavior, uncomment the following:
  // React.useEffect(() => {
  //   if (!orgLoading && organization) {
  //     navigate("/dashboard", { replace: true });
  //   }
  // }, [organization, orgLoading, navigate]);

  const currentStepIndex = STEPS.findIndex(s => s.id === step);
  const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;

  const canContinue = () => {
    switch (step) {
      case "organization":
        return orgName.trim().length >= 2;
      case "role":
        return selectedRole !== null;
      case "goals":
        return selectedGoals.length > 0;
      case "features":
        return true;
      case "launch":
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    const idx = currentStepIndex;
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1].id);
    }
  };

  const handleBack = () => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setStep(STEPS[idx - 1].id);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Only create organization if user doesn't have one
      if (!organization) {
        const nameToUse = orgName.trim() || "My Organization";
        await createOrganization.mutateAsync({
          name: nameToUse,
        });
        await refreshOrganization();
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMarket = (state: string) => {
    setSelectedMarkets(prev =>
      prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Sidebar - Dark */}
      <aside className="hidden lg:flex lg:w-[300px] flex-col overflow-hidden"
        style={{ background: "linear-gradient(160deg, hsl(222 47% 8%) 0%, hsl(220 43% 6%) 50%, hsl(225 50% 7%) 100%)" }}
      >
        <div className="p-5 flex-1 overflow-hidden flex flex-col">
          {/* Logo */}
          <div className="flex items-center mb-6">
            <RealEliteLogo height={22} color="white" />
          </div>

          {/* Welcome Message */}
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white/90 mb-1.5">
              Welcome to RealElite! 👋
            </h2>
            <p className="text-xs text-white/40 leading-relaxed">
              We'll guide you through a quick setup to personalize your real estate investing command center.
            </p>
          </div>

          {/* Setup Progress */}
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium text-white/30 uppercase tracking-wide mb-3">
              Setup Progress
            </p>
            <div className="space-y-0.5">
              {STEPS.map((s, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = s.id === step;

                return (
                  <div
                    key={s.id}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors",
                      isCurrent && "bg-white/10"
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium",
                          isCompleted && "bg-success text-success-foreground",
                          isCurrent && "bg-primary text-primary-foreground",
                          !isCompleted && !isCurrent && "bg-white/10 text-white/30"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className={cn(
                          "w-0.5 h-3 my-0.5",
                          isCompleted ? "bg-success" : "bg-white/10"
                        )} />
                      )}
                    </div>
                    <div>
                      <p className={cn(
                        "text-sm font-medium",
                        isCurrent ? "text-white" : isCompleted ? "text-white/70" : "text-white/30"
                      )}>
                        {s.label}
                      </p>
                      <p className={cn(
                        "text-xs",
                        isCurrent ? "text-primary" : "text-white/20"
                      )}>
                        {isCompleted ? "Completed" : isCurrent ? "Current Step" : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-5 pt-0 space-y-3">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-white/30 mb-1.5">
              <span>Progress</span>
              <span>{currentStepIndex + 1} of {STEPS.length}</span>
            </div>
            <Progress value={progressPercent} className="h-1 bg-white/10" />
          </div>

          {/* Pro Tip */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs font-medium text-white/70">Pro Tip:</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              This only takes a minute—you can adjust settings anytime.
            </p>
          </div>
        </div>
      </aside>

      {/* Right Content Area */}
      <main className="flex-1 flex flex-col bg-background overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 p-3 border-b border-border">
          <RealEliteLogo height={18} color="hsl(222 47% 11%)" />
          <div className="ml-auto text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {STEPS.length}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-auto">
          <div className="w-full max-w-lg">
            {/* Step: Organization */}
            {step === "organization" && (
              <div className="space-y-6">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                  <Building2 className="h-3 w-3 mr-1" />
                  Organization Setup
                </Badge>
                
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    Name Your Command Center
                  </h1>
                  <p className="text-foreground-secondary">
                    This is your main workspace where all your deals, contacts, and campaigns live. Choose a name that represents your brand or mission.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    placeholder="e.g., ABC Investments, Home Buyers LLC"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-sm text-muted-foreground">
                    You can always change this later in settings.
                  </p>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!canContinue()}
                  className="w-auto"
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                >
                  Continue
                </Button>
              </div>
            )}

            {/* Step: Role */}
            {step === "role" && (
              <div className="space-y-6">
                <Badge variant="secondary" className="bg-warning/10 text-warning border-0">
                  <Users className="h-3 w-3 mr-1" />
                  Personalization
                </Badge>
                
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    Tell Us About Yourself
                  </h1>
                  <p className="text-foreground-secondary">
                    We'll customize your experience based on your investing strategy. <span className="text-muted-foreground">(you can change this later)</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Choose The One That Best Fits</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {INVESTOR_ROLES.map(role => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={cn(
                          "p-4 rounded-xl text-left transition-all border-2",
                          selectedRole === role.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/80"
                        )}
                      >
                        <p className="font-semibold text-foreground">{role.label}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12"
                  />
                  <div className="flex items-start gap-2 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <Zap className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Real-Time Updates</p>
                      <p className="text-xs text-muted-foreground">
                        Get notified about new motivated seller leads, counter-offers, and deals matching your criteria.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} icon={<ArrowLeft className="h-4 w-4" />}>
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canContinue()}
                    icon={<ArrowRight className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Goals */}
            {step === "goals" && (
              <div className="space-y-6">
                <Badge variant="secondary" className="bg-success/10 text-success border-0">
                  <Target className="h-3 w-3 mr-1" />
                  Your Focus
                </Badge>
                
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    What Brings You Here?
                  </h1>
                  <p className="text-foreground-secondary">
                    Select your primary goals and we'll prioritize the right tools for you.
                  </p>
                </div>

                <div className="space-y-3">
                  {GOALS.map(goal => {
                    const Icon = goal.icon;
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border-2",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/80"
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{goal.label}</p>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} icon={<ArrowLeft className="h-4 w-4" />}>
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canContinue()}
                    icon={<ArrowRight className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Features */}
            {step === "features" && (
              <div className="space-y-6">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Your Toolkit
                </Badge>
                
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    Your Investing Arsenal
                  </h1>
                  <p className="text-foreground-secondary">
                    Powerful tools that work together seamlessly to help you find, analyze, and close more deals.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {FEATURES.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-border hover:border-border/80 hover:shadow-card transition-all"
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
                          feature.color === "text-primary" && "bg-primary/10",
                          feature.color === "text-success" && "bg-success/10",
                          feature.color === "text-warning" && "bg-warning/10",
                          feature.color === "text-info" && "bg-info/10",
                          feature.color === "text-destructive" && "bg-destructive/10",
                          feature.color === "text-brand" && "bg-brand/10"
                        )}>
                          <Icon className={cn("h-5 w-5", feature.color)} />
                        </div>
                        <p className="font-semibold text-foreground mb-1">{feature.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} icon={<ArrowLeft className="h-4 w-4" />}>
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    icon={<ArrowRight className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Launch */}
            {step === "launch" && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center">
                    <Rocket className="h-10 w-10 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                    You're Ready To Launch
                  </h1>
                  <p className="text-slate-600">
                    Your workspace is set up and ready to help you find deals.
                    <br />
                    Think big — RealElite handles the complexity.
                  </p>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold text-slate-900">Pro Tip</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Don't start with small tasks. Give RealElite something ambitious:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <X className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400 line-through">"Look up a property"</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-700 font-medium">"Analyze 123 Oak St, find comps, and draft an offer at 70% ARV"</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={handleBack} icon={<ArrowLeft className="h-4 w-4" />}>
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="min-w-[180px]"
                    icon={isSubmitting ? undefined : <ArrowRight className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Enter RealElite"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Enterprise Ready — Your Data Is Encrypted And Secure At Every Step.
          </p>
        </div>
      </main>
    </div>
  );
}
