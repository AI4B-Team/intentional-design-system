import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { campaign_id } = await req.json();
    if (!campaign_id) {
      return new Response(JSON.stringify({ error: "campaign_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get campaign with template
    const { data: campaign, error: campError } = await supabaseClient
      .from("mail_campaigns")
      .select("*, mail_templates(*)")
      .eq("id", campaign_id)
      .single();

    if (campError || !campaign) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Lob connection for return address + API key
    const { data: lobConn } = await supabaseClient
      .from("lob_connections")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!lobConn?.api_key_encrypted) {
      return new Response(JSON.stringify({ error: "Lob API key not configured. Connect Lob in Settings → Direct Mail." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lobBaseUrl = "https://api.lob.com/v1";
    const authHeader = `Basic ${btoa(`${lobConn.api_key_encrypted}:`)}`;

    const fromAddress = {
      name: lobConn.return_name || "Property Investor",
      address_line1: lobConn.return_address_line1 || "",
      address_line2: lobConn.return_address_line2 || undefined,
      address_city: lobConn.return_city || "",
      address_state: lobConn.return_state || "",
      address_zip: lobConn.return_zip || "",
    };

    // Get all pending mail pieces for this campaign
    const { data: pieces, error: piecesError } = await supabaseClient
      .from("mail_pieces")
      .select("*")
      .eq("campaign_id", campaign_id)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(500);

    if (piecesError) throw piecesError;

    if (!pieces || pieces.length === 0) {
      return new Response(JSON.stringify({ error: "No pending mail pieces found for this campaign" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const template = campaign.mail_templates;
    const isPostcard = template?.type === "postcard" || !template?.type;
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const piece of pieces) {
      try {
        const toAddress = {
          name: piece.recipient_name || "Current Resident",
          address_line1: piece.recipient_address || "",
          address_city: piece.recipient_city || "",
          address_state: piece.recipient_state || "",
          address_zip: piece.recipient_zip || "",
        };

        // Merge variables for template personalization
        const mergeVars: Record<string, string> = {
          recipient_name: piece.recipient_name || "Homeowner",
          property_address: piece.recipient_address || "",
          city: piece.recipient_city || "",
          state: piece.recipient_state || "",
        };

        let lobResult: any;

        if (isPostcard) {
          const resp = await fetch(`${lobBaseUrl}/postcards`, {
            method: "POST",
            headers: { Authorization: authHeader, "Content-Type": "application/json" },
            body: JSON.stringify({
              to: toAddress,
              from: fromAddress,
              front: template?.front_html || "<html><body><h1>We Buy Houses</h1></body></html>",
              back: template?.back_html || "<html><body><p>Call us today!</p></body></html>",
              size: lobConn.default_postcard_size || "6x9",
              mail_type: lobConn.default_mail_class || "usps_first_class",
              merge_variables: mergeVars,
            }),
          });
          lobResult = await resp.json();
          if (!resp.ok) throw new Error(lobResult.error?.message || "Lob postcard send failed");
        } else {
          const resp = await fetch(`${lobBaseUrl}/letters`, {
            method: "POST",
            headers: { Authorization: authHeader, "Content-Type": "application/json" },
            body: JSON.stringify({
              to: toAddress,
              from: fromAddress,
              file: template?.front_html || "<html><body><p>Letter content</p></body></html>",
              color: true,
              mail_type: lobConn.default_mail_class || "usps_first_class",
              merge_variables: mergeVars,
            }),
          });
          lobResult = await resp.json();
          if (!resp.ok) throw new Error(lobResult.error?.message || "Lob letter send failed");
        }

        // Update mail piece with Lob response
        await supabaseClient
          .from("mail_pieces")
          .update({
            lob_id: lobResult.id,
            status: "sent",
            sent_at: new Date().toISOString(),
            cost: isPostcard ? 0.75 : 1.25, // approximate Lob pricing
          })
          .eq("id", piece.id);

        sent++;

        // Small delay to avoid rate limits
        if (sent % 10 === 0) {
          await new Promise((r) => setTimeout(r, 200));
        }
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`${piece.recipient_address}: ${msg}`);

        await supabaseClient
          .from("mail_pieces")
          .update({ status: "failed" })
          .eq("id", piece.id);
      }
    }

    // Update campaign totals
    await supabaseClient
      .from("mail_campaigns")
      .update({
        status: failed === pieces.length ? "failed" : "sent",
        total_sent: sent,
        total_cost: sent * (isPostcard ? 0.75 : 1.25),
      })
      .eq("id", campaign_id);

    return new Response(
      JSON.stringify({ success: true, sent, failed, total: pieces.length, errors: errors.slice(0, 10) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("lob-send-campaign error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
