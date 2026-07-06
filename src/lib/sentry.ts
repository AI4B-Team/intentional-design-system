// Sentry initialization — no-op unless VITE_SENTRY_DSN is configured.
import * as Sentry from "@sentry/react";

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      // No session replay by default.
    });
    initialized = true;
  } catch {
    // Never let telemetry break the app.
  }
}

export function reportClientError(error: unknown, context?: Record<string, unknown>): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // ignore
  }
}

export function isSentryEnabled(): boolean {
  return Boolean(import.meta.env.VITE_SENTRY_DSN);
}
