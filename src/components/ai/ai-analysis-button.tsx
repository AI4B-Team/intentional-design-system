import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAnalysisButtonProps {
  onClick: () => Promise<void>;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function AIAnalysisButton({
  onClick,
  label = "Run AI Analysis",
  variant = "secondary",
  size = "sm",
  showBadge = true,
  className,
  disabled = false,
  icon,
}: AIAnalysisButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;
    
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isLoading || disabled}
        icon={isLoading ? <Loader2 className="animate-spin" /> : icon || <Sparkles />}
      >
        {label}
      </Button>
      {showBadge && (
        <Badge variant="info" size="sm" className="gap-1">
          <Sparkles className="h-3 w-3" />
          AI-Powered
        </Badge>
      )}
    </div>
  );
}

// Compact version for inline use
export function AIBadge({ className }: { className?: string }) {
  return (
    <Badge variant="info" size="sm" className={cn("gap-1", className)}>
      <Sparkles className="h-3 w-3" />
      AI
    </Badge>
  );
}
