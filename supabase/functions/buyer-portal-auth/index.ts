import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    if (action === "login") {
      const email = String(body.email || "").trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ success: false, error: "Invalid email" }, 400);
      }

      const { data: buyer, error: buyerError } = await supabase
        .from("cash_buyers")
        .select("id, email, first_name")
        .eq("email", email)
        .maybeSingle();

      // Always return the same shape to avoid email enumeration
      if (buyerError || !buyer) {
        return json({ success: true });
      }

      const magicToken = crypto.randomUUID();
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const magicLinkExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const { error: sessionError } = await supabase
        .from("buyer_portal_sessions")
        .insert({
          buyer_id: buyer.id,
          session_token: sessionToken,
          expires_at: expiresAt,
          magic_link_token: magicToken,
          magic_link_expires_at: magicLinkExpiresAt,
        });

      if (sessionError) {
        console.error("session insert error", sessionError);
        return json({ success: false, error: "Failed to create session" }, 500);
      }

      // TODO: send magic link email via provider
      return json({ success: true });
    }

    if (action === "verify_token") {
      const token = String(body.token || "");
      if (!token) return json({ success: false, error: "Missing token" }, 400);

      const { data: session, error } = await supabase
        .from("buyer_portal_sessions")
        .select("id, session_token, buyer_id, magic_link_expires_at")
        .eq("magic_link_token", token)
        .gt("magic_link_expires_at", new Date().toISOString())
        .maybeSingle();

      if (error || !session) {
        return json({ success: false, error: "Invalid or expired link" }, 401);
      }

      await supabase
        .from("buyer_portal_sessions")
        .update({
          magic_link_token: null,
          magic_link_expires_at: null,
          last_active_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      return json({ success: true, session_token: session.session_token });
    }

    if (action === "get_session") {
      const sessionToken = String(body.session_token || "");
      if (!sessionToken) return json({ success: false, error: "Missing session_token" }, 400);

      const { data: session, error: sErr } = await supabase
        .from("buyer_portal_sessions")
        .select("id, buyer_id, expires_at")
        .eq("session_token", sessionToken)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (sErr || !session) return json({ success: false, error: "Session expired" }, 401);

      const { data: buyer, error: bErr } = await supabase
        .from("cash_buyers")
        .select("*")
        .eq("id", session.buyer_id)
        .maybeSingle();

      if (bErr || !buyer) return json({ success: false, error: "Buyer not found" }, 404);

      const now = new Date().toISOString();
      await supabase
        .from("buyer_portal_sessions")
        .update({ last_active_at: now })
        .eq("id", session.id);
      await supabase
        .from("cash_buyers")
        .update({ last_active_at: now })
        .eq("id", buyer.id);

      return json({ success: true, buyer });
    }

    if (action === "logout") {
      const sessionToken = String(body.session_token || "");
      if (sessionToken) {
        await supabase
          .from("buyer_portal_sessions")
          .delete()
          .eq("session_token", sessionToken);
      }
      return json({ success: true });
    }

    return json({ success: false, error: "Unknown action" }, 400);
  } catch (e) {
    console.error("buyer-portal-auth error", e);
    return json({ success: false, error: "Internal error" }, 500);
  }
});
