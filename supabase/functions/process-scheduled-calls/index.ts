import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

// Constant-time compare to avoid timing attacks
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const INTERNAL_SECRET = Deno.env.get("SPEED_TO_LEAD_SECRET");
  if (!INTERNAL_SECRET) {
    console.error("process-scheduled-calls: SPEED_TO_LEAD_SECRET env var is not set");
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const provided = req.headers.get("x-internal-secret") ?? "";
  if (!safeEqual(provided, INTERNAL_SECRET)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  // Claim a small batch of due rows. Cap attempts at 5.
  const { data: due, error } = await sb
    .from("scheduled_ai_calls")
    .select("*")
    .eq("status", "pending")
    .lte("call_after", new Date().toISOString())
    .lt("attempts", 5)
    .order("call_after", { ascending: true })
    .limit(25);

  if (error) {
    console.error("process-scheduled-calls: query failed", error);
    return new Response(JSON.stringify({ error: "query_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  let failed = 0;

  for (const row of due ?? []) {
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/speed-to-lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_SECRET,
        },
        body: JSON.stringify({
          phone_number: row.phone_number,
          contact_name: row.contact_name,
          property_address: row.property_address,
          property_id: row.property_id,
          organization_id: row.organization_id,
          user_id: row.user_id,
        }),
      });

      if (resp.ok) {
        await sb
          .from("scheduled_ai_calls")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            attempts: (row.attempts ?? 0) + 1,
          })
          .eq("id", row.id);
        sent++;
      } else {
        const text = await resp.text().catch(() => "");
        const nextAttempts = (row.attempts ?? 0) + 1;
        await sb
          .from("scheduled_ai_calls")
          .update({
            status: nextAttempts >= 5 ? "failed" : "pending",
            attempts: nextAttempts,
            last_error: `HTTP ${resp.status}: ${text.slice(0, 500)}`,
          })
          .eq("id", row.id);
        failed++;
      }
    } catch (e) {
      const nextAttempts = (row.attempts ?? 0) + 1;
      await sb
        .from("scheduled_ai_calls")
        .update({
          status: nextAttempts >= 5 ? "failed" : "pending",
          attempts: nextAttempts,
          last_error: String(e).slice(0, 500),
        })
        .eq("id", row.id);
      failed++;
    }
  }

  return new Response(JSON.stringify({ processed: due?.length ?? 0, sent, failed }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
