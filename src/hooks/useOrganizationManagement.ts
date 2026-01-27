import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization, type Organization, type OrganizationMember, type OrgRole } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

// Generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) + "-" + Math.random().toString(36).slice(2, 8);
}

export function useCreateOrganization() {
  const { user } = useAuth();
  const { refreshOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; website?: string; phone?: string }) => {
      if (!user) throw new Error("User not authenticated");

      const slug = generateSlug(data.name);

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: data.name,
          slug,
          website: data.website || null,
          phone: data.phone || null,
          billing_email: user.email,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: "owner",
          status: "active",
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        // Rollback org creation
        await supabase.from("organizations").delete().eq("id", org.id);
        throw memberError;
      }

      return org as Organization;
    },
    onSuccess: async () => {
      await refreshOrganization();
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast.success("Organization created successfully!");
    },
    onError: (error: Error) => {
      console.error("Error creating organization:", error);
      toast.error(error.message || "Failed to create organization");
    },
  });
}

export function useUpdateOrganization() {
  const { organization, refreshOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Organization>) => {
      if (!organization) throw new Error("No organization");

      const { data, error } = await supabase
        .from("organizations")
        .update(updates)
        .eq("id", organization.id)
        .select()
        .single();

      if (error) throw error;
      return data as Organization;
    },
    onSuccess: async () => {
      await refreshOrganization();
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast.success("Organization updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update organization");
    },
  });
}

export function useOrganizationInvites() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ["organization-invites", organization?.id],
    queryFn: async () => {
      if (!organization) return [];

      const { data, error } = await supabase
        .from("organization_invites")
        .select("*")
        .eq("organization_id", organization.id)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organization,
  });
}

export function useInviteMember() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: OrgRole }) => {
      if (!organization || !user) throw new Error("No organization or user");

      // Check max users limit
      const { count } = await supabase
        .from("organization_members")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .eq("status", "active");

      if (count && count >= organization.max_users) {
        throw new Error(`Organization has reached maximum users limit (${organization.max_users})`);
      }

      const { data, error } = await supabase
        .from("organization_invites")
        .insert({
          organization_id: organization.id,
          email,
          role,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-invites"] });
      toast.success("Invitation sent");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });
}

export function useRemoveMember() {
  const { organization, refetchMembers } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      if (!organization) throw new Error("No organization");

      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberId)
        .eq("organization_id", organization.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchMembers();
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      toast.success("Member removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove member");
    },
  });
}

export function useUpdateMemberRole() {
  const { organization, refetchMembers } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: OrgRole }) => {
      if (!organization) throw new Error("No organization");

      const { data, error } = await supabase
        .from("organization_members")
        .update({ role })
        .eq("id", memberId)
        .eq("organization_id", organization.id)
        .select()
        .single();

      if (error) throw error;
      return data as OrganizationMember;
    },
    onSuccess: async () => {
      await refetchMembers();
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      toast.success("Member role updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
  });
}

export function useAcceptInvite() {
  const { user } = useAuth();
  const { refreshOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!user) throw new Error("User not authenticated");

      // Find the invite
      const { data: invite, error: inviteError } = await supabase
        .from("organization_invites")
        .select("*")
        .eq("token", token)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (inviteError || !invite) {
        throw new Error("Invalid or expired invitation");
      }

      // Create membership
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: invite.organization_id,
          user_id: user.id,
          role: invite.role,
          status: "active",
          invited_by: invite.invited_by,
          invited_at: invite.created_at,
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      // Mark invite as accepted
      await supabase
        .from("organization_invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      return invite;
    },
    onSuccess: async () => {
      await refreshOrganization();
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast.success("You've joined the organization!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept invitation");
    },
  });
}
