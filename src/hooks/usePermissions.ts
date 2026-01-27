import { useOrganization } from "@/contexts/OrganizationContext";

export function usePermissions() {
  const { membership, hasRole } = useOrganization();

  return {
    // Property permissions
    canViewAllProperties: hasRole("manager"),
    canCreateProperty: hasRole("acquisitions"),
    canEditProperty: (assignedTo?: string | null) => {
      if (hasRole("manager")) return true;
      if (!membership) return false;
      return assignedTo === membership.user_id;
    },
    canDeleteProperty: hasRole("admin"),
    canAssignProperty: hasRole("manager"),

    // Financial permissions
    canViewFinancials: hasRole("acquisitions"),
    canMakeOffers: hasRole("acquisitions"),
    canViewCosts: hasRole("manager"),

    // Buyer/Disposition permissions
    canManageBuyers: hasRole("dispositions"),
    canSendDealBlasts: hasRole("dispositions"),

    // Team permissions
    canViewTeam: hasRole("manager"),
    canInviteMembers: hasRole("admin"),
    canRemoveMembers: hasRole("admin"),
    canChangeRoles: hasRole("admin"),

    // Settings permissions
    canManageIntegrations: hasRole("admin"),
    canManageTemplates: hasRole("manager"),
    canManageBilling: membership?.role === "owner",

    // Data access
    canExportData: hasRole("manager"),
    canViewReports: hasRole("manager"),
    canViewAllActivity: hasRole("manager"),

    // Helper to check specific role
    hasRole,
    
    // Current user's role
    currentRole: membership?.role || null,
  };
}
