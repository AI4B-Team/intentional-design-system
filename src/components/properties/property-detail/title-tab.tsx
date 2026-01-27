import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  DollarSign,
  Calculator,
  Download,
  ExternalLink,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  usePropertyTitleReport,
  useCreateTitleReport,
  useUpdateTitleReport,
  calculateTitleMetrics,
  createDefaultSummary,
  type TitleReportSummary,
  type Mortgage,
  type Lien,
  type Judgment,
} from "@/hooks/useTitleReports";

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
  const createReport = useCreateTitleReport();
  const updateReport = useUpdateTitleReport();

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingSummary, setEditingSummary] = useState<TitleReportSummary | null>(null);

  // Mortgage editing
  const [editingMortgage, setEditingMortgage] = useState<Mortgage | null>(null);
  const [showMortgageModal, setShowMortgageModal] = useState(false);

  // Lien editing
  const [editingLien, setEditingLien] = useState<Lien | null>(null);
  const [showLienModal, setShowLienModal] = useState(false);

  // Judgment editing
  const [editingJudgment, setEditingJudgment] = useState<Judgment | null>(null);
  const [showJudgmentModal, setShowJudgmentModal] = useState(false);

  const handleStartManualEntry = () => {
    setEditingSummary(titleReport?.summary as TitleReportSummary || createDefaultSummary());
    setShowEntryModal(true);
  };

  const handleSaveReport = async () => {
    if (!editingSummary) return;

    // Recalculate totals
    const totalLiens = editingSummary.liens
      .filter((l) => l.status === "active")
      .reduce((sum, l) => sum + (l.amount || 0), 0);
    const totalJudgments = editingSummary.judgments.reduce((sum, j) => sum + (j.amount || 0), 0);
    const taxDelinquent = editingSummary.tax_status?.delinquent_amount || 0;
    const hoaDelinquent = editingSummary.hoa_status?.delinquent_amount || 0;
    const totalMortgageDebt = editingSummary.mortgages.reduce((sum, m) => sum + (m.estimated_balance || 0), 0);

    editingSummary.total_liens_amount = totalLiens + totalJudgments + taxDelinquent + hoaDelinquent;
    editingSummary.estimated_equity = (propertyValue || 0) - totalMortgageDebt - editingSummary.total_liens_amount;

    // Determine title status based on issues
    if (editingSummary.total_liens_amount > 50000 || editingSummary.judgments.length > 0) {
      editingSummary.title_status = "major_issues";
    } else if (editingSummary.total_liens_amount > 0 || !editingSummary.tax_status.current_year_paid) {
      editingSummary.title_status = "issues_found";
    } else {
      editingSummary.title_status = "clear";
    }

    // Generate flags
    editingSummary.flags = [];
    if (editingSummary.liens.some((l) => l.type === "federal" && l.status === "active")) {
      editingSummary.flags.push("Federal tax lien detected");
    }
    if (editingSummary.liens.filter((l) => l.type === "mechanic" && l.status === "active").length > 1) {
      editingSummary.flags.push("Multiple mechanic's liens");
    }
    if (editingSummary.judgments.some((j) => j.amount > 50000)) {
      editingSummary.flags.push("Judgment over $50K");
    }
    if (!editingSummary.tax_status.current_year_paid) {
      editingSummary.flags.push("Property taxes delinquent");
    }
    if (editingSummary.hoa_status.has_hoa && !editingSummary.hoa_status.current) {
      editingSummary.flags.push("HOA dues delinquent");
    }

    if (titleReport) {
      await updateReport.mutateAsync({
        id: titleReport.id,
        updates: { summary: editingSummary, received_at: new Date().toISOString() },
      });
    } else {
      await createReport.mutateAsync({
        property_id: propertyId,
        report_type: "preliminary",
        provider: "manual",
        summary: editingSummary,
      });
    }

    setShowEntryModal(false);
    setEditingSummary(null);
  };

  // Add/Edit mortgage
  const handleSaveMortgage = () => {
    if (!editingMortgage || !editingSummary) return;
    const existingIndex = editingSummary.mortgages.findIndex(
      (m) => m.position === editingMortgage.position && m.lender === editingMortgage.lender
    );
    if (existingIndex >= 0) {
      editingSummary.mortgages[existingIndex] = editingMortgage;
    } else {
      editingSummary.mortgages.push(editingMortgage);
    }
    setEditingSummary({ ...editingSummary });
    setShowMortgageModal(false);
    setEditingMortgage(null);
  };

  // Add/Edit lien
  const handleSaveLien = () => {
    if (!editingLien || !editingSummary) return;
    const existingIndex = editingSummary.liens.findIndex(
      (l) => l.creditor === editingLien.creditor && l.recording_date === editingLien.recording_date
    );
    if (existingIndex >= 0) {
      editingSummary.liens[existingIndex] = editingLien;
    } else {
      editingSummary.liens.push(editingLien);
    }
    setEditingSummary({ ...editingSummary });
    setShowLienModal(false);
    setEditingLien(null);
  };

  // Add/Edit judgment
  const handleSaveJudgment = () => {
    if (!editingJudgment || !editingSummary) return;
    const existingIndex = editingSummary.judgments.findIndex(
      (j) => j.case_number === editingJudgment.case_number
    );
    if (existingIndex >= 0) {
      editingSummary.judgments[existingIndex] = editingJudgment;
    } else {
      editingSummary.judgments.push(editingJudgment);
    }
    setEditingSummary({ ...editingSummary });
    setShowJudgmentModal(false);
    setEditingJudgment(null);
  };

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
            <Button variant="primary" icon={<FileText />} onClick={() => {}}>
              Order Title Report
            </Button>
            <Button variant="secondary" icon={<Edit />} onClick={handleStartManualEntry}>
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
    );
  }

  // Report exists - show full details
  const summary = titleReport.summary as TitleReportSummary | null;
  const status = summary?.title_status || "clear";
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const metrics = calculateTitleMetrics(summary, propertyValue);

  return (
    <div className="space-y-lg">
      {/* Status Header */}
      <Card variant="default" className={cn("border-2", config.color)} padding="md">
        <div className="flex items-center justify-between">
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
            <Button variant="secondary" size="sm" icon={<Edit />} onClick={handleStartManualEntry}>
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
              <span className="text-small font-medium text-content capitalize">{summary?.vesting_type || "—"}</span>
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

      {/* Manual Entry Modal */}
      <Dialog open={showEntryModal} onOpenChange={setShowEntryModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enter Title Information</DialogTitle>
            <DialogDescription>
              Manually enter title details for {propertyAddress}
            </DialogDescription>
          </DialogHeader>

          {editingSummary && (
            <div className="space-y-6">
              {/* Title Status */}
              <div>
                <Label>Title Status</Label>
                <Select
                  value={editingSummary.title_status}
                  onValueChange={(v) => setEditingSummary({ ...editingSummary, title_status: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear">Clear - No Issues</SelectItem>
                    <SelectItem value="issues_found">Issues Found</SelectItem>
                    <SelectItem value="major_issues">Major Issues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ownership */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Owner of Record</Label>
                  <Input
                    value={editingSummary.owner_of_record}
                    onChange={(v) => setEditingSummary({ ...editingSummary, owner_of_record: v })}
                    placeholder="John & Jane Doe"
                  />
                </div>
                <div>
                  <Label>Vesting Type</Label>
                  <Select
                    value={editingSummary.vesting_type}
                    onValueChange={(v) => setEditingSummary({ ...editingSummary, vesting_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="joint_tenants">Joint Tenants</SelectItem>
                      <SelectItem value="tenants_in_common">Tenants in Common</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="trust">Trust</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Legal Description */}
              <div>
                <Label>Legal Description</Label>
                <Textarea
                  value={editingSummary.legal_description}
                  onChange={(e) => setEditingSummary({ ...editingSummary, legal_description: e.target.value })}
                  placeholder="Lot 5, Block 2, Sunrise Estates..."
                  rows={2}
                />
              </div>

              {/* Mortgages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Mortgages</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Plus />}
                    onClick={() => {
                      setEditingMortgage({
                        lender: "",
                        original_amount: 0,
                        estimated_balance: 0,
                        recording_date: "",
                        position: "first",
                      });
                      setShowMortgageModal(true);
                    }}
                  >
                    Add
                  </Button>
                </div>
                {editingSummary.mortgages.length > 0 ? (
                  <div className="space-y-2">
                    {editingSummary.mortgages.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-surface-secondary rounded-small">
                        <div>
                          <span className="text-small font-medium">{m.position} - {m.lender}</span>
                          <span className="text-small text-content-secondary ml-2">{formatCurrency(m.estimated_balance)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 />}
                          onClick={() => {
                            editingSummary.mortgages.splice(i, 1);
                            setEditingSummary({ ...editingSummary });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-small text-content-tertiary">No mortgages added</p>
                )}
              </div>

              {/* Liens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Liens</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Plus />}
                    onClick={() => {
                      setEditingLien({
                        type: "tax",
                        creditor: "",
                        amount: 0,
                        recording_date: "",
                        status: "active",
                      });
                      setShowLienModal(true);
                    }}
                  >
                    Add
                  </Button>
                </div>
                {editingSummary.liens.length > 0 ? (
                  <div className="space-y-2">
                    {editingSummary.liens.map((l, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-surface-secondary rounded-small">
                        <div>
                          <Badge className={cn(lienTypeColors[l.type])} size="sm">{lienTypeLabels[l.type]}</Badge>
                          <span className="text-small ml-2">{l.creditor}</span>
                          <span className="text-small text-content-secondary ml-2">{formatCurrency(l.amount)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 />}
                          onClick={() => {
                            editingSummary.liens.splice(i, 1);
                            setEditingSummary({ ...editingSummary });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-small text-content-tertiary">No liens added</p>
                )}
              </div>

              {/* Tax Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Year Taxes Paid?</Label>
                  <Select
                    value={editingSummary.tax_status.current_year_paid ? "yes" : "no"}
                    onValueChange={(v) =>
                      setEditingSummary({
                        ...editingSummary,
                        tax_status: { ...editingSummary.tax_status, current_year_paid: v === "yes" },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tax Delinquent Amount</Label>
                  <Input
                    type="number"
                    value={editingSummary.tax_status.delinquent_amount?.toString() || "0"}
                    onChange={(v) =>
                      setEditingSummary({
                        ...editingSummary,
                        tax_status: { ...editingSummary.tax_status, delinquent_amount: parseFloat(v) || 0 },
                      })
                    }
                  />
                </div>
              </div>

              {/* HOA Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Has HOA?</Label>
                  <Select
                    value={editingSummary.hoa_status.has_hoa ? "yes" : "no"}
                    onValueChange={(v) =>
                      setEditingSummary({
                        ...editingSummary,
                        hoa_status: { ...editingSummary.hoa_status, has_hoa: v === "yes" },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editingSummary.hoa_status.has_hoa && (
                  <>
                    <div>
                      <Label>HOA Current?</Label>
                      <Select
                        value={editingSummary.hoa_status.current ? "yes" : "no"}
                        onValueChange={(v) =>
                          setEditingSummary({
                            ...editingSummary,
                            hoa_status: { ...editingSummary.hoa_status, current: v === "yes" },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>HOA Delinquent Amount</Label>
                      <Input
                        type="number"
                        value={editingSummary.hoa_status.delinquent_amount?.toString() || "0"}
                        onChange={(v) =>
                          setEditingSummary({
                            ...editingSummary,
                            hoa_status: { ...editingSummary.hoa_status, delinquent_amount: parseFloat(v) || 0 },
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEntryModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveReport}
              disabled={createReport.isPending || updateReport.isPending}
            >
              Save Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Mortgage Modal */}
      <Dialog open={showMortgageModal} onOpenChange={setShowMortgageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Mortgage</DialogTitle>
          </DialogHeader>
          {editingMortgage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Position</Label>
                  <Select
                    value={editingMortgage.position}
                    onValueChange={(v) => setEditingMortgage({ ...editingMortgage, position: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First</SelectItem>
                      <SelectItem value="second">Second</SelectItem>
                      <SelectItem value="third">Third</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lender</Label>
                  <Input
                    value={editingMortgage.lender}
                    onChange={(v) => setEditingMortgage({ ...editingMortgage, lender: v })}
                    placeholder="Bank of America"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Original Amount</Label>
                  <Input
                    type="number"
                    value={editingMortgage.original_amount?.toString() || ""}
                    onChange={(v) => setEditingMortgage({ ...editingMortgage, original_amount: parseFloat(v) || 0 })}
                  />
                </div>
                <div>
                  <Label>Estimated Balance</Label>
                  <Input
                    type="number"
                    value={editingMortgage.estimated_balance?.toString() || ""}
                    onChange={(v) => setEditingMortgage({ ...editingMortgage, estimated_balance: parseFloat(v) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label>Recording Date</Label>
                <Input
                  type="date"
                  value={editingMortgage.recording_date}
                  onChange={(v) => setEditingMortgage({ ...editingMortgage, recording_date: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowMortgageModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveMortgage}>Add Mortgage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lien Modal */}
      <Dialog open={showLienModal} onOpenChange={setShowLienModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lien</DialogTitle>
          </DialogHeader>
          {editingLien && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lien Type</Label>
                  <Select
                    value={editingLien.type}
                    onValueChange={(v) => setEditingLien({ ...editingLien, type: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tax">Tax Lien</SelectItem>
                      <SelectItem value="mechanic">Mechanic's Lien</SelectItem>
                      <SelectItem value="hoa">HOA Lien</SelectItem>
                      <SelectItem value="judgment">Judgment Lien</SelectItem>
                      <SelectItem value="federal">Federal Tax Lien</SelectItem>
                      <SelectItem value="state">State Tax Lien</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Creditor</Label>
                  <Input
                    value={editingLien.creditor}
                    onChange={(v) => setEditingLien({ ...editingLien, creditor: v })}
                    placeholder="IRS, County, etc."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={editingLien.amount?.toString() || ""}
                    onChange={(v) => setEditingLien({ ...editingLien, amount: parseFloat(v) || 0 })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editingLien.status}
                    onValueChange={(v) => setEditingLien({ ...editingLien, status: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="released">Released</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Recording Date</Label>
                <Input
                  type="date"
                  value={editingLien.recording_date}
                  onChange={(v) => setEditingLien({ ...editingLien, recording_date: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowLienModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveLien}>Add Lien</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
