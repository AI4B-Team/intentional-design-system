import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "primary" | "warning" | "success" | "destructive";
}

const glowColorMap = {
  primary: "from-primary/40 via-primary/10 to-primary/40",
  warning: "from-warning/40 via-warning/10 to-warning/40",
  success: "from-success/40 via-success/10 to-success/40",
  destructive: "from-destructive/40 via-destructive/10 to-destructive/40",
};

export function GradientCard({ children, className, glowColor = "primary" }: GradientCardProps) {
  return (
    <div className={cn("relative rounded-medium p-px", className)}>
      {/* Gradient border */}
      <div
        className={cn(
          "absolute inset-0 rounded-medium bg-gradient-to-b opacity-60",
          glowColorMap[glowColor]
        )}
      />

      {/* Inner card */}
      <div className="relative rounded-[calc(var(--radius-medium)-1px)] bg-gradient-to-b from-white to-gray-50/50 dark:from-[hsl(222,47%,10%)] dark:to-[hsl(222,47%,8%)] card-inner-highlight h-full">
        {children}
      </div>
    </div>
  );
}
