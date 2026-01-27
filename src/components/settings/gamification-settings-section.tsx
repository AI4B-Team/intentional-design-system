import * as React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useGamificationSettings, useUpdateGamificationSettings, DEFAULT_POINT_VALUES, type PointValues } from "@/hooks/useGamification";
import { usePermissions } from "@/hooks/usePermissions";
import { Trophy, Save, RotateCcw, Zap, Target, Phone, Calendar, DollarSign, Flame } from "lucide-react";
import { toast } from "sonner";

const POINT_CATEGORIES = [
  {
    title: "Activity Points",
    icon: <Zap className="h-4 w-4" />,
    fields: [
      { key: "lead_added", label: "Lead/Property Added", icon: <Target className="h-4 w-4" /> },
      { key: "skip_trace", label: "Skip Trace Run", icon: <Target className="h-4 w-4" /> },
      { key: "contact_made", label: "Contact Made (call/text/email)", icon: <Phone className="h-4 w-4" /> },
      { key: "appointment_set", label: "Appointment Set", icon: <Calendar className="h-4 w-4" /> },
      { key: "appointment_completed", label: "Appointment Completed", icon: <Calendar className="h-4 w-4" /> },
    ],
  },
  {
    title: "Deal Points",
    icon: <DollarSign className="h-4 w-4" />,
    fields: [
      { key: "offer_made", label: "Offer Made", icon: <DollarSign className="h-4 w-4" /> },
      { key: "offer_accepted", label: "Offer Accepted", icon: <DollarSign className="h-4 w-4" /> },
      { key: "deal_closed", label: "Deal Closed", icon: <Trophy className="h-4 w-4" /> },
      { key: "deal_closed_10k_bonus", label: "Deal Closed (profit > $10K)", icon: <Trophy className="h-4 w-4" /> },
      { key: "deal_closed_25k_bonus", label: "Deal Closed (profit > $25K)", icon: <Trophy className="h-4 w-4" /> },
    ],
  },
  {
    title: "Streak Bonuses",
    icon: <Flame className="h-4 w-4" />,
    fields: [
      { key: "streak_7_day", label: "7-Day Activity Streak", icon: <Flame className="h-4 w-4" /> },
      { key: "streak_30_day", label: "30-Day Activity Streak", icon: <Flame className="h-4 w-4" /> },
    ],
  },
];

export function GamificationSettingsSection() {
  const { canManageSettings } = usePermissions();
  const { data: settings, isLoading } = useGamificationSettings();
  const updateSettings = useUpdateGamificationSettings();

  const [enabled, setEnabled] = React.useState(true);
  const [pointValues, setPointValues] = React.useState<PointValues>(DEFAULT_POINT_VALUES);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Load settings when data arrives
  React.useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled ?? true);
      setPointValues(settings.point_values || DEFAULT_POINT_VALUES);
    }
  }, [settings]);

  const handlePointChange = (key: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setPointValues((prev) => ({ ...prev, [key]: numValue }));
    setHasChanges(true);
  };

  const handleEnabledChange = (value: boolean) => {
    setEnabled(value);
    setHasChanges(true);
  };

  const handleReset = () => {
    setPointValues(DEFAULT_POINT_VALUES);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        enabled,
        point_values: pointValues,
      });
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  if (!canManageSettings) {
    return null;
  }

  if (isLoading) {
    return (
      <Card variant="default" padding="lg">
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="text-h4 font-semibold text-content">Gamification Settings</h3>
            <p className="text-small text-content-secondary">Configure points and achievements for your team</p>
          </div>
        </div>
        <Badge variant={enabled ? "success" : "secondary"}>
          {enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 rounded-medium bg-surface-secondary">
          <div>
            <Label className="text-body font-medium">Enable Gamification</Label>
            <p className="text-small text-content-secondary mt-0.5">
              When disabled, no points or achievements will be awarded
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={handleEnabledChange} />
        </div>

        {/* Point Values */}
        {enabled && (
          <div className="space-y-6">
            {POINT_CATEGORIES.map((category) => (
              <div key={category.title} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-content-secondary">{category.icon}</span>
                  <h4 className="text-small font-semibold text-content uppercase tracking-wide">
                    {category.title}
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.fields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center justify-between p-3 rounded-medium border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-content-tertiary">{field.icon}</span>
                        <span className="text-small text-content">{field.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-small text-content-tertiary">+</span>
                        <Input
                          type="number"
                          min="0"
                          max="1000"
                          value={pointValues[field.key as keyof PointValues]}
                          onChange={(e) => handlePointChange(field.key, e.target.value)}
                          className="w-20 h-8 text-center"
                        />
                        <span className="text-small text-content-tertiary">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            icon={<RotateCcw className="h-4 w-4" />}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || updateSettings.isPending}
            icon={updateSettings.isPending ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
          >
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
