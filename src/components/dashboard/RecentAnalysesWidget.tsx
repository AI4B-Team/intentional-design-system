import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Calculator, ArrowRight, Home } from "lucide-react";
import { useDealAnalyses, type DealAnalysis } from "@/hooks/useDealAnalyses";
import { cn } from "@/lib/utils";

function formatCurrency(value: number | null | undefined): string {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getAnalysisTypeLabel(type: DealAnalysis["analysis_type"]): string {
  switch (type) {
    case "flip":
      return "Fix & Flip";
    case "wholesale":
      return "Wholesale";
    case "rental":
      return "Rental";
    case "brrrr":
      return "BRRRR";
    case "creative":
      return "Creative";
    default:
      return type;
  }
}

function getROIColor(roi: number | null | undefined): string {
  if (!roi) return "text-muted-foreground";
  if (roi >= 20) return "text-success";
  if (roi >= 10) return "text-warning";
  return "text-destructive";
}

export function RecentAnalysesWidget() {
  const navigate = useNavigate();
  const { analyses, loading, fetchAnalyses } = useDealAnalyses();

  React.useEffect(() => {
    fetchAnalyses({ status: "active" });
  }, [fetchAnalyses]);

  const recentAnalyses = analyses.slice(0, 3);

  if (loading) {
    return (
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="text-h3 font-semibold text-foreground">Recent Analyses</h3>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </Card>
    );
  }

  if (recentAnalyses.length === 0) {
    return (
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="text-h3 font-semibold text-foreground">Recent Analyses</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="h-12 w-12 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-small text-muted-foreground mb-3">No analyses yet</p>
          <Button variant="secondary" size="sm" onClick={() => navigate("/calculators")}>
            Create Analysis
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="text-h3 font-semibold text-foreground">Recent Analyses</h3>
        </div>
      </div>

      <div className="space-y-3">
        {recentAnalyses.map((analysis) => (
          <button
            key={analysis.id}
            className="w-full p-3 rounded-md bg-surface-secondary hover:bg-surface-tertiary transition-colors text-left flex items-center justify-between gap-3"
            onClick={() => navigate(`/calculators?tab=deal&id=${analysis.id}`)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-small font-medium text-foreground truncate">
                  {analysis.address || analysis.name}
                </p>
                <p className="text-tiny text-muted-foreground">
                  ROI: <span className={cn("font-medium", getROIColor(analysis.roi_percentage))}>
                    {analysis.roi_percentage?.toFixed(1) || 0}%
                  </span>
                  {" | "}
                  Profit: {formatCurrency(analysis.net_profit)}
                </p>
              </div>
            </div>
            <Badge
              variant={analysis.roi_percentage && analysis.roi_percentage >= 20 ? "success" : "warning"}
              size="sm"
            >
              {getAnalysisTypeLabel(analysis.analysis_type)}
            </Badge>
          </button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-3"
        onClick={() => navigate("/calculators")}
      >
        View All
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </Card>
  );
}
