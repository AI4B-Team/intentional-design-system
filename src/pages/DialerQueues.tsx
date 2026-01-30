import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateQueueModal } from "@/components/dialer/create-queue-modal";
import {
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Settings,
  Users,
  Copy,
  Archive,
  Trash2,
  Phone,
} from "lucide-react";

interface Queue {
  id: string;
  name: string;
  source_type: string;
  total_contacts: number | null;
  contacts_remaining: number | null;
  contacts_reached: number | null;
  appointments_set: number | null;
  status: string | null;
  created_at: string;
}

type StatusFilter = "all" | "active" | "paused" | "completed";

export default function DialerQueues() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const { data: queues = [], isLoading } = useQuery({
    queryKey: ["call-queues", organizationId, statusFilter],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from("call_queues")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Queue[];
    },
    enabled: !!organizationId,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("call_queues")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-queues"] });
      toast.success("Queue status updated");
    },
  });

  const deleteQueue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("call_queues").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-queues"] });
      toast.success("Queue deleted");
    },
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge variant="success">🟢 Active</Badge>;
      case "paused":
        return <Badge variant="warning">🟡 Paused</Badge>;
      case "completed":
        return <Badge variant="info">✅ Completed</Badge>;
      case "archived":
        return <Badge variant="secondary">📁 Archived</Badge>;
      default:
        return <Badge variant="secondary">⚪ New</Badge>;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "properties":
        return "Properties";
      case "list":
        return "List";
      case "followups":
        return "Follow-ups";
      case "manual":
        return "Manual";
      default:
        return source;
    }
  };

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All Queues" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h1 font-semibold text-foreground">Call Queues</h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Create Queue
        </Button>
      </div>
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-medium p-1 w-fit mb-6">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "px-4 py-2 rounded-small text-small font-medium transition-colors",
                statusFilter === filter.value
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Queues Table */}
        <div className="bg-white border border-border-subtle rounded-medium overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="text-right">Reached</TableHead>
                <TableHead className="text-right">Appointments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : queues.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Phone className="h-8 w-8 text-muted-foreground/50" />
                      <p>No queues found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                      >
                        Create your first queue
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                queues.map((queue) => {
                  const total = queue.total_contacts || 0;
                  const reached = queue.contacts_reached || 0;
                  const reachPercent = total > 0 ? Math.round((reached / total) * 100) : 0;

                  return (
                    <TableRow
                      key={queue.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/dialer/queues/${queue.id}`)}
                    >
                      <TableCell className="font-medium">{queue.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" size="sm">
                          {getSourceLabel(queue.source_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{total}</TableCell>
                      <TableCell className="text-right">
                        {queue.contacts_remaining || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {reached} ({reachPercent}%)
                      </TableCell>
                      <TableCell className="text-right">
                        {queue.appointments_set || 0}
                      </TableCell>
                      <TableCell>{getStatusBadge(queue.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              onClick={() => navigate(`/dialer?queue=${queue.id}`)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Calling
                            </DropdownMenuItem>
                            {queue.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatus.mutate({
                                    id: queue.id,
                                    status: "paused",
                                  })
                                }
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatus.mutate({
                                    id: queue.id,
                                    status: "active",
                                  })
                                }
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/dialer/queues/${queue.id}`)
                              }
                            >
                              <Users className="h-4 w-4 mr-2" />
                              View Contacts
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus.mutate({
                                  id: queue.id,
                                  status: "archived",
                                })
                              }
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteQueue.mutate(queue.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create Queue Modal */}
        <CreateQueueModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={(queueId) => navigate(`/dialer/queues/${queueId}`)}
        />
    </PageLayout>
  );
}
