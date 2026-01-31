import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NotificationContext {
  type: string;
  title: string;
  message: string;
  metadata?: {
    propertyAddress?: string;
    contactName?: string;
    amount?: number;
    stage?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { notification } = await req.json() as { notification: NotificationContext };
    
    console.log('Generating AI suggestions for notification:', notification.type);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware prompt based on notification type
    const systemPrompt = `You are an expert real estate investment advisor helping investors win deals. 
You provide concise, actionable suggestions to help close deals faster and negotiate better terms.
Always be specific, mention concrete numbers when relevant, and focus on winning strategies.
Keep each suggestion under 100 characters for display purposes.`;

    const userPrompt = buildPromptForNotification(notification);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_suggestions",
              description: "Return 3-4 actionable suggestions to help win this deal",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { 
                          type: "string",
                          description: "Short actionable suggestion (max 100 chars)"
                        },
                        type: { 
                          type: "string", 
                          enum: ["response", "offer", "action", "tactic"],
                          description: "Type of suggestion"
                        },
                        priority: {
                          type: "string",
                          enum: ["high", "medium", "low"],
                          description: "Priority level"
                        }
                      },
                      required: ["text", "type", "priority"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_suggestions" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          suggestions: getDefaultSuggestions(notification.type)
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ 
          error: "AI credits exhausted.",
          suggestions: getDefaultSuggestions(notification.type)
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ 
        error: "Failed to generate suggestions",
        suggestions: getDefaultSuggestions(notification.type)
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("AI response received:", JSON.stringify(data, null, 2));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      console.log("Suggestions generated:", result.suggestions);
      return new Response(JSON.stringify({ suggestions: result.suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback to default suggestions
    console.log("No tool call found, using defaults");
    return new Response(JSON.stringify({ 
      suggestions: getDefaultSuggestions(notification.type)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-deal-suggestions:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      suggestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildPromptForNotification(notification: NotificationContext): string {
  const { type, title, message, metadata } = notification;
  
  let context = `Notification: "${title}"\nDetails: ${message}\n`;
  
  if (metadata?.propertyAddress) {
    context += `Property: ${metadata.propertyAddress}\n`;
  }
  if (metadata?.contactName) {
    context += `Contact: ${metadata.contactName}\n`;
  }
  if (metadata?.amount) {
    context += `Amount: $${metadata.amount.toLocaleString()}\n`;
  }

  const typeSpecificInstructions: Record<string, string> = {
    lead_hot: "This is a HOT lead with high motivation. Suggest quick response tactics, urgency-based messaging, and ways to stand out from competitors.",
    lead_new: "This is a new lead. Suggest initial outreach strategies, qualifying questions, and rapport-building techniques.",
    lead_response: "The lead responded! Suggest follow-up strategies, next steps, and ways to move toward a deal.",
    offer_received: "An offer was received on a deal. Suggest counter-offer strategies, negotiation tactics, and response timing.",
    offer_accepted: "The offer was accepted! Suggest closing steps, due diligence actions, and timeline management.",
    offer_rejected: "The offer was rejected. Suggest re-engagement strategies, alternative terms, and relationship preservation.",
    offer_counter: "A counter-offer was received. Suggest negotiation responses, leverage points, and compromise strategies.",
    call_missed: "A call was missed. Suggest callback timing, voicemail scripts, and alternative contact methods.",
    sms_received: "An SMS was received. Suggest text response templates, tone matching, and call-to-action phrases.",
    appointment: "An appointment is scheduled. Suggest preparation steps, talking points, and closing strategies.",
    buyer_interest: "A buyer showed interest. Suggest buyer qualification questions, matching strategies, and deal presentation tips.",
    price_drop: "A price drop occurred. Suggest timing strategies, offer positioning, and urgency messaging.",
    task_due: "A task is due. Suggest prioritization, delegation options, and follow-up sequences.",
    deal_stage: "A deal moved stages. Suggest next actions, stakeholder communication, and timeline management.",
    document_signed: "A document was signed. Suggest next steps, celebration messaging, and closing timeline.",
  };

  const instruction = typeSpecificInstructions[type] || 
    "Suggest actionable next steps to move this opportunity forward and increase chances of closing the deal.";

  return `${context}\nNotification Type: ${type}\n\n${instruction}\n\nProvide 3-4 specific, actionable suggestions. Each should be concise (under 100 characters) and immediately useful.`;
}

function getDefaultSuggestions(type: string): Array<{text: string; type: string; priority: string}> {
  const defaults: Record<string, Array<{text: string; type: string; priority: string}>> = {
    lead_hot: [
      { text: "Call back within 5 minutes to maximize engagement", type: "action", priority: "high" },
      { text: "Prepare a compelling opening: 'I see you're motivated to sell...'", type: "response", priority: "high" },
      { text: "Have cash offer ready to present immediately", type: "offer", priority: "medium" },
    ],
    offer_received: [
      { text: "Review offer terms against your buy box criteria", type: "action", priority: "high" },
      { text: "Counter 5-10% above if within ARV range", type: "offer", priority: "medium" },
      { text: "Respond within 2 hours to show serious interest", type: "tactic", priority: "high" },
    ],
    call_missed: [
      { text: "Call back within 30 minutes", type: "action", priority: "high" },
      { text: "Send quick text: 'Sorry I missed you, calling back shortly'", type: "response", priority: "high" },
      { text: "Try alternate contact method if no response", type: "action", priority: "medium" },
    ],
    sms_received: [
      { text: "Reply within 15 minutes to maintain momentum", type: "action", priority: "high" },
      { text: "Ask a qualifying question to keep conversation going", type: "response", priority: "medium" },
      { text: "Suggest a quick call to discuss details", type: "tactic", priority: "medium" },
    ],
  };

  return defaults[type] || [
    { text: "Follow up within 24 hours", type: "action", priority: "medium" },
    { text: "Review property details and prepare talking points", type: "action", priority: "medium" },
    { text: "Document this interaction in your CRM", type: "action", priority: "low" },
  ];
}
