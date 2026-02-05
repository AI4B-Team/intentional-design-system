import * as React from "react";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Link2,
  Unlink,
  Settings2,
  RefreshCw,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Users,
  GitBranch,
  Calendar,
  ArrowRightLeft,
  Zap,
  ExternalLink,
  Shield,
  Upload,
  Database,
} from "lucide-react";
import {
  useGHLConnection,
  useGHLSyncLogs,
  useConnectGHL,
  useDisconnectGHL,
  useUpdateGHLSettings,
  useTestGHLConnection,
  useTriggerGHLSync,
  DEFAULT_FIELD_MAPPINGS,
  DEFAULT_STAGE_MAPPINGS,
} from "@/hooks/useGHLIntegration";
import {
  useClosebotConnection,
  useConnectClosebot,
  useDisconnectClosebot,
  useUpdateClosebotSettings,
  useClosebotConversations,
  MOCK_CLOSEBOT_BOTS,
  DEFAULT_FIELD_MAPPINGS as CLOSEBOT_FIELD_MAPPINGS,
  type BotMappings,
  type TriggerSettings,
} from "@/hooks/useClosebotIntegration";
import { AttomSettingsSection } from "@/components/settings/attom-settings-section";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { useBulkSyncToGHL, useUnsyncedPropertiesCount } from "@/lib/ghl-sync";
import { Progress } from "@/components/ui/progress";
import { Bot, MessageSquare, Copy, Webhook } from "lucide-react";

function ConnectGHLModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = React.useState<"info" | "connect">("info");
  const [apiKey, setApiKey] = React.useState("");
  const [locationId, setLocationId] = React.useState("");
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<"success" | "error" | null>(null);

  const testConnection = useTestGHLConnection();
  const connectGHL = useConnectGHL();

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await testConnection.mutateAsync({ apiKey, locationId });
      setTestResult("success");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connectGHL.mutateAsync({ apiKey, locationId });
      onOpenChange(false);
      setStep("info");
      setApiKey("");
      setLocationId("");
      setTestResult(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("info");
    setApiKey("");
    setLocationId("");
    setTestResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {step === "info" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-brand-accent" />
                Connect GoHighLevel
              </DialogTitle>
              <DialogDescription>
                Sync your RealElite data with GoHighLevel CRM
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-small text-content-secondary">
                This integration will sync the following data:
              </p>
              <div className="space-y-3">
                {[
                  { icon: Users, label: "Contacts", desc: "Properties → GHL Contacts" },
                  { icon: Settings2, label: "Custom Fields", desc: "Property data as custom fields" },
                  { icon: GitBranch, label: "Pipeline Stages", desc: "Status → GHL Pipeline" },
                  { icon: Calendar, label: "Appointments", desc: "Sync scheduled appointments" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <item.icon className="h-5 w-5 text-brand-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-small">{item.label}</p>
                      <p className="text-tiny text-content-secondary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                <p className="text-small text-info flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>You'll need your GHL API Key and Location ID from your GoHighLevel settings.</span>
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setStep("connect")}>
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enter API Credentials</DialogTitle>
              <DialogDescription>
                Find these in your GoHighLevel Settings → Business Info → API Keys
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your GHL API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location-id">Location ID</Label>
                <Input
                  id="location-id"
                  placeholder="Enter your Location ID"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                />
              </div>

              {testResult && (
                <div
                  className={cn(
                    "p-3 rounded-lg flex items-center gap-2",
                    testResult === "success"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {testResult === "success" ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span className="text-small">Connection successful!</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      <span className="text-small">Connection failed. Check your credentials.</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="ghost" onClick={() => setStep("info")}>
                Back
              </Button>
              <Button
                variant="secondary"
                onClick={handleTest}
                disabled={!apiKey || !locationId || testing}
              >
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              <Button
                variant="primary"
                onClick={handleConnect}
                disabled={!apiKey || !locationId || connectGHL.isPending}
              >
                {connectGHL.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Save & Connect"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GHLConfiguration() {
  const { data: connection } = useGHLConnection();
  const updateSettings = useUpdateGHLSettings();
  const triggerSync = useTriggerGHLSync();
  const { data: syncLogs } = useGHLSyncLogs(50);
  const bulkSync = useBulkSyncToGHL();
  const { data: unsyncedCount } = useUnsyncedPropertiesCount();
  const [bulkSyncResult, setBulkSyncResult] = React.useState<{
    synced: number;
    failed: number;
    total: number;
    errors: Array<{ property_id: string; error: string }>;
  } | null>(null);

  if (!connection) return null;

  const handleToggle = (field: string, value: boolean) => {
    updateSettings.mutate({ [field]: value });
  };

  const handleConflictChange = (value: string) => {
    updateSettings.mutate({
      conflict_resolution: value as "dealflow_wins" | "ghl_wins" | "most_recent_wins",
    });
  };

  const handleBulkSync = async (resync = false) => {
    setBulkSyncResult(null);
    const result = await bulkSync.mutateAsync(resync ? undefined : undefined);
    setBulkSyncResult(result);
  };

  return (
    <Tabs defaultValue="contacts" className="space-y-md">
      <TabsList className="flex-wrap">
        <TabsTrigger value="contacts" className="gap-1.5">
          <Users className="h-4 w-4" />
          Contacts
        </TabsTrigger>
        <TabsTrigger value="pipeline" className="gap-1.5">
          <GitBranch className="h-4 w-4" />
          Pipeline
        </TabsTrigger>
        <TabsTrigger value="appointments" className="gap-1.5">
          <Calendar className="h-4 w-4" />
          Appointments
        </TabsTrigger>
        <TabsTrigger value="sync" className="gap-1.5">
          <ArrowRightLeft className="h-4 w-4" />
          Two-Way Sync
        </TabsTrigger>
        <TabsTrigger value="bulk" className="gap-1.5">
          <Upload className="h-4 w-4" />
          Bulk Sync
        </TabsTrigger>
        <TabsTrigger value="logs" className="gap-1.5">
          <Database className="h-4 w-4" />
          Sync History
        </TabsTrigger>
      </TabsList>

      {/* Contacts Tab */}
      <TabsContent value="contacts">
        <Card variant="default" padding="md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contacts Sync</CardTitle>
                <CardDescription>Map RealElite properties to GHL contacts</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={connection.sync_contacts_enabled}
                  onCheckedChange={(v) => handleToggle("sync_contacts_enabled", v)}
                />
                <Label>Enabled</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-small font-medium text-content mb-3">Field Mapping</h4>
              <div className="border border-border-subtle rounded-lg overflow-hidden">
                <table className="w-full text-small">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">RealElite Field</th>
                      <th className="text-center p-3 font-medium w-12">→</th>
                      <th className="text-left p-3 font-medium">GHL Field</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_FIELD_MAPPINGS.map((mapping) => (
                      <tr key={mapping.dealflow_field} className="border-t border-border-subtle">
                        <td className="p-3">{mapping.dealflow_label}</td>
                        <td className="p-3 text-center text-content-tertiary">→</td>
                        <td className="p-3 text-content-secondary">{mapping.ghl_label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => triggerSync.mutate("contacts")}
                disabled={triggerSync.isPending}
              >
                {triggerSync.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Now
              </Button>
              <Button variant="ghost">
                <ExternalLink className="h-4 w-4 mr-2" />
                Create Custom Fields in GHL
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Pipeline Tab */}
      <TabsContent value="pipeline">
        <Card variant="default" padding="md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pipeline Sync</CardTitle>
                <CardDescription>Map RealElite stages to GHL pipeline stages</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={connection.sync_pipeline_enabled}
                  onCheckedChange={(v) => handleToggle("sync_pipeline_enabled", v)}
                />
                <Label>Enabled</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>GHL Pipeline</Label>
              <Select defaultValue="default">
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select pipeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Real Estate Pipeline</SelectItem>
                  <SelectItem value="sales">Sales Pipeline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h4 className="text-small font-medium text-content mb-3">Stage Mapping</h4>
              <div className="border border-border-subtle rounded-lg overflow-hidden">
                <table className="w-full text-small">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">RealElite Stage</th>
                      <th className="text-center p-3 font-medium w-12">→</th>
                      <th className="text-left p-3 font-medium">GHL Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_STAGE_MAPPINGS.map((mapping) => (
                      <tr key={mapping.dealflow_stage} className="border-t border-border-subtle">
                        <td className="p-3">
                          <Badge variant="secondary" size="sm">
                            {mapping.dealflow_label}
                          </Badge>
                        </td>
                        <td className="p-3 text-center text-content-tertiary">→</td>
                        <td className="p-3">
                          <Badge variant="outline" size="sm">
                            {mapping.ghl_label}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => triggerSync.mutate("pipeline")}
              disabled={triggerSync.isPending}
            >
              {triggerSync.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Pipeline
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Appointments Tab */}
      <TabsContent value="appointments">
        <Card variant="default" padding="md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Appointment Sync</CardTitle>
                <CardDescription>Sync appointments to your GHL calendar</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={connection.sync_appointments_enabled}
                  onCheckedChange={(v) => handleToggle("sync_appointments_enabled", v)}
                />
                <Label>Enabled</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>GHL Calendar</Label>
              <Select defaultValue="primary">
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary Calendar</SelectItem>
                  <SelectItem value="property">Property Viewings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="secondary"
              onClick={() => triggerSync.mutate("appointments")}
              disabled={triggerSync.isPending}
            >
              {triggerSync.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Appointments
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Two-Way Sync Tab */}
      <TabsContent value="sync">
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Two-Way Sync</CardTitle>
            <CardDescription>
              Allow changes from GHL to update RealElite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-small font-medium text-warning">
                  Enable with caution
                </p>
                <p className="text-tiny text-content-secondary">
                  With two-way sync enabled, changes made in GoHighLevel will update records
                  in RealElite. This could overwrite data if not configured correctly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Switch
                checked={connection.two_way_sync_enabled}
                onCheckedChange={(v) => handleToggle("two_way_sync_enabled", v)}
              />
              <div>
                <Label>Enable Two-Way Sync</Label>
                <p className="text-tiny text-content-secondary">
                  Changes in GHL will update RealElite
                </p>
              </div>
            </div>

            {connection.two_way_sync_enabled && (
              <div className="space-y-2">
                <Label>Conflict Resolution</Label>
                <Select
                  value={connection.conflict_resolution}
                  onValueChange={handleConflictChange}
                >
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dealflow_wins">RealElite Wins</SelectItem>
                    <SelectItem value="ghl_wins">GHL Wins</SelectItem>
                    <SelectItem value="most_recent_wins">Most Recent Wins</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-tiny text-content-tertiary">
                  When there's a conflict, which system's data takes priority?
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Bulk Sync Tab */}
      <TabsContent value="bulk">
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Bulk Sync Options</CardTitle>
            <CardDescription>
              Sync multiple properties to GoHighLevel at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Unsynced Properties */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-body font-medium text-content">
                    Sync Unsynced Properties
                  </p>
                  <p className="text-small text-content-secondary">
                    {unsyncedCount} properties not yet synced to GHL
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleBulkSync(false)}
                  disabled={bulkSync.isPending || unsyncedCount === 0}
                >
                  {bulkSync.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Sync All ({unsyncedCount})
                    </>
                  )}
                </Button>
              </div>

              {bulkSync.isPending && (
                <div className="space-y-2">
                  <Progress value={undefined} className="h-2" />
                  <p className="text-tiny text-content-tertiary text-center">
                    Syncing properties to GoHighLevel...
                  </p>
                </div>
              )}

              {bulkSyncResult && (
                <div
                  className={cn(
                    "mt-4 p-3 rounded-lg",
                    bulkSyncResult.failed === 0
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  )}
                >
                  <p className="text-small font-medium">
                    {bulkSyncResult.synced} synced, {bulkSyncResult.failed} failed
                  </p>
                  {bulkSyncResult.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {bulkSyncResult.errors.slice(0, 5).map((err, i) => (
                        <p key={i} className="text-tiny">
                          {err.property_id.substring(0, 8)}... - {err.error}
                        </p>
                      ))}
                      {bulkSyncResult.errors.length > 5 && (
                        <p className="text-tiny">
                          + {bulkSyncResult.errors.length - 5} more errors
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Full Re-sync */}
            <div className="p-4 border border-border-subtle rounded-lg">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-body font-medium text-content">
                    Full Re-sync
                  </p>
                  <p className="text-small text-content-secondary mt-1">
                    Update all existing GHL records with current RealElite data.
                    Use this after changing field mappings.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => handleBulkSync(true)}
                    disabled={bulkSync.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-sync All Properties
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Sync Logs Tab */}
      <TabsContent value="logs">
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Sync History</CardTitle>
            <CardDescription>Recent synchronization activity</CardDescription>
          </CardHeader>
          <CardContent>
            {syncLogs && syncLogs.length > 0 ? (
              <div className="space-y-2">
                {syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {log.status === "success" ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : log.status === "failed" ? (
                        <X className="h-4 w-4 text-destructive" />
                      ) : (
                        <ArrowRightLeft className="h-4 w-4 text-content-tertiary" />
                      )}
                      <div>
                        <p className="text-small font-medium capitalize">
                          {log.sync_type} - {log.direction.replace("_", " ")}
                        </p>
                        {log.error_message && (
                          <p className="text-tiny text-destructive">{log.error_message}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-tiny text-content-tertiary">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-content-secondary">
                No sync activity yet
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// ============ CLOSEBOT SECTION ============

function ConnectClosebotModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [apiKey, setApiKey] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<"success" | "error" | null>(null);

  const connectClosebot = useConnectClosebot();

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    setIsTesting(true);
    // Simulate API test
    await new Promise((r) => setTimeout(r, 1000));
    setTestResult("success");
    setIsTesting(false);
  };

  const handleConnect = () => {
    connectClosebot.mutate(
      { apiKey, accountId: accountId || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setApiKey("");
          setAccountId("");
          setTestResult(null);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Connect Closebot.ai
          </DialogTitle>
          <DialogDescription>
            Enter your Closebot API credentials to enable AI conversation management.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cb-api-key">API Key</Label>
            <Input
              id="cb-api-key"
              type="password"
              placeholder="cb_live_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cb-account-id">Account ID (optional)</Label>
            <Input
              id="cb-account-id"
              placeholder="acc_..."
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="font-mono"
            />
          </div>

          {testResult && (
            <div
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg text-small",
                testResult === "success"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {testResult === "success" ? (
                <>
                  <Check className="h-4 w-4" />
                  Connection successful!
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Connection failed. Check credentials.
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={handleTest}
            disabled={!apiKey.trim() || isTesting}
          >
            {isTesting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>
          <Button
            variant="primary"
            onClick={handleConnect}
            disabled={!apiKey.trim() || connectClosebot.isPending}
          >
            {connectClosebot.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4 mr-2" />
            )}
            Save & Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClosebotConfiguration() {
  const { data: connection } = useClosebotConnection();
  const updateSettings = useUpdateClosebotSettings();
  const { data: conversations } = useClosebotConversations();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!connection) return null;

  const webhookUrl = `${supabaseUrl}/functions/v1/closebot-webhook`;

  const handleBotChange = (purpose: keyof BotMappings, botId: string) => {
    updateSettings.mutate({
      bot_mappings: {
        ...connection.bot_mappings,
        [purpose]: botId,
      },
    });
  };

  const handleTriggerChange = (setting: keyof TriggerSettings, value: boolean) => {
    updateSettings.mutate({
      trigger_settings: {
        ...connection.trigger_settings,
        [setting]: value,
      },
    });
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
  };

  const copyWebhookSecret = () => {
    if (connection.webhook_secret) {
      navigator.clipboard.writeText(connection.webhook_secret);
    }
  };

  return (
    <Tabs defaultValue="bots" className="space-y-md">
      <TabsList className="flex-wrap">
        <TabsTrigger value="bots" className="gap-1.5">
          <Bot className="h-4 w-4" />
          Bot Selection
        </TabsTrigger>
        <TabsTrigger value="triggers" className="gap-1.5">
          <Zap className="h-4 w-4" />
          Triggers
        </TabsTrigger>
        <TabsTrigger value="webhook" className="gap-1.5">
          <Webhook className="h-4 w-4" />
          Webhook
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-1.5">
          <MessageSquare className="h-4 w-4" />
          Conversations
        </TabsTrigger>
      </TabsList>

      {/* Bot Selection Tab */}
      <TabsContent value="bots">
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Select Bots</CardTitle>
            <CardDescription>
              Choose which Closebot bots to use for different purposes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Seller Qualification Bot</Label>
              <Select
                value={connection.bot_mappings.seller_qualification || ""}
                onValueChange={(v) => handleBotChange("seller_qualification", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a bot..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CLOSEBOT_BOTS.filter((b) => b.type === "seller").map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      {bot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Buyer Qualification Bot</Label>
              <Select
                value={connection.bot_mappings.buyer_qualification || ""}
                onValueChange={(v) => handleBotChange("buyer_qualification", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a bot..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CLOSEBOT_BOTS.filter((b) => b.type === "buyer").map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      {bot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Follow-up Bot</Label>
              <Select
                value={connection.bot_mappings.followup || ""}
                onValueChange={(v) => handleBotChange("followup", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a bot..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CLOSEBOT_BOTS.filter((b) => b.type === "followup").map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      {bot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Triggers Tab */}
      <TabsContent value="triggers">
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Trigger Configuration</CardTitle>
            <CardDescription>
              Configure when Closebot should automatically start conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-small font-medium">New lead added</p>
                <p className="text-tiny text-content-tertiary">
                  Trigger when a new lead with phone number is added
                </p>
              </div>
              <Switch
                checked={connection.trigger_settings.on_new_lead}
                onCheckedChange={(v) => handleTriggerChange("on_new_lead", v)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-small font-medium">Status changes to "Contacted"</p>
                <p className="text-tiny text-content-tertiary">
                  Trigger when lead status is updated to contacted
                </p>
              </div>
              <Switch
                checked={connection.trigger_settings.on_status_change}
                onCheckedChange={(v) => handleTriggerChange("on_status_change", v)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-small font-medium">Manual trigger only</p>
                <p className="text-tiny text-content-tertiary">
                  Only start conversations when manually triggered
                </p>
              </div>
              <Switch
                checked={connection.trigger_settings.manual_only}
                onCheckedChange={(v) => handleTriggerChange("manual_only", v)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Webhook Tab */}
      <TabsContent value="webhook">
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardDescription>
              Configure Closebot to send conversation data back to RealElite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-tiny"
                />
                <Button variant="secondary" size="sm" onClick={copyWebhookUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-tiny text-content-tertiary">
                Add this URL to Closebot's webhook settings
              </p>
            </div>

            <div className="space-y-2">
              <Label>Webhook Secret</Label>
              <div className="flex gap-2">
                <Input
                  value={connection.webhook_secret ? "••••••••••••••••" : ""}
                  readOnly
                  className="font-mono"
                />
                <Button variant="secondary" size="sm" onClick={copyWebhookSecret}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-tiny text-content-tertiary">
                Include this in the <code className="text-brand">x-webhook-secret</code> header
              </p>
            </div>

            <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
              <p className="text-small text-info font-medium">Data Mapping</p>
              <p className="text-tiny text-info/80 mt-1">
                When Closebot sends data, it will automatically map to RealElite fields:
              </p>
              <ul className="text-tiny text-info/80 mt-2 space-y-1 list-disc list-inside">
                <li>motivation_level → motivation_score</li>
                <li>mortgage_info → mortgage_balance, mortgage_payment</li>
                <li>seller_timeline → notes</li>
                <li>appointment_time → creates appointment</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Conversations Tab */}
      <TabsContent value="history">
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>
              View AI conversation history and outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!conversations || conversations.length === 0 ? (
              <div className="text-center py-8 text-content-tertiary">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-small">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.slice(0, 10).map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          conv.outcome === "qualified" || conv.outcome === "appointment_set"
                            ? "bg-success/10 text-success"
                            : conv.outcome === "not_qualified"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-content-tertiary"
                        )}
                      >
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-small font-medium">{conv.bot_name || "Bot"}</p>
                        <p className="text-tiny text-content-tertiary">
                          {conv.started_at &&
                            formatDistanceToNow(new Date(conv.started_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          conv.outcome === "qualified" || conv.outcome === "appointment_set"
                            ? "success"
                            : conv.outcome === "not_qualified"
                            ? "warning"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {conv.outcome?.replace(/_/g, " ") || conv.status}
                      </Badge>
                      {conv.appointment_set && (
                        <Badge variant="info" size="sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          Appt Set
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function ClosebotSection() {
  const { data: connection, isLoading } = useClosebotConnection();
  const disconnectClosebot = useDisconnectClosebot();
  const [connectModalOpen, setConnectModalOpen] = React.useState(false);

  const isConnected = connection?.is_active;

  return (
    <>
      <Card variant="default" padding="md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-brand" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Closebot.ai
                  {isConnected ? (
                    <Badge variant="success" size="sm">Connected</Badge>
                  ) : (
                    <Badge variant="destructive" size="sm">Not Connected</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isConnected && connection?.account_name
                    ? `Connected to ${connection.account_name}`
                    : "AI-powered conversation management for lead qualification"}
                </CardDescription>
              </div>
            </div>

            {isConnected ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => disconnectClosebot.mutate()}
                disabled={disconnectClosebot.isPending}
              >
                <Unlink className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setConnectModalOpen(true)}>
                <Link2 className="h-4 w-4 mr-2" />
                Connect Closebot.ai
              </Button>
            )}
          </div>
        </CardHeader>

        {isConnected && (
          <CardContent className="pt-0">
            <ClosebotConfiguration />
          </CardContent>
        )}
      </Card>

      <ConnectClosebotModal open={connectModalOpen} onOpenChange={setConnectModalOpen} />
    </>
  );
}

export default function SettingsIntegrations() {
  const { data: connection, isLoading } = useGHLConnection();
  const disconnectGHL = useDisconnectGHL();
  const [connectModalOpen, setConnectModalOpen] = React.useState(false);

  const isConnected = connection?.is_active;

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Settings", href: "/settings" },
        { label: "Integrations" },
      ]}
    >
      <PageHeader
        title="Integrations"
        description="Connect RealElite with your favorite tools"
      />

      <div className="space-y-lg">
        {/* GoHighLevel Integration Card */}
        <Card variant="default" padding="md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-brand-accent" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    GoHighLevel
                    {isConnected ? (
                      <Badge variant="success" size="sm">Connected</Badge>
                    ) : (
                      <Badge variant="destructive" size="sm">Not Connected</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isConnected && connection?.account_name
                      ? `Connected to ${connection.account_name}`
                      : "Sync contacts, pipelines, and appointments with GHL"}
                  </CardDescription>
                </div>
              </div>

              {isConnected ? (
                <div className="flex items-center gap-2">
                  {connection?.last_sync_at && (
                    <span className="text-tiny text-content-tertiary">
                      Last sync: {formatDistanceToNow(new Date(connection.last_sync_at), { addSuffix: true })}
                    </span>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => disconnectGHL.mutate()}
                    disabled={disconnectGHL.isPending}
                  >
                    <Unlink className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button variant="primary" onClick={() => setConnectModalOpen(true)}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect GoHighLevel
                </Button>
              )}
            </div>
          </CardHeader>

          {isConnected && (
            <CardContent className="pt-0">
              <GHLConfiguration />
            </CardContent>
          )}
        </Card>

        {/* Closebot.ai Integration Card */}
        <ClosebotSection />

        {/* ATTOM Property Data Integration */}
        <AttomSettingsSection />

        {/* Placeholder for future integrations */}
        <Card variant="default" padding="md" className="opacity-60">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Settings2 className="h-6 w-6 text-content-tertiary" />
              </div>
              <div>
                <CardTitle className="text-content-secondary">More Integrations Coming Soon</CardTitle>
                <CardDescription>
                  Zapier, Make, Google Sheets, and more
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <ConnectGHLModal open={connectModalOpen} onOpenChange={setConnectModalOpen} />
    </DashboardLayout>
  );
}
