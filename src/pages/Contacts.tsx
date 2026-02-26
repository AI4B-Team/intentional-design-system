import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Plus,
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  Edit,
  Trash2,
  Users,
  SlidersHorizontal,
  ArrowUpDown,
  X,
} from "lucide-react";
import { useDealSources, useDeleteDealSource, type DealSourceType, type DealSourceStatus } from "@/hooks/useDealSources";
import { useSyncContacts } from "@/hooks/useSyncContacts";
import { AddDealSourceModal } from "@/components/deal-sources";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Contacts() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultAddType, setDefaultAddType] = useState<DealSourceType | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState<DealSourceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DealSourceStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "type">("newest");

  // Handle ?add=buyer or ?add=contractor query param
  useEffect(() => {
    const addType = searchParams.get("add");
    if (addType && ["buyer", "contractor", "agent", "seller", "lender", "wholesaler", "title_company", "attorney", "property_manager", "inspector"].includes(addType)) {
      setDefaultAddType(addType as DealSourceType);
      setShowAddModal(true);
      // Clear the query param
      searchParams.delete("add");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: contacts = [], isLoading } = useDealSources({ 
    type: typeFilter,
    status: statusFilter,
    sortBy: "newest",
  });
  const deleteMutation = useDeleteDealSource();
  const syncContacts = useSyncContacts();
  const hasSynced = useRef(false);

  // Auto-sync contacts on first load when there are no contacts
  useEffect(() => {
    if (!isLoading && contacts.length === 0 && !hasSynced.current && !syncContacts.isPending) {
      hasSynced.current = true;
      syncContacts.mutate();
    }
  }, [isLoading, contacts.length]);

  // Filter and sort contacts
  const filteredContacts = contacts
    .filter((contact) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        contact.name.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.phone?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortBy === "type") {
        return a.type.localeCompare(b.type);
      }
      return 0; // Default sorting handled by query
    });

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
    setSearchQuery("");
  };

  const hasActiveFilters = typeFilter !== "all" || statusFilter !== "all" || searchQuery;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "seller":
        return "bg-primary/10 text-primary";
      case "buyer":
        return "bg-purple-500/10 text-purple-600";
      case "agent":
        return "bg-info/10 text-info";
      case "wholesaler":
        return "bg-warning/10 text-warning";
      case "lender":
        return "bg-success/10 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success";
      case "contacted":
        return "bg-info/10 text-info";
      case "responded":
        return "bg-primary/10 text-primary";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "cold":
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
            <p className="text-muted-foreground mt-1">
              Manage your network of sellers, buyers, agents, wholesalers, and lenders
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, company, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Controls - all on one row */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DealSourceType | "all")}>
                <SelectTrigger className="w-[140px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="lender">Lender</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DealSourceStatus | "all")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[150px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Sellers</p>
            <p className="text-2xl font-bold text-primary">{contacts.filter(c => c.type === "seller").length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Buyers</p>
            <p className="text-2xl font-bold text-purple-600">{contacts.filter(c => c.type === "buyer").length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Agents</p>
            <p className="text-2xl font-bold text-info">{contacts.filter(c => c.type === "agent").length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Wholesalers</p>
            <p className="text-2xl font-bold text-warning">{contacts.filter(c => c.type === "wholesaler").length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Lenders</p>
            <p className="text-2xl font-bold text-success">{contacts.filter(c => c.type === "lender").length}</p>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">State</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <EmptyState
                      icon={<Users className="h-9 w-9 text-muted-foreground opacity-70" />}
                      title="No contacts yet"
                      description="Import a list or add contacts manually to start building your database."
                      action={{ label: "Import List", onClick: () => navigate('/lists') }}
                      size="sm"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{contact.name}</p>
                        {contact.company && (
                          <p className="text-sm text-muted-foreground">{contact.company}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.state || "—"}
                    </TableCell>
                    <TableCell>
                      {contact.phone ? (
                        <a
                          href={`tel:${contact.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", getTypeColor(contact.type))}>
                        {contact.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("capitalize", getStatusColor(contact.status))}>
                        {contact.status || "cold"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/contacts/${contact.id}`);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(contact.id);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Results count */}
        {!isLoading && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredContacts.length} of {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AddDealSourceModal 
        open={showAddModal} 
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setDefaultAddType(undefined);
        }}
        defaultType={defaultAddType}
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
    </AppLayout>
  );
}
