/**
 * Shared helpers for the App Family integration contract.
 * Real Elite is the hub / canonical identity provider.
 */

export const HUB_EVENT_TYPES = [
  "job.completed",
  "leads.new",
  "lead.flagged_dnc",
  "lead.flagged_litigator",
  "campaign.launched",
  "message.reply_received",
  "brand.approved",
  "credits.low",
] as const;

export type HubEventType = (typeof HUB_EVENT_TYPES)[number];

const encoder = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlFromString(s: string): string {
  return b64url(encoder.encode(s));
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  const padded = pad + "=".repeat((4 - (pad.length % 4)) % 4);
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Payload of the short-lived SSO handoff token. */
export interface HubTokenPayload {
  reo_org_id: string;
  reo_user_id: string;
  email: string;
  name: string;
  org_name: string;
  role: string;
  exp: number;
}

/** Mint a 60-second HS256 JWT for handoff to a satellite app. */
export async function mintHubToken(
  payload: Omit<HubTokenPayload, "exp">,
  secret: string,
  ttlSeconds = 60,
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const body: HubTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const signingInput = `${b64urlFromString(JSON.stringify(header))}.${b64urlFromString(
    JSON.stringify(body),
  )}`;
  const key = await hmacKey(secret);
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput)),
  );
  return `${signingInput}.${b64url(sig)}`;
}

/** Verify an HS256 JWT minted by a family app. Returns null when invalid/expired. */
export async function verifyHubToken(
  token: string,
  secret: string,
): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const key = await hmacKey(secret);
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    b64urlDecode(parts[2]),
    encoder.encode(`${parts[0]}.${parts[1]}`),
  );
  if (!ok) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[1])));
    if (typeof payload.exp === "number" && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/** Hex HMAC-SHA256 signature used for webhook + event authenticity headers. */
export async function hmacSignature(body: string, secret: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body)));
  return Array.from(sig)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time-ish comparison for signature strings. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hub-signature",
};
