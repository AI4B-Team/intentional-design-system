import React, { useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Plus,
  Search,
  Phone,
  Trash2,
  Download,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSellerLeads,
  useLeadStats,
  useUpdateLead,
  useDeleteLead,
  useDeleteLeads,
  type SellerLead,
  type LeadFilters,
} from "@/hooks/useSellerLeads";
import { useSellerWebsites } from "@/hooks/useSellerWebsites";
import { LeadDetailSheet } from "@/components/leads/LeadDetailSheet";
import { AddLeadModal } from "@/components/leads/AddLeadModal";
import { AddToPropertiesModal } from "@/components/leads/AddToPropertiesModal";
import { SendSmsModal } from "@/components/leads/SendSmsModal";
import { SendEmailModal } from "@/components/leads/SendEmailModal";
import { ViewToggle, type ViewType } from "@/components/leads/ViewToggle";
import { LeadListView } from "@/components/leads/LeadListView";
import { LeadGridView } from "@/components/leads/LeadGridView";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-success" },
  { value: "contacted", label: "Contacted", color: "bg-info" },
  { value: "qualified", label: "Qualified", color: "bg-warning" },
  { value: "appointment", label: "Appointment", color: "bg-purple-500" },
  { value: "offer_made", label: "Offer Made", color: "bg-orange-500" },
  { value: "closed", label: "Closed", color: "bg-success" },
  { value: "lost", label: "Lost", color: "bg-destructive" },
];

const TIMELINE_OPTIONS = [
  { value: "asap", label: "ASAP" },
  { value: "30_days", label: "30 Days" },
  { value: "60_days", label: "60 Days" },
  { value: "90_days", label: "90 Days" },
  { value: "flexible", label: "Flexible" },
];

type SortOption = "newest" | "oldest" | "score_high" | "name_asc";

