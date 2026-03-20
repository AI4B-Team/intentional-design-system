import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot, Phone, Zap, Clock, PhoneForwarded, Mic,
  Settings, RefreshCw, Activity, Calendar, Shield,
  Play, Square, Loader2,
} from "lucide-react";

interface AgentConfig {
  id?: string;
  vapi_assistant_id: string;
  vapi_phone_number_id: string;
  agent_name: string;
  agent_voice: string;
  agent_prompt: string;
  first_message: string;
  is_active: boolean;
  inbound_enabled: boolean;
  speed_to_lead_enabled: boolean;
  speed_to_lead_delay_seconds: number;
  followup_enabled: boolean;
  followup_max_attempts: number;
  followup_interval_hours: number;
  hot_lead_transfer_enabled: boolean;
  transfer_phone_number: string;
  transfer_threshold: string;
  working_hours_start: string;
  working_hours_end: string;
  working_days: string[];
  timezone: string;
}

const defaultConfig: AgentConfig = {
  vapi_assistant_id: "",
  vapi_phone_number_id: "",
  agent_name: "AIVA",
  agent_voice: "jennifer",
  agent_prompt: "",
  first_message: "Hi, this is AIVA. I'm calling about your property. Do you have a moment to chat?",
  is_active: false,
  inbound_enabled: true,
  speed_to_lead_enabled: true,
  speed_to_lead_delay_seconds: 60,
  followup_enabled: false,
  followup_max_attempts: 3,
  followup_interval_hours: 24,
  hot_lead_transfer_enabled: true,
  transfer_phone_number: "",
  transfer_threshold: "high",
  working_hours_start: "09:00",
  working_hours_end: "18:00",
  working_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  timezone: "America/New_York",
};

const VOICE_OPTIONS = [
  { value: "jennifer", label: "Jennifer (Warm, Professional)" },
  { value: "sarah", label: "Sarah (Friendly, Conversational)" },
  { value: "jessica", label: "Jessica (Confident, Direct)" },
  { value: "laura", label: "Laura (Empathetic, Calm)" },
  { value: "chris", label: "Chris (Authoritative, Male)" },
  { value: "brian", label: "Brian (Friendly, Male)" },
  { value: "daniel", label: "Daniel (Professional, Male)" },
  { value: "roger", label: "Roger (Deep, Reassuring)" },
];

const DAY_OPTIONS = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

