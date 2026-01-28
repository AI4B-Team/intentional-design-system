import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { QueueContactsTable } from "@/components/dialer/queue-contacts-table";
import { QueueAnalytics } from "@/components/dialer/queue-analytics";
import { QueueSettingsPanel } from "@/components/dialer/queue-settings-panel";
import {
  ArrowLeft,
  Play,
  Pause,
  MoreHorizontal,
  Settings,
  Trash2,
  Users,
  Target,
  Calendar,
  TrendingUp,
} from "lucide-react";

interface QueueDetails {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  source_type: string;
  total_contacts: number | null;
  contacts_remaining: number | null;
  contacts_completed: number | null;
  contacts_reached: number | null;
  appointments_set: number | null;
  call_script_id: string | null;
  max_attempts: number | null;
  days_between_attempts: number | null;
  calling_hours_start: string | null;
  calling_hours_end: string | null;
  calling_days: string[] | null;
  timezone: string | null;
  respect_dnc: boolean | null;
  priority: number | null;
}

export default function DialerQueueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = React.useState(false);

  const { data: queue, isLoading } = useQuery({
    queryKey: ["call-queue", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("call_queues")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as QueueDetails;
    },
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      if (!id) throw new Error("No queue ID");
      const { error } = await supabase
        .from("call_queues")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-queue", id] });
      toast.success("Queue status updated");
    },
  });

  const deleteQueue = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No queue ID");
      const { error } = await supabase.from("call_queues").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Queue deleted");
      navigate("/dialer/queues");
    },
  });

  const handleCallContact = (contact: any) => {
    navigate(`/dialer?queue=${id}&contact=${contact.id}`);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge variant="success">🟢 Active</Badge>;
      case "paused":
        return <Badge variant="warning">🟡 Paused</Badge>;
      case "completed":
        return <Badge variant="info">✅ Completed</Badge>;
      default:
        return <Badge variant="secondary">⚪ New</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageLayout title="">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </PageLayout>
      </AppLayout>
    );
  }

  if (!queue) {
    return (
      <AppLayout>
        <PageLayout title="Queue Not Found">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              This queue doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate("/dialer/queues")}>
              Back to Queues
            </Button>
          </div>
        </PageLayout>
      </AppLayout>
    );
  }

  const total = queue.total_contacts || 0;
  const completed = queue.contacts_completed || 0;
  const remaining = queue.contacts_remaining || 0;
  const reached = queue.contacts_reached || 0;
  const appointments = queue.appointments_set || 0;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const successRate = reached > 0 ? ((appointments / reached) * 100).toFixed(1) : "0";

  // Mock analytics data
  const mockOutcomes = [
    { name: "Appointments", value: appointments, color: "hsl(var(--success))" },
    { name: "Interested", value: 12, color: "hsl(var(--info))" },
    { name: "Voicemail", value: 45, color: "hsl(var(--warning))" },
    { name: "No Answer", value: 34, color: "hsl(var(--muted-foreground))" },
    { name: "Not Interested", value: 67, color: "hsl(var(--destructive))" },
    { name: "Other", value: 12, color: "hsl(var(--accent))" },
  ];

  const mockCallsByDay = [
    { day: "Mon", calls: 23 },
    { day: "Tue", calls: 45 },
    { day: "Wed", calls: 32 },
    { day: "Thu", calls: 41 },
    { day: "Fri", calls: 28 },
    { day: "Sat", calls: 12 },
    { day: "Sun", calls: 0 },
  ];

  const mockStats = {
    avgCallsToReach: 2.3,
    avgTalkTime: 263,
    conversionRate: parseFloat(successRate),
    bestTime: "Tuesday 2-4 PM",
  };

  return (
    <AppLayout>
      <PageLayout
        title=""
        headerActions={
          <div className="flex items-center gap-2">
            {queue.status === "active" ? (
              <Button
                variant="secondary"
                onClick={() => updateStatus.mutate("paused")}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => navigate(`/dialer?queue=${id}`)}
              >
                <Play className="h-4 w-4 mr-1" />
                Start Calling
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => deleteQueue.mutate()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Queue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      >
        {/* Back Button & Title */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dialer/queues")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Queues
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-h1 font-bold text-foreground">{queue.name}</h1>
            {getStatusBadge(queue.status)}
          </div>
          {queue.description && (
            <p className="text-muted-foreground mt-1">{queue.description}</p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-small bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">Total</p>
                <p className="text-h3 font-semibold">{total}</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-small bg-info/10">
                <Target className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">Remaining</p>
                <p className="text-h3 font-semibold">{remaining}</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-small bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">Reached</p>
                <p className="text-h3 font-semibold">{reached}</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-small bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">Appointments</p>
                <p className="text-h3 font-semibold">{appointments}</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-small bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">Success Rate</p>
                <p className="text-h3 font-semibold">{successRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-white border border-border-subtle rounded-medium p-4">
          <div className="flex justify-between text-small text-muted-foreground mb-2">
            <span>
              {completed}/{total} processed
            </span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="contacts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <QueueContactsTable queueId={id!} onCallContact={handleCallContact} />
          </TabsContent>

          <TabsContent value="analytics">
            <QueueAnalytics
              queueId={id!}
              outcomes={mockOutcomes}
              callsByDay={mockCallsByDay}
              stats={mockStats}
            />
          </TabsContent>
        </Tabs>

        {/* Settings Panel */}
        <QueueSettingsPanel
          open={showSettings}
          onOpenChange={setShowSettings}
          queue={queue}
        />
      </PageLayout>
    </AppLayout>
  );
}
