import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Phone,
  Send,
  Pencil,
  MoreHorizontal,
  Trash2,
  Users,
  CheckCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useDealSource,
  useUpdateDealSourceField,
  useDeleteDealSource,
  useLogDealSourceContact,
} from "@/hooks/useDealSourceDetail";
import {
  DealSourceOverviewTab,
  DealSourceDealsTab,
  DealSourceOutreachTab,
  DealSourcePerformanceTab,
  LendingTermsTab,
  ActiveLoansTab,
  LoanHistoryTab,
} from "@/components/deal-sources/deal-source-detail";
import type { LendingCriteria } from "@/hooks/useLenderLoans";

const typeColors: Record<string, string> = {
  agent: "bg-info/10 text-info",
  wholesaler: "bg-success/10 text-success",
  lender: "bg-brand-accent/10 text-brand-accent",
};

const statusColors: Record<string, string> = {
  cold: "bg-surface-secondary text-content-tertiary",
  contacted: "bg-info/10 text-info",
  responded: "bg-warning/10 text-warning",
  active: "bg-success/10 text-success",
  inactive: "bg-destructive/10 text-destructive",
};

function formatCurrency(value: number | null): string {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DealSourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: source, isLoading } = useDealSource(id);
  const updateField = useUpdateDealSourceField();
  const deleteDealSource = useDeleteDealSource();
  const logContact = useLogDealSourceContact();

  const handleStatusChange = async (newStatus: string) => {
    if (!source) return;
    await updateField.mutateAsync({ id: source.id, updates: { status: newStatus } });
  };

  const handleDelete = async () => {
    if (!source) return;
    await deleteDealSource.mutateAsync(source.id);
    navigate("/deal-sources");
  };

  const handleLogContact = async () => {
    if (!source) return;
    await logContact.mutateAsync({ sourceId: source.id, channel: "call" });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-lg">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (!source) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-h2 font-semibold text-content mb-2">Deal Source Not Found</h2>
          <p className="text-body text-content-secondary mb-4">
            This deal source may have been deleted or you don't have access.
          </p>
          <Button variant="secondary" onClick={() => navigate("/deal-sources")}>
            Back to Deal Sources
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const conversionRate =
    source.deals_sent && source.deals_sent > 0
      ? ((source.deals_closed || 0) / source.deals_sent) * 100
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-lg">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft />}
              onClick={() => navigate("/deal-sources")}
            >
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-h1 font-semibold text-content">{source.name}</h1>
                <Badge className={cn("capitalize", typeColors[source.type])} size="md">
                  {source.type}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Select value={source.status || "cold"} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-auto h-8 text-small">
                    <div className="flex items-center gap-2">
                      <span className="text-content-secondary">Status:</span>
                      <Badge className={cn("capitalize", statusColors[source.status || "cold"])} size="sm">
                        {source.status || "cold"}
                      </Badge>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {source.company && (
                  <span className="text-body text-content-secondary">{source.company}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              icon={<Phone />}
              onClick={handleLogContact}
              disabled={logContact.isPending}
            >
              Log Contact
            </Button>
            <Button variant="secondary" icon={<Send />} onClick={() => navigate("/properties")}>
              Send Deal
            </Button>
            <Button variant="secondary" icon={<Pencil />}>
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white">
                <DropdownMenuItem onClick={() => handleStatusChange("active")}>
                  Mark as Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("inactive")}>
                  Mark as Inactive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-medium bg-info/10 flex items-center justify-center flex-shrink-0">
                <Send className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-tiny text-content-tertiary uppercase tracking-wide">Deals Sent</p>
                <p className="text-h2 font-semibold tabular-nums">{source.deals_sent || 0}</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-tiny text-content-tertiary uppercase tracking-wide">Deals Closed</p>
                <p className="text-h2 font-semibold tabular-nums">{source.deals_closed || 0}</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-brand" />
              </div>
              <div>
                <p className="text-tiny text-content-tertiary uppercase tracking-wide">Conversion</p>
                <p className="text-h2 font-semibold tabular-nums">{conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-tiny text-content-tertiary uppercase tracking-wide">Total Profit</p>
                <p className="text-h2 font-semibold tabular-nums text-success">
                  {formatCurrency(Number(source.total_profit))}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {source.type === "lender" && (
              <>
                <TabsTrigger value="lending-terms">Lending Terms</TabsTrigger>
                <TabsTrigger value="active-loans">Active Loans</TabsTrigger>
                <TabsTrigger value="loan-history">Loan History</TabsTrigger>
              </>
            )}
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="outreach">Outreach</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <Card variant="default" padding="none" className="mt-lg">
            <TabsContent value="overview" className="mt-0">
              <DealSourceOverviewTab source={source} />
            </TabsContent>
            {source.type === "lender" && (
              <>
                <TabsContent value="lending-terms" className="mt-0">
                  <LendingTermsTab
                    sourceId={source.id}
                    criteria={(source.lending_criteria as LendingCriteria) || null}
                  />
                </TabsContent>
                <TabsContent value="active-loans" className="mt-0">
                  <ActiveLoansTab lenderId={source.id} lenderName={source.name} />
                </TabsContent>
                <TabsContent value="loan-history" className="mt-0">
                  <LoanHistoryTab lenderId={source.id} />
                </TabsContent>
              </>
            )}
            <TabsContent value="deals" className="mt-0">
              <DealSourceDealsTab sourceId={source.id} sourceName={source.name} />
            </TabsContent>
            <TabsContent value="outreach" className="mt-0">
              <DealSourceOutreachTab sourceId={source.id} />
            </TabsContent>
            <TabsContent value="performance" className="mt-0">
              <DealSourcePerformanceTab source={source} />
            </TabsContent>
          </Card>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal Source?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {source.name} and all associated data. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
