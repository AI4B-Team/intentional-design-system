import * as React from "react";
import { Card } from "@/components/ui/card";
import { Workflow } from "lucide-react";

export function PipelineView() {
  return (
    <div className="pt-6">
      <Card className="p-12 text-center">
        <Workflow className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="font-semibold text-foreground">Pipeline — Coverage · Map · Agent Tree</h3>
        <p className="text-sm text-muted-foreground mt-1">Coming next.</p>
      </Card>
    </div>
  );
}
