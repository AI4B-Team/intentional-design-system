import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Upload,
  Landmark,
  Home,
  FileWarning,
  Scale,
  Heart,
  Building,
  MapPin,
  Gavel,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CriteriaTabProps {
  onSuccess: () => void;
}

const presetCards = [
  { id: "tax_delinquent", name: "Tax Delinquent", icon: Landmark, description: "Behind on taxes" },
  { id: "pre_foreclosure", name: "Pre-Foreclosure", icon: Gavel, description: "In foreclosure process" },
  { id: "probate", name: "Probate", icon: Scale, description: "Inherited properties" },
  { id: "tired_landlord", name: "Tired Landlords", icon: Building, description: "Long-term landlords" },
  { id: "high_equity", name: "High Equity", icon: Home, description: "50%+ equity absentee" },
  { id: "vacant", name: "Vacant", icon: MapPin, description: "Signs of vacancy" },
  { id: "code_violation", name: "Code Violations", icon: FileWarning, description: "Municipal violations" },
  { id: "divorce", name: "Divorce", icon: Heart, description: "Divorce filings" },
];

export function CriteriaTab({ onSuccess }: CriteriaTabProps) {
  const { data: presets = [] } = useQuery({
    queryKey: ["list-presets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("list_criteria_presets")
        .select("*")
        .eq("is_system", true);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Coming Soon Notice */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Data Integration Coming Soon</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Building lists from property criteria will require integration with a data provider 
                like PropStream, BatchLeads, or ATTOM. This feature is coming soon!
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">PropStream</Badge>
                <Badge variant="outline">BatchLeads</Badge>
                <Badge variant="outline">ATTOM</Badge>
                <Badge variant="outline">DataTree</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preset Cards */}
      <div>
        <h3 className="font-medium mb-3">Available Presets</h3>
        <p className="text-sm text-muted-foreground mb-4">
          These presets will be available once a data provider is connected.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presetCards.map((preset) => {
            const Icon = preset.icon;
            return (
              <Card
                key={preset.id}
                className="cursor-not-allowed opacity-60 hover:opacity-70 transition-opacity"
              >
                <CardContent className="p-4 text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upload Alternative */}
      <Card>
        <CardContent className="p-6 text-center">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium mb-1">Have Your Own Data?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a CSV file with your property list to get started right away.
          </p>
          <Button variant="outline" onClick={onSuccess}>
            Upload Your List Instead →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
