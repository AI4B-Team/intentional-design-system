import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { BookOpen, Copy } from "lucide-react";
import { HUB_EVENT_CATALOG } from "@/lib/hubEvents";

const INGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hub-events-ingest`;

const ENVELOPE = `{
  "events": [
    {
      "id": "evt_123",              // your event id (used for idempotency)
      "app_slug": "leadtrace",
      "event_type": "leads.new",
      "real_elite_org_id": "<org uuid from the SSO handoff>",
      "payload": { "name": "Jane Doe", "phone": "+15551234567" },
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}`;

const SIGNING = `// HMAC-SHA256 of the raw JSON body, hex encoded, using HUB_SIGNING_SECRET
x-webhook-signature: <hex digest>   // preferred
x-hub-signature:     <hex digest>   // also accepted`;

const SSO = `// 1. Real Elite mints a 60s handoff token and opens:
{your_base_url}/auth/hub?token=<jwt>

// 2. Verify the JWT with HUB_SIGNING_SECRET (HS256) and read:
{ sub, email, org_id, org_name, role, app_slug, exp }`;

const ACTIONS = `// The hub calls your authenticated endpoints:
POST {your_base_url}/api/hub/actions/<action>
x-webhook-signature: <hex digest of body>
body: { "real_elite_org_id": "...", "params": { ... } }`;

function Snippet({ label, code }: { label: string; code: string }) {
  const copy = () => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: label });
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <Button size="sm" variant="ghost" onClick={copy}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
      <pre className="overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">{code}</pre>
    </div>
  );
}

/** Copy-paste contract reference for satellite app developers. */
export function HubIntegrationGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" /> Integration Guide
        </CardTitle>
        <CardDescription>
          Everything a satellite app needs to talk to the hub. All signatures use the shared hub
          signing secret; repeat deliveries of the same event id are ignored.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Snippet label="Inbound Events Endpoint" code={INGEST_URL} />
        <Snippet label="Event Envelope" code={ENVELOPE} />
        <Snippet label="Signature Headers" code={SIGNING} />
        <Snippet label="Single Sign-On Handoff" code={SSO} />
        <Snippet label="Satellite Actions Contract" code={ACTIONS} />

        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Supported Event Types</div>
          <div className="space-y-1">
            {HUB_EVENT_CATALOG.map((e) => (
              <div key={e.type} className="flex items-start justify-between gap-3 text-sm">
                <Badge variant="outline" className="shrink-0 font-mono text-xs">
                  {e.type}
                </Badge>
                <span className="min-w-0 text-right text-xs text-muted-foreground">
                  {e.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
