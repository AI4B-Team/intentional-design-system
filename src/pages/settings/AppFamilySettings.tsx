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
} from "@/hooks/useAppFamily";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { Boxes, ExternalLink, Loader2, Trash2, Webhook, Activity, Copy, Settings2 } from "lucide-react";

const INGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hub-events-ingest`;

export default function AppFamilySettings() {
  const { data: apps = [], isLoading: appsLoading } = useFamilyApps();
  const { data: links = [] } = useOrgAppLinks();
  const { data: events = [] } = useFamilyEvents();
  const { data: webhooks = [], addWebhook, toggleWebhook, removeWebhook } = useOrgWebhooks();
  const launch = useLaunchFamilyApp();
  const { saveApp, toggleApp, removeApp } = useManageFamilyApps();
  const { hasRole } = useOrganizationContext();
  const isAdmin = hasRole("admin");
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [pending, setPending] = React.useState<string | null>(null);
  const [urlDrafts, setUrlDrafts] = React.useState<Record<string, string>>({});
  const [newApp, setNewApp] = React.useState({ slug: "", name: "", base_url: "" });


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
                  <Button
                    onClick={() => handleLaunch(app.slug)}
                    disabled={pending === app.slug || !app.enabled}
                    className="shrink-0"
                  >
                    {pending === app.slug ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Open {app.name}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Incoming Events
            </CardTitle>
            <CardDescription>
              Events satellite apps have sent to this organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No events yet. Apps post to this endpoint with an HMAC signature:
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
                    {INGEST_URL}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(INGEST_URL);
                      toast({ title: "Endpoint Copied" });
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {events.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{e.app_slug}</Badge>
                        <span className="font-mono text-sm text-foreground">{e.event_type}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {JSON.stringify(e.payload)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {new Date(e.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-primary" /> Outbound Webhooks
            </CardTitle>
            <CardDescription>
              Every event received is forwarded to these URLs, signed with the webhook secret in an{" "}
              <code className="text-xs">x-hub-signature</code> header.
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
            </div>

            {webhooks.map((w) => (
              <div
                key={w.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
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
                  <Button size="sm" variant="ghost" onClick={() => removeWebhook.mutate(w.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
