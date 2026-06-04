import * as React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { Trophy, Gift, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarRewardsWidgetProps {
  collapsed: boolean;
  onMobileClose: () => void;
}

export function SidebarRewardsWidget({ collapsed, onMobileClose }: SidebarRewardsWidgetProps) {
  const { progress, earnedPoints, totalPoints, isComplete, isDismissed } = useOnboardingProgress();

  if (isDismissed && isComplete) return null;

  if (collapsed) {
    return (
      <div className="px-2 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/setup"
              onClick={onMobileClose}
              className="flex items-center justify-center h-10 w-full rounded-lg bg-white/[0.02] border border-white/10 hover:border-primary/40 transition-all"
            >
              <div className="relative">
                <Trophy className="h-5 w-5 text-primary" />
                {!isComplete && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary text-[8px] font-bold text-white flex items-center justify-center">
                    {Math.round(progress)}
                  </span>
                )}
              </div>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
            <p className="font-medium">Setup Progress</p>
            <p className="text-xs text-muted-foreground">{earnedPoints}/{totalPoints} XP</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="mx-2 mb-2">
      <NavLink
        to="/setup"
        onClick={onMobileClose}
        className="block rounded-xl bg-white/[0.02] border border-white/10 hover:border-primary/40 transition-all p-3 group"
      >
        <div className="flex items-center gap-2 mb-2.5">
          <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {isComplete ? "Setup Complete" : "Complete Setup"}
            </p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-primary transition-colors" />
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/50 tabular-nums">
            {earnedPoints} / {totalPoints} XP
          </span>
          <span className="text-[10px] text-white/50 tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </NavLink>
    </div>
  );
}
