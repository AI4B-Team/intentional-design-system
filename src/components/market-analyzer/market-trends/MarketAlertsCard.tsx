import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Save } from "lucide-react";
import { toast } from "sonner";
import type { MarketAlerts } from "./types";

interface MarketAlertsCardProps {
  alerts: MarketAlerts;
  onAlertsChange: (alerts: MarketAlerts) => void;
}

export function MarketAlertsCard({ alerts, onAlertsChange }: MarketAlertsCardProps) {
  const handleToggle = (key: keyof MarketAlerts) => {
    onAlertsChange({ ...alerts, [key]: !alerts[key] });
  };

  const handleSave = () => {
    toast.success("Alert preferences saved!");
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Market Alerts</h4>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox
            id="priceChange"
            checked={alerts.priceChange}
            onCheckedChange={() => handleToggle("priceChange")}
          />
          <label htmlFor="priceChange" className="text-small cursor-pointer">
            Alert on 5%+ price change
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="inventoryChange"
            checked={alerts.inventoryChange}
            onCheckedChange={() => handleToggle("inventoryChange")}
          />
          <label htmlFor="inventoryChange" className="text-small cursor-pointer">
            Alert on inventory changes
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="weeklySummary"
            checked={alerts.weeklySummary}
            onCheckedChange={() => handleToggle("weeklySummary")}
          />
          <label htmlFor="weeklySummary" className="text-small cursor-pointer">
            Weekly summary email
          </label>
        </div>
      </div>

      <Button className="w-full mt-4" variant="secondary" onClick={handleSave}>
        <Save className="h-4 w-4 mr-1.5" />
        Save Preferences
      </Button>
    </Card>
  );
}
