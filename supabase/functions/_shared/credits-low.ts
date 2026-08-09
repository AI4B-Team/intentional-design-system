/**
 * Shared "credits are running low" emitter.
 *
 * Any function that spends credits calls this after deducting. It resolves the
 * user's active organization and emits a signed `credits.low` App Family event
 * when the remaining balance drops below the threshold. Never throws.
 */
import { emitHubEvent } from "./hub-emit.ts";

const DEFAULT_THRESHOLD = 5;

type DeductResult = { success?: boolean; new_balance?: number; balance?: number } | null | undefined;

// deno-lint-ignore no-explicit-any
export async function maybeEmitCreditsLow(
  admin: any,
  userId: string,
  deductResult: DeductResult,
  service: string,
  threshold = DEFAULT_THRESHOLD,
): Promise<void> {
  try {
    let remaining = deductResult?.new_balance ?? deductResult?.balance;

    if (!Number.isFinite(remaining as number)) {
      const { data } = await admin
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();
      remaining = data?.balance;
    }

    if (!Number.isFinite(remaining as number) || (remaining as number) >= threshold) return;

    const { data: member } = await admin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!member?.organization_id) return;

    await emitHubEvent(admin, member.organization_id, "credits.low", {
      user_id: userId,
      balance: remaining,
      threshold,
      last_service: service,
    });
  } catch (e) {
    console.error("[credits-low]", e);
  }
}
