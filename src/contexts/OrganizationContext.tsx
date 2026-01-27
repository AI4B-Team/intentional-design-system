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
}

interface OrganizationContextType {
  organization: Organization | null;
  membership: OrganizationMember | null;
  members: OrganizationMember[];
  loading: boolean;
  hasRole: (requiredRole: OrgRole) => boolean;
  canManageTeam: boolean;
  canManageBilling: boolean;
  canEditAllProperties: boolean;
  refetchOrganization: () => Promise<void>;
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
      // Get user's membership
      const { data: membershipData, error: membershipError } = await supabase
        .from("organization_members")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (membershipError || !membershipData) {
        // User has no organization yet
        setOrganization(null);
        setMembership(null);
        setMembers([]);
        setLoading(false);
        return;
      }

      setMembership(membershipData as unknown as OrganizationMember);

      // Get organization details
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", membershipData.organization_id)
        .single();

      if (orgError) {
        console.error("Error fetching organization:", orgError);
        setOrganization(null);
      } else {
        setOrganization(orgData as Organization);
      }
    } catch (error) {
      console.error("Error in fetchOrganization:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMembers = React.useCallback(async () => {
    if (!organization) {
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
  }, [organization]);

  React.useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  React.useEffect(() => {
    if (organization) {
      fetchMembers();
    }
  }, [organization, fetchMembers]);

  // Role check helper
  const hasRole = React.useCallback(
    (requiredRole: OrgRole): boolean => {
      if (!membership) return false;
      return ROLE_HIERARCHY[membership.role] >= ROLE_HIERARCHY[requiredRole];
    },
    [membership]
  );

  // Computed permissions
  const canManageTeam = React.useMemo(() => hasRole("admin"), [hasRole]);
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
        canManageBilling,
        canEditAllProperties,
        refetchOrganization: fetchOrganization,
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
