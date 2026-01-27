import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface ClosebotWebhookPayload {
  conversation_id: string;
  bot_id: string;
  bot_name: string;
  status: "completed" | "failed" | "no_response";
  outcome: "qualified" | "not_qualified" | "appointment_set" | "no_response";
  property_id?: string;
  collected_data: {
    motivation_level?: string | number;
    property_address?: string;
    seller_timeline?: string;
    mortgage_info?: {
      balance?: number;
      payment?: number;
    };
    appointment_time?: string;
    [key: string]: unknown;
  };
  transcript?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get webhook secret from header
    const webhookSecret = req.headers.get("x-webhook-secret");
    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: "Missing webhook secret" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find connection by webhook secret
    const { data: connection, error: connError } = await supabase
      .from("closebot_connections")
      .select("*")
      .eq("webhook_secret", webhookSecret)
      .eq("is_active", true)
      .single();

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: "Invalid webhook secret" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: ClosebotWebhookPayload = await req.json();

    // Parse appointment time if provided
    let appointmentTime: string | null = null;
    if (payload.collected_data.appointment_time) {
      try {
        appointmentTime = new Date(payload.collected_data.appointment_time).toISOString();
      } catch {
        // Invalid date, ignore
      }
    }

    // Create conversation record
    const { data: conversation, error: convError } = await supabase
      .from("closebot_conversations")
      .insert({
        user_id: connection.user_id,
        property_id: payload.property_id || null,
        bot_id: payload.bot_id,
        bot_name: payload.bot_name,
        completed_at: new Date().toISOString(),
        status: payload.status,
        outcome: payload.outcome,
        collected_data: payload.collected_data,
        transcript: payload.transcript,
        appointment_set: payload.outcome === "appointment_set",
        appointment_time: appointmentTime,
      })
      .select()
      .single();

    if (convError) {
      throw new Error(`Failed to create conversation: ${convError.message}`);
    }

    // If property_id provided, update property with collected data
    if (payload.property_id && payload.collected_data) {
      const fieldMappings = connection.field_mappings || {};
      const updates: Record<string, unknown> = {};

      // Map motivation level
      if (payload.collected_data.motivation_level !== undefined) {
        const motivationLevel = payload.collected_data.motivation_level;
        // Convert string to number if needed (1-10 scale)
        let score: number;
        if (typeof motivationLevel === "string") {
          const levelMap: Record<string, number> = {
            low: 30,
            medium: 60,
            high: 85,
            very_high: 95,
          };
          score = levelMap[motivationLevel.toLowerCase()] || 50;
        } else {
          score = Math.min(100, Math.max(0, motivationLevel * 10));
        }
        updates.motivation_score = score;
      }

      // Map mortgage info
      if (payload.collected_data.mortgage_info) {
        if (payload.collected_data.mortgage_info.balance) {
          updates.mortgage_balance = payload.collected_data.mortgage_info.balance;
        }
        if (payload.collected_data.mortgage_info.payment) {
          updates.mortgage_payment = payload.collected_data.mortgage_info.payment;
        }
      }

      // Append seller timeline to notes
      if (payload.collected_data.seller_timeline) {
        const { data: property } = await supabase
          .from("properties")
          .select("notes")
          .eq("id", payload.property_id)
          .single();

        const existingNotes = property?.notes || "";
        updates.notes = `${existingNotes}\n\n[Closebot] Seller Timeline: ${payload.collected_data.seller_timeline}`.trim();
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from("properties")
          .update(updates)
          .eq("id", payload.property_id)
          .eq("user_id", connection.user_id);
      }

      // Create appointment if set
      if (appointmentTime && payload.property_id) {
        await supabase.from("appointments").insert({
          property_id: payload.property_id,
          scheduled_time: appointmentTime,
          appointment_type: "Seller Call (Closebot)",
          notes: `Set via Closebot conversation. Outcome: ${payload.outcome}`,
          status: "scheduled",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversation_id: conversation.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Closebot webhook error:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
