// Welcome wizard finish — persists everything from the wizard to the backend.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Vendor = { name: string; company: string; email: string; phone: string };
type LeadImportType =
  | "cash_buyer" | "seller_lead" | "wholesaler" | "jv_partner"
  | "lender" | "contractor" | "agent" | "tenant" | "other";

interface LeadImport {
  type: LeadImportType;
  fileName: string;
  rows: Array<Record<string, string>>;
}

interface Payload {
  titleCompany: Vendor;
  lender: Vendor;
  agent: Vendor;
  selectedTemplates: string[];
  uploadedDocPaths: string[]; // storage paths already uploaded client-side
  entity: { llcName: string; ein: string; signerName: string; signerTitle: string };
  signaturePath: string | null; // storage path in `signatures` bucket
  markets: string[];
  marketTargets: Record<string, { type: string; values: string }>;
  buyBox: { minPrice: string; maxPrice: string; propertyType: string };
  comms: { wantsNumber: boolean; areaCode: string; businessHoursStart: string; businessHoursEnd: string };
  leadImports: LeadImport[];
  automation: {
    approvalMode: "manual" | "assisted" | "autopilot";
    autoSendLOIs: boolean;
    autoSendContracts: boolean;
    autoNotifyTeam: boolean;
    autoBlastBuyers: boolean;
    aiFollowUpFrequency: "off" | "low" | "normal" | "aggressive";
    dailySendLimit: string;
    respectBusinessHours: boolean;
  };
}

