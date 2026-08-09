import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useFamilyApps, useOrgAppLinks, useLaunchFamilyApp, useFamilyEvents } from "@/hooks/useAppFamily";
import { Boxes, ExternalLink, Loader2, Activity, AlertTriangle } from "lucide-react";

function relativeTime(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just Now";
  if (mins < 60) return `${mins}m Ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h Ago`;
  return `${Math.floor(hrs / 24)}d Ago`;
}

/** Launcher for satellite apps in the Real Elite family (hub SSO handoff). */
export function FamilyAppsSection() {
  const { data: apps = [], isLoading } = useFamilyApps();
  const { data: links = [] } = useOrgAppLinks();
  const launch = useLaunchFamilyApp();
  const [pending, setPending] = React.useState<string | null>(null);

  const enabled = apps.filter((a) => a.enabled);
  if (isLoading || enabled.length === 0) return null;

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
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Boxes className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Family Apps</h2>
        <Badge variant="outline" className="text-muted-foreground">
          {enabled.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {enabled.map((app) => {
          const link = links.find((l) => l.app_slug === app.slug);
          return (
            <Card key={app.id} padding="md" className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground truncate">{app.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {app.description ?? "Connected app in the Real Elite family"}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  size="sm"
                  className={link?.linked_at ? "border-primary/40 text-primary" : "text-muted-foreground"}
                >
                  {link?.linked_at ? "Linked" : "Not Linked"}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={pending === app.slug}
                onClick={() => handleLaunch(app.slug)}
              >
                {pending === app.slug ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Open With SSO
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
