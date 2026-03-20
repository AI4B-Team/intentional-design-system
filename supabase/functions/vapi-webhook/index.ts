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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload = await req.json();
    const { message } = payload;

    console.log("Vapi webhook event:", message?.type, JSON.stringify(payload).slice(0, 500));

    switch (message?.type) {
      case "status-update": {
        await handleStatusUpdate(supabase, payload);
        break;
      }
      case "end-of-call-report": {
        await handleEndOfCallReport(supabase, payload);
        break;
      }
      case "tool-calls": {
        // Tool calls are handled by returning tool results
        const results = await handleToolCalls(supabase, payload);
        return new Response(JSON.stringify({ results }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "transcript": {
        // Real-time transcript updates — could push via realtime if needed
        console.log("Transcript update:", message.transcript);
        break;
      }
      case "hang": {
        console.log("Call hang event");
        break;
      }
      default:
        console.log("Unhandled Vapi event type:", message?.type);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleStatusUpdate(supabase: any, payload: any) {
  const { message, call } = payload;
  const status = message?.status;
  const vapiCallId = call?.id;

  if (!vapiCallId) return;

  console.log(`Call ${vapiCallId} status: ${status}`);

  if (status === "in-progress") {
    // Call connected — update record
    await supabase
      .from("voice_agent_calls")
      .update({ started_at: new Date().toISOString() })
      .eq("vapi_call_id", vapiCallId);
  }
}

async function handleEndOfCallReport(supabase: any, payload: any) {
  const { message, call } = payload;
  const vapiCallId = call?.id;

  if (!vapiCallId) return;

  const transcript = message?.transcript || "";
  const summary = message?.summary || "";
  const duration = message?.endedReason
    ? Math.round((new Date(call?.endedAt).getTime() - new Date(call?.startedAt).getTime()) / 1000)
    : null;

  // Extract analysis from the conversation
  const sentiment = extractSentiment(summary);
  const motivation = extractMotivation(summary);

  // Update the voice agent call record
  const { error } = await supabase
    .from("voice_agent_calls")
    .update({
      transcript,
      summary,
      sentiment,
      motivation_level: motivation,
      ended_at: call?.endedAt || new Date().toISOString(),
      duration_seconds: duration,
      outcome: mapEndedReasonToOutcome(message?.endedReason),
    })
    .eq("vapi_call_id", vapiCallId);

  if (error) {
    console.error("Failed to update call record:", error);
  }

  console.log(`End of call report processed for ${vapiCallId}: ${summary?.slice(0, 200)}`);
}

async function handleToolCalls(supabase: any, payload: any) {
  const { message, call } = payload;
  const toolCalls = message?.toolCalls || [];
  const results: any[] = [];

  for (const toolCall of toolCalls) {
    const { name, arguments: args } = toolCall.function || {};
    console.log(`Tool call: ${name}`, JSON.stringify(args));

    try {
      let result: any;

      switch (name) {
        case "update_crm":
          result = await toolUpdateCRM(supabase, call, args);
          break;
        case "create_task":
          result = await toolCreateTask(supabase, call, args);
          break;
        case "schedule_appointment":
          result = await toolScheduleAppointment(supabase, call, args);
          break;
        case "transfer_call":
          result = await toolTransferCall(supabase, call, args);
          break;
        case "lookup_property":
          result = await toolLookupProperty(supabase, args);
          break;
        case "check_availability":
          result = await toolCheckAvailability(supabase, call, args);
          break;
        default:
          result = { error: `Unknown tool: ${name}` };
      }

      results.push({
        toolCallId: toolCall.id,
        result: JSON.stringify(result),
      });
    } catch (err) {
      console.error(`Tool ${name} error:`, err);
      results.push({
        toolCallId: toolCall.id,
        result: JSON.stringify({ error: `Tool ${name} failed` }),
      });
    }
  }

  return results;
}

// ─── Tool Implementations ───────────────────────────────────────────

async function toolUpdateCRM(supabase: any, call: any, args: any) {
  const { property_address, status, notes, lead_score, motivation } = args;

  // Find the voice agent call to get context
  const { data: agentCall } = await supabase
    .from("voice_agent_calls")
    .select("property_id, organization_id, user_id")
    .eq("vapi_call_id", call?.id)
    .single();

  if (!agentCall) return { success: false, error: "Call record not found" };

  // Update property if we have one
  if (agentCall.property_id) {
    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    await supabase
      .from("properties")
      .update(updateData)
      .eq("id", agentCall.property_id);
  }

  // Update the voice agent call with AI assessment
  await supabase
    .from("voice_agent_calls")
    .update({
      lead_score: lead_score || null,
      motivation_level: motivation || null,
      actions_taken: supabase.rpc ? undefined : undefined, // append later
    })
    .eq("vapi_call_id", call?.id);

  return { success: true, message: "CRM updated successfully" };
}

async function toolCreateTask(supabase: any, call: any, args: any) {
  const { title, description, priority, due_in_days } = args;

  const { data: agentCall } = await supabase
    .from("voice_agent_calls")
    .select("organization_id, user_id, property_id, property_address")
    .eq("vapi_call_id", call?.id)
    .single();

  if (!agentCall) return { success: false, error: "Call record not found" };

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + (due_in_days || 1));

  const { data: task, error } = await supabase
    .from("unified_actions")
    .insert({
      user_id: agentCall.user_id,
      organization_id: agentCall.organization_id,
      type: "task",
      entity_type: "deal",
      entity_id: agentCall.property_id,
      title: title || "AI Agent Follow-up",
      description,
      status: "pending",
      priority: priority || "medium",
      due_at: dueAt.toISOString(),
      source: "ai_agent",
      source_ref: `vapi_call:${call?.id}`,
      property_id: agentCall.property_id,
      property_address: agentCall.property_address,
      owner_mode: "human",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Failed to create task" };
  }

  return { success: true, task_id: task?.id, message: `Task "${title}" created` };
}

async function toolScheduleAppointment(supabase: any, call: any, args: any) {
  const { date, time, appointment_type, notes } = args;

  const { data: agentCall } = await supabase
    .from("voice_agent_calls")
    .select("organization_id, user_id, property_id")
    .eq("vapi_call_id", call?.id)
    .single();

  if (!agentCall) return { success: false, error: "Call record not found" };

  const scheduledTime = new Date(`${date}T${time}`);

  const { data: appt, error } = await supabase
    .from("appointments")
    .insert({
      organization_id: agentCall.organization_id,
      created_by: agentCall.user_id,
      assigned_to: agentCall.user_id,
      property_id: agentCall.property_id,
      scheduled_time: scheduledTime.toISOString(),
      appointment_type: appointment_type || "property_visit",
      notes: notes || "Scheduled by AI Agent",
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to schedule appointment:", error);
    return { success: false, error: "Failed to schedule appointment" };
  }

  // Mark the call as having scheduled an appointment
  await supabase
    .from("voice_agent_calls")
    .update({
      appointment_scheduled: true,
      appointment_time: scheduledTime.toISOString(),
    })
    .eq("vapi_call_id", call?.id);

  return { success: true, appointment_id: appt?.id, message: `Appointment scheduled for ${date} at ${time}` };
}

async function toolTransferCall(supabase: any, call: any, args: any) {
  const { reason } = args;

  const { data: agentCall } = await supabase
    .from("voice_agent_calls")
    .select("organization_id")
    .eq("vapi_call_id", call?.id)
    .single();

  if (!agentCall) return { success: false, error: "Call record not found" };

  // Get the transfer number from config
  const { data: config } = await supabase
    .from("voice_agent_config")
    .select("transfer_phone_number")
    .eq("organization_id", agentCall.organization_id)
    .single();

  if (!config?.transfer_phone_number) {
    return { success: false, error: "No transfer number configured" };
  }

  // Mark the call as transferred
  await supabase
    .from("voice_agent_calls")
    .update({
      outcome: "transferred",
      transferred_to: config.transfer_phone_number,
      transferred_at: new Date().toISOString(),
    })
    .eq("vapi_call_id", call?.id);

  return {
    success: true,
    destination: config.transfer_phone_number,
    message: `Transferring to ${config.transfer_phone_number}. Reason: ${reason}`,
  };
}

async function toolLookupProperty(supabase: any, args: any) {
  const { address, phone_number } = args;

  let query = supabase.from("properties").select("id, address, city, state, zip, arv, asking_price, status, owner_name, owner_phone, bedrooms, bathrooms, sqft, year_built, repair_estimate, equity_amount");

  if (address) {
    query = query.ilike("address", `%${address}%`);
  } else if (phone_number) {
    const cleaned = phone_number.replace(/\D/g, "").slice(-10);
    query = query.ilike("owner_phone", `%${cleaned}%`);
  }

  const { data, error } = await query.limit(3);

  if (error || !data?.length) {
    return { found: false, message: "No matching property found" };
  }

  return {
    found: true,
    properties: data.map((p: any) => ({
      address: `${p.address}, ${p.city}, ${p.state} ${p.zip}`,
      arv: p.arv,
      asking_price: p.asking_price,
      status: p.status,
      owner_name: p.owner_name,
      beds: p.bedrooms,
      baths: p.bathrooms,
      sqft: p.sqft,
      year_built: p.year_built,
      repair_estimate: p.repair_estimate,
      equity: p.equity_amount,
    })),
  };
}

async function toolCheckAvailability(supabase: any, call: any, args: any) {
  const { date } = args;

  const { data: agentCall } = await supabase
    .from("voice_agent_calls")
    .select("organization_id, user_id")
    .eq("vapi_call_id", call?.id)
    .single();

  if (!agentCall) return { available: false, error: "Call record not found" };

  // Check existing appointments for that date
  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;

  const { data: appointments } = await supabase
    .from("appointments")
    .select("scheduled_time, duration_minutes")
    .eq("assigned_to", agentCall.user_id)
    .gte("scheduled_time", startOfDay)
    .lte("scheduled_time", endOfDay)
    .eq("status", "scheduled");

  const bookedTimes = (appointments || []).map((a: any) => {
    const time = new Date(a.scheduled_time);
    return `${time.getHours()}:${String(time.getMinutes()).padStart(2, "0")}`;
  });

  // Suggest available 1-hour slots between 9am-5pm
  const availableSlots: string[] = [];
  for (let hour = 9; hour < 17; hour++) {
    const slot = `${hour}:00`;
    if (!bookedTimes.includes(slot)) {
      availableSlots.push(slot);
    }
  }

  return {
    date,
    available_slots: availableSlots,
    booked_count: bookedTimes.length,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────

function extractSentiment(summary: string): string {
  const lower = (summary || "").toLowerCase();
  if (lower.includes("interested") || lower.includes("motivated") || lower.includes("eager") || lower.includes("ready to sell")) {
    return "positive";
  }
  if (lower.includes("not interested") || lower.includes("hostile") || lower.includes("angry") || lower.includes("do not call")) {
    return "negative";
  }
  return "neutral";
}

function extractMotivation(summary: string): string {
  const lower = (summary || "").toLowerCase();
  if (lower.includes("urgent") || lower.includes("asap") || lower.includes("foreclosure") || lower.includes("must sell")) {
    return "high";
  }
  if (lower.includes("thinking about") || lower.includes("considering") || lower.includes("maybe")) {
    return "medium";
  }
  return "low";
}

function mapEndedReasonToOutcome(reason: string): string {
  switch (reason) {
    case "assistant-error":
    case "server-error":
      return "error";
    case "customer-ended-call":
    case "assistant-ended-call":
      return "completed";
    case "voicemail":
      return "voicemail";
    case "no-answer":
    case "busy":
      return "no_answer";
    case "customer-did-not-give-microphone-permission":
      return "no_answer";
    default:
      return "completed";
  }
}
