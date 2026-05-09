import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * agent-detect: Pulls/synthesizes distress signals into leads_signals
 * and upserts canonical leads_properties rows.
 *
 * Body: { organization_id?: string, signal_types?: string[] }
 * If no organization_id is passed, runs across all orgs (cron mode).
 */

const SIGNAL_TYPES = [
  "notice_of_default",
  "tax_default",
  "estate_filing",
  "code_violation",
  "vacancy",
  "stale_listing",
  "pre_foreclosure",
  "divorce_filing",
];

const STREETS = ["Maple St", "Oak Ave", "Elm Dr", "Cedar Ln", "Pine Ct", "Birch Way", "Walnut Blvd"];
const CITIES: Array<[string, string, string]> = [
  ["Dallas", "TX", "75201"],
  ["Houston", "TX", "77002"],
  ["Atlanta", "GA", "30303"],
  ["Phoenix", "AZ", "85003"],
  ["Tampa", "FL", "33602"],
];
const COUNTIES = ["Dallas", "Harris", "Fulton", "Maricopa", "Hillsborough"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function detectForOrg(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
  requestedTypes?: string[],
) {
  const types = requestedTypes && requestedTypes.length > 0 ? requestedTypes : SIGNAL_TYPES;
  // Synthesize 5–15 fresh signals for this run. Real implementation would
  // call county scrapers / Firecrawl pipelines; this skeleton seeds plausible data.
  const count = 5 + Math.floor(Math.random() * 11);
  let detected = 0;
  let upserted = 0;

  for (let i = 0; i < count; i++) {
    const [city, state, zip] = pick(CITIES);
    const street = `${100 + Math.floor(Math.random() * 9000)} ${pick(STREETS)}`;
    const addressHash = await sha256(`${street}|${city}|${state}|${zip}`);

    // Upsert leads_properties by address_hash (within org)
    const { data: existing } = await supabase
      .from("leads_properties")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("address_hash", addressHash)
      .maybeSingle();

    let leadPropertyId: string;
    if (existing?.id) {
      leadPropertyId = existing.id as string;
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from("leads_properties")
        .insert({
          organization_id: organizationId,
          source: "auto_detect",
          address: street,
          city,
          state,
          zip,
          county: pick(COUNTIES),
          address_hash: addressHash,
          asset_class: "single_family",
          beds: 2 + Math.floor(Math.random() * 4),
          baths: 1 + Math.floor(Math.random() * 3),
          sqft: 800 + Math.floor(Math.random() * 2500),
          year_built: 1950 + Math.floor(Math.random() * 70),
          estimated_value: 80000 + Math.floor(Math.random() * 400000),
          estimated_equity: Math.floor(Math.random() * 200000),
          status: "new",
        })
        .select("id")
        .single();
      if (insErr) {
        console.error("[agent-detect] insert failed:", insErr.message);
        continue;
      }
      leadPropertyId = inserted!.id as string;
      upserted++;
    }

    const signalType = pick(types);
    const severity = pick(["low", "medium", "high", "critical"]);
    const { error: sigErr } = await supabase.from("leads_signals").insert({
      organization_id: organizationId,
      lead_property_id: leadPropertyId,
      signal_type: signalType,
      severity,
      confidence: 0.6 + Math.random() * 0.4,
      source: "synthetic_detector",
      payload: { synthesized: true },
    });
    if (!sigErr) detected++;
  }

  return { organization_id: organizationId, signals_detected: detected, properties_upserted: upserted };
}

async function sha256(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const requestedOrg: string | undefined = body.organization_id;
    const signalTypes: string[] | undefined = body.signal_types;

    const orgs: string[] = [];
    if (requestedOrg) {
      orgs.push(requestedOrg);
    } else {
      const { data: orgRows } = await supabase.from("organizations").select("id").limit(500);
      (orgRows ?? []).forEach((o: any) => orgs.push(o.id));
    }

    const results = [];
    for (const orgId of orgs) {
      try {
        results.push(await detectForOrg(supabase, orgId, signalTypes));
      } catch (e) {
        console.error("[agent-detect] org failed", orgId, e);
        results.push({ organization_id: orgId, error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[agent-detect] fatal:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
