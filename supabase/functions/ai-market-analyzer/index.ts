import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { marketData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert real estate market analyst. Analyze the market for the location provided and return a JSON response with the following structure:
{
  "marketScore": number (0-100, higher = better for investors),
  "trend": "hot" | "warm" | "neutral" | "cooling" | "cold",
  "summary": "2-3 sentence market summary",
  "medianPrice": "$XXX,XXX",
  "priceChange": "+X.X%" or "-X.X%",
  "daysOnMarket": number,
  "inventory": "X,XXX" (active listings estimate),
  "demandLevel": "Very High" | "High" | "Moderate" | "Low" | "Very Low",
  "investorActivity": "Description of investor presence and competition",
  "topStrategies": ["strategy1", "strategy2", "strategy3"],
  "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "risks": ["risk1", "risk2", "risk3"],
  "forecast": "12-month market forecast paragraph"
}

Provide realistic estimates based on typical market conditions for the area type. Consider:
- Urban vs suburban vs rural characteristics
- Regional economic factors
- Population and job growth trends
- Typical investor strategies that work in similar markets

Always return valid JSON only.`;

    const userPrompt = `Analyze the real estate investment market for:
- Location: ${marketData.location}
- Search Radius: ${marketData.radius} miles
- Property Type Focus: ${marketData.propertyType}

Provide comprehensive market analysis for real estate investors.`;

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
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response");
    }

    const analysisResult = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Market analyzer error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
