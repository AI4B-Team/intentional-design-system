import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * agent-grade: Computes opportunity_score (0-100) per lead_property using a
 * deterministic weighted formula and writes leads_scores rows.
 *
 * Formula:
 *   signal_severity (0-40) +
 *   equity_strength (0-25) +
 *   freshness_decay (0-20) +
 *   enrichment_completeness (0-15)
 *   = 0..100, tier = HOT >80, Warm 60-80, Cold <60
 */

const SEVERITY_WEIGHT: Record<string, number> = {
  low: 0.25,
  medium: 0.5,
  high: 0.75,
  critical: 1.0,
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

async function gradeOrg(supabase: ReturnType<typeof createClient>, organizationId: string) {
  // Pull leads with their signals + enrichment
  const { data: leads } = await supabase
    .from("leads_properties")
    .select(
      "id, organization_id, estimated_value, estimated_equity, detected_at, leads_signals(severity, detected_at), leads_enrichment(owner_name, phones, emails)",
    )
    .eq("organization_id", organizationId)
    .limit(2000);

  if (!leads || leads.length === 0) return { organization_id: organizationId, scored: 0 };

  let scored = 0;
  for (const lead of leads as any[]) {
    // Signal severity component
    const sigs = lead.leads_signals ?? [];
    let sigScore = 0;
    if (sigs.length > 0) {
      const avg = sigs.reduce((a: number, s: any) => a + (SEVERITY_WEIGHT[s.severity] ?? 0.5), 0) / sigs.length;
      sigScore = avg * 40 * Math.min(1, sigs.length / 3); // more signals = stronger
    }

    // Equity strength component
    const value = Number(lead.estimated_value) || 0;
    const equity = Number(lead.estimated_equity) || 0;
    const equityRatio = value > 0 ? equity / value : 0;
    const equityScore = clamp(equityRatio * 25, 0, 25);

    // Freshness decay
    const detected = new Date(lead.detected_at).getTime();
    const ageDays = Math.max(0, (Date.now() - detected) / 86400000);
    const freshness = clamp(20 * Math.exp(-ageDays / 21), 0, 20); // halves about every 14 days

    // Enrichment completeness
    const enr = (lead.leads_enrichment ?? [])[0];
    let enrScore = 0;
    if (enr) {
      const phones = Array.isArray(enr.phones) ? enr.phones.length : 0;
      const emails = Array.isArray(enr.emails) ? enr.emails.length : 0;
      enrScore =
        (enr.owner_name ? 5 : 0) +
        Math.min(5, phones * 2.5) +
        Math.min(5, emails * 2.5);
    }

    const score = Math.round(clamp(sigScore + equityScore + freshness + enrScore));
    const tier = score >= 80 ? "hot" : score >= 60 ? "warm" : "cold";

    const { error } = await supabase.from("leads_scores").insert({
      organization_id: organizationId,
      lead_property_id: lead.id,
      opportunity_score: score,
      tier,
      score_breakdown: {
        signal: Math.round(sigScore),
        equity: Math.round(equityScore),
        freshness: Math.round(freshness),
        enrichment: Math.round(enrScore),
      },
    });
    if (!error) scored++;
  }

  return { organization_id: organizationId, scored };
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
        results.push(await gradeOrg(supabase, orgId));
      } catch (e) {
        results.push({ organization_id: orgId, error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
