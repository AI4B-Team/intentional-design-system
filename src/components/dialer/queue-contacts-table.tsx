import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone,
  SkipForward,
  MoreHorizontal,
  Search,
  ArrowUp,
  Trash2,
  Eye,
} from "lucide-react";

interface QueueContact {
  id: string;
  contact_name: string | null;
  phone_number: string;
  property_address: string | null;
  attempt_count: number | null;
  last_disposition: string | null;
  status: string | null;
}

interface QueueContactsTableProps {
  queueId: string;
  onCallContact: (contact: QueueContact) => void;
}

type StatusFilter = "all" | "pending" | "completed" | "skipped";

export function QueueContactsTable({
  queueId,
  onCallContact,
}: QueueContactsTableProps) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["queue-contacts", queueId, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("call_queue_contacts")
        .select("*")
        .eq("queue_id", queueId)
        .order("position", { ascending: true });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as QueueContact[];
    },
  });

  const skipContact = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from("call_queue_contacts")
        .update({ status: "skipped" })
        .eq("id", contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-contacts", queueId] });
      toast.success("Contact skipped");
    },
  });

  const prioritizeContact = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from("call_queue_contacts")
        .update({ position: 0, priority_boost: 100 })
        .eq("id", contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-contacts", queueId] });
      toast.success("Contact moved to top");
    },
  });

  const removeContact = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from("call_queue_contacts")
        .delete()
        .eq("id", contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-contacts", queueId] });
      queryClient.invalidateQueries({ queryKey: ["call-queue", queueId] });
      toast.success("Contact removed");
    },
  });

  const bulkSkip = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("call_queue_contacts")
        .update({ status: "skipped" })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-contacts", queueId] });
      setSelectedIds(new Set());
      toast.success("Contacts skipped");
    },
  });

  const bulkRemove = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("call_queue_contacts")
        .delete()
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-contacts", queueId] });
      queryClient.invalidateQueries({ queryKey: ["call-queue", queueId] });
      setSelectedIds(new Set());
      toast.success("Contacts removed");
    },
  });

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Badge variant="info">🔵 Pending</Badge>;
      case "in_progress":
        return <Badge variant="warning">🟡 In Progress</Badge>;
      case "completed":
        return <Badge variant="success">✅ Completed</Badge>;
      case "skipped":
        return <Badge variant="secondary">⏭️ Skipped</Badge>;
      case "dnc":
        return <Badge variant="destructive">🚫 DNC</Badge>;
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.contact_name?.toLowerCase().includes(query) ||
      contact.phone_number.includes(query) ||
      contact.property_address?.toLowerCase().includes(query)
    );
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "skipped", label: "Skipped" },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 bg-muted rounded-medium p-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "px-3 py-1.5 rounded-small text-small font-medium transition-colors",
                statusFilter === filter.value
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/20 rounded-medium">
          <span className="text-small font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const firstSelected = contacts.find((c) => selectedIds.has(c.id));
                if (firstSelected) onCallContact(firstSelected);
              }}
            >
              <Phone className="h-4 w-4 mr-1" />
              Call Next
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => bulkSkip.mutate(Array.from(selectedIds))}
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip All
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => bulkRemove.mutate(Array.from(selectedIds))}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-border-subtle rounded-medium overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    filteredContacts.length > 0 &&
                    selectedIds.size === filteredContacts.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Property</TableHead>
              <TableHead className="text-center">Attempts</TableHead>
              <TableHead>Last Result</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-muted-foreground"
                >
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(contact.id)}
                      onCheckedChange={() => toggleSelect(contact.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {contact.contact_name || "Unknown"}
                  </TableCell>
                  <TableCell className="font-mono text-small">
                    {formatPhone(contact.phone_number)}
                  </TableCell>
                  <TableCell className="text-small text-muted-foreground max-w-[200px] truncate">
                    {contact.property_address || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {contact.attempt_count || 0}
                  </TableCell>
                  <TableCell className="text-small">
                    {contact.last_disposition || "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(contact.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {contact.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onCallContact(contact)}
                            title="Call now"
                          >
                            <Phone className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => skipContact.mutate(contact.id)}
                            title="Skip"
                          >
                            <SkipForward className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem
                            onClick={() => prioritizeContact.mutate(contact.id)}
                          >
                            <ArrowUp className="h-4 w-4 mr-2" />
                            Move to Top
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => removeContact.mutate(contact.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
