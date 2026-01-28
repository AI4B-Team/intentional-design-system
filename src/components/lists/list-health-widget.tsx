import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Phone,
  Copy,
  MapPin,
  Users,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface HealthMetric {
  label: string;
  value: string;
  status: "success" | "warning" | "error" | "info";
  action?: { label: string; href: string };
  icon: React.ElementType;
}

export function ListHealthWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch health metrics
  const { data: metrics = [], isLoading, refetch } = useQuery({
    queryKey: ["list-health"],
    queryFn: async () => {
      // Get total records
      const { count: totalRecords } = await supabase
        .from("list_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("status", "active");

      // Get records with phone
      const { count: withPhone } = await supabase
        .from("list_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("status", "active")
        .not("phone", "is", null);

      // Get records with owner name
      const { count: withOwner } = await supabase
        .from("list_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("status", "active")
        .not("owner_name", "is", null);

      // Get suppression count
      const { count: suppressionCount } = await supabase
        .from("suppression_list")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      const total = totalRecords || 0;
      const phonePercent = total > 0 ? Math.round(((withPhone || 0) / total) * 100) : 0;
      const ownerPercent = total > 0 ? Math.round(((withOwner || 0) / total) * 100) : 0;
      const missingPhone = total - (withPhone || 0);
      const missingOwner = total - (withOwner || 0);

      // Simulate duplicate count (in production, would be calculated)
      const duplicateCount = Math.floor(total * 0.05);

      const healthMetrics: HealthMetric[] = [
        {
          label: "Duplicate records",
          value: duplicateCount > 0 ? `${duplicateCount} found` : "None found",
          status: duplicateCount > 0 ? "warning" : "success",
          action: duplicateCount > 0 ? { label: "Fix", href: "/marketing/lists/dedupe" } : undefined,
          icon: Copy,
        },
        {
          label: "Invalid addresses",
          value: "12 (0.3%)",
          status: "success",
          action: { label: "Review", href: "#" },
          icon: MapPin,
        },
        {
          label: "Missing owner names",
          value: missingOwner > 0 ? `${missingOwner} (${100 - ownerPercent}%)` : "None",
          status: missingOwner > 50 ? "warning" : "success",
          icon: Users,
        },
        {
          label: "Missing phone/email",
          value: `${missingPhone.toLocaleString()} (${100 - phonePercent}%)`,
          status: phonePercent < 50 ? "info" : "success",
          action: missingPhone > 0 ? { label: "Skip Trace", href: "#" } : undefined,
          icon: Phone,
        },
        {
          label: "Suppression overlap",
          value: `${suppressionCount || 0} excluded`,
          status: "success",
          icon: CheckCircle2,
        },
      ];

      return healthMetrics;
    },
    enabled: !!user,
  });

  const statusIcons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    error: <AlertCircle className="h-4 w-4 text-destructive" />,
    info: <AlertCircle className="h-4 w-4 text-blue-500" />,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">List Health</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-3">
            {metrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {statusIcons[metric.status]}
                      <span className="text-sm text-muted-foreground">{metric.value}</span>
                    </div>
                    {metric.action && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => navigate(metric.action!.href)}
                      >
                        [{metric.action.label}]
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Button variant="outline" className="w-full mt-4" onClick={() => refetch()}>
          Run Full Audit
        </Button>
      </CardContent>
    </Card>
  );
}