export default function SellerLeads() {
  const { websiteId } = useParams<{ websiteId?: string }>();
  const [searchParams] = useSearchParams();

  // View type
  const [viewType, setViewType] = useState<ViewType>("list");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [timelineFilter, setTimelineFilter] = useState<string>("");
  const [websiteFilter, setWebsiteFilter] = useState<string>(websiteId || "");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<SellerLead | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [addToPropertiesLead, setAddToPropertiesLead] = useState<SellerLead | null>(null);
  const [smsLead, setSmsLead] = useState<SellerLead | null>(null);
  const [emailLead, setEmailLead] = useState<SellerLead | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Data
  const filters: LeadFilters = useMemo(
    () => ({
      websiteId: websiteFilter || undefined,
      status: statusFilter.length > 0 ? statusFilter : undefined,
      timeline: timelineFilter || undefined,
      search: search || undefined,
    }),
    [websiteFilter, statusFilter, timelineFilter, search]
  );

  const { data: leads, isLoading, refetch } = useSellerLeads(filters);
  const { data: stats } = useLeadStats(websiteFilter || undefined);
  const { data: websites } = useSellerWebsites();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const deleteLeads = useDeleteLeads();

  // Sort leads
  const sortedLeads = useMemo(() => {
    if (!leads) return [];
    const sorted = [...leads];
    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case "score_high":
        sorted.sort((a, b) => (b.auto_score || 0) - (a.auto_score || 0));
        break;
      case "name_asc":
        sorted.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
        break;
      default:
        sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
    return sorted;
  }, [leads, sortBy]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedLeads.map((l) => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectLead = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    setDeleteIds(Array.from(selectedIds));
  };

  const confirmDelete = () => {
    if (deleteIds.length === 1) {
      deleteLead.mutate(deleteIds[0]);
    } else if (deleteIds.length > 1) {
      deleteLeads.mutate(deleteIds);
    }
    setDeleteIds([]);
    setSelectedIds(new Set());
  };

  const handleBulkStatusChange = (status: string) => {
    selectedIds.forEach((id) => {
      updateLead.mutate({ id, data: { status } });
    });
    setSelectedIds(new Set());
  };

  const handleStatusChange = (id: string, status: string) => {
    updateLead.mutate({ id, data: { status } });
  };

  const openLeadDetail = (lead: SellerLead) => {
    setSelectedLead(lead);
    setDetailSheetOpen(true);
  };

  const selectedWebsite = websites?.find((w) => w.id === websiteFilter);
  const pageTitle = selectedWebsite ? `${selectedWebsite.name} Leads` : "Seller Leads";

  return (
    <PageLayout>
      <PageHeader
        title={pageTitle}
        description="Manage leads from your websites"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button variant="primary" icon={<Plus />} onClick={() => setAddModalOpen(true)}>
              Add Lead
            </Button>
          </div>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-lg">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Total</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.total || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">New</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.new || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-info/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Contacted</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.contacted || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-warning/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Qualified</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.qualified || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-purple-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Appointments</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.appointment || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Converted</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.converted || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card variant="default" padding="md" className="mb-lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, address, phone..."
                className="pl-9"
              />
            </div>
          </div>

          {!websiteId && (
            <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Websites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Websites</SelectItem>
                {websites?.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={statusFilter[0] || ""}
            onValueChange={(val) => setStatusFilter(val ? [val] : [])}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timelineFilter} onValueChange={setTimelineFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Timelines</SelectItem>
              {TIMELINE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="score_high">Highest Score</SelectItem>
              <SelectItem value="name_asc">Name A-Z</SelectItem>
            </SelectContent>
          </Select>

          <ViewToggle value={viewType} onChange={setViewType} />
        </div>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-large shadow-lg flex items-center gap-4">
          <span className="font-medium">{selectedIds.size} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                Change Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATUS_OPTIONS.map((s) => (
                <DropdownMenuItem key={s.value} onClick={() => handleBulkStatusChange(s.value)}>
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <Card variant="default" padding="none">
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </Card>
      ) : !sortedLeads || sortedLeads.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <Users className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
          <h3 className="text-h3 font-medium text-content mb-2">No leads yet</h3>
          <p className="text-small text-content-secondary mb-6">
            Leads from your websites will appear here.
          </p>
          <Button variant="primary" icon={<Plus />} onClick={() => setAddModalOpen(true)}>
            Add Your First Lead
          </Button>
        </Card>
      ) : viewType === "list" ? (
        <LeadListView
          leads={sortedLeads}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectLead={handleSelectLead}
          onViewDetail={openLeadDetail}
          onCall={(phone) => window.open(`tel:${phone}`)}
          onSms={setSmsLead}
          onEmail={setEmailLead}
          onAddToProperties={setAddToPropertiesLead}
          onDelete={(id) => setDeleteIds([id])}
        />
      ) : viewType === "grid" ? (
        <LeadGridView
          leads={sortedLeads}
          selectedIds={selectedIds}
          onSelectLead={handleSelectLead}
          onViewDetail={openLeadDetail}
          onCall={(phone) => window.open(`tel:${phone}`)}
          onSms={setSmsLead}
          onEmail={setEmailLead}
          onAddToProperties={setAddToPropertiesLead}
          onDelete={(id) => setDeleteIds([id])}
        />
      ) : (
        <LeadKanbanView
          leads={sortedLeads}
          onViewDetail={openLeadDetail}
          onCall={(phone) => window.open(`tel:${phone}`)}
          onSms={setSmsLead}
          onEmail={setEmailLead}
          onAddToProperties={setAddToPropertiesLead}
          onDelete={(id) => setDeleteIds([id])}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Modals */}
      <AddLeadModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        websiteId={websiteFilter || undefined}
      />

      <LeadDetailSheet
        lead={selectedLead}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onAddToProperties={(lead) => {
          setDetailSheetOpen(false);
          setAddToPropertiesLead(lead);
        }}
        onCall={(phone) => window.open(`tel:${phone}`)}
        onSms={(lead) => {
          setDetailSheetOpen(false);
          setSmsLead(lead);
        }}
        onEmail={(lead) => {
          setDetailSheetOpen(false);
          setEmailLead(lead);
        }}
      />

      <AddToPropertiesModal
        lead={addToPropertiesLead}
        open={!!addToPropertiesLead}
        onOpenChange={(open) => !open && setAddToPropertiesLead(null)}
        onSuccess={() => setAddToPropertiesLead(null)}
      />

      <SendSmsModal
        lead={smsLead}
        open={!!smsLead}
        onOpenChange={(open) => !open && setSmsLead(null)}
      />

      <SendEmailModal
        lead={emailLead}
        open={!!emailLead}
        onOpenChange={(open) => !open && setEmailLead(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteIds.length > 0} onOpenChange={() => setDeleteIds([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead{deleteIds.length > 1 ? "s" : ""}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteIds.length > 1 ? `these ${deleteIds.length} leads` : "this lead"}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
