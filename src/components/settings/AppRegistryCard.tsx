import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Settings2, Trash2 } from "lucide-react";
import { useFamilyApps, useManageFamilyApps, type FamilyApp } from "@/hooks/useAppFamily";

/** Admin-only registry: point each satellite app at its published URL. */
export function AppRegistryCard() {
  const { data: apps = [] } = useFamilyApps();
  const { saveApp, toggleApp, removeApp } = useManageFamilyApps();
  const [urlDrafts, setUrlDrafts] = React.useState<Record<string, string>>({});
  const [newApp, setNewApp] = React.useState({ slug: "", name: "", base_url: "" });

  const handleSaveApp = async (
    app: { slug: string; name: string; base_url: string; description?: string | null; enabled?: boolean },
    nextUrl: string,
  ) => {
    if (!/^https?:\/\//i.test(nextUrl)) {
      toast({ title: "Invalid URL", description: "Enter the app's full published URL.", variant: "destructive" });
      return;
    }
    try {
      await saveApp.mutateAsync({ ...app, base_url: nextUrl });
      toast({ title: "App Saved" });
    } catch (e: unknown) {
      toast({
        title: "Could Not Save",
        description: e instanceof Error ? e.message : "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const handleAddApp = async () => {
    const slug = newApp.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!slug || !newApp.name.trim()) {
      toast({ title: "Missing Fields", description: "Slug and name are required.", variant: "destructive" });
      return;
    }
    await handleSaveApp(
      { slug, name: newApp.name.trim(), base_url: newApp.base_url, enabled: true },
      newApp.base_url,
    );
    setNewApp({ slug: "", name: "", base_url: "" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" /> App Registry
        </CardTitle>
        <CardDescription>
          Point each app at its real published URL. Handoff links are built as{" "}
          <code className="text-xs">{"{base_url}/auth/hub?token=…"}</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apps.map((app: FamilyApp) => (
          <div key={app.slug} className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{app.name}</span>
                <Badge variant="outline" className="font-mono text-xs">{app.slug}</Badge>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Label className="text-xs text-muted-foreground">Enabled</Label>
                <Switch
                  checked={app.enabled}
                  onCheckedChange={(enabled) => toggleApp.mutate({ slug: app.slug, enabled })}
                />
                <Button size="sm" variant="ghost" onClick={() => removeApp.mutate(app.slug)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={urlDrafts[app.slug] ?? app.base_url}
                onChange={(e) => setUrlDrafts((d) => ({ ...d, [app.slug]: e.target.value }))}
                placeholder="https://app.example.com"
              />
              <Button
                variant="outline"
                onClick={() => handleSaveApp(app, urlDrafts[app.slug] ?? app.base_url)}
                disabled={saveApp.isPending}
              >
                Save URL
              </Button>
            </div>
          </div>
        ))}

        <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
          <div className="text-sm font-medium text-foreground">Register Another App</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Input
              placeholder="slug"
              value={newApp.slug}
              onChange={(e) => setNewApp({ ...newApp, slug: e.target.value })}
            />
            <Input
              placeholder="Name"
              value={newApp.name}
              onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
            />
            <Input
              placeholder="https://app.example.com"
              value={newApp.base_url}
              onChange={(e) => setNewApp({ ...newApp, base_url: e.target.value })}
            />
          </div>
          <Button onClick={handleAddApp} disabled={saveApp.isPending}>
            Add App
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AppRegistryCard;
