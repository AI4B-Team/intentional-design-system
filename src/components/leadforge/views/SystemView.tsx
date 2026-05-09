import * as React from "react";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function SystemView() {
  return (
    <div className="pt-6">
      <Card className="p-12 text-center">
        <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="font-semibold text-foreground">System — Trust Scores · Coverage · Job Queue</h3>
        <p className="text-sm text-muted-foreground mt-1">Engine telemetry — coming next.</p>
      </Card>
    </div>
  );
}
