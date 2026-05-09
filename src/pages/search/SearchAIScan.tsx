import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScanLine, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const SIGNAL_TYPES = [
  { key: "pre_foreclosure", label: "Pre-Foreclosure" },
  { key: "tax_delinquent", label: "Tax Delinquent" },
  { key: "code_violation", label: "Code Violation" },
  { key: "probate", label: "Probate" },
  { key: "divorce", label: "Divorce" },
  { key: "eviction", label: "Eviction" },
  { key: "absentee_owner", label: "Absentee Owner" },
  { key: "high_equity", label: "High Equity" },
];

export default function SearchAIScan() {
  const { organizationId } = useOrganizationContext();
  const [zip, setZip] = React.useState("");
  const [city, setCity] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>(["pre_foreclosure", "tax_delinquent"]);
  const [submitting, setSubmitting] = React.useState(false);
  const [jobs, setJobs] = React.useState<any[]>([]);

  const loadJobs = React.useCallback(async () => {
    if (!organizationId) return;
    const { data } = await supabase
      .from("leads_scan_jobs")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(8);
    setJobs(data || []);
  }, [organizationId]);

  React.useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  function toggle(key: string) {
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) return;
    if (!zip && !city) {
      toast({ title: "Add a target area", description: "Enter a ZIP or city to scan.", variant: "destructive" });
      return;
    }
    if (selected.length === 0) {
      toast({ title: "Pick at least one signal", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("leads_scan_jobs").insert({
      organization_id: organizationId,
      user_id: user?.id,
      job_type: "manual",
      signal_types: selected,
      area: { zip: zip || null, city: city || null },
      status: "queued",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't start scan", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Scan queued", description: "Results will appear in Leads when ready." });
    setZip("");
    setCity("");
    loadJobs();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <ScanLine className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Run a Manual Scan</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Pull motivated-seller signals for a specific area on demand. Results land in Leads.
        </p>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">ZIP Code</Label>
              <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="e.g. 78701" />
            </div>
            <div>
              <Label className="text-xs">City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Austin" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Signal Types</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {SIGNAL_TYPES.map((s) => (
                <label
                  key={s.key}
                  className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-accent cursor-pointer text-sm"
                >
                  <Checkbox checked={selected.includes(s.key)} onCheckedChange={() => toggle(s.key)} />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={submitting} size="lg" className="w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ScanLine className="h-4 w-4 mr-2" />}
            Start Scan
          </Button>
        </form>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Recent Scans
        </h3>
        {jobs.length === 0 ? (
          <Card className="p-4 text-sm text-muted-foreground">No scans yet.</Card>
        ) : (
          <div className="space-y-2">
            {jobs.map((j) => (
              <Card key={j.id} className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <StatusBadge status={j.status} />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(j.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="text-xs text-foreground">
                  {j.area?.zip || j.area?.city || "—"} · {j.signal_types?.length || 0} signals
                </div>
                {j.results_count > 0 && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {j.results_count} matches
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ElementType; cls: string }> = {
    queued: { icon: Clock, cls: "bg-muted text-muted-foreground" },
    running: { icon: Loader2, cls: "bg-blue-500/10 text-blue-600" },
    completed: { icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-600" },
    failed: { icon: XCircle, cls: "bg-destructive/10 text-destructive" },
    cancelled: { icon: XCircle, cls: "bg-muted text-muted-foreground" },
  };
  const cfg = map[status] || map.queued;
  const Icon = cfg.icon;
  return (
    <Badge variant="secondary" className={cfg.cls}>
      <Icon className={`h-3 w-3 mr-1 ${status === "running" ? "animate-spin" : ""}`} />
      {status}
    </Badge>
  );
}
