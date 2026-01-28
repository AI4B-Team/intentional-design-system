import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Hammer, Zap, ListChecks } from "lucide-react";
import {
  QuickEstimate,
  DetailedEstimate,
  type QuickEstimateResult,
  type RepairScope,
} from "@/components/repair-estimator";

interface RepairEstimatorTabProps {
  initialAddress?: string;
  initialSqft?: number;
  onEstimateComplete?: (total: number) => void;
}

export function RepairEstimatorTab({
  initialAddress,
  initialSqft = 1850,
  onEstimateComplete,
}: RepairEstimatorTabProps) {
  const [mode, setMode] = React.useState<"quick" | "detailed">("quick");
  const [sqft, setSqft] = React.useState(initialSqft);
  const [scope, setScope] = React.useState<RepairScope>("medium");

  const handleQuickEstimateUse = (result: QuickEstimateResult) => {
    onEstimateComplete?.(result.total);
  };

  const handleCreateDetailed = (newSqft: number, newScope: RepairScope) => {
    setSqft(newSqft);
    setScope(newScope);
    setMode("detailed");
  };

  const handleDetailedEstimateUse = (total: number) => {
    onEstimateComplete?.(total);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Hammer className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-h3 font-bold text-foreground">Repair Estimator</h2>
            <p className="text-small text-muted-foreground">
              Build detailed rehab budgets for your investments
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as "quick" | "detailed")}>
          <TabsList>
            <TabsTrigger value="quick" className="gap-2">
              <Zap className="h-4 w-4" />
              Quick Estimate
            </TabsTrigger>
            <TabsTrigger value="detailed" className="gap-2">
              <ListChecks className="h-4 w-4" />
              Detailed Estimate
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {mode === "quick" ? (
        <QuickEstimate
          initialSqft={sqft}
          initialScope={scope}
          onUseEstimate={handleQuickEstimateUse}
          onCreateDetailed={handleCreateDetailed}
        />
      ) : (
        <DetailedEstimate
          initialSqft={sqft}
          onUseEstimate={handleDetailedEstimateUse}
        />
      )}
    </div>
  );
}
