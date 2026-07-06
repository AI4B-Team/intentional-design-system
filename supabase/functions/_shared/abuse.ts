// Shared abuse-protection helpers for public edge functions.
//
// - checkAndBumpIpLimit: table-backed per-IP hourly counter. Returns
//   { ok: false } once the caller has exceeded `limit` requests for the
//   given endpoint in the current UTC hour window.
// - verifyTurnstile: verifies a Cloudflare Turnstile token when
//   TURNSTILE_SECRET_KEY is configured. If the secret is missing, verification
//   is skipped and the call is treated as valid so nothing breaks before keys
//   are added.
// - getClientIp: extracts the best-effort client IP from proxy headers.

// deno-lint-ignore-file no-explicit-any

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

export function currentHourWindow(): string {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  return now.toISOString();
}

/**
 * Increments the per-IP counter for `endpoint` in the current hour window and
 * returns whether the caller is still under `limit`. Errors are logged and
 * fail-open so a rate-limit outage never blocks legitimate submissions.
 */
export async function checkAndBumpIpLimit(
  supabase: any,
  ip: string,
  endpoint: string,
  limit: number,
): Promise<{ ok: boolean; count: number }> {
  try {
    const windowStart = currentHourWindow();
    const { data: existing } = await supabase
      .from("public_ip_rate_limits")
      .select("request_count")
      .eq("ip", ip)
      .eq("endpoint", endpoint)
      .eq("window_start", windowStart)
      .maybeSingle();

    const current = existing?.request_count ?? 0;
    if (current >= limit) {
      return { ok: false, count: current };
    }

    await supabase.from("public_ip_rate_limits").upsert(
      {
        ip,
        endpoint,
        window_start: windowStart,
        request_count: current + 1,
      },
      { onConflict: "ip,endpoint,window_start" },
    );

    return { ok: true, count: current + 1 };
  } catch (err) {
    console.error(`[abuse] rate-limit check failed for ${endpoint}:`, err);
    return { ok: true, count: 0 };
  }
}

/**
 * Verifies a Cloudflare Turnstile token when the server secret is configured.
 * Returns true and skips verification if TURNSTILE_SECRET_KEY is unset so the
 * public forms keep working before keys are added.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  ip: string,
): Promise<{ ok: boolean; skipped: boolean; reason?: string }> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) {
    return { ok: true, skipped: true };
  }
  if (!token) {
    return { ok: false, skipped: false, reason: "missing_token" };
  }

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (ip && ip !== "unknown") form.set("remoteip", ip);

    const resp = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form },
    );
    const data = (await resp.json()) as { success?: boolean; ["error-codes"]?: string[] };
    if (data?.success) return { ok: true, skipped: false };
    return {
      ok: false,
      skipped: false,
      reason: (data?.["error-codes"] || []).join(",") || "turnstile_failed",
    };
  } catch (err) {
    console.error("[abuse] turnstile verify error:", err);
    // Fail open on transient errors so a Cloudflare outage doesn't block forms.
    return { ok: true, skipped: false, reason: "verify_error" };
  }
}

export function rateLimitedResponse(corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({
      error: "Too many submissions, please try again later.",
    }),
    {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
