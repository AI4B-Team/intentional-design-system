import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VAPI_API_KEY = Deno.env.get("VAPI_API_KEY");
    if (!VAPI_API_KEY) {
      return new Response(JSON.stringify({ error: "VAPI_API_KEY not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { phone_number, contact_name, property_address, property_id, organization_id, user_id } = await req.json();

    if (!phone_number || !organization_id) {
      return new Response(JSON.stringify({ error: "phone_number and organization_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get agent config for this org
    const { data: config } = await supabase
      .from("voice_agent_config")
      .select("*")
      .eq("organization_id", organization_id)
      .single();

    if (!config || !config.is_active || !config.speed_to_lead_enabled) {
      return new Response(JSON.stringify({ error: "AI agent not active or speed-to-lead disabled" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!config.vapi_assistant_id || !config.vapi_phone_number_id) {
      return new Response(JSON.stringify({ error: "Vapi assistant or phone number not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check working hours
    if (!isWithinWorkingHours(config)) {
      console.log("Outside working hours, queueing for later");
      return new Response(JSON.stringify({ queued: true, message: "Outside working hours, will call during next window" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone_number);

    // Build context for the AI agent
    const assistantOverrides: any = {
      variableValues: {
        contact_name: contact_name || "there",
        property_address: property_address || "your property",
        company_name: "our team",
      },
    };

    // Initiate outbound call via Vapi
    const vapiResponse = await fetch("https://api.vapi.ai/call/phone", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistantId: config.vapi_assistant_id,
        phoneNumberId: config.vapi_phone_number_id,
        customer: {
          number: formattedPhone,
          name: contact_name || undefined,
        },
        assistantOverrides,
      }),
    });

    const vapiData = await vapiResponse.json();

    if (!vapiResponse.ok) {
      console.error("Vapi call failed:", vapiData);
      return new Response(JSON.stringify({ error: "Failed to initiate AI call", details: vapiData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create voice agent call record
    const { data: callRecord, error: insertError } = await supabase
      .from("voice_agent_calls")
      .insert({
        organization_id,
        user_id: user_id || config.user_id,
        vapi_call_id: vapiData.id,
        vapi_assistant_id: config.vapi_assistant_id,
        direction: "speed_to_lead",
        phone_number: formattedPhone,
        contact_name,
        property_id,
        property_address,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to create call record:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        vapi_call_id: vapiData.id,
        call_record_id: callRecord?.id,
        message: `AI agent calling ${contact_name || formattedPhone}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Speed-to-lead error:", error);
    return new Response(JSON.stringify({ error: "Failed to trigger speed-to-lead call" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) return `+1${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith("1")) return `+${cleaned}`;
  return phone.startsWith("+") ? phone : `+${phone}`;
}

function isWithinWorkingHours(config: any): boolean {
  try {
    const now = new Date();
    // Simple check — in production you'd use timezone-aware logic
    const hours = now.getHours();
    const startHour = parseInt(config.working_hours_start?.split(":")[0] || "9");
    const endHour = parseInt(config.working_hours_end?.split(":")[0] || "18");

    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = dayNames[now.getDay()];

    if (!config.working_days?.includes(today)) return false;
    if (hours < startHour || hours >= endHour) return false;

    return true;
  } catch {
    return true; // Default to allowing if parsing fails
  }
}