function pick(row: Record<string, string>, keys: string[]): string | null {
  for (const k of keys) {
    for (const rk of Object.keys(row)) {
      if (rk.toLowerCase().replace(/[_\s-]/g, "") === k.toLowerCase().replace(/[_\s-]/g, "")) {
        const v = row[rk]?.trim();
        if (v) return v;
      }
    }
  }
  return null;
}

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    // JWT verification
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // Service client for writes
    const sb = createClient(supabaseUrl, serviceKey);

    // Get user's organization
    const { data: orgMember } = await sb
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    const orgId = orgMember?.organization_id ?? null;

    const p: Payload = await req.json();
    const results: Record<string, unknown> = {};

    // --- 1. Business profile + signature → organizations row ---
    if (orgId) {
      let signatureUrl: string | null = null;
      if (p.signaturePath) {
        const { data: signed } = await sb.storage
          .from("signatures")
          .createSignedUrl(p.signaturePath, 60 * 60 * 24 * 365 * 5);
        signatureUrl = signed?.signedUrl ?? p.signaturePath;
      }
      const { error: orgErr } = await sb
        .from("organizations")
        .update({
          llc_name: p.entity.llcName || null,
          ein: p.entity.ein || null,
          signer_name: p.entity.signerName || null,
          signer_title: p.entity.signerTitle || null,
          signature_url: signatureUrl,
          business_hours_start: p.comms.businessHoursStart || null,
          business_hours_end: p.comms.businessHoursEnd || null,
          welcome_completed_at: new Date().toISOString(),
          automation_mode: p.automation.approvalMode,
        })
        .eq("id", orgId);
      results.organization = orgErr ? { error: orgErr.message } : "ok";
    }

    // --- 2. Vendors → deal_sources (title/lender/agent) ---
    const vendorWrites: Array<{ kind: string; vendor: Vendor; type: string }> = [
      { kind: "title", vendor: p.titleCompany, type: "title" },
      { kind: "lender", vendor: p.lender, type: "lender" },
      { kind: "agent", vendor: p.agent, type: "agent" },
    ];
    let vendorsInserted = 0;
    for (const v of vendorWrites) {
      if (!v.vendor?.name?.trim()) continue;
      const { data: existing } = await sb
        .from("deal_sources")
        .select("id")
        .eq("user_id", userId)
        .eq("type", v.type)
        .ilike("name", v.vendor.name.trim())
        .maybeSingle();
      const row = {
        user_id: userId,
        organization_id: orgId,
        name: v.vendor.name.trim(),
        email: v.vendor.email || null,
        phone: v.vendor.phone || null,
        company: v.vendor.company || null,
        type: v.type,
        source: "welcome_wizard",
        source_origin: "welcome_wizard",
        status: "active",
        tags: ["default", v.type],
      };
      if (existing?.id) {
        await sb.from("deal_sources").update(row).eq("id", existing.id);
      } else {
        await sb.from("deal_sources").insert(row);
      }
      vendorsInserted++;
    }
    results.vendors = vendorsInserted;

    // --- 3. Buy Box ---
    if (p.markets.length > 0) {
      const minP = parseFloat(p.buyBox.minPrice) || null;
      const maxP = parseFloat(p.buyBox.maxPrice) || null;
      const criteria = {
        states: p.markets,
        targets: p.marketTargets,
        property_types: [p.buyBox.propertyType],
        min_price: minP,
        max_price: maxP,
      };
      const { error: bbErr } = await sb.from("buy_boxes").insert({
        user_id: userId,
        organization_id: orgId,
        name: `Default — ${p.markets.join(", ")}`,
        is_active: true,
        criteria,
        offer_percentage: 70,
        max_daily_offers: parseInt(p.automation.dailySendLimit) || 25,
      });
      results.buy_box = bbErr ? { error: bbErr.message } : "ok";
    }

    // --- 4. Automation settings ---
    if (orgId) {
      const { data: existingAuto } = await sb
        .from("automation_settings")
        .select("id")
        .eq("organization_id", orgId)
        .maybeSingle();
      const autoRow = {
        organization_id: orgId,
        auto_detect_enabled: true,
        auto_enrich_hot: true,
        auto_campaigns_enabled: p.automation.autoBlastBuyers || p.automation.approvalMode === "autopilot",
        auto_campaign_score_threshold: 70,
        daily_campaign_cap: parseInt(p.automation.dailySendLimit) || 25,
        default_campaign_type: "email",
        cooldown_days: 7,
      };
      if (existingAuto?.id) {
        await sb.from("automation_settings").update(autoRow).eq("id", existingAuto.id);
      } else {
        await sb.from("automation_settings").insert(autoRow);
      }
      results.automation = "ok";
    }

    // --- 5. Lead imports → routed by type ---
    const importCounts: Record<string, number> = {};
    for (const imp of p.leadImports ?? []) {
      const rows = imp.rows ?? [];
      if (rows.length === 0) continue;

      if (imp.type === "cash_buyer") {
        const buyerRows = rows.map((r) => {
          const fullName = pick(r, ["fullname", "name"]) ?? "";
          const split = splitName(fullName);
          const email = pick(r, ["email"]);
          if (!email) return null;
          return {
            user_id: userId,
            organization_id: orgId,
            email,
            full_name: fullName || null,
            first_name: split.first || pick(r, ["firstname"]) || null,
            last_name: split.last || pick(r, ["lastname"]) || null,
            phone: pick(r, ["phone", "phonenumber"]),
            company_name: pick(r, ["company", "companyname"]),
          };
        }).filter(Boolean);
        if (buyerRows.length) {
          const { error } = await sb.from("cash_buyers").upsert(buyerRows as any, { onConflict: "user_id,email" as any, ignoreDuplicates: true });
          importCounts.cash_buyer = (importCounts.cash_buyer ?? 0) + (error ? 0 : buyerRows.length);
        }
      } else if (imp.type === "seller_lead") {
        const leadRows = rows.map((r) => {
          const name = pick(r, ["ownername", "name", "sellername", "fullname"]);
          if (!name) return null;
          return {
            user_id: userId,
            organization_id: orgId,
            owner_name: name,
            owner_email: pick(r, ["email"]),
            owner_phone: pick(r, ["phone", "phonenumber"]),
            property_address: pick(r, ["address", "propertyaddress"]),
            city: pick(r, ["city"]),
            state: pick(r, ["state"]),
            zip: pick(r, ["zip", "zipcode", "postal"]),
            source: "welcome_wizard_import",
          };
        }).filter(Boolean);
        if (leadRows.length) {
          const { error } = await sb.from("seller_leads").insert(leadRows as any);
          importCounts.seller_lead = (importCounts.seller_lead ?? 0) + (error ? 0 : leadRows.length);
        }
      } else {
        // All other types → deal_sources
        const typeMap: Record<string, string> = {
          wholesaler: "wholesaler", jv_partner: "jv", lender: "lender",
          contractor: "contractor", agent: "agent", tenant: "tenant", other: "other",
        };
        const dsType = typeMap[imp.type] ?? "other";
        const contactRows = rows.map((r) => {
          const name = pick(r, ["name", "fullname", "contactname"]);
          if (!name) return null;
          return {
            user_id: userId,
            organization_id: orgId,
            name,
            email: pick(r, ["email"]),
            phone: pick(r, ["phone", "phonenumber"]),
            company: pick(r, ["company", "companyname"]),
            type: dsType,
            source: "welcome_wizard_import",
            source_origin: "welcome_wizard_import",
            status: "active",
          };
        }).filter(Boolean);
        if (contactRows.length) {
          const { error } = await sb.from("deal_sources").insert(contactRows as any);
          importCounts[imp.type] = (importCounts[imp.type] ?? 0) + (error ? 0 : contactRows.length);
        }
      }
    }
    results.imports = importCounts;

    // --- 6. Twilio number provisioning (fire & forget; client also gets the result) ---
    let twilio: unknown = "skipped";
    if (p.comms.wantsNumber && p.comms.areaCode && orgId) {
      try {
        const provRes = await fetch(
          `${supabaseUrl}/functions/v1/provision-twilio-number`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify({ areaCode: p.comms.areaCode }),
          },
        );
        twilio = await provRes.json();
      } catch (e) {
        twilio = { error: String(e) };
      }
    }
    results.twilio = twilio;

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
