// Tiny error reporter for edge functions.
// - Always console.error
// - When SENTRY_DSN is set, best-effort POST to Sentry's store endpoint
// - Never throws

interface ReportContext {
  functionName: string;
  requestId?: string;
  extra?: Record<string, unknown>;
}

function parseDsn(dsn: string): { storeUrl: string; publicKey: string } | null {
  try {
    const u = new URL(dsn);
    const publicKey = u.username;
    const projectId = u.pathname.replace(/^\/+/, "");
    if (!publicKey || !projectId) return null;
    const host = u.host;
    const storeUrl = `${u.protocol}//${host}/api/${projectId}/store/`;
    return { storeUrl, publicKey };
  } catch {
    return null;
  }
}

export async function reportError(err: unknown, ctx: ReportContext): Promise<void> {
  const error = err instanceof Error ? err : new Error(String(err));
  // Always log locally.
  try {
    console.error(
      `[${ctx.functionName}]${ctx.requestId ? ` req=${ctx.requestId}` : ""}`,
      error.message,
      error.stack ?? "",
      ctx.extra ?? "",
    );
  } catch {
    // ignore
  }

  const dsn = Deno.env.get("SENTRY_DSN");
  if (!dsn) return;

  const parsed = parseDsn(dsn);
  if (!parsed) return;

  const payload = {
    event_id: crypto.randomUUID().replace(/-/g, ""),
    timestamp: new Date().toISOString(),
    platform: "javascript",
    level: "error",
    logger: ctx.functionName,
    server_name: ctx.functionName,
    environment: Deno.env.get("SENTRY_ENVIRONMENT") ?? "production",
    tags: {
      function: ctx.functionName,
      ...(ctx.requestId ? { request_id: ctx.requestId } : {}),
    },
    extra: ctx.extra ?? {},
    exception: {
      values: [
        {
          type: error.name || "Error",
          value: error.message,
          stacktrace: error.stack ? { frames: [{ filename: ctx.functionName, function: error.stack.split("\n")[0] }] } : undefined,
        },
      ],
    },
    message: error.message,
  };

  const auth =
    `Sentry sentry_version=7,sentry_client=lovable-edge/1.0,sentry_key=${parsed.publicKey}`;

  try {
    await fetch(parsed.storeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": auth,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Never let the reporter throw.
  }
}
