import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-scraper-token",
};

/**
 * agent-detect — Real webhook endpoint for the Python scraper system.
 *
 * Replaces the previous synthetic data generator.
 *
 * Two modes:
 *
 * 1. SCRAPER WEBHOOK (called by Python scrapers via GitHub Actions)
 *    POST with header: x-scraper-token = SCRAPER_SECRET env var
 *    Body: { organization_id, leads: ScrapedLead[], county, state, source_name }
 *    → Upserts leads_properties, inserts leads_signals, updates scraper health
 *    → Triggers agent-grade for scoring
 *
 * 2. MANUAL TRIGGER (called from Real Elite UI / Settings → Leads → Sources)
 *    POST with Authorization: Bearer <user_jwt>
 *    Body: { organization_id, county, state, signal_types }
 *    → Queues a leads_scan_job and returns immediately
 *    → GitHub Actions picks up the job via webhook or scheduled run
 */

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SCRAPER_SECRET = Deno.env.get("SCRAPER_SECRET") ?? "";

// ── Types ─────────────────────────────────────────────────────────────────

interface IncomingLead {
  address:          string;
  city:             string;
  state:            string;
  zip_code:         string;
  county:           string;
  signal_type:      string;
  severity:         string;
  confidence?:      number;
  source_url?:      string;
  detected_at?:     string;
  owner_name?:      string;
  mailing_address?: string;
  beds?:            number;
  baths?:           number;
  sqft?:            number;
  year_built?:      number;
  asset_class?:     string;
  estimated_value?: number;
  estimated_equity?:number;
  doc_number?:      string;
  filed_date?:      string;
  amount?:          number;
  extra?:           Record<string, unknown>;
}

// ── Address hashing ────────────────────────────────────────────────────────

async function sha256(msg: string): Promise<string> {
  const data   = new TextEncoder().encode(msg);
  const buf    = await crypto.subtle.digest("SHA-256", data);
  const arr    = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

function normalizeAddress(
  address: string, city: string, state: string, zip: string,
): string {
  const parts = [address, city, state.toUpperCase(), zip.slice(0, 5)]
    .map((p) => p.trim().toLowerCase())
    .join(" ");
  return parts
    .replace(/\s+/g, " ")
    .replace(/ street/g, " st")
    .replace(/ avenue/g, " ave")
    .replace(/ boulevard/g, " blvd")
    .replace(/ drive/g, " dr")
    .replace(/ court/g, " ct")
    .replace(/ lane/g, " ln")
    .replace(/ road/g, " rd")
    .replace(/ place/g, " pl");
}

// ── Core upsert logic ─────────────────────────────────────────────────────

async function processLeads(
  organizationId: string,
  leads: IncomingLead[],
): Promise<{ upserted: number; signals: number; errors: number }> {
  let upserted = 0;
  let signals  = 0;
  let errors   = 0;

  for (const lead of leads) {
    try {
      if (!lead.address || !lead.city || !lead.state) {
        errors++;
        continue;
      }

      const addrHash = await sha256(
        normalizeAddress(lead.address, lead.city, lead.state, lead.zip_code ?? ""),
      );

      // 1. Upsert leads_properties
      const { data: existing } = await supabase
        .from("leads_properties")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("address_hash", addrHash)
        .maybeSingle();

      let leadPropertyId: string;

      if (existing?.id) {
        leadPropertyId = existing.id as string;
        // Update detected_at to now if it's a fresh signal
        await supabase
          .from("leads_properties")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", leadPropertyId);
      } else {
        const insertPayload: Record<string, unknown> = {
          organization_id: organizationId,
          source:          "auto_detect",
          address:         lead.address,
          city:            lead.city,
          state:           lead.state,
          zip:             (lead.zip_code ?? "").slice(0, 5),
          county:          lead.county,
          address_hash:    addrHash,
          status:          "new",
          detected_at:     lead.detected_at ?? new Date().toISOString(),
          asset_class:     lead.asset_class,
          estimated_value: lead.estimated_value,
          estimated_equity:lead.estimated_equity,
          beds:            lead.beds,
          baths:           lead.baths,
          sqft:            lead.sqft,
          year_built:      lead.year_built,
        };

        const { data: inserted, error: insErr } = await supabase
          .from("leads_properties")
          .insert(insertPayload)
          .select("id")
          .single();

        if (insErr || !inserted) {
          console.error("insert leads_properties error:", insErr?.message);
          errors++;
          continue;
        }
        leadPropertyId = inserted.id as string;
        upserted++;
      }

      // 2. Check for duplicate signal today
      const today = new Date().toISOString().slice(0, 10);
      const { data: existingSig } = await supabase
        .from("leads_signals")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("lead_property_id", leadPropertyId)
        .eq("signal_type", lead.signal_type)
        .gte("detected_at", today)
        .maybeSingle();

      if (!existingSig) {
        const { error: sigErr } = await supabase.from("leads_signals").insert({
          organization_id: organizationId,
          lead_property_id: leadPropertyId,
          signal_type:     lead.signal_type,
          severity:        lead.severity ?? "medium",
          confidence:      lead.confidence ?? 0.85,
          source:          lead.source_url ?? "county_scraper",
          payload: {
            doc_number:  lead.doc_number,
            filed_date:  lead.filed_date,
            amount:      lead.amount,
            owner:       lead.owner_name,
            ...(lead.extra ?? {}),
          },
          detected_at: lead.detected_at ?? new Date().toISOString(),
        });
        if (!sigErr) signals++;
      }

      // 3. Upsert enrichment if we have owner data
      if (lead.owner_name) {
        await supabase.from("leads_enrichment").upsert(
          {
            organization_id:   organizationId,
            lead_property_id:  leadPropertyId,
            owner_name:        lead.owner_name,
            mailing_address:   lead.mailing_address,
            enrichment_source: "county_scraper",
            enriched_at:       new Date().toISOString(),
          },
          { onConflict: "lead_property_id" },
        );
      }
    } catch (e) {
      console.error("processLeads error:", e);
      errors++;
    }
  }

  return { upserted, signals, errors };
}

// ── Upsert scraper health ─────────────────────────────────────────────────

async function updateScraperHealth(
  orgId: string,
  sourceName: string,
  status: string,
  recordsCount: number,
  failureReason?: string,
): Promise<void> {
  const now = new Date().toISOString();
  await supabase.from("leads_scraper_health").upsert(
    {
      organization_id:  orgId,
      source_name:      sourceName,
      status,
      records_last_run: recordsCount,
      failure_reason:   failureReason ?? null,
      last_success_at:  status === "healthy" ? now : null,
      last_failure_at:  status !== "healthy" ? now : null,
    },
    { onConflict: "organization_id,source_name" },
  );
}

// ── Trigger agent-grade for freshly added leads ───────────────────────────

async function triggerGrading(organizationId: string): Promise<void> {
  try {
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/agent-grade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({ organization_id: organizationId }),
    });
  } catch {
    // Non-fatal — grading runs on a schedule anyway
  }
}

