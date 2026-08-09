/**
 * Shared App Family acceptance checks (standards §6).
 * Used by hub-integration-check (on demand) and hub-integration-monitor (nightly).
 */
import { hmacSignature } from "./hub.ts";

export interface Check {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

export async function probe(
  url: string,
  method: string,
  body?: string,
  headers: Record<string, string> = {},
): Promise<{ status: number; error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json", ...headers } : headers,
      body,
      signal: controller.signal,
      redirect: "follow",
    });
    return { status: res.status, error: "" };
  } catch (e) {
    return { status: 0, error: e instanceof Error ? e.message : "Request failed" };
  } finally {
    clearTimeout(timer);
  }
}

/** Runs the full contract check suite for one satellite app. */
export async function runIntegrationChecks(
  baseUrl: string,
  orgId: string,
  secret: string,
): Promise<Check[]> {
  const base = String(baseUrl ?? "").replace(/\/+$/, "");
  const checks: Check[] = [];

  const configured = /^https:\/\/\S+$/i.test(base);
  const stale = /lovableproject\.com|id-preview|localhost|127\.0\.0\.1/i.test(base);
  checks.push({
    id: "config",
    label: "Published URL Configured",
    ok: configured && !stale,
    detail: !configured
      ? "base_url must be a full https URL"
      : stale
        ? `Looks like a preview/local URL: ${base}`
        : base,
  });
  if (!configured) return checks;

  const root = await probe(base, "GET");
  checks.push({
    id: "reachable",
    label: "App Reachable",
    ok: root.status > 0 && root.status < 500,
    detail: root.status ? `HTTP ${root.status}` : root.error,
  });

  const authHub = await probe(`${base}/auth/hub`, "GET");
  checks.push({
    id: "auth_hub",
    label: "SSO Landing Route (/auth/hub)",
    ok: authHub.status > 0 && authHub.status !== 404 && authHub.status < 500,
    detail: authHub.status ? `HTTP ${authHub.status}` : authHub.error,
  });

  const envelope = JSON.stringify({
    id: crypto.randomUUID(),
    source: "real-elite",
    real_elite_org_id: orgId,
    event_type: "hub.integration_check",
    payload: { check: true },
    created_at: new Date().toISOString(),
  });
  const sig = await hmacSignature(envelope, secret);
  const eventsUrl = `${base}/api/hub/events`;

  const good = await probe(eventsUrl, "POST", envelope, {
    "x-webhook-signature": sig,
    "x-hub-signature": sig,
  });
  checks.push({
    id: "events_signed",
    label: "Signed Event Accepted (/api/hub/events)",
    ok: good.status >= 200 && good.status < 300,
    detail: good.status ? `HTTP ${good.status}` : good.error,
  });

  const bad = await probe(eventsUrl, "POST", envelope, {
    "x-webhook-signature": "deadbeef",
    "x-hub-signature": "deadbeef",
  });
  checks.push({
    id: "events_signature_enforced",
    label: "Bad Signature Rejected",
    ok: bad.status === 401 || bad.status === 403,
    detail: bad.status ? `HTTP ${bad.status}` : bad.error,
  });

  const ping = await probe(`${base}/api/hub/actions/ping`, "POST", envelope, {
    "x-webhook-signature": sig,
    "x-hub-signature": sig,
    "x-real-elite-org-id": orgId,
  });
  checks.push({
    id: "actions",
    label: "Action Endpoint (/api/hub/actions/ping)",
    ok: ping.status > 0 && ping.status !== 404 && ping.status < 500,
    detail: ping.status ? `HTTP ${ping.status}` : ping.error,
  });

  return checks;
}
