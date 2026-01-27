import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FileText,
  Edit,
  RefreshCw,
  ExternalLink,
  User,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  usePropertyTitleReport,
  calculateTitleMetrics,
  type TitleReportSummary,
} from "@/hooks/useTitleReports";

interface TitleIntelligenceCardProps {
  propertyId: string;
  propertyValue: number | null;
  onOrderReport: () => void;
  onEnterManually: () => void;
  onViewReport: () => void;
}

const statusConfig = {
  clear: {
    label: "Clear",
    icon: ShieldCheck,
    color: "bg-success/10 text-success",
    description: "No title issues found",
  },
  issues_found: {
    label: "Issues Found",
    icon: ShieldAlert,
    color: "bg-warning/10 text-warning",
    description: "Some issues require attention",
  },
  major_issues: {
    label: "Major Issues",
    icon: ShieldX,
    color: "bg-destructive/10 text-destructive",
    description: "Significant title problems detected",
  },
};

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function TitleIntelligenceCard({
  propertyId,
  propertyValue,
  onOrderReport,
  onEnterManually,
  onViewReport,
}: TitleIntelligenceCardProps) {
  const { data: titleReport, isLoading } = usePropertyTitleReport(propertyId);

  if (isLoading) {
    return (
      <Card variant="default" padding="md">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-medium" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-20" />
      </Card>
    );
  }

  // No report exists
  if (!titleReport) {
    return (
      <Card variant="default" padding="md">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-medium bg-muted flex items-center justify-center">
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-body font-semibold text-content">Title Intelligence</h3>
            <p className="text-small text-content-secondary">Status: Unknown</p>
          </div>
        </div>

        <p className="text-small text-content-tertiary mb-4">
          Get title information to understand liens, mortgages, and ownership before making an offer.
        </p>

        <div className="flex gap-2">
          <Button variant="primary" size="sm" icon={<FileText />} onClick={onOrderReport} className="flex-1">
            Order Report
          </Button>
          <Button variant="secondary" size="sm" icon={<Edit />} onClick={onEnterManually} className="flex-1">
            Enter Manually
          </Button>
        </div>
      </Card>
    );
  }

  // Report exists - show summary
  const summary = titleReport.summary as TitleReportSummary | null;
  const status = summary?.title_status || "clear";
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const metrics = calculateTitleMetrics(summary, propertyValue);

  const firstMortgage = summary?.mortgages?.find((m) => m.position === "first");
  const activeLiensCount = summary?.liens?.filter((l) => l.status === "active").length || 0;
  const hasFlags = summary?.flags && summary.flags.length > 0;

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-medium flex items-center justify-center", config.color)}>
            <StatusIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-body font-semibold text-content">Title Intelligence</h3>
            <Badge className={cn("capitalize", config.color)} size="sm">
              {config.label}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw />} onClick={onOrderReport}>
          Update
        </Button>
      </div>

      <div className="space-y-3 mb-4">
        {/* Owner of Record */}
        {summary?.owner_of_record && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-content-tertiary" />
            <span className="text-small text-content">{summary.owner_of_record}</span>
          </div>
        )}

        {/* First Mortgage */}
        {firstMortgage && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-content-tertiary" />
            <span className="text-small text-content">
              1st Mortgage: {formatCurrency(firstMortgage.estimated_balance)} to {firstMortgage.lender}
            </span>
          </div>
        )}

        {/* Total Liens */}
        <div className="flex items-center justify-between py-2 px-3 bg-surface-secondary rounded-small">
          <span className="text-small text-content-secondary">Total Liens</span>
          <span className="text-small font-medium text-content">
            {formatCurrency(metrics.totalLiens)} ({activeLiensCount} liens)
          </span>
        </div>

        {/* Estimated Equity */}
        <div className="flex items-center justify-between py-2 px-3 bg-brand/5 rounded-small">
          <span className="text-small text-content-secondary">Est. Equity</span>
          <span className={cn("text-small font-semibold", metrics.estimatedEquity >= 0 ? "text-success" : "text-destructive")}>
            {formatCurrency(metrics.estimatedEquity)}
          </span>
        </div>

        {/* Flags */}
        {hasFlags && (
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-small font-medium">{summary!.flags.length} warning(s) detected</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <span className="text-tiny text-content-tertiary">
          Updated {format(parseISO(titleReport.updated_at), "MMM d, yyyy")}
        </span>
        <Button variant="secondary" size="sm" icon={<ExternalLink />} onClick={onViewReport}>
          View Full Report
        </Button>
      </div>
    </Card>
  );
}
