import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useOnboardingProgress, OnboardingTask } from "@/hooks/useOnboardingProgress";
import { useAuth } from "@/contexts/AuthContext";
import {
  Trophy,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
  Building2,
  FileText,
  Users,
  Search,
  Rocket,
  Gift,
  Star,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryMeta: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  setup: { label: "Account Setup", icon: Users, color: "text-blue-400" },
  deals: { label: "Deal Pipeline", icon: Target, color: "text-emerald-400" },
  automation: { label: "Automation", icon: Zap, color: "text-amber-400" },
};

function TaskCard({ task, onComplete }: { task: OnboardingTask; onComplete: (id: string) => void }) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all group cursor-pointer",
        task.completed
          ? "bg-success/5 border-success/20"
          : "bg-surface hover:bg-surface-hover border-border-subtle hover:border-brand/30"
      )}
      onClick={() => {
        if (!task.completed && task.route) {
          navigate(task.route);
        }
      }}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
          task.completed
            ? "bg-success/10"
            : "bg-brand/10 group-hover:bg-brand/20"
        )}
      >
        {task.completed ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <ChevronRight className="h-5 w-5 text-brand" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-small font-semibold",
          task.completed ? "text-content-secondary line-through" : "text-content"
        )}>
          {task.label}
        </p>
        <p className="text-tiny text-content-tertiary">{task.description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={task.completed ? "success" : "outline"} size="sm">
          +{task.points} XP
        </Badge>
        {!task.completed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task.id);
            }}
            className="text-tiny text-content-tertiary hover:text-content"
          >
            Mark Done
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SetupHub() {
  const { user } = useAuth();
  const { tasks, progress, earnedPoints, totalPoints, isComplete, completeTask } = useOnboardingProgress();

  const grouped = React.useMemo(() => {
    const groups: Record<string, OnboardingTask[]> = {};
    for (const task of tasks) {
      if (!groups[task.category]) groups[task.category] = [];
      groups[task.category].push(task);
    }
    return groups;
  }, [tasks]);

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-lg py-md">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
            <Rocket className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-h1 font-bold text-content">
            {isComplete ? "You're All Set! 🎉" : `Welcome${user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}!`}
          </h1>
          <p className="text-body text-content-secondary max-w-md mx-auto">
            {isComplete
              ? "Your account is fully configured. You're ready to close deals."
              : "Complete these steps to unlock the full power of RealElite's autonomous deal engine."}
          </p>
        </div>

        {/* Progress Card */}
        <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-small font-semibold text-content">Setup Progress</p>
                  <p className="text-tiny text-content-secondary tabular-nums">
                    {completedCount} of {tasks.length} tasks · {earnedPoints} XP earned
                  </p>
                </div>
              </div>
              <Badge variant={isComplete ? "success" : "info"} size="sm">
                {Math.round(progress)}%
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />

            {/* Milestone Rewards */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
              {[
                { pct: 25, label: "Bronze", icon: Star },
                { pct: 50, label: "Silver", icon: Star },
                { pct: 75, label: "Gold", icon: Trophy },
                { pct: 100, label: "Elite", icon: Gift },
              ].map((milestone) => (
                <div key={milestone.pct} className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                    progress >= milestone.pct
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-surface text-content-tertiary"
                  )}>
                    <milestone.icon className="h-4 w-4" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium",
                    progress >= milestone.pct ? "text-amber-400" : "text-content-tertiary"
                  )}>
                    {milestone.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Groups */}
        {Object.entries(grouped).map(([category, categoryTasks]) => {
          const meta = categoryMeta[category] || categoryMeta.setup;
          const Icon = meta.icon;
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", meta.color)} />
                <h2 className="text-small font-semibold text-content">{meta.label}</h2>
                <Badge variant="outline" size="sm">
                  {categoryTasks.filter(t => t.completed).length}/{categoryTasks.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {categoryTasks.map(task => (
                  <TaskCard key={task.id} task={task} onComplete={completeTask} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Autonomy Checklist - What's Coming */}
        <Card className="border-brand/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand" />
              <CardTitle className="text-body">Unlock Full Autonomy</CardTitle>
            </div>
            <CardDescription>
              Additional setup to make RealElite fully autonomous
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "E-Signature Setup", desc: "Enable auto-sending contracts for signature", status: "coming" },
              { label: "On-Market Scanner", desc: "Auto-scan MLS/Zillow for matching deals", status: "coming" },
              { label: "Auto-Contract Generation", desc: "AI generates and sends offers automatically", status: "coming" },
              { label: "Disposition Auto-Match", desc: "Automatically match deals to cash buyers", status: "coming" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-small font-medium text-content">{item.label}</p>
                  <p className="text-tiny text-content-tertiary">{item.desc}</p>
                </div>
                <Badge variant="outline" size="sm" className="text-content-tertiary">Coming Soon</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
