/**
 * Active-workspace resolution for edge functions.
 *
 * A user can belong to several organizations (workspaces). Functions must act on
 * the workspace the user is currently working in — which the client sends as
 * `organization_id` — instead of silently picking the oldest membership.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reads and validates an optional `organization_id` from a request body. */
export function requestedOrgId(body: unknown): string | null {
  const raw = (body as Record<string, unknown> | null)?.organization_id;
  const id = typeof raw === "string" ? raw.trim() : "";
  return UUID_RE.test(id) ? id : null;
}

/**
 * Returns the caller's active membership for the requested workspace, falling
 * back to their first active membership when none was requested (or the
 * requested one isn't theirs).
 */
export async function resolveActiveMembership(
  // deno-lint-ignore no-explicit-any
  admin: any,
  userId: string,
  requested: string | null,
  select = "organization_id, role",
): Promise<Record<string, unknown> | null> {
  if (requested) {
    const { data } = await admin
      .from("organization_members")
      .select(select)
      .eq("user_id", userId)
      .eq("organization_id", requested)
      .eq("status", "active")
      .maybeSingle();
    if (data) return data;
  }

  const { data } = await admin
    .from("organization_members")
    .select(select)
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}
