import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const {
      property_address,
      arv,
      our_offer,
      seller_counter,
      walk_away_price,
      repair_estimate,
      comps,
      lead_type,
      distress_signals,
      motivation_score,
      mortgage_balance,
    } = await req.json();

    if (!property_address || !arv || !our_offer || !seller_counter) {
      return new Response(
        JSON.stringify({ error: "property_address, arv, our_offer, and seller_counter are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert real estate investor negotiation strategist. You analyze counter-offers and provide actionable recommendations. You speak in direct, confident language. You always think about profit margins, risk, and creative deal structures.

Rules:
- Be direct and data-driven
- Always calculate profit at each price point
- Suggest creative terms when cash price doesn't work
- Factor in distress signals and motivation level
- Never recommend accepting above the walk-away price`;

    const prompt = `Analyze this real estate negotiation:

Property: ${property_address}
ARV (After Repair Value): $${arv?.toLocaleString()}
Repair Estimate: $${(repair_estimate || 0).toLocaleString()}
Our Initial Offer: $${our_offer?.toLocaleString()}
Seller's Counter: $${seller_counter?.toLocaleString()}
Walk-Away Price (max): $${(walk_away_price || Math.round(arv * 0.85 - (repair_estimate || 0))).toLocaleString()}
${mortgage_balance ? `Mortgage Balance: $${mortgage_balance.toLocaleString()}` : ""}
${lead_type ? `Lead Type: ${lead_type}` : ""}
${distress_signals?.length ? `Distress Signals: ${distress_signals.join(", ")}` : ""}
${motivation_score ? `Motivation Score: ${motivation_score}/1000` : ""}
${comps ? `Recent Comps: ${JSON.stringify(comps)}` : ""}

Respond with a JSON object (no markdown, just raw JSON):
{
  "recommendation": "accept" | "counter" | "decline",
  "counter_amount": number or null,
  "reasoning": "2-3 sentence explanation",
  "talking_points": ["point1", "point2", "point3"],
  "draft_sms": "A ready-to-send SMS response to the seller (under 160 chars)",
  "draft_response": "Full draft email/verbal response to seller",
  "risk_level": "low" | "medium" | "high",
  "profit_at_counter": number,
  "creative_terms": "Alternative deal structure suggestion if cash doesn't work" or null,
  "next_steps": ["step1", "step2", "step3"]
}`;

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
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || "";

    // Parse JSON from response (strip markdown fences if present)
    let analysis;
    try {
      const jsonStr = raw.replace(/^```json?\s*/, "").replace(/\s*```$/, "");
      analysis = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response as JSON:", raw);
      // Return a structured fallback
      analysis = {
        recommendation: "counter",
        counter_amount: null,
        reasoning: raw,
        talking_points: [],
        draft_sms: null,
        draft_response: null,
        risk_level: "medium",
        profit_at_counter: null,
        creative_terms: null,
        next_steps: [],
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-negotiation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
