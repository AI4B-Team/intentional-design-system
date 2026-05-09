import * as React from "react";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";

export function ActionsView() {
  return (
    <div className="pt-6">
      <Card className="p-12 text-center">
        <Send className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="font-semibold text-foreground">Actions — Campaigns · Offers · Action Plan</h3>
        <p className="text-sm text-muted-foreground mt-1">Skip Trace, Direct Mail, GHL Push — coming next.</p>
      </Card>
    </div>
  );
}
