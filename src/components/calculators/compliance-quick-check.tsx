import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Gavel, AlertTriangle, ChevronRight } from "lucide-react";
import { useStateRegulation } from "@/hooks/useCompliance";
import { cn } from "@/lib/utils";

interface ComplianceQuickCheckProps {
  stateCode: string | null;
  onViewDetails?: () => void;
}

export function ComplianceQuickCheck({ stateCode, onViewDetails }: ComplianceQuickCheckProps) {
  const { data: regulation, isLoading } = useStateRegulation(stateCode || undefined);

  if (!stateCode || isLoading) return null;

  if (!regulation) {
    return (
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="text-body font-medium">Compliance Check</h4>
              <p className="text-small text-muted-foreground">
                No regulation data for {stateCode}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-accent" />
          <h4 className="text-body font-medium">{regulation.state_name} Compliance</h4>
        </div>
        <Badge variant="info" size="sm">{regulation.state_code}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-2 bg-muted rounded text-center">
          <div className="text-tiny text-muted-foreground">Usury Limit</div>
          <div className="font-semibold">
            {regulation.max_interest_rate ? `${regulation.max_interest_rate}%` : "None"}
          </div>
        </div>
        <div className="p-2 bg-muted rounded text-center">
          <div className="text-tiny text-muted-foreground">Foreclosure</div>
          <div className="font-semibold capitalize">
            {regulation.foreclosure_type || "—"}
          </div>
        </div>
        <div className="p-2 bg-muted rounded text-center">
          <div className="text-tiny text-muted-foreground">Redemption</div>
          <div className="font-semibold">
            {regulation.redemption_period_days ? `${regulation.redemption_period_days}d` : "None"}
          </div>
        </div>
      </div>

      {regulation.notes && (
        <div className="p-3 bg-info/5 border border-info/20 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
            <p className="text-small text-content">{regulation.notes}</p>
          </div>
        </div>
      )}

      {regulation.licensing_requirements && (
        <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <Gavel className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-small font-medium">Licensing: </span>
              <span className="text-small text-muted-foreground">{regulation.licensing_requirements}</span>
            </div>
          </div>
        </div>
      )}

      {onViewDetails && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center gap-1"
          onClick={onViewDetails}
        >
          View Full Regulations
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}
