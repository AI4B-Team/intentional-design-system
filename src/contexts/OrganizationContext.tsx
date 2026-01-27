import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type OrgRole = "owner" | "admin" | "manager" | "acquisitions" | "dispositions" | "caller" | "member";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  timezone: string;
  billing_email: string | null;
  subscription_tier: string;
  subscription_status: string;
  max_users: number;
  max_properties: number;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  status: string;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  last_active_at: string | null;
  created_at: string;
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface OrganizationContextType {
  organization: Organization | null;
  membership: OrganizationMember | null;
  members: OrganizationMember[];
  loading: boolean;
  hasRole: (role: OrgRole | string) => boolean;
  canManageTeam: boolean;
  canManageSettings: boolean;
  canManageBilling: boolean;
  canEditAllProperties: boolean;
  refreshOrganization: () => Promise<void>;
  refetchMembers: () => Promise<void>;
}

const OrganizationContext = React.createContext<OrganizationContextType | undefined>(undefined);

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 7,
  admin: 6,
  manager: 5,
  acquisitions: 4,
  dispositions: 3,
  caller: 2,
  member: 1,
};

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [membership, setMembership] = React.useState<OrganizationMember | null>(null);
  const [members, setMembers] = React.useState<OrganizationMember[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchOrganization = React.useCallback(async () => {
    if (!user) {
      setOrganization(null);
      setMembership(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get user's membership with organization
      const { data: memberData, error: memberError } = await supabase
        .from("organization_members")
        .select(`
          *,
          organizations (*)
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (memberError || !memberData) {
        // User has no organization - will need to create or join one
        setOrganization(null);
        setMembership(null);
        setMembers([]);
        setLoading(false);
        return;
      }

      // Extract organization from nested response
      const orgData = (memberData as any).organizations as Organization;
      const membershipData: OrganizationMember = {
        id: memberData.id,
        organization_id: memberData.organization_id,
        user_id: memberData.user_id,
        role: memberData.role as OrgRole,
        status: memberData.status,
        invited_by: memberData.invited_by,
        invited_at: memberData.invited_at,
        joined_at: memberData.joined_at,
        last_active_at: memberData.last_active_at,
        created_at: memberData.created_at,
      };

      setOrganization(orgData);
      setMembership(membershipData);

      // Update last_active_at
      await supabase
        .from("organization_members")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", memberData.id);

    } catch (error) {
      console.error("Error fetching organization:", error);
      setOrganization(null);
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMembers = React.useCallback(async () => {
    if (!organization || !membership) {
      setMembers([]);
      return;
    }

    // Only fetch members if user has permission
    if (!["owner", "admin", "manager"].includes(membership.role)) {
      setMembers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching members:", error);
        return;
      }

      setMembers(data as unknown as OrganizationMember[]);
    } catch (error) {
      console.error("Error in fetchMembers:", error);
    }
  }, [organization, membership]);

  React.useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  React.useEffect(() => {
    if (organization && membership) {
      fetchMembers();
    }
  }, [organization, membership, fetchMembers]);

  // Role check helper - supports hierarchical checking
  const hasRole = React.useCallback(
    (requiredRole: OrgRole | string): boolean => {
      if (!membership) return false;
      const userLevel = ROLE_HIERARCHY[membership.role] || 0;
      const requiredLevel = ROLE_HIERARCHY[requiredRole as OrgRole] || 0;
      return userLevel >= requiredLevel;
    },
    [membership]
  );

  // Computed permissions
  const canManageTeam = React.useMemo(() => hasRole("admin"), [hasRole]);
  const canManageSettings = React.useMemo(() => hasRole("admin"), [hasRole]);
  const canManageBilling = React.useMemo(() => membership?.role === "owner", [membership]);
  const canEditAllProperties = React.useMemo(() => hasRole("manager"), [hasRole]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        membership,
        members,
        loading,
        hasRole,
        canManageTeam,
        canManageSettings,
        canManageBilling,
        canEditAllProperties,
        refreshOrganization: fetchOrganization,
        refetchMembers: fetchMembers,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = React.useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
