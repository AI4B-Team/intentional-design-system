import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import {
  AddContactModal,
  ContactsTable,
  ContactFiltersBar,
  ContactStatsCard,
} from "@/components/contacts";
import {
  useContacts,
  useContactStats,
  useLogContactInteraction,
  useDeleteContact,
  type ContactFilters,
  type ContactType,
} from "@/hooks/useContacts";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const addType = searchParams.get("add") as ContactType | null;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultAddType, setDefaultAddType] = useState<ContactType | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<ContactType | "all">("all");
  const [filters, setFilters] = useState<ContactFilters>({
    type: "all",
    status: "all",
    performance: "all",
    sortBy: "newest",
    search: "",
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Handle ?add=type query param
  useEffect(() => {
    if (addType) {
      setDefaultAddType(addType);
      setShowAddModal(true);
      // Clear the query param
      setSearchParams({});
    }
  }, [addType, setSearchParams]);

  // Combine tab with filters
  const combinedFilters = useMemo(
    () => ({
      ...filters,
      type: activeTab,
    }),
    [filters, activeTab]
  );

  const { data: contacts = [], isLoading } = useContacts(combinedFilters);
  const { data: stats, isLoading: statsLoading } = useContactStats(activeTab);
  const logContact = useLogContactInteraction();
  const deleteContact = useDeleteContact();

  const handleTabChange = (value: string) => {
    setActiveTab(value as ContactType | "all");
    setSelectedIds([]);
  };

  const handleFiltersChange = (newFilters: ContactFilters) => {
    setFilters(newFilters);
    setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? contacts.map((s) => s.id) : []);
  };

  const handleLogContact = (id: string) => {
    logContact.mutate(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteContact.mutate(deleteId);
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
            <h1 className="text-h1 font-semibold text-content">Contacts</h1>
            <p className="text-body text-content-secondary mt-1">
              Manage your network of agents, buyers, sellers, lenders, and vendors
            </p>
          </div>
          <Button variant="primary" icon={<Plus />} onClick={() => setShowAddModal(true)}>
            Add Contact
          </Button>
        </div>

        {/* Stats - type-specific */}
        <ContactStatsCard stats={stats || null} isLoading={statsLoading} activeType={activeTab} />

        {/* Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="agent">Agents</TabsTrigger>
              <TabsTrigger value="seller">Sellers</TabsTrigger>
              <TabsTrigger value="buyer">Buyers</TabsTrigger>
              <TabsTrigger value="lender">Lenders</TabsTrigger>
              <TabsTrigger value="wholesaler">Wholesalers</TabsTrigger>
              <TabsTrigger value="contractor">Contractors</TabsTrigger>
              <TabsTrigger value="title_company">Title</TabsTrigger>
              <TabsTrigger value="attorney">Attorney</TabsTrigger>
              <TabsTrigger value="property_manager">PM</TabsTrigger>
              <TabsTrigger value="inspector">Inspector</TabsTrigger>
            </TabsList>
          </Tabs>

          <ContactFiltersBar filters={filters} onFiltersChange={handleFiltersChange} />
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
        <ContactsTable
          data={contacts}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onLogContact={handleLogContact}
          onDelete={setDeleteId}
          onAddContact={() => setShowAddModal(true)}
        />

        {/* Pagination placeholder */}
        {contacts.length > 0 && (
          <div className="flex items-center justify-between text-small text-content-secondary">
            <span>Showing {contacts.length} results</span>
            <span className="text-content-tertiary">Page 1 of 1</span>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AddContactModal 
        open={showAddModal} 
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setDefaultAddType(undefined);
        }} 
        defaultType={defaultAddType || (activeTab !== "all" ? activeTab : undefined)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact and all associated data.
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
