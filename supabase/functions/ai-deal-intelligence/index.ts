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
    const { address, asIsValue, arv, mortgageBalance, repairEstimate, propertyType, beds, baths, sqft, yearBuilt, ownerName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert real estate investment analyst specializing in creative financing. Analyze the property and return a JSON response with this EXACT structure:

{
  "propertyProfile": {
    "estimatedValue": number,
    "beds": number,
    "baths": number,
    "sqft": number,
    "yearBuilt": number,
    "propertyType": "string",
    "neighborhood": "string description",
    "marketTrend": "appreciating" | "stable" | "declining"
  },
  "arvAnalysis": {
    "arvEstimate": number,
    "confidence": number (0-100),
    "pricePerSqft": number,
    "comps": [
      {
        "address": "string",
        "salePrice": number,
        "saleDate": "YYYY-MM-DD",
        "sqft": number,
        "beds": number,
        "baths": number,
        "distanceMiles": number,
        "similarity": number (0-100)
      }
    ]
  },
  "mortgageEstimate": {
    "estimatedBalance": number,
    "estimatedPayment": number,
    "estimatedRate": number,
    "loanType": "string"
  },
  "strategies": [
    {
      "name": "Novation" | "Subject-To" | "Hybrid" | "Seller Finance" | "Wholesale" | "Fix & Flip",
      "score": number (0-100),
      "projectedProfit": number,
      "offerPrice": number,
      "closeTimeline": "string (e.g. 14-21 days)",
      "riskLevel": "Low" | "Medium" | "High",
      "monthlyPayment": number or null,
      "cashNeeded": number,
      "whyItWorks": "string paragraph explaining why this strategy works for this deal",
      "dealNumbers": {
        "purchasePrice": number,
        "repairCosts": number,
        "holdingCosts": number,
        "sellingCosts": number,
        "totalInvestment": number,
        "exitPrice": number,
        "netProfit": number
      },
      "sellerPitch": "string - A ready-to-use pitch script for the seller with real dollar amounts. Write it conversationally as if speaking to the homeowner. Include specific numbers from the deal."
    }
  ],
  "overallVerdict": "strong" | "moderate" | "weak" | "pass",
  "overallScore": number (0-100),
  "summary": "Brief 2-3 sentence summary of the deal opportunity"
}

Strategy definitions:
- **Novation**: Get equitable interest, list on MLS, sell retail. Offer = As-Is value (no repairs). Profit = ARV - As-Is - closing costs.
- **Subject-To**: Take over existing mortgage payments. Offer = mortgage balance + small amount to seller. Profit from cash flow or resale.
- **Hybrid**: Combine novation front-end with subject-to back-end. Flexible structure.
- **Seller Finance**: Seller carries the note. Lower down payment, negotiate terms.
- **Wholesale**: Assign contract to cash buyer. MAO = ARV × 0.7 - Repairs - Assignment Fee.
- **Fix & Flip**: Buy, rehab, sell retail. Profit = ARV - Purchase - Repairs - Holding - Selling costs.

Generate 5-6 realistic comparable sales near the address. Be conservative with estimates. Always return valid JSON only.`;

    const userPrompt = `Analyze this property for all 6 creative financing exit strategies:
- Address: ${address}
- As-Is Value: ${asIsValue ? '$' + asIsValue.toLocaleString() : 'Estimate based on comps'}
- ARV: ${arv ? '$' + arv.toLocaleString() : 'Calculate from comps'}
- Mortgage Balance: ${mortgageBalance ? '$' + mortgageBalance.toLocaleString() : 'Estimate from public records'}
- Repair Estimate: ${repairEstimate ? '$' + repairEstimate.toLocaleString() : 'Estimate based on age/condition'}
- Property Type: ${propertyType || 'Single Family'}
- Beds: ${beds || 'Unknown'}
- Baths: ${baths || 'Unknown'}
- SqFt: ${sqft || 'Unknown'}
- Year Built: ${yearBuilt || 'Unknown'}
- Owner: ${ownerName || 'Unknown'}

Return the complete analysis JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response");
    }

    const analysisResult = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Deal intelligence error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
