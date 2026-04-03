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
              className="flex items-center justify-center h-10 w-full rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 hover:border-amber-500/40 transition-all"
            >
              <div className="relative">
                <Trophy className="h-5 w-5 text-amber-400" />
                {!isComplete && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 text-[8px] font-bold text-slate-900 flex items-center justify-center">
                    {Math.round(progress)}
                  </span>
                )}
              </div>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-white text-slate-900 border-slate-200">
            <p className="font-medium">Setup Progress</p>
            <p className="text-xs text-slate-500">{earnedPoints}/{totalPoints} XP</p>
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
        className="block rounded-xl bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-transparent border border-amber-500/20 hover:border-amber-500/40 transition-all p-3 group"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {isComplete ? "Setup Complete! 🎉" : "Complete Setup"}
            </p>
            <p className="text-[10px] text-amber-400/80 font-medium tabular-nums">
              {earnedPoints} / {totalPoints} XP
            </p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </div>
        <Progress value={progress} className="h-1.5 bg-white/5" />
      </NavLink>
    </div>
  );
}
