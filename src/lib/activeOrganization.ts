/**
 * Active workspace helpers usable outside of React render scope.
 *
 * The OrganizationContext persists the active workspace id in localStorage so
 * mutations that run inside callbacks (mutation functions, event handlers) can
 * stamp new rows with the workspace the user is currently working in. Without
 * this, records are created with a NULL organization_id and stay invisible to
 * teammates.
 */
export const ACTIVE_ORG_STORAGE_KEY = "re_active_organization_id";

export function getActiveOrganizationId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ORG_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

/** Convenience spread for insert payloads: `{ ...withActiveOrganization() }` */
export function withActiveOrganization(): { organization_id: string | null } {
  return { organization_id: getActiveOrganizationId() };
}
