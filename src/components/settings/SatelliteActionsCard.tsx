import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, Terminal } from "lucide-react";
import { useCallFamilyAppAction, useFamilyApps } from "@/hooks/useAppFamily";

/** Signed proxy console for calling a satellite app's action endpoint. */
export function SatelliteActionsCard() {
  const { data: apps = [] } = useFamilyApps();
  const callAction = useCallFamilyAppAction();
  const [actionForm, setActionForm] = React.useState<{
    appSlug: string;
    action: string;
    method: "GET" | "POST";
    params: string;
  }>({ appSlug: "", action: "", method: "POST", params: "" });
  const [actionResult, setActionResult] = React.useState<string | null>(null);

  const handleRunAction = async () => {
    if (!actionForm.appSlug || !actionForm.action.trim()) {
      toast({
        title: "Missing Details",
        description: "Pick an app and enter an action name.",
        variant: "destructive",
      });
      return;
    }
    let params: Record<string, unknown> = {};
    if (actionForm.params.trim()) {
      try {
        params = JSON.parse(actionForm.params);
      } catch {
        toast({ title: "Invalid JSON", description: "Params must be valid JSON.", variant: "destructive" });
        return;
      }
    }
    setActionResult(null);
    try {
      const res = await callAction.mutateAsync({
        appSlug: actionForm.appSlug,
        action: actionForm.action.trim(),
        method: actionForm.method,
        params,
      });
      setActionResult(JSON.stringify(res, null, 2));
      toast({
        title: res.ok ? "Action Succeeded" : "Action Returned An Error",
        description: `${res.status} · ${res.target}`,
        variant: res.ok ? undefined : "destructive",
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Request failed.";
      setActionResult(message);
      toast({ title: "Could Not Call Action", description: message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" /> Satellite Actions
        </CardTitle>
        <CardDescription>
          Call any satellite app's authenticated endpoint at{" "}
          <code className="text-xs">/api/hub/actions/&lt;action&gt;</code>. Requests are signed with
          the shared hub secret, so the hub consumes app actions instead of rebuilding them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm"
            value={actionForm.appSlug}
            onChange={(e) => setActionForm({ ...actionForm, appSlug: e.target.value })}
          >
            <option value="">Select App</option>
            {apps.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
          <Input
            placeholder="jobs/status"
            value={actionForm.action}
            onChange={(e) => setActionForm({ ...actionForm, action: e.target.value })}
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm"
            value={actionForm.method}
            onChange={(e) =>
              setActionForm({ ...actionForm, method: e.target.value as "GET" | "POST" })
            }
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>
        </div>
        <Input
          placeholder='{"list_id":"..."}'
          className="font-mono text-xs"
          value={actionForm.params}
          onChange={(e) => setActionForm({ ...actionForm, params: e.target.value })}
        />
        <Button onClick={handleRunAction} disabled={callAction.isPending}>
          {callAction.isPending ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Terminal className="mr-2 h-3.5 w-3.5" />
          )}
          Run Action
        </Button>
        {actionResult && (
          <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">{actionResult}</pre>
        )}
      </CardContent>
    </Card>
  );
}

export default SatelliteActionsCard;
