import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Play,
  RotateCcw,
  Check,
  ArrowRight,
  Home,
  Users,
  Phone,
  MessageSquare,
  DollarSign,
  BarChart3,
  Mail,
  Calendar,
} from "lucide-react";

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    title: "Add Properties to Your Pipeline",
    description:
      "Import leads from any source—skip trace lists, direct mail responses, or manual entry. Our AI auto-enriches every property with owner data and valuations.",
    icon: <Home className="h-5 w-5 text-white" />,
    iconBg: "bg-brand",
  },
  {
    id: 2,
    title: "Leads Scored & Organized Automatically",
    description:
      "Every lead is captured, scored by motivation level, and organized automatically. No manual entry. No missed opportunities.",
    icon: <Users className="h-5 w-5 text-white" />,
    iconBg: "bg-pink-500",
  },
  {
    id: 3,
    title: "AI Calls Within Seconds",
    description:
      "Our AI agent calls leads the moment they come in—while they're still thinking about you. 300% higher contact rates than manual calling.",
    icon: <Phone className="h-5 w-5 text-white" />,
    iconBg: "bg-purple-500",
  },
  {
    id: 4,
    title: "Automated Follow-Up Sequences",
    description:
      "Texts, emails, and direct mail go out automatically. Your leads stay warm without lifting a finger. Multi-channel drip campaigns that convert.",
    icon: <MessageSquare className="h-5 w-5 text-white" />,
    iconBg: "bg-orange-500",
  },
  {
    id: 5,
    title: "Close More Deals",
    description:
      "Watch your conversion rates soar. Our clients see 40% more closed deals within the first 90 days. From lead to closing, we've got you covered.",
    icon: <DollarSign className="h-5 w-5 text-white" />,
    iconBg: "bg-success",
  },
];

const STEP_DURATION = 4000; // 4 seconds per step

export function WorkflowShowcase() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  // Auto-play logic
  React.useEffect(() => {
    if (!isPlaying) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (STEP_DURATION / 50));
      });
    }, 50);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        const current = prev;
        setCompletedSteps((completed) => {
          const next = new Set(completed);
          next.add(current);
          return next;
        });

        if (prev >= WORKFLOW_STEPS.length - 1) {
          // Reset after last step
          setTimeout(() => {
            setCompletedSteps(new Set());
            setActiveStep(0);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
      setProgress(0);
    }, STEP_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isPlaying]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleRestart = () => {
    setActiveStep(0);
    setCompletedSteps(new Set());
    setProgress(0);
    setIsPlaying(true);
  };

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setProgress(0);
    // Mark all previous steps as completed
    const completed = new Set<number>();
    for (let i = 0; i < index; i++) {
      completed.add(i);
    }
    setCompletedSteps(completed);
  };

  return (
    <div className="w-full py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h2 className="text-center text-h2 md:text-[2rem] font-semibold text-content mb-12">
          Watch how DealFlow transforms leads into revenue—automatically
        </h2>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Steps Column */}
          <div className="space-y-3">
            {WORKFLOW_STEPS.map((step, index) => {
              const isActive = activeStep === index;
              const isCompleted = completedSteps.has(index);

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl transition-all duration-300 border",
                    isActive
                      ? "bg-surface-secondary border-brand/30 shadow-lg"
                      : "bg-surface border-border hover:bg-surface-secondary/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                        step.iconBg
                      )}
                    >
                      {step.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-tiny font-medium",
                            isActive ? "text-brand" : "text-content-tertiary"
                          )}
                        >
                          Step {step.id}
                        </span>
                        {isCompleted && !isActive && (
                          <div className="h-4 w-4 rounded-full bg-success flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <h3
                        className={cn(
                          "text-body font-semibold transition-colors",
                          isActive ? "text-content" : "text-content-secondary"
                        )}
                      >
                        {step.title}
                      </h3>

                      {/* Expanded Description */}
                      <div
                        className={cn(
                          "grid transition-all duration-300",
                          isActive
                            ? "grid-rows-[1fr] opacity-100 mt-2"
                            : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="text-small text-content-secondary leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Arrow indicator for active */}
                    {isActive && (
                      <ArrowRight className="h-5 w-5 text-content-tertiary flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Progress bar for active step */}
                  {isActive && isPlaying && (
                    <div className="mt-3 h-1 bg-surface-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand transition-all duration-50 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dashboard Preview Column */}
          <div className="lg:sticky lg:top-8">
            <DashboardPreview activeStep={activeStep} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="secondary"
            size="sm"
            onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
            icon={<Play className="h-4 w-4" />}
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            icon={<RotateCcw className="h-4 w-4" />}
          >
            Restart
          </Button>

          {/* Step Indicators */}
          <div className="flex items-center gap-2 ml-4">
            {WORKFLOW_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  activeStep === index
                    ? "w-6 h-2 bg-brand"
                    : completedSteps.has(index)
                    ? "w-2 h-2 bg-success"
                    : "w-2 h-2 bg-content-tertiary/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock dashboard preview that changes based on active step
function DashboardPreview({ activeStep }: { activeStep: number }) {
  const stats = [
    { label: "Active Leads", value: "1,247", change: "+42%" },
    { label: "Contacts Today", value: "324", change: "+18%" },
    { label: "Revenue", value: "$48.5K", change: "+35%" },
  ];

  const navItems = [
    { icon: BarChart3, label: "Dashboard", active: true },
    { icon: Mail, label: "Campaigns", active: false },
    { icon: Phone, label: "Calls", active: false },
    { icon: MessageSquare, label: "SMS", active: false },
    { icon: Calendar, label: "Analytics", active: false },
  ];

  // Highlight different sections based on step
  const highlightNav = activeStep === 1 ? 1 : activeStep === 3 ? 2 : activeStep === 4 ? 3 : 0;

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-[#1a1f2e]">
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#2a2f3e] border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-1 rounded-md bg-[#1a1f2e] text-[10px] text-white/50">
            app.dealflow.com
          </div>
        </div>
      </div>

      {/* App Content */}
      <div className="flex min-h-[300px]">
        {/* Sidebar */}
        <div className="w-36 border-r border-white/10 p-3 space-y-1">
          {navItems.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-300",
                item.active
                  ? "bg-brand/20 text-brand"
                  : highlightNav === index
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/70"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "p-3 rounded-lg transition-all duration-300",
                  activeStep === 0 && index === 0
                    ? "bg-brand/20 ring-1 ring-brand"
                    : "bg-white/5"
                )}
              >
                <p className="text-[10px] text-white/50">{stat.label}</p>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-success">{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="h-32 flex items-end justify-around gap-1.5 px-2">
            {Array.from({ length: 20 }).map((_, i) => {
              const height = 30 + Math.sin(i * 0.5 + activeStep) * 25 + Math.random() * 20;
              return (
                <div
                  key={i}
                  className="flex-1 bg-brand/60 rounded-t transition-all duration-500 ease-out"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
