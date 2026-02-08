import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OfferInsightRequest {
  step: "package" | "pricing" | "delivery" | "preview" | "review";
  context: {
    propertyAddress?: string;
    arv?: number;
    askingPrice?: number;
    offerAmount?: number;
    offerPercentage?: number;
    flipperProfit?: number;
    wholesalerProfit?: number;
    selectedTemplate?: string;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { step, context } = await req.json() as OfferInsightRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert real estate investment advisor specializing in wholesaling and fix-and-flip deals. Provide brief, actionable insights (2-3 sentences max) based on the current step of the offer process. Be specific with numbers when available. Focus on maximizing profit and reducing risk.`;

    let userPrompt = "";
    
    switch (step) {
      case "package":
        userPrompt = `The investor is selecting an offer package type. They're considering: ${context.selectedTemplate || "Cash Offer"}. 
Property: ${context.propertyAddress}
ARV: $${context.arv?.toLocaleString()}
Asking: $${context.askingPrice?.toLocaleString()}

Give a quick tip about which offer type works best for this deal based on the numbers.`;
        break;
        
      case "pricing":
        userPrompt = `The investor is setting their offer price.
Property: ${context.propertyAddress}
ARV: $${context.arv?.toLocaleString()}
Offer: $${context.offerAmount?.toLocaleString()} (${context.offerPercentage}% of ARV)
Flipper Profit: $${context.flipperProfit?.toLocaleString()}
Wholesaler Spread: $${context.wholesalerProfit?.toLocaleString()}

Analyze if this offer percentage is competitive and profitable. Suggest if they should adjust.`;
        break;
        
      case "delivery":
        userPrompt = `The investor is configuring how to deliver their offer.
Email enabled: ${context.emailEnabled ? "Yes" : "No"}
SMS enabled: ${context.smsEnabled ? "Yes" : "No"}
Offer amount: $${context.offerAmount?.toLocaleString()}

Give a quick tip about the best delivery strategy for getting a response.`;
        break;
        
      case "preview":
        userPrompt = `The investor is previewing their offer before sending.
Property: ${context.propertyAddress}
Offer: $${context.offerAmount?.toLocaleString()} (${context.offerPercentage}% of ARV)
Template: ${context.selectedTemplate}

Give a final check tip - what should they verify before sending?`;
        break;
        
      case "review":
        userPrompt = `The investor is about to submit their offer.
Property: ${context.propertyAddress}
ARV: $${context.arv?.toLocaleString()}
Final Offer: $${context.offerAmount?.toLocaleString()} (${context.offerPercentage}% of ARV)
Flipper Profit: $${context.flipperProfit?.toLocaleString()}
Wholesaler Spread: $${context.wholesalerProfit?.toLocaleString()}

Give a brief final assessment and confidence level for this deal.`;
        break;
    }

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
        max_tokens: 150,
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || "Unable to generate insight.";

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating offer insight:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
