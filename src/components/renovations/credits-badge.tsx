import { Coins, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CreditsBadgeProps {
  className?: string;
  showWarning?: boolean;
}

export function CreditsBadge({ className, showWarning = true }: CreditsBadgeProps) {
  const { balance, loading } = useCredits();

  const isLow = balance < 1 && balance > 0;
  const isEmpty = balance === 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant={isEmpty ? "destructive" : isLow ? "outline" : "secondary"}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1",
          isLow && "border-yellow-500 text-yellow-600 dark:text-yellow-400",
          isEmpty && "bg-destructive text-destructive-foreground"
        )}
      >
        <Coins className="h-3.5 w-3.5" />
        {loading ? (
          <span className="animate-pulse">...</span>
        ) : (
          <span>${balance.toFixed(2)}</span>
        )}
      </Badge>

      {showWarning && isLow && (
        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">Low credits</span>
          <Button size="sm" variant="outline" asChild className="h-7">
            <Link to="/settings/credits">Add Credits</Link>
          </Button>
        </div>
      )}

      {showWarning && isEmpty && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">No credits</span>
          <Button size="sm" variant="default" asChild className="h-7">
            <Link to="/settings/credits">Add Credits</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
