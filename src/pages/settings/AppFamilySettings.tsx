import * as React from "react";
import { DashboardLayout, PageHeader } from "@/components/layout";
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
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { FamilyEventsFeed } from "@/components/settings/FamilyEventsFeed";
import { HubIntegrationGuide } from "@/components/settings/HubIntegrationGuide";
import { AppRegistryCard } from "@/components/settings/AppRegistryCard";
import { OutboundWebhooksCard } from "@/components/settings/OutboundWebhooksCard";
import { SatelliteActionsCard } from "@/components/settings/SatelliteActionsCard";
import { Boxes, ExternalLink, Loader2, ShieldCheck } from "lucide-react";

export default function AppFamilySettings() {
  const { data: apps = [], isLoading: appsLoading } = useFamilyApps();
  const { data: links = [] } = useOrgAppLinks();
  const launch = useLaunchFamilyApp();
  const { hasRole } = useOrganizationContext();
  const isAdmin = hasRole("admin");
  const [pending, setPending] = React.useState<string | null>(null);
  const integrationCheck = useIntegrationCheck();
  const [checking, setChecking] = React.useState<string | null>(null);
  const [checkResult, setCheckResult] = React.useState<IntegrationCheckResult | null>(null);

  const linkFor = (slug: string) => links.find((l) => l.app_slug === slug);

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
    } catch (e: unknown) {
      toast({
        title: "Check Failed",
        description: e instanceof Error ? e.message : "Could not run the integration check.",
        variant: "destructive",
      });
    } finally {
      setChecking(null);
    }
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

        {isAdmin && <AppRegistryCard />}

        <FamilyEventsFeed />

        <OutboundWebhooksCard />

        <SatelliteActionsCard />

        <HubIntegrationGuide />
      </div>
    </DashboardLayout>
  );
}
