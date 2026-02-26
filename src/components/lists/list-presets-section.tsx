import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Landmark,
  Gavel,
  Scale,
  Building,
  Home,
  MapPin,
  FileWarning,
  Heart,
  Sparkles,
  Settings2,
} from "lucide-react";

interface ListPresetsSectionProps {
  onSelectPreset: (presetId: string) => void;
}

const presets = [
  {
    id: "tax_delinquent",
    name: "Tax Delinquent",
    icon: Landmark,
    description: "Behind on taxes",
    color: "text-red-500 bg-red-500/10",
  },
  {
    id: "pre_foreclosure",
    name: "Pre-Foreclosure",
    icon: Gavel,
    description: "In foreclosure",
    color: "text-orange-500 bg-orange-500/10",
  },
  {
    id: "probate",
    name: "Probate",
    icon: Scale,
    description: "Inherited",
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    id: "tired_landlord",
    name: "Tired Landlords",
    icon: Building,
    description: "10+ years owned",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    id: "high_equity",
    name: "High Equity",
    icon: Home,
    description: "50%+ equity",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    id: "vacant",
    name: "Vacant",
    icon: MapPin,
    description: "Signs of vacancy",
    color: "text-yellow-500 bg-yellow-500/10",
  },
  {
    id: "code_violation",
    name: "Code Violations",
    icon: FileWarning,
    description: "Municipal issues",
    color: "text-pink-500 bg-pink-500/10",
  },
  {
    id: "divorce",
    name: "Divorce",
    icon: Heart,
    description: "Divorce filings",
    color: "text-rose-500 bg-rose-500/10",
  },
  {
    id: "free_clear",
    name: "Free & Clear",
    icon: Sparkles,
    description: "No mortgage",
    color: "text-cyan-500 bg-cyan-500/10",
  },
];

export function ListPresetsSection({ onSelectPreset }: ListPresetsSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Quick Start Presets</CardTitle>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Settings2 className="h-4 w-4 mr-1" />
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {presets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className="flex flex-col items-center p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-full ${preset.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-center leading-tight">
                  {preset.name}
                </p>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Presets require a <a href="/settings/integrations" className="text-primary hover:underline">data provider integration</a>
        </p>
      </CardContent>
    </Card>
  );
}
