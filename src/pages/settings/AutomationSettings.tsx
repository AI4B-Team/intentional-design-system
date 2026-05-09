import * as React from "react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAutomationSettings } from "@/hooks/useLeadsData";
import { useCurrentOrganizationId } from "@/hooks/useOrganizationId";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, Zap } from "lucide-react";

type SettingsState = {
  auto_detect_enabled: boolean;
  auto_enrich_hot: boolean;
  auto_campaigns_enabled: boolean;
  auto_campaign_score_threshold: number;
  daily_campaign_cap: number;
  cooldown_days: number;
  default_campaign_type: string;
};

const DEFAULTS: SettingsState = {
  auto_detect_enabled: true,
  auto_enrich_hot: true,
  auto_campaigns_enabled: false,
  auto_campaign_score_threshold: 80,
  daily_campaign_cap: 50,
  cooldown_days: 30,
  default_campaign_type: "mail",
};

export default function AutomationSettings() {
  const organizationId = useCurrentOrganizationId();
  const { data, isLoading } = useAutomationSettings();
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState<SettingsState>(DEFAULTS);

  React.useEffect(() => {
    if (data) {
      setForm({
        auto_detect_enabled: data.auto_detect_enabled ?? DEFAULTS.auto_detect_enabled,
        auto_enrich_hot: data.auto_enrich_hot ?? DEFAULTS.auto_enrich_hot,
        auto_campaigns_enabled: data.auto_campaigns_enabled ?? DEFAULTS.auto_campaigns_enabled,
        auto_campaign_score_threshold:
          data.auto_campaign_score_threshold ?? DEFAULTS.auto_campaign_score_threshold,
        daily_campaign_cap: data.daily_campaign_cap ?? DEFAULTS.daily_campaign_cap,
        cooldown_days: data.cooldown_days ?? DEFAULTS.cooldown_days,
        default_campaign_type: data.default_campaign_type ?? DEFAULTS.default_campaign_type,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("No organization");
      const payload = { organization_id: organizationId, ...form };
      const { error } = await supabase
        .from("automation_settings" as any)
        .upsert(payload, { onConflict: "organization_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Automation settings saved");
      queryClient.invalidateQueries({ queryKey: ["automation_settings"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const update = <K extends keyof SettingsState>(k: K, v: SettingsState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <PageLayout>
      <PageHeader
        title="Automation"
        description="Control how the Leads engine detects, enriches, and follows up automatically."
      />

      {isLoading ? (
        <Card className="p-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </Card>
      ) : (
        <div className="space-y-4 max-w-3xl">
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Detection &amp; Enrichment</h3>
            </div>
            <Toggle
              label="Auto-Detect Leads"
              description="Background agents scan public records every 2 hours."
              checked={form.auto_detect_enabled}
              onChange={(v) => update("auto_detect_enabled", v)}
            />
            <Separator />
            <Toggle
              label="Auto-Enrich Hot Leads"
              description="Automatically run skip-trace and ATTOM enrichment on leads scoring 80+."
              checked={form.auto_enrich_hot}
              onChange={(v) => update("auto_enrich_hot", v)}
            />
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Auto-Campaigns</h3>
            </div>
            <Toggle
              label="Enable Auto-Campaigns"
              description="When ON, qualifying leads are queued for outreach automatically."
              checked={form.auto_campaigns_enabled}
              onChange={(v) => update("auto_campaigns_enabled", v)}
            />
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field
                label="Score Threshold"
                hint="Only leads at or above this score are queued (0–100)."
              >
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.auto_campaign_score_threshold}
                  onChange={(e) =>
                    update("auto_campaign_score_threshold", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Daily Cap" hint="Max auto-sends per day across the org.">
                <Input
                  type="number"
                  min={0}
                  value={form.daily_campaign_cap}
                  onChange={(e) => update("daily_campaign_cap", Number(e.target.value))}
                />
              </Field>
              <Field
                label="Cooldown (Days)"
                hint="Don't re-contact a lead within this window."
              >
                <Input
                  type="number"
                  min={0}
                  value={form.cooldown_days}
                  onChange={(e) => update("cooldown_days", Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="Default Channel" hint="mail · sms · email · call">
              <Input
                value={form.default_campaign_type}
                onChange={(e) => update("default_campaign_type", e.target.value)}
                placeholder="mail"
              />
            </Field>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5">
        <Label className="font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
