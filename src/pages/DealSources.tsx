import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import {
  AddDealSourceModal,
  DealSourcesTable,
  DealSourceFiltersBar,
  DealSourceStats,
} from "@/components/deal-sources";
import {
  useDealSources,
  useDealSourceStats,
  useLogContact,
  useDeleteDealSource,
  type DealSourceFilters,
  type DealSourceType,
} from "@/hooks/useDealSources";
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

export default function DealSources() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<DealSourceType | "all">("all");
  const [filters, setFilters] = useState<DealSourceFilters>({
    type: "all",
    status: "all",
    performance: "all",
    sortBy: "newest",
    search: "",
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Combine tab with filters
  const combinedFilters = useMemo(
    () => ({
      ...filters,
      type: activeTab,
    }),
    [filters, activeTab]
  );

  const { data: dealSources = [], isLoading } = useDealSources(combinedFilters);
  const { data: stats, isLoading: statsLoading } = useDealSourceStats();
  const logContact = useLogContact();
  const deleteDealSource = useDeleteDealSource();

  const handleTabChange = (value: string) => {
    setActiveTab(value as DealSourceType | "all");
    setSelectedIds([]);
  };

  const handleFiltersChange = (newFilters: DealSourceFilters) => {
    setFilters(newFilters);
    setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? dealSources.map((s) => s.id) : []);
  };

  const handleLogContact = (id: string) => {
    logContact.mutate(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteDealSource.mutate(deleteId);
      setDeleteId(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h1 font-semibold text-content">Deal Sources</h1>
            <p className="text-body text-content-secondary mt-1">
              Manage your network of agents, wholesalers, and lenders
            </p>
          </div>
          <Button variant="primary" icon={<Plus />} onClick={() => setShowAddModal(true)}>
            Add Deal Source
          </Button>
        </div>

        {/* Stats */}
        <DealSourceStats stats={stats || null} isLoading={statsLoading} />

        {/* Tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="agent">Agents</TabsTrigger>
              <TabsTrigger value="wholesaler">Wholesalers</TabsTrigger>
              <TabsTrigger value="lender">Lenders</TabsTrigger>
            </TabsList>
          </Tabs>

          <DealSourceFiltersBar filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-brand/5 border border-brand/20 rounded-medium">
            <span className="text-small text-brand font-medium">
              {selectedIds.length} selected
            </span>
            <Button variant="secondary" size="sm" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                // For now, just delete the first selected
                if (selectedIds.length > 0) {
                  setDeleteId(selectedIds[0]);
                }
              }}
            >
              Delete Selected
            </Button>
          </div>
        )}

        {/* Table */}
        <DealSourcesTable
          data={dealSources}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onLogContact={handleLogContact}
          onDelete={setDeleteId}
        />

        {/* Pagination placeholder */}
        {dealSources.length > 0 && (
          <div className="flex items-center justify-between text-small text-content-secondary">
            <span>Showing {dealSources.length} results</span>
            <span className="text-content-tertiary">Page 1 of 1</span>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AddDealSourceModal open={showAddModal} onOpenChange={setShowAddModal} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal Source?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deal source and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
