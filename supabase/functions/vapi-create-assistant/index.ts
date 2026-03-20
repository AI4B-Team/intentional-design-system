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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    const { data: { user } } = await supabase.auth.getUser(authHeader?.replace("Bearer ", "") || "");
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { agent_name, agent_voice, agent_prompt, first_message, transfer_phone_number } = await req.json();

    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/vapi-webhook`;

    // Build the Vapi assistant configuration
    const assistantConfig: any = {
      name: agent_name || "AIVA Acquisition Agent",
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: agent_prompt || getDefaultPrompt(),
          },
        ],
        tools: getToolDefinitions(),
      },
      voice: {
        provider: "11labs",
        voiceId: mapVoiceToId(agent_voice || "jennifer"),
      },
      firstMessage: first_message || "Hi, this is AIVA. I'm calling about your property. Do you have a moment to chat?",
      serverUrl: webhookUrl,
      endCallFunctionEnabled: true,
      recordingEnabled: true,
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 600, // 10 min max
      backgroundSound: "off",
      hipaaEnabled: false,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en",
      },
    };

    // If transfer is configured, add transfer tool
    if (transfer_phone_number) {
      assistantConfig.model.tools.push({
        type: "transferCall",
        destinations: [
          {
            type: "number",
            number: transfer_phone_number,
            message: "I'm going to connect you with one of our acquisition specialists who can help you further. One moment please.",
          },
        ],
        function: {
          name: "transfer_call",
          description: "Transfer the call to a live agent when the lead is highly motivated, wants to discuss specific offer terms, or explicitly asks to speak with a person.",
        },
      });
    }

    // Create assistant in Vapi
    const vapiResponse = await fetch("https://api.vapi.ai/assistant", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assistantConfig),
    });

    const vapiData = await vapiResponse.json();

    if (!vapiResponse.ok) {
      console.error("Vapi assistant creation failed:", vapiData);
      return new Response(JSON.stringify({ error: "Failed to create AI assistant", details: vapiData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        assistant_id: vapiData.id,
        name: vapiData.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Create assistant error:", error);
    return new Response(JSON.stringify({ error: "Failed to create assistant" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getDefaultPrompt(): string {
  return `You are AIVA, an AI acquisition specialist for a real estate investment company. Your job is to have natural, empathetic conversations with property owners to understand their situation and determine if they're interested in selling.

## Your Personality
- Warm, professional, and empathetic
- You listen more than you talk
- You never pressure anyone
- You're knowledgeable about real estate but explain things simply

## Conversation Flow
1. **Introduction**: Greet them warmly, introduce yourself, and explain why you're calling
2. **Discovery**: Ask about their property situation, timeline, and motivation
3. **Qualification**: Determine their level of interest and urgency
4. **Next Steps**: Based on their interest level:
   - HIGH motivation: Offer to schedule an appointment or transfer to a live specialist
   - MEDIUM motivation: Schedule a follow-up call, create a task
   - LOW motivation: Thank them politely, update CRM, and end the call

## Key Questions to Ask
- "Are you considering selling your property?"
- "What's your timeline looking like?"
- "What would be most important to you in a sale?"
- "Have you had any offers or talked to other buyers?"
- "Is there anything about the property that needs attention?"

## Rules
- NEVER make specific dollar offers — only a human specialist can do that
- If they mention a price, acknowledge it and say you'll have your team review it
- If they ask who you work with, say you're with a local real estate investment group
- If they say "Do Not Call" or express strong disinterest, immediately apologize and end the call
- Always be honest that you're an AI assistant if directly asked
- Use the tools available to you: update_crm, create_task, schedule_appointment, lookup_property, check_availability
- Transfer to a live agent when the lead is hot and ready to discuss terms

## Tool Usage
- Use \`lookup_property\` early to get context about their property
- Use \`update_crm\` to log important information as you learn it
- Use \`schedule_appointment\` when they agree to meet
- Use \`create_task\` for follow-ups
- Use \`transfer_call\` for hot leads ready to talk numbers`;
}

function getToolDefinitions(): any[] {
  return [
    {
      type: "function",
      function: {
        name: "update_crm",
        description: "Update the CRM with information learned during the conversation. Call this when you learn important details about the lead's situation.",
        parameters: {
          type: "object",
          properties: {
            property_address: { type: "string", description: "The property address if mentioned" },
            status: { type: "string", description: "Lead status: new, contacted, follow_up, appointment, negotiating", enum: ["new", "contacted", "follow_up", "appointment", "negotiating"] },
            notes: { type: "string", description: "Key information from the conversation" },
            lead_score: { type: "number", description: "Score from 1-100 based on motivation and readiness" },
            motivation: { type: "string", description: "Seller motivation level", enum: ["low", "medium", "high"] },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "create_task",
        description: "Create a follow-up task for the team. Use when scheduling callbacks or noting action items.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Task title" },
            description: { type: "string", description: "Detailed description of what needs to be done" },
            priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
            due_in_days: { type: "number", description: "Number of days until the task is due" },
          },
          required: ["title"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "schedule_appointment",
        description: "Schedule an appointment to visit the property or meet with the seller.",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "Date in YYYY-MM-DD format" },
            time: { type: "string", description: "Time in HH:MM format (24h)" },
            appointment_type: { type: "string", enum: ["property_visit", "phone_call", "virtual_meeting"] },
            notes: { type: "string", description: "Any notes about the appointment" },
          },
          required: ["date", "time"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "lookup_property",
        description: "Look up property information in our database. Use at the start of the call to get context.",
        parameters: {
          type: "object",
          properties: {
            address: { type: "string", description: "Property address to search" },
            phone_number: { type: "string", description: "Phone number to search by" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "check_availability",
        description: "Check available appointment slots for a given date.",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "Date in YYYY-MM-DD format" },
          },
          required: ["date"],
        },
      },
    },
  ];
}

function mapVoiceToId(voice: string): string {
  const voiceMap: Record<string, string> = {
    jennifer: "EXAVITQu4vr4xnSDxMaL", // Sarah on ElevenLabs
    sarah: "EXAVITQu4vr4xnSDxMaL",
    jessica: "cgSgspJ2msm6clMCkdW9",
    laura: "FGY2WhTYpPnrIDTdsKH5",
    chris: "iP95p4xoKVk53GoZ742B",
    brian: "nPczCjzI2devNBz1zQrb",
    daniel: "onwK4e9ZLuTAKqWW03F9",
    roger: "CwhRBWXzGAHq8TQ4Fs17",
  };
  return voiceMap[voice.toLowerCase()] || voiceMap.jennifer;
}
