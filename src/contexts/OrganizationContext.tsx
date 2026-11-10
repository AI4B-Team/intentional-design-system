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
  /** Every active organization the user belongs to (workspaces) */
  organizations: Organization[];
  /** Role of the user in each organization, keyed by organization id */
  rolesByOrganization: Record<string, OrgRole>;
  switchOrganization: (organizationId: string) => void;
  loading: boolean;
  /** True when the last workspace refresh could not reach the backend (auto-retrying) */
  connectionError: boolean;
  hasRole: (role: OrgRole | string) => boolean;
  canManageTeam: boolean;
  canManageSettings: boolean;
  canManageBilling: boolean;
  canEditAllProperties: boolean;
  refreshOrganization: () => Promise<void>;
  refetchMembers: () => Promise<void>;
}

import { ACTIVE_ORG_STORAGE_KEY } from "@/lib/activeOrganization";

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

type MemberRow = Record<string, unknown> & {
  id: string;
  organization_id: string;
  organizations: Organization | null;
};

// Last-known workspace list per user. Lets the app render instantly (and stay
// usable) when the backend is slow, then refresh quietly in the background.
const ORG_CACHE_PREFIX = "df_org_cache:";
const FETCH_TIMEOUT_MS = 12_000;
const RETRY_BASE_MS = 15_000;
const RETRY_MAX_MS = 2 * 60_000;

function readOrgCache(userId: string): MemberRow[] | null {
  try {
    const raw = localStorage.getItem(ORG_CACHE_PREFIX + userId);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as MemberRow[]) : null;
  } catch {
    return null;
  }
}

function writeOrgCache(userId: string, rows: MemberRow[]) {
  try {
    localStorage.setItem(ORG_CACHE_PREFIX + userId, JSON.stringify(rows));
  } catch {
    /* storage unavailable */
  }
}

function clearOrgCaches() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(ORG_CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage unavailable */
  }
}

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [membership, setMembership] = React.useState<OrganizationMember | null>(null);
  const [members, setMembers] = React.useState<OrganizationMember[]>([]);
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [rolesByOrganization, setRolesByOrganization] = React.useState<Record<string, OrgRole>>({});
  const [activeOrgId, setActiveOrgId] = React.useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = React.useState(true);
  const [connectionError, setConnectionError] = React.useState(false);

  const activeOrgIdRef = React.useRef(activeOrgId);
  activeOrgIdRef.current = activeOrgId;
  const rowsRef = React.useRef<MemberRow[] | null>(null);
  const rowsUserRef = React.useRef<string | null>(null);
  const retryTimerRef = React.useRef<number | null>(null);
  const retryAttemptRef = React.useRef(0);
  const fetchRef = React.useRef<() => Promise<void>>();

  const switchOrganization = React.useCallback((organizationId: string) => {
    setActiveOrgId(organizationId);
    try {
      localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, organizationId);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const clearState = React.useCallback(() => {
    setOrganization(null);
    setMembership(null);
    setMembers([]);
    setOrganizations([]);
    setRolesByOrganization({});
  }, []);

  /** Derive all workspace state from membership rows. Returns the active membership row. */
  const applyRows = React.useCallback(
    (rows: MemberRow[]): MemberRow | null => {
      rowsRef.current = rows;
      if (rows.length === 0) {
        clearState();
        return null;
      }

      const roleMap: Record<string, OrgRole> = {};
      rows.forEach((r) => {
        roleMap[r.organization_id] = r.role as OrgRole;
      });
      setOrganizations(rows.map((r) => r.organizations as Organization));
      setRolesByOrganization(roleMap);

      // Prefer the stored active workspace, fall back to the most recent membership
      const stored = activeOrgIdRef.current;
      const memberData = (stored && rows.find((r) => r.organization_id === stored)) || rows[0];

      // Keep the stored id in sync so a deleted/left workspace isn't remembered forever
      if (memberData.organization_id !== stored) {
        try {
          localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, memberData.organization_id);
        } catch {
          /* storage unavailable */
        }
      }

      setOrganization(memberData.organizations as Organization);
      setMembership({
        id: memberData.id,
        organization_id: memberData.organization_id,
        user_id: memberData.user_id as string,
        role: memberData.role as OrgRole,
        status: memberData.status as string,
        invited_by: (memberData.invited_by as string | null) ?? null,
        invited_at: (memberData.invited_at as string | null) ?? null,
        joined_at: (memberData.joined_at as string | null) ?? null,
        last_active_at: (memberData.last_active_at as string | null) ?? null,
        created_at: memberData.created_at as string,
      });
      return memberData;
    },
    [clearState],
  );

  const fetchOrganization = React.useCallback(async () => {
    // Wait for auth to finish loading before checking organization
    if (authLoading) return;

    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    if (!userId) {
      rowsRef.current = null;
      rowsUserRef.current = null;
      clearState();
      clearOrgCaches();
      setConnectionError(false);
      setLoading(false);
      return;
    }

    // New user in this tab: forget the previous user's rows, hydrate from cache
    if (rowsUserRef.current !== userId) {
      rowsUserRef.current = userId;
      rowsRef.current = null;
      const cached = readOrgCache(userId);
      if (cached) {
        applyRows(cached);
        setLoading(false);
      }
    }

    // Only block the page when we have nothing to show yet
    if (rowsRef.current === null) setLoading(true);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      // Every active membership with its organization (a user can belong to several)
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          *,
          organizations (*)
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .abortSignal(controller.signal);

      // A failed request is NOT "no workspace" — never send the user to signup for it
      if (error) throw error;

      const rows = ((data ?? []) as unknown as MemberRow[]).filter((r) => r.organizations);
      writeOrgCache(userId, rows);
      retryAttemptRef.current = 0;
      setConnectionError(false);

      const active = applyRows(rows);
      if (active) {
        // Update last_active_at (fire and forget - don't block loading)
        void supabase
          .from("organization_members")
          .update({ last_active_at: new Date().toISOString() })
          .eq("id", active.id);
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
      setConnectionError(true);
      // Back off: 15s, 30s, 60s, then every 2 min until the backend answers
      const delay = Math.min(RETRY_BASE_MS * 2 ** retryAttemptRef.current, RETRY_MAX_MS);
      retryAttemptRef.current += 1;
      retryTimerRef.current = window.setTimeout(() => {
        void fetchRef.current?.();
      }, delay);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, [userId, authLoading, applyRows, clearState]);

  fetchRef.current = fetchOrganization;

  React.useEffect(() => {
    void fetchOrganization();
  }, [fetchOrganization]);

  React.useEffect(
    () => () => {
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
    },
    [],
  );

  // Switching workspace only re-derives state from rows we already have
  React.useEffect(() => {
    if (rowsRef.current) applyRows(rowsRef.current);
  }, [activeOrgId, applyRows]);

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
        organizations,
        rolesByOrganization,
        switchOrganization,
        loading,
        connectionError,
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