export default function AIAgentSettings() {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();
  const [config, setConfig] = React.useState<AgentConfig>(defaultConfig);
  const [isCreatingAssistant, setIsCreatingAssistant] = React.useState(false);

  // Fetch existing config
  const { data: existingConfig, isLoading } = useQuery({
    queryKey: ["voice-agent-config", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const { data, error } = await supabase
        .from("voice_agent_config")
        .select("*")
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  React.useEffect(() => {
    if (existingConfig) {
      setConfig({
        id: existingConfig.id,
        vapi_assistant_id: existingConfig.vapi_assistant_id || "",
        vapi_phone_number_id: existingConfig.vapi_phone_number_id || "",
        agent_name: existingConfig.agent_name || "AIVA",
        agent_voice: existingConfig.agent_voice || "jennifer",
        agent_prompt: existingConfig.agent_prompt || "",
        first_message: existingConfig.first_message || defaultConfig.first_message,
        is_active: existingConfig.is_active || false,
        inbound_enabled: existingConfig.inbound_enabled ?? true,
        speed_to_lead_enabled: existingConfig.speed_to_lead_enabled ?? true,
        speed_to_lead_delay_seconds: existingConfig.speed_to_lead_delay_seconds || 60,
        followup_enabled: existingConfig.followup_enabled || false,
        followup_max_attempts: existingConfig.followup_max_attempts || 3,
        followup_interval_hours: existingConfig.followup_interval_hours || 24,
        hot_lead_transfer_enabled: existingConfig.hot_lead_transfer_enabled ?? true,
        transfer_phone_number: existingConfig.transfer_phone_number || "",
        transfer_threshold: existingConfig.transfer_threshold || "high",
        working_hours_start: existingConfig.working_hours_start || "09:00",
        working_hours_end: existingConfig.working_hours_end || "18:00",
        working_days: existingConfig.working_days || defaultConfig.working_days,
        timezone: existingConfig.timezone || "America/New_York",
      });
    }
  }, [existingConfig]);

  // Save config mutation
  const saveMutation = useMutation({
    mutationFn: async (data: AgentConfig) => {
      if (!organizationId || !user) throw new Error("Missing context");

      const payload = {
        organization_id: organizationId,
        user_id: user.id,
        ...data,
      };
      delete (payload as any).id;

      if (existingConfig?.id) {
        const { error } = await supabase
          .from("voice_agent_config")
          .update(payload)
          .eq("id", existingConfig.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("voice_agent_config")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("AI Agent configuration saved");
      queryClient.invalidateQueries({ queryKey: ["voice-agent-config"] });
    },
    onError: (err: any) => {
      toast.error("Failed to save: " + err.message);
    },
  });

  // Create Vapi assistant
  const handleCreateAssistant = async () => {
    setIsCreatingAssistant(true);
    try {
      const { data, error } = await supabase.functions.invoke("vapi-create-assistant", {
        body: {
          agent_name: config.agent_name,
          agent_voice: config.agent_voice,
          agent_prompt: config.agent_prompt,
          first_message: config.first_message,
          transfer_phone_number: config.transfer_phone_number,
        },
      });
      if (error) throw error;
      if (data?.assistant_id) {
        setConfig((prev) => ({ ...prev, vapi_assistant_id: data.assistant_id }));
        toast.success(`AI Assistant "${data.name}" created successfully!`);
      }
    } catch (err: any) {
      toast.error("Failed to create assistant: " + err.message);
    } finally {
      setIsCreatingAssistant(false);
    }
  };

  const handleSave = () => saveMutation.mutate(config);

  const toggleDay = (day: string) => {
    setConfig((prev) => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter((d) => d !== day)
        : [...prev.working_days, day],
    }));
  };

  // Fetch call stats
  const { data: callStats } = useQuery({
    queryKey: ["voice-agent-stats", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const { data, error } = await supabase
        .from("voice_agent_calls")
        .select("outcome, direction, appointment_scheduled, duration_seconds")
        .eq("organization_id", organizationId);
      if (error) throw error;

      const total = data?.length || 0;
      const appointments = data?.filter((c) => c.appointment_scheduled).length || 0;
      const transferred = data?.filter((c) => c.outcome === "transferred").length || 0;
      const avgDuration = total > 0
        ? Math.round(data.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / total)
        : 0;

      return { total, appointments, transferred, avgDuration };
    },
    enabled: !!organizationId,
  });

  if (isLoading) {
    return (
      <PageLayout title="AI Acquisition Agent">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  return (
    <AppLayout>
      <PageLayout
        title="AI Acquisition Agent"
        headerActions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${config.is_active ? "bg-success animate-pulse" : "bg-muted-foreground/40"}`} />
              <span className="text-sm text-muted-foreground">{config.is_active ? "Active" : "Inactive"}</span>
            </div>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Configuration
            </Button>
          </div>
        }
      >
        {/* Stats Bar */}
        {callStats && callStats.total > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold">{callStats.total}</div>
              <div className="text-xs text-muted-foreground">Total AI Calls</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-success">{callStats.appointments}</div>
              <div className="text-xs text-muted-foreground">Appointments Set</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-info">{callStats.transferred}</div>
              <div className="text-xs text-muted-foreground">Hot Transfers</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">{Math.floor(callStats.avgDuration / 60)}:{String(callStats.avgDuration % 60).padStart(2, "0")}</div>
              <div className="text-xs text-muted-foreground">Avg Duration</div>
            </Card>
          </div>
        )}

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general"><Bot className="h-4 w-4 mr-1.5" />General</TabsTrigger>
            <TabsTrigger value="voice"><Mic className="h-4 w-4 mr-1.5" />Voice & Script</TabsTrigger>
            <TabsTrigger value="behavior"><Zap className="h-4 w-4 mr-1.5" />Behavior</TabsTrigger>
            <TabsTrigger value="schedule"><Clock className="h-4 w-4 mr-1.5" />Schedule</TabsTrigger>
            <TabsTrigger value="transfer"><PhoneForwarded className="h-4 w-4 mr-1.5" />Transfer</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Agent Status
                </CardTitle>
                <CardDescription>Enable or disable the AI acquisition agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <div className="font-medium">AI Agent Active</div>
                    <div className="text-sm text-muted-foreground">When active, the agent will handle calls according to your configuration</div>
                  </div>
                  <Switch checked={config.is_active} onCheckedChange={(v) => setConfig((p) => ({ ...p, is_active: v }))} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vapi Configuration</CardTitle>
                <CardDescription>Connect your Vapi assistant and phone number</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vapi Assistant ID</Label>
                    <div className="flex gap-2">
                      <Input
                        value={config.vapi_assistant_id}
                        onChange={(e) => setConfig((p) => ({ ...p, vapi_assistant_id: e.target.value }))}
                        placeholder="asst_..."
                      />
                      <Button variant="outline" onClick={handleCreateAssistant} disabled={isCreatingAssistant}>
                        {isCreatingAssistant ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        {config.vapi_assistant_id ? "Recreate" : "Create"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Click "Create" to auto-generate an assistant, or paste an existing ID from Vapi dashboard</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Vapi Phone Number ID</Label>
                    <Input
                      value={config.vapi_phone_number_id}
                      onChange={(e) => setConfig((p) => ({ ...p, vapi_phone_number_id: e.target.value }))}
                      placeholder="Phone number ID from Vapi"
                    />
                    <p className="text-xs text-muted-foreground">Import your Twilio number into Vapi, then paste the phone number ID here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capabilities</CardTitle>
                <CardDescription>Choose which modes the AI agent operates in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-info" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Inbound Call Handling</div>
                      <div className="text-xs text-muted-foreground">Answer 100% of inbound calls, qualify leads</div>
                    </div>
                  </div>
                  <Switch checked={config.inbound_enabled} onCheckedChange={(v) => setConfig((p) => ({ ...p, inbound_enabled: v }))} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Speed-to-Lead</div>
                      <div className="text-xs text-muted-foreground">Call new leads within {config.speed_to_lead_delay_seconds}s of submission</div>
                    </div>
                  </div>
                  <Switch checked={config.speed_to_lead_enabled} onCheckedChange={(v) => setConfig((p) => ({ ...p, speed_to_lead_enabled: v }))} />
                </div>

                {config.speed_to_lead_enabled && (
                  <div className="ml-11 space-y-2">
                    <Label>Delay before calling (seconds)</Label>
                    <Input
                      type="number"
                      value={config.speed_to_lead_delay_seconds}
                      onChange={(e) => setConfig((p) => ({ ...p, speed_to_lead_delay_seconds: parseInt(e.target.value) || 60 }))}
                      min={10}
                      max={300}
                      className="w-32"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Follow-Up Campaigns</div>
                      <div className="text-xs text-muted-foreground">Automatically call aged pipeline leads</div>
                    </div>
                  </div>
                  <Switch checked={config.followup_enabled} onCheckedChange={(v) => setConfig((p) => ({ ...p, followup_enabled: v }))} />
                </div>

                {config.followup_enabled && (
                  <div className="ml-11 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max follow-up attempts</Label>
                      <Input
                        type="number"
                        value={config.followup_max_attempts}
                        onChange={(e) => setConfig((p) => ({ ...p, followup_max_attempts: parseInt(e.target.value) || 3 }))}
                        min={1}
                        max={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hours between attempts</Label>
                      <Input
                        type="number"
                        value={config.followup_interval_hours}
                        onChange={(e) => setConfig((p) => ({ ...p, followup_interval_hours: parseInt(e.target.value) || 24 }))}
                        min={1}
                        max={168}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice & Script Tab */}
          <TabsContent value="voice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice & Personality
                </CardTitle>
                <CardDescription>Configure how your AI agent sounds and behaves on calls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Agent Name</Label>
                    <Input
                      value={config.agent_name}
                      onChange={(e) => setConfig((p) => ({ ...p, agent_name: e.target.value }))}
                      placeholder="AIVA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Voice</Label>
                    <Select value={config.agent_voice} onValueChange={(v) => setConfig((p) => ({ ...p, agent_voice: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICE_OPTIONS.map((v) => (
                          <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>First Message</Label>
                  <Textarea
                    value={config.first_message}
                    onChange={(e) => setConfig((p) => ({ ...p, first_message: e.target.value }))}
                    rows={2}
                    placeholder="Hi, this is AIVA..."
                  />
                  <p className="text-xs text-muted-foreground">Use {"{{contact_name}}"} and {"{{property_address}}"} as dynamic placeholders</p>
                </div>

                <div className="space-y-2">
                  <Label>Agent Prompt (System Instructions)</Label>
                  <Textarea
                    value={config.agent_prompt}
                    onChange={(e) => setConfig((p) => ({ ...p, agent_prompt: e.target.value }))}
                    rows={12}
                    placeholder="Leave blank to use the default acquisition agent prompt. Or customize the agent's personality, conversation flow, and rules here..."
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">Leave blank for the default real estate acquisition prompt. Customize to match your brand voice.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Call Behavior
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/30 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">What the AI Agent does automatically:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Looks up the property/contact in your CRM before speaking</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Updates the CRM with notes, lead score, and motivation level</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Creates follow-up tasks with appropriate urgency</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Schedules appointments when the lead agrees</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Transfers hot leads to your team in real-time</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Records and transcribes every conversation</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Respects DNC lists and working hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Working Hours
                </CardTitle>
                <CardDescription>The agent will only make outbound calls during these hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={config.working_hours_start}
                      onChange={(e) => setConfig((p) => ({ ...p, working_hours_start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={config.working_hours_end}
                      onChange={(e) => setConfig((p) => ({ ...p, working_hours_end: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={config.timezone} onValueChange={(v) => setConfig((p) => ({ ...p, timezone: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern</SelectItem>
                        <SelectItem value="America/Chicago">Central</SelectItem>
                        <SelectItem value="America/Denver">Mountain</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Active Days</Label>
                  <div className="flex gap-2">
                    {DAY_OPTIONS.map((day) => (
                      <Button
                        key={day.value}
                        variant={config.working_days.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfer Tab */}
          <TabsContent value="transfer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneForwarded className="h-5 w-5" />
                  Live Transfer Settings
                </CardTitle>
                <CardDescription>Configure when and where the AI transfers hot leads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Enable Live Transfer</div>
                    <div className="text-xs text-muted-foreground">AI will transfer high-intent leads to your team</div>
                  </div>
                  <Switch
                    checked={config.hot_lead_transfer_enabled}
                    onCheckedChange={(v) => setConfig((p) => ({ ...p, hot_lead_transfer_enabled: v }))}
                  />
                </div>

                {config.hot_lead_transfer_enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Transfer Phone Number</Label>
                      <Input
                        value={config.transfer_phone_number}
                        onChange={(e) => setConfig((p) => ({ ...p, transfer_phone_number: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                      <p className="text-xs text-muted-foreground">The phone number to forward hot leads to</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Transfer Threshold</Label>
                      <Select value={config.transfer_threshold} onValueChange={(v) => setConfig((p) => ({ ...p, transfer_threshold: v }))}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Intent Only</SelectItem>
                          <SelectItem value="medium">Medium+ Intent</SelectItem>
                          <SelectItem value="low">Any Interest</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {config.transfer_threshold === "high" && "Only transfer when seller is ready to discuss terms or explicitly wants to sell ASAP"}
                        {config.transfer_threshold === "medium" && "Transfer when seller shows genuine interest or asks about the process"}
                        {config.transfer_threshold === "low" && "Transfer any lead that doesn't immediately decline"}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageLayout>
    </AppLayout>
  );
}
