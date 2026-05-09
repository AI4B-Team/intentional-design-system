import * as React from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { HarvestSubNav } from "./HarvestSubNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Mail, Send, Check, Clock } from "lucide-react";

export default function HarvestOutreach() {
  return (
    <PageLayout>
      <HarvestSubNav />

      <Tabs defaultValue="enrich">
        <TabsList>
          <TabsTrigger value="enrich" className="gap-2"><Search className="h-3.5 w-3.5" /> Enrich</TabsTrigger>
          <TabsTrigger value="mail" className="gap-2"><Mail className="h-3.5 w-3.5" /> Mail</TabsTrigger>
          <TabsTrigger value="sync" className="gap-2"><Send className="h-3.5 w-3.5" /> Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="enrich" className="mt-4">
          <ToolPanel
            title="Enrich"
            description="Pull owner contact info — phones, emails, mailing address — for high-score leads."
            cta="Run Enrich on Focus List"
            stats={[
              { label: "Eligible Leads", value: "47" },
              { label: "Last Run", value: "12 min ago" },
              { label: "Hit Rate", value: "78%" },
            ]}
          />
        </TabsContent>
        <TabsContent value="mail" className="mt-4">
          <ToolPanel
            title="Mail"
            description="Send postcards or letters to enriched, mailable leads. Quality-gated automatically."
            cta="Build Mail Drop"
            stats={[
              { label: "Mailable Now", value: "1,240" },
              { label: "Sent This Week", value: "892" },
              { label: "Response Rate", value: "1.4%" },
            ]}
          />
        </TabsContent>
        <TabsContent value="sync" className="mt-4">
          <ToolPanel
            title="Sync"
            description="Push leads into your CRM (GHL, Closebot, or Real Elite Pipeline)."
            cta="Configure Sync"
            stats={[
              { label: "Synced Today", value: "23" },
              { label: "Last Run", value: "1 day ago" },
              { label: "Status", value: "Test Mode" },
            ]}
          />
        </TabsContent>
      </Tabs>

      <Card className="mt-6 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium">Sync Log</div>
            <div className="text-xs text-muted-foreground">Recent outreach runs across all tools.</div>
          </div>
          <Badge variant="outline" className="text-xs">Last 7 days</Badge>
        </div>
        <div className="space-y-1.5">
          {LOG.map((row, i) => (
            <div key={i} className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                {row.status === "ok" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-yellow-500" />
                )}
                <span className="font-medium">{row.tool}</span>
                <span className="text-muted-foreground">— {row.note}</span>
              </div>
              <div className="text-xs text-muted-foreground tabular-nums">{row.time}</div>
            </div>
          ))}
        </div>
      </Card>
    </PageLayout>
  );
}

function ToolPanel({
  title,
  description,
  cta,
  stats,
}: {
  title: string;
  description: string;
  cta: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
        <Button>{cta}</Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-border p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
            <div className="text-xl font-semibold tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const LOG = [
  { tool: "Enrich", note: "47 leads enriched (Focus List)", time: "12 min ago", status: "ok" as const },
  { tool: "Mail", note: "240 postcards queued for tomorrow drop", time: "2 hr ago", status: "ok" as const },
  { tool: "Sync", note: "23 leads pushed to GHL", time: "1 day ago", status: "ok" as const },
  { tool: "Mail", note: "Awaiting compliance review", time: "1 day ago", status: "pending" as const },
  { tool: "Enrich", note: "12 leads enriched (auto-trigger)", time: "2 days ago", status: "ok" as const },
];
