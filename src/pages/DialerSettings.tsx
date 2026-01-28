import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { PageLayout } from "@/components/layout/page-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Settings,
  Phone,
  Mic,
  Link2,
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Check,
  Copy,
  ExternalLink,
  Shield,
  Calendar,
  Mail,
  MessageSquare,
  HardDrive,
  Clock,
} from "lucide-react";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Mon" },
  { id: "tuesday", label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday", label: "Thu" },
  { id: "friday", label: "Fri" },
  { id: "saturday", label: "Sat" },
  { id: "sunday", label: "Sun" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "America/Phoenix", label: "Arizona" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
];

const DISPOSITION_CATEGORIES = [
  { value: "positive", label: "Positive", description: "Counts as success" },
  { value: "negative", label: "Negative", description: "Reached but not interested" },
  { value: "neutral", label: "Neutral", description: "Reached, pending" },
  { value: "no_contact", label: "No Contact", description: "Didn't speak to anyone" },
  { value: "bad_number", label: "Bad Number", description: "Number issues" },
];

const EMOJI_OPTIONS = ["📅", "🔄", "📞", "❌", "🔴", "👎", "🚫", "⛔", "📵", "💬", "✅", "⏰", "📝", "🎯"];

interface Disposition {
  id: string;
  name: string;
  category: string;
  icon: string | null;
  color: string | null;
  keyboard_shortcut: string | null;
  removes_from_queue: boolean | null;
  adds_to_dnc: boolean | null;
  schedules_followup: boolean | null;
  default_followup_days: number | null;
  marks_as_success: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
  is_system: boolean | null;
}

interface DialerSettings {
  autoDialNext: boolean;
  delayBetweenCalls: number;
  showPreviewBeforeDial: boolean;
  playSoundOnConnect: boolean;
  connectSound: string;
  defaultMaxAttempts: number;
  defaultDaysBetweenAttempts: number;
  defaultCallingHoursStart: string;
  defaultCallingHoursEnd: string;
  defaultTimezone: string;
  defaultCallingDays: string[];
  respectDNC: boolean;
  respectTCPA: boolean;
  autoSkipRecentlyCalled: boolean;
  skipIfCalledWithinDays: number;
  enableKeyboardShortcuts: boolean;
  enableRecording: boolean;
  recordingAnnouncement: boolean;
  autoDeleteRecordingsAfterDays: number | null;
  autoTranscribe: boolean;
  recordingAccess: string;
  logCallsToGHL: boolean;
  updateGHLDisposition: boolean;
  createGHLFollowupTasks: boolean;
  createCalendarEvents: boolean;
  sendCalendarInvite: boolean;
  addCalendarReminder: boolean;
  emailDailySummary: boolean;
  dailySummaryTime: string;
}

const defaultSettings: DialerSettings = {
  autoDialNext: true,
  delayBetweenCalls: 5,
  showPreviewBeforeDial: false,
  playSoundOnConnect: true,
  connectSound: "chime",
  defaultMaxAttempts: 3,
  defaultDaysBetweenAttempts: 2,
  defaultCallingHoursStart: "09:00",
  defaultCallingHoursEnd: "20:00",
  defaultTimezone: "America/New_York",
  defaultCallingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  respectDNC: true,
  respectTCPA: true,
  autoSkipRecentlyCalled: true,
  skipIfCalledWithinDays: 7,
  enableKeyboardShortcuts: true,
  enableRecording: true,
  recordingAnnouncement: true,
  autoDeleteRecordingsAfterDays: 90,
  autoTranscribe: false,
  recordingAccess: "admins",
  logCallsToGHL: true,
  updateGHLDisposition: true,
  createGHLFollowupTasks: true,
  createCalendarEvents: true,
  sendCalendarInvite: true,
  addCalendarReminder: true,
  emailDailySummary: true,
  dailySummaryTime: "18:00",
};

export default function DialerSettings() {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();

  const [settings, setSettings] = React.useState<DialerSettings>(defaultSettings);
  const [editingDisposition, setEditingDisposition] = React.useState<Disposition | null>(null);
  const [isAddingDisposition, setIsAddingDisposition] = React.useState(false);
  const [newDisposition, setNewDisposition] = React.useState<Partial<Disposition>>({
    name: "",
    category: "neutral",
    icon: "📞",
    color: "#6366f1",
    keyboard_shortcut: null,
    removes_from_queue: false,
    adds_to_dnc: false,
    schedules_followup: false,
    default_followup_days: 3,
    marks_as_success: false,
    is_active: true,
  });

  // Fetch dispositions
  const { data: dispositions = [], isLoading: loadingDispositions } = useQuery({
    queryKey: ["call-dispositions", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from("call_dispositions")
        .select("*")
        .eq("organization_id", organizationId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Disposition[];
    },
    enabled: !!organizationId,
  });

  // Save disposition
  const saveDispositionMutation = useMutation({
    mutationFn: async (disposition: Partial<Disposition>) => {
      if (!organizationId || !user) throw new Error("Missing context");

      if (disposition.id) {
        const { error } = await supabase
          .from("call_dispositions")
          .update(disposition)
          .eq("id", disposition.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("call_dispositions").insert([{
          name: disposition.name || "",
          category: disposition.category || "neutral",
          icon: disposition.icon,
          color: disposition.color,
          keyboard_shortcut: disposition.keyboard_shortcut,
          removes_from_queue: disposition.removes_from_queue,
          adds_to_dnc: disposition.adds_to_dnc,
          schedules_followup: disposition.schedules_followup,
          default_followup_days: disposition.default_followup_days,
          marks_as_success: disposition.marks_as_success,
          is_active: disposition.is_active,
          organization_id: organizationId,
          user_id: user.id,
          sort_order: dispositions.length,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-dispositions"] });
      setEditingDisposition(null);
      setIsAddingDisposition(false);
      setNewDisposition({
        name: "",
        category: "neutral",
        icon: "📞",
        color: "#6366f1",
        keyboard_shortcut: null,
        removes_from_queue: false,
        adds_to_dnc: false,
        schedules_followup: false,
        default_followup_days: 3,
        marks_as_success: false,
        is_active: true,
      });
      toast.success("Disposition saved");
    },
    onError: (error) => {
      toast.error("Failed to save disposition");
      console.error(error);
    },
  });

  // Toggle disposition active
  const toggleDispositionMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("call_dispositions")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-dispositions"] });
    },
  });

  // Delete disposition
  const deleteDispositionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("call_dispositions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-dispositions"] });
      toast.success("Disposition deleted");
    },
  });

  const handleSettingChange = <K extends keyof DialerSettings>(
    key: K,
    value: DialerSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCallingDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      defaultCallingDays: prev.defaultCallingDays.includes(day)
        ? prev.defaultCallingDays.filter((d) => d !== day)
        : [...prev.defaultCallingDays, day],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, "success" | "destructive" | "secondary" | "warning" | "info"> = {
      positive: "success",
      negative: "destructive",
      neutral: "secondary",
      no_contact: "warning",
      bad_number: "info",
    };
    return variants[category] || "secondary";
  };

  const webhookUrls = {
    voice: `https://${organizationId}.functions.supabase.co/twilio-twiml`,
    status: `https://${organizationId}.functions.supabase.co/twilio-webhook`,
    recording: `https://${organizationId}.functions.supabase.co/twilio-recording`,
  };

  return (
    <AppLayout>
      <PageLayout title="Dialer Settings">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="dispositions" className="gap-2">
              <Check className="h-4 w-4" />
              Dispositions
            </TabsTrigger>
            <TabsTrigger value="caller-id" className="gap-2">
              <Phone className="h-4 w-4" />
              Caller ID
            </TabsTrigger>
            <TabsTrigger value="recording" className="gap-2">
              <Mic className="h-4 w-4" />
              Recording
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Link2 className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-6">
            {/* Dialing Behavior */}
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Dialing Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-dial next contact</Label>
                    <p className="text-small text-muted-foreground">
                      Automatically dial next contact after disposition
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoDialNext}
                    onCheckedChange={(v) => handleSettingChange("autoDialNext", v)}
                  />
                </div>

                {settings.autoDialNext && (
                  <div className="flex items-center gap-4 pl-4 border-l-2 border-muted">
                    <Label>Delay between calls</Label>
                    <Input
                      type="number"
                      value={settings.delayBetweenCalls}
                      onChange={(e) =>
                        handleSettingChange("delayBetweenCalls", parseInt(e.target.value) || 0)
                      }
                      className="w-20"
                    />
                    <span className="text-small text-muted-foreground">seconds</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show preview before dial</Label>
                    <p className="text-small text-muted-foreground">
                      Display contact info for review before calling
                    </p>
                  </div>
                  <Switch
                    checked={settings.showPreviewBeforeDial}
                    onCheckedChange={(v) => handleSettingChange("showPreviewBeforeDial", v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Play sound on connect</Label>
                    <p className="text-small text-muted-foreground">
                      Audio notification when call is answered
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={settings.connectSound}
                      onValueChange={(v) => handleSettingChange("connectSound", v)}
                      disabled={!settings.playSoundOnConnect}
                    >
                      <SelectTrigger className="w-32 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value="chime">Chime</SelectItem>
                        <SelectItem value="beep">Beep</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch
                      checked={settings.playSoundOnConnect}
                      onCheckedChange={(v) => handleSettingChange("playSoundOnConnect", v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Default Queue Settings */}
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Default Queue Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default max attempts</Label>
                    <Input
                      type="number"
                      value={settings.defaultMaxAttempts}
                      onChange={(e) =>
                        handleSettingChange("defaultMaxAttempts", parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Days between attempts</Label>
                    <Input
                      type="number"
                      value={settings.defaultDaysBetweenAttempts}
                      onChange={(e) =>
                        handleSettingChange(
                          "defaultDaysBetweenAttempts",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Calling hours start</Label>
                    <Input
                      type="time"
                      value={settings.defaultCallingHoursStart}
                      onChange={(e) =>
                        handleSettingChange("defaultCallingHoursStart", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Calling hours end</Label>
                    <Input
                      type="time"
                      value={settings.defaultCallingHoursEnd}
                      onChange={(e) =>
                        handleSettingChange("defaultCallingHoursEnd", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={settings.defaultTimezone}
                      onValueChange={(v) => handleSettingChange("defaultTimezone", v)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default calling days</Label>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <Button
                        key={day.id}
                        variant={
                          settings.defaultCallingDays.includes(day.id) ? "primary" : "outline"
                        }
                        size="sm"
                        onClick={() => toggleCallingDay(day.id)}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call Handling */}
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Call Handling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-success" />
                      Respect Do Not Call list
                    </Label>
                    <p className="text-small text-muted-foreground">
                      Strongly recommended for compliance
                    </p>
                  </div>
                  <Switch
                    checked={settings.respectDNC}
                    onCheckedChange={(v) => handleSettingChange("respectDNC", v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Respect TCPA quiet hours</Label>
                    <p className="text-small text-muted-foreground">
                      No calls before 8 AM or after 9 PM recipient's local time
                    </p>
                  </div>
                  <Switch
                    checked={settings.respectTCPA}
                    onCheckedChange={(v) => handleSettingChange("respectTCPA", v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-skip recently called</Label>
                    <p className="text-small text-muted-foreground">
                      Skip contacts called within specified days
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {settings.autoSkipRecentlyCalled && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={settings.skipIfCalledWithinDays}
                          onChange={(e) =>
                            handleSettingChange(
                              "skipIfCalledWithinDays",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-16"
                        />
                        <span className="text-small text-muted-foreground">days</span>
                      </div>
                    )}
                    <Switch
                      checked={settings.autoSkipRecentlyCalled}
                      onCheckedChange={(v) => handleSettingChange("autoSkipRecentlyCalled", v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card variant="default" padding="none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-h3">Keyboard Shortcuts</CardTitle>
                  <Switch
                    checked={settings.enableKeyboardShortcuts}
                    onCheckedChange={(v) => handleSettingChange("enableKeyboardShortcuts", v)}
                  />
                </div>
              </CardHeader>
              {settings.enableKeyboardShortcuts && (
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Shortcut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Start call</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Space</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>End call</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Escape</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Mute</TableCell>
                        <TableCell>
                          <Badge variant="secondary">M</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Hold</TableCell>
                        <TableCell>
                          <Badge variant="secondary">H</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Save & Next</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Enter</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <Button variant="link" className="mt-2 px-0">
                    Customize Shortcuts
                  </Button>
                </CardContent>
              )}
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" onClick={() => toast.success("Settings saved")}>
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* DISPOSITIONS TAB */}
          <TabsContent value="dispositions" className="space-y-6">
            <Card variant="default" padding="none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-h3">Active Dispositions</CardTitle>
                    <CardDescription>Drag to reorder. Click to edit.</CardDescription>
                  </div>
                  <Button variant="primary" onClick={() => setIsAddingDisposition(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Custom Disposition
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead>Disposition</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Shortcut</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead className="text-center">Enabled</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dispositions.map((disposition) => (
                      <TableRow key={disposition.id}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{disposition.icon || "📞"}</span>
                            <span className="font-medium">{disposition.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCategoryBadge(disposition.category)}>
                            {disposition.category.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {disposition.keyboard_shortcut ? (
                            <Badge variant="secondary">{disposition.keyboard_shortcut}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {disposition.removes_from_queue && (
                              <Badge variant="outline" size="sm">
                                Removes
                              </Badge>
                            )}
                            {disposition.schedules_followup && (
                              <Badge variant="outline" size="sm">
                                Schedules
                              </Badge>
                            )}
                            {disposition.adds_to_dnc && (
                              <Badge variant="outline" size="sm">
                                DNC
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={disposition.is_active ?? true}
                            onCheckedChange={(checked) =>
                              toggleDispositionMutation.mutate({
                                id: disposition.id,
                                is_active: checked,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingDisposition(disposition)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {!disposition.is_system && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteDispositionMutation.mutate(disposition.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {dispositions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No dispositions configured. Add your first disposition to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CALLER ID TAB */}
          <TabsContent value="caller-id" className="space-y-6">
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Outbound Caller ID</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-medium">
                  <div>
                    <Label>Your Twilio Number</Label>
                    <p className="text-h3 font-mono font-semibold">(555) 123-4567</p>
                  </div>
                  <Button variant="outline">Change Number</Button>
                </div>

                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <div className="flex gap-2">
                    <Input defaultValue="{{your_company}}" className="flex-1" />
                    <Button variant="outline">Edit</Button>
                  </div>
                  <p className="text-tiny text-muted-foreground">
                    Name shown on caller ID (if supported by carrier)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Local Presence</CardTitle>
                <CardDescription>Premium feature</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable local presence</Label>
                    <p className="text-small text-muted-foreground">
                      Display a local number matching the area code you're calling
                    </p>
                    <p className="text-tiny text-success mt-1">
                      Improves answer rates by 30-40%
                    </p>
                  </div>
                  <div className="text-right">
                    <Switch />
                    <p className="text-tiny text-muted-foreground mt-1">
                      +$0.01/call
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Caller ID Reputation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span className="font-medium">Good</span>
                  <span className="text-muted-foreground">- Your number has a healthy reputation</span>
                </div>

                <div className="bg-muted/30 rounded-medium p-4">
                  <p className="text-small font-medium mb-2">Tips to maintain good reputation:</p>
                  <ul className="text-small text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Don't make excessive calls to same numbers</li>
                    <li>Respect DNC requests promptly</li>
                    <li>Maintain reasonable answer rates</li>
                    <li>Avoid "spam likely" flags</li>
                  </ul>
                </div>

                <Button variant="outline">Check Reputation</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RECORDING TAB */}
          <TabsContent value="recording" className="space-y-6">
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Call Recording</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable call recording</Label>
                    <p className="text-small text-muted-foreground">
                      Record all calls for quality and training purposes
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableRecording}
                    onCheckedChange={(v) => handleSettingChange("enableRecording", v)}
                  />
                </div>

                {settings.enableRecording && (
                  <>
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Recording announcement</Label>
                        <p className="text-small text-muted-foreground">
                          Play "This call may be recorded" message
                        </p>
                        <p className="text-tiny text-warning mt-1">
                          Required in some states (two-party consent)
                        </p>
                      </div>
                      <Switch
                        checked={settings.recordingAnnouncement}
                        onCheckedChange={(v) => handleSettingChange("recordingAnnouncement", v)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Announcement audio</Label>
                      <div className="flex gap-2">
                        <Select defaultValue="default">
                          <SelectTrigger className="flex-1 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="custom">Upload Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline">Preview</Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Auto-delete recordings after</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          value={settings.autoDeleteRecordingsAfterDays || ""}
                          onChange={(e) =>
                            handleSettingChange(
                              "autoDeleteRecordingsAfterDays",
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          className="w-24"
                          disabled={settings.autoDeleteRecordingsAfterDays === null}
                        />
                        <span className="text-small text-muted-foreground">days</span>
                        <div className="flex items-center gap-2 ml-4">
                          <Checkbox
                            checked={settings.autoDeleteRecordingsAfterDays === null}
                            onCheckedChange={(checked) =>
                              handleSettingChange(
                                "autoDeleteRecordingsAfterDays",
                                checked ? null : 90
                              )
                            }
                          />
                          <Label className="font-normal">Never delete</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-medium">
                      <HardDrive className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-small font-medium">Storage used: 2.3 GB of 10 GB</p>
                        <div className="w-full h-2 bg-muted rounded-full mt-1">
                          <div className="w-[23%] h-full bg-primary rounded-full" />
                        </div>
                      </div>
                      <Button variant="link" className="px-0">
                        Manage Storage
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Transcription</CardTitle>
                <CardDescription>Premium feature</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-transcribe calls</Label>
                    <p className="text-small text-muted-foreground">
                      Uses AI to transcribe recorded calls
                    </p>
                    <p className="text-tiny text-muted-foreground mt-1">
                      Additional cost: $0.05/minute
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoTranscribe}
                    onCheckedChange={(v) => handleSettingChange("autoTranscribe", v)}
                  />
                </div>

                {settings.autoTranscribe && (
                  <div className="space-y-2">
                    <Label>Transcription language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-48 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Recording Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Who can access recordings</Label>
                  <Select
                    value={settings.recordingAccess}
                    onValueChange={(v) => handleSettingChange("recordingAccess", v)}
                  >
                    <SelectTrigger className="w-64 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="only_me">Only me</SelectItem>
                      <SelectItem value="admins">Admins and Managers</SelectItem>
                      <SelectItem value="all">All team members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" onClick={() => toast.success("Settings saved")}>
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* INTEGRATIONS TAB */}
          <TabsContent value="integrations" className="space-y-6">
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">CRM Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-medium">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-medium bg-primary/10 flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">GoHighLevel</p>
                      <Badge variant="success" size="sm">
                        Connected
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline">Disconnect</Button>
                </div>

                <div className="space-y-3">
                  <p className="text-small font-medium">When call is made:</p>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.logCallsToGHL}
                        onCheckedChange={(v) => handleSettingChange("logCallsToGHL", !!v)}
                      />
                      <Label className="font-normal">Log call in GHL contact timeline</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.updateGHLDisposition}
                        onCheckedChange={(v) => handleSettingChange("updateGHLDisposition", !!v)}
                      />
                      <Label className="font-normal">Update GHL contact with disposition</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.createGHLFollowupTasks}
                        onCheckedChange={(v) => handleSettingChange("createGHLFollowupTasks", !!v)}
                      />
                      <Label className="font-normal">Create task for follow-ups</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Calendar Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-medium">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Google Calendar</p>
                      <p className="text-small text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="primary">Connect</Button>
                </div>

                <div className="space-y-3">
                  <p className="text-small font-medium">When appointment is set:</p>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.createCalendarEvents}
                        onCheckedChange={(v) => handleSettingChange("createCalendarEvents", !!v)}
                      />
                      <Label className="font-normal">Create calendar event</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.sendCalendarInvite}
                        onCheckedChange={(v) => handleSettingChange("sendCalendarInvite", !!v)}
                      />
                      <Label className="font-normal">
                        Send calendar invite to contact (if email available)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.addCalendarReminder}
                        onCheckedChange={(v) => handleSettingChange("addCalendarReminder", !!v)}
                      />
                      <Label className="font-normal">Add reminder 1 hour before</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>SMS notification on missed callback</Label>
                      <p className="text-small text-muted-foreground">
                        Get notified when you miss a callback
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>Email daily call summary</Label>
                      <p className="text-small text-muted-foreground">
                        Receive a daily summary of your calling activity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={settings.dailySummaryTime}
                      onValueChange={(v) => handleSettingChange("dailySummaryTime", v)}
                      disabled={!settings.emailDailySummary}
                    >
                      <SelectTrigger className="w-32 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch
                      checked={settings.emailDailySummary}
                      onCheckedChange={(v) => handleSettingChange("emailDailySummary", v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Twilio Setup Section */}
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Phone System Setup</CardTitle>
                <CardDescription>Configure your Twilio integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-success text-white flex items-center justify-center text-small font-bold">
                      1
                    </div>
                    <span className="font-medium">Connect Twilio Account</span>
                    <Badge variant="success" size="sm">
                      Connected
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-success text-white flex items-center justify-center text-small font-bold">
                      2
                    </div>
                    <span className="font-medium">Get a Phone Number</span>
                    <Badge variant="success" size="sm">
                      (555) 123-4567
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-small font-bold">
                        3
                      </div>
                      <span className="font-medium">Configure Webhooks</span>
                    </div>
                    <div className="ml-8 p-4 bg-muted/30 rounded-medium space-y-2">
                      <p className="text-small text-muted-foreground mb-3">
                        Configure these URLs in your Twilio console:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-white rounded-small border">
                          <div>
                            <p className="text-tiny text-muted-foreground">Voice URL</p>
                            <p className="text-small font-mono truncate max-w-[400px]">
                              {webhookUrls.voice}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(webhookUrls.voice)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded-small border">
                          <div>
                            <p className="text-tiny text-muted-foreground">Status Callback</p>
                            <p className="text-small font-mono truncate max-w-[400px]">
                              {webhookUrls.status}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(webhookUrls.status)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded-small border">
                          <div>
                            <p className="text-tiny text-muted-foreground">Recording Callback</p>
                            <p className="text-small font-mono truncate max-w-[400px]">
                              {webhookUrls.recording}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(webhookUrls.recording)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Copy className="h-4 w-4 mr-1" />
                        Copy All URLs
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-small font-bold">
                      4
                    </div>
                    <span className="font-medium">Test Connection</span>
                  </div>
                  <div className="ml-8">
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Make Test Call
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-medium">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span className="text-small font-medium text-success">Ready to make calls</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" onClick={() => toast.success("Settings saved")}>
                Save Changes
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Disposition Modal */}
        <Dialog
          open={isAddingDisposition || !!editingDisposition}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingDisposition(false);
              setEditingDisposition(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingDisposition ? "Edit Disposition" : "Add Custom Disposition"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editingDisposition?.name || newDisposition.name}
                    onChange={(e) =>
                      editingDisposition
                        ? setEditingDisposition({ ...editingDisposition, name: e.target.value })
                        : setNewDisposition({ ...newDisposition, name: e.target.value })
                    }
                    placeholder="e.g., Callback Requested"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={editingDisposition?.icon || newDisposition.icon || "📞"}
                    onValueChange={(v) =>
                      editingDisposition
                        ? setEditingDisposition({ ...editingDisposition, icon: v })
                        : setNewDisposition({ ...newDisposition, icon: v })
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <SelectItem key={emoji} value={emoji}>
                          {emoji}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editingDisposition?.category || newDisposition.category}
                    onValueChange={(v) =>
                      editingDisposition
                        ? setEditingDisposition({ ...editingDisposition, category: v })
                        : setNewDisposition({ ...newDisposition, category: v })
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {DISPOSITION_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div>
                            <span>{cat.label}</span>
                            <span className="text-muted-foreground ml-2 text-tiny">
                              ({cat.description})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Keyboard Shortcut</Label>
                  <Select
                    value={
                      editingDisposition?.keyboard_shortcut ||
                      newDisposition.keyboard_shortcut ||
                      "none"
                    }
                    onValueChange={(v) => {
                      const value = v === "none" ? null : v;
                      editingDisposition
                        ? setEditingDisposition({
                            ...editingDisposition,
                            keyboard_shortcut: value,
                          })
                        : setNewDisposition({ ...newDisposition, keyboard_shortcut: value });
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="none">None</SelectItem>
                      {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                        <SelectItem key={num} value={num}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Behavior</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        editingDisposition?.removes_from_queue ??
                        newDisposition.removes_from_queue ??
                        false
                      }
                      onCheckedChange={(v) =>
                        editingDisposition
                          ? setEditingDisposition({
                              ...editingDisposition,
                              removes_from_queue: !!v,
                            })
                          : setNewDisposition({ ...newDisposition, removes_from_queue: !!v })
                      }
                    />
                    <Label className="font-normal">Removes contact from queue</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        editingDisposition?.adds_to_dnc ?? newDisposition.adds_to_dnc ?? false
                      }
                      onCheckedChange={(v) =>
                        editingDisposition
                          ? setEditingDisposition({ ...editingDisposition, adds_to_dnc: !!v })
                          : setNewDisposition({ ...newDisposition, adds_to_dnc: !!v })
                      }
                    />
                    <Label className="font-normal">Adds number to Do Not Call list</Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={
                        editingDisposition?.schedules_followup ??
                        newDisposition.schedules_followup ??
                        false
                      }
                      onCheckedChange={(v) =>
                        editingDisposition
                          ? setEditingDisposition({
                              ...editingDisposition,
                              schedules_followup: !!v,
                            })
                          : setNewDisposition({ ...newDisposition, schedules_followup: !!v })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label className="font-normal">Schedules automatic follow-up</Label>
                      {(editingDisposition?.schedules_followup ??
                        newDisposition.schedules_followup) && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-small text-muted-foreground">
                            Days until follow-up:
                          </span>
                          <Input
                            type="number"
                            value={
                              editingDisposition?.default_followup_days ??
                              newDisposition.default_followup_days ??
                              3
                            }
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              editingDisposition
                                ? setEditingDisposition({
                                    ...editingDisposition,
                                    default_followup_days: val,
                                  })
                                : setNewDisposition({
                                    ...newDisposition,
                                    default_followup_days: val,
                                  });
                            }}
                            className="w-16"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        editingDisposition?.marks_as_success ??
                        newDisposition.marks_as_success ??
                        false
                      }
                      onCheckedChange={(v) =>
                        editingDisposition
                          ? setEditingDisposition({
                              ...editingDisposition,
                              marks_as_success: !!v,
                            })
                          : setNewDisposition({ ...newDisposition, marks_as_success: !!v })
                      }
                    />
                    <Label className="font-normal">Counts as "success" in stats</Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingDisposition(false);
                  setEditingDisposition(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  saveDispositionMutation.mutate(editingDisposition || newDisposition);
                }}
                disabled={
                  !(editingDisposition?.name || newDisposition.name) ||
                  saveDispositionMutation.isPending
                }
              >
                Save Disposition
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageLayout>
    </AppLayout>
  );
}
