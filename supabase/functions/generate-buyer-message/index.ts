import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  buyerName: string;
  buyerType: "flipper" | "landlord";
  propertyAddress: string;
  messageType: "email" | "sms";
  dealDetails?: {
    price?: number;
    arv?: number;
    profit?: number;
    capRate?: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { buyerName, buyerType, propertyAddress, messageType, dealDetails }: RequestBody = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const buyerContext = buyerType === "flipper" 
      ? "fix-and-flip investor looking for rehab opportunities"
      : "buy-and-hold investor seeking rental properties";

    const dealContext = dealDetails 
      ? `Price: $${dealDetails.price?.toLocaleString() || 'N/A'}, ARV: $${dealDetails.arv?.toLocaleString() || 'N/A'}, Potential Profit: $${dealDetails.profit?.toLocaleString() || 'N/A'}${dealDetails.capRate ? `, Cap Rate: ${dealDetails.capRate.toFixed(1)}%` : ''}`
      : "";

    const systemPrompt = messageType === "email"
      ? `You are a real estate wholesaler's assistant. Generate 3 professional email templates for reaching out to a cash buyer about a deal. 
         Each template should have a different tone: 1) Urgent/Time-sensitive, 2) Professional/Formal, 3) Friendly/Casual.
         Keep emails concise (under 150 words each). Include a subject line for each.
         Format as JSON array: [{"subject": "...", "body": "...", "tone": "..."}]`
      : `You are a real estate wholesaler's assistant. Generate 3 short SMS templates for reaching out to a cash buyer about a deal.
         Each template should have a different tone: 1) Urgent/Time-sensitive, 2) Professional/Formal, 3) Friendly/Casual.
         Keep SMS under 160 characters each.
         Format as JSON array: [{"message": "...", "tone": "..."}]`;

    const userPrompt = `Generate ${messageType} templates for contacting:
Buyer: ${buyerName} (${buyerContext})
Property: ${propertyAddress}
${dealContext ? `Deal Info: ${dealContext}` : ""}

Make templates personalized and compelling. Focus on the opportunity.`;

    console.log("Generating message templates for:", { buyerName, buyerType, messageType, propertyAddress });

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON from the response
    let templates;
    try {
      // Extract JSON from the response (might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        templates = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return fallback templates
      templates = messageType === "email" 
        ? [
            { subject: `Hot Deal: ${propertyAddress}`, body: `Hi ${buyerName},\n\nI have a new deal that matches your criteria at ${propertyAddress}. Would you like details?\n\nBest regards`, tone: "Professional" },
            { subject: `Urgent: ${propertyAddress} - Act Fast`, body: `Hi ${buyerName},\n\nThis won't last! ${propertyAddress} just hit my desk. Call me ASAP.\n\nThanks`, tone: "Urgent" },
            { subject: `New Opportunity: ${propertyAddress}`, body: `Hey ${buyerName}!\n\nGot something you might like at ${propertyAddress}. Let me know if you want to take a look!\n\nCheers`, tone: "Friendly" },
          ]
        : [
            { message: `Hi ${buyerName}, new deal at ${propertyAddress}. Interested?`, tone: "Professional" },
            { message: `${buyerName}! Hot deal just came in - ${propertyAddress}. Call me ASAP!`, tone: "Urgent" },
            { message: `Hey ${buyerName}! Check out ${propertyAddress} - right up your alley. LMK!`, tone: "Friendly" },
          ];
    }

    console.log("Generated templates:", templates);

    return new Response(JSON.stringify({ templates, messageType }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating message templates:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
