/**
 * Workspace-scoped query filter.
 *
 * Records created by teammates belong to the same workspace, so reads must be
 * scoped by `organization_id` — not by `user_id`, which hides everyone else's
 * rows. Legacy rows created before workspace stamping have a NULL
 * `organization_id`, so those are still included for their own creator.
 */
export function scopeToWorkspace<T>(
  query: T,
  organizationId: string | null,
  userId: string,
  ownerColumn: "user_id" | "created_by" = "user_id",
): T {
  const q = query as unknown as {
    or: (filter: string) => T;
    eq: (column: string, value: string) => T;
  };

  if (!organizationId) return q.eq(ownerColumn, userId);

  return q.or(
    `organization_id.eq.${organizationId},and(organization_id.is.null,${ownerColumn}.eq.${userId})`,
  );
}

/**
 * Scope a per-user integration connection (Lob, GHL, Closebot, ...) to the
 * active workspace. Each workspace keeps its own credentials, while legacy rows
 * with a NULL `organization_id` remain visible to their creator.
 */
export function scopeConnectionToWorkspace<T>(
  query: T,
  organizationId: string | null,
  userId: string,
): T {
  const q = query as unknown as {
    or: (filter: string) => T;
    eq: (column: string, value: string) => T;
  };

  const scoped = q.eq("user_id", userId) as unknown as {
    or: (filter: string) => T;
  };

  if (!organizationId) return scoped as unknown as T;

  return scoped.or(`organization_id.eq.${organizationId},organization_id.is.null`);
}
