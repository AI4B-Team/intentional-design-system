import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Activity, Copy, Loader2, RefreshCw, Trash2, Webhook } from "lucide-react";
import { HUB_EVENT_CATALOG } from "@/lib/hubEvents";
import { useEmitFamilyEvent, useOrgWebhooks } from "@/hooks/useAppFamily";

/** Org-level outbound webhook endpoints with per-event-type subscriptions. */
export function OutboundWebhooksCard() {
  const {
    data: webhooks = [],
    addWebhook,
    toggleWebhook,
    removeWebhook,
    setWebhookEventTypes,
    rotateWebhookSecret,
  } = useOrgWebhooks();
  const emitEvent = useEmitFamilyEvent();
  const [webhookUrl, setWebhookUrl] = React.useState("");

  const handleAddWebhook = async () => {
    if (!/^https?:\/\//i.test(webhookUrl)) {
      toast({ title: "Invalid URL", description: "Enter a full https URL.", variant: "destructive" });
      return;
    }
    await addWebhook.mutateAsync(webhookUrl);
    setWebhookUrl("");
    toast({ title: "Webhook Added" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-4 w-4 text-primary" /> Outbound Webhooks
        </CardTitle>
        <CardDescription>
          Every event received is forwarded to these URLs, signed with the webhook secret in an{" "}
          <code className="text-xs">x-webhook-signature</code> header. Outbound hub events are also
          pushed to each enabled app at <code className="text-xs">/api/hub/events</code>.
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
              } catch (e: unknown) {
                toast({
                  title: "Could Not Send Event",
                  description: e instanceof Error ? e.message : "Emit failed.",
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
                    onCheckedChange={(enabled) => toggleWebhook.mutate({ id: w.id, enabled })}
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
                  onClick={() => setWebhookEventTypes.mutate({ id: w.id, eventTypes: [] })}
                >
                  Subscribe To All Events
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default OutboundWebhooksCard;
