// Shared webhook signature validation helpers.
// All comparisons use constant-time equality to avoid timing attacks.

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function base64Encode(bytes: ArrayBuffer): string {
  const b = new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}

function hexEncode(bytes: ArrayBuffer): string {
  const b = new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return s;
}

async function hmac(
  algo: "SHA-1" | "SHA-256",
  key: string,
  data: string,
): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: algo },
    false,
    ["sign"],
  );
  return await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
}

function buildTwilioBase(url: string, params: Record<string, string>): string {
  const keys = Object.keys(params).sort();
  let base = url;
  for (const k of keys) base += k + params[k];
  return base;
}

async function computeTwilio(
  authToken: string,
  url: string,
  params: Record<string, string>,
): Promise<string> {
  const base = buildTwilioBase(url, params);
  return base64Encode(await hmac("SHA-1", authToken, base));
}

// Twilio request signing scheme.
// Gotcha: behind TLS termination req.url may be http:// while Twilio signed
// https://. Try as-is, then retry once with the scheme forced to https.
export async function validateTwilioSignature({
  authToken,
  url,
  params,
  signature,
}: {
  authToken: string;
  url: string;
  params: Record<string, string>;
  signature: string | null;
}): Promise<boolean> {
  if (!signature) return false;
  const sig1 = await computeTwilio(authToken, url, params);
  if (timingSafeEqual(sig1, signature)) return true;
  if (url.startsWith("http://")) {
    const httpsUrl = "https://" + url.slice("http://".length);
    const sig2 = await computeTwilio(authToken, httpsUrl, params);
    if (timingSafeEqual(sig2, signature)) return true;
  }
  return false;
}

// Lob webhook signature scheme: HMAC-SHA256 over `${timestamp}.${rawBody}`,
// hex-encoded. Enforce 5-minute replay window. Timestamp is in milliseconds.
export async function validateLobSignature({
  secret,
  timestamp,
  rawBody,
  signature,
}: {
  secret: string;
  timestamp: string | null;
  rawBody: string;
  signature: string | null;
}): Promise<boolean> {
  if (!signature || !timestamp) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const skewMs = Math.abs(Date.now() - ts);
  if (skewMs > 5 * 60 * 1000) return false;
  const expected = hexEncode(
    await hmac("SHA-256", secret, `${timestamp}.${rawBody}`),
  );
  return timingSafeEqual(expected, signature);
}
