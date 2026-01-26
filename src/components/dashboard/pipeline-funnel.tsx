import * as React from "react";
import { cn } from "@/lib/utils";

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  value: string;
  conversionRate?: number;
}

interface PipelineFunnelProps {
  stages: PipelineStage[];
  className?: string;
}

export function PipelineFunnel({ stages, className }: PipelineFunnelProps) {
  const maxCount = Math.max(...stages.map((s) => s.count));

  return (
    <div className={cn("space-y-3", className)}>
      {stages.map((stage, index) => {
        const widthPercent = (stage.count / maxCount) * 100;
        
        return (
          <div key={stage.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            {/* Stage Bar */}
            <div
              className="relative h-14 rounded-medium overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer group"
              style={{ width: `${Math.max(widthPercent, 40)}%` }}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-light opacity-90 group-hover:opacity-100 transition-opacity" />
              
              {/* Content */}
              <div className="relative h-full flex items-center justify-between px-4 text-white">
                <span className="text-small font-medium truncate">{stage.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-h2 font-bold tabular-nums">{stage.count}</span>
                  <span className="text-small opacity-80">{stage.value}</span>
                </div>
              </div>
            </div>

            {/* Conversion Rate Arrow */}
            {stage.conversionRate !== undefined && index < stages.length - 1 && (
              <div className="flex items-center gap-2 py-1 pl-4">
                <div className="w-px h-4 bg-border" />
                <svg
                  className="h-3 w-3 text-content-tertiary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                <span className="text-tiny text-content-tertiary">
                  {stage.conversionRate}% conversion
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Alternative Vertical Pipeline
interface VerticalPipelineProps {
  stages: PipelineStage[];
  activeStage?: string;
  className?: string;
}

export function VerticalPipeline({ stages, activeStage, className }: VerticalPipelineProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Connecting Line */}
      <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border" />

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isActive = stage.id === activeStage;
          
          return (
            <div
              key={stage.id}
              className="relative flex items-center gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Node */}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  isActive
                    ? "border-brand-accent bg-brand-accent text-white"
                    : "border-border bg-white text-content-secondary"
                )}
              >
                <span className="text-small font-semibold">{index + 1}</span>
              </div>

              {/* Content */}
              <div
                className={cn(
                  "flex-1 flex items-center justify-between p-3 rounded-medium transition-all",
                  isActive ? "bg-brand-accent/5 border border-brand-accent/20" : "hover:bg-surface-secondary"
                )}
              >
                <div>
                  <div className="text-body font-medium text-content">{stage.name}</div>
                  <div className="text-small text-content-secondary">{stage.value}</div>
                </div>
                <div className="text-h2 font-bold text-content tabular-nums">
                  {stage.count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
