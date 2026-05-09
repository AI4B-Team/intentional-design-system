import * as React from "react";
import { Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

export function InPipelineBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-violet-50 text-violet-700 border-violet-200",
        className
      )}
    >
      <Workflow className="h-3 w-3" />
      In Pipeline
    </span>
  );
}
