import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * auto-campaign-trigger: When a lead's score is at/above the org's
 * threshold and automation_settings.auto_campaigns is enabled, queue
 * an outreach record and dispatch via lob-send-campaign / Twilio later.
 *
 * Quality gates:
 *  - score >= threshold (default 80)
 *  - valid contact data present (phone or mailing address)
 *  - not in suppression_list (address_hash)
 *  - daily cap not exceeded
 *  - lead has not been contacted in cooldown window
 */

const DEFAULT_THRESHOLD = 80;
const DEFAULT_DAILY_CAP = 100;
const COOLDOWN_DAYS = 14;

async function processOrg(supabase: ReturnType<typeof createClient>, organizationId: string) {
  // Read automation settings
  const { data: settings } = await supabase
    .from("automation_settings")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  const enabled = settings?.auto_campaigns ?? false;
  if (!enabled) return { organization_id: organizationId, queued: 0, reason: "auto_campaigns_off" };

  const threshold = settings?.score_threshold ?? DEFAULT_THRESHOLD;
  const dailyCap = settings?.daily_cap ?? DEFAULT_DAILY_CAP;
  const channel = settings?.default_channel ?? "mail";

  // Today's already-queued/sent count
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count: usedToday } = await supabase
    .from("leads_outreach_log")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("trigger_mode", "auto")
    .gte("created_at", since.toISOString());

  const remaining = Math.max(0, dailyCap - (usedToday ?? 0));
  if (remaining === 0) return { organization_id: organizationId, queued: 0, reason: "daily_cap_hit" };

  // Pull top-scoring leads with enrichment
  const { data: candidates } = await supabase
    .from("leads_properties")
    .select(
      "id, address, address_hash, city, state, zip, leads_scores(opportunity_score, tier, computed_at), leads_enrichment(owner_name, phones, emails, mailing_address), leads_outreach_log(created_at, trigger_mode)",
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(500);

  if (!candidates) return { organization_id: organizationId, queued: 0 };

  const cooldownMs = COOLDOWN_DAYS * 86400000;
  let queued = 0;
  const skips: Record<string, number> = {};

  for (const lead of candidates as any[]) {
    if (queued >= remaining) break;

    const score = (lead.leads_scores ?? [])[0]?.opportunity_score ?? 0;
    if (score < threshold) {
      skips.below_threshold = (skips.below_threshold ?? 0) + 1;
      continue;
    }

    // Suppression check
    if (lead.address_hash) {
      const { data: suppressed } = await supabase
        .from("suppression_list")
        .select("id")
        .eq("address_hash", lead.address_hash)
        .maybeSingle();
      if (suppressed) {
        skips.suppressed = (skips.suppressed ?? 0) + 1;
        continue;
      }
    }

    // Cooldown
    const lastContact = (lead.leads_outreach_log ?? [])
      .map((r: any) => new Date(r.created_at).getTime())
      .sort((a: number, b: number) => b - a)[0];
    if (lastContact && Date.now() - lastContact < cooldownMs) {
      skips.cooldown = (skips.cooldown ?? 0) + 1;
      continue;
    }

    // Contact data
    const enr = (lead.leads_enrichment ?? [])[0];
    const hasPhone = enr?.phones && Array.isArray(enr.phones) && enr.phones.length > 0;
    const hasMail = !!(enr?.mailing_address || lead.address);
    if (channel === "sms" && !hasPhone) {
      skips.no_phone = (skips.no_phone ?? 0) + 1;
      continue;
    }
    if (channel === "mail" && !hasMail) {
      skips.no_address = (skips.no_address ?? 0) + 1;
      continue;
    }

    const { error } = await supabase.from("leads_outreach_log").insert({
      organization_id: organizationId,
      lead_property_id: lead.id,
      campaign_type: channel,
      trigger_mode: "auto",
      status: "queued",
      payload: { score, owner_name: enr?.owner_name ?? null },
    });
    if (!error) queued++;
  }

  return { organization_id: organizationId, queued, threshold, daily_remaining: remaining, skips };
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
        results.push(await processOrg(supabase, orgId));
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
