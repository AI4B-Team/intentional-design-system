import * as React from "react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Activity } from "lucide-react";
import { useEngineHealth } from "@/hooks/useHarvestStats";

export default function EngineHealth() {
  const { feedHealth, runLog } = useEngineHealth();

  return (
    <PageLayout>
      <PageHeader
        title="Engine Health"
        description="Oversight Agent — monitors HARVEST scrapers, validation pipeline, and data quality."
      />

      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">Feed Health</TabsTrigger>
          <TabsTrigger value="map">Deal Map</TabsTrigger>
          <TabsTrigger value="pipeline">Agent Pipeline</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4 space-y-4">
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground text-left">
                  <th className="px-3 py-2 font-medium">County</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Last Run</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right">Records</th>
                </tr>
              </thead>
              <tbody>
                {feedHealth.map((r, i) => (
                  <tr key={i} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <span className="font-medium">{r.county}</span>
                      <span className="text-muted-foreground"> · {r.state}</span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{r.source}</td>
                    <td className="px-3 py-2 text-muted-foreground tabular-nums">{r.lastRun}</td>
                    <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.recordsCaptured}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-medium mb-2">Nightly Run Log — Last 7 Days</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground text-left">
                  <th className="py-1.5 font-medium">Date</th>
                  <th className="py-1.5 font-medium text-right">Runs</th>
                  <th className="py-1.5 font-medium text-right">OK</th>
                  <th className="py-1.5 font-medium text-right">Errors</th>
                  <th className="py-1.5 font-medium text-right">Records</th>
                  <th className="py-1.5 font-medium text-right">Avg Duration</th>
                </tr>
              </thead>
              <tbody>
                {runLog.map((r) => (
                  <tr key={r.date} className="border-t border-border/40">
                    <td className="py-1.5 tabular-nums">{r.date}</td>
                    <td className="py-1.5 text-right tabular-nums">{r.runs}</td>
                    <td className="py-1.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{r.okCount}</td>
                    <td className="py-1.5 text-right tabular-nums text-red-600 dark:text-red-400">{r.errorCount}</td>
                    <td className="py-1.5 text-right tabular-nums">{r.recordsProcessed.toLocaleString()}</td>
                    <td className="py-1.5 text-right tabular-nums text-muted-foreground">{r.avgDurationSec}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <Card className="p-8 flex flex-col items-center justify-center text-center min-h-[300px] border-dashed">
            <Activity className="h-8 w-8 text-muted-foreground mb-2" />
            <div className="text-sm font-medium">Deal Map</div>
            <div className="text-xs text-muted-foreground max-w-md">
              Geographic distress heat map — full-bleed but collapsible. Wires to the same data source as Feed Health when backend is connected.
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4">
          <Card className="p-5">
            <div className="text-sm font-medium mb-4">Agent Pipeline — Detect → Validate → Grade</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Stage name="Detect" desc="Scrape county records every 2 hours. Captures distress signals." count={142} status="ok" />
              <Stage name="Validate" desc="Verify owner data, deduplicate, normalize addresses." count={138} status="ok" />
              <Stage name="Grade" desc="Compute Opportunity & Confidence scores. Flag red/positive signals." count={134} status="warning" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QualityCard label="Avg Confidence" value="74%" />
            <QualityCard label="Phone Coverage" value="62%" />
            <QualityCard label="Mailable" value="91%" />
            <QualityCard label="Dedup Rate" value="3.2%" />
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

function StatusBadge({ status }: { status: "ok" | "warning" | "error" }) {
  if (status === "ok")
    return <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"><CheckCircle2 className="h-3 w-3" /> OK</Badge>;
  if (status === "warning")
    return <Badge variant="outline" className="gap-1 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"><AlertTriangle className="h-3 w-3" /> Warning</Badge>;
  return <Badge variant="outline" className="gap-1 text-red-600 dark:text-red-400 border-red-500/30"><XCircle className="h-3 w-3" /> Error</Badge>;
}

function Stage({ name, desc, count, status }: { name: string; desc: string; count: number; status: "ok" | "warning" }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{name}</div>
        <StatusBadge status={status} />
      </div>
      <div className="text-xs text-muted-foreground mb-3">{desc}</div>
      <div className="text-2xl font-semibold tabular-nums">{count}</div>
      <div className="text-[11px] text-muted-foreground">processed last run</div>
    </div>
  );
}

function QualityCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </Card>
  );
}
