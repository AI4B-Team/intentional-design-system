import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "./ScoreBadge";
import { SignalPill } from "./SignalPill";
import { CheckCircle2, AlertTriangle, XCircle, Mail, Phone, Send, MapPin } from "lucide-react";
import type { HarvestLead } from "@/types/harvest";

interface LeadDetailModalProps {
  lead: HarvestLead | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function LeadDetailModal({ lead, open, onOpenChange }: LeadDetailModalProps) {
  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="text-lg leading-tight">{lead.address}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {lead.city}, {lead.state} {lead.zip} · {lead.county} County
              </p>
            </div>
            <ScoreBadge score={lead.opportunityScore} />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {lead.signals.map((s, i) => (
              <SignalPill key={i} type={s.type} />
            ))}
          </div>
        </SheetHeader>

        <div className="mt-4 flex gap-2">
          <Button size="sm" className="gap-2"><Phone className="h-3.5 w-3.5" /> Call</Button>
          <Button size="sm" variant="outline" className="gap-2"><Mail className="h-3.5 w-3.5" /> Mail</Button>
          <Button size="sm" variant="outline" className="gap-2"><Send className="h-3.5 w-3.5" /> Sync</Button>
        </div>

        <Tabs defaultValue="property" className="mt-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="property">Property</TabsTrigger>
            <TabsTrigger value="owner">Owner</TabsTrigger>
            <TabsTrigger value="score">Score & Evidence</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
          </TabsList>

          <TabsContent value="property" className="mt-4 space-y-3">
            <Field label="Address" value={`${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}`} />
            <Grid2>
              <Field label="Asset Class" value={prettyAsset(lead.assetClass)} />
              <Field label="Year Built" value={lead.yearBuilt ?? "—"} />
              <Field label="Beds / Baths" value={lead.beds ? `${lead.beds} / ${lead.baths ?? "—"}` : "—"} />
              <Field label="Sqft" value={lead.sqft ? lead.sqft.toLocaleString() : "—"} />
              <Field label="Assessed Value" value={lead.assessedValue ? `$${lead.assessedValue.toLocaleString()}` : "—"} />
              <Field label="Est. ARV" value={lead.arvEstimate ? `$${lead.arvEstimate.toLocaleString()}` : "—"} />
            </Grid2>
          </TabsContent>

          <TabsContent value="owner" className="mt-4 space-y-3">
            <Grid2>
              <Field label="Owner" value={lead.ownerName ?? "—"} />
              <Field label="Entity Type" value={prettyEntity(lead.ownerEntityType)} />
              <Field label="Mailing Address" value={lead.mailingAddress ?? "—"} />
              <Field label="Phone" value={lead.phonePrimary ?? "—"} />
              <Field label="Absentee" value={lead.isAbsentee ? "Yes" : "No"} />
              <Field
                label="Confidence"
                value={
                  <Badge variant="outline" className="capitalize">
                    {lead.confidenceLevel} ({lead.confidenceScore})
                  </Badge>
                }
              />
            </Grid2>
          </TabsContent>

          <TabsContent value="score" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <ScoreBlock label="Opportunity" value={lead.opportunityScore} />
              <ScoreBlock label="Distress" value={lead.distressScore} />
              <ScoreBlock label="Confidence" value={lead.confidenceScore} />
            </div>

            <div className="space-y-2">
              {lead.positiveFlags.map((f, i) => (
                <FlagRow key={`p${i}`} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} text={f} />
              ))}
              {lead.weakFlags.map((f, i) => (
                <FlagRow key={`w${i}`} icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />} text={f} />
              ))}
              {lead.redFlags.map((f, i) => (
                <FlagRow key={`r${i}`} icon={<XCircle className="h-4 w-4 text-red-500" />} text={f} />
              ))}
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-1">
                Recommended Action
              </div>
              {lead.recommendedAction}
            </div>
          </TabsContent>

          <TabsContent value="signals" className="mt-4 space-y-2">
            {lead.signals.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-border p-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <SignalPill type={s.type} />
                </div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {s.source} · {s.freshnessDays}d ago
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground tabular-nums">{value}</div>
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>;
}

function ScoreBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function FlagRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon} {text}
    </div>
  );
}

function prettyAsset(a: HarvestLead["assetClass"]) {
  const map: Record<HarvestLead["assetClass"], string> = {
    single_family: "Single Family",
    multi_family: "Multi-Family",
    commercial: "Commercial",
    land: "Land",
    industrial: "Industrial",
    unknown: "Unknown",
  };
  return map[a];
}
function prettyEntity(e: HarvestLead["ownerEntityType"]) {
  return { individual: "Individual", llc: "LLC / Entity", trust: "Trust", unknown: "Unknown" }[e];
}
