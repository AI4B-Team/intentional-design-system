// Provision a Twilio phone number by area code and store on the user's organization.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requestedOrgId, resolveActiveMembership } from "../_shared/org.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/twilio";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const twilioKey = Deno.env.get("TWILIO_API_KEY");
    if (!lovableKey || !twilioKey) {
      return new Response(JSON.stringify({ error: "Twilio connector not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

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

    const body = await req.json().catch(() => ({}));
    const { areaCode } = body ?? {};
    const clean = String(areaCode ?? "").replace(/\D/g, "").slice(0, 3);
    if (clean.length !== 3) {
      return new Response(JSON.stringify({ error: "Invalid area code" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(supabaseUrl, serviceKey);
    const orgMember = await resolveActiveMembership(sb, userId, requestedOrgId(body), "organization_id");
    const orgId = orgMember?.organization_id as string | undefined;
    if (!orgId) {
      return new Response(JSON.stringify({ error: "No organization" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Search for available local numbers in this area code
    const searchUrl = `${GATEWAY}/AvailablePhoneNumbers/US/Local.json?AreaCode=${clean}&SmsEnabled=true&VoiceEnabled=true&PageSize=1`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": twilioKey,
      },
    });
    const searchData = await searchRes.json();
    if (!searchRes.ok) {
      return new Response(JSON.stringify({ error: "Twilio search failed", details: searchData }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const available = searchData?.available_phone_numbers?.[0]?.phone_number;
    if (!available) {
      return new Response(JSON.stringify({ error: `No numbers available in area code ${clean}` }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Purchase the number
    const buyRes = await fetch(`${GATEWAY}/IncomingPhoneNumbers.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": twilioKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        PhoneNumber: available,
        FriendlyName: `RealElite Business Line (${clean})`,
      }),
    });
    const buyData = await buyRes.json();
    if (!buyRes.ok) {
      return new Response(JSON.stringify({ error: "Twilio purchase failed", details: buyData }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Store on organization
    await sb.from("organizations").update({
      twilio_phone_number: buyData.phone_number,
      twilio_phone_sid: buyData.sid,
    }).eq("id", orgId);

    return new Response(JSON.stringify({
      ok: true,
      phone_number: buyData.phone_number,
      sid: buyData.sid,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
