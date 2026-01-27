import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Shield, Info, AlertTriangle, ExternalLink } from "lucide-react";
import { useStateRegulation } from "@/hooks/useCompliance";
import { cn } from "@/lib/utils";

interface StateComplianceBadgeProps {
  stateCode: string | null;
  className?: string;
  showDetails?: boolean;
}

export function StateComplianceBadge({
  stateCode,
  className,
  showDetails = true,
}: StateComplianceBadgeProps) {
  const { data: regulation, isLoading } = useStateRegulation(stateCode || undefined);

  if (!stateCode || isLoading) return null;

  if (!regulation) {
    return (
      <Badge variant="secondary" size="sm" className={cn("gap-1", className)}>
        <Shield className="h-3 w-3" />
        {stateCode}
      </Badge>
    );
  }

  if (!showDetails) {
    return (
      <Badge variant="info" size="sm" className={cn("gap-1", className)}>
        <Shield className="h-3 w-3" />
        {stateCode} Regulations
      </Badge>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-auto py-1 px-2 gap-1", className)}
        >
          <Shield className="h-3 w-3 text-brand-accent" />
          <span className="text-small">{regulation.state_name} Compliance</span>
          <Info className="h-3 w-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{regulation.state_name} Quick Facts</h4>
            <Badge variant="info" size="sm">{regulation.state_code}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-small">
            <div>
              <span className="text-muted-foreground block">Usury Limit</span>
              <span className="font-medium">
                {regulation.max_interest_rate 
                  ? `${regulation.max_interest_rate}%`
                  : "No limit"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Foreclosure</span>
              <span className="font-medium capitalize">
                {regulation.foreclosure_type || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Redemption</span>
              <span className="font-medium">
                {regulation.redemption_period_days 
                  ? `${regulation.redemption_period_days} days`
                  : "None"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Last Updated</span>
              <span className="font-medium">
                {regulation.last_updated}
              </span>
            </div>
          </div>

          {regulation.notes && (
            <div className="p-2 bg-info/5 border border-info/20 rounded text-tiny">
              <AlertTriangle className="h-3 w-3 inline mr-1 text-info" />
              {regulation.notes}
            </div>
          )}

          {regulation.licensing_requirements && (
            <div className="p-2 bg-warning/5 border border-warning/20 rounded text-tiny">
              <Shield className="h-3 w-3 inline mr-1 text-warning" />
              <strong>Licensing:</strong> {regulation.licensing_requirements}
            </div>
          )}

          <Button variant="link" size="sm" className="w-full justify-center gap-1 p-0 h-auto">
            View Full Regulations
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
