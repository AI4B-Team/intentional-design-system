import * as React from "react";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  useFamilyApps,
  useOrgAppLinks,
  useFamilyEvents,
  useOrgWebhooks,
  useLaunchFamilyApp,
  useManageFamilyApps,
  useEmitFamilyEvent,
  useCallFamilyAppAction,
  useIntegrationCheck,
  type IntegrationCheckResult,
} from "@/hooks/useAppFamily";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { HUB_EVENT_CATALOG } from "@/lib/hubEvents";
import { FamilyEventsFeed } from "@/components/settings/FamilyEventsFeed";
import { HubIntegrationGuide } from "@/components/settings/HubIntegrationGuide";
import { Boxes, ExternalLink, Loader2, Trash2, Webhook, Activity, Copy, Settings2, Terminal, ShieldCheck, RefreshCw } from "lucide-react";




const INGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hub-events-ingest`;

export default function AppFamilySettings() {
  const { data: apps = [], isLoading: appsLoading } = useFamilyApps();
  const { data: links = [] } = useOrgAppLinks();
  const { data: events = [] } = useFamilyEvents();
  const {
    data: webhooks = [],
    addWebhook,
    toggleWebhook,
    removeWebhook,
    setWebhookEventTypes,
    rotateWebhookSecret,
  } = useOrgWebhooks();
  const launch = useLaunchFamilyApp();
  const { saveApp, toggleApp, removeApp } = useManageFamilyApps();
  const emitEvent = useEmitFamilyEvent();
  const { hasRole } = useOrganizationContext();
  const isAdmin = hasRole("admin");
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [pending, setPending] = React.useState<string | null>(null);
  const [urlDrafts, setUrlDrafts] = React.useState<Record<string, string>>({});
  const [newApp, setNewApp] = React.useState({ slug: "", name: "", base_url: "" });
  const callAction = useCallFamilyAppAction();
  const integrationCheck = useIntegrationCheck();
  const [checking, setChecking] = React.useState<string | null>(null);
  const [checkResult, setCheckResult] = React.useState<IntegrationCheckResult | null>(null);

  const handleRunCheck = async (slug: string) => {
    setChecking(slug);
    setCheckResult(null);
    try {
      const res = await integrationCheck.mutateAsync(slug);
      setCheckResult(res);
      toast({
        title: res.passed === res.total ? "Integration Ready" : "Integration Issues Found",
        description: `${res.passed}/${res.total} checks passed for ${slug}.`,
        variant: res.passed === res.total ? undefined : "destructive",
      });
    } catch (e: any) {
      toast({
        title: "Check Failed",
        description: e?.message ?? "Could not run the integration check.",
        variant: "destructive",
      });
    } finally {
      setChecking(null);
    }
  };

  const [actionForm, setActionForm] = React.useState<{
    appSlug: string;
    action: string;
    method: "GET" | "POST";
    params: string;
  }>({ appSlug: "", action: "", method: "POST", params: "" });
  const [actionResult, setActionResult] = React.useState<string | null>(null);

  const handleRunAction = async () => {
    if (!actionForm.appSlug || !actionForm.action.trim()) {
      toast({
        title: "Missing Details",
        description: "Pick an app and enter an action name.",
        variant: "destructive",
      });
      return;
    }
    let params: Record<string, unknown> = {};
    if (actionForm.params.trim()) {
      try {
        params = JSON.parse(actionForm.params);
      } catch {
        toast({
          title: "Invalid JSON",
          description: "Params must be valid JSON.",
          variant: "destructive",
        });
        return;
      }
    }
    setActionResult(null);
    try {
      const res = await callAction.mutateAsync({
        appSlug: actionForm.appSlug,
        action: actionForm.action.trim(),
        method: actionForm.method,
        params,
      });
      setActionResult(JSON.stringify(res, null, 2));
      toast({
        title: res.ok ? "Action Succeeded" : "Action Returned An Error",
        description: `${res.status} · ${res.target}`,
        variant: res.ok ? undefined : "destructive",
      });
    } catch (e: any) {
      setActionResult(String(e?.message ?? e));
      toast({
        title: "Could Not Call Action",
        description: e?.message ?? "Request failed.",
        variant: "destructive",
      });
    }
  };




  const linkFor = (slug: string) => links.find((l) => l.app_slug === slug);

  const handleLaunch = async (slug: string) => {
    setPending(slug);
    try {
      const url = await launch.mutateAsync(slug);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast({
        title: "Could Not Open App",
        description: e?.message ?? "Handoff link failed.",
        variant: "destructive",
      });
    } finally {
      setPending(null);
    }
  };

  const handleAddWebhook = async () => {
    if (!/^https?:\/\//i.test(webhookUrl)) {
      toast({ title: "Invalid URL", description: "Enter a full https URL.", variant: "destructive" });
      return;
    }
    await addWebhook.mutateAsync(webhookUrl);
    setWebhookUrl("");
    toast({ title: "Webhook Added" });
  };

  const handleSaveApp = async (
    app: { slug: string; name: string; base_url: string; description?: string | null; enabled?: boolean },
    nextUrl: string,
  ) => {
    if (!/^https?:\/\//i.test(nextUrl)) {
      toast({ title: "Invalid URL", description: "Enter the app's full published URL.", variant: "destructive" });
      return;
    }
    try {
      await saveApp.mutateAsync({ ...app, base_url: nextUrl });
      toast({ title: "App Saved" });
    } catch (e: any) {
      toast({ title: "Could Not Save", description: e?.message, variant: "destructive" });
    }
  };

  const handleAddApp = async () => {
    const slug = newApp.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!slug || !newApp.name.trim()) {
      toast({ title: "Missing Fields", description: "Slug and name are required.", variant: "destructive" });
      return;
    }
    await handleSaveApp({ slug, name: newApp.name.trim(), base_url: newApp.base_url, enabled: true }, newApp.base_url);
    setNewApp({ slug: "", name: "", base_url: "" });
  };


  return (
    <DashboardLayout>
      <PageHeader
        title="App Family"
        description="Real Elite is the hub. Launch satellite apps with single sign-on, watch their events, and forward them anywhere."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-primary" /> Connected Apps
            </CardTitle>
            <CardDescription>
              Opening an app signs you in with your Real Elite organization and user identity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {appsLoading && <div className="text-sm text-muted-foreground">Loading apps…</div>}
            {!appsLoading && apps.length === 0 && (
              <div className="text-sm text-muted-foreground">No family apps registered yet.</div>
            )}
            {apps.map((app) => {
              const link = linkFor(app.slug);
              return (
                <div
                  key={app.slug}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{app.name}</span>
                      <Badge variant={link?.linked_at ? "default" : "secondary"}>
                        {link?.linked_at ? "Linked" : "Not Linked"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.description}</p>
                    {link?.last_event_at && (
                      <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                        Last Event: {new Date(link.last_event_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                    <Button
                      variant="outline"
                      onClick={() => handleRunCheck(app.slug)}
                      disabled={checking === app.slug}
                    >
                      {checking === app.slug ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="mr-2 h-4 w-4" />
                      )}
                      Run Integration Check
                    </Button>
                    <Button
                      onClick={() => handleLaunch(app.slug)}
                      disabled={pending === app.slug || !app.enabled}
                    >
                      {pending === app.slug ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="mr-2 h-4 w-4" />
                      )}
                      Open {app.name}
                    </Button>
                  </div>
                </div>
              );
            })}
            {checkResult && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {checkResult.app_slug} — {checkResult.passed}/{checkResult.total} Checks Passed
                </div>
                {checkResult.checks.map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0 text-foreground">{c.label}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {c.detail}
                      </span>
                      <Badge variant={c.ok ? "default" : "destructive"}>
                        {c.ok ? "Pass" : "Fail"}
                      </Badge>
                    </span>
                  </div>
                ))}
              </div>
            )}

          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" /> App Registry
              </CardTitle>
              <CardDescription>
                Point each app at its real published URL. Handoff links are built as{" "}
                <code className="text-xs">{"{base_url}/auth/hub?token=…"}</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apps.map((app) => (
                <div key={app.slug} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{app.name}</span>
                      <Badge variant="outline" className="font-mono text-xs">{app.slug}</Badge>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Label className="text-xs text-muted-foreground">Enabled</Label>
                      <Switch
                        checked={app.enabled}
                        onCheckedChange={(enabled) => toggleApp.mutate({ slug: app.slug, enabled })}
                      />
                      <Button size="sm" variant="ghost" onClick={() => removeApp.mutate(app.slug)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={urlDrafts[app.slug] ?? app.base_url}
                      onChange={(e) =>
                        setUrlDrafts((d) => ({ ...d, [app.slug]: e.target.value }))
                      }
                      placeholder="https://app.example.com"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleSaveApp(app, urlDrafts[app.slug] ?? app.base_url)
                      }
                      disabled={saveApp.isPending}
                    >
                      Save URL
                    </Button>
                  </div>
                </div>
              ))}

              <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                <div className="text-sm font-medium text-foreground">Register Another App</div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    placeholder="slug"
                    value={newApp.slug}
                    onChange={(e) => setNewApp({ ...newApp, slug: e.target.value })}
                  />
                  <Input
                    placeholder="Name"
                    value={newApp.name}
                    onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                  />
                  <Input
                    placeholder="https://app.example.com"
                    value={newApp.base_url}
                    onChange={(e) => setNewApp({ ...newApp, base_url: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddApp} disabled={saveApp.isPending}>
                  Add App
                </Button>
              </div>
            </CardContent>
          </Card>
        )}


        <FamilyEventsFeed />


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-primary" /> Outbound Webhooks
            </CardTitle>
            <CardDescription>
              Every event received is forwarded to these URLs, signed with the webhook secret in an{" "}
              <code className="text-xs">x-webhook-signature</code> header. Outbound hub events are
              also pushed to each enabled app at <code className="text-xs">/api/hub/events</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="https://your-endpoint.example.com/hooks/real-elite"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Button onClick={handleAddWebhook} disabled={addWebhook.isPending}>
                Add Webhook
              </Button>
              <Button
                variant="outline"
                disabled={emitEvent.isPending}
                onClick={async () => {
                  try {
                    const delivered = await emitEvent.mutateAsync({
                      eventType: "hub.test",
                      payload: { source: "settings", at: new Date().toISOString() },
                    });
                    toast({
                      title: "Test Event Sent",
                      description: delivered.length
                        ? delivered.map((d) => `${d.target}: ${d.status}`).join(" · ")
                        : "No enabled apps or webhooks to deliver to.",
                    });
                  } catch (e: any) {
                    toast({
                      title: "Could Not Send Event",
                      description: e?.message ?? "Emit failed.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                {emitEvent.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Activity className="mr-2 h-3.5 w-3.5" />
                )}
                Send Test Event
              </Button>
            </div>


            {webhooks.map((w) => (
              <div key={w.id} className="space-y-3 rounded-lg border border-border p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{w.url}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {w.last_delivery_at
                        ? `Last Delivery: ${new Date(w.last_delivery_at).toLocaleString()} · ${w.last_delivery_status}`
                        : "No deliveries yet"}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Enabled</Label>
                      <Switch
                        checked={w.enabled}
                        onCheckedChange={(enabled) =>
                          toggleWebhook.mutate({ id: w.id, enabled })
                        }
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(w.secret);
                        toast({ title: "Secret Copied" });
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={rotateWebhookSecret.isPending}
                      onClick={async () => {
                        const secret = await rotateWebhookSecret.mutateAsync(w.id);
                        await navigator.clipboard.writeText(secret).catch(() => undefined);
                        toast({
                          title: "Secret Rotated",
                          description: "The new secret is copied — update your endpoint now.",
                        });
                      }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeWebhook.mutate(w.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Subscribed Events — none selected means every event type is delivered.
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {HUB_EVENT_CATALOG.map((evt) => {
                      const selected = (w.event_types ?? []).includes(evt.type);
                      return (
                        <button
                          key={evt.type}
                          type="button"
                          title={evt.description}
                          disabled={setWebhookEventTypes.isPending}
                          onClick={() => {
                            const current = w.event_types ?? [];
                            const eventTypes = selected
                              ? current.filter((t) => t !== evt.type)
                              : [...current, evt.type];
                            setWebhookEventTypes.mutate({ id: w.id, eventTypes });
                          }}
                          className={`rounded-full border px-2.5 py-1 font-mono text-xs transition-colors ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {evt.type}
                        </button>
                      );
                    })}
                  </div>
                  {(w.event_types ?? []).length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setWebhookEventTypes.mutate({ id: w.id, eventTypes: [] })
                      }
                    >
                      Subscribe To All Events
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" /> Satellite Actions
            </CardTitle>
            <CardDescription>
              Call any satellite app's authenticated endpoint at{" "}
              <code className="text-xs">/api/hub/actions/&lt;action&gt;</code>. Requests are signed
              with the shared hub secret, so the hub consumes app actions instead of rebuilding them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={actionForm.appSlug}
                onChange={(e) => setActionForm({ ...actionForm, appSlug: e.target.value })}
              >
                <option value="">Select App</option>
                {apps.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="jobs/status"
                value={actionForm.action}
                onChange={(e) => setActionForm({ ...actionForm, action: e.target.value })}
              />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={actionForm.method}
                onChange={(e) =>
                  setActionForm({ ...actionForm, method: e.target.value as "GET" | "POST" })
                }
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
            </div>
            <Input
              placeholder='{"list_id":"..."}'
              className="font-mono text-xs"
              value={actionForm.params}
              onChange={(e) => setActionForm({ ...actionForm, params: e.target.value })}
            />
            <Button onClick={handleRunAction} disabled={callAction.isPending}>
              {callAction.isPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Terminal className="mr-2 h-3.5 w-3.5" />
              )}
              Run Action
            </Button>
            {actionResult && (
              <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
                {actionResult}
              </pre>
            )}
          </CardContent>
        </Card>

        <HubIntegrationGuide />
      </div>

    </DashboardLayout>
  );
}

