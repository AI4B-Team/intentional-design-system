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
    const { property } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert real estate analyst providing comprehensive property intelligence. Analyze the property details and return a detailed JSON response with the following structure:

{
  "dealScore": number (0-100),
  "insights": ["insight1", "insight2", "insight3", "insight4", "insight5"],
  "estimatedRepairCost": number,
  "marketAnalysis": "Brief market analysis paragraph",
  "analyzedAt": "ISO timestamp",
  "metrics": {
    "arvConfidence": number (0-100),
    "marketTrend": "appreciating" | "stable" | "declining",
    "investmentGrade": "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F",
    "estimatedROI": number (percentage),
    "comparableSales": [
      { "address": "string", "price": number, "daysAgo": number, "distance": number }
    ],
    "repairBreakdown": [
      { "category": "string", "estimate": number, "priority": "high" | "medium" | "low" }
    ]
  }
}

Consider:
- Property condition and type
- Location and neighborhood factors
- Market conditions and trends
- Repair needs based on condition
- Comparable sales in the area
- Investment potential and ROI

Generate realistic comparable sales nearby. Be thorough but realistic. Always return valid JSON only.`;

    const userPrompt = `Analyze this property for investment potential:

Address: ${property.address?.street || 'Unknown'}, ${property.address?.city || ''}, ${property.address?.state || ''} ${property.address?.zipCode || ''}

Property Details:
- Type: ${property.propertyType || 'Unknown'}
- Condition: ${property.condition || 'Unknown'}
- Bedrooms: ${property.propertyDetails?.bedrooms || 'Unknown'}
- Bathrooms: ${property.propertyDetails?.bathrooms || 'Unknown'}
- Square Feet: ${property.propertyDetails?.squareFeet || 'Unknown'}
- Year Built: ${property.propertyDetails?.yearBuilt || 'Unknown'}
- Lot Size: ${property.propertyDetails?.lotSize || 'Unknown'}

Valuation:
- Estimated Value: ${property.estimatedValue ? '$' + property.estimatedValue : 'Not provided'}
- Estimated ARV: ${property.estimatedARV ? '$' + property.estimatedARV : 'Not provided'}
- Estimated Repairs: ${property.estimatedRepairCost ? '$' + property.estimatedRepairCost : 'Not provided'}

Owner Information:
- Motivation Level: ${property.ownerInfo?.motivationLevel || 'Unknown'}
- Motivation Reason: ${property.ownerInfo?.motivationReason || 'None provided'}

Scout Notes: ${property.scoutNotes || 'None'}
Condition Notes: ${property.conditionNotes || 'None'}`;

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
    
    // Ensure analyzedAt is set
    analysisResult.analyzedAt = analysisResult.analyzedAt || new Date().toISOString();

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Property intelligence error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
