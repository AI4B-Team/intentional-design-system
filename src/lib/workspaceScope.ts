/**
 * Workspace-scoped query filter.
 *
 * Records created by teammates belong to the same workspace, so reads must be
 * scoped by `organization_id` — not by `user_id`, which hides everyone else's
 * rows. Legacy rows created before workspace stamping have a NULL
 * `organization_id`, so those are still included for their own creator.
 */
export function scopeToWorkspace<T>(query: T, organizationId: string | null, userId: string): T {
  const q = query as unknown as {
    or: (filter: string) => T;
    eq: (column: string, value: string) => T;
  };

  if (!organizationId) return q.eq("user_id", userId);

  return q.or(
    `organization_id.eq.${organizationId},and(organization_id.is.null,user_id.eq.${userId})`,
  );
}
