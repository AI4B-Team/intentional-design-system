import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion } from "lucide-react";

type TitleStatus = "clear" | "issues_found" | "major_issues" | "unknown";

interface TitleStatusBadgeProps {
  status: TitleStatus;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  clear: {
    icon: ShieldCheck,
    color: "text-success",
    bg: "bg-success/10",
    label: "Clear",
  },
  issues_found: {
    icon: ShieldAlert,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "Issues",
  },
  major_issues: {
    icon: ShieldX,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Major Issues",
  },
  unknown: {
    icon: ShieldQuestion,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "Unknown",
  },
};

export function TitleStatusBadge({
  status,
  size = "sm",
  showLabel = false,
  className,
}: TitleStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.unknown;
  const Icon = config.icon;
  
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const padding = size === "sm" ? "p-1" : "p-1.5";

  if (showLabel) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-tiny font-medium",
          config.bg,
          config.color,
          className
        )}
      >
        <Icon className={iconSize} />
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        config.bg,
        config.color,
        padding,
        className
      )}
      title={`Title: ${config.label}`}
    >
      <Icon className={iconSize} />
    </div>
  );
}

export type { TitleStatus };
