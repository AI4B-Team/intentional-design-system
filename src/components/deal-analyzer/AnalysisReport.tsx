import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Percent,
  Home,
  BarChart3,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Building,
  Calendar,
  Target,
} from "lucide-react";
import { AnalysisReport as ReportType, CalculatorType, CALCULATOR_OPTIONS } from "./types";
import { cn } from "@/lib/utils";

interface AnalysisReportProps {
  report: ReportType;
  address: string;
  onNewAnalysis: () => void;
}

function formatCurrency(value: number | undefined): string {
  if (value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | undefined): string {
  if (value === undefined) return "—";
  return `${value.toFixed(1)}%`;
}

const verdictConfig = {
  strong: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "Strong Deal" },
  moderate: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle, label: "Moderate Deal" },
  weak: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: TrendingDown, label: "Weak Deal" },
  pass: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle, label: "Pass" },
};

const riskColors = {
  Low: "text-emerald-600",
  Medium: "text-amber-600",
  High: "text-red-600",
};

export function AnalysisReportComponent({ report, address, onNewAnalysis }: AnalysisReportProps) {
  const verdict = verdictConfig[report.verdict];
  const VerdictIcon = verdict.icon;
  const calculatorInfo = CALCULATOR_OPTIONS.find((c) => c.id === report.calculator);

  // Determine which metrics to show based on calculator type
  const getMetrics = () => {
    const baseMetrics = [
      { label: "Max Offer", value: formatCurrency(report.maxOffer), icon: Target },
      { label: "Est. Profit", value: formatCurrency(report.estimatedProfit), icon: DollarSign, highlight: true },
      { label: "ROI", value: formatPercent(report.roi), icon: Percent },
    ];

    switch (report.calculator) {
      case "wholesale":
        return [
          { label: "Max Offer (70%)", value: formatCurrency(report.maxOffer), icon: Target },
          { label: "Assignment Fee", value: formatCurrency(report.assignmentFee), icon: DollarSign, highlight: true },
          { label: "Buyer ROI", value: formatPercent(report.roi), icon: Percent },
        ];
      case "rental":
        return [
          { label: "Monthly Cash Flow", value: formatCurrency(report.monthlyCashFlow), icon: DollarSign, highlight: true },
          { label: "Cap Rate", value: formatPercent(report.capRate), icon: Percent },
          { label: "Cash on Cash", value: formatPercent(report.cashOnCash), icon: TrendingUp },
        ];
      case "brrrr":
        return [
          { label: "Cash Out Refi", value: formatCurrency(report.cashOutRefi), icon: RefreshCw, highlight: true },
          { label: "Monthly Cash Flow", value: formatCurrency(report.monthlyCashFlow), icon: DollarSign },
          { label: "Cash on Cash", value: formatPercent(report.cashOnCash), icon: Percent },
        ];
      case "str":
        return [
          { label: "Monthly Revenue", value: formatCurrency(report.strRevenue), icon: DollarSign, highlight: true },
          { label: "Occupancy Rate", value: formatPercent(report.occupancyRate), icon: Calendar },
          { label: "Cash on Cash", value: formatPercent(report.cashOnCash), icon: Percent },
        ];
      default:
        return baseMetrics;
    }
  };

  const metrics = getMetrics();

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-br from-surface-secondary to-surface-tertiary">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" size="sm" className="capitalize">
                {calculatorInfo?.name || report.calculator}
              </Badge>
              <Badge className={cn("border", verdict.color)}>
                <VerdictIcon className="h-3 w-3 mr-1" />
                {verdict.label}
              </Badge>
            </div>
            
            <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              {address}
            </h2>
            
            <p className="text-muted-foreground text-small">{report.summary}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button variant="outline" size="sm" icon={<Share2 className="h-4 w-4" />}>
              Share
            </Button>
          </div>
        </div>

        {/* Score */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{report.score}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
          <div className="flex-1 max-w-xs">
            <Progress value={report.score} className="h-3" />
          </div>
          <div className="text-small text-muted-foreground">
            <span className="font-medium">{report.confidence}%</span> confidence
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, i) => (
          <Card key={i} className={cn("p-4", metric.highlight && "bg-primary/5 border-primary/20")}>
            <div className="flex items-center gap-2 text-small text-muted-foreground mb-1">
              <metric.icon className="h-4 w-4" />
              {metric.label}
            </div>
            <div className={cn(
              "text-xl font-bold",
              metric.highlight ? "text-primary" : "text-foreground"
            )}>
              {metric.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Metrics Row */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-small">
          {report.arvEstimate && (
            <div>
              <span className="text-muted-foreground">ARV Estimate</span>
              <div className="font-semibold">{formatCurrency(report.arvEstimate)}</div>
            </div>
          )}
          {report.rentEstimate && (
            <div>
              <span className="text-muted-foreground">Rent Estimate</span>
              <div className="font-semibold">{formatCurrency(report.rentEstimate)}/mo</div>
            </div>
          )}
          {report.holdingCosts && (
            <div>
              <span className="text-muted-foreground">Holding Costs</span>
              <div className="font-semibold">{formatCurrency(report.holdingCosts)}</div>
            </div>
          )}
          {report.closingCosts && (
            <div>
              <span className="text-muted-foreground">Closing Costs</span>
              <div className="font-semibold">{formatCurrency(report.closingCosts)}</div>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Risk Level</span>
            <div className={cn("font-semibold", riskColors[report.riskLevel])}>
              {report.riskLevel}
            </div>
          </div>
          {report.compsUsed && (
            <div>
              <span className="text-muted-foreground">Comps Used</span>
              <div className="font-semibold">{report.compsUsed} properties</div>
            </div>
          )}
        </div>
      </Card>

      {/* Pros & Cons */}
      <Card className="p-5">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Pros
            </h4>
            <ul className="space-y-2">
              {report.pros.map((pro, i) => (
                <li key={i} className="text-small text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Cons
            </h4>
            <ul className="space-y-2">
              {report.cons.map((con, i) => (
                <li key={i} className="text-small text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* AI Recommendation */}
      <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Recommendation
        </h4>
        <p className="text-muted-foreground">{report.recommendation}</p>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <Button variant="outline" onClick={onNewAnalysis} icon={<RefreshCw className="h-4 w-4" />}>
          New Analysis
        </Button>
        <Button icon={<BarChart3 className="h-4 w-4" />}>
          Save to Deals
        </Button>
      </div>
    </div>
  );
}
