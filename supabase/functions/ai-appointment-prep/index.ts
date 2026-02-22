import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointment } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert real estate appointment coach. Generate a concise prep brief for an upcoming property appointment. Return valid JSON only with this structure:

{
  "summary": "One-sentence overview of what this appointment is about",
  "talkingPoints": ["point1", "point2", "point3", "point4"],
  "questionsToAsk": ["question1", "question2", "question3"],
  "redFlags": ["flag1", "flag2"],
  "negotiationTips": ["tip1", "tip2"],
  "estimatedDuration": "30 mins",
  "confidence": "high" | "medium" | "low"
}

Be practical, specific, and actionable. Tailor advice to the appointment type and property details. Always return valid JSON only.`;

    const userPrompt = `Prepare me for this appointment:

Type: ${appointment.type || "Walkthrough"}
Property: ${appointment.address || "Unknown address"}
Contact: ${appointment.contactName || "Unknown"}
Notes: ${appointment.notes || "None"}
Property Type: ${appointment.propertyType || "Unknown"}
Estimated Value: ${appointment.estimatedValue ? "$" + appointment.estimatedValue : "Unknown"}
Condition: ${appointment.condition || "Unknown"}
Days on Market: ${appointment.daysOnMarket || "Unknown"}
Last Contact: ${appointment.lastContactDays ? appointment.lastContactDays + " days ago" : "Unknown"}`;

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

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response");
    }

    const prepBrief = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(prepBrief), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Appointment prep error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Prep generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
