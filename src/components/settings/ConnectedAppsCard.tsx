import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  useFamilyApps,
  useOrgAppLinks,
  useLaunchFamilyApp,
  useIntegrationCheck,
  type IntegrationCheckResult,
} from "@/hooks/useAppFamily";
import { Boxes, ExternalLink, Loader2, ShieldCheck } from "lucide-react";

/** Launchable satellite apps with per-app acceptance-check results. */
export function ConnectedAppsCard() {
  const { data: apps = [], isLoading: appsLoading } = useFamilyApps();
  const { data: links = [], refetch: refetchLinks } = useOrgAppLinks();
  const launch = useLaunchFamilyApp();
  const integrationCheck = useIntegrationCheck();
  const [pending, setPending] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState<string | null>(null);
  const [checkAll, setCheckAll] = React.useState(false);
  const [results, setResults] = React.useState<Record<string, IntegrationCheckResult>>({});

  const linkFor = (slug: string) => links.find((l) => l.app_slug === slug);

  /** Live result if we just ran a check, otherwise the last stored outcome. */
  const resultFor = (slug: string): (IntegrationCheckResult & { checked_at?: string }) | null => {
    if (results[slug]) return results[slug];
    const link = linkFor(slug);
    if (!link?.last_check_at || !link.last_check_details) return null;
    return {
      app_slug: slug,
      base_url: "",
      passed: link.last_check_passed ?? 0,
      total: link.last_check_total ?? link.last_check_details.length,
      checks: link.last_check_details,
      checked_at: link.last_check_at,
    };
  };


  const runCheck = async (slug: string, silent = false) => {
    setChecking(slug);
    try {
      const res = await integrationCheck.mutateAsync(slug);
      setResults((r) => ({ ...r, [slug]: res }));
      if (!silent) {
        toast({
          title: res.passed === res.total ? "Integration Ready" : "Integration Issues Found",
          description: `${res.passed}/${res.total} checks passed for ${slug}.`,
          variant: res.passed === res.total ? undefined : "destructive",
        });
      }
      return res;
    } catch (e: unknown) {
      if (!silent) {
        toast({
          title: "Check Failed",
          description: e instanceof Error ? e.message : "Could not run the integration check.",
          variant: "destructive",
        });
      }
      return null;
    } finally {
      setChecking(null);
      refetchLinks();
    }

  };

  const handleCheckAll = async () => {
    setCheckAll(true);
    let ready = 0;
    for (const app of apps) {
      const res = await runCheck(app.slug, true);
      if (res && res.passed === res.total) ready += 1;
    }
    setCheckAll(false);
    toast({
      title: "Integration Sweep Complete",
      description: `${ready}/${apps.length} apps fully ready.`,
      variant: ready === apps.length ? undefined : "destructive",
    });
  };

  const handleLaunch = async (slug: string) => {
    setPending(slug);
    try {
      const url = await launch.mutateAsync(slug);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: unknown) {
      toast({
        title: "Could Not Open App",
        description: e instanceof Error ? e.message : "Handoff link failed.",
        variant: "destructive",
      });
    } finally {
      setPending(null);
    }
  };

  const STALE_MS = 48 * 60 * 60 * 1000;
  const isStale = (checkedAt?: string) =>
    !!checkedAt && Date.now() - new Date(checkedAt).getTime() > STALE_MS;

  const summary = React.useMemo(() => {
    let failing = 0;
    let healthy = 0;
    let unchecked = 0;
    for (const app of apps) {
      const r = resultFor(app.slug);
      if (!r) unchecked += 1;
      else if (r.passed === r.total) healthy += 1;
      else failing += 1;
    }
    return { failing, healthy, unchecked };
  }, [apps, links, results]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" /> Connected Apps
          </CardTitle>
          <CardDescription>
            Opening an app signs you in with your Real Elite organization and user identity.
            Checks also run automatically every night — owners and admins are alerted if an app
            starts failing.
          </CardDescription>
          {apps.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={summary.failing > 0 ? "destructive" : "default"}>
                {summary.failing > 0
                  ? `${summary.failing} Failing`
                  : `${summary.healthy} Healthy`}
              </Badge>
              {summary.failing > 0 && summary.healthy > 0 && (
                <Badge variant="secondary">{summary.healthy} Healthy</Badge>
              )}
              {summary.unchecked > 0 && (
                <Badge variant="secondary">{summary.unchecked} Never Checked</Badge>
              )}
            </div>
          )}
        </div>
        {apps.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleCheckAll}
            disabled={checkAll}
          >
            {checkAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            Check All Apps
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {appsLoading && <div className="text-sm text-muted-foreground">Loading apps…</div>}
        {!appsLoading && apps.length === 0 && (
          <div className="text-sm text-muted-foreground">No family apps registered yet.</div>
        )}
        {apps.map((app) => {
          const link = linkFor(app.slug);
          const result = resultFor(app.slug);
          return (
            <div key={app.slug} className="space-y-3 rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{app.name}</span>
                    <Badge variant={link?.linked_at ? "default" : "secondary"}>
                      {link?.linked_at ? "Linked" : "Not Linked"}
                    </Badge>
                    {result && (
                      <Badge variant={result.passed === result.total ? "default" : "destructive"}>
                        {result.passed}/{result.total} Checks
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{app.description}</p>
                  {link?.last_event_at && (
                    <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                      Last Event: {new Date(link.last_event_at).toLocaleString()}
                    </p>
                  )}
                  {result?.checked_at && (
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Last Check: {new Date(result.checked_at).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                  <Button
                    variant="outline"
                    onClick={() => runCheck(app.slug)}
                    disabled={checking === app.slug || checkAll}
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

              {result && (
                <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                  {result.checks.map((c) => (
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
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default ConnectedAppsCard;