// ── Main handler ──────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const scraperToken  = req.headers.get("x-scraper-token");
  const authHeader    = req.headers.get("Authorization");
  const isScraperCall = scraperToken && scraperToken === SCRAPER_SECRET;
  const isUserCall    = !!authHeader?.startsWith("Bearer ");

  if (!isScraperCall && !isUserCall) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // ── Mode 1: Scraper webhook ──────────────────────────────────────
    if (isScraperCall) {
      const { organization_id, leads, county, state, source_name, status, error } = body;

      if (!organization_id) {
        return new Response(JSON.stringify({ error: "organization_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Health update only (scraper reporting failure)
      if (status && !leads) {
        await updateScraperHealth(
          organization_id,
          source_name ?? `${county}_${state}`,
          status === "healthy" ? "healthy" : "degraded",
          0,
          error,
        );
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!leads || !Array.isArray(leads)) {
        return new Response(JSON.stringify({ error: "leads array required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await processLeads(organization_id, leads);
      const sn = source_name ?? `${(county ?? "").toLowerCase().replace(/ /g, "_")}_${(state ?? "").toLowerCase()}`;

      await updateScraperHealth(
        organization_id, sn, "healthy", leads.length,
      );

      // Trigger grading asynchronously
      triggerGrading(organization_id);

      return new Response(
        JSON.stringify({ ok: true, ...result, county, state }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Mode 2: Manual trigger from UI ──────────────────────────────
    if (isUserCall) {
      const { organization_id, county, state, signal_types } = body;
      if (!organization_id) {
        return new Response(JSON.stringify({ error: "organization_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Queue a scan job — GitHub Actions will pick this up on next run
      // or the user can trigger the GitHub Actions workflow_dispatch manually
      const { data: job } = await supabase
        .from("leads_scan_jobs")
        .insert({
          organization_id,
          job_type:      "manual",
          signal_types:  signal_types ?? [],
          area:          { county, state },
          status:        "queued",
        })
        .select("id")
        .single();

      return new Response(
        JSON.stringify({
          ok: true,
          job_id: job?.id,
          message: `Scan queued for ${county ?? "all"}, ${state ?? "all counties"}. Results appear in Leads within minutes.`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (err) {
    console.error("agent-detect error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
