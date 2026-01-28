import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { useNavigate } from "react-router-dom";
import { format, subDays, startOfDay, endOfDay, startOfWeek, startOfMonth } from "date-fns";
import { AppLayout } from "@/components/layout";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangeSelector } from "@/components/analytics/date-range-selector";
import { CallHistoryTable } from "@/components/dialer/call-history-table";
import { CallDetailSheet } from "@/components/dialer/call-detail-sheet";
import { CallAnalytics } from "@/components/dialer/call-analytics";
import { RecordingPlayer } from "@/components/dialer/recording-player";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Phone,
  PhoneCall,
  Clock,
  Calendar,
  Download,
  Search,
  Trash2,
  Tag,
} from "lucide-react";

type DateRange = "today" | "yesterday" | "week" | "month" | "custom";
type DurationFilter = "all" | "short" | "medium" | "long" | "verylong";

interface Call {
  id: string;
  contact_name: string | null;
  phone_number: string;
  duration_seconds: number | null;
  disposition: string | null;
  recording_url: string | null;
  recording_duration_seconds: number | null;
  initiated_at: string | null;
  answered_at: string | null;
  ended_at: string | null;
  direction: string | null;
  status: string | null;
  disposition_category: string | null;
  ring_time_seconds: number | null;
  talk_time_seconds: number | null;
  transcription: string | null;
  notes: string | null;
  follow_up_date: string | null;
  follow_up_time: string | null;
  property_id: string | null;
  queue_id: string | null;
}

