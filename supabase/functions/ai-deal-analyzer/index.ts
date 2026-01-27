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
    const { dealData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert real estate investment analyst. Analyze the deal details provided and return a JSON response with the following structure:
{
  "verdict": "strong" | "moderate" | "weak" | "pass",
  "score": number (0-100),
  "summary": "Brief 2-3 sentence analysis summary",
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2", "con3"],
  "recommendation": "Detailed recommendation paragraph",
  "estimatedProfit": "$XX,XXX" or range,
  "riskLevel": "Low" | "Medium" | "High"
}

Consider these factors:
- MAO (Maximum Allowable Offer) for wholesale = ARV × 0.7 - Repairs
- Typical wholesale fee is $5,000-$15,000
- Fix & Flip: ARV × 0.7 - Repairs - Holding Costs
- Rental: Cap rate, cash flow, and cash-on-cash return
- Market conditions and property type

Be realistic and conservative in your estimates. Always return valid JSON only.`;

    const userPrompt = `Analyze this real estate deal:
- Address: ${dealData.address}
- Asking Price: $${dealData.askingPrice}
- ARV: ${dealData.arv ? '$' + dealData.arv : 'Not provided'}
- Repair Estimate: ${dealData.repairEstimate ? '$' + dealData.repairEstimate : 'Not provided'}
- Property Type: ${dealData.propertyType}
- Exit Strategy: ${dealData.exitStrategy}
- Notes: ${dealData.notes || 'None'}`;

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
    console.error("Deal analyzer error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
