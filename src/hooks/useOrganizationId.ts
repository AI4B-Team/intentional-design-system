import { useOrganization } from "@/contexts/OrganizationContext";

/**
 * Helper hook to get the current organization ID for database operations.
 * Returns null if the user is not part of an organization yet.
 */
export function useCurrentOrganizationId(): string | null {
  const { organization } = useOrganization();
  return organization?.id || null;
}

/**
 * Hook to get organization ID with a fallback for backwards compatibility.
 * During migration, data without organization_id will still work with user_id filtering.
 */
export function useOrganizationContext() {
  const { organization, membership, hasRole, canManageTeam, canEditAllProperties } = useOrganization();
  
  return {
    organizationId: organization?.id || null,
    userRole: membership?.role || null,
    hasRole,
    canManageTeam,
    canEditAllProperties,
    isOrgMember: !!organization && !!membership,
  };
}
