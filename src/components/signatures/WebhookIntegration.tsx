import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Webhook,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Zap,
  Link2,
  Copy,
  Code2,
  Send,
  Eye,
  PenTool,
  Clock,
  RotateCcw,
  TestTube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  secret?: string;
  createdAt: Date;
  lastTriggeredAt?: Date;
  failureCount: number;
  successCount: number;
}

type WebhookEvent = "document.created" | "document.sent" | "document.viewed" | "document.signed" | "document.declined" | "document.expired" | "document.voided" | "signer.completed" | "reminder.sent";

interface WebhookLog {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: "success" | "failed" | "pending";
  statusCode?: number;
  responseTime?: number;
  timestamp: Date;
  payload: string;
}

interface EmbedLink {
  id: string;
  label: string;
  url: string;
  documentName: string;
  embedType: "iframe" | "redirect" | "popup";
  createdAt: Date;
}

// ─── Mock Data ──────────────────────────────────────────────

const mockWebhooks: WebhookConfig[] = [
  {
    id: "wh-1",
    name: "Zapier — CRM Update",
    url: "https://hooks.zapier.com/hooks/catch/12345/abcdef/",
    events: ["document.signed", "document.declined"],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 14),
    lastTriggeredAt: new Date(Date.now() - 3600000),
    failureCount: 0,
    successCount: 47,
  },
  {
    id: "wh-2",
    name: "Slack Notifications",
    url: "https://hooks.slack.com/services/T123/B456/xyz",
    events: ["document.signed", "document.viewed", "document.sent"],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 7),
    lastTriggeredAt: new Date(Date.now() - 7200000),
    failureCount: 2,
    successCount: 31,
  },
];

const mockLogs: WebhookLog[] = [
  { id: "l1", webhookId: "wh-1", event: "document.signed", status: "success", statusCode: 200, responseTime: 142, timestamp: new Date(Date.now() - 3600000), payload: '{"event":"document.signed","document_id":"doc-123"}' },
  { id: "l2", webhookId: "wh-2", event: "document.viewed", status: "success", statusCode: 200, responseTime: 89, timestamp: new Date(Date.now() - 7200000), payload: '{"event":"document.viewed","document_id":"doc-456"}' },
  { id: "l3", webhookId: "wh-2", event: "document.sent", status: "failed", statusCode: 500, responseTime: 3000, timestamp: new Date(Date.now() - 86400000), payload: '{"event":"document.sent","document_id":"doc-789"}' },
];

const allEvents: { value: WebhookEvent; label: string; icon: React.ElementType }[] = [
  { value: "document.created", label: "Document Created", icon: Plus },
  { value: "document.sent", label: "Document Sent", icon: Send },
  { value: "document.viewed", label: "Document Viewed", icon: Eye },
  { value: "document.signed", label: "Document Signed", icon: PenTool },
  { value: "document.declined", label: "Document Declined", icon: XCircle },
  { value: "document.expired", label: "Document Expired", icon: Clock },
  { value: "document.voided", label: "Document Voided", icon: XCircle },
  { value: "signer.completed", label: "Signer Completed", icon: CheckCircle },
  { value: "reminder.sent", label: "Reminder Sent", icon: RotateCcw },
];

// ─── Component ──────────────────────────────────────────────

