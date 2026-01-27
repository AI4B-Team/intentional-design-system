import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useLogActivity } from "@/hooks/useActivityLog";
import { toast } from "sonner";

interface AssignPropertyParams {
  propertyId: string;
  propertyAddress: string;
  assigneeId: string | null;
  assigneeName?: string;
}

interface BulkAssignParams {
  propertyIds: string[];
  assigneeId: string;
  assigneeName: string;
}

export function useAssignProperty() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ propertyId, propertyAddress, assigneeId, assigneeName }: AssignPropertyParams) => {
      if (!user || !organization) {
        throw new Error("User or organization not found");
      }

      // Get current assignment
      const { data: property } = await supabase
        .from("properties")
        .select("assigned_to")
        .eq("id", propertyId)
        .single();

      const previousAssignee = property?.assigned_to;

      // Update property
      const { error } = await supabase
        .from("properties")
        .update({ 
          assigned_to: assigneeId,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", propertyId);

      if (error) throw error;

      // Log activity
      if (assigneeId) {
        await logActivity.mutateAsync({
          action: "assigned",
          entityType: "property",
          entityId: propertyId,
          entityName: propertyAddress,
          changes: previousAssignee !== assigneeId ? {
            assigned_to: { old: previousAssignee, new: assigneeId }
          } : undefined,
          metadata: { assignee_name: assigneeName },
        });

        // Create notification for assignee
        if (assigneeId !== user.id) {
          await supabase.from("notifications").insert({
            user_id: assigneeId,
            organization_id: organization.id,
            type: "assignment",
            title: "New Property Assignment",
            message: `You were assigned to ${propertyAddress}`,
            link: `/properties/${propertyId}`,
          });
        }
      } else {
        await logActivity.mutateAsync({
          action: "unassigned",
          entityType: "property",
          entityId: propertyId,
          entityName: propertyAddress,
          changes: { assigned_to: { old: previousAssignee, new: null } },
        });
      }

      return { propertyId, assigneeId, assigneeName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", data.propertyId] });
      
      if (data.assigneeId) {
        toast.success(`Property assigned to ${data.assigneeName}`);
      } else {
        toast.success("Property unassigned");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign property");
    },
  });
}

export function useBulkAssignProperties() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ propertyIds, assigneeId, assigneeName }: BulkAssignParams) => {
      if (!user || !organization) {
        throw new Error("User or organization not found");
      }

      // Update all properties
      const { error } = await supabase
        .from("properties")
        .update({ 
          assigned_to: assigneeId,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .in("id", propertyIds);

      if (error) throw error;

      // Log activity for each property
      for (const propertyId of propertyIds) {
        await logActivity.mutateAsync({
          action: "assigned",
          entityType: "property",
          entityId: propertyId,
          entityName: `${propertyIds.length} properties`,
          metadata: { 
            assignee_name: assigneeName,
            bulk_assignment: true,
            total_count: propertyIds.length,
          },
        });
      }

      // Create single notification for assignee
      if (assigneeId !== user.id) {
        await supabase.from("notifications").insert({
          user_id: assigneeId,
          organization_id: organization.id,
          type: "assignment",
          title: "New Property Assignments",
          message: `You were assigned to ${propertyIds.length} properties`,
          link: `/properties?assigned_to=${assigneeId}`,
        });
      }

      return { count: propertyIds.length, assigneeName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success(`${data.count} properties assigned to ${data.assigneeName}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign properties");
    },
  });
}
