import * as React from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Users, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberWorkload {
  userId: string;
  name: string;
  role: string;
  activeProperties: number;
  todayAppointments: number;
  pendingOffers: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TeamWorkloadCard({ className }: { className?: string }) {
  const { organization, members } = useOrganization();

  const { data: workloadData, isLoading } = useQuery({
    queryKey: ["team-workload", organization?.id],
    queryFn: async () => {
      if (!organization) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get property counts by assignee
      const { data: propertyCounts } = await supabase
        .from("properties")
        .select("assigned_to")
        .eq("organization_id", organization.id)
        .not("status", "in", "(closed,dead)");

      // Get today's appointments by user
      const { data: appointments } = await supabase
        .from("appointments")
        .select("assigned_to")
        .eq("organization_id", organization.id)
        .gte("scheduled_time", today.toISOString())
        .lt("scheduled_time", tomorrow.toISOString());

      // Get pending offers by user
      const { data: offers } = await supabase
        .from("offers")
        .select("created_by")
        .eq("organization_id", organization.id)
        .eq("response", "pending");

      // Aggregate by user
      const workload: MemberWorkload[] = members
        .filter((m) => m.status === "active")
        .map((member) => {
          const activeProperties = propertyCounts?.filter(
            (p) => p.assigned_to === member.user_id
          ).length || 0;

          const todayAppointments = appointments?.filter(
            (a) => a.assigned_to === member.user_id
          ).length || 0;

          const pendingOffers = offers?.filter(
            (o) => o.created_by === member.user_id
          ).length || 0;

          return {
            userId: member.user_id,
            name: member.user?.full_name || member.user?.email || "Unknown",
            role: member.role,
            activeProperties,
            todayAppointments,
            pendingOffers,
          };
        })
        .sort((a, b) => b.activeProperties - a.activeProperties);

      return workload;
    },
    enabled: !!organization && members.length > 0,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg" className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-brand-accent" />
        <h3 className="text-h4 font-semibold text-content">Team Workload</h3>
      </div>

      {!workloadData || workloadData.length === 0 ? (
        <div className="text-center py-6">
          <Users className="h-8 w-8 mx-auto mb-2 text-content-tertiary opacity-50" />
          <p className="text-small text-content-tertiary">No team members</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary py-2">
                  Member
                </th>
                <th className="text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary py-2">
                  Active
                </th>
                <th className="text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary py-2">
                  Today
                </th>
                <th className="text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary py-2">
                  Pending
                </th>
              </tr>
            </thead>
            <tbody>
              {workloadData.map((member) => {
                const isOverloaded = member.activeProperties > 30;
                
                return (
                  <tr 
                    key={member.userId} 
                    className={cn(
                      "border-b border-border last:border-0",
                      isOverloaded && "bg-warning/10"
                    )}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-tiny bg-brand-accent/10 text-brand-accent">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-small font-medium text-content truncate max-w-[120px]">
                            {member.name}
                          </p>
                          <p className="text-tiny text-content-tertiary capitalize">
                            {member.role}
                          </p>
                        </div>
                        {isOverloaded && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3">
                      <span className={cn(
                        "text-small font-semibold tabular-nums",
                        isOverloaded ? "text-warning" : "text-content"
                      )}>
                        {member.activeProperties}
                      </span>
                    </td>
                    <td className="text-center py-3">
                      <span className="text-small font-semibold tabular-nums text-content">
                        {member.todayAppointments}
                      </span>
                    </td>
                    <td className="text-center py-3">
                      <span className="text-small font-semibold tabular-nums text-content">
                        {member.pendingOffers}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
