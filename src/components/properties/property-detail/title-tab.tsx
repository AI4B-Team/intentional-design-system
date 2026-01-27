import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FileText,
  Edit,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  DollarSign,
  Calculator,
  Download,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  usePropertyTitleReport,
  calculateTitleMetrics,
  type TitleReportSummary,
} from "@/hooks/useTitleReports";
import { OrderTitleModal } from "./order-title-modal";
import { ManualTitleEntryModal } from "./manual-title-entry-modal";

interface TitleTabProps {
  propertyId: string;
  propertyValue: number | null;
  propertyAddress: string;
}

const lienTypeLabels: Record<string, string> = {
  tax: "Tax Lien",
  mechanic: "Mechanic's Lien",
  hoa: "HOA Lien",
  judgment: "Judgment Lien",
  federal: "Federal Tax Lien",
  state: "State Tax Lien",
  other: "Other",
};

const lienTypeColors: Record<string, string> = {
  tax: "bg-warning/10 text-warning",
  mechanic: "bg-info/10 text-info",
  hoa: "bg-muted text-muted-foreground",
  judgment: "bg-destructive/10 text-destructive",
  federal: "bg-destructive/10 text-destructive",
  state: "bg-destructive/10 text-destructive",
  other: "bg-muted text-muted-foreground",
};

