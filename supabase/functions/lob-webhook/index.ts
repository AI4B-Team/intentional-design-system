import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateLobSignature } from "../_shared/webhook-signatures.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, lob-signature, lob-signature-timestamp",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOB_WEBHOOK_SECRET = Deno.env.get("LOB_WEBHOOK_SECRET");
  if (!LOB_WEBHOOK_SECRET) {
    console.error(
      "lob-webhook: LOB_WEBHOOK_SECRET env var is not set. Copy the signing secret from the Lob dashboard webhook settings (Settings → Webhooks → your endpoint → Signing Secret) and set LOB_WEBHOOK_SECRET in edge function secrets.",
    );
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Read raw body once for signature verification, then JSON.parse the same string.
    const rawBody = await req.text();
    const signature = req.headers.get("lob-signature");
    const timestamp = req.headers.get("lob-signature-timestamp");

    const ok = await validateLobSignature({
      secret: LOB_WEBHOOK_SECRET,
      timestamp,
      rawBody,
      signature,
    });
    if (!ok) {
      console.warn("lob-webhook: invalid signature or stale timestamp");
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const event = JSON.parse(rawBody);
    console.log("Lob webhook received:", event.event_type?.id || event.event_type);

    const eventType = event.event_type?.id || event.event_type;
    const body = event.body;

    if (!body?.id) {
      return new Response(JSON.stringify({ error: "Invalid webhook payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const statusMap: Record<string, string> = {
      "postcard.created": "queued",
      "postcard.rendered": "queued",
      "postcard.mailed": "mailed",
      "postcard.in_transit": "in_transit",
      "postcard.in_local_area": "in_transit",
      "postcard.delivered": "delivered",
      "postcard.returned": "returned",
      "postcard.re-routed": "in_transit",
      "letter.created": "queued",
      "letter.rendered": "queued",
      "letter.mailed": "mailed",
      "letter.in_transit": "in_transit",
      "letter.in_local_area": "in_transit",
      "letter.delivered": "delivered",
      "letter.returned": "returned",
      "letter.re-routed": "in_transit",
    };

    const newStatus = statusMap[eventType];
    if (!newStatus) {
      console.log("Unknown event type:", eventType);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updateData: Record<string, any> = { status: newStatus };

    if (eventType.includes("mailed")) {
      updateData.sent_at = new Date().toISOString();
    } else if (eventType.includes("delivered")) {
      updateData.delivered_at = new Date().toISOString();
    } else if (eventType.includes("returned")) {
      updateData.returned_at = new Date().toISOString();
      updateData.return_reason = body.failure_reason || "Unknown";

      const { data: mailPiece } = await supabaseAdmin
        .from("mail_pieces")
        .select("*, mail_campaigns!inner(user_id)")
        .eq("lob_id", body.id)
        .single();

      if (mailPiece) {
        await supabaseAdmin.from("mail_suppression_list").upsert({
          user_id: mailPiece.mail_campaigns.user_id,
          address: `${mailPiece.recipient_address}, ${mailPiece.recipient_city}, ${mailPiece.recipient_state} ${mailPiece.recipient_zip}`,
          reason: "returned",
          source: "campaign_return",
          added_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,address",
          ignoreDuplicates: true,
        });
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from("mail_pieces")
      .update(updateData)
      .eq("lob_id", body.id);

    if (updateError) {
      console.error("Error updating mail piece:", updateError);
    }

    if (eventType.includes("delivered") || eventType.includes("returned")) {
      const { data: piece } = await supabaseAdmin
        .from("mail_pieces")
        .select("campaign_id")
        .eq("lob_id", body.id)
        .single();

      if (piece) {
        const { data: stats } = await supabaseAdmin
          .from("mail_pieces")
          .select("status")
          .eq("campaign_id", piece.campaign_id);

        if (stats) {
          const delivered = stats.filter((s) => s.status === "delivered").length;
          const returned = stats.filter((s) => s.status === "returned").length;

          await supabaseAdmin
            .from("mail_campaigns")
            .update({
              total_delivered: delivered,
              total_returned: returned,
            })
            .eq("id", piece.campaign_id);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