export default function DialerHistory() {
  const navigate = useNavigate();
  const { organizationId } = useOrganizationContext();

  const [dateRange, setDateRange] = React.useState<DateRange>("today");
  const [customStart, setCustomStart] = React.useState<Date | null>(null);
  const [customEnd, setCustomEnd] = React.useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dispositionFilter, setDispositionFilter] = React.useState("all");
  const [directionFilter, setDirectionFilter] = React.useState("all");
  const [durationFilter, setDurationFilter] = React.useState<DurationFilter>("all");
  const [recordingFilter, setRecordingFilter] = React.useState("all");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [selectedCall, setSelectedCall] = React.useState<Call | null>(null);
  const [playingRecording, setPlayingRecording] = React.useState<Call | null>(null);

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case "today":
        return { start: startOfDay(now), end: endOfDay(now) };
      case "yesterday":
        const yesterday = subDays(now, 1);
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
      case "week":
        return { start: startOfWeek(now), end: endOfDay(now) };
      case "month":
        return { start: startOfMonth(now), end: endOfDay(now) };
      case "custom":
        return {
          start: customStart || subDays(now, 7),
          end: customEnd || now,
        };
    }
  };

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ["call-history", organizationId, dateRange, customStart, customEnd],
    queryFn: async () => {
      if (!organizationId) return [];
      const { start, end } = getDateFilter();

      const { data, error } = await supabase
        .from("calls")
        .select("*")
        .eq("organization_id", organizationId)
        .gte("initiated_at", start.toISOString())
        .lte("initiated_at", end.toISOString())
        .order("initiated_at", { ascending: false });

      if (error) throw error;
      return data as Call[];
    },
    enabled: !!organizationId,
  });

  // Calculate stats
  const stats = React.useMemo(() => {
    const answered = calls.filter((c) => c.status === "completed" && c.talk_time_seconds);
    const totalTalkTime = calls.reduce((sum, c) => sum + (c.talk_time_seconds || 0), 0);
    const appointments = calls.filter(
      (c) => c.disposition?.toLowerCase() === "appointment set"
    ).length;

    return {
      total: calls.length,
      answered: answered.length,
      answeredPercent: calls.length > 0 ? Math.round((answered.length / calls.length) * 100) : 0,
      totalTalkTime,
      avgDuration:
        answered.length > 0
          ? Math.round(totalTalkTime / answered.length)
          : 0,
      appointments,
    };
  }, [calls]);

  // Filter calls
  const filteredCalls = React.useMemo(() => {
    return calls.filter((call) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          call.contact_name?.toLowerCase().includes(query) ||
          call.phone_number.includes(query);
        if (!matches) return false;
      }

      // Disposition
      if (dispositionFilter !== "all" && call.disposition !== dispositionFilter) {
        return false;
      }

      // Direction
      if (directionFilter !== "all" && call.direction !== directionFilter) {
        return false;
      }

      // Duration
      if (durationFilter !== "all") {
        const dur = call.duration_seconds || 0;
        switch (durationFilter) {
          case "short":
            if (dur >= 60) return false;
            break;
          case "medium":
            if (dur < 60 || dur >= 300) return false;
            break;
          case "long":
            if (dur < 300 || dur >= 900) return false;
            break;
          case "verylong":
            if (dur < 900) return false;
            break;
        }
      }

      // Recording
      if (recordingFilter === "yes" && !call.recording_url) return false;
      if (recordingFilter === "no" && call.recording_url) return false;

      return true;
    });
  }, [calls, searchQuery, dispositionFilter, directionFilter, durationFilter, recordingFilter]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
    if (selectedIds.size === filteredCalls.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCalls.map((c) => c.id)));
    }
  };

  // Mock analytics data
  const mockVolumeData = [
    { date: "Mon", made: 45, answered: 22, appointments: 3 },
    { date: "Tue", made: 52, answered: 28, appointments: 4 },
    { date: "Wed", made: 38, answered: 18, appointments: 2 },
    { date: "Thu", made: 61, answered: 32, appointments: 5 },
    { date: "Fri", made: 47, answered: 25, appointments: 3 },
    { date: "Sat", made: 23, answered: 12, appointments: 1 },
  ];

  const mockDispositionData = [
    { name: "Appointment Set", value: 14, color: "hsl(var(--success))" },
    { name: "Interested", value: 22, color: "hsl(var(--info))" },
    { name: "Left Voicemail", value: 45, color: "hsl(var(--warning))" },
    { name: "No Answer", value: 67, color: "hsl(var(--muted-foreground))" },
    { name: "Not Interested", value: 34, color: "hsl(var(--destructive))" },
    { name: "Other", value: 12, color: "hsl(var(--accent))" },
  ];

  const mockDurationData = [
    { range: "<30s", count: 45 },
    { range: "30s-1m", count: 32 },
    { range: "1-2m", count: 28 },
    { range: "2-5m", count: 41 },
    { range: "5-10m", count: 23 },
    { range: ">10m", count: 12 },
  ];

  const mockHeatmapData = [
    { hour: "9-10", mon: 65, tue: 72, wed: 58, thu: 70, fri: 68, sat: 45 },
    { hour: "10-11", mon: 78, tue: 75, wed: 80, thu: 76, fri: 74, sat: 52 },
    { hour: "11-12", mon: 55, tue: 58, wed: 62, thu: 65, fri: 52, sat: 38 },
    { hour: "12-1", mon: 42, tue: 45, wed: 48, thu: 50, fri: 44, sat: 30 },
    { hour: "1-2", mon: 58, tue: 62, wed: 55, thu: 60, fri: 56, sat: 35 },
    { hour: "2-3", mon: 72, tue: 78, wed: 75, thu: 80, fri: 70, sat: 42 },
    { hour: "3-4", mon: 68, tue: 70, wed: 72, thu: 75, fri: 65, sat: 38 },
    { hour: "4-5", mon: 55, tue: 58, wed: 52, thu: 55, fri: 48, sat: 25 },
  ];

  const mockAnalyticsStats = {
    avgCallsToReach: 2.3,
    avgTalkTime: 268,
    conversionRate: 7.2,
  };

  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <AppLayout>
      <PageLayout
        title="Call History"
        headerActions={
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        }
      >
        {/* Date Range */}
        <div className="flex items-center gap-2 mb-6">
          {dateRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={dateRange === option.value ? "primary" : "outline"}
              size="sm"
              onClick={() => setDateRange(option.value as DateRange)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-small bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">Total Calls</p>
                <p className="text-h3 font-semibold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-small bg-success/10 text-success">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">Answered</p>
                <p className="text-h3 font-semibold">
                  {stats.answered}{" "}
                  <span className="text-small text-muted-foreground">
                    ({stats.answeredPercent}%)
                  </span>
                </p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-small bg-info/10 text-info">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">Talk Time</p>
                <p className="text-h3 font-semibold">
                  {formatDuration(stats.totalTalkTime)}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-small bg-warning/10 text-warning">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">Avg Duration</p>
                <p className="text-h3 font-semibold">
                  {formatDuration(stats.avgDuration)}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-small bg-accent/10 text-accent">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-tiny text-muted-foreground">Appointments</p>
                <p className="text-h3 font-semibold">{stats.appointments}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history">Call History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={dispositionFilter} onValueChange={setDispositionFilter}>
                <SelectTrigger className="w-[160px] bg-white">
                  <SelectValue placeholder="Disposition" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all">All Dispositions</SelectItem>
                  <SelectItem value="Appointment Set">Appointment Set</SelectItem>
                  <SelectItem value="Interested">Interested</SelectItem>
                  <SelectItem value="Left Voicemail">Left Voicemail</SelectItem>
                  <SelectItem value="No Answer">No Answer</SelectItem>
                  <SelectItem value="Not Interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>

              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="w-[130px] bg-white">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={durationFilter}
                onValueChange={(v) => setDurationFilter(v as DurationFilter)}
              >
                <SelectTrigger className="w-[130px] bg-white">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="short">&lt;1 min</SelectItem>
                  <SelectItem value="medium">1-5 min</SelectItem>
                  <SelectItem value="long">5-15 min</SelectItem>
                  <SelectItem value="verylong">&gt;15 min</SelectItem>
                </SelectContent>
              </Select>

              <Select value={recordingFilter} onValueChange={setRecordingFilter}>
                <SelectTrigger className="w-[150px] bg-white">
                  <SelectValue placeholder="Has Recording" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has Recording</SelectItem>
                  <SelectItem value="no">No Recording</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/20 rounded-medium">
                <span className="text-small font-medium">
                  {selectedIds.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Tag className="h-4 w-4 mr-1" />
                    Add Tag
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Recordings
                  </Button>
                </div>
              </div>
            )}

            {/* Call Table */}
            <CallHistoryTable
              calls={filteredCalls}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onSelectToggle={toggleSelect}
              onSelectAll={toggleSelectAll}
              onRowClick={(call) => setSelectedCall(call as Call)}
              onPlayRecording={(call) => setPlayingRecording(call as Call)}
              onViewProperty={(id) => navigate(`/properties/${id}`)}
              onCallAgain={(call) => navigate(`/dialer?phone=${call.phone_number}`)}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <CallAnalytics
              volumeData={mockVolumeData}
              dispositionData={mockDispositionData}
              durationData={mockDurationData}
              heatmapData={mockHeatmapData}
              stats={mockAnalyticsStats}
            />
          </TabsContent>
        </Tabs>

        {/* Call Detail Sheet */}
        <CallDetailSheet
          open={!!selectedCall}
          onOpenChange={() => setSelectedCall(null)}
          call={selectedCall}
          onViewProperty={() => {
            if (selectedCall?.property_id) {
              navigate(`/properties/${selectedCall.property_id}`);
            }
          }}
        />

        {/* Recording Player Modal */}
        <Dialog open={!!playingRecording} onOpenChange={() => setPlayingRecording(null)}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>
                Recording: {playingRecording?.contact_name || "Unknown"}
              </DialogTitle>
            </DialogHeader>
            {playingRecording?.recording_url && (
              <RecordingPlayer
                src={playingRecording.recording_url}
                duration={playingRecording.recording_duration_seconds || undefined}
              />
            )}
          </DialogContent>
        </Dialog>
      </PageLayout>
    </AppLayout>
  );
}