export function WebhookIntegration() {
  const [webhooks, setWebhooks] = React.useState<WebhookConfig[]>(mockWebhooks);
  const [logs] = React.useState<WebhookLog[]>(mockLogs);
  const [activeTab, setActiveTab] = React.useState<"webhooks" | "logs" | "embed">("webhooks");
  const [addOpen, setAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newUrl, setNewUrl] = React.useState("");
  const [newEvents, setNewEvents] = React.useState<WebhookEvent[]>([]);

  const toggleEvent = (event: WebhookEvent) => {
    setNewEvents((prev) => prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]);
  };

  const handleAddWebhook = () => {
    if (!newName || !newUrl || newEvents.length === 0) {
      toast.error("Fill all fields and select at least one event");
      return;
    }
    const wh: WebhookConfig = {
      id: `wh-${Date.now()}`,
      name: newName,
      url: newUrl,
      events: newEvents,
      isActive: true,
      secret: `whsec_${Math.random().toString(36).slice(2, 18)}`,
      createdAt: new Date(),
      failureCount: 0,
      successCount: 0,
    };
    setWebhooks((prev) => [...prev, wh]);
    setAddOpen(false);
    setNewName("");
    setNewUrl("");
    setNewEvents([]);
    toast.success("Webhook created");
  };

  const handleTest = (wh: WebhookConfig) => {
    toast.success(`Test event sent to ${wh.name}`);
  };

  const handleDelete = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    toast.success("Webhook deleted");
  };

  const embedLink: EmbedLink = {
    id: "emb-1",
    label: "Embeddable Signing Link",
    url: `https://sign.realelite.app/embed/${Math.random().toString(36).slice(2, 10)}`,
    documentName: "Purchase Agreement",
    embedType: "iframe",
    createdAt: new Date(),
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-subtle">
        {[
          { key: "webhooks" as const, label: "Webhooks", icon: Webhook },
          { key: "logs" as const, label: "Delivery Logs", icon: Code2 },
          { key: "embed" as const, label: "Embed & API", icon: Link2 },
        ].map((tab) => (
          <button
            key={tab.key}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.key ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Webhooks */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{webhooks.length} webhook{webhooks.length !== 1 && "s"} configured</p>
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Webhook
            </Button>
          </div>

          {webhooks.map((wh) => (
            <Card key={wh.id} padding="md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", wh.isActive ? "bg-success/10" : "bg-muted")}>
                    <Webhook className={cn("h-5 w-5", wh.isActive ? "text-success" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{wh.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">{wh.url}</p>
                  </div>
                </div>
                <Switch checked={wh.isActive} onCheckedChange={(checked) => setWebhooks((prev) => prev.map((w) => w.id === wh.id ? { ...w, isActive: checked } : w))} />
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {wh.events.map((event) => (
                  <Badge key={event} variant="outline" className="text-[10px]">{event}</Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-subtle text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" />{wh.successCount} sent</span>
                {wh.failureCount > 0 && <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" />{wh.failureCount} failed</span>}
                {wh.lastTriggeredAt && <span>Last: {format(wh.lastTriggeredAt, "MMM d, h:mm a")}</span>}
                <div className="ml-auto flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleTest(wh)}>
                    <TestTube className="h-3 w-3" />Test
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive gap-1" onClick={() => handleDelete(wh.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delivery Logs */}
      {activeTab === "logs" && (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary text-sm">
              {log.status === "success" ? <CheckCircle className="h-4 w-4 text-success flex-shrink-0" /> : <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{log.event}</Badge>
                  <span className="text-xs text-muted-foreground">{log.statusCode && `${log.statusCode}`}</span>
                  <span className="text-xs text-muted-foreground">{log.responseTime}ms</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{format(log.timestamp, "MMM d, h:mm a")}</span>
            </div>
          ))}
        </div>
      )}

      {/* Embed & API */}
      {activeTab === "embed" && (
        <div className="space-y-4">
          {/* Embeddable signing link */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="h-4 w-4 text-brand" />
              <h4 className="text-sm font-semibold text-foreground">Embeddable Signing Links</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Generate embeddable links that can be placed in iframes, emails, or redirected to from your website.
            </p>
            <Card padding="sm" className="bg-surface-secondary">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-muted-foreground truncate">{embedLink.url}</code>
                <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => { navigator.clipboard.writeText(embedLink.url); toast.success("Link copied"); }}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          </Card>

          {/* API snippet */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="h-4 w-4 text-brand" />
              <h4 className="text-sm font-semibold text-foreground">API Usage</h4>
            </div>
            <div className="bg-foreground/5 rounded-lg p-3 overflow-x-auto">
              <pre className="text-xs font-mono text-foreground">
{`// Create a signature request
const response = await fetch('/api/signatures', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    template_id: 'tmpl_abc123',
    signers: [
      { name: 'John Doe', email: 'john@example.com' }
    ],
    variables: {
      purchase_price: '$150,000',
      property_address: '123 Main St'
    }
  })
});`}
              </pre>
            </div>
            <Button size="sm" variant="outline" className="mt-2 gap-1.5" onClick={() => { navigator.clipboard.writeText("// API snippet copied"); toast.success("Code copied"); }}>
              <Copy className="h-3.5 w-3.5" />
              Copy Code
            </Button>
          </Card>

          {/* Zapier-style triggers */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-warning" />
              <h4 className="text-sm font-semibold text-foreground">Automation Triggers</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Connect to Zapier, Make.com, or n8n to automate workflows when signature events occur.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { trigger: "When signed", action: "Update CRM deal stage" },
                { trigger: "When viewed", action: "Send Slack notification" },
                { trigger: "When declined", action: "Create follow-up task" },
                { trigger: "When expired", action: "Re-send with new deadline" },
              ].map((flow, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-surface-secondary text-xs">
                  <Zap className="h-3 w-3 text-warning flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{flow.trigger}</p>
                    <p className="text-muted-foreground">→ {flow.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Add Webhook Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>Configure a new outbound webhook endpoint</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Zapier CRM Sync" />
            </div>
            <div>
              <Label>Endpoint URL</Label>
              <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://hooks.zapier.com/..." />
            </div>
            <div>
              <Label className="mb-2 block">Events</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {allEvents.map((event) => (
                  <button
                    key={event.value}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      newEvents.includes(event.value) ? "border-brand bg-brand/5 text-brand" : "border-border-subtle text-muted-foreground hover:bg-surface-secondary"
                    )}
                    onClick={() => toggleEvent(event.value)}
                  >
                    <event.icon className="h-3 w-3" />
                    {event.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddWebhook} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