const statusConfig = {
  clear: {
    label: "Clear Title",
    icon: ShieldCheck,
    color: "bg-success/10 text-success border-success/20",
    description: "No title issues found - ready to proceed",
  },
  issues_found: {
    label: "Issues Found",
    icon: ShieldAlert,
    color: "bg-warning/10 text-warning border-warning/20",
    description: "Some issues require attention before closing",
  },
  major_issues: {
    label: "Major Issues",
    icon: ShieldX,
    color: "bg-destructive/10 text-destructive border-destructive/20",
    description: "Significant title problems - proceed with caution",
  },
};

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function TitleTab({ propertyId, propertyValue, propertyAddress }: TitleTabProps) {
  const { data: titleReport, isLoading } = usePropertyTitleReport(propertyId);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-lg">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // No report - show empty state
  if (!titleReport) {
    return (
      <>
        <div className="max-w-2xl mx-auto py-12">
          <Card variant="default" padding="lg" className="text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-h2 font-semibold text-content mb-2">Title Intelligence</h2>
            <p className="text-body text-content-secondary mb-6 max-w-md mx-auto">
              Understand the property's title status before making an offer. Identify liens, mortgages,
              judgments, and other encumbrances that could affect your deal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto">
              <Button variant="primary" icon={<FileText />} onClick={() => setShowOrderModal(true)}>
                Order Title Report
              </Button>
              <Button variant="secondary" icon={<Edit />} onClick={() => setShowEntryModal(true)}>
                Enter Manually
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border-subtle">
              <h3 className="text-small font-medium text-content mb-4">What you'll discover:</h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                  <span className="text-small text-content-secondary">Current owner & vesting</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                  <span className="text-small text-content-secondary">Existing mortgages</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                  <span className="text-small text-content-secondary">Liens & judgments</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                  <span className="text-small text-content-secondary">Tax status</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Modals */}
        <OrderTitleModal
          open={showOrderModal}
          onOpenChange={setShowOrderModal}
          propertyId={propertyId}
          propertyAddress={propertyAddress}
        />
        <ManualTitleEntryModal
          open={showEntryModal}
          onOpenChange={setShowEntryModal}
          propertyId={propertyId}
          propertyAddress={propertyAddress}
          propertyValue={propertyValue}
        />
      </>
    );
  }

  // Report exists - show full details
  const summary = titleReport.summary as TitleReportSummary | null;
  const status = summary?.title_status || "clear";
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const metrics = calculateTitleMetrics(summary, propertyValue);

  return (
    <>
      <div className="space-y-lg">
        {/* Status Header */}
        <Card variant="default" className={cn("border-2", config.color)} padding="md">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={cn("h-14 w-14 rounded-full flex items-center justify-center", config.color)}>
                <StatusIcon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-h2 font-semibold text-content">{config.label}</h2>
                <p className="text-body text-content-secondary">{config.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={<Edit />} onClick={() => setShowEntryModal(true)}>
                Edit Report
              </Button>
              {titleReport.report_url && (
                <Button variant="secondary" size="sm" icon={<Download />}>
                  Download
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Flags/Warnings */}
        {summary?.flags && summary.flags.length > 0 && (
          <Card variant="default" padding="md" className="bg-warning/5 border-warning/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="text-body font-semibold text-warning">Warnings Detected</h3>
            </div>
            <div className="space-y-2">
              {summary.flags.map((flag, index) => (
                <div key={index} className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-warning" />
                  <span className="text-small text-content">{flag}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* Ownership Section */}
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-content-tertiary" />
              <h3 className="text-h3 font-semibold text-content">Ownership</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-small text-content-secondary">Owner of Record</span>
                <span className="text-small font-medium text-content">{summary?.owner_of_record || "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-small text-content-secondary">Vesting Type</span>
                <span className="text-small font-medium text-content capitalize">{summary?.vesting_type?.replace(/_/g, " ") || "—"}</span>
              </div>
              {summary?.legal_description && (
                <div className="pt-2">
                  <span className="text-small text-content-secondary block mb-1">Legal Description</span>
                  <span className="text-small text-content">{summary.legal_description}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Cost to Clear Calculator */}
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-content-tertiary" />
              <h3 className="text-h3 font-semibold text-content">Cost to Clear</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-small text-content-secondary">Property Value</span>
                <span className="text-small font-medium text-content">{formatCurrency(propertyValue)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-small text-content-secondary">Total Mortgage Debt</span>
                <span className="text-small font-medium text-destructive">-{formatCurrency(metrics.totalMortgageDebt)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-small text-content-secondary">Active Liens</span>
                <span className="text-small font-medium text-destructive">-{formatCurrency(metrics.totalLiens)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-small text-content-secondary">Judgments</span>
                <span className="text-small font-medium text-destructive">-{formatCurrency(metrics.totalJudgments)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-small text-content-secondary">Tax/HOA Delinquent</span>
                <span className="text-small font-medium text-destructive">
                  -{formatCurrency((summary?.tax_status?.delinquent_amount || 0) + (summary?.hoa_status?.delinquent_amount || 0))}
                </span>
              </div>
              <div className="flex justify-between py-3 bg-brand/5 rounded-small px-2 -mx-2">
                <span className="text-body font-semibold text-content">Estimated Equity</span>
                <span className={cn("text-body font-bold", metrics.estimatedEquity >= 0 ? "text-success" : "text-destructive")}>
                  {formatCurrency(metrics.estimatedEquity)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Mortgages Section */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-content-tertiary" />
              <h3 className="text-h3 font-semibold text-content">Mortgages</h3>
            </div>
            <span className="text-small text-content-secondary">
              Total: {formatCurrency(metrics.totalMortgageDebt)}
            </span>
          </div>

          {summary?.mortgages && summary.mortgages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Lender</TableHead>
                  <TableHead className="text-right">Original Amount</TableHead>
                  <TableHead className="text-right">Est. Balance</TableHead>
                  <TableHead>Recording Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.mortgages.map((mortgage, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant="secondary" size="sm" className="capitalize">
                        {mortgage.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{mortgage.lender}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(mortgage.original_amount)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatCurrency(mortgage.estimated_balance)}</TableCell>
                    <TableCell className="text-content-secondary">
                      {mortgage.recording_date ? format(parseISO(mortgage.recording_date), "MMM d, yyyy") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-small text-content-tertiary text-center py-4">No mortgages recorded</p>
          )}
        </Card>

        {/* Liens Section */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-content-tertiary" />
              <h3 className="text-h3 font-semibold text-content">Liens</h3>
            </div>
            <span className="text-small text-content-secondary">
              Active: {formatCurrency(metrics.totalLiens)}
            </span>
          </div>

          {summary?.liens && summary.liens.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Creditor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.liens.map((lien, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge className={cn(lienTypeColors[lien.type])} size="sm">
                        {lienTypeLabels[lien.type] || lien.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{lien.creditor}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatCurrency(lien.amount)}</TableCell>
                    <TableCell className="text-content-secondary">
                      {lien.recording_date ? format(parseISO(lien.recording_date), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        className={lien.status === "active" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}
                      >
                        {lien.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-small text-content-tertiary text-center py-4">No liens found</p>
          )}
        </Card>

        {/* Judgments Section */}
        {summary?.judgments && summary.judgments.length > 0 && (
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-content-tertiary" />
              <h3 className="text-h3 font-semibold text-content">Judgments</h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plaintiff</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.judgments.map((judgment, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{judgment.plaintiff}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-destructive">
                      {formatCurrency(judgment.amount)}
                    </TableCell>
                    <TableCell className="text-content-secondary">{judgment.case_number}</TableCell>
                    <TableCell className="text-content-secondary">
                      {judgment.date ? format(parseISO(judgment.date), "MMM d, yyyy") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Tax & HOA Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Tax Status */}
          <Card variant="default" padding="md">
            <h3 className="text-h3 font-semibold text-content mb-4">Tax Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-small text-content-secondary">Current Year Paid</span>
                {summary?.tax_status?.current_year_paid ? (
                  <Badge className="bg-success/10 text-success" size="sm">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Yes
                  </Badge>
                ) : (
                  <Badge className="bg-destructive/10 text-destructive" size="sm">
                    <XCircle className="h-3 w-3 mr-1" /> No
                  </Badge>
                )}
              </div>
              {summary?.tax_status?.delinquent_amount ? (
                <>
                  <div className="flex justify-between py-2 border-t border-border-subtle">
                    <span className="text-small text-content-secondary">Delinquent Amount</span>
                    <span className="text-small font-medium text-destructive">
                      {formatCurrency(summary.tax_status.delinquent_amount)}
                    </span>
                  </div>
                  {summary.tax_status.delinquent_years?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-small text-content-secondary">Delinquent Years</span>
                      <span className="text-small text-content">
                        {summary.tax_status.delinquent_years.join(", ")}
                      </span>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </Card>

          {/* HOA Status */}
          <Card variant="default" padding="md">
            <h3 className="text-h3 font-semibold text-content mb-4">HOA Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-small text-content-secondary">Has HOA</span>
                <Badge variant="secondary" size="sm">
                  {summary?.hoa_status?.has_hoa ? "Yes" : "No"}
                </Badge>
              </div>
              {summary?.hoa_status?.has_hoa && (
                <>
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                    <span className="text-small text-content-secondary">Status</span>
                    {summary.hoa_status.current ? (
                      <Badge className="bg-success/10 text-success" size="sm">Current</Badge>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive" size="sm">Delinquent</Badge>
                    )}
                  </div>
                  {!summary.hoa_status.current && summary.hoa_status.delinquent_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-small text-content-secondary">Amount Owed</span>
                      <span className="text-small font-medium text-destructive">
                        {formatCurrency(summary.hoa_status.delinquent_amount)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <OrderTitleModal
        open={showOrderModal}
        onOpenChange={setShowOrderModal}
        propertyId={propertyId}
        propertyAddress={propertyAddress}
        legalDescription={summary?.legal_description}
      />
      <ManualTitleEntryModal
        open={showEntryModal}
        onOpenChange={setShowEntryModal}
        propertyId={propertyId}
        propertyAddress={propertyAddress}
        propertyValue={propertyValue}
        existingReport={titleReport}
      />
    </>
  );
}
