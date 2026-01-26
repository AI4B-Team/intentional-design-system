import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";

interface Insight {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  description: string;
  metric?: string;
  link?: string;
}

interface AIInsightsCardProps {
  insights: Insight[];
  onInsightClick?: (insight: Insight) => void;
  className?: string;
}

function getInsightConfig(type: Insight["type"]) {
  switch (type) {
    case "success":
      return {
        icon: TrendingUp,
        label: "Big Win",
        bgColor: "bg-success/5",
        borderColor: "border-success/20",
        iconColor: "text-success",
        badgeVariant: "success" as const,
      };
    case "warning":
      return {
        icon: AlertTriangle,
        label: "Needs Attention",
        bgColor: "bg-warning/5",
        borderColor: "border-warning/20",
        iconColor: "text-warning",
        badgeVariant: "warning" as const,
      };
    default:
      return {
        icon: Lightbulb,
        label: "Insight",
        bgColor: "bg-info/5",
        borderColor: "border-info/20",
        iconColor: "text-info",
        badgeVariant: "info" as const,
      };
  }
}

export function AIInsightsCard({ insights, onInsightClick, className }: AIInsightsCardProps) {
  return (
    <Card variant="default" padding="md" className={className}>
      <div className="flex items-center gap-2 mb-md">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-accent to-brand-accent/70 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-h3 font-medium text-content">AI Insights</h3>
          <p className="text-tiny text-content-secondary">Automatically generated from your data</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const config = getInsightConfig(insight.type);
          const Icon = config.icon;

          return (
            <button
              key={insight.id}
              onClick={() => onInsightClick?.(insight)}
              className={cn(
                "w-full text-left p-4 rounded-medium border transition-all",
                config.bgColor,
                config.borderColor,
                "hover:shadow-sm hover:-translate-y-0.5"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5", config.iconColor)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-body font-medium text-content">
                      {insight.title}
                    </span>
                    <Badge variant={config.badgeVariant} size="sm">
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-small text-content-secondary">
                    {insight.description}
                  </p>
                  {insight.metric && (
                    <p className="text-small font-medium text-content mt-2">
                      {insight.metric}
                    </p>
                  )}
                </div>
                {insight.link && (
                  <ArrowRight className="h-4 w-4 text-content-tertiary" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
